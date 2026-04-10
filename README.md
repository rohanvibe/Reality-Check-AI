# 💀 Reality Check AI

**"Your ideas are vulnerable. Let's find out why."**

Reality Check AI is a high-performance, logic-driven tool that provides brutally honest feedback on your ideas, plans, and goals. Designed for builders who value cold truth over warm motivation, it uses SambaNova's Llama 3.1 70B to identify failure points before the real world does.

![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)
![PWA](https://img.shields.io/badge/PWA-Enabled-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🚀 Key Features

- **Brutal Logic Engine**: Powered by Llama 3.1 70B for high-fidelity critical thinking.
- **Deep Failure Analysis**: Breaks down ideas into Core Problems, Failure Risks, and Missing Pieces.
- **Full PWA Experience**: Installable on iOS/Android/Desktop. Works offline for browsing history.
- **Privacy First**: History is stored 100% locally in your browser.
- **Rate Limited & Key-Agnostic**: 5 free checks/hour, or provide your own API key for unlimited access.

---

## 🛠️ How It Works (UX Flow)

1. **Submit**: Enter your idea into the centered "Stage" input.
2. **Analysis**: AI deconstructs the logic, assumptions, and market reality.
3. **Verdict**: Get a high-impact, one-word/phrase verdict followed by a detailed autopsy.
4. **Retention**: All checks are automatically saved to your local History for later review.

---

## 💻 Run Locally

### 1. Clone & Install
```bash
git clone https://github.com/rohanvibe/reality-check-ai.git
cd reality-check-ai
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SAMBANOVA_API_KEY=your_sambanova_api_key_here
```

### 3. Start Development
```bash
npm run dev
```

---

## ☁️ Deploy on Vercel

### 1. Push to GitHub
Commit your changes and push the project to a new GitHub repository.

### 2. Import to Vercel
- Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
- Import your **reality-check-ai** repository from `github.com/rohanvibe/reality-check-ai`.

### 3. Configure
- **Framework Preset**: Vite (detected automatically).
- **Build Command**: `npm run build`.
- **Output Directory**: `dist`.

### 4. Environment Variables
Add the following variable in the **Vercel Settings > Environment Variables** dashboard:
- Name: `SAMBANOVA_API_KEY`
- Value: `your_actual_api_key`

*Note: The `VITE_` prefix is no longer required for the global key as it is now securely handled on the server side.*

### 5. Deploy
Click **Deploy**. Your app will be live with an SSL-secured URL, which is required for PWA functionality.

---

## 📱 PWA Capability

This app is a full **Progressive Web App**. 
- **Standalone**: Removes the browser UI when installed.
- **Offline Mode**: Uses a Service Worker to cache state. You can view previous checks without an internet connection.
- **Installability**: Meet installation criteria. Open **Settings** within the app to trigger a manual install prompt.

---

## 🗺️ Roadmap

- [ ] **Data Export**: Export history as JSON or PDF.
- [ ] **Comparison Mode**: Check two variations of an idea side-by-side.
- [ ] **Community Verdicts**: Opt-in to share anonymous verdicts with the community feed.
- [ ] **Voice Input**: Dictate your plans for even faster feedback.

---

## ⚖️ License & Commercial Use

Distributed under the MIT License. 

**IMPORTANT**: If you want to use this app for commercial purposes (selling, redistributing for profit, etc.), you **must** contact the author at **maheshkumar79759@gmail.com** to arrange a legal agreement. Unauthorized commercial use may result in legal action.

See `LICENSE` for more information.

---

**Don't build in a bubble. Get a Reality Check.**
