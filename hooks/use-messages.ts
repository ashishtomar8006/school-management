'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { messagesApi, Conversation, CreateConversationPayload } from '@/lib/api/endpoints/messages'
import { useQuery, useMutation } from './use-query'

export function useConversations() {
  const fetcher = useCallback(() => messagesApi.listConversations(), [])
  const { data: conversations, loading, error, refetch } = useQuery<Conversation[]>(fetcher)

  const { mutate: createConversation, loading: creating } = useMutation(
    (data: CreateConversationPayload) => messagesApi.createConversation(data),
    { onSuccess: () => refetch(), onError: toast.error }
  )

  return { conversations: conversations ?? [], loading, error, refetch, createConversation, creating }
}

export function useConversation(id: string) {
  const fetcher = useCallback(
    () => messagesApi.getConversation(id),
    [id]
  )
  const { data: conversation, loading, error, refetch } = useQuery<Conversation>(
    fetcher, { enabled: !!id }
  )

  const { mutate: sendMessage, loading: sending } = useMutation(
    ({ content, attachments }: { content: string; attachments?: string[] }) =>
      messagesApi.sendMessage(id, content, attachments),
    { onSuccess: () => refetch(), onError: toast.error }
  )

  return { conversation, loading, error, refetch, sendMessage, sending }
}
