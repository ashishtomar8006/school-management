import { api } from '../client'
import type { ApiResponse } from '../types'

export interface MessageItem {
  id: string
  conversationId: string
  senderId: string
  content: string
  attachments: string[]
  isRead: boolean
  createdAt: string
  sender?: { id: string; name: string; avatar?: string }
}

export interface Conversation {
  id: string
  title?: string
  lastMessageAt?: string
  participants: { id: string; name: string; role: string; avatar?: string }[]
  messages?: MessageItem[]
}

export interface CreateConversationPayload {
  participantIds: string[]
  title?: string
  firstMessage?: string
}

export const messagesApi = {
  listConversations: () =>
    api.get<ApiResponse<Conversation[]>>('/messages/conversations'),

  getConversation: (id: string) =>
    api.get<ApiResponse<Conversation>>(`/messages/conversations/${id}`),

  createConversation: (data: CreateConversationPayload) =>
    api.post<ApiResponse<Conversation>>('/messages/conversations', data),

  sendMessage: (conversationId: string, content: string, attachments?: string[]) =>
    api.post<ApiResponse<MessageItem>>(
      `/messages/conversations/${conversationId}/messages`,
      { content, attachments }
    ),
}
