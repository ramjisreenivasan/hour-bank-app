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
      cognitoId
      firstName
      lastName
      bankHours
      skills
      bio
      profilePicture
      rating
      totalTransactions
      services {
        nextToken
        __typename
      }
      providedTransactions {
        nextToken
        __typename
      }
      consumedTransactions {
        nextToken
        __typename
      }
      givenRatings {
        nextToken
        __typename
      }
      receivedRatings {
        nextToken
        __typename
      }
      notifications {
        nextToken
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
      conversationsAsUser1 {
        nextToken
        __typename
      }
      conversationsAsUser2 {
        nextToken
        __typename
      }
      reportsMade {
        nextToken
        __typename
      }
      reportsReceived {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      providedBookings {
        nextToken
        __typename
      }
      consumedBookings {
        nextToken
        __typename
      }
      scheduleExceptions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      cognitoId
      firstName
      lastName
      bankHours
      skills
      bio
      profilePicture
      rating
      totalTransactions
      services {
        nextToken
        __typename
      }
      providedTransactions {
        nextToken
        __typename
      }
      consumedTransactions {
        nextToken
        __typename
      }
      givenRatings {
        nextToken
        __typename
      }
      receivedRatings {
        nextToken
        __typename
      }
      notifications {
        nextToken
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
      conversationsAsUser1 {
        nextToken
        __typename
      }
      conversationsAsUser2 {
        nextToken
        __typename
      }
      reportsMade {
        nextToken
        __typename
      }
      reportsReceived {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      providedBookings {
        nextToken
        __typename
      }
      consumedBookings {
        nextToken
        __typename
      }
      scheduleExceptions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      cognitoId
      firstName
      lastName
      bankHours
      skills
      bio
      profilePicture
      rating
      totalTransactions
      services {
        nextToken
        __typename
      }
      providedTransactions {
        nextToken
        __typename
      }
      consumedTransactions {
        nextToken
        __typename
      }
      givenRatings {
        nextToken
        __typename
      }
      receivedRatings {
        nextToken
        __typename
      }
      notifications {
        nextToken
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
      conversationsAsUser1 {
        nextToken
        __typename
      }
      conversationsAsUser2 {
        nextToken
        __typename
      }
      reportsMade {
        nextToken
        __typename
      }
      reportsReceived {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      providedBookings {
        nextToken
        __typename
      }
      consumedBookings {
        nextToken
        __typename
      }
      scheduleExceptions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      hourlyDuration
      isActive
      tags
      requiresScheduling
      minBookingHours
      maxBookingHours
      advanceBookingDays
      cancellationHours
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transactions {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      bookings {
        nextToken
        __typename
      }
      scheduleExceptions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      hourlyDuration
      isActive
      tags
      requiresScheduling
      minBookingHours
      maxBookingHours
      advanceBookingDays
      cancellationHours
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transactions {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      bookings {
        nextToken
        __typename
      }
      scheduleExceptions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      hourlyDuration
      isActive
      tags
      requiresScheduling
      minBookingHours
      maxBookingHours
      advanceBookingDays
      cancellationHours
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transactions {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      bookings {
        nextToken
        __typename
      }
      scheduleExceptions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      serviceId
      userId
      dayOfWeek
      startTime
      endTime
      isActive
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      serviceId
      userId
      dayOfWeek
      startTime
      endTime
      isActive
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      serviceId
      userId
      dayOfWeek
      startTime
      endTime
      isActive
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      serviceId
      providerId
      consumerId
      bookingDate
      startTime
      endTime
      duration
      totalCost
      status
      notes
      providerNotes
      cancellationReason
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      provider {
        id
        email
        username
        cognitoId
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
        __typename
      }
      consumer {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      createdAt
      confirmedAt
      cancelledAt
      completedAt
      updatedAt
      bookingTransactionId
      __typename
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
      serviceId
      providerId
      consumerId
      bookingDate
      startTime
      endTime
      duration
      totalCost
      status
      notes
      providerNotes
      cancellationReason
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      provider {
        id
        email
        username
        cognitoId
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
        __typename
      }
      consumer {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      createdAt
      confirmedAt
      cancelledAt
      completedAt
      updatedAt
      bookingTransactionId
      __typename
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
      serviceId
      providerId
      consumerId
      bookingDate
      startTime
      endTime
      duration
      totalCost
      status
      notes
      providerNotes
      cancellationReason
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      provider {
        id
        email
        username
        cognitoId
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
        __typename
      }
      consumer {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      createdAt
      confirmedAt
      cancelledAt
      completedAt
      updatedAt
      bookingTransactionId
      __typename
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
      serviceId
      userId
      exceptionDate
      exceptionType
      startTime
      endTime
      reason
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      serviceId
      userId
      exceptionDate
      exceptionType
      startTime
      endTime
      reason
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      serviceId
      userId
      exceptionDate
      exceptionType
      startTime
      endTime
      reason
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      provider {
        id
        email
        username
        cognitoId
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
        __typename
      }
      consumer {
        id
        email
        username
        cognitoId
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
        __typename
      }
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      booking {
        id
        serviceId
        providerId
        consumerId
        bookingDate
        startTime
        endTime
        duration
        totalCost
        status
        notes
        providerNotes
        cancellationReason
        createdAt
        confirmedAt
        cancelledAt
        completedAt
        updatedAt
        bookingTransactionId
        __typename
      }
      ratings {
        nextToken
        __typename
      }
      reports {
        nextToken
        __typename
      }
      createdAt
      completedAt
      updatedAt
      __typename
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
      provider {
        id
        email
        username
        cognitoId
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
        __typename
      }
      consumer {
        id
        email
        username
        cognitoId
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
        __typename
      }
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      booking {
        id
        serviceId
        providerId
        consumerId
        bookingDate
        startTime
        endTime
        duration
        totalCost
        status
        notes
        providerNotes
        cancellationReason
        createdAt
        confirmedAt
        cancelledAt
        completedAt
        updatedAt
        bookingTransactionId
        __typename
      }
      ratings {
        nextToken
        __typename
      }
      reports {
        nextToken
        __typename
      }
      createdAt
      completedAt
      updatedAt
      __typename
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
      provider {
        id
        email
        username
        cognitoId
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
        __typename
      }
      consumer {
        id
        email
        username
        cognitoId
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
        __typename
      }
      service {
        id
        userId
        title
        description
        category
        hourlyDuration
        isActive
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
        __typename
      }
      booking {
        id
        serviceId
        providerId
        consumerId
        bookingDate
        startTime
        endTime
        duration
        totalCost
        status
        notes
        providerNotes
        cancellationReason
        createdAt
        confirmedAt
        cancelledAt
        completedAt
        updatedAt
        bookingTransactionId
        __typename
      }
      ratings {
        nextToken
        __typename
      }
      reports {
        nextToken
        __typename
      }
      createdAt
      completedAt
      updatedAt
      __typename
    }
  }
`;
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
    $input: CreateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    createCategory(input: $input, condition: $condition) {
      id
      name
      description
      icon
      color
      isActive
      services {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $input: UpdateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    updateCategory(input: $input, condition: $condition) {
      id
      name
      description
      icon
      color
      isActive
      services {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory(
    $input: DeleteCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    deleteCategory(input: $input, condition: $condition) {
      id
      name
      description
      icon
      color
      isActive
      services {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      transactionId
      raterId
      ratedUserId
      rating
      feedback
      categories
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      rater {
        id
        email
        username
        cognitoId
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
        __typename
      }
      ratedUser {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      transactionId
      raterId
      ratedUserId
      rating
      feedback
      categories
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      rater {
        id
        email
        username
        cognitoId
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
        __typename
      }
      ratedUser {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      transactionId
      raterId
      ratedUserId
      rating
      feedback
      categories
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      rater {
        id
        email
        username
        cognitoId
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
        __typename
      }
      ratedUser {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      type
      title
      message
      isRead
      relatedId
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      type
      title
      message
      isRead
      relatedId
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
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
      type
      title
      message
      isRead
      relatedId
      user {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      senderId
      receiverId
      conversationId
      content
      isRead
      messageType
      sender {
        id
        email
        username
        cognitoId
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
        __typename
      }
      receiver {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
      id
      senderId
      receiverId
      conversationId
      content
      isRead
      messageType
      sender {
        id
        email
        username
        cognitoId
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
        __typename
      }
      receiver {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
      id
      senderId
      receiverId
      conversationId
      content
      isRead
      messageType
      sender {
        id
        email
        username
        cognitoId
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
        __typename
      }
      receiver {
        id
        email
        username
        cognitoId
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
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createConversation = /* GraphQL */ `
  mutation CreateConversation(
    $input: CreateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    createConversation(input: $input, condition: $condition) {
      id
      user1Id
      user2Id
      lastMessageId
      lastMessageAt
      user1 {
        id
        email
        username
        cognitoId
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
        __typename
      }
      user2 {
        id
        email
        username
        cognitoId
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
        __typename
      }
      messages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation(
    $input: UpdateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    updateConversation(input: $input, condition: $condition) {
      id
      user1Id
      user2Id
      lastMessageId
      lastMessageAt
      user1 {
        id
        email
        username
        cognitoId
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
        __typename
      }
      user2 {
        id
        email
        username
        cognitoId
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
        __typename
      }
      messages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteConversation = /* GraphQL */ `
  mutation DeleteConversation(
    $input: DeleteConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    deleteConversation(input: $input, condition: $condition) {
      id
      user1Id
      user2Id
      lastMessageId
      lastMessageAt
      user1 {
        id
        email
        username
        cognitoId
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
        __typename
      }
      user2 {
        id
        email
        username
        cognitoId
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
        __typename
      }
      messages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSkill = /* GraphQL */ `
  mutation CreateSkill(
    $input: CreateSkillInput!
    $condition: ModelSkillConditionInput
  ) {
    createSkill(input: $input, condition: $condition) {
      id
      name
      category
      description
      isActive
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSkill = /* GraphQL */ `
  mutation UpdateSkill(
    $input: UpdateSkillInput!
    $condition: ModelSkillConditionInput
  ) {
    updateSkill(input: $input, condition: $condition) {
      id
      name
      category
      description
      isActive
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSkill = /* GraphQL */ `
  mutation DeleteSkill(
    $input: DeleteSkillInput!
    $condition: ModelSkillConditionInput
  ) {
    deleteSkill(input: $input, condition: $condition) {
      id
      name
      category
      description
      isActive
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createReport = /* GraphQL */ `
  mutation CreateReport(
    $input: CreateReportInput!
    $condition: ModelReportConditionInput
  ) {
    createReport(input: $input, condition: $condition) {
      id
      reporterId
      reportedUserId
      transactionId
      reason
      description
      status
      adminNotes
      reporter {
        id
        email
        username
        cognitoId
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
        __typename
      }
      reportedUser {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      createdAt
      resolvedAt
      updatedAt
      __typename
    }
  }
`;
export const updateReport = /* GraphQL */ `
  mutation UpdateReport(
    $input: UpdateReportInput!
    $condition: ModelReportConditionInput
  ) {
    updateReport(input: $input, condition: $condition) {
      id
      reporterId
      reportedUserId
      transactionId
      reason
      description
      status
      adminNotes
      reporter {
        id
        email
        username
        cognitoId
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
        __typename
      }
      reportedUser {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      createdAt
      resolvedAt
      updatedAt
      __typename
    }
  }
`;
export const deleteReport = /* GraphQL */ `
  mutation DeleteReport(
    $input: DeleteReportInput!
    $condition: ModelReportConditionInput
  ) {
    deleteReport(input: $input, condition: $condition) {
      id
      reporterId
      reportedUserId
      transactionId
      reason
      description
      status
      adminNotes
      reporter {
        id
        email
        username
        cognitoId
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
        __typename
      }
      reportedUser {
        id
        email
        username
        cognitoId
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
        __typename
      }
      transaction {
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
        completedAt
        updatedAt
        __typename
      }
      createdAt
      resolvedAt
      updatedAt
      __typename
    }
  }
`;
