import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationDataService } from '../../services/simulation-data.service';
import { User, Service, Transaction, Booking } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-simulation-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simulation-dashboard">
      <div class="dashboard-header">
        <h1>🚀 HourBank Simulation Dashboard</h1>
        <p class="subtitle">Transaction history simulation from June 1, 2025 to present</p>
      </div>

      <div class="stats-grid" *ngIf="stats$ | async as stats">
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-content">
            <h3>{{ stats.totalTransactions }}</h3>
            <p>Total Transactions</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3>{{ stats.totalHours }}</h3>
            <p>Hours Exchanged</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{ stats.averageRating | number:'1.1-1' }}</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ (users$ | async)?.length || 0 }}</h3>
            <p>Active Users</p>
          </div>
        </div>
      </div>

      <!-- User Bank Hours Summary -->
      <div class="section">
        <h2>💰 User Bank Hours Summary</h2>
        <div class="users-grid" *ngIf="users$ | async as users">
          <div class="user-card" *ngFor="let user of users">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
              <h4>{{ user.firstName }} {{ user.lastName }}</h4>
              <p class="username">{{ '@' + user.username }}</p>
              <div class="user-stats">
                <div class="stat">
                  <span class="label">Bank Hours:</span>
                  <span class="value hours">{{ user.bankHours }}</span>
                </div>
                <div class="stat">
                  <span class="label">Rating:</span>
                  <span class="value rating">⭐ {{ user.rating | number:'1.1-1' }}</span>
                </div>
                <div class="stat">
                  <span class="label">Transactions:</span>
                  <span class="value">{{ user.totalTransactions }}</span>
                </div>
              </div>
              <div class="user-skills">
                <span class="skill-tag" *ngFor="let skill of user.skills.slice(0, 2)">{{ skill }}</span>
                <span class="skill-more" *ngIf="user.skills.length > 2">+{{ user.skills.length - 2 }} more</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Statistics -->
      <div class="section" *ngIf="stats$ | async as stats">
        <h2>📈 Transaction Summary by Category</h2>
        <div class="category-grid">
          <div class="category-card" *ngFor="let category of getCategoryEntries(stats.categoryStats)">
            <div class="category-icon">{{ getCategoryIcon(category[0]) }}</div>
            <div class="category-info">
              <h4>{{ category[0] }}</h4>
              <div class="category-stats">
                <span class="transactions">{{ category[1].count }} transactions</span>
                <span class="hours">{{ category[1].totalHours }} hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="section" *ngIf="stats$ | async as stats">
        <div class="top-performers">
          <div class="top-section">
            <h3>🏆 Top Providers</h3>
            <div class="performer-list">
              <div class="performer-item" *ngFor="let provider of stats.topProviders; let i = index">
                <div class="rank">{{ i + 1 }}</div>
                <div class="performer-info">
                  <h5>{{ provider.user.firstName }} {{ provider.user.lastName }}</h5>
                  <p>{{ provider.earnings }} hours earned • {{ provider.transactionCount }} transactions</p>
                </div>
              </div>
            </div>
          </div>

          <div class="top-section">
            <h3>🛍️ Top Consumers</h3>
            <div class="performer-list">
              <div class="performer-item" *ngFor="let consumer of stats.topConsumers; let i = index">
                <div class="rank">{{ i + 1 }}</div>
                <div class="performer-info">
                  <h5>{{ consumer.user.firstName }} {{ consumer.user.lastName }}</h5>
                  <p>{{ consumer.spending }} hours spent • {{ consumer.transactionCount }} transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="section">
        <h2>🕒 Recent Transactions</h2>
        <div class="transactions-list" *ngIf="recentTransactions$ | async as transactions">
          <div class="transaction-item" *ngFor="let transaction of transactions">
            <div class="transaction-date">
              {{ transaction.createdAt | date:'MMM d, y' }}
            </div>
            <div class="transaction-details">
              <div class="transaction-users">
                <span class="consumer">{{ getUser(transaction.consumerId)?.firstName || 'Unknown' }}</span>
                <i class="fas fa-arrow-right"></i>
                <span class="provider">{{ getUser(transaction.providerId)?.firstName || 'Unknown' }}</span>
              </div>
              <div class="transaction-service">{{ getService(transaction.serviceId)?.title || 'Unknown Service' }}</div>
              <div class="transaction-meta">
                <span class="hours">{{ transaction.hoursSpent }}h</span>
                <span class="rating">⭐{{ transaction.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simulation-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #1e40af;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content h3 {
      font-size: 2rem;
      margin: 0;
      color: #1e40af;
    }

    .stat-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section h2 {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      color: #1e40af;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .user-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      background: #e5e7eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      font-size: 1.2rem;
    }

    .user-info {
      flex: 1;
    }

    .user-info h4 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .username {
      margin: 0 0 1rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .user-stats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .stat .label {
      color: #6b7280;
    }

    .stat .value {
      font-weight: 600;
    }

    .stat .value.hours {
      color: #059669;
    }

    .stat .value.rating {
      color: #f59e0b;
    }

    .user-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .skill-more {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .category-icon {
      font-size: 2rem;
    }

    .category-info h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .category-stats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .top-performers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .top-section h3 {
      margin-bottom: 1rem;
      color: #1e40af;
    }

    .performer-list {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .performer-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .performer-item:last-child {
      border-bottom: none;
    }

    .rank {
      width: 30px;
      height: 30px;
      background: #1e40af;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .performer-info h5 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .performer-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .transactions-list {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .transaction-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-date {
      min-width: 100px;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-users {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .consumer {
      color: #dc2626;
      font-weight: 600;
    }

    .provider {
      color: #059669;
      font-weight: 600;
    }

    .transaction-service {
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .transaction-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .hours {
      color: #1e40af;
      font-weight: 600;
    }

    .rating {
      color: #f59e0b;
    }

    @media (max-width: 768px) {
      .simulation-dashboard {
        padding: 1rem;
      }

      .top-performers {
        grid-template-columns: 1fr;
      }

      .transaction-item {
        flex-direction: column;
        gap: 0.5rem;
      }

      .transaction-date {
        min-width: auto;
      }
    }
  `]
})
export class SimulationDashboardComponent implements OnInit {
  users$!: Observable<User[]>;
  services$!: Observable<Service[]>;
  transactions$!: Observable<Transaction[]>;
  stats$!: Observable<any>;
  recentTransactions$!: Observable<Transaction[]>;

  private usersCache: User[] = [];
  private servicesCache: Service[] = [];

  constructor(private simulationService: SimulationDataService) {}

  ngOnInit() {
    // Load simulation data first
    this.simulationService.loadSimulationData().subscribe();

    // Set up observables
    this.users$ = this.simulationService.getUsers();
    this.services$ = this.simulationService.getServices();
    this.transactions$ = this.simulationService.getTransactions();
    this.stats$ = this.simulationService.getTransactionStats();
    this.recentTransactions$ = this.simulationService.getRecentTransactions(10);

    // Cache users and services for quick lookup
    this.users$.subscribe(users => this.usersCache = users);
    this.services$.subscribe(services => this.servicesCache = services);
  }

  getCategoryEntries(categoryStats: { [category: string]: { count: number; totalHours: number } }) {
    return Object.entries(categoryStats).sort(([,a], [,b]) => b.count - a.count);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Technology': '💻',
      'Education': '📚',
      'Design': '🎨',
      'Home Services': '🔧',
      'Culinary': '🍳',
      'Health & Fitness': '💪',
      'Arts & Music': '🎵',
      'Writing': '✍️',
      'Photography': '📸',
      'Gardening': '🌱'
    };
    return icons[category] || '🛍️';
  }

  getUser(userId: string): User | undefined {
    return this.usersCache.find(user => user.id === userId);
  }

  getService(serviceId: string): Service | undefined {
    return this.servicesCache.find(service => service.id === serviceId);
  }
}
