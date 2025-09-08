# 🏁 Thai Checkers AI Assistant | หมากฮอสไทย

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-yellow)](https://ai.google.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

> **Authentic Thai Checkers game with AI assistance, built with modern web technologies**
> 
> เกมหมากฮอสไทยแบบแท้พร้อม AI ผู้ช่วย สร้างด้วยเทคโนโลジีเว็บสมัยใหม่

## ✨ Features | คุณสมบัติ

### 🎮 **Game Features**
- 🏆 **Authentic Thai Checkers** - กฎหมากฮอสไทยแบบแท้ (2 rows setup)
- 🔥 **Continuous Capturing** - การกินต่อเนื่อง (ช่องเว้นช่อง)
- 👑 **King Movement** - หมากราชาเดินได้หลายช่อง + กินต่อเนื่อง
- ⚠️ **Mandatory Capture** - กฎการบังคับกิน (หักขา) แบบไทยแท้

### 🤖 **AI Features**
- 🧠 **Smart AI Assistant** - ใช้อัลกอริธึม Minimax + Alpha-Beta Pruning
- 💡 **Move Recommendations** - แนะนำท่าเดินพร้อมคะแนน
- 🤖 **AI Chatbot** - ปรึกษา AI เกี่ยวกับกฎและกลยุทธ์ (Powered by Gemini 2.0)
- 📊 **Real-time Analysis** - วิเคราะห์สถานการณ์เกมแบบเรียลไทม์

### 🎨 **UI/UX Features**
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ
- 🎭 **Smooth Animations** - เอฟเฟกต์การเดิน, การกิน, การเลื่อนชั้น
- 📍 **Coordinate Labels** - แสดงตำแหน่งช่อง (A1-H8)
- 🌈 **Modern UI** - ดิไซน์สวยงามด้วย Tailwind CSS

## กฎของหมากฮอสไทย (Thai Checkers Rules)

1. **การตั้งหมาก**: หมากแต่ละฝ่ายมี 2 แถว (8 ตัวต่อฝ่าย)
2. **หมากธรรมดา**: เดินได้เฉพาะ 1 ช่องทแยงไปข้างหน้า
3. **การกิน**: 
   - กินหมากศัตรูที่อยู่ถัดไป (แนวทแยง) และลงในช่องว่างข้างหลัง
   - **กินต่อเนื่องได้**: ถ้าหมากศัตรูอยู่แบบ "ช่องเว้นช่อง" กินได้หลายตัวในครั้งเดียว
   - **ทิศทางการกิน**: หมากธรรมดากินได้เฉพาะทิศทางที่เดินได้ (ข้างหน้าเท่านั้น)
4. **การบังคับกิน**: ถ้ากินได้ **ต้องกิน** ห้ามเดินอื่น ไม่งั้นจะโดน "หักขา" (ถูกกิน)
5. **การเลื่อนเป็นราชา**: เมื่อหมากไปถึงแถวสุดท้ายของฝ่ายตรงข้าม
6. **หมากราชา**: 
   - เดินได้หลายช่องในทิศทางทแยงจนสุดขอบกระดาน
   - **กินได้หลายตัวต่อเนื่อง**: กินหมากศัตรูทุกตัวที่อยู่ในเส้นทางการเดิน
   - **ลงข้างหลังหมากที่กิน**: ต้องหยุดที่ช่องหลังหมากที่กินเท่านั้น (เหมือนหมากธรรมดา)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gemini API Key (for AI chatbot)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/thai-checkers-ai-assistant.git
cd thai-checkers-ai-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key
```

### Environment Setup

Create `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Development

```bash
# Start development server
npm run dev

# Open browser at
http://localhost:3000
```

## 🎮 How to Play | วิธีเล่น

1. **Start Game** - Black player (you) moves first | ผู้เล่นดำ (คุณ) เริ่มก่อน
2. **Select Piece** - Click on your piece to select | คลิกหมากของคุณเพื่อเลือก
3. **Make Move** - Click green squares to move | คลิกช่องเขียวเพื่อเดิน
4. **Get AI Help** - Use "Show AI Suggestions" button | ใช้ปุ่ม "แสดงคำแนะนำ AI"
5. **Ask AI** - Chat with AI for strategies and rules | สอบถาม AI เกี่ยวกับกลยุทธ์และกฎ
6. **Win Condition** - Capture all opponent pieces | เป้าหมายคือกินหมากศัตรูให้หมด

## คำสั่งที่มี (Available Scripts)

```bash
npm run dev      # รันเซิร์ฟเวอร์ development
npm run build    # สร้าง production build
npm run start    # รันเซิร์ฟเวอร์ production
npm run lint     # ตรวจสอบ code style
```

## 🏗️ Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | Next.js 14 | React framework with App Router |
| **Language** | TypeScript | Type-safe JavaScript |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **AI Engine** | Custom Minimax | Alpha-Beta pruning algorithm |
| **AI Chatbot** | Gemini 2.0 Flash | Google's latest AI model |
| **State Management** | React Hooks | Built-in React state management |

## 🧠 AI Algorithm

### Minimax with Alpha-Beta Pruning
- **Search Depth**: 6 levels (configurable)
- **Board Evaluation**: Advanced heuristics for piece positioning
- **Performance**: Optimized with alpha-beta pruning
- **Real-time Analysis**: Live move recommendations with confidence scores

### AI Chatbot Features
- **Game Context Awareness**: Understands current board state
- **Rule Explanations**: Explains Thai Checkers rules in Thai
- **Strategy Advice**: Provides tactical recommendations
- **Move Analysis**: Analyzes specific positions and moves

## 📁 Project Structure

```
src/
├── app/
│   ├── api/chat/         # Gemini AI chatbot API
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ThaiCheckersGame.tsx  # Main game component
│   ├── GameBoard.tsx         # Board UI component
│   ├── AIAssistant.tsx       # Move recommendations
│   └── ChatBot.tsx           # AI chatbot interface
├── lib/
│   ├── gameLogic.ts      # Core game rules & logic
│   └── minimax.ts        # AI algorithm implementation
└── types/
    └── game.ts           # TypeScript definitions
```

## 🎨 Features Showcase

### Game Animations
- ✨ **Move Highlighting** - Yellow start, green destination
- 💥 **Capture Effects** - Bouncing and fading captured pieces
- 👑 **King Promotion** - Spinning crown animation
- 🎯 **AI Suggestions** - Bouncing recommendation indicators
- 🎭 **Piece Selection** - Scaling and glow effects

### Interactive Elements
- 📍 **Coordinate System** - A1-H8 chess notation
- 🖱️ **Click to Move** - Intuitive piece selection
- 📱 **Mobile Responsive** - Works on all device sizes
- 🔄 **Smooth Transitions** - Fluid animations throughout

## 📸 Screenshots

### Game Board with AI Suggestions
![Game Screenshot](docs/images/game-screenshot.png)
*Main game interface with move recommendations*

### AI Chatbot Interface  
![Chatbot Screenshot](docs/images/chatbot-screenshot.png)
*Interactive AI assistant for strategy advice*

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thai Checkers rules and gameplay mechanics
- Google Gemini AI for intelligent chatbot capabilities
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling utilities

## 📞 Support & Contact

- 🐛 **Issues**: [GitHub Issues](https://github.com/ThammanoonAKE/thai-checkers-ai-assistant/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ThammanoonAKE/thai-checkers-ai-assistant/discussions)

---

<div align="center">

**🎯 Made with ❤️ for Thai Checkers enthusiasts**

*If you enjoyed this project, please consider giving it a ⭐ on GitHub!*

</div>