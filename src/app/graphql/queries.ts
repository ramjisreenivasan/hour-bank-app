/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
      nextToken
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
      nextToken
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
      nextToken
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
      nextToken
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
      nextToken
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
      nextToken
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
      createdAt
      updatedAt
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
        updatedAt
      }
      nextToken
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
        updatedAt
      }
      nextToken
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
        updatedAt
      }
      nextToken
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
        updatedAt
      }
      nextToken
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
        updatedAt
      }
      nextToken
    }
  }
`;

export const getBooking = /* GraphQL */ `
  query GetBooking($id: ID!) {
    getBooking(id: $id) {
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

export const listBookings = /* GraphQL */ `
  query ListBookings(
    $filter: ModelBookingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBookings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
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
      nextToken
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
      nextToken
    }
  }
`;
