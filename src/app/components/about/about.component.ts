import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  
  stats = [
    { number: '10,000+', label: 'Hours Exchanged', icon: '⏰' },
    { number: '2,500+', label: 'Active Members', icon: '👥' },
    { number: '150+', label: 'Skill Categories', icon: '🎯' },
    { number: '95%', label: 'Satisfaction Rate', icon: '⭐' }
  ];

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

  impactAreas = [
    {
      title: 'Economic Inclusion',
      description: 'Breaking down financial barriers by creating value through time and skill exchange.',
      examples: ['Students accessing tutoring', 'Seniors getting tech help', 'Artists finding collaborators']
    },
    {
      title: 'Environmental Sustainability',
      description: 'Reducing consumption by maximizing the use of existing skills and resources.',
      examples: ['Repair instead of replace', 'Share knowledge vs. buy courses', 'Local solutions first']
    },
    {
      title: 'Social Connection',
      description: 'Building stronger communities through meaningful person-to-person interactions.',
      examples: ['Intergenerational learning', 'Cultural exchange', 'Professional mentorship']
    }
  ];

  // How It Works data merged from how-it-works component
  steps = [
    {
      icon: '👤',
      title: 'Create Your Profile',
      description: 'Sign up and tell us about your skills, interests, and what services you can offer.',
      details: [
        'Add your skills and expertise',
        'Set your availability preferences',
        'Write a brief bio about yourself',
        'Upload a profile photo (optional)'
      ]
    },
    {
      icon: '🛠️',
      title: 'List Your Services',
      description: 'Create service listings for the skills you want to share with the community.',
      details: [
        'Describe your service in detail',
        'Set your preferred time commitment',
        'Add relevant tags and categories',
        'Specify any requirements or materials needed'
      ]
    },
    {
      icon: '⏰',
      title: 'Earn Time Credits',
      description: 'Provide services to other members and earn hours in your time bank account.',
      details: [
        'Accept service requests from members',
        'Complete the agreed-upon work',
        'Get rated by satisfied customers',
        'Watch your time bank balance grow'
      ]
    },
    {
      icon: '🎯',
      title: 'Use Your Credits',
      description: 'Spend your earned hours to access services you need from other community members.',
      details: [
        'Browse available services',
        'Request services using your credits',
        'Connect with service providers',
        'Rate your experience to help others'
      ]
    }
  ];

  examples = [
    {
      icon: '👩‍💻',
      title: 'Sarah the Designer',
      description: 'A graphic designer who wants to learn web development',
      gives: '3 hours of logo design',
      gets: '3 hours of coding lessons'
    },
    {
      icon: '👨‍🍳',
      title: 'Mike the Chef',
      description: 'A professional chef who needs help with his garden',
      gives: '4 hours of cooking classes',
      gets: '4 hours of gardening help'
    },
    {
      icon: '👩‍🏫',
      title: 'Dr. Emily the Teacher',
      description: 'A retired teacher who wants tech support',
      gives: '2 hours of tutoring',
      gets: '2 hours of computer help'
    }
  ];

  faqs = [
    {
      question: 'How do I know if someone is trustworthy?',
      answer: 'Every member has a rating system based on completed transactions. You can read reviews from other community members and start with smaller exchanges to build trust.'
    },
    {
      question: 'What if I can\'t complete a service I promised?',
      answer: 'Communication is key. Contact the other member as soon as possible to discuss alternatives. Our community values honesty and flexibility.'
    },
    {
      question: 'Can I exchange services with people far away?',
      answer: 'While hOurBank works best for local communities, many services can be provided remotely, such as tutoring, consulting, or digital services.'
    },
    {
      question: 'What happens if I run out of time credits?',
      answer: 'You can always offer your services to earn more credits. New members also receive a small starting balance to make their first exchange.'
    },
    {
      question: 'Is there a limit to how many hours I can earn?',
      answer: 'There\'s no limit! The more you contribute to the community, the more you can benefit from it. Some members have earned hundreds of hours.'
    },
    {
      question: 'How do I handle disputes or problems?',
      answer: 'We have a community support system and mediation process to help resolve any issues that arise between members.'
    }
  ];

  constructor() { }
}
