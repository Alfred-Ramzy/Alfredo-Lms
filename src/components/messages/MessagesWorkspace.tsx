import { Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { orderBy, where } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createConversation, listenToQuery, sendConversationMessage } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { ConversationDoc, MessageDoc } from '@/types/firebase'

export function MessagesWorkspace({ roleLabel }: { roleLabel: string }) {
  const profile = useAuthStore((state) => state.userProfile)
  const [conversations, setConversations] = useState<Array<ConversationDoc & { id: string }>>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<MessageDoc & { id: string }>>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!profile?.uid) return
    return listenToQuery<ConversationDoc>('conversations', [where('participantIds', 'array-contains', profile.uid), orderBy('updatedAt', 'desc')], (items) => {
      setConversations(items)
      setActiveId((current) => current ?? items[0]?.id ?? null)
    })
  }, [profile?.uid])

  useEffect(() => {
    if (!activeId) return
    return listenToQuery<MessageDoc>(`conversations/${activeId}/messages`, [orderBy('createdAt', 'asc')], setMessages)
  }, [activeId])

  const activeConversation = useMemo(() => conversations.find((item) => item.id === activeId) ?? null, [activeId, conversations])

  const send = async () => {
    if (!profile?.uid || !draft.trim()) return
    let conversationId = activeId
    if (!conversationId) {
      conversationId = await createConversation({
        participantIds: [profile.uid],
        participantNames: [profile.fullName],
        unreadCountByUser: { [profile.uid]: 0 },
      })
      setActiveId(conversationId)
    }
    await sendConversationMessage(conversationId, {
      body: draft.trim(),
      participantIds: activeConversation?.participantIds ?? [profile.uid],
      senderId: profile.uid,
      attachments: [],
    })
    setDraft('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-soft">
        <h2 className="text-lg font-bold">{roleLabel} Conversations</h2>
        <div className="mt-4 space-y-2">
          {conversations.map((conversation) => (
            <button key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)} className={`w-full rounded-2xl border p-3 text-start ${activeId === conversation.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <p className="font-medium">{conversation.participantNames?.join(', ') || 'Conversation'}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.lastMessage ?? 'No messages yet'}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 min-h-[420px] space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`max-w-[80%] rounded-2xl p-3 ${message.senderId === profile?.uid ? 'ms-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {message.body}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message" />
          <Button onClick={() => void send()}><Send className="size-4" />Send</Button>
        </div>
      </div>
    </div>
  )
}
