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
      title: 'Equal Time Value',
      description: 'Every hour is worth exactly one hour—whether you\'re teaching, coding, cooking, or gardening. True equality through time.'
    }
  ];

  popularServices = [
    {
      icon: '💻',
      title: 'Web Development',
      description: 'Website creation, coding lessons, and technical consulting',
      duration: '2-4 hours',
      rate: '1 hour = 1 hour',
      timeType: 'Per project',
      example: 'Build a landing page: 3 hours'
    },
    {
      icon: '🎨',
      title: 'Graphic Design',
      description: 'Logo design, branding, and creative visual solutions',
      duration: '1-3 hours',
      rate: '1 hour = 1 hour',
      timeType: 'Per design',
      example: 'Logo design: 2 hours'
    },
    {
      icon: '📚',
      title: 'Language Tutoring',
      description: 'Language lessons, conversation practice, and cultural exchange',
      duration: '1 hour',
      rate: '1 hour = 1 hour',
      timeType: 'Per lesson',
      example: 'Spanish conversation: 1 hour'
    },
    {
      icon: '🔧',
      title: 'Home Repair',
      description: 'Handyman services, maintenance, and DIY guidance',
      duration: '1-2 hours',
      rate: '1 hour = 1 hour',
      timeType: 'Per task',
      example: 'Fix leaky faucet: 1 hour'
    },
    {
      icon: '🍳',
      title: 'Cooking Lessons',
      description: 'Culinary skills, meal prep, and nutrition guidance',
      duration: '2 hours',
      rate: '1 hour = 1 hour',
      timeType: 'Per class',
      example: 'Italian pasta making: 2 hours'
    },
    {
      icon: '🧘',
      title: 'Wellness Coaching',
      description: 'Fitness training, meditation, and mental health support',
      duration: '1 hour',
      rate: '1 hour = 1 hour',
      timeType: 'Per session',
      example: 'Yoga class: 1 hour'
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
      description: 'Provide services to other members and earn exactly one hour of credit for every hour you give—regardless of the service type.'
    },
    {
      icon: '🎯',
      title: 'Use Your Credits',
      description: 'Spend your earned hours to access any service you need—one hour of credit gets you one hour of any service.'
    }
  ];

  successStories = [
    {
      name: 'Sarah Chen',
      role: 'Graphic Designer',
      avatar: '👩‍🎨',
      quote: 'I traded my design skills for coding lessons and now I can build my own websites. The community is amazing!',
      gave: '3 hours of logo design',
      got: '3 hours of web development tutoring'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Professional Chef',
      avatar: '👨‍🍳',
      quote: 'Teaching cooking classes earned me enough credits for home repairs. It\'s incredible how skills connect us.',
      gave: '4 hours of cooking lessons',
      got: '4 hours of handyman services'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Retired Teacher',
      avatar: '👩‍🏫',
      quote: 'I love tutoring students and using my credits for tech support. Everyone wins in this community!',
      gave: '2 hours of math tutoring',
      got: '2 hours of computer help'
    }
  ];

  constructor() { }
}
