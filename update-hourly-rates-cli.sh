#!/bin/bash

# HourBank Service Rate Updater using AWS CLI
# Updates all services to have hourly rate of 1

TABLE_NAME="Service-wcv2j2rh7bevbpun7acho3nium-dev"
NEW_HOURLY_RATE="1"
REGION="us-east-1"

echo "🏦 HourBank Service Rate Updater"
echo "================================"
echo "🔄 Starting to update all service hourly rates to \$${NEW_HOURLY_RATE}..."

# Get all service IDs and current rates
echo "📊 Scanning services..."
SERVICES=$(aws dynamodb scan \
    --table-name "$TABLE_NAME" \
    --projection-expression "id, title, hourlyRate" \
    --region "$REGION" \
    --output json)

# Extract service data
SERVICE_COUNT=$(echo "$SERVICES" | jq '.Items | length')
echo "📊 Found $SERVICE_COUNT services to update"

# Initialize counters
SUCCESS_COUNT=0
ERROR_COUNT=0

# Process each service
echo "$SERVICES" | jq -r '.Items[] | @base64' | while IFS= read -r service; do
    # Decode the service data
    SERVICE_DATA=$(echo "$service" | base64 --decode)
    
    # Extract values
    SERVICE_ID=$(echo "$SERVICE_DATA" | jq -r '.id.S')
    TITLE=$(echo "$SERVICE_DATA" | jq -r '.title.S')
    CURRENT_RATE=$(echo "$SERVICE_DATA" | jq -r '.hourlyRate.N')
    
    echo "🔧 Updating \"$TITLE\" (ID: $SERVICE_ID) from \$${CURRENT_RATE}/hr to \$${NEW_HOURLY_RATE}/hr"
    
    # Update the service
    UPDATE_RESULT=$(aws dynamodb update-item \
        --table-name "$TABLE_NAME" \
        --key "{\"id\": {\"S\": \"$SERVICE_ID\"}}" \
        --update-expression "SET hourlyRate = :newRate, updatedAt = :updatedAt" \
        --expression-attribute-values "{\":newRate\": {\"N\": \"$NEW_HOURLY_RATE\"}, \":updatedAt\": {\"S\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"}}" \
        --return-values "UPDATED_NEW" \
        --region "$REGION" \
        --output json 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully updated \"$TITLE\""
        ((SUCCESS_COUNT++))
    else
        echo "❌ Failed to update \"$TITLE\": $UPDATE_RESULT"
        ((ERROR_COUNT++))
    fi
done

# Wait for all background processes to complete
wait

echo ""
echo "📈 Update Summary:"
echo "✅ Successfully updated: $SUCCESS_COUNT services"
echo "❌ Failed to update: $ERROR_COUNT services"
echo "📊 Total services: $SERVICE_COUNT"

# Verification
echo ""
echo "🔍 Verifying updates..."
VERIFICATION=$(aws dynamodb scan \
    --table-name "$TABLE_NAME" \
    --projection-expression "id, title, hourlyRate" \
    --region "$REGION" \
    --output json)

CORRECT_COUNT=$(echo "$VERIFICATION" | jq --arg rate "$NEW_HOURLY_RATE" '[.Items[] | select(.hourlyRate.N == $rate)] | length')
TOTAL_COUNT=$(echo "$VERIFICATION" | jq '.Items | length')
INCORRECT_COUNT=$((TOTAL_COUNT - CORRECT_COUNT))

echo "📊 Verification Results:"
echo "✅ Services with correct rate (\$${NEW_HOURLY_RATE}/hr): $CORRECT_COUNT"
echo "❌ Services with incorrect rate: $INCORRECT_COUNT"

if [ $INCORRECT_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 All services are now correctly set to \$${NEW_HOURLY_RATE}/hour!"
else
    echo ""
    echo "⚠️  Some services still have incorrect rates:"
    echo "$VERIFICATION" | jq --arg rate "$NEW_HOURLY_RATE" -r '.Items[] | select(.hourlyRate.N != $rate) | "   - \(.title.S): $\(.hourlyRate.N)/hr"'
fi

echo ""
echo "✨ Update process completed!"
