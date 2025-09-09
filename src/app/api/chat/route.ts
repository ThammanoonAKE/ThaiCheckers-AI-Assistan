import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const THAI_CHECKERS_CONTEXT = `
คุณเป็นผู้เชี่ยวชาญด้านหมากฮอสไทยและเป็นผู้ช่วยแนะนำการเล่น คุณต้องตอบเป็นภาษาไทยเท่านั้น

กฎหมากฮอสไทย (สำคัญมาก - ต้องปฏิบัติตามอย่างเคร่งครัด):

1. กระดานขนาด 8x8 ช่อง แต่ละฝ่ายเริ่มต้นด้วยหมาก 2 แถว (8 ตัวต่อฝ่าย)

2. การเดินหมากธรรมดา (สำคัญ):
   - เดินได้เฉพาะ 1 ช่องทแยงไปข้างหน้าเท่านั้น
   - หมากดำ (b●): เดินจากแถวต่ำไปแถวสูง (เช่น 2→3, 3→4)
   - หมากแดง (r●): เดินจากแถวสูงไปแถวต่ำ (เช่น 7→6, 6→5)
   - ห้ามเดินตรง ห้ามเดินข้างหลัง ห้ามเดินขวางแถว

3. การกิน: 
   - กินหมากศัตรูที่อยู่ถัดไปในทิศทางทแยง และลงในช่องว่างข้างหลัง
   - ต้องข้ามหมากศัตรู 1 ช่อง แล้วลงช่องว่าง

4. กินต่อเนื่องได้: ถ้าหมากศัตรูอยู่แบบ "ช่องเว้นช่อง" กินได้หลายตัวในครั้งเดียว

5. การบังคับกิน: ถ้ากินได้ ต้องกิน ห้ามเดินอื่น

6. การเลื่อนเป็นราชา: เมื่อหมากไปถึงแถวสุดท้ายของฝ่ายตรงข้าม

7. หมากราชา (R♔, B♔): เดินได้หลายช่องในทิศทางทแยงจนสุดขอบกระดาน

**ตัวอย่างการเดินที่ถูกต้อง:**
- A3→B4 (ทแยงขึ้น) ✅
- C5→D6 (ทแยงขึ้น) ✅  
- E3→F4 หรือ E3→D4 (ทแยงขึ้น) ✅

**ตัวอย่างการเดินที่ผิด:**
- A3→C3 (เดินตรง) ❌
- A3→A4 (เดินตรง) ❌  
- B4→B3 (ถอยหลัง) ❌

การอ่านกระดาน:
- กระดานแสดงเป็น 8x8 ช่อง จากมุมมอง A8 (ซ้ายบน) ถึง H1 (ขวาล่าง)
- r● = หมากแดงธรรมดา, R♔ = หมากราชาแดง (ฝั่ง AI)
- b● = หมากดำธรรมดา, B♔ = หมากราชาดำ (ฝั่งผู้เล่น)
- ○ = ช่องว่างที่เล่นได้, ■ = ช่องที่เล่นไม่ได้
- หมากดำเริ่มจากแถว 1-2, หมากแดงเริ่มจากแถว 7-8

คุณควรให้คำแนะนำที่เป็นประโยชน์ ตอบคำถามเกี่ยวกับกฎ กลยุทธ์ วิเคราะห์ตำแหน่งหมาก และช่วยผู้เล่นเข้าใจเกมให้ดีขึ้น
`

export async function POST(request: NextRequest) {
  try {
    const { message, gameContext } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    // สร้างข้อมูลเกมที่กำลังเล่นอยู่
    let gameInfo = ''
    if (gameContext) {
      gameInfo = `
ข้อมูลเกมปัจจุบัน:
- ผู้เล่นปัจจุบัน: ${gameContext.currentPlayer}
- ${gameContext.lastMove ? `ท่าเดินล่าสุด: ${gameContext.lastMove}` : ''}
- ${gameContext.gamePhase ? `ระยะของเกม: ${gameContext.gamePhase}` : ''}

${gameContext.gameBoard ? `
สถานะกระดานปัจจุบัน:
${gameContext.gameBoard}
` : ''}

${gameContext.recommendations && gameContext.recommendations.length > 0 ? 
`AI แนะนำท่าเดิน (จากการวิเคราะห์ระดับลึก):
${gameContext.recommendations.slice(0, 3).map((rec: any, i: number) => 
  `${i + 1}. คะแนน: ${rec.score.toFixed(1)} (ความลึก: ${rec.depth}) - ${rec.move.captures?.length ? `กินหมากได้ ${rec.move.captures.length} ตัว` : 'ท่าเดินปกติ'}`
).join('\n')}` : ''}`
    }
    
    const prompt = `${THAI_CHECKERS_CONTEXT}

${gameInfo}

ผู้เล่น: ${message}

กรุณาตอบเป็นภาษาไทย และให้คำแนะนำที่เป็นประโยชน์โดยใช้ข้อมูลจากเกมด้วย 

**สำคัญมาก:** ก่อนแนะนำท่าเดินใดๆ ต้องตรวจสอบให้แน่ใจว่า:
1. เป็นการเดินทแยงเท่านั้น (ไม่ใช่เดินตรงหรือขวาง)
2. หมากดำเดินไปข้างหน้า (แถวเลขเพิ่มขึ้น)
3. หมากแดงเดินไปข้างหน้า (แถวเลขลดลง) 
4. เดินไปช่องว่างเท่านั้น

หากมีข้อมูล AI แนะนำท่าเดิน ให้อธิบายว่าทำไมท่านั้นถึงได้คะแนนดี และให้คำแนะนำเพิ่มเติมตามสถานการณ์ แต่ต้องแนะนำเฉพาะท่าเดินที่ถูกกฎเท่านั้น:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}