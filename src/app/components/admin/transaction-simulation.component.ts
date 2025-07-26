import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionSimulationService, SimulationProgress } from '../../services/transaction-simulation.service';

@Component({
  selector: 'app-transaction-simulation',
  standalone: true,
  imports: [CommonModule],
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
