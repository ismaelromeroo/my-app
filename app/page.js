'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
  }

  async function addMessage() {
    if (!text.trim()) return
    await supabase.from('messages').insert({ text })
    setText('')
    fetchMessages()
  }

  useEffect(() => { fetchMessages() }, [])

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Messages</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={addMessage} style={{ padding: '0.5rem 1rem' }}>
          Send
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((msg) => (
          <li key={msg.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #ccc' }}>
            {msg.text}
          </li>
        ))}
      </ul>
    </main>
  )
}