/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      email
      username
      firstName
      lastName
      bankHours
      skills
      bio
      profilePicture
      rating
      totalTransactions
      createdAt
      updatedAt
    }
  }
`;

export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      email
      username
      firstName
      lastName
      bankHours
      skills
      bio
      profilePicture
      rating
      totalTransactions
      createdAt
      updatedAt
    }
  }
`;

export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      email
      username
      firstName
      lastName
      bankHours
      skills
      bio
      profilePicture
      rating
      totalTransactions
      createdAt
      updatedAt
    }
  }
`;

export const createService = /* GraphQL */ `
  mutation CreateService(
    $input: CreateServiceInput!
    $condition: ModelServiceConditionInput
  ) {
    createService(input: $input, condition: $condition) {
      id
      userId
      title
      description
      category
      hourlyRate
      tags
      requiresScheduling
      minBookingHours
      maxBookingHours
      advanceBookingDays
      cancellationHours
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const updateService = /* GraphQL */ `
  mutation UpdateService(
    $input: UpdateServiceInput!
    $condition: ModelServiceConditionInput
  ) {
    updateService(input: $input, condition: $condition) {
      id
      userId
      title
      description
      category
      hourlyRate
      tags
      requiresScheduling
      minBookingHours
      maxBookingHours
      advanceBookingDays
      cancellationHours
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const deleteService = /* GraphQL */ `
  mutation DeleteService(
    $input: DeleteServiceInput!
    $condition: ModelServiceConditionInput
  ) {
    deleteService(input: $input, condition: $condition) {
      id
      userId
      title
      description
      category
      hourlyRate
      tags
      requiresScheduling
      minBookingHours
      maxBookingHours
      advanceBookingDays
      cancellationHours
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const createTransaction = /* GraphQL */ `
  mutation CreateTransaction(
    $input: CreateTransactionInput!
    $condition: ModelTransactionConditionInput
  ) {
    createTransaction(input: $input, condition: $condition) {
      id
      providerId
      consumerId
      serviceId
      bookingId
      hoursSpent
      status
      description
      rating
      feedback
      createdAt
      updatedAt
    }
  }
`;

export const updateTransaction = /* GraphQL */ `
  mutation UpdateTransaction(
    $input: UpdateTransactionInput!
    $condition: ModelTransactionConditionInput
  ) {
    updateTransaction(input: $input, condition: $condition) {
      id
      providerId
      consumerId
      serviceId
      bookingId
      hoursSpent
      status
      description
      rating
      feedback
      createdAt
      updatedAt
    }
  }
`;

export const deleteTransaction = /* GraphQL */ `
  mutation DeleteTransaction(
    $input: DeleteTransactionInput!
    $condition: ModelTransactionConditionInput
  ) {
    deleteTransaction(input: $input, condition: $condition) {
      id
      providerId
      consumerId
      serviceId
      bookingId
      hoursSpent
      status
      description
      rating
      feedback
      createdAt
      updatedAt
    }
  }
`;

export const createBooking = /* GraphQL */ `
  mutation CreateBooking(
    $input: CreateBookingInput!
    $condition: ModelBookingConditionInput
  ) {
    createBooking(input: $input, condition: $condition) {
      id
      providerId
      consumerId
      serviceId
      bookingDate
      startTime
      endTime
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

export const updateBooking = /* GraphQL */ `
  mutation UpdateBooking(
    $input: UpdateBookingInput!
    $condition: ModelBookingConditionInput
  ) {
    updateBooking(input: $input, condition: $condition) {
      id
      providerId
      consumerId
      serviceId
      bookingDate
      startTime
      endTime
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

export const deleteBooking = /* GraphQL */ `
  mutation DeleteBooking(
    $input: DeleteBookingInput!
    $condition: ModelBookingConditionInput
  ) {
    deleteBooking(input: $input, condition: $condition) {
      id
      providerId
      consumerId
      serviceId
      bookingDate
      startTime
      endTime
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

export const createServiceSchedule = /* GraphQL */ `
  mutation CreateServiceSchedule(
    $input: CreateServiceScheduleInput!
    $condition: ModelServiceScheduleConditionInput
  ) {
    createServiceSchedule(input: $input, condition: $condition) {
      id
      userId
      serviceId
      dayOfWeek
      startTime
      endTime
      isAvailable
      createdAt
      updatedAt
    }
  }
`;

export const updateServiceSchedule = /* GraphQL */ `
  mutation UpdateServiceSchedule(
    $input: UpdateServiceScheduleInput!
    $condition: ModelServiceScheduleConditionInput
  ) {
    updateServiceSchedule(input: $input, condition: $condition) {
      id
      userId
      serviceId
      dayOfWeek
      startTime
      endTime
      isAvailable
      createdAt
      updatedAt
    }
  }
`;

export const deleteServiceSchedule = /* GraphQL */ `
  mutation DeleteServiceSchedule(
    $input: DeleteServiceScheduleInput!
    $condition: ModelServiceScheduleConditionInput
  ) {
    deleteServiceSchedule(input: $input, condition: $condition) {
      id
      userId
      serviceId
      dayOfWeek
      startTime
      endTime
      isAvailable
      createdAt
      updatedAt
    }
  }
`;

export const createScheduleException = /* GraphQL */ `
  mutation CreateScheduleException(
    $input: CreateScheduleExceptionInput!
    $condition: ModelScheduleExceptionConditionInput
  ) {
    createScheduleException(input: $input, condition: $condition) {
      id
      userId
      date
      startTime
      endTime
      isAvailable
      reason
      createdAt
      updatedAt
    }
  }
`;

export const updateScheduleException = /* GraphQL */ `
  mutation UpdateScheduleException(
    $input: UpdateScheduleExceptionInput!
    $condition: ModelScheduleExceptionConditionInput
  ) {
    updateScheduleException(input: $input, condition: $condition) {
      id
      userId
      date
      startTime
      endTime
      isAvailable
      reason
      createdAt
      updatedAt
    }
  }
`;

export const deleteScheduleException = /* GraphQL */ `
  mutation DeleteScheduleException(
    $input: DeleteScheduleExceptionInput!
    $condition: ModelScheduleExceptionConditionInput
  ) {
    deleteScheduleException(input: $input, condition: $condition) {
      id
      userId
      date
      startTime
      endTime
      isAvailable
      reason
      createdAt
      updatedAt
    }
  }
`;

export const createRating = /* GraphQL */ `
  mutation CreateRating(
    $input: CreateRatingInput!
    $condition: ModelRatingConditionInput
  ) {
    createRating(input: $input, condition: $condition) {
      id
      raterId
      ratedUserId
      transactionId
      rating
      comment
      category
      createdAt
      updatedAt
    }
  }
`;

export const updateRating = /* GraphQL */ `
  mutation UpdateRating(
    $input: UpdateRatingInput!
    $condition: ModelRatingConditionInput
  ) {
    updateRating(input: $input, condition: $condition) {
      id
      raterId
      ratedUserId
      transactionId
      rating
      comment
      category
      createdAt
      updatedAt
    }
  }
`;

export const deleteRating = /* GraphQL */ `
  mutation DeleteRating(
    $input: DeleteRatingInput!
    $condition: ModelRatingConditionInput
  ) {
    deleteRating(input: $input, condition: $condition) {
      id
      raterId
      ratedUserId
      transactionId
      rating
      comment
      category
      createdAt
      updatedAt
    }
  }
`;

export const createNotification = /* GraphQL */ `
  mutation CreateNotification(
    $input: CreateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    createNotification(input: $input, condition: $condition) {
      id
      userId
      title
      message
      type
      isRead
      relatedId
      createdAt
      updatedAt
    }
  }
`;

export const updateNotification = /* GraphQL */ `
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    updateNotification(input: $input, condition: $condition) {
      id
      userId
      title
      message
      type
      isRead
      relatedId
      createdAt
      updatedAt
    }
  }
`;

export const deleteNotification = /* GraphQL */ `
  mutation DeleteNotification(
    $input: DeleteNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    deleteNotification(input: $input, condition: $condition) {
      id
      userId
      title
      message
      type
      isRead
      relatedId
      createdAt
      updatedAt
    }
  }
`;
