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
      icon: '⏰',
      title: 'Time-Based Currency',
      description: 'One hour of your time equals one hour of anyone else\'s time. Fair and simple.'
    },
    {
      icon: '🤝',
      title: 'Community Driven',
      description: 'Connect with neighbors and build stronger local communities through skill sharing.'
    },
    {
      icon: '🌱',
      title: 'Sustainable Impact',
      description: 'Reduce waste, share resources, and create a more sustainable economy together.'
    }
  ];

  testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Graphic Designer',
      quote: 'I\'ve learned web development while teaching design. It\'s amazing how much we can achieve together!',
      avatar: '👩‍🎨'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Home Chef',
      quote: 'Teaching cooking classes helped me get my garden designed. The community here is incredible.',
      avatar: '👨‍🍳'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Retired Teacher',
      quote: 'I love tutoring students and getting help with technology. Everyone has something valuable to offer.',
      avatar: '👩‍🏫'
    }
  ];

  constructor() { }
}
