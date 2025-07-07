import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
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

  constructor() { }
}
