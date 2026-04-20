# Examify ⚡

**Transform static exam PDFs into interactive, AI-powered learning experiences.**

Examify is a premium, high-fidelity platform designed for students to master competitive exams through immersive simulation. It features a stunning glassmorphic UI, real-time analytics, and an intelligent AI extraction engine that turns standard PDFs into full-featured interactive tests.

---

### ✨ Key Features

*   **⚡ AI Paper Extraction:** Automatically parse complex exam PDFs into structured questions, math symbols, and options.
*   **💎 Glassmorphic UI:** A state-of-the-art immersive design system with deep dark modes, mesh gradients, and floating glass components.
*   **📊 Performance Analytics:** Track your accuracy, solve time, and streaks with real-time student metrics and activity logs.
*   **🧪 Immersive Simulation:** Experience a production-grade testing environment with a dynamic question palette, live timers, and comprehensive marking schemes.
*   **✏️ Interactive AI Repair:** Correct mangled mathematical symbols and scientific notation using built-in AI auto-repair logic.
*   **📱 Fully Responsive:** Seamless experience across desktop, tablet, and mobile devices with adaptive layouts.

---

### 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS (Custom Design System)
- **State Management:** React Hooks & Context API
- **Persistence:** LocalStorage with service-based architecture
- **AI Integration:** Contextual symbol repair and PDF parsing services
- **Typography:** MathJax-enabled LaTeX support for scientific notation
- **Theme:** Dynamic HSL-based Theme Engine (Light/Dark Support)

---

### 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Examify.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Upload a Paper**
   Navigate to the "Upload Paper" wizard and drag in a standard MCQ PDF to begin extraction.

---

### 🏗️ Directory Structure

- `src/components`: Reusable UI modules (common, exam, dashboard)
- `src/pages`: Main application views (Profile, Dashboard, Simulation, Results)
- `src/services`: Core logic (Auth, Paper management, AI processing, Storage)
- `src/utils`: Helper functions (Mathematical scoring, symbol handling)
- `src/index.css`: Global design system and theme variables

---

### 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ for students by the Examify Team.*
