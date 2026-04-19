'use client'
import { useState } from 'react'

const styles = {
  page: {
    padding: '2rem',
    maxWidth: '720px',
    margin: '0 auto',
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: '#1a1a1a',
    backgroundColor: '#fafaf8',
    minHeight: '100vh',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    color: '#1a1a1a',
  },
  subheading: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '2rem',
  },
  conversation: {
    marginBottom: '2rem',
  },
  emptyState: {
    color: '#777',
    fontSize: '1rem',
    fontStyle: 'italic',
    padding: '1rem 0',
  },
  userBubble: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1.5rem',
  },
  userText: {
    background: '#2c5f8a',
    color: '#ffffff',
    padding: '0.75rem 1.25rem',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '80%',
    lineHeight: '1.5',
    fontSize: '1rem',
  },
  assistantBubble: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '1.5rem',
  },
  assistantText: {
    background: '#ffffff',
    color: '#1a1a1a',
    padding: '1rem 1.25rem',
    borderRadius: '4px 18px 18px 18px',
    maxWidth: '85%',
    lineHeight: '1.8',
    fontSize: '1rem',
    border: '1px solid #ddd',
    whiteSpace: 'pre-wrap',
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid #bbb',
    color: '#1a1a1a',
    backgroundColor: '#fff',
    outline: 'none',
  },
  sendButton: {
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#2c5f8a',
    color: '#ffffff',
    whiteSpace: 'nowrap',
  },
  sendButtonDisabled: {
    backgroundColor: '#888',
    cursor: 'not-allowed',
  },
}

function buildMessageHistory(existingHistory, newUserText) {
  return [...existingHistory, { role: 'user', content: newUserText }]
}

async function fetchStreamFromApi(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`)
  }

  return response.body.getReader()
}

async function readAllChunks(reader, onChunk) {
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })
    onChunk(text)
  }
}

function appendChunkToLastMessage(previousMessages, chunk) {
  const updated = [...previousMessages]
  const last = updated[updated.length - 1]
  updated[updated.length - 1] = { ...last, content: last.content + chunk }
  return updated
}

function addEmptyAssistantMessage(setDisplayed) {
  setDisplayed(prev => [...prev, { role: 'assistant', content: '' }])
}

function updateLastAssistantMessage(setDisplayed, chunk) {
  setDisplayed(prev => appendChunkToLastMessage(prev, chunk))
}

export default function Home() {
  const [messageHistory, setMessageHistory] = useState([])
  const [displayedMessages, setDisplayedMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleSend() {
    const userText = inputText.trim()
    if (!userText || isStreaming) return

    setInputText('')

    const updatedHistory = buildMessageHistory(messageHistory, userText)
    setMessageHistory(updatedHistory)
    setDisplayedMessages(prev => [...prev, { role: 'user', content: userText }])
    setIsStreaming(true)

    try {
      const reader = await fetchStreamFromApi(updatedHistory)

      addEmptyAssistantMessage(setDisplayedMessages)

      let fullResponse = ''

      await readAllChunks(reader, (chunk) => {
        fullResponse += chunk
        updateLastAssistantMessage(setDisplayedMessages, chunk)
      })

      setMessageHistory(prev => [...prev, { role: 'assistant', content: fullResponse }])
    } catch (error) {
      console.error('Chat error:', error)
      setDisplayedMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend()
    }
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.heading}>Medical Term Helper</h1>
      <p style={styles.subheading}>
        Type any medical word or condition and get a plain-language explanation.
      </p>

      <div style={styles.conversation}>
        {displayedMessages.length === 0 && (
          <p style={styles.emptyState}>
            Your explanation will appear here. Go ahead and ask anything.
          </p>
        )}

        {displayedMessages.map((message, index) => (
          <div
            key={index}
            style={message.role === 'user' ? styles.userBubble : styles.assistantBubble}
          >
            <div style={message.role === 'user' ? styles.userText : styles.assistantText}>
              {message.content || '…'}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a medical term or condition..."
          disabled={isStreaming}
          style={styles.input}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming}
          style={{
            ...styles.sendButton,
            ...(isStreaming ? styles.sendButtonDisabled : {}),
          }}
        >
          {isStreaming ? 'Thinking...' : 'Explain'}
        </button>
      </div>
    </main>
  )
}
