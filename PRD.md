# Product Requirements Document: Examify ⚡

## 1. Product Overview
Examify is a premium digital testing ecosystem that empowers students to prepare for high-stakes competitive exams (JEE, NEET, CAT, etc.) by converting static PDF/DOCX materials into interactive, data-driven simulations.

## 2. Problem Statement
Competitive exam prep often relies on static PDFs where students must manually track time, grade themselves, and deal with poorly formatted mathematical symbols caused by OCR errors. This lacks immersion and actionable analytical feedback.

## 3. Goals & Objectives
- **Modernize Prep**: Replace static reading with interactive simulation.
- **AI-Enhanced Accuracy**: Use Large Language Models (LLMs) to automatically repair scientific/mathematical notation.
- **Immersive UX**: Provide a "distraction-free" simulation environment that mimics real-world digital testing software.
- **Data-Driven Mastery**: Track solve rates, time-per-question, and consistency streaks.

## 4. Key Features

### A. Intelligent Paper Wizard
- **Universal Input**: Support for PDF, DOCX, and Image uploads.
- **AI-Symbol Repair**: Real-time correction of mangled notation (e.g., converting "□" to "π" or "θ") using context-aware AI.
- **Dynamic Marking Schemes**: Per-section configuration for positive and negative marking.

### B. High-Fidelity Simulator
- **Focus Mode**: A glassmorphic, immersive testing UI that removes dashboard distractions.
- **Smart Palette**: A real-time overview of the exam status (Answered, For Review, Unanswered).
- **MathJax Integration**: Seamless rendering of LaTeX and complex scientific formulas.

### C. Performance Dashboard
- **Metric Cards**: Quick view of total tests, average marks, and solve accuracy.
- **Recent Activity**: Log of past attempts with direct links to performance reviews.
- **Paper Library**: A curated view of extracted papers with status indicators.

### D. Result Analytics
- **Instant Grading**: Automated score calculation based on user-defined marking schemes.
- **Performance Summary**: Visual breakdown of correct vs. incorrect responses.

## 5. Technical Requirements
- **Frontend**: React (Vite) with an adaptive HSL-based Theme Engine.
- **Backend/Storage**: Firebase (Authentication & Firestore) + Local Storage Fallbacks.
- **AI Engine**: Groq API integration (Llama-3 models) for text-to-json parsing and symbol reconstruction.
- **Routing**: Client-side SPA routing with Vercel deployment support.

## 6. Design Principles
- **Glassmorphism**: Use of semi-transparent layers, backdrop blurs, and mesh gradients to create a futuristic, premium feel.
- **High-Contrast Focus**: Mint-Cyan accents (`#00f5ca`) for primary actions and active states.
- **Micro-interactions**: Use of pulsating choice indicators, smooth palette scaling, and transitions to enhance engagement.

## 7. Future Scope
- **Leaderboards**: Competitive peer-ranking systems.
- **PDF Snipping**: Automatic image cropping for complex geometric diagrams.
- **Offline Sync**: Offline simulation mode with background synchronization.
