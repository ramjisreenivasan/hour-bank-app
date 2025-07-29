# Step Functions Integration with Amplify
## Deployment Strategies and Implementation Guide

This document outlines different approaches to deploy AWS Step Functions alongside your existing Amplify setup for the HourBank project.

---

## Deployment Options Overview

### Option 1: Amplify Custom Resources (Recommended)
- **Integration**: Native Amplify integration
- **Deployment**: Single `amplify push` command
- **Management**: Unified with existing Amplify stack
- **Complexity**: Medium
- **Best For**: Maintaining unified deployment pipeline

### Option 2: Amplify + SAM/CDK Hybrid
- **Integration**: Separate but coordinated deployment
- **Deployment**: Amplify + separate SAM/CDK deploy
- **Management**: Two separate stacks
- **Complexity**: High
- **Best For**: Complex Step Functions with advanced features

### Option 3: Full Migration to SAM/CDK
- **Integration**: Complete infrastructure as code
- **Deployment**: Single SAM/CDK deployment
- **Management**: Full control over all resources
- **Complexity**: Very High
- **Best For**: Teams preferring full IaC control

---

## Recommended Approach: Amplify Custom Resources

### Why This Approach?
- ✅ **Unified Deployment**: Single `amplify push` deploys everything
- ✅ **Existing Integration**: Works with your current Amplify setup
- ✅ **Shared Resources**: Easy access to existing DynamoDB tables, Lambda functions
- ✅ **Environment Management**: Automatic dev/staging/prod environments
- ✅ **Team Familiarity**: Leverages existing Amplify knowledge

---

## Implementation: Amplify Custom Resources

### Step 1: Create Custom Resource Structure

```bash
# In your amplify/backend directory
mkdir -p custom/stepfunctions
cd custom/stepfunctions
```

### Step 2: Create CloudFormation Template

Create `amplify/backend/custom/stepfunctions/stepfunctions-template.json`:

```json
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "HourBank Step Functions Workflows",
  "Parameters": {
    "env": {
      "Type": "String",
      "Description": "Environment name"
    },
    "ServiceRequestTableName": {
      "Type": "String",
      "Description": "ServiceRequest DynamoDB table name"
    },
    "EscrowTableName": {
      "Type": "String",
      "Description": "Escrow DynamoDB table name"
    },
    "UserBalanceTableName": {
      "Type": "String",
      "Description": "UserBalance DynamoDB table name"
    },
    "TransactionLogTableName": {
      "Type": "String",
      "Description": "TransactionLog DynamoDB table name"
    }
  },
  "Resources": {
    "StepFunctionsExecutionRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "RoleName": {
          "Fn::Sub": "HourBankStepFunctionsRole-${env}"
        },
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "states.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Policies": [
          {
            "PolicyName": "StepFunctionsExecutionPolicy",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Action": [
                    "lambda:InvokeFunction"
                  ],
                  "Resource": {
                    "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:*hourbank*"
                  }
                },
                {
                  "Effect": "Allow",
                  "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:Query",
                    "dynamodb:Scan"
                  ],
                  "Resource": [
                    {
                      "Fn::Sub": "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${ServiceRequestTableName}"
                    },
                    {
                      "Fn::Sub": "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${EscrowTableName}"
                    },
                    {
                      "Fn::Sub": "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${UserBalanceTableName}"
                    },
                    {
                      "Fn::Sub": "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${TransactionLogTableName}"
                    }
                  ]
                },
                {
                  "Effect": "Allow",
                  "Action": [
                    "events:PutEvents"
                  ],
                  "Resource": {
                    "Fn::Sub": "arn:aws:events:${AWS::Region}:${AWS::AccountId}:event-bus/hourbank-event-bus-${env}"
                  }
                }
              ]
            }
          }
        ]
      }
    },
    "ServiceRequestWorkflow": {
      "Type": "AWS::StepFunctions::StateMachine",
      "Properties": {
        "StateMachineName": {
          "Fn::Sub": "ServiceRequestWorkflow-${env}"
        },
        "RoleArn": {
          "Fn::GetAtt": ["StepFunctionsExecutionRole", "Arn"]
        },
        "DefinitionString": {
          "Fn::Sub": [
            "{\"Comment\":\"Service Request Workflow\",\"StartAt\":\"ValidateRequest\",\"States\":{\"ValidateRequest\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-validateServiceRequest-${env}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Catch\":[{\"ErrorEquals\":[\"States.ALL\"],\"Next\":\"RejectRequest\",\"ResultPath\":\"$.error\"}],\"Next\":\"EscrowHours\"},\"EscrowHours\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-createEscrow-${env}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Catch\":[{\"ErrorEquals\":[\"States.ALL\"],\"Next\":\"RejectRequest\",\"ResultPath\":\"$.error\"}],\"Next\":\"NotifyProvider\"},\"NotifyProvider\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-notifyProvider-${env}\",\"Next\":\"WaitForProviderResponse\"},\"WaitForProviderResponse\":{\"Type\":\"Wait\",\"SecondsPath\":\"$.providerResponseTimeoutSeconds\",\"Next\":\"CheckProviderResponse\"},\"CheckProviderResponse\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.providerResponse\",\"StringEquals\":\"ACCEPTED\",\"Next\":\"StartServiceExecution\"},{\"Variable\":\"$.providerResponse\",\"StringEquals\":\"REJECTED\",\"Next\":\"RefundEscrow\"},{\"Variable\":\"$.providerResponse\",\"StringEquals\":\"COUNTER_OFFER\",\"Next\":\"ProcessNegotiation\"}],\"Default\":\"TimeoutRequest\"},\"StartServiceExecution\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-startServiceExecution-${env}\",\"End\":true},\"ProcessNegotiation\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-processNegotiation-${env}\",\"End\":true},\"RefundEscrow\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-refundEscrow-${env}\",\"End\":true},\"TimeoutRequest\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-timeoutRequest-${env}\",\"End\":true},\"RejectRequest\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-rejectRequest-${env}\",\"End\":true}}}",
            {}
          ]
        }
      }
    },
    "EscrowManagementWorkflow": {
      "Type": "AWS::StepFunctions::StateMachine",
      "Properties": {
        "StateMachineName": {
          "Fn::Sub": "EscrowManagementWorkflow-${env}"
        },
        "RoleArn": {
          "Fn::GetAtt": ["StepFunctionsExecutionRole", "Arn"]
        },
        "DefinitionString": {
          "Fn::Sub": [
            "{\"Comment\":\"Escrow Management Workflow\",\"StartAt\":\"ValidateEscrowRelease\",\"States\":{\"ValidateEscrowRelease\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-validateEscrowRelease-${env}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Next\":\"ProcessEscrowRelease\"},\"ProcessEscrowRelease\":{\"Type\":\"Task\",\"Resource\":\"arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:hourbank-processEscrowRelease-${env}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":5,\"MaxAttempts\":5,\"BackoffRate\":2.0}],\"End\":true}}}",
            {}
          ]
        }
      }
    }
  },
  "Outputs": {
    "ServiceRequestWorkflowArn": {
      "Description": "Service Request Workflow ARN",
      "Value": {
        "Ref": "ServiceRequestWorkflow"
      }
    },
    "EscrowManagementWorkflowArn": {
      "Description": "Escrow Management Workflow ARN", 
      "Value": {
        "Ref": "EscrowManagementWorkflow"
      }
    },
    "StepFunctionsExecutionRoleArn": {
      "Description": "Step Functions Execution Role ARN",
      "Value": {
        "Fn::GetAtt": ["StepFunctionsExecutionRole", "Arn"]
      }
    }
  }
}
```

### Step 3: Create Parameters File

Create `amplify/backend/custom/stepfunctions/parameters.json`:

```json
{
  "ServiceRequestTableName": {
    "Ref": "ServiceRequestTable"
  },
  "EscrowTableName": {
    "Ref": "EscrowTable"
  },
  "UserBalanceTableName": {
    "Ref": "UserBalanceTable"
  },
  "TransactionLogTableName": {
    "Ref": "TransactionLogTable"
  }
}
```

### Step 4: Add Custom Resource to Amplify

```bash
amplify add custom
```

When prompted:
- **Resource name**: `stepfunctions`
- **CloudFormation template**: Select the template you created
- **Parameters**: Use the parameters file

### Step 5: Update Lambda Functions for Step Functions Integration

Create Lambda functions that will be called by Step Functions:

```bash
amplify add function
```

Example Lambda function structure:

```typescript
// amplify/backend/function/hourbankValidateServiceRequest/src/index.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event: any) => {
  try {
    const { requestId, serviceId, requesterId, providerId, estimatedHours } = event;
    
    // Validate user balance
    const userBalance = await docClient.send(new GetCommand({
      TableName: process.env.USER_BALANCE_TABLE_NAME,
      Key: { userId: requesterId }
    }));
    
    if (!userBalance.Item || userBalance.Item.availableBalance < estimatedHours) {
      return {
        statusCode: 400,
        validationResult: 'FAILED',
        failureReason: 'INSUFFICIENT_BALANCE'
      };
    }
    
    // Update ServiceRequest status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: requestId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'VALIDATING',
        ':updatedAt': new Date().toISOString()
      }
    }));
    
    return {
      statusCode: 200,
      validationResult: 'PASSED',
      requestId,
      estimatedHours
    };
    
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
};
```

### Step 6: Environment Variables Configuration

Update your Lambda function's environment variables to include table names:

```json
{
  "SERVICE_REQUEST_TABLE_NAME": {
    "Ref": "ServiceRequestTable"
  },
  "ESCROW_TABLE_NAME": {
    "Ref": "EscrowTable"
  },
  "USER_BALANCE_TABLE_NAME": {
    "Ref": "UserBalanceTable"
  },
  "TRANSACTION_LOG_TABLE_NAME": {
    "Ref": "TransactionLogTable"
  }
}
```

### Step 7: Deploy Everything

```bash
amplify push
```

This single command will:
- Deploy your GraphQL API with new tables
- Deploy Lambda functions
- Deploy Step Functions state machines
- Set up all IAM roles and permissions
- Configure environment variables

---

## Frontend Integration

### Step 1: Install AWS SDK

```bash
npm install @aws-sdk/client-sfn
```

### Step 2: Create Step Functions Service

```typescript
// src/app/services/step-functions.service.ts
import { Injectable } from '@angular/core';
import { SFNClient, StartExecutionCommand, DescribeExecutionCommand } from '@aws-sdk/client-sfn';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class StepFunctionsService {
  private sfnClient: SFNClient;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    const credentials = await Auth.currentCredentials();
    this.sfnClient = new SFNClient({
      region: 'us-east-1', // Your region
      credentials: Auth.essentialCredentials(credentials)
    });
  }

  async startServiceRequestWorkflow(input: any): Promise<string> {
    const command = new StartExecutionCommand({
      stateMachineArn: 'arn:aws:states:region:account:stateMachine:ServiceRequestWorkflow-dev',
      input: JSON.stringify(input),
      name: `service-request-${Date.now()}`
    });

    const result = await this.sfnClient.send(command);
    return result.executionArn!;
  }

  async getExecutionStatus(executionArn: string) {
    const command = new DescribeExecutionCommand({
      executionArn
    });

    return await this.sfnClient.send(command);
  }
}
```

### Step 3: Update Service Request Component

```typescript
// src/app/components/service-request/service-request.component.ts
import { Component } from '@angular/core';
import { StepFunctionsService } from '../../services/step-functions.service';
import { GraphQLService } from '../../services/graphql.service';

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html'
})
export class ServiceRequestComponent {
  
  constructor(
    private stepFunctionsService: StepFunctionsService,
    private graphqlService: GraphQLService
  ) {}

  async submitServiceRequest(requestData: any) {
    try {
      // 1. Create ServiceRequest record via GraphQL
      const serviceRequest = await this.graphqlService.createServiceRequest(requestData);
      
      // 2. Start Step Functions workflow
      const executionArn = await this.stepFunctionsService.startServiceRequestWorkflow({
        requestId: serviceRequest.id,
        ...requestData
      });
      
      // 3. Update ServiceRequest with execution ARN
      await this.graphqlService.updateServiceRequest({
        id: serviceRequest.id,
        stepFunctionExecutionArn: executionArn
      });
      
      // 4. Monitor workflow progress
      this.monitorWorkflowProgress(executionArn);
      
    } catch (error) {
      console.error('Error submitting service request:', error);
    }
  }

  private async monitorWorkflowProgress(executionArn: string) {
    const checkStatus = async () => {
      const status = await this.stepFunctionsService.getExecutionStatus(executionArn);
      
      if (status.status === 'RUNNING') {
        setTimeout(checkStatus, 5000); // Check again in 5 seconds
      } else {
        console.log('Workflow completed:', status.status);
        // Handle completion or failure
      }
    };
    
    checkStatus();
  }
}
```

---

## Environment Management

### Development Environment
```bash
amplify env add dev
amplify push
```

### Staging Environment
```bash
amplify env add staging
amplify push
```

### Production Environment
```bash
amplify env add prod
amplify push
```

Each environment gets its own:
- Step Functions state machines
- Lambda functions
- DynamoDB tables
- IAM roles

---

## Monitoring and Debugging

### CloudWatch Integration
Amplify automatically sets up CloudWatch logging for:
- Step Functions executions
- Lambda function logs
- DynamoDB metrics

### Step Functions Console
Access via AWS Console:
1. Go to Step Functions service
2. Find your state machines (named with environment suffix)
3. View execution history and debug workflows visually

### Amplify Console Integration
- View deployment status
- Monitor function performance
- Access CloudWatch logs directly

---

## Alternative: Separate SAM Deployment

If you prefer more control over Step Functions, you can use SAM alongside Amplify:

### SAM Template Structure
```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  Environment:
    Type: String
    Default: dev
  
  # Import Amplify resources
  ServiceRequestTableName:
    Type: String
  EscrowTableName:
    Type: String

Resources:
  ServiceRequestWorkflow:
    Type: AWS::Serverless::StateMachine
    Properties:
      Name: !Sub ServiceRequestWorkflow-${Environment}
      DefinitionUri: workflows/service-request.asl.json
      Role: !GetAtt StepFunctionsRole.Arn
      
  StepFunctionsRole:
    Type: AWS::IAM::Role
    Properties:
      # Role definition...
```

### Deployment Commands
```bash
# Deploy Amplify first
amplify push

# Then deploy SAM
sam build
sam deploy --parameter-overrides \
  Environment=dev \
  ServiceRequestTableName=$(aws cloudformation describe-stacks --stack-name amplify-hourbank-dev --query 'Stacks[0].Outputs[?OutputKey==`ServiceRequestTableName`].OutputValue' --output text)
```

---

## Recommendation Summary

### ✅ **Use Amplify Custom Resources** for HourBank because:

1. **Unified Deployment**: Single `amplify push` command
2. **Environment Consistency**: Automatic dev/staging/prod environments
3. **Resource Sharing**: Easy access to existing DynamoDB tables and Lambda functions
4. **Team Efficiency**: Leverages existing Amplify knowledge
5. **Maintenance**: Single deployment pipeline to maintain

### 📋 **Implementation Steps**:
1. Add Step Functions as Amplify custom resources
2. Create Lambda functions for workflow steps
3. Update frontend to integrate with Step Functions
4. Deploy with `amplify push`
5. Monitor via AWS Console and Amplify Console

This approach gives you the best of both worlds: the power and reliability of Step Functions with the simplicity and integration of Amplify deployment.
