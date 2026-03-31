import { ChatPanel } from '../../components/ChatPanel'

function ChatView() {
  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-lg font-semibold mb-3 text-star/80">Chat</h2>
      <div className="flex-1 min-h-0">
        <ChatPanel />
      </div>
    </div>
  )
}

export default ChatView
