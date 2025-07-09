/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onTransactionUpdate = /* GraphQL */ `
  subscription OnTransactionUpdate($userId: ID!) {
    onTransactionUpdate(userId: $userId) {
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
export const onNewMessage = /* GraphQL */ `
  subscription OnNewMessage($userId: ID!) {
    onNewMessage(userId: $userId) {
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
export const onNewNotification = /* GraphQL */ `
  subscription OnNewNotification($userId: ID!) {
    onNewNotification(userId: $userId) {
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
export const onBookingUpdate = /* GraphQL */ `
  subscription OnBookingUpdate($userId: ID!) {
    onBookingUpdate(userId: $userId) {
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
export const onScheduleUpdate = /* GraphQL */ `
  subscription OnScheduleUpdate($serviceId: ID!) {
    onScheduleUpdate(serviceId: $serviceId) {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateService = /* GraphQL */ `
  subscription OnCreateService($filter: ModelSubscriptionServiceFilterInput) {
    onCreateService(filter: $filter) {
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
export const onUpdateService = /* GraphQL */ `
  subscription OnUpdateService($filter: ModelSubscriptionServiceFilterInput) {
    onUpdateService(filter: $filter) {
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
export const onDeleteService = /* GraphQL */ `
  subscription OnDeleteService($filter: ModelSubscriptionServiceFilterInput) {
    onDeleteService(filter: $filter) {
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
export const onCreateServiceSchedule = /* GraphQL */ `
  subscription OnCreateServiceSchedule(
    $filter: ModelSubscriptionServiceScheduleFilterInput
  ) {
    onCreateServiceSchedule(filter: $filter) {
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
export const onUpdateServiceSchedule = /* GraphQL */ `
  subscription OnUpdateServiceSchedule(
    $filter: ModelSubscriptionServiceScheduleFilterInput
  ) {
    onUpdateServiceSchedule(filter: $filter) {
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
export const onDeleteServiceSchedule = /* GraphQL */ `
  subscription OnDeleteServiceSchedule(
    $filter: ModelSubscriptionServiceScheduleFilterInput
  ) {
    onDeleteServiceSchedule(filter: $filter) {
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
export const onCreateBooking = /* GraphQL */ `
  subscription OnCreateBooking($filter: ModelSubscriptionBookingFilterInput) {
    onCreateBooking(filter: $filter) {
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
export const onUpdateBooking = /* GraphQL */ `
  subscription OnUpdateBooking($filter: ModelSubscriptionBookingFilterInput) {
    onUpdateBooking(filter: $filter) {
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
export const onDeleteBooking = /* GraphQL */ `
  subscription OnDeleteBooking($filter: ModelSubscriptionBookingFilterInput) {
    onDeleteBooking(filter: $filter) {
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
export const onCreateScheduleException = /* GraphQL */ `
  subscription OnCreateScheduleException(
    $filter: ModelSubscriptionScheduleExceptionFilterInput
  ) {
    onCreateScheduleException(filter: $filter) {
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
export const onUpdateScheduleException = /* GraphQL */ `
  subscription OnUpdateScheduleException(
    $filter: ModelSubscriptionScheduleExceptionFilterInput
  ) {
    onUpdateScheduleException(filter: $filter) {
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
export const onDeleteScheduleException = /* GraphQL */ `
  subscription OnDeleteScheduleException(
    $filter: ModelSubscriptionScheduleExceptionFilterInput
  ) {
    onDeleteScheduleException(filter: $filter) {
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
export const onCreateTransaction = /* GraphQL */ `
  subscription OnCreateTransaction(
    $filter: ModelSubscriptionTransactionFilterInput
  ) {
    onCreateTransaction(filter: $filter) {
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
export const onUpdateTransaction = /* GraphQL */ `
  subscription OnUpdateTransaction(
    $filter: ModelSubscriptionTransactionFilterInput
  ) {
    onUpdateTransaction(filter: $filter) {
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
export const onDeleteTransaction = /* GraphQL */ `
  subscription OnDeleteTransaction(
    $filter: ModelSubscriptionTransactionFilterInput
  ) {
    onDeleteTransaction(filter: $filter) {
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
export const onCreateCategory = /* GraphQL */ `
  subscription OnCreateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onCreateCategory(filter: $filter) {
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
export const onUpdateCategory = /* GraphQL */ `
  subscription OnUpdateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onUpdateCategory(filter: $filter) {
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
export const onDeleteCategory = /* GraphQL */ `
  subscription OnDeleteCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onDeleteCategory(filter: $filter) {
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
export const onCreateRating = /* GraphQL */ `
  subscription OnCreateRating($filter: ModelSubscriptionRatingFilterInput) {
    onCreateRating(filter: $filter) {
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
export const onUpdateRating = /* GraphQL */ `
  subscription OnUpdateRating($filter: ModelSubscriptionRatingFilterInput) {
    onUpdateRating(filter: $filter) {
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
export const onDeleteRating = /* GraphQL */ `
  subscription OnDeleteRating($filter: ModelSubscriptionRatingFilterInput) {
    onDeleteRating(filter: $filter) {
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
export const onCreateNotification = /* GraphQL */ `
  subscription OnCreateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
  ) {
    onCreateNotification(filter: $filter) {
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
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
  ) {
    onUpdateNotification(filter: $filter) {
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
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $filter: ModelSubscriptionNotificationFilterInput
  ) {
    onDeleteNotification(filter: $filter) {
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
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onCreateMessage(filter: $filter) {
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
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onUpdateMessage(filter: $filter) {
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
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage($filter: ModelSubscriptionMessageFilterInput) {
    onDeleteMessage(filter: $filter) {
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
export const onCreateConversation = /* GraphQL */ `
  subscription OnCreateConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onCreateConversation(filter: $filter) {
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
export const onUpdateConversation = /* GraphQL */ `
  subscription OnUpdateConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onUpdateConversation(filter: $filter) {
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
export const onDeleteConversation = /* GraphQL */ `
  subscription OnDeleteConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onDeleteConversation(filter: $filter) {
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
export const onCreateSkill = /* GraphQL */ `
  subscription OnCreateSkill($filter: ModelSubscriptionSkillFilterInput) {
    onCreateSkill(filter: $filter) {
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
export const onUpdateSkill = /* GraphQL */ `
  subscription OnUpdateSkill($filter: ModelSubscriptionSkillFilterInput) {
    onUpdateSkill(filter: $filter) {
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
export const onDeleteSkill = /* GraphQL */ `
  subscription OnDeleteSkill($filter: ModelSubscriptionSkillFilterInput) {
    onDeleteSkill(filter: $filter) {
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
export const onCreateReport = /* GraphQL */ `
  subscription OnCreateReport($filter: ModelSubscriptionReportFilterInput) {
    onCreateReport(filter: $filter) {
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
export const onUpdateReport = /* GraphQL */ `
  subscription OnUpdateReport($filter: ModelSubscriptionReportFilterInput) {
    onUpdateReport(filter: $filter) {
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
export const onDeleteReport = /* GraphQL */ `
  subscription OnDeleteReport($filter: ModelSubscriptionReportFilterInput) {
    onDeleteReport(filter: $filter) {
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
