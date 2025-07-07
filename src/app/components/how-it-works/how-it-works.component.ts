import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="how-it-works">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <h1 class="hero-title">How hOurBank Works</h1>
          <p class="hero-subtitle">
            Learn how our time-banking system creates value through skill exchange
          </p>
        </div>
      </section>

      <!-- Steps Section -->
      <section class="steps-section">
        <div class="container">
          <h2 class="section-title">Getting Started in 4 Simple Steps</h2>
          <div class="steps-grid">
            <div class="step" *ngFor="let step of steps; let i = index">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-icon">{{ step.icon }}</div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
              <div class="step-details">
                <ul>
                  <li *ngFor="let detail of step.details">{{ detail }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Time Banking Concept -->
      <section class="concept-section">
        <div class="container">
          <div class="concept-content">
            <div class="concept-text">
              <h2 class="concept-title">The Time Banking Concept</h2>
              <p class="concept-description">
                Time banking is based on the simple principle that everyone's time is equally valuable. 
                Whether you're teaching coding or cooking, providing legal advice or gardening help, 
                one hour of your time equals one hour of credit in the system.
              </p>
              
              <div class="concept-benefits">
                <div class="benefit">
                  <span class="benefit-icon">⚖️</span>
                  <div class="benefit-content">
                    <h4>Equal Value</h4>
                    <p>All hours are valued equally regardless of the service type</p>
                  </div>
                </div>
                <div class="benefit">
                  <span class="benefit-icon">🔄</span>
                  <div class="benefit-content">
                    <h4>Circular Economy</h4>
                    <p>Credits flow through the community, benefiting everyone</p>
                  </div>
                </div>
                <div class="benefit">
                  <span class="benefit-icon">🤝</span>
                  <div class="benefit-content">
                    <h4>Community Building</h4>
                    <p>Strengthen local connections through meaningful exchanges</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="concept-visual">
              <div class="time-equation">
                <div class="equation-item">
                  <div class="service-example">
                    <span class="service-icon">💻</span>
                    <span class="service-text">1 Hour<br>Web Development</span>
                  </div>
                </div>
                <div class="equals">=</div>
                <div class="equation-item">
                  <div class="service-example">
                    <span class="service-icon">🍳</span>
                    <span class="service-text">1 Hour<br>Cooking Lesson</span>
                  </div>
                </div>
                <div class="equals">=</div>
                <div class="equation-item">
                  <div class="service-example">
                    <span class="service-icon">🎨</span>
                    <span class="service-text">1 Hour<br>Art Tutoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Examples Section -->
      <section class="examples-section">
        <div class="container">
          <h2 class="section-title">Real-World Examples</h2>
          <div class="examples-grid">
            <div class="example-card" *ngFor="let example of examples">
              <div class="example-header">
                <span class="example-icon">{{ example.icon }}</span>
                <h3 class="example-title">{{ example.title }}</h3>
              </div>
              <p class="example-description">{{ example.description }}</p>
              <div class="example-flow">
                <div class="flow-step">
                  <strong>Gives:</strong> {{ example.gives }}
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                  <strong>Gets:</strong> {{ example.gets }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <div class="container">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div class="faq-grid">
            <div class="faq-item" *ngFor="let faq of faqs">
              <h3 class="faq-question">{{ faq.question }}</h3>
              <p class="faq-answer">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">Ready to Start Time Banking?</h2>
            <p class="cta-subtitle">
              Join thousands of people already building a better economy through skill sharing
            </p>
            <div class="cta-actions">
              <a routerLink="/auth" class="btn btn-primary">Get Started Free</a>
              <a routerLink="/services" class="btn btn-secondary">Browse Services</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
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
      gives: '2 hours of cooking classes',
      gets: '2 hours of gardening help'
    },
    {
      icon: '👩‍🏫',
      title: 'Dr. Emily the Teacher',
      description: 'A retired teacher who wants tech support',
      gives: '4 hours of tutoring',
      gets: '4 hours of computer help'
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
}
