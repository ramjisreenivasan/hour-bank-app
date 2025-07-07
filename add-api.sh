#!/bin/bash

# Create a temporary file with responses
cat > /tmp/api_responses.txt << EOF
GraphQL
Continue

7
EOF

# Run amplify add api with responses
cd /home/awsramji/projects/hourbank/hourbank-app
amplify add api < /tmp/api_responses.txt

# Clean up
rm /tmp/api_responses.txt
