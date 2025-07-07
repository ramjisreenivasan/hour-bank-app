import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface CommunityMember {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  skills: string[];
  rating: number;
  totalTransactions: number;
  joinedDate: string;
  activeServices: number;
}

@Component({
  selector: 'app-community-browse',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="community-browse">
      <!-- Header -->
      <div class="page-header">
        <div class="container">
          <h1 class="page-title">Our Community</h1>
          <p class="page-subtitle">
            Meet the amazing people who make hOurBank a thriving skill-sharing community
          </p>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">2,500+</div>
              <div class="stat-label">Active Members</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">150+</div>
              <div class="stat-label">Skill Categories</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">10,000+</div>
              <div class="stat-label">Hours Exchanged</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">95%</div>
              <div class="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Members Section -->
      <div class="members-section">
        <div class="container">
          <h2 class="section-title">Featured Community Members</h2>
          <div class="members-grid">
            <div class="member-card" *ngFor="let member of members">
              <div class="member-avatar">
                {{ member.firstName.charAt(0) }}{{ member.lastName.charAt(0) }}
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.firstName }} {{ member.lastName }}</h3>
                <p class="member-bio">{{ member.bio }}</p>
                
                <div class="member-skills">
                  <span *ngFor="let skill of member.skills.slice(0, 3)" class="skill-tag">
                    {{ skill }}
                  </span>
                  <span *ngIf="member.skills.length > 3" class="skill-more">
                    +{{ member.skills.length - 3 }} more
                  </span>
                </div>
                
                <div class="member-stats">
                  <div class="stat">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-text">{{ member.rating }}/5 rating</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">🤝</span>
                    <span class="stat-text">{{ member.totalTransactions }} transactions</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">🛠️</span>
                    <span class="stat-text">{{ member.activeServices }} active services</span>
                  </div>
                </div>
                
                <div class="member-joined">
                  Member since {{ member.joinedDate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Cloud Section -->
      <div class="skills-section">
        <div class="container">
          <h2 class="section-title">Popular Skills in Our Community</h2>
          <div class="skills-cloud">
            <span *ngFor="let skill of popularSkills" 
                  class="skill-bubble" 
                  [style.font-size.rem]="skill.size">
              {{ skill.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Join CTA -->
      <div class="join-section">
        <div class="container">
          <div class="join-content">
            <h2 class="join-title">Ready to Join Our Community?</h2>
            <p class="join-subtitle">
              Connect with amazing people, share your skills, and build meaningful relationships
            </p>
            <div class="join-actions">
              <a routerLink="/auth" class="btn btn-primary">Join hOurBank</a>
              <a routerLink="/services" class="btn btn-secondary">Browse Services</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./community-browse.component.scss']
})
export class CommunityBrowseComponent implements OnInit {
  members: CommunityMember[] = [];
  popularSkills = [
    { name: 'Web Development', size: 1.5 },
    { name: 'Graphic Design', size: 1.3 },
    { name: 'Language Tutoring', size: 1.4 },
    { name: 'Cooking', size: 1.2 },
    { name: 'Photography', size: 1.1 },
    { name: 'Business Consulting', size: 1.3 },
    { name: 'Fitness Training', size: 1.2 },
    { name: 'Music Lessons', size: 1.1 },
    { name: 'Home Repair', size: 1.2 },
    { name: 'Gardening', size: 1.0 },
    { name: 'Writing', size: 1.1 },
    { name: 'Marketing', size: 1.2 },
    { name: 'Legal Advice', size: 1.1 },
    { name: 'Tax Preparation', size: 1.0 },
    { name: 'Pet Care', size: 1.0 },
    { name: 'Tutoring', size: 1.3 },
    { name: 'Art Classes', size: 1.1 },
    { name: 'Tech Support', size: 1.2 }
  ];

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    // Mock data - in real app, this would come from your GraphQL API
    this.members = [
      {
        id: '1',
        firstName: 'Ramji',
        lastName: 'Sreenivasan',
        bio: 'Full-stack developer passionate about building scalable applications and helping others learn to code.',
        skills: ['Web Development', 'Cloud Computing', 'DevOps', 'Machine Learning', 'Business Consulting'],
        rating: 4.9,
        totalTransactions: 15,
        joinedDate: 'January 2024',
        activeServices: 3
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Chen',
        bio: 'Creative graphic designer with a passion for branding and visual storytelling.',
        skills: ['Graphic Design', 'Branding', 'UI/UX Design', 'Photography'],
        rating: 4.8,
        totalTransactions: 23,
        joinedDate: 'February 2024',
        activeServices: 2
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        bio: 'Professional chef and cooking instructor who loves sharing culinary knowledge.',
        skills: ['Cooking', 'Baking', 'Nutrition', 'Food Photography'],
        rating: 4.9,
        totalTransactions: 18,
        joinedDate: 'March 2024',
        activeServices: 2
      },
      {
        id: '4',
        firstName: 'Dr. Emily',
        lastName: 'Watson',
        bio: 'Retired educator with 30+ years of teaching experience in mathematics and science.',
        skills: ['Math Tutoring', 'Science Education', 'Test Prep', 'Study Skills'],
        rating: 5.0,
        totalTransactions: 31,
        joinedDate: 'January 2024',
        activeServices: 4
      },
      {
        id: '5',
        firstName: 'David',
        lastName: 'Kim',
        bio: 'Certified personal trainer and wellness coach helping people achieve their fitness goals.',
        skills: ['Fitness Training', 'Nutrition Coaching', 'Yoga', 'Meditation'],
        rating: 4.7,
        totalTransactions: 27,
        joinedDate: 'February 2024',
        activeServices: 3
      },
      {
        id: '6',
        firstName: 'Lisa',
        lastName: 'Thompson',
        bio: 'Marketing professional and small business consultant with expertise in digital strategy.',
        skills: ['Digital Marketing', 'Social Media', 'Business Strategy', 'Content Writing'],
        rating: 4.8,
        totalTransactions: 19,
        joinedDate: 'March 2024',
        activeServices: 2
      }
    ];
  }
}
