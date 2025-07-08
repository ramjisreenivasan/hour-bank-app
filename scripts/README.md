# HourBank Utility Scripts

This directory contains utility scripts for managing HourBank data and simulating user actions.

## Available Scripts

### `add-sample-services.js`

Adds sample services for a specific user, simulating the UI action of creating services through the profile page.

#### Usage

```bash
# Add services for Ramji (default user ID)
npm run add-services:ramji

# Add services for a specific user ID
npm run add-services [userId]

# Or run directly
node scripts/add-sample-services.js [userId]
```

#### Default Services Created

The script creates 6 sample services for the user:

1. **Web Development & Angular Consulting** (8 hours)
   - Full-stack development, architecture, code reviews
   - Tags: angular, typescript, aws, web-development, consulting, full-stack

2. **AWS Cloud Architecture & Deployment** (10 hours)
   - Cloud solutions, Amplify setup, serverless, DevOps
   - Tags: aws, cloud, amplify, serverless, devops, architecture

3. **Programming Tutoring (JavaScript/TypeScript)** (5 hours)
   - One-on-one tutoring for beginners to intermediate
   - Tags: tutoring, javascript, typescript, programming, mentoring, education

4. **Code Review & Technical Mentoring** (6 hours)
   - Professional code review and technical guidance
   - Tags: code-review, mentoring, best-practices, architecture, quality-assurance

5. **Database Design & Optimization** (7 hours)
   - Schema design, query optimization, data modeling
   - Tags: database, sql, nosql, graphql, optimization, data-modeling

6. **API Development & Integration** (8 hours)
   - REST/GraphQL APIs, integrations, authentication
   - Tags: api, rest, graphql, integration, nodejs, serverless

#### Features

- ✅ **User Verification**: Checks if the target user exists before creating services
- ✅ **Error Handling**: Comprehensive error reporting with detailed messages
- ✅ **Progress Tracking**: Shows progress and summary of created services
- ✅ **Rate Limiting**: Adds delays between requests to avoid API limits
- ✅ **Detailed Logging**: Provides detailed output for debugging

#### Prerequisites

- AWS Amplify must be configured (`amplifyconfiguration.json`)
- User must exist in the DynamoDB Users table
- GraphQL API must be accessible

#### Example Output

```
🏦 HourBank Service Creation Utility
=====================================
Target User ID: 6438e458-e0f1-700c-cdd1-e15a4cecd6e5
Timestamp: 2025-07-07T21:00:00.000Z

🔍 Verifying user exists: 6438e458-e0f1-700c-cdd1-e15a4cecd6e5
✅ User found: Ramji Sreenivasan (ramji_dev)
   Email: ramji@example.com
   Bank Hours: 25
   Rating: 5

🔧 Creating services...

[1/6] Processing service...
📝 Creating service: "Web Development & Angular Consulting"
✅ Service created successfully:
   ID: abc123-def456-ghi789
   Title: Web Development & Angular Consulting
   Category: Technology
   Rate: 8 hours
   Tags: angular, typescript, aws, web-development, consulting, full-stack
   Active: true

...

📈 SUMMARY
============================================================
✅ Successfully created: 6 services
❌ Failed to create: 0 services
📊 Total processed: 6 services

🎉 Services have been added for user Ramji!
💡 You can now view these services in the dashboard or profile page.

✨ Script completed successfully!
```

#### Error Handling

The script handles various error scenarios:

- **User Not Found**: Exits gracefully if the target user doesn't exist
- **GraphQL Errors**: Reports detailed GraphQL error messages
- **Network Issues**: Handles connection and timeout errors
- **Validation Errors**: Reports field validation issues

#### Customization

To add different services, modify the `sampleServices` array in the script:

```javascript
const sampleServices = [
  {
    title: "Your Service Title",
    description: "Detailed description of your service...",
    category: "Technology", // or Education, Creative, etc.
    hourlyRate: 5, // in bank hours
    isActive: true,
    tags: ["tag1", "tag2", "tag3"]
  }
  // ... more services
];
```

#### Troubleshooting

1. **"User not found"**: Verify the user ID exists in DynamoDB
2. **"GraphQL errors"**: Check Amplify configuration and API permissions
3. **"Module not found"**: Run `npm install` to install dependencies
4. **"Permission denied"**: Ensure the script has execute permissions

## Contributing

When adding new utility scripts:

1. Follow the same error handling patterns
2. Add comprehensive logging
3. Update this README with usage instructions
4. Add npm script entries in `package.json`
