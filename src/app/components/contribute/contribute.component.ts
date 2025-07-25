import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-contribute',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavigationComponent],
  templateUrl: './contribute.component.html',
  styleUrls: ['./contribute.component.scss']
})
export class ContributeComponent {
  
  contributionTypes = [
    {
      icon: '💻',
      title: 'Code Contributions',
      description: 'Write new features, fix bugs, and improve existing functionality',
      hourRange: '2-8 hours',
      examples: ['New component development', 'Bug fixes', 'Performance optimizations', 'Security enhancements'],
      difficulty: 'Beginner to Advanced'
    },
    {
      icon: '🔍',
      title: 'Code Reviews',
      description: 'Review pull requests, provide feedback, and ensure code quality',
      hourRange: '1-3 hours',
      examples: ['Pull request reviews', 'Code quality checks', 'Security audits', 'Documentation reviews'],
      difficulty: 'Intermediate to Advanced'
    },
    {
      icon: '🎯',
      title: 'Feature Bounties',
      description: 'Complete requested features and enhancements from the community wishlist',
      hourRange: '5-20 hours',
      examples: ['New service categories', 'Mobile app features', 'API enhancements', 'UI/UX improvements'],
      difficulty: 'Intermediate to Advanced'
    },
    {
      icon: '📚',
      title: 'Documentation',
      description: 'Create and maintain technical documentation, guides, and tutorials',
      hourRange: '1-4 hours',
      examples: ['API documentation', 'Setup guides', 'Contributing guidelines', 'User tutorials'],
      difficulty: 'Beginner to Intermediate'
    },
    {
      icon: '🧪',
      title: 'Testing & QA',
      description: 'Write tests, perform quality assurance, and identify issues',
      hourRange: '1-5 hours',
      examples: ['Unit tests', 'Integration tests', 'Manual testing', 'Bug reporting'],
      difficulty: 'Beginner to Intermediate'
    },
    {
      icon: '🎨',
      title: 'Design & UX',
      description: 'Improve user interface, user experience, and visual design',
      hourRange: '2-6 hours',
      examples: ['UI mockups', 'UX research', 'Accessibility improvements', 'Design systems'],
      difficulty: 'Intermediate'
    }
  ];

  contributionProcess = [
    {
      step: 1,
      title: 'Choose Your Contribution',
      description: 'Browse available issues, feature requests, or propose your own improvements',
      icon: '🎯',
      details: ['Check GitHub issues', 'Review feature wishlist', 'Propose new ideas', 'Claim an issue']
    },
    {
      step: 2,
      title: 'Estimate & Commit',
      description: 'Estimate the time required and commit to the contribution timeline',
      icon: '⏱️',
      details: ['Provide time estimate', 'Set completion timeline', 'Get approval from maintainers', 'Start development']
    },
    {
      step: 3,
      title: 'Develop & Submit',
      description: 'Create your contribution following our guidelines and submit for review',
      icon: '🔨',
      details: ['Follow coding standards', 'Write tests', 'Update documentation', 'Submit pull request']
    },
    {
      step: 4,
      title: 'Review & Earn',
      description: 'Get your contribution reviewed, approved, and earn your time credits',
      icon: '✅',
      details: ['Code review process', 'Address feedback', 'Merge approval', 'Receive time credits']
    }
  ];

  currentBounties = [
    {
      id: 1,
      title: 'Mobile App Push Notifications',
      description: 'Implement push notifications for service requests and messages in the mobile app',
      hours: 12,
      difficulty: 'Advanced',
      tags: ['Mobile', 'React Native', 'Firebase'],
      status: 'Open',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Advanced Search Filters',
      description: 'Add location-based search, skill categories, and availability filters to service search',
      hours: 8,
      difficulty: 'Intermediate',
      tags: ['Frontend', 'Angular', 'Search'],
      status: 'Open',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Automated Testing Suite',
      description: 'Create comprehensive end-to-end testing suite for critical user flows',
      hours: 15,
      difficulty: 'Intermediate',
      tags: ['Testing', 'Cypress', 'QA'],
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 4,
      title: 'Dark Mode Theme',
      description: 'Implement dark mode theme across all components with user preference storage',
      hours: 6,
      difficulty: 'Beginner',
      tags: ['UI', 'SCSS', 'Theming'],
      status: 'Open',
      priority: 'Low'
    }
  ];

  recentContributions = [
    {
      contributor: 'Sarah Chen',
      avatar: '👩‍💻',
      contribution: 'Fixed authentication bug in mobile app',
      hoursEarned: 4,
      date: '2 days ago',
      type: 'Bug Fix'
    },
    {
      contributor: 'Mike Rodriguez',
      avatar: '👨‍🔧',
      contribution: 'Added service rating system',
      hoursEarned: 12,
      date: '1 week ago',
      type: 'Feature'
    },
    {
      contributor: 'Alex Kim',
      avatar: '👩‍🎨',
      contribution: 'Improved accessibility in navigation',
      hoursEarned: 6,
      date: '1 week ago',
      type: 'Enhancement'
    },
    {
      contributor: 'David Park',
      avatar: '👨‍💼',
      contribution: 'Updated API documentation',
      hoursEarned: 3,
      date: '2 weeks ago',
      type: 'Documentation'
    }
  ];

  stats = [
    {
      number: '156',
      label: 'Contributors',
      icon: '👥'
    },
    {
      number: '2,340',
      label: 'Hours Earned',
      icon: '⏰'
    },
    {
      number: '89',
      label: 'Features Built',
      icon: '🚀'
    },
    {
      number: '234',
      label: 'Bugs Fixed',
      icon: '🐛'
    }
  ];

  // Feature wishlist form
  newFeatureRequest = {
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    estimatedHours: null
  };

  categories = [
    'User Interface',
    'Mobile App',
    'API & Backend',
    'Security',
    'Performance',
    'Accessibility',
    'Documentation',
    'Testing',
    'Other'
  ];

  priorities = ['Low', 'Medium', 'High', 'Critical'];

  submitFeatureRequest() {
    // In a real app, this would submit to a backend service
    console.log('Feature request submitted:', this.newFeatureRequest);
    
    // Reset form
    this.newFeatureRequest = {
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
      estimatedHours: null
    };
    
    // Show success message (in real app, use a toast service)
    alert('Feature request submitted successfully! It will be reviewed by our development team.');
  }
}
