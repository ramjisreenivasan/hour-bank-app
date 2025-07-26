import { generateClient } from 'aws-amplify/api';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import { errorLogger } from './error-logger';

export interface BankHoursTransferResult {
  success: boolean;
  error?: string;
  transactionDetails?: {
    requesterId: string;
    providerId: string;
    hours: number;
    transferredAt: string;
    requesterNewBalance: number;
    providerNewBalance: number;
  };
}

export class BankHoursTransferService {
  private client = generateClient();

  /**
   * Transfer bank hours from requester to provider
   * This function handles the atomic transfer of bank hours between users
   */
  async transferBankHours(
    requesterId: string,
    providerId: string,
    hours: number,
    transactionId: string
  ): Promise<BankHoursTransferResult> {
    try {
      console.log(`Starting bank hours transfer: ${hours} hours from ${requesterId} to ${providerId} for transaction ${transactionId}`);

      // 1. Get current balances for both users
      const [requesterResult, providerResult] = await Promise.all([
        this.client.graphql({
          query: queries.getUser,
          variables: { id: requesterId }
        }),
        this.client.graphql({
          query: queries.getUser,
          variables: { id: providerId }
        })
      ]);

      const requester = requesterResult.data?.getUser;
      const provider = providerResult.data?.getUser;

      if (!requester) {
        return {
          success: false,
          error: 'Requester not found'
        };
      }

      if (!provider) {
        return {
          success: false,
          error: 'Provider not found'
        };
      }

      // 2. Check if requester has sufficient balance
      if (requester.bankHours < hours) {
        errorLogger.logError({
          error: new Error('Insufficient bank hours balance'),
          context: {
            userId: requesterId,
            operation: 'transferBankHours',
            component: 'BankHoursTransferService',
            additionalData: {
              requiredHours: hours,
              availableHours: requester.bankHours,
              transactionId,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'medium',
          category: 'transaction'
        });

        return {
          success: false,
          error: `Insufficient bank hours balance. Required: ${hours}, Available: ${requester.bankHours}`
        };
      }

      // 3. Calculate new balances
      const requesterNewBalance = requester.bankHours - hours;
      const providerNewBalance = provider.bankHours + hours;
      const now = new Date().toISOString();

      // 4. Update both users' bank hours atomically
      // Note: Since GraphQL doesn't support transactions, we'll update sequentially
      // and implement rollback logic if the second update fails
      
      // Update requester (deduct hours)
      const requesterUpdateResult = await this.client.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: requesterId,
            bankHours: requesterNewBalance
          }
        }
      });

      if (!requesterUpdateResult.data?.updateUser) {
        throw new Error('Failed to update requester balance');
      }

      try {
        // Update provider (add hours)
        const providerUpdateResult = await this.client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: providerId,
              bankHours: providerNewBalance
            }
          }
        });

        if (!providerUpdateResult.data?.updateUser) {
          // Rollback requester update
          await this.rollbackRequesterUpdate(requesterId, requester.bankHours);
          throw new Error('Failed to update provider balance');
        }

        // 5. Log successful transfer
        console.log(`Bank hours transfer successful: ${hours} hours transferred from ${requesterId} to ${providerId}`);
        
        errorLogger.logError({
          error: new Error('Bank hours transfer completed successfully'),
          context: {
            operation: 'transferBankHours',
            component: 'BankHoursTransferService',
            additionalData: {
              transactionId,
              requesterId,
              providerId,
              hoursTransferred: hours,
              requesterOldBalance: requester.bankHours,
              requesterNewBalance,
              providerOldBalance: provider.bankHours,
              providerNewBalance,
              timestamp: now
            }
          },
          severity: 'low',
          category: 'transaction'
        });

        return {
          success: true,
          transactionDetails: {
            requesterId,
            providerId,
            hours,
            transferredAt: now,
            requesterNewBalance,
            providerNewBalance
          }
        };

      } catch (providerUpdateError) {
        // Rollback requester update
        await this.rollbackRequesterUpdate(requesterId, requester.bankHours);
        throw providerUpdateError;
      }

    } catch (error) {
      console.error('Bank hours transfer failed:', error);
      
      errorLogger.logError({
        error: error as Error,
        context: {
          operation: 'transferBankHours',
          component: 'BankHoursTransferService',
          additionalData: {
            transactionId,
            requesterId,
            providerId,
            hoursAttempted: hours,
            errorDetails: {
              name: (error as Error).name,
              message: (error as Error).message,
              stack: (error as Error).stack
            },
            timestamp: new Date().toISOString()
          }
        },
        severity: 'high',
        category: 'transaction'
      });

      return {
        success: false,
        error: (error as Error).message || 'Unknown transfer error'
      };
    }
  }

  /**
   * Rollback requester balance update in case of provider update failure
   */
  private async rollbackRequesterUpdate(requesterId: string, originalBalance: number): Promise<void> {
    try {
      await this.client.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: requesterId,
            bankHours: originalBalance
          }
        }
      });
      console.log(`Rollback successful for requester ${requesterId}`);
    } catch (rollbackError) {
      console.error(`CRITICAL: Failed to rollback requester balance for ${requesterId}:`, rollbackError);
      
      errorLogger.logError({
        error: rollbackError as Error,
        context: {
          userId: requesterId,
          operation: 'rollbackRequesterUpdate',
          component: 'BankHoursTransferService',
          additionalData: {
            originalBalance,
            rollbackAttempt: true,
            timestamp: new Date().toISOString()
          }
        },
        severity: 'critical',
        category: 'transaction'
      });
    }
  }

  /**
   * Get user's current bank hours balance
   */
  async getUserBalance(userId: string): Promise<number | null> {
    try {
      const result = await this.client.graphql({
        query: queries.getUser,
        variables: { id: userId }
      });

      return result.data?.getUser?.bankHours || null;
    } catch (error) {
      console.error(`Failed to get balance for user ${userId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const bankHoursTransferService = new BankHoursTransferService();
