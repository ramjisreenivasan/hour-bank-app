import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AdminService, AdminStats, UserWithStats } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <div class="admin-header">
        <h1>
          <i class="fas fa-shield-alt"></i>
          Admin Dashboard
        </h1>
        <div class="admin-actions">
          <button class="btn btn-info" routerLink="/admin/simulation">
            <i class="fas fa-chart-line"></i>
            Simulation Data
          </button>
          <button class="btn btn-secondary" (click)="refreshData()">
            <i class="fas fa-sync-alt" [class.spinning]="loading"></i>
            Refresh
          </button>
          <button class="btn btn-primary" routerLink="/dashboard">
            <i class="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading admin data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Data</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="refreshData()">Try Again</button>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading && !error" class="dashboard-content">
        
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats?.totalUsers || 0 }}</h3>
              <p>Total Users</p>
              <small>{{ stats?.recentSignups || 0 }} new this month</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats?.activeUsers || 0 }}</h3>
              <p>Active Users</p>
              <small>{{ getActivePercentage() }}% of total</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-briefcase"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats?.totalServices || 0 }}</h3>
              <p>Total Services</p>
              <small>Available in marketplace</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats?.totalTransactions || 0 }}</h3>
              <p>Transactions</p>
              <small>All time</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <h3>{{ stats?.totalBankHours || 0 }}</h3>
              <p>Total Bank Hours</p>
              <small>In circulation</small>
            </div>
          </div>

          <div class="stat-card system-health" [class]="getHealthClass()">
            <div class="stat-icon">
              <i class="fas fa-heartbeat"></i>
            </div>
            <div class="stat-content">
              <h3>{{ systemHealth?.healthScore || 0 }}%</h3>
              <p>System Health</p>
              <small>{{ systemHealth?.status || 'Unknown' }}</small>
            </div>
          </div>
        </div>

        <!-- User Management Section -->
        <div class="section">
          <div class="section-header">
            <h2>
              <i class="fas fa-users-cog"></i>
              User Management
            </h2>
            <div class="section-actions">
              <input 
                type="text" 
                placeholder="Search users..." 
                [(ngModel)]="userSearchTerm"
                (input)="filterUsers()"
                class="search-input">
              <select [(ngModel)]="userStatusFilter" (change)="filterUsers()" class="filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th (click)="sortUsers('username')">
                    Username
                    <i class="fas fa-sort" [class]="getSortIcon('username')"></i>
                  </th>
                  <th (click)="sortUsers('email')">
                    Email
                    <i class="fas fa-sort" [class]="getSortIcon('email')"></i>
                  </th>
                  <th (click)="sortUsers('bankHours')">
                    Bank Hours
                    <i class="fas fa-sort" [class]="getSortIcon('bankHours')"></i>
                  </th>
                  <th (click)="sortUsers('servicesCount')">
                    Services
                    <i class="fas fa-sort" [class]="getSortIcon('servicesCount')"></i>
                  </th>
                  <th (click)="sortUsers('transactionsCount')">
                    Transactions
                    <i class="fas fa-sort" [class]="getSortIcon('transactionsCount')"></i>
                  </th>
                  <th (click)="sortUsers('status')">
                    Status
                    <i class="fas fa-sort" [class]="getSortIcon('status')"></i>
                  </th>
                  <th (click)="sortUsers('createdAt')">
                    Joined
                    <i class="fas fa-sort" [class]="getSortIcon('createdAt')"></i>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers" [class]="'status-' + user.status">
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ getUserInitials(user) }}
                      </div>
                      <div>
                        <strong>{{ user.username }}</strong>
                        <br>
                        <small>{{ user.firstName }} {{ user.lastName }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="bank-hours">{{ user.bankHours }}</span>
                  </td>
                  <td>
                    <span class="count-badge">{{ user.servicesCount }}</span>
                  </td>
                  <td>
                    <span class="count-badge">{{ user.transactionsCount }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="'status-' + user.status">
                      {{ user.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <span class="date">{{ formatDate(user.createdAt) }}</span>
                    <br>
                    <small *ngIf="user.lastActivity">
                      Last: {{ formatDate(user.lastActivity) }}
                    </small>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        class="btn btn-sm btn-info" 
                        (click)="viewUserDetails(user)"
                        title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-warning" 
                        (click)="editBankHours(user)"
                        title="Edit Bank Hours">
                        <i class="fas fa-coins"></i>
                      </button>
                      <button 
                        class="btn btn-sm" 
                        [class]="user.status === 'suspended' ? 'btn-success' : 'btn-danger'"
                        (click)="toggleUserStatus(user)"
                        [title]="user.status === 'suspended' ? 'Activate User' : 'Suspend User'">
                        <i class="fas" [class]="user.status === 'suspended' ? 'fa-user-check' : 'fa-user-times'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="filteredUsers.length === 0" class="no-results">
              <i class="fas fa-search"></i>
              <p>No users found matching your criteria.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div *ngIf="selectedUser" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>User Details: {{ selectedUser.username }}</h3>
          <button class="close-btn" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="user-details">
            <div class="detail-section">
              <h4>Basic Information</h4>
              <p><strong>Email:</strong> {{ selectedUser.email }}</p>
              <p><strong>Name:</strong> {{ selectedUser.firstName }} {{ selectedUser.lastName }}</p>
              <p><strong>Bank Hours:</strong> {{ selectedUser.bankHours }}</p>
              <p><strong>Rating:</strong> {{ selectedUser.rating }}/5</p>
              <p><strong>Status:</strong> {{ selectedUser.status | titlecase }}</p>
            </div>
            <div class="detail-section">
              <h4>Activity</h4>
              <p><strong>Services Offered:</strong> {{ selectedUser.servicesCount }}</p>
              <p><strong>Total Transactions:</strong> {{ selectedUser.transactionsCount }}</p>
              <p><strong>Joined:</strong> {{ formatDate(selectedUser.createdAt) }}</p>
              <p *ngIf="selectedUser.lastActivity"><strong>Last Activity:</strong> {{ formatDate(selectedUser.lastActivity) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bank Hours Edit Modal -->
    <div *ngIf="editingBankHours" class="modal-overlay" (click)="closeBankHoursModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit Bank Hours: {{ editingUser?.username }}</h3>
          <button class="close-btn" (click)="closeBankHoursModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="saveBankHours()">
            <div class="form-group">
              <label>Current Bank Hours: {{ editingUser?.bankHours }}</label>
              <input 
                type="number" 
                [(ngModel)]="newBankHours" 
                name="bankHours"
                min="0"
                step="0.5"
                class="form-control"
                required>
            </div>
            <div class="form-group">
              <label>Reason for Change:</label>
              <textarea 
                [(ngModel)]="bankHoursReason" 
                name="reason"
                class="form-control"
                rows="3"
                required
                placeholder="Enter reason for bank hours adjustment..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeBankHoursModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!newBankHours || !bankHoursReason">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error: string | null = null;
  
  stats: AdminStats | null = null;
  systemHealth: any = null;
  users: UserWithStats[] = [];
  filteredUsers: UserWithStats[] = [];
  
  // Filtering and sorting
  userSearchTerm = '';
  userStatusFilter = '';
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Modal states
  selectedUser: UserWithStats | null = null;
  editingBankHours = false;
  editingUser: UserWithStats | null = null;
  newBankHours: number = 0;
  bankHoursReason = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      stats: this.adminService.getAdminStats(),
      users: this.adminService.getAllUsersWithStats(),
      health: this.adminService.getSystemHealth()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.users = data.users;
        this.systemHealth = data.health;
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load admin data';
        this.loading = false;
        console.error('Admin data loading error:', error);
      }
    });
  }

  refreshData(): void {
    this.loadAdminData();
  }

  // Utility methods
  getActivePercentage(): number {
    if (!this.stats || this.stats.totalUsers === 0) return 0;
    return Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
  }

  getHealthClass(): string {
    if (!this.systemHealth) return '';
    return `health-${this.systemHealth.status}`;
  }

  getUserInitials(user: UserWithStats): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last) || user.username?.charAt(0)?.toUpperCase() || '?';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  // Filtering and sorting
  filterUsers(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.userSearchTerm) {
      const term = this.userSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.userStatusFilter) {
      filtered = filtered.filter(user => user.status === this.userStatusFilter);
    }

    this.filteredUsers = filtered;
    this.sortUsers(this.sortField);
  }

  sortUsers(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredUsers.sort((a, b) => {
      let aVal = (a as any)[field];
      let bVal = (b as any)[field];

      if (field === 'createdAt' || field === 'lastActivity') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // User actions
  viewUserDetails(user: UserWithStats): void {
    this.selectedUser = user;
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  editBankHours(user: UserWithStats): void {
    this.editingUser = user;
    this.newBankHours = user.bankHours;
    this.bankHoursReason = '';
    this.editingBankHours = true;
  }

  closeBankHoursModal(): void {
    this.editingBankHours = false;
    this.editingUser = null;
    this.newBankHours = 0;
    this.bankHoursReason = '';
  }

  saveBankHours(): void {
    if (!this.editingUser || !this.bankHoursReason) return;

    this.adminService.updateUserBankHours(
      this.editingUser.id,
      this.newBankHours,
      this.bankHoursReason
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedUser) => {
        // Update the user in our local array
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], bankHours: updatedUser.bankHours };
          this.filterUsers();
        }
        this.closeBankHoursModal();
      },
      error: (error) => {
        console.error('Failed to update bank hours:', error);
        alert('Failed to update bank hours: ' + error.message);
      }
    });
  }

  toggleUserStatus(user: UserWithStats): void {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const reason = prompt(`Please provide a reason for ${newStatus === 'suspended' ? 'suspending' : 'activating'} this user:`);
    
    if (!reason) return;

    this.adminService.updateUserStatus(user.id, newStatus, reason).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Update the user in our local array
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], status: newStatus };
          this.filterUsers();
        }
      },
      error: (error) => {
        console.error('Failed to update user status:', error);
        alert('Failed to update user status: ' + error.message);
      }
    });
  }
}
