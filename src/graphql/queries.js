/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const searchServices = /* GraphQL */ `
  query SearchServices(
    $query: String
    $category: String
    $minRating: Float
    $maxHourlyRate: Float
    $tags: [String]
    $isActive: Boolean
    $limit: Int
    $nextToken: String
  ) {
    searchServices(
      query: $query
      category: $category
      minRating: $minRating
      maxHourlyRate: $maxHourlyRate
      tags: $tags
      isActive: $isActive
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
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
      nextToken
      total
      __typename
    }
  }
`;
export const getUserStats = /* GraphQL */ `
  query GetUserStats($userId: ID!) {
    getUserStats(userId: $userId) {
      totalHoursProvided
      totalHoursConsumed
      averageRating
      totalRatings
      activeServices
      completedTransactions
      joinedDate
      __typename
    }
  }
`;
export const getTrendingServices = /* GraphQL */ `
  query GetTrendingServices($limit: Int) {
    getTrendingServices(limit: $limit) {
      id
      userId
      title
      description
      category
      hourlyRate
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
export const getRecommendedServices = /* GraphQL */ `
  query GetRecommendedServices($userId: ID!, $limit: Int) {
    getRecommendedServices(userId: $userId, limit: $limit) {
      id
      userId
      title
      description
      category
      hourlyRate
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
export const getAvailableTimeSlots = /* GraphQL */ `
  query GetAvailableTimeSlots(
    $serviceId: ID!
    $date: AWSDate!
    $duration: Float!
  ) {
    getAvailableTimeSlots(
      serviceId: $serviceId
      date: $date
      duration: $duration
    ) {
      startTime
      endTime
      isAvailable
      conflictReason
      __typename
    }
  }
`;
export const getProviderSchedule = /* GraphQL */ `
  query GetProviderSchedule(
    $providerId: ID!
    $startDate: AWSDate!
    $endDate: AWSDate!
  ) {
    getProviderSchedule(
      providerId: $providerId
      startDate: $startDate
      endDate: $endDate
    ) {
      date
      dayOfWeek
      schedules {
        id
        serviceId
        userId
        dayOfWeek
        startTime
        endTime
        isActive
        createdAt
        updatedAt
        __typename
      }
      exceptions {
        id
        serviceId
        userId
        exceptionDate
        exceptionType
        startTime
        endTime
        reason
        createdAt
        updatedAt
        __typename
      }
      bookings {
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
      isAvailable
      __typename
    }
  }
`;
export const getBookingsByDateRange = /* GraphQL */ `
  query GetBookingsByDateRange(
    $userId: ID!
    $startDate: AWSDate!
    $endDate: AWSDate!
    $role: BookingRole!
  ) {
    getBookingsByDateRange(
      userId: $userId
      startDate: $startDate
      endDate: $endDate
      role: $role
    ) {
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
        hourlyRate
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
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getService = /* GraphQL */ `
  query GetService($id: ID!) {
    getService(id: $id) {
      id
      userId
      title
      description
      category
      hourlyRate
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
export const listServices = /* GraphQL */ `
  query ListServices(
    $filter: ModelServiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listServices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
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
      nextToken
      __typename
    }
  }
`;
export const getServiceSchedule = /* GraphQL */ `
  query GetServiceSchedule($id: ID!) {
    getServiceSchedule(id: $id) {
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
        hourlyRate
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
export const listServiceSchedules = /* GraphQL */ `
  query ListServiceSchedules(
    $filter: ModelServiceScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listServiceSchedules(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        dayOfWeek
        startTime
        endTime
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBooking = /* GraphQL */ `
  query GetBooking($id: ID!) {
    getBooking(id: $id) {
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
        hourlyRate
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
export const listBookings = /* GraphQL */ `
  query ListBookings(
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBookings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getScheduleException = /* GraphQL */ `
  query GetScheduleException($id: ID!) {
    getScheduleException(id: $id) {
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
        hourlyRate
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
export const listScheduleExceptions = /* GraphQL */ `
  query ListScheduleExceptions(
    $filter: ModelScheduleExceptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listScheduleExceptions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        exceptionDate
        exceptionType
        startTime
        endTime
        reason
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTransaction = /* GraphQL */ `
  query GetTransaction($id: ID!) {
    getTransaction(id: $id) {
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
        hourlyRate
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
export const listTransactions = /* GraphQL */ `
  query ListTransactions(
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTransactions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
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
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        icon
        color
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getRating = /* GraphQL */ `
  query GetRating($id: ID!) {
    getRating(id: $id) {
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
export const listRatings = /* GraphQL */ `
  query ListRatings(
    $filter: ModelRatingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRatings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        transactionId
        raterId
        ratedUserId
        rating
        feedback
        categories
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getNotification = /* GraphQL */ `
  query GetNotification($id: ID!) {
    getNotification(id: $id) {
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
export const listNotifications = /* GraphQL */ `
  query ListNotifications(
    $filter: ModelNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        type
        title
        message
        isRead
        relatedId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
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
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        senderId
        receiverId
        conversationId
        content
        isRead
        messageType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getConversation = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
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
export const listConversations = /* GraphQL */ `
  query ListConversations(
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConversations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        user1Id
        user2Id
        lastMessageId
        lastMessageAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSkill = /* GraphQL */ `
  query GetSkill($id: ID!) {
    getSkill(id: $id) {
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
export const listSkills = /* GraphQL */ `
  query ListSkills(
    $filter: ModelSkillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSkills(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        description
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getReport = /* GraphQL */ `
  query GetReport($id: ID!) {
    getReport(id: $id) {
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
export const listReports = /* GraphQL */ `
  query ListReports(
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        reporterId
        reportedUserId
        transactionId
        reason
        description
        status
        adminNotes
        createdAt
        resolvedAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const usersByEmail = /* GraphQL */ `
  query UsersByEmail(
    $email: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const usersByUsername = /* GraphQL */ `
  query UsersByUsername(
    $username: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByUsername(
      username: $username
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const usersByCognitoId = /* GraphQL */ `
  query UsersByCognitoId(
    $cognitoId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByCognitoId(
      cognitoId: $cognitoId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const servicesByUserId = /* GraphQL */ `
  query ServicesByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelServiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    servicesByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
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
      nextToken
      __typename
    }
  }
`;
export const servicesByCategory = /* GraphQL */ `
  query ServicesByCategory(
    $category: String!
    $sortDirection: ModelSortDirection
    $filter: ModelServiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    servicesByCategory(
      category: $category
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
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
      nextToken
      __typename
    }
  }
`;
export const serviceSchedulesByServiceId = /* GraphQL */ `
  query ServiceSchedulesByServiceId(
    $serviceId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelServiceScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    serviceSchedulesByServiceId(
      serviceId: $serviceId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        dayOfWeek
        startTime
        endTime
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const serviceSchedulesByUserId = /* GraphQL */ `
  query ServiceSchedulesByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelServiceScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    serviceSchedulesByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        dayOfWeek
        startTime
        endTime
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const bookingsByServiceId = /* GraphQL */ `
  query BookingsByServiceId(
    $serviceId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    bookingsByServiceId(
      serviceId: $serviceId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const bookingsByProviderId = /* GraphQL */ `
  query BookingsByProviderId(
    $providerId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    bookingsByProviderId(
      providerId: $providerId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const bookingsByConsumerId = /* GraphQL */ `
  query BookingsByConsumerId(
    $consumerId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    bookingsByConsumerId(
      consumerId: $consumerId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const bookingsByBookingDate = /* GraphQL */ `
  query BookingsByBookingDate(
    $bookingDate: AWSDate!
    $sortDirection: ModelSortDirection
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    bookingsByBookingDate(
      bookingDate: $bookingDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const bookingsByStatus = /* GraphQL */ `
  query BookingsByStatus(
    $status: BookingStatus!
    $sortDirection: ModelSortDirection
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    bookingsByStatus(
      status: $status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const scheduleExceptionsByServiceId = /* GraphQL */ `
  query ScheduleExceptionsByServiceId(
    $serviceId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelScheduleExceptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    scheduleExceptionsByServiceId(
      serviceId: $serviceId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        exceptionDate
        exceptionType
        startTime
        endTime
        reason
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const scheduleExceptionsByUserId = /* GraphQL */ `
  query ScheduleExceptionsByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelScheduleExceptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    scheduleExceptionsByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        exceptionDate
        exceptionType
        startTime
        endTime
        reason
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const scheduleExceptionsByExceptionDate = /* GraphQL */ `
  query ScheduleExceptionsByExceptionDate(
    $exceptionDate: AWSDate!
    $sortDirection: ModelSortDirection
    $filter: ModelScheduleExceptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    scheduleExceptionsByExceptionDate(
      exceptionDate: $exceptionDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        serviceId
        userId
        exceptionDate
        exceptionType
        startTime
        endTime
        reason
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const transactionsByProviderId = /* GraphQL */ `
  query TransactionsByProviderId(
    $providerId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByProviderId(
      providerId: $providerId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const transactionsByConsumerId = /* GraphQL */ `
  query TransactionsByConsumerId(
    $consumerId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByConsumerId(
      consumerId: $consumerId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const transactionsByServiceId = /* GraphQL */ `
  query TransactionsByServiceId(
    $serviceId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByServiceId(
      serviceId: $serviceId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const transactionsByBookingId = /* GraphQL */ `
  query TransactionsByBookingId(
    $bookingId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByBookingId(
      bookingId: $bookingId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const transactionsByStatus = /* GraphQL */ `
  query TransactionsByStatus(
    $status: TransactionStatus!
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByStatus(
      status: $status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const categoriesByName = /* GraphQL */ `
  query CategoriesByName(
    $name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    categoriesByName(
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        description
        icon
        color
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ratingsByTransactionId = /* GraphQL */ `
  query RatingsByTransactionId(
    $transactionId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelRatingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ratingsByTransactionId(
      transactionId: $transactionId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        transactionId
        raterId
        ratedUserId
        rating
        feedback
        categories
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ratingsByRaterId = /* GraphQL */ `
  query RatingsByRaterId(
    $raterId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelRatingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ratingsByRaterId(
      raterId: $raterId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        transactionId
        raterId
        ratedUserId
        rating
        feedback
        categories
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ratingsByRatedUserId = /* GraphQL */ `
  query RatingsByRatedUserId(
    $ratedUserId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelRatingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ratingsByRatedUserId(
      ratedUserId: $ratedUserId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        transactionId
        raterId
        ratedUserId
        rating
        feedback
        categories
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const notificationsByUserId = /* GraphQL */ `
  query NotificationsByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    notificationsByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        type
        title
        message
        isRead
        relatedId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesBySenderId = /* GraphQL */ `
  query MessagesBySenderId(
    $senderId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesBySenderId(
      senderId: $senderId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderId
        receiverId
        conversationId
        content
        isRead
        messageType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByReceiverId = /* GraphQL */ `
  query MessagesByReceiverId(
    $receiverId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByReceiverId(
      receiverId: $receiverId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderId
        receiverId
        conversationId
        content
        isRead
        messageType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByConversationId = /* GraphQL */ `
  query MessagesByConversationId(
    $conversationId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByConversationId(
      conversationId: $conversationId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderId
        receiverId
        conversationId
        content
        isRead
        messageType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const conversationsByUser1Id = /* GraphQL */ `
  query ConversationsByUser1Id(
    $user1Id: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByUser1Id(
      user1Id: $user1Id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        user1Id
        user2Id
        lastMessageId
        lastMessageAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const conversationsByUser2Id = /* GraphQL */ `
  query ConversationsByUser2Id(
    $user2Id: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByUser2Id(
      user2Id: $user2Id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        user1Id
        user2Id
        lastMessageId
        lastMessageAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const skillsByName = /* GraphQL */ `
  query SkillsByName(
    $name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSkillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    skillsByName(
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        category
        description
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const skillsByCategory = /* GraphQL */ `
  query SkillsByCategory(
    $category: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSkillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    skillsByCategory(
      category: $category
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        category
        description
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const reportsByReporterId = /* GraphQL */ `
  query ReportsByReporterId(
    $reporterId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reportsByReporterId(
      reporterId: $reporterId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        reporterId
        reportedUserId
        transactionId
        reason
        description
        status
        adminNotes
        createdAt
        resolvedAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const reportsByReportedUserId = /* GraphQL */ `
  query ReportsByReportedUserId(
    $reportedUserId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reportsByReportedUserId(
      reportedUserId: $reportedUserId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        reporterId
        reportedUserId
        transactionId
        reason
        description
        status
        adminNotes
        createdAt
        resolvedAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const reportsByTransactionId = /* GraphQL */ `
  query ReportsByTransactionId(
    $transactionId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reportsByTransactionId(
      transactionId: $transactionId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        reporterId
        reportedUserId
        transactionId
        reason
        description
        status
        adminNotes
        createdAt
        resolvedAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const reportsByStatus = /* GraphQL */ `
  query ReportsByStatus(
    $status: ReportStatus!
    $sortDirection: ModelSortDirection
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reportsByStatus(
      status: $status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        reporterId
        reportedUserId
        transactionId
        reason
        description
        status
        adminNotes
        createdAt
        resolvedAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
