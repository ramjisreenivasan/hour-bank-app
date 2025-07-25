import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent {
  
  supportedGroups = [
    {
      icon: '👴',
      title: 'Elderly Community',
      description: 'Support seniors with technology help, companionship, grocery shopping, and home maintenance',
      needs: ['Tech support', 'Companionship', 'Transportation', 'Home repairs'],
      impact: 'Help seniors stay independent and connected'
    },
    {
      icon: '🎓',
      title: 'Students',
      description: 'Provide tutoring, mentorship, career guidance, and skill development for students',
      needs: ['Tutoring', 'Mentorship', 'Career guidance', 'Skill workshops'],
      impact: 'Empower the next generation with knowledge and opportunities'
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Families in Crisis',
      description: 'Assist families facing temporary hardships with essential services and support',
      needs: ['Childcare', 'Meal preparation', 'Job search help', 'Emotional support'],
      impact: 'Provide stability during challenging times'
    }
  ];

  donationBenefits = [
    {
      icon: '🌟',
      title: 'Community Impact',
      description: 'Your donated hours directly help those who need it most in your community'
    },
    {
      icon: '🔄',
      title: 'Pay-it-Forward Culture',
      description: 'Create a ripple effect of kindness that inspires others to give back'
    },
    {
      icon: '💝',
      title: 'Social Good',
      description: 'Transform your earned hours into meaningful support for vulnerable populations'
    },
    {
      icon: '🤝',
      title: 'Stronger Communities',
      description: 'Build connections and solidarity across different groups in society'
    }
  ];

  howItWorks = [
    {
      step: 1,
      title: 'Earn Hours',
      description: 'Provide services and accumulate hours in your time bank account',
      icon: '⏰'
    },
    {
      step: 2,
      title: 'Choose Your Donation',
      description: 'Decide how many hours from your account balance you want to donate - partial or full amounts',
      icon: '💝'
    },
    {
      step: 3,
      title: 'Community Pool',
      description: 'Your donated hours join the community pool to support elderly, students, and families in crisis',
      icon: '🏊‍♂️'
    },
    {
      step: 4,
      title: 'Direct Impact',
      description: 'Recipients use your donated hours to access essential services they need',
      icon: '🌟'
    }
  ];

  donationOptions = [
    {
      type: 'Partial Donation',
      description: 'Donate a portion of your earned hours while keeping some for your own needs',
      example: 'Donate 2 hours from your 10-hour balance',
      icon: '🎯'
    },
    {
      type: 'Full Exchange Donation',
      description: 'Donate all hours earned from a specific service exchange',
      example: 'Donate all 3 hours earned from web design project',
      icon: '💯'
    },
    {
      type: 'Regular Giving',
      description: 'Set up automatic donations of a fixed amount from each exchange',
      example: 'Donate 1 hour from every service you provide',
      icon: '🔄'
    }
  ];

  stats = [
    {
      number: '2,450',
      label: 'Hours Donated',
      icon: '⏰'
    },
    {
      number: '340',
      label: 'People Helped',
      icon: '👥'
    },
    {
      number: '89',
      label: 'Generous Donors',
      icon: '💝'
    },
    {
      number: '15',
      label: 'Partner Organizations',
      icon: '🤝'
    }
  ];

  testimonials = [
    {
      name: 'Sarah M.',
      role: 'Regular Donor',
      quote: 'I donate 1 hour from every web design project I complete. It feels great knowing my skills are helping students learn.',
      avatar: '👩‍💻'
    },
    {
      name: 'Michael R.',
      role: 'Community Volunteer',
      quote: 'I donated half of my earned hours last month. Seeing families get the help they need makes it all worthwhile.',
      avatar: '👨‍🏫'
    },
    {
      name: 'Elena K.',
      role: 'Senior Recipient',
      quote: 'Thanks to someone\'s generous donation, I received help with my computer and now I can video call my grandchildren.',
      avatar: '👵'
    }
  ];
}
