# PDF Analyzer & Chatbot

A modern PDF analysis application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and OpenAI's Responses API with file_search tool.

## 🚀 Features

- **PDF Upload**: Drag-and-drop interface for uploading PDF files
- **Vector Store Creation**: Automatically creates vector stores via OpenAI API
- **AI Chat**: Chat with your PDF documents using OpenAI's Responses API
- **File Search**: Uses file_search tool with vector stores for accurate responses
- **Modern UI**: Beautiful interface built with shadcn/ui components
- **Real-time Feedback**: Toast notifications and progress indicators
- **File Citations**: Shows source file references in responses

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **AI**: OpenAI Responses API with file_search tool
- **File Upload**: react-dropzone
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Adding Components

To add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

## 🌐 API Routes

- `POST /api/upload`: Upload PDF and create vector store
- `POST /api/chat`: Chat with PDF using Responses API

## 📱 User Journey

1. **Upload PDF**: Drag and drop PDF files to create vector stores
2. **Chat**: Ask questions about your uploaded documents
3. **Get Answers**: Receive AI responses with file citations

## 🎯 Key Features

- **No Dashboard Setup**: Vector stores created dynamically in code
- **File Search Tool**: Uses OpenAI's file_search with vector store ID
- **Real-time Chat**: Instant responses with loading indicators
- **Error Handling**: Graceful error messages and retry options
- **Mobile Responsive**: Works perfectly on all devices
- **Professional UI**: Clean, modern design with shadcn/ui

## 🚀 Deployment

The app is ready for deployment on:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

## 📄 License

MIT License - feel free to use this project for your own applications.