'use client'

import { AIRecommendation, Move } from '@/types/game'

interface AIAssistantProps {
  recommendations: AIRecommendation[]
  isCalculating: boolean
  onMoveSelect: (move: Move) => void
}

export default function AIAssistant({ 
  recommendations, 
  isCalculating, 
  onMoveSelect 
}: AIAssistantProps) {
  const formatPosition = (row: number, col: number): string => {
    return `${String.fromCharCode(65 + col)}${8 - row}`
  }

  const formatMove = (move: Move): string => {
    const from = formatPosition(move.from.row, move.from.col)
    const to = formatPosition(move.to.row, move.to.col)
    const captureText = move.captures && move.captures.length > 0 ? ' (กิน)' : ''
    return `${from} → ${to}${captureText}`
  }

  const getScoreColor = (score: number): string => {
    if (score > 2) return 'text-green-600'
    if (score > 0) return 'text-blue-600'
    if (score > -2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreText = (score: number): string => {
    if (score > 3) return 'ดีมาก'
    if (score > 1) return 'ดี'
    if (score > 0) return 'พอใช้'
    if (score > -1) return 'เสียเปรียบเล็กน้อย'
    return 'เสียเปรียบ'
  }

  if (isCalculating) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">AI กำลังวิเคราะห์ท่าเดิน...</span>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🤖 AI Assistant</h3>
        <p className="text-gray-600">ไม่พบท่าเดินที่แนะนำ</p>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        🤖 AI Assistant
        <span className="ml-2 text-sm font-normal text-gray-500">
          (คำแนะนำท่าเดิน)
        </span>
      </h3>
      
      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onMoveSelect(recommendation.move)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 ${
                  index === 0 ? 'bg-gold' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="font-mono text-lg font-semibold">
                  {formatMove(recommendation.move)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={`font-semibold ${getScoreColor(recommendation.score)}`}>
                คะแนน: {recommendation.score.toFixed(1)} ({getScoreText(recommendation.score)})
              </span>
              <span className="text-gray-500">
                ความลึก: {recommendation.depth}
              </span>
            </div>
            
            {recommendation.move.captures && recommendation.move.captures.length > 0 && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                🎯 กินหมากได้ {recommendation.move.captures.length} ตัว
              </div>
            )}
            
            {index === 0 && (
              <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                ⭐ แนะนำมากที่สุด
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p className="mb-1">💡 คลิกบนท่าเดินที่ต้องการเพื่อเดินตามคำแนะนำ</p>
        <p>📊 คะแนนเป็นบวกหมายถึงคุณมีโอกาสชนะมากกว่า</p>
      </div>
    </div>
  )
}

// Add custom gold color for first place
const goldStyle = `
  .bg-gold {
    background: linear-gradient(45deg, #FFD700, #FFA500);
  }
`

// Inject the style
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = goldStyle
  document.head.appendChild(style)
}