import ThaiCheckersGame from '@/components/ThaiCheckersGame'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="container mx-auto">
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-amber-800">
            หมากฮอสไทย - Thai Checkers AI Assistant
          </h1>
        </div>
        <ThaiCheckersGame />
      </div>
    </main>
  )
}