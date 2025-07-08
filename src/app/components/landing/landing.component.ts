import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  
  features = [
    {
      icon: '🌱',
      title: 'Sustainable Economy',
      description: 'Build a circular economy where everyone contributes and benefits, reducing waste and maximizing human potential.'
    },
    {
      icon: '🤝',
      title: 'Community Building',
      description: 'Connect neighbors, professionals, and learners in meaningful exchanges that strengthen local communities.'
    },
    {
      icon: '💡',
      title: 'Skill Development',
      description: 'Learn new skills while teaching others, creating a continuous cycle of growth and knowledge sharing.'
    },
    {
      icon: '⚖️',
      title: 'Equal Opportunity',
      description: 'Everyone\'s time is valued equally, creating fair exchanges regardless of traditional economic barriers.'
    }
  ];

  popularServices = [
    {
      icon: '💻',
      title: 'Web Development',
      description: 'Website creation, coding lessons, and technical consulting',
      rate: 'Popular Exchange'
    },
    {
      icon: '🎨',
      title: 'Graphic Design',
      description: 'Logo design, branding, and creative visual solutions',
      rate: 'High Demand'
    },
    {
      icon: '📚',
      title: 'Language Tutoring',
      description: 'Language lessons, conversation practice, and cultural exchange',
      rate: 'Always Needed'
    },
    {
      icon: '🔧',
      title: 'Home Repair',
      description: 'Handyman services, maintenance, and DIY guidance',
      rate: 'Community Favorite'
    },
    {
      icon: '🍳',
      title: 'Cooking Lessons',
      description: 'Culinary skills, meal prep, and nutrition guidance',
      rate: 'Growing Fast'
    },
    {
      icon: '🧘',
      title: 'Wellness Coaching',
      description: 'Fitness training, meditation, and mental health support',
      rate: 'Trending Now'
    }
  ];

  steps = [
    {
      icon: '👤',
      title: 'Create Your Profile',
      description: 'Sign up and tell us about your skills, interests, and what services you can offer to the community.'
    },
    {
      icon: '🛠️',
      title: 'List Your Services',
      description: 'Create service listings for the skills you want to share and set your availability preferences.'
    },
    {
      icon: '⏰',
      title: 'Earn Time Credits',
      description: 'Provide services to other members and earn hours in your time bank account for future use.'
    },
    {
      icon: '🎯',
      title: 'Use Your Credits',
      description: 'Spend your earned hours to access services you need from other community members.'
    }
  ];

  successStories = [
    {
      name: 'Sarah Chen',
      role: 'Graphic Designer',
      avatar: '👩‍🎨',
      quote: 'I traded my design skills for coding lessons and now I can build my own websites. The community is amazing!',
      gave: '5 hours of logo design',
      got: '5 hours of web development tutoring'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Professional Chef',
      avatar: '👨‍🍳',
      quote: 'Teaching cooking classes earned me enough credits for home repairs. It\'s incredible how skills connect us.',
      gave: '8 hours of cooking lessons',
      got: '8 hours of handyman services'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Retired Teacher',
      avatar: '👩‍🏫',
      quote: 'I love tutoring students and using my credits for tech support. Everyone wins in this community!',
      gave: '12 hours of math tutoring',
      got: '12 hours of computer help'
    }
  ];

  constructor() { }
}
