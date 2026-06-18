'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConversations, useConversation } from '@/hooks/use-messages'
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react'

export default function MessagesPage() {
  const { conversations, loading } = useConversations()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const { conversation, loading: convLoading, sendMessage, sending } = useConversation(activeId ?? '')

  const handleSend = async () => {
    if (!message.trim() || !activeId) return
    await sendMessage({ content: message.trim() })
    setMessage('')
  }

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Conversation list */}
        <div className={`flex flex-col w-full lg:w-80 shrink-0 ${activeId ? 'hidden lg:flex' : 'flex'}`}>
          <h2 className="text-lg font-bold text-foreground mb-3">Conversations</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" /><p className="text-sm">No conversations</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {conversations.map(conv => {
                const last = conv.messages?.[0]
                const others = conv.participants.filter(p => p.name !== undefined)
                return (
                  <button key={conv.id} onClick={() => setActiveId(conv.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${activeId === conv.id ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800' : 'bg-white dark:bg-slate-900 border-border hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <p className="font-semibold text-sm text-foreground truncate">
                      {conv.title ?? others.map(p => p.name).join(', ')}
                    </p>
                    {last && <p className="text-xs text-slate-500 truncate mt-0.5">{last.sender?.name}: {last.content}</p>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Message pane */}
        <div className={`flex-1 flex flex-col border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900 ${activeId ? 'flex' : 'hidden lg:flex'}`}>
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button onClick={() => setActiveId(null)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <p className="font-semibold text-foreground">
                  {conversation?.title ?? conversation?.participants.map(p => p.name).join(', ')}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {convLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (conversation?.messages ?? []).map(m => (
                  <div key={m.id} className="flex flex-col gap-0.5 max-w-[75%]">
                    <p className="text-xs text-slate-400 font-medium">{m.sender?.name}</p>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-3 py-2">
                      <p className="text-sm text-foreground">{m.content}</p>
                    </div>
                    <p className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={sending || !message.trim()} className="bg-primary hover:bg-primary/90 shrink-0">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
