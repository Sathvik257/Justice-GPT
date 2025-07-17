# ⚖️ Justice GPT

**Justice-GPT** is an AI-powered legal assistant that helps users identify relevant Indian Penal Code (IPC) sections based on textual crime descriptions. It leverages large language models like Google Gemini to provide legal reasoning, explanations, and references in plain language.

---

## 🚀 Features

- 🔍 Analyze criminal scenarios and return applicable IPC sections.
- 🤖 Uses Google Gemini AI for natural language understanding.
- 📚 Provides reasoning behind the applied legal sections.
- 🌐 Web-based frontend built using Vite + React.
- 🧠 Custom prompt tuning for legal accuracy and relevance.

---

## 📁 Project Structure
justice-gpt/
├── public/ # Static files (favicons, manifest, etc.)
├── src/
│ ├── assets/ # Icons, images, or static visual content
│ ├── components/ # React components (Navbar, Footer, etc.)
│ ├── pages/ # Main pages (Home, Chat, About)
│ ├── api/ # API integration (Gemini calls)
│ ├── App.jsx # App entry point
│ ├── main.jsx # Vite main render
│ └── index.css # Global styles
├── .env # Environment variables (API keys)
├── .gitignore # Files and folders to ignore in Git
├── package.json # Project metadata and dependencies
├── vite.config.js # Vite configuration
└── README.md # Project overview and setup guide


---

## 🛠️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/Sathvik257/Justice-GPT.git
cd Justice-GPT

# 2. Install dependencies
npm install

# 3. Create a .env file in the root directory
touch .env

# 4. Add your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 5. Start the development server
npm run dev

📦 Tech Stack
.⚛️ React + Vite
.🎨 Tailwind CSS
.🧠 Google Gemini API
.🛠️ Node.js (optional backend)

📌 Future Scope
.📜 IPC database integration
.🗣️ Voice input support
.🔐 Secure legal advisory layer
