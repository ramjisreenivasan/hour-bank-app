import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'service_request' | 'system';
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
  };
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-container">
      <!-- Conversations List -->
      <div class="conversations-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Messages</h2>
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              [(ngModel)]="searchTerm"
              class="search-input"
            >
          </div>
        </div>

        <div class="conversations-list">
          <div 
            *ngFor="let conversation of filteredConversations" 
            class="conversation-item"
            [class.active]="selectedConversation?.id === conversation.id"
            (click)="selectConversation(conversation)"
          >
            <div class="conversation-avatar">{{ conversation.otherUser.avatar }}</div>
            <div class="conversation-content">
              <div class="conversation-header">
                <span class="conversation-name">{{ conversation.otherUser.name }}</span>
                <span class="conversation-time">{{ formatTime(conversation.lastMessage.timestamp) }}</span>
              </div>
              <div class="conversation-preview">
                <span class="last-message" [class.unread]="conversation.unreadCount > 0">
                  {{ conversation.lastMessage.content }}
                </span>
                <span *ngIf="conversation.unreadCount > 0" class="unread-badge">
                  {{ conversation.unreadCount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="conversations.length === 0" class="empty-conversations">
          <div class="empty-icon">💬</div>
          <h3>No Messages Yet</h3>
          <p>Start a conversation by requesting a service or contacting a provider</p>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <div *ngIf="selectedConversation" class="chat-container">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-user-info">
              <div class="chat-avatar">{{ selectedConversation.otherUser.avatar }}</div>
              <div class="chat-user-details">
                <h3 class="chat-user-name">{{ selectedConversation.otherUser.name }}</h3>
                <span class="chat-user-status">Active now</span>
              </div>
            </div>
            <div class="chat-actions">
              <button class="btn btn-sm btn-secondary">View Profile</button>
            </div>
          </div>

          <!-- Messages List -->
          <div class="messages-list" #messagesList>
            <div 
              *ngFor="let message of selectedConversation.messages" 
              class="message"
              [class.sent]="message.senderId === currentUserId"
              [class.received]="message.senderId !== currentUserId"
            >
              <div class="message-content">
                <div class="message-bubble">
                  <p class="message-text">{{ message.content }}</p>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Typing Indicator -->
            <div *ngIf="isTyping && selectedConversation" class="message received typing-message">
              <div class="message-content">
                <div class="message-bubble typing-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="typing-text">{{ typingUser }} is typing...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <form class="message-form" (ngSubmit)="sendMessage()">
              <div class="input-group">
                <input 
                  type="text" 
                  [(ngModel)]="newMessage" 
                  name="message"
                  placeholder="Type your message..."
                  class="message-input"
                  [disabled]="isSending"
                >
                <button 
                  type="submit" 
                  class="send-button"
                  [disabled]="!newMessage.trim() || isSending"
                >
                  <span *ngIf="!isSending">Send</span>
                  <span *ngIf="isSending">...</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- No Conversation Selected -->
        <div *ngIf="!selectedConversation" class="no-conversation">
          <div class="no-conversation-content">
            <div class="no-conversation-icon">💬</div>
            <h3>Select a Conversation</h3>
            <p>Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  searchTerm = '';
  newMessage = '';
  isSending = false;
  isTyping = false;
  typingUser = '';
  currentUserId = 'current-user-id'; // In real app, get from auth service

  ngOnInit() {
    this.loadConversations();
  }

  loadConversations() {
    // Mock data - in real app, fetch from GraphQL API
    this.conversations = [
      {
        id: '1',
        otherUser: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: '👩‍🎨'
        },
        lastMessage: {
          id: 'msg-1',
          senderId: 'user-1',
          receiverId: this.currentUserId,
          content: 'Thanks for the great web development work! The site looks amazing.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          isRead: false,
          messageType: 'text'
        },
        unreadCount: 2,
        messages: [
          {
            id: 'msg-1a',
            senderId: this.currentUserId,
            receiverId: 'user-1',
            content: 'Hi Sarah! I saw your graphic design service. I need help with a logo for my new project.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-1b',
            senderId: 'user-1',
            receiverId: this.currentUserId,
            content: 'Hi! I\'d be happy to help with your logo design. Can you tell me more about your project?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-1c',
            senderId: this.currentUserId,
            receiverId: 'user-1',
            content: 'It\'s a tech startup focused on sustainable energy solutions. Looking for something modern and clean.',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-1',
            senderId: 'user-1',
            receiverId: this.currentUserId,
            content: 'Thanks for the great web development work! The site looks amazing.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            isRead: false,
            messageType: 'text'
          }
        ]
      },
      {
        id: '2',
        otherUser: {
          id: 'user-2',
          name: 'Mike Rodriguez',
          avatar: '👨‍🍳'
        },
        lastMessage: {
          id: 'msg-2',
          senderId: this.currentUserId,
          receiverId: 'user-2',
          content: 'What time works best for the cooking lesson?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          isRead: true,
          messageType: 'text'
        },
        unreadCount: 0,
        messages: [
          {
            id: 'msg-2a',
            senderId: 'user-2',
            receiverId: this.currentUserId,
            content: 'Hi! I saw you\'re interested in cooking lessons. I specialize in Mediterranean cuisine.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-2',
            senderId: this.currentUserId,
            receiverId: 'user-2',
            content: 'What time works best for the cooking lesson?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            isRead: true,
            messageType: 'text'
          }
        ]
      },
      {
        id: '3',
        otherUser: {
          id: 'user-3',
          name: 'Emma Thompson',
          avatar: '👩‍💼'
        },
        lastMessage: {
          id: 'msg-3',
          senderId: 'user-3',
          receiverId: this.currentUserId,
          content: 'I can help you with your business plan. When can we start?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          isRead: false,
          messageType: 'text'
        },
        unreadCount: 1,
        messages: [
          {
            id: 'msg-3a',
            senderId: this.currentUserId,
            receiverId: 'user-3',
            content: 'Hi Emma! I need help creating a business plan for my startup. Do you have experience with tech companies?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-3',
            senderId: 'user-3',
            receiverId: this.currentUserId,
            content: 'I can help you with your business plan. When can we start?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            isRead: false,
            messageType: 'text'
          }
        ]
      },
      {
        id: '4',
        otherUser: {
          id: 'user-4',
          name: 'David Kim',
          avatar: '👨‍💻'
        },
        lastMessage: {
          id: 'msg-4',
          senderId: 'user-4',
          receiverId: this.currentUserId,
          content: 'The Python tutorial was excellent! Thank you so much.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          isRead: true,
          messageType: 'text'
        },
        unreadCount: 0,
        messages: [
          {
            id: 'msg-4a',
            senderId: 'user-4',
            receiverId: this.currentUserId,
            content: 'Hi! I\'m interested in learning Python programming. Can you help me get started?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-4b',
            senderId: this.currentUserId,
            receiverId: 'user-4',
            content: 'Absolutely! I\'d be happy to help you learn Python. What\'s your programming background?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-4c',
            senderId: 'user-4',
            receiverId: this.currentUserId,
            content: 'I\'m completely new to programming but very eager to learn!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-4',
            senderId: 'user-4',
            receiverId: this.currentUserId,
            content: 'The Python tutorial was excellent! Thank you so much.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            isRead: true,
            messageType: 'text'
          }
        ]
      },
      {
        id: '5',
        otherUser: {
          id: 'user-5',
          name: 'Lisa Park',
          avatar: '👩‍🏫'
        },
        lastMessage: {
          id: 'msg-5',
          senderId: this.currentUserId,
          receiverId: 'user-5',
          content: 'I\'d love to learn Spanish! What\'s your teaching approach?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          isRead: true,
          messageType: 'text'
        },
        unreadCount: 0,
        messages: [
          {
            id: 'msg-5a',
            senderId: 'user-5',
            receiverId: this.currentUserId,
            content: '¡Hola! I offer Spanish language tutoring. Are you interested in conversational or business Spanish?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
            isRead: true,
            messageType: 'text'
          },
          {
            id: 'msg-5',
            senderId: this.currentUserId,
            receiverId: 'user-5',
            content: 'I\'d love to learn Spanish! What\'s your teaching approach?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            isRead: true,
            messageType: 'text'
          }
        ]
      }
    ];

    this.filteredConversations = [...this.conversations];
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    // Mark messages as read
    conversation.unreadCount = 0;
    conversation.messages.forEach(msg => {
      if (msg.receiverId === this.currentUserId) {
        msg.isRead = true;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation || this.isSending) {
      return;
    }

    this.isSending = true;

    const message: Message = {
      id: Date.now().toString(),
      senderId: this.currentUserId,
      receiverId: this.selectedConversation.otherUser.id,
      content: this.newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'text'
    };

    // Add message to conversation
    this.selectedConversation.messages.push(message);
    this.selectedConversation.lastMessage = message;

    // Store the message content for generating response
    const userMessage = this.newMessage.trim();

    // Clear input
    this.newMessage = '';
    this.isSending = false;

    // Generate mock response after a delay
    this.generateMockResponse(userMessage, this.selectedConversation);

    // In real app, send via API
    console.log('Message sent:', message);
  }

  private generateMockResponse(userMessage: string, conversation: Conversation) {
    // Show typing indicator immediately
    if (this.selectedConversation?.id === conversation.id) {
      this.isTyping = true;
      this.typingUser = conversation.otherUser.name;
    }
    
    // Wait 1-3 seconds before responding
    const delay = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
      // Hide typing indicator
      this.isTyping = false;
      this.typingUser = '';
      
      const response = this.getMockResponse(userMessage, conversation.otherUser.name);
      
      const mockMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        senderId: conversation.otherUser.id,
        receiverId: this.currentUserId,
        content: response,
        timestamp: new Date().toISOString(),
        isRead: false,
        messageType: 'text'
      };

      conversation.messages.push(mockMessage);
      conversation.lastMessage = mockMessage;
      conversation.unreadCount++;

      // If this conversation is currently selected, mark as read
      if (this.selectedConversation?.id === conversation.id) {
        mockMessage.isRead = true;
        conversation.unreadCount = 0;
      }
    }, delay);
  }

  private getMockResponse(userMessage: string, senderName: string): string {
    const message = userMessage.toLowerCase();
    
    // Service-related responses
    if (message.includes('service') || message.includes('help') || message.includes('need')) {
      const serviceResponses = [
        "I'd be happy to help! Can you tell me more about what you need?",
        "That sounds like something I can definitely assist with. What's your timeline?",
        "Great! I have experience with that. When would you like to get started?",
        "I'd love to work on this project with you. What's your budget in hours?",
        "Perfect! I can help you with that. Let me know your specific requirements."
      ];
      return serviceResponses[Math.floor(Math.random() * serviceResponses.length)];
    }

    // Time/scheduling responses
    if (message.includes('time') || message.includes('when') || message.includes('schedule')) {
      const timeResponses = [
        "I'm available most weekdays after 2 PM. What works best for you?",
        "How about we schedule something for next week? I have Tuesday and Thursday open.",
        "I'm flexible with timing. When would be most convenient for you?",
        "Let me check my calendar and get back to you with some options.",
        "I can work around your schedule. What time zone are you in?"
      ];
      return timeResponses[Math.floor(Math.random() * timeResponses.length)];
    }

    // Price/cost responses
    if (message.includes('cost') || message.includes('price') || message.includes('hour') || message.includes('rate')) {
      const priceResponses = [
        "My rate is 25 hours for this type of project. Does that work for you?",
        "For something like this, I typically charge 15-20 hours depending on complexity.",
        "Let me break down the costs for you based on your requirements.",
        "I offer competitive rates. Can you share more details so I can give you an accurate quote?",
        "The cost depends on the scope. Would you like to discuss the details?"
      ];
      return priceResponses[Math.floor(Math.random() * priceResponses.length)];
    }

    // Thank you responses
    if (message.includes('thank') || message.includes('thanks')) {
      const thankResponses = [
        "You're very welcome! Happy to help anytime.",
        "My pleasure! Let me know if you need anything else.",
        "Glad I could help! Feel free to reach out if you have more questions.",
        "No problem at all! That's what the community is for.",
        "You're welcome! Looking forward to working together."
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }

    // Greeting responses
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      const greetingResponses = [
        `Hi there! Great to hear from you. How can I help?`,
        `Hello! Thanks for reaching out. What can I do for you?`,
        `Hey! Nice to connect. What brings you here today?`,
        `Hi! I saw your message. How can I assist you?`,
        `Hello! Hope you're having a great day. What's up?`
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }

    // Question responses
    if (message.includes('?')) {
      const questionResponses = [
        "That's a great question! Let me think about the best way to approach this.",
        "Good point! I have some ideas that might work for your situation.",
        "Interesting question! Based on my experience, I'd suggest...",
        "I'm glad you asked! There are a few different ways we could handle this.",
        "That depends on a few factors. Can you give me more context?"
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }

    // Default responses
    const defaultResponses = [
      "That sounds interesting! Tell me more about it.",
      "I see what you mean. Let me know how I can help.",
      "Thanks for sharing that with me. What would you like to do next?",
      "I understand. How would you like to proceed?",
      "Got it! What's the next step you'd like to take?",
      "That makes sense. I'm here to help however I can.",
      "Absolutely! I'm excited to work on this with you.",
      "I appreciate you reaching out. Let's make this happen!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  ngOnChanges() {
    this.filterConversations();
  }

  filterConversations() {
    if (!this.searchTerm.trim()) {
      this.filteredConversations = [...this.conversations];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredConversations = this.conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(term) ||
        conv.lastMessage.content.toLowerCase().includes(term)
      );
    }
  }
}
