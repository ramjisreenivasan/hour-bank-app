import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionSimulationService, SimulationProgress } from '../../services/transaction-simulation.service';
import { DatabaseTransactionSimulationService, DatabaseSimulationProgress } from '../../services/database-transaction-simulation.service';

@Component({
  selector: 'app-transaction-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simulation-container">
      <div class="simulation-header">
        <h2>🚀 HourBank Transaction Simulation</h2>
        <p>Generate realistic transaction data from June 2025 to today</p>
      </div>

      <div class="simulation-mode-selector">
        <h3>📊 Simulation Mode</h3>
        <div class="mode-options">
          <label class="mode-option">
            <input type="radio" name="simulationMode" value="database" [(ngModel)]="simulationMode">
            <div class="mode-card">
              <h4>💾 Database Simulation</h4>
              <p>Uses existing users and services, creates real transactions in database</p>
              <div class="mode-features">
                <span class="feature">✅ Real data persistence</span>
                <span class="feature">✅ Bank hour transfers</span>
                <span class="feature">✅ Uses existing users/services</span>
              </div>
            </div>
          </label>
          
          <label class="mode-option">
            <input type="radio" name="simulationMode" value="mock" [(ngModel)]="simulationMode">
            <div class="mode-card">
              <h4>📄 Mock Data Simulation</h4>
              <p>Creates test users and services, generates JSON files</p>
              <div class="mode-features">
                <span class="feature">✅ No database changes</span>
                <span class="feature">✅ Creates test data</span>
                <span class="feature">✅ JSON file output</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div class="simulation-controls">
        <button 
          class="btn btn-primary" 
          (click)="runSimulation()"
          [disabled]="isRunning"
        >
          {{ isRunning ? '⏳ Running Simulation...' : '▶️ Start Simulation' }}
        </button>
        
        <button 
          class="btn btn-secondary" 
          (click)="clearConsole()"
          [disabled]="isRunning"
        >
          🗑️ Clear Console
        </button>
      </div>

      <div class="simulation-status" *ngIf="isRunning || progress || dbProgress">
        <div class="status-card">
          <h3>📊 Simulation Progress</h3>
          
          <!-- Database Simulation Progress -->
          <div class="progress-grid" *ngIf="dbProgress && simulationMode === 'database'">
            <div class="progress-item">
              <span class="label">Current Date:</span>
              <span class="value">{{ dbProgress.currentDate }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Existing Users:</span>
              <span class="value">{{ dbProgress.usersProcessed }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Existing Services:</span>
              <span class="value">{{ dbProgress.servicesProcessed }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Total Transactions:</span>
              <span class="value">{{ dbProgress.totalTransactions }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Completed:</span>
              <span class="value">{{ dbProgress.completedTransactions }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Bank Hours Transferred:</span>
              <span class="value">{{ dbProgress.totalBankHoursTransferred }}</span>
            </div>
          </div>
          
          <!-- Mock Simulation Progress -->
          <div class="progress-grid" *ngIf="progress && simulationMode === 'mock'">
            <div class="progress-item">
              <span class="label">Current Date:</span>
              <span class="value">{{ progress.currentDate }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Total Transactions:</span>
              <span class="value">{{ progress.totalTransactions }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Completed:</span>
              <span class="value">{{ progress.completedTransactions }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Bank Hours Transferred:</span>
              <span class="value">{{ progress.totalBankHoursTransferred }}</span>
            </div>
          </div>
          
          <div class="loading-spinner" *ngIf="isRunning">
            <div class="spinner"></div>
            <span>Generating transactions...</span>
          </div>
        </div>
      </div>

      <div class="simulation-results" *ngIf="!isRunning && (progress || dbProgress)">
        <div class="results-card">
          <h3>✅ Simulation Complete!</h3>
          <div class="results-summary">
            <div class="summary-item">
              <div class="summary-number">{{ getTotalTransactions() }}</div>
              <div class="summary-label">Total Transactions</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ getCompletedTransactions() }}</div>
              <div class="summary-label">Completed</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ getBankHoursTransferred() }}</div>
              <div class="summary-label">Hours Transferred</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ getCompletionRate() }}%</div>
              <div class="summary-label">Success Rate</div>
            </div>
          </div>
          
          <div class="simulation-type-info" *ngIf="simulationMode === 'database'">
            <div class="info-banner success">
              <strong>💾 Database Simulation Complete!</strong>
              <p>Real transactions have been created in your database. You can now view them in the transaction tables and admin dashboard.</p>
            </div>
          </div>
          
          <div class="simulation-type-info" *ngIf="simulationMode === 'mock'">
            <div class="info-banner info">
              <strong>📄 Mock Simulation Complete!</strong>
              <p>Test data has been generated and saved to JSON files. Check the console output for file locations.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="console-output">
        <h3>📝 Console Output</h3>
        <div class="console" #consoleOutput>
          <div class="console-line" *ngFor="let line of consoleLines">
            {{ line }}
          </div>
        </div>
      </div>

      <div class="simulation-info">
        <h3>ℹ️ Simulation Parameters</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>Period:</strong> June 1, 2025 - July 26, 2025
          </div>
          <div class="info-item">
            <strong>Volume:</strong> 5-8 weekday, 8-12 weekend transactions/day
          </div>
          <div class="info-item">
            <strong>Users:</strong> 20% regular, 60% casual, 20% inactive
          </div>
          <div class="info-item">
            <strong>Success Rate:</strong> 70% completed, 15% rejected, 10% cancelled, 5% pending
          </div>
          <div class="info-item">
            <strong>Ratings:</strong> 60% five stars, 25% four stars, 15% lower
          </div>
          <div class="info-item">
            <strong>Economy:</strong> Realistic bank hour balance management
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simulation-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .simulation-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .simulation-header h2 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .simulation-mode-selector {
      margin-bottom: 30px;
    }

    .simulation-mode-selector h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .mode-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .mode-option {
      cursor: pointer;
    }

    .mode-option input[type="radio"] {
      display: none;
    }

    .mode-card {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      background: white;
    }

    .mode-option input[type="radio"]:checked + .mode-card {
      border-color: #667eea;
      background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
    }

    .mode-card h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .mode-card p {
      margin: 0 0 15px 0;
      color: #6c757d;
      font-size: 14px;
    }

    .mode-features {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .feature {
      font-size: 12px;
      color: #28a745;
      font-weight: 500;
    }

    .simulation-controls {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .simulation-status {
      margin-bottom: 30px;
    }

    .status-card, .results-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .status-card h3, .results-card h3 {
      margin-top: 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .progress-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .progress-item .label {
      font-weight: 600;
      color: #6c757d;
    }

    .progress-item .value {
      font-weight: 700;
      color: #2c3e50;
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 15px;
      justify-content: center;
      padding: 20px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .summary-item {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
    }

    .summary-number {
      font-size: 2.5em;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 5px;
    }

    .summary-label {
      font-size: 0.9em;
      color: #6c757d;
      font-weight: 600;
    }

    .simulation-type-info {
      margin-top: 20px;
    }

    .info-banner {
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .info-banner.success {
      background: #d4edda;
      border-color: #28a745;
      color: #155724;
    }

    .info-banner.info {
      background: #d1ecf1;
      border-color: #17a2b8;
      color: #0c5460;
    }

    .info-banner strong {
      display: block;
      margin-bottom: 5px;
    }

    .info-banner p {
      margin: 0;
      font-size: 14px;
    }

    .console-output {
      margin: 30px 0;
    }

    .console-output h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .console {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.4;
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #333;
    }

    .console-line {
      margin-bottom: 2px;
      white-space: pre-wrap;
    }

    .simulation-info {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .simulation-info h3 {
      margin-top: 0;
      color: #2c3e50;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .info-item {
      padding: 10px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
  `]
})
export class TransactionSimulationComponent {
  isRunning = false;
  progress: SimulationProgress | null = null;
  dbProgress: DatabaseSimulationProgress | null = null;
  consoleLines: string[] = [];
  simulationMode: 'database' | 'mock' = 'database';

  constructor(
    private simulationService: TransactionSimulationService,
    private databaseSimulationService: DatabaseTransactionSimulationService
  ) {
    // Capture console.log output
    this.interceptConsoleLog();
  }

  async runSimulation(): Promise<void> {
    this.isRunning = true;
    this.progress = null;
    this.dbProgress = null;
    this.consoleLines = [];

    try {
      if (this.simulationMode === 'database') {
        this.dbProgress = await this.databaseSimulationService.runDatabaseSimulation();
      } else {
        this.progress = await this.simulationService.runSimulation();
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      this.consoleLines.push(`❌ Simulation failed: ${error}`);
    } finally {
      this.isRunning = false;
    }
  }

  clearConsole(): void {
    this.consoleLines = [];
  }

  getTotalTransactions(): number {
    return this.dbProgress?.totalTransactions || this.progress?.totalTransactions || 0;
  }

  getCompletedTransactions(): number {
    return this.dbProgress?.completedTransactions || this.progress?.completedTransactions || 0;
  }

  getBankHoursTransferred(): number {
    return this.dbProgress?.totalBankHoursTransferred || this.progress?.totalBankHoursTransferred || 0;
  }

  getCompletionRate(): number {
    const total = this.getTotalTransactions();
    const completed = this.getCompletedTransactions();
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  private interceptConsoleLog(): void {
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      // Call original console.log
      originalLog.apply(console, args);
      
      // Add to our console lines
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.consoleLines.push(message);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const consoleElement = document.querySelector('.console');
        if (consoleElement) {
          consoleElement.scrollTop = consoleElement.scrollHeight;
        }
      }, 10);
    };
  }
}
  template: `
    <div class="simulation-container">
      <div class="simulation-header">
        <h2>🚀 HourBank Transaction Simulation</h2>
        <p>Generate realistic transaction data from June 2025 to today</p>
      </div>

      <div class="simulation-controls">
        <button 
          class="btn btn-primary" 
          (click)="runSimulation()"
          [disabled]="isRunning"
        >
          {{ isRunning ? '⏳ Running Simulation...' : '▶️ Start Simulation' }}
        </button>
        
        <button 
          class="btn btn-secondary" 
          (click)="clearConsole()"
          [disabled]="isRunning"
        >
          🗑️ Clear Console
        </button>
      </div>

      <div class="simulation-status" *ngIf="isRunning || progress">
        <div class="status-card">
          <h3>📊 Simulation Progress</h3>
          <div class="progress-grid" *ngIf="progress">
            <div class="progress-item">
              <span class="label">Current Date:</span>
              <span class="value">{{ progress.currentDate }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Total Transactions:</span>
              <span class="value">{{ progress.totalTransactions }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Completed:</span>
              <span class="value">{{ progress.completedTransactions }}</span>
            </div>
            <div class="progress-item">
              <span class="label">Bank Hours Transferred:</span>
              <span class="value">{{ progress.totalBankHoursTransferred }}</span>
            </div>
          </div>
          
          <div class="loading-spinner" *ngIf="isRunning">
            <div class="spinner"></div>
            <span>Generating transactions...</span>
          </div>
        </div>
      </div>

      <div class="simulation-results" *ngIf="!isRunning && progress">
        <div class="results-card">
          <h3>✅ Simulation Complete!</h3>
          <div class="results-summary">
            <div class="summary-item">
              <div class="summary-number">{{ progress.totalTransactions }}</div>
              <div class="summary-label">Total Transactions</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ progress.completedTransactions }}</div>
              <div class="summary-label">Completed</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ progress.totalBankHoursTransferred }}</div>
              <div class="summary-label">Hours Transferred</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ getCompletionRate() }}%</div>
              <div class="summary-label">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div class="console-output">
        <h3>📝 Console Output</h3>
        <div class="console" #consoleOutput>
          <div class="console-line" *ngFor="let line of consoleLines">
            {{ line }}
          </div>
        </div>
      </div>

      <div class="simulation-info">
        <h3>ℹ️ Simulation Parameters</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>Period:</strong> June 1, 2025 - July 26, 2025
          </div>
          <div class="info-item">
            <strong>Volume:</strong> 5-8 weekday, 8-12 weekend transactions/day
          </div>
          <div class="info-item">
            <strong>Users:</strong> 20% regular, 60% casual, 20% inactive
          </div>
          <div class="info-item">
            <strong>Success Rate:</strong> 70% completed, 15% rejected, 10% cancelled, 5% pending
          </div>
          <div class="info-item">
            <strong>Ratings:</strong> 60% five stars, 25% four stars, 15% lower
          </div>
          <div class="info-item">
            <strong>Economy:</strong> Realistic bank hour balance management
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simulation-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .simulation-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .simulation-header h2 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .simulation-controls {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .simulation-status {
      margin-bottom: 30px;
    }

    .status-card, .results-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .status-card h3, .results-card h3 {
      margin-top: 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .progress-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .progress-item .label {
      font-weight: 600;
      color: #6c757d;
    }

    .progress-item .value {
      font-weight: 700;
      color: #2c3e50;
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 15px;
      justify-content: center;
      padding: 20px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .summary-item {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
    }

    .summary-number {
      font-size: 2.5em;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 5px;
    }

    .summary-label {
      font-size: 0.9em;
      color: #6c757d;
      font-weight: 600;
    }

    .console-output {
      margin: 30px 0;
    }

    .console-output h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .console {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.4;
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #333;
    }

    .console-line {
      margin-bottom: 2px;
      white-space: pre-wrap;
    }

    .simulation-info {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .simulation-info h3 {
      margin-top: 0;
      color: #2c3e50;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .info-item {
      padding: 10px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
  `]
})
export class TransactionSimulationComponent {
  isRunning = false;
  progress: SimulationProgress | null = null;
  consoleLines: string[] = [];

  constructor(private simulationService: TransactionSimulationService) {
    // Capture console.log output
    this.interceptConsoleLog();
  }

  async runSimulation(): Promise<void> {
    this.isRunning = true;
    this.progress = null;
    this.consoleLines = [];

    try {
      this.progress = await this.simulationService.runSimulation();
    } catch (error) {
      console.error('Simulation failed:', error);
      this.consoleLines.push(`❌ Simulation failed: ${error}`);
    } finally {
      this.isRunning = false;
    }
  }

  clearConsole(): void {
    this.consoleLines = [];
  }

  getCompletionRate(): number {
    if (!this.progress || this.progress.totalTransactions === 0) return 0;
    return Math.round((this.progress.completedTransactions / this.progress.totalTransactions) * 100);
  }

  private interceptConsoleLog(): void {
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      // Call original console.log
      originalLog.apply(console, args);
      
      // Add to our console lines
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.consoleLines.push(message);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const consoleElement = document.querySelector('.console');
        if (consoleElement) {
          consoleElement.scrollTop = consoleElement.scrollHeight;
        }
      }, 10);
    };
  }
}
