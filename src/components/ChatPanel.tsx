import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useLlm } from '../hooks/useLlm'
import { queryWithContext, type RagContext } from '../ai/rag'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  context?: RagContext
}

const EXAMPLE_PROMPTS = [
  'What patterns connect my highest-rated works?',
  'Which tropes am I drawn to most?',
  'Recommend something based on my taste profile',
  'Why do I rate Attack on Titan so highly?',
]

interface Props {
  className?: string
}

export function ChatPanel({ className }: Props) {
  const { isReady, isGenerating, abort, generate } = useLlm()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    const query = input.trim()
    if (!query || !isReady || isGenerating) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setStreamingContent('')

    try {
      const { context, response } = await queryWithContext(query, generate, {
        onToken: (token) => {
          setStreamingContent((prev) => prev + token)
        },
      })

      setStreamingContent('')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response, context },
      ])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setStreamingContent('')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${errorMsg}` },
      ])
    }
  }

  function handleExampleClick(prompt: string) {
    setInput(prompt)
  }

  if (!isReady) {
    return (
      <div className={`p-4 bg-surface rounded-lg border border-border ${className ?? ''}`}>
        <p className="text-star/50 text-sm">Set up a Gemini API key or load a local LLM model to enable chat.</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col bg-surface rounded-lg border border-border overflow-hidden ${className ?? ''}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && !streamingContent && (
          <div className="space-y-3">
            <p className="text-star/40 text-sm">Ask questions about your narrative taste profile.</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleExampleClick(prompt)}
                  className="px-3 py-1.5 text-xs bg-void hover:bg-surface-bright text-star/60 hover:text-star border border-border rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.role === 'user'
                ? 'text-accent ml-8'
                : 'text-star/80 mr-8'
            }`}
          >
            <span className="text-xs text-star/30 block mb-1">
              {msg.role === 'user' ? 'You' : 'Portal'}
            </span>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {streamingContent && (
          <div className="text-sm text-star/80 mr-8">
            <span className="text-xs text-star/30 block mb-1">Portal</span>
            <div className="whitespace-pre-wrap">{streamingContent}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your narrative taste..."
          disabled={isGenerating}
          className="flex-1 bg-void text-star text-sm px-3 py-2 rounded border border-border focus:border-accent focus:outline-none disabled:opacity-50"
        />
        {isGenerating ? (
          <button
            type="button"
            onClick={abort}
            className="px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 text-sm bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded transition-colors disabled:opacity-30"
          >
            Send
          </button>
        )}
      </form>
    </div>
  )
}
