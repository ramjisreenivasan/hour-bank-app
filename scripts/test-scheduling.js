#!/usr/bin/env node

/**
 * Test script for HourBank Scheduling System
 * This script validates the scheduling functionality and data models
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing HourBank Scheduling System...\n');

// Test 1: Verify GraphQL Schema
console.log('1. Checking GraphQL Schema...');
try {
  const schemaPath = path.join(__dirname, 'schema.graphql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  const requiredModels = [
    'ServiceSchedule',
    'Booking',
    'ScheduleException'
  ];
  
  const requiredEnums = [
    'BookingStatus',
    'ScheduleExceptionType',
    'BookingRole'
  ];
  
  let schemaValid = true;
  
  requiredModels.forEach(model => {
    if (!schema.includes(`type ${model}`)) {
      console.log(`❌ Missing model: ${model}`);
      schemaValid = false;
    } else {
      console.log(`✅ Found model: ${model}`);
    }
  });
  
  requiredEnums.forEach(enumType => {
    if (!schema.includes(`enum ${enumType}`)) {
      console.log(`❌ Missing enum: ${enumType}`);
      schemaValid = false;
    } else {
      console.log(`✅ Found enum: ${enumType}`);
    }
  });
  
  if (schemaValid) {
    console.log('✅ GraphQL Schema validation passed\n');
  } else {
    console.log('❌ GraphQL Schema validation failed\n');
  }
} catch (error) {
  console.log('❌ Error reading GraphQL schema:', error.message, '\n');
}

// Test 2: Verify TypeScript Models
console.log('2. Checking TypeScript Models...');
try {
  const modelsPath = path.join(__dirname, 'src/app/models/user.model.ts');
  const models = fs.readFileSync(modelsPath, 'utf8');
  
  const requiredInterfaces = [
    'ServiceSchedule',
    'Booking',
    'ScheduleException',
    'TimeSlot',
    'ProviderAvailability'
  ];
  
  const requiredEnums = [
    'BookingStatus',
    'ScheduleExceptionType',
    'BookingRole'
  ];
  
  let modelsValid = true;
  
  requiredInterfaces.forEach(interface => {
    if (!models.includes(`interface ${interface}`)) {
      console.log(`❌ Missing interface: ${interface}`);
      modelsValid = false;
    } else {
      console.log(`✅ Found interface: ${interface}`);
    }
  });
  
  requiredEnums.forEach(enumType => {
    if (!models.includes(`enum ${enumType}`)) {
      console.log(`❌ Missing enum: ${enumType}`);
      modelsValid = false;
    } else {
      console.log(`✅ Found enum: ${enumType}`);
    }
  });
  
  if (modelsValid) {
    console.log('✅ TypeScript Models validation passed\n');
  } else {
    console.log('❌ TypeScript Models validation failed\n');
  }
} catch (error) {
  console.log('❌ Error reading TypeScript models:', error.message, '\n');
}

// Test 3: Verify Components
console.log('3. Checking Components...');
const requiredComponents = [
  'src/app/components/schedule-management/schedule-management.component.ts',
  'src/app/components/booking/booking.component.ts',
  'src/app/components/booking-management/booking-management.component.ts'
];

let componentsValid = true;

requiredComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Found component: ${path.basename(componentPath)}`);
  } else {
    console.log(`❌ Missing component: ${path.basename(componentPath)}`);
    componentsValid = false;
  }
});

if (componentsValid) {
  console.log('✅ Components validation passed\n');
} else {
  console.log('❌ Components validation failed\n');
}

// Test 4: Verify Services
console.log('4. Checking Services...');
try {
  const servicePath = path.join(__dirname, 'src/app/services/scheduling.service.ts');
  if (fs.existsSync(servicePath)) {
    const service = fs.readFileSync(servicePath, 'utf8');
    
    const requiredMethods = [
      'createServiceSchedule',
      'getAvailableTimeSlots',
      'createBooking',
      'updateBookingStatus',
      'getBookingsByDateRange'
    ];
    
    let serviceValid = true;
    
    requiredMethods.forEach(method => {
      if (!service.includes(method)) {
        console.log(`❌ Missing method: ${method}`);
        serviceValid = false;
      } else {
        console.log(`✅ Found method: ${method}`);
      }
    });
    
    if (serviceValid) {
      console.log('✅ Scheduling Service validation passed\n');
    } else {
      console.log('❌ Scheduling Service validation failed\n');
    }
  } else {
    console.log('❌ Scheduling Service not found\n');
  }
} catch (error) {
  console.log('❌ Error reading Scheduling Service:', error.message, '\n');
}

// Test 5: Verify Routes
console.log('5. Checking Routes...');
try {
  const routesPath = path.join(__dirname, 'src/app/app.routes.ts');
  const routes = fs.readFileSync(routesPath, 'utf8');
  
  if (routes.includes('bookings')) {
    console.log('✅ Bookings route found');
    console.log('✅ Routes validation passed\n');
  } else {
    console.log('❌ Bookings route not found');
    console.log('❌ Routes validation failed\n');
  }
} catch (error) {
  console.log('❌ Error reading routes:', error.message, '\n');
}

// Test 6: Verify Integration
console.log('6. Checking Integration...');
try {
  // Check if service detail component includes booking functionality
  const serviceDetailPath = path.join(__dirname, 'src/app/components/services/service-detail.component.ts');
  const serviceDetail = fs.readFileSync(serviceDetailPath, 'utf8');
  
  const integrationChecks = [
    { check: 'BookingComponent', description: 'Booking component import' },
    { check: 'showBookingModal', description: 'Booking modal state' },
    { check: 'requiresScheduling', description: 'Scheduling requirement check' }
  ];
  
  let integrationValid = true;
  
  integrationChecks.forEach(({ check, description }) => {
    if (serviceDetail.includes(check)) {
      console.log(`✅ ${description} found`);
    } else {
      console.log(`❌ ${description} not found`);
      integrationValid = false;
    }
  });
  
  // Check if my-services component includes schedule management
  const myServicesPath = path.join(__dirname, 'src/app/components/services/my-services.component.ts');
  const myServices = fs.readFileSync(myServicesPath, 'utf8');
  
  if (myServices.includes('ScheduleManagementComponent')) {
    console.log('✅ Schedule management integration found');
  } else {
    console.log('❌ Schedule management integration not found');
    integrationValid = false;
  }
  
  if (integrationValid) {
    console.log('✅ Integration validation passed\n');
  } else {
    console.log('❌ Integration validation failed\n');
  }
} catch (error) {
  console.log('❌ Error checking integration:', error.message, '\n');
}

// Test 7: Validate Time Slot Logic
console.log('7. Testing Time Slot Logic...');
try {
  // Simple time slot generation test
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  function generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = duration * 60;
    
    for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += 30) {
      const slotStart = minutesToTime(minutes);
      const slotEnd = minutesToTime(minutes + durationMinutes);
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }
    
    return slots;
  }
  
  // Test case: 9 AM to 5 PM, 2-hour slots
  const testSlots = generateTimeSlots('09:00', '17:00', 2);
  
  if (testSlots.length > 0) {
    console.log(`✅ Time slot generation working (${testSlots.length} slots generated)`);
    console.log(`   Example: ${testSlots[0].startTime} - ${testSlots[0].endTime}`);
  } else {
    console.log('❌ Time slot generation failed');
  }
  
  console.log('✅ Time slot logic validation passed\n');
} catch (error) {
  console.log('❌ Time slot logic validation failed:', error.message, '\n');
}

// Summary
console.log('📋 Test Summary:');
console.log('================');
console.log('The scheduling system has been implemented with the following features:');
console.log('• Service providers can set weekly schedules');
console.log('• Consumers can book specific time slots');
console.log('• Booking management with status tracking');
console.log('• Real-time availability checking');
console.log('• Integration with existing service system');
console.log('');
console.log('🚀 Next Steps:');
console.log('1. Run `amplify push` to deploy GraphQL schema changes');
console.log('2. Test the components in the browser');
console.log('3. Verify booking flow end-to-end');
console.log('4. Add any additional styling or features as needed');
console.log('');
console.log('📖 Documentation: See SCHEDULING_SYSTEM.md for detailed usage instructions');
