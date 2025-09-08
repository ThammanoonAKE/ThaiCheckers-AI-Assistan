'use client'

import { useState, useRef, useEffect } from 'react'
import { AIRecommendation } from '@/types/game'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatBotProps {
  gameContext?: {
    currentPlayer: string
    recommendations?: AIRecommendation[]
    gameBoard?: string
    lastMove?: string
    gamePhase?: string
  }
}

export default function ChatBot({ gameContext }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'สวัสดีครับ! ผมเป็น AI ผู้ช่วยสำหรับหมากฮอสไทย พร้อมให้คำแนะนำและตอบคำถามเกี่ยวกับการเล่นครับ มีอะไรให้ช่วยไหมครับ? 🤖',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          gameContext: gameContext 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage: Message = {
          id: Date.now().toString() + '_bot',
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorMessage: Message = {
          id: Date.now().toString() + '_error',
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการตอบกลับ กรุณาลองใหม่อีกครั้งครับ',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        content: 'ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตครับ',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        content: 'สวัสดีครับ! ผมเป็น AI ผู้ช่วยสำหรับหมากฮอสไทย พร้อมให้คำแนะนำและตอบคำถามเกี่ยวกับการเล่นครับ มีอะไรให้ช่วยไหมครับ? 🤖',
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }

  const analyzeCurrentSituation = async () => {
    if (!gameContext || isLoading) return

    setIsLoading(true)
    const analysisMessage = gameContext.recommendations && gameContext.recommendations.length > 0 ?
      "วิเคราะห์สถานการณ์เกมปัจจุบันให้ฉันหน่อย พร้อมอธิบายท่าเดินที่แนะนำ" :
      "วิเคราะห์สถานการณ์เกมปัจจุบันให้ฉันหน่อย"

    const userMessage: Message = {
      id: Date.now().toString() + '_analysis_user',
      content: `📊 ${analysisMessage}`,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: analysisMessage,
          gameContext: gameContext 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage: Message = {
          id: Date.now().toString() + '_analysis_bot',
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 animate-bounce"
        >
          <div className="relative">
            💬
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
              !
            </span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold">AI ผู้ช่วยหมากฮอส</h3>
        </div>
        <div className="flex gap-2">
          {gameContext && (
            <button
              onClick={analyzeCurrentSituation}
              className="text-white hover:text-gray-200 text-sm"
              title="วิเคราะห์สถานการณ์"
              disabled={isLoading}
            >
              📊
            </button>
          )}
          <button
            onClick={clearMessages}
            className="text-white hover:text-gray-200 text-sm"
            title="ล้างข้อความ"
          >
            🔄
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-gray-200"
            title="ย่อเก็บ"
          >
            ➖
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์คำถามเกี่ยวกับหมากฮอสไทย..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            📤
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1 space-y-1">
          <div>Enter = ส่ง, Shift+Enter = บรรทัดใหม่</div>
          {gameContext && (
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-200" 
                    onClick={() => setInputMessage('ท่าเดินนี้ดีไหม?')}>
                "ท่าเดินนี้ดีไหม?"
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-200"
                    onClick={() => setInputMessage('มีกลยุทธ์อะไรแนะนำไหม?')}>
                "มีกลยุทธ์อะไรแนะนำไหม?"
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}