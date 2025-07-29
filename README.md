# HourBank - Skill Exchange Platform

HourBank is an Angular application where individuals can exchange skills and services using a time-based currency system. Service providers accumulate bank-hours while consumers spend bank-hours to access services.

## 🌟 Vision & Mission

**Vision**: Create equitable communities where everyone's time has equal value, fostering mutual aid and social connection.

**Mission**: Build a platform that democratizes access to services by using time as currency, ensuring that a lawyer's hour equals a gardener's hour in community value.

## 🚀 Business Model

HourBank operates on a **freemium community model** where the core time-banking system remains completely free, while premium features and business services generate sustainable revenue.

### Core Value Propositions
- **For Users**: Free, equitable access to community services using time as currency
- **For Communities**: Stronger social connections and reduced inequality
- **For Businesses**: Employee engagement and corporate social responsibility tools
- **For Investors**: Scalable SaaS model with strong network effects and social impact

**📊 Revenue Projections**: $1M ARR at 100K users → $14M ARR at 1M users → $80M ARR at 5M users

*See [BUSINESS_MODEL.md](./BUSINESS_MODEL.md) for detailed monetization strategy and financial projections.*

## Features

- **Time-Based Currency**: Exchange services using hours as currency
- **User Authentication**: Secure sign-up and sign-in with AWS Amplify
- **Service Marketplace**: Browse and request available services
- **Profile Management**: Manage personal information and offered services
- **Transaction History**: Track all service exchanges and ratings
- **Rating System**: Rate completed services and build reputation
- **Advanced Scheduling**: Book time slots and manage availability
- **Real-time Messaging**: Communicate with service providers and consumers
- **Mobile Support**: Full-featured iOS and Android applications

## Technology Stack

- **Frontend**: Angular 19 with TypeScript
- **Mobile**: Ionic with Capacitor for iOS/Android
- **Styling**: SCSS with custom design system
- **Authentication**: AWS Amplify Auth (Cognito)
- **Backend**: AWS Amplify with GraphQL API
- **Database**: DynamoDB with 13 optimized tables
- **Real-time**: GraphQL Subscriptions
- **Hosting**: AWS Amplify Hosting with CI/CD
- **State Management**: RxJS Observables

## 📋 Documentation

Comprehensive documentation is organized in the [`docs/`](./docs/) folder:

### Quick Links
- **💼 For Investors**: [Investor Pitch](./docs/business/INVESTOR_PITCH.md) | [Business Model](./docs/business/BUSINESS_MODEL.md)
- **👩‍💻 For Developers**: [Implementation Guide](./docs/technical/IMPLEMENTATION_GUIDE.md) | [Database Schema](./docs/technical/DYNAMODB_TABLES_ANALYSIS.md)
- **🎯 For Presentations**: [Presentation Guide](./docs/guides/PRESENTATION_GUIDE.md)
- **📊 Complete Index**: [All Documentation](./docs/README.md)

### Documentation Categories
- **[Business](./docs/business/)** - Business model, market analysis, investor materials
- **[Technical](./docs/technical/)** - Architecture, database design, implementation guides
- **[Guides](./docs/guides/)** - Presentation materials and quick references
- **[Legal](./docs/legal/)** - Privacy policies and compliance documentation
- **[Development](./docs/development/)** - Testing, simulation, and development tools

## Database Schema

### Core Tables (3)
- **User** (11 fields) - User profiles and account information
- **Service** (13 fields) - Services offered by users
- **Transaction** (11 fields) - Service exchange records

### Scheduling Tables (3)
- **Booking** (16 fields) - Time slot reservations
- **ServiceSchedule** (7 fields) - Service availability schedules
- **ScheduleException** (8 fields) - Schedule modifications

### Social & Communication Tables (4)
- **Rating** (7 fields) - User ratings and reviews
- **Message** (7 fields) - Direct messages between users
- **Conversation** (5 fields) - Message threads
- **Notification** (7 fields) - System notifications

### Metadata & Moderation Tables (3)
- **Category** (6 fields) - Service categories
- **Skill** (5 fields) - Predefined skill definitions
- **Report** (9 fields) - User reports for moderation

**Total**: 13 tables with 34 relationships mapped through GraphQL

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/           # Authentication component
│   │   ├── dashboard/      # Main dashboard
│   │   ├── profile/        # User profile management
│   │   ├── services/       # Service management
│   │   ├── transactions/   # Transaction handling
│   │   ├── booking/        # Scheduling system
│   │   └── messaging/      # Communication features
│   ├── services/
│   │   ├── auth.service.ts      # Authentication service
│   │   ├── user.service.ts      # User management
│   │   ├── service.service.ts   # Service management
│   │   ├── transaction.service.ts # Transaction handling
│   │   ├── booking.service.ts   # Scheduling service
│   │   └── messaging.service.ts # Real-time messaging
│   ├── models/
│   │   └── *.model.ts      # TypeScript interfaces for all data models
│   └── app.routes.ts       # Application routing
├── styles.scss             # Global styles
└── amplifyconfiguration.json # AWS Amplify configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- AWS Account (for deployment)
- AWS CLI configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hourbank-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## AWS Amplify Setup

### 1. Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

### 2. Configure Amplify

```bash
amplify configure
```

### 3. Initialize Amplify Project

```bash
amplify init
```

Follow the prompts:
- Project name: `hourbank-app`
- Environment: `dev`
- Default editor: Your preferred editor
- App type: `javascript`
- Framework: `angular`
- Source directory: `src`
- Distribution directory: `dist/hourbank-app`
- Build command: `npm run build`
- Start command: `ng serve`

### 4. Add Authentication

```bash
amplify add auth
```

Choose the following options:
- Default configuration
- Username
- Email (for sign-in)
- No advanced settings

### 5. Add API (Optional - for backend data)

```bash
amplify add api
```

Choose:
- GraphQL
- Authorization modes: Amazon Cognito User Pool

### 6. Deploy Backend

```bash
amplify push
```

### 7. Add Hosting

```bash
amplify add hosting
```

Choose:
- Amazon CloudFront and S3
- DEV (S3 only with HTTP)

### 8. Publish Application

```bash
amplify publish
```

## Configuration

### Update Amplify Configuration

After running `amplify push`, update the `src/amplifyconfiguration.json` file with the generated configuration values.

### Environment Variables

Create environment-specific configurations in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## Usage

### User Registration
1. Navigate to the authentication page
2. Click "Sign Up"
3. Fill in email, username, and password
4. Verify email address
5. Sign in with credentials

### Offering Services
1. Go to Profile page
2. Click "Add Service"
3. Fill in service details:
   - Title and description
   - Category and hourly rate
   - Tags for discoverability
4. Save the service

### Requesting Services
1. Browse available services on Dashboard
2. Click "Request Service" on desired service
3. Service provider will receive notification
4. Provider can accept and start work

### Managing Transactions
1. View all transactions in Transactions page
2. Update transaction status (Provider)
3. Rate completed services (Consumer)
4. Track bank hours balance

## Development

### Running Tests

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

### Building for Production

```bash
ng build --prod
```

### Code Formatting

```bash
# Format code
ng lint --fix
```

## Deployment Options

### Option 1: AWS Amplify Hosting (Recommended)

```bash
amplify add hosting
amplify publish
```

### Option 2: Manual S3 + CloudFront

1. Build the application:
   ```bash
   ng build --prod
   ```

2. Upload `dist/` contents to S3 bucket

3. Configure CloudFront distribution

4. Update DNS records

### Option 3: Other Hosting Providers

The built application in `dist/` folder can be deployed to:
- Netlify
- Vercel
- Firebase Hosting
- GitHub Pages

## Features Roadmap

- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Service categories and subcategories
- [ ] Payment integration for premium features
- [ ] Mobile application
- [ ] Admin dashboard
- [ ] Dispute resolution system
- [ ] Service scheduling and calendar integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- All authentication handled by AWS Cognito
- Input validation on all forms
- XSS protection with Angular's built-in sanitization
- HTTPS enforced in production
- Regular dependency updates

## Performance Optimization

- Lazy loading for route modules
- OnPush change detection strategy
- Image optimization
- Bundle size optimization
- CDN for static assets

## Troubleshooting

### Common Issues

1. **Amplify CLI not found**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Authentication errors**
   - Check `amplifyconfiguration.json` values
   - Verify AWS Cognito setup
   - Clear browser cache

3. **Build errors**
   - Update Node.js version
   - Clear node_modules and reinstall
   - Check TypeScript compatibility

### Getting Help

- Check the [Angular Documentation](https://angular.io/docs)
- Review [AWS Amplify Documentation](https://docs.amplify.aws/)
- Open an issue in the repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Angular team for the amazing framework
- AWS Amplify team for seamless cloud integration
- Community contributors and testers
