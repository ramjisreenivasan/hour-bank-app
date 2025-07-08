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
      icon: '🏠',
      title: 'Real Estate Focused',
      description: 'Designed specifically for real estate professionals with industry-relevant services and expertise.'
    },
    {
      icon: '💰',
      title: 'Cost-Effective',
      description: 'Access premium services without the premium price tag. Save thousands on professional services.'
    },
    {
      icon: '🤝',
      title: 'Professional Network',
      description: 'Connect with vetted real estate professionals and build valuable business relationships.'
    },
    {
      icon: '⚡',
      title: 'Quick Turnaround',
      description: 'Get services completed faster through our motivated professional community.'
    }
  ];

  popularServices = [
    {
      icon: '📸',
      title: 'Property Photography',
      description: 'Professional real estate photography and virtual tours',
      rate: '2-4'
    },
    {
      icon: '🎨',
      title: 'Home Staging',
      description: 'Expert staging consultation and setup services',
      rate: '3-6'
    },
    {
      icon: '📊',
      title: 'Market Analysis',
      description: 'Comprehensive market research and CMA reports',
      rate: '2-3'
    },
    {
      icon: '⚖️',
      title: 'Legal Review',
      description: 'Contract review and legal consultation services',
      rate: '1-2'
    },
    {
      icon: '📱',
      title: 'Digital Marketing',
      description: 'Social media management and online advertising',
      rate: '2-5'
    },
    {
      icon: '🏡',
      title: 'Property Management',
      description: 'Tenant screening and property maintenance coordination',
      rate: '1-3'
    }
  ];

  testimonials = [
    {
      name: 'Jennifer Martinez',
      role: 'Luxury Real Estate Agent',
      quote: 'I traded my staging expertise for professional photography services. Saved me $2,000 and built great relationships!',
      avatar: '🏡'
    },
    {
      name: 'David Thompson',
      role: 'Commercial Broker',
      quote: 'The market analysis I received through hOurBank was better than what I used to pay $500 for. Amazing network!',
      avatar: '📊'
    },
    {
      name: 'Lisa Chen',
      role: 'Property Manager',
      quote: 'I help with tenant screening and get legal reviews in return. It\'s transformed how I run my business.',
      avatar: '🔑'
    },
    {
      name: 'Robert Williams',
      role: 'Real Estate Attorney',
      quote: 'Providing legal services earned me hours for marketing help. My practice has grown significantly!',
      avatar: '⚖️'
    }
  ];

  constructor() { }
}
