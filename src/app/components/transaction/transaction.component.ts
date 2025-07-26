import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserGraphQLService } from '../../services/user-graphql.service';
import { TransactionGraphQLService } from '../../services/transaction-graphql.service';
import { TransactionService } from '../../services/transaction.service';
import { UserDisplayService } from '../../services/user-display.service';
import { User, Transaction, TransactionStatus } from '../../models/user.model';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnInit {
  currentUser: User | null = null;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  
  // Cache for users to avoid async issues in templates
  usersCache: Map<string, User> = new Map();
  
  // Expose enum to template
  TransactionStatus = TransactionStatus;
  
  // Filters
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL'; // ALL, PROVIDED, RECEIVED
  
  // Rating modal
  showRatingModal = false;
  selectedTransaction: Transaction | null = null;
  rating = 5;
  feedback = '';

  // Loading states
  completingTransactions: Set<string> = new Set();

  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: TransactionStatus.PENDING, label: 'Pending' },
    { value: TransactionStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TransactionStatus.COMPLETED, label: 'Completed' },
    { value: TransactionStatus.CANCELLED, label: 'Cancelled' }
  ];

  typeOptions = [
    { value: 'ALL', label: 'All Transactions' },
    { value: 'PROVIDED', label: 'Services Provided' },
    { value: 'RECEIVED', label: 'Services Received' }
  ];

  constructor(
    private authService: AuthService,
    private userGraphQLService: UserGraphQLService,
    private transactionGraphQLService: TransactionGraphQLService,
    private transactionService: TransactionService,
    private userDisplayService: UserDisplayService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  private async loadTransactions(): Promise<void> {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    try {
      const transactions = await this.transactionGraphQLService.getTransactions();
      this.transactions = transactions.filter(t => 
        t.providerId === this.currentUser?.id || t.consumerId === this.currentUser?.id
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Load users for transactions to populate cache
      const userIds = [
        ...this.transactions.map(t => t.providerId),
        ...this.transactions.map(t => t.consumerId)
      ];
      await this.loadUsersToCache([...new Set(userIds)]);
      
      this.applyFilters();
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
      this.filteredTransactions = [];
    }
  }

  private async loadUsersToCache(userIds: string[]): Promise<void> {
    const promises = userIds.map(async (userId) => {
      if (!this.usersCache.has(userId)) {
        const user = await this.userGraphQLService.getUserById(userId);
        if (user) {
          this.usersCache.set(userId, user);
        }
      }
    });
    
    await Promise.all(promises);
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      // Status filter
      if (this.statusFilter !== 'ALL' && transaction.status !== this.statusFilter) {
        return false;
      }

      // Type filter
      if (this.typeFilter === 'PROVIDED' && transaction.providerId !== this.currentUser?.id) {
        return false;
      }
      if (this.typeFilter === 'RECEIVED' && transaction.consumerId !== this.currentUser?.id) {
        return false;
      }

      return true;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  async updateTransactionStatus(transaction: Transaction, status: TransactionStatus): Promise<void> {
    // If marking as completed, use the new method with payment processing
    if (status === TransactionStatus.COMPLETED) {
      await this.completeTransactionWithPayment(transaction);
      return;
    }

    // For other status updates, use the original method
    try {
      await this.transactionGraphQLService.updateTransactionStatus(transaction.id, status);
      await this.loadTransactions();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      alert('Failed to update transaction status. Please try again.');
    }
  }

  /**
   * Complete transaction with automatic bank hours transfer
   * This method is called when the existing "Mark Complete" button is clicked
   */
  private async completeTransactionWithPayment(transaction: Transaction): Promise<void> {
    if (this.completingTransactions.has(transaction.id)) {
      return; // Already processing
    }

    this.completingTransactions.add(transaction.id);

    try {
      console.log(`Completing transaction ${transaction.id} with payment`);

      // Use the new transaction service method that handles payment
      this.transactionService.completeTransactionWithPayment(transaction.id).subscribe({
        next: (result) => {
          console.log('Transaction completed with payment:', result);
          
          // Show success message with payment details
          const paymentDetails = result.paymentResult.transactionDetails;
          if (paymentDetails) {
            alert(`Transaction completed successfully!\n\n` +
                  `Payment processed: ${paymentDetails.hours} bank hours transferred\n` +
                  `From: ${this.getUserFromCache(paymentDetails.requesterId)?.firstName || 'Requester'}\n` +
                  `To: ${this.getUserFromCache(paymentDetails.providerId)?.firstName || 'Provider'}`);
          } else {
            alert('Transaction completed successfully with payment!');
          }

          // Reload transactions to show updated status
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error completing transaction with payment:', error);
          
          // Show specific error message
          if (error.message.includes('Insufficient bank hours')) {
            alert('Payment failed: The service requester does not have sufficient bank hours to complete this transaction.');
          } else if (error.message.includes('not in progress')) {
            alert('This transaction cannot be completed. It may have already been completed or cancelled.');
          } else {
            alert(`Failed to complete transaction: ${error.message}`);
          }
        },
        complete: () => {
          this.completingTransactions.delete(transaction.id);
        }
      });

    } catch (error) {
      console.error('Error initiating transaction completion:', error);
      alert('Failed to complete transaction. Please try again.');
      this.completingTransactions.delete(transaction.id);
    }
  }

  canUpdateStatus(transaction: Transaction, status: TransactionStatus): boolean {
    if (!this.currentUser) return false;

    // Don't show button if transaction is currently being completed
    if (status === TransactionStatus.COMPLETED && this.completingTransactions.has(transaction.id)) {
      return false;
    }

    // Only provider can mark as in progress or completed
    if ((status === TransactionStatus.IN_PROGRESS || status === TransactionStatus.COMPLETED) 
        && transaction.providerId !== this.currentUser.id) {
      return false;
    }

    // Check current status transitions
    switch (transaction.status) {
      case TransactionStatus.PENDING:
        return status === TransactionStatus.IN_PROGRESS || status === TransactionStatus.CANCELLED;
      case TransactionStatus.IN_PROGRESS:
        return status === TransactionStatus.COMPLETED || status === TransactionStatus.CANCELLED;
      case TransactionStatus.COMPLETED:
      case TransactionStatus.CANCELLED:
        return false; // No transitions allowed from final states
      default:
        return false;
    }
  }

  openRatingModal(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.rating = 5;
    this.feedback = '';
    this.showRatingModal = true;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
    this.selectedTransaction = null;
    this.rating = 5;
    this.feedback = '';
  }

  async submitRating(): Promise<void> {
    if (!this.selectedTransaction) return;

    try {
      await this.transactionGraphQLService.addRatingAndFeedback(
        this.selectedTransaction.id,
        this.rating,
        this.feedback
      );

      this.closeRatingModal();
      await this.loadTransactions();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  }

  canRate(transaction: Transaction): boolean {
    return transaction.status === TransactionStatus.COMPLETED &&
           transaction.consumerId === this.currentUser?.id &&
           !transaction.rating;
  }

  // Template helper methods - synchronous for template use
  getUserFromCache(userId: string): User | null {
    return this.usersCache.get(userId) || null;
  }

  getServiceById(serviceId: string): any {
    return this.userGraphQLService.getServiceById(serviceId);
  }

  getTransactionTypeLabel(transaction: Transaction): string {
    if (!this.currentUser) return '';
    return transaction.providerId === this.currentUser.id ? 'Provided' : 'Received';
  }

  getOtherParty(transaction: Transaction): User | null {
    if (!this.currentUser) return null;
    
    const otherUserId = transaction.providerId === this.currentUser.id 
      ? transaction.consumerId 
      : transaction.providerId;
    
    return this.getUserFromCache(otherUserId);
  }

  getOtherPartyUsername(transaction: Transaction): string {
    const otherParty = this.getOtherParty(transaction);
    return this.userDisplayService.getUsername(otherParty);
  }

  getOtherPartyDisplayName(transaction: Transaction): string {
    const otherParty = this.getOtherParty(transaction);
    return this.userDisplayService.getDisplayName(otherParty);
  }

  getStatusClass(status: TransactionStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }
}
