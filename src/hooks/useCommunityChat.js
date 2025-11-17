import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

export function useCommunityChat(userId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100)

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel('community_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchMessages])

  // Send message
  const sendMessage = useCallback(async (content, userName, weightLoss = null) => {
    if (!userId) return { success: false, error: 'Not authenticated' }

    try {
      const messageData = {
        user_id: userId,
        user_name: userName,
        content: content.trim(),
        weight_loss: weightLoss,
        type: weightLoss ? 'result' : 'message',
        created_at: new Date().toISOString()
      }

      const { data, error: insertError } = await supabase
        .from('community_messages')
        .insert(messageData)
        .select()
        .single()

      if (insertError) throw insertError

      // Message will be added via real-time subscription
      return { success: true, data }
    } catch (err) {
      console.error('Error sending message:', err)
      return { success: false, error: err.message }
    }
  }, [userId])

  // Share result
  const shareResult = useCallback(async (userName, weightLoss, message = '') => {
    if (!userId) return { success: false, error: 'Not authenticated' }

    const content = message || `Perdi ${weightLoss.toFixed(1)} kg no meu tratamento! 🎉`
    return sendMessage(content, userName, weightLoss)
  }, [userId, sendMessage])

  // Like message
  const likeMessage = useCallback(async (messageId) => {
    if (!userId) return false

    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) return false

      const likes = message.likes || []
      const hasLiked = likes.includes(userId)

      const newLikes = hasLiked
        ? likes.filter(id => id !== userId)
        : [...likes, userId]

      const { error: updateError } = await supabase
        .from('community_messages')
        .update({ likes: newLikes })
        .eq('id', messageId)

      if (updateError) throw updateError

      setMessages(prev =>
        prev.map(m =>
          m.id === messageId ? { ...m, likes: newLikes } : m
        )
      )

      return true
    } catch (err) {
      console.error('Error liking message:', err)
      return false
    }
  }, [userId, messages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    shareResult,
    likeMessage,
    refreshMessages: fetchMessages
  }
}
