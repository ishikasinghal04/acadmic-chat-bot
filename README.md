# 🎓 AcadBot Enterprise: Elite AI Student Advisory Portal

Welcome to the **AcadBot Enterprise Portal**, a state-of-the-art, AI-driven academic advisory system designed to provide students with real-time career guidance, course counseling, and seamless appointment management.

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Core Architecture](#core-architecture)
3. [Technical Stack](#technical-stack)
4. [AI Intelligence Layer (Gemini-Only)](#ai-intelligence-layer)
5. [Database & Persistence](#database-persistence)
6. [UI/UX Features](#uiux-features)
7. [Installation & Setup](#installation--setup)
8. [Maintenance & Diagnostics](#maintenance--diagnostics)

---

## 🌟 Project Overview
AcadBot is more than just a chatbot; it's a **Cognitive Academic Assistant**. It bridges the gap between students and career counseling by providing 24/7 intelligent responses and an automated booking system for human counselor consultations.

### Key Goals:
- **High IQ Responses**: Leveraging Google Gemini 1.5 Flash for accurate academic advice.
- **Session Persistence**: Maintaining full chat history across multiple devices.
- **Enterprise UI**: A ChatGPT-style sidebar and a premium dark-themed interface.
- **Resilience**: A non-blocking architecture that stays online even if the database is temporarily unreachable.

---

## 🏗️ Core Architecture
The project follows a modular **Model-View-Controller (MVC)** pattern for maximum scalability.

| Component | Responsibility |
| :--- | :--- |
| **Frontend** | Vanilla JS, HTML5, CSS3 with a focus on premium aesthetics. |
| **Backend** | Node.js & Express server handling API routing and AI orchestration. |
| **Database** | MongoDB Atlas for student profiles, sessions, and chat logs. |
| **AI Engine** | Google Generative AI (Gemini) via direct API integration. |

---

## 🛠️ Technical Stack
The system is built using modern, production-ready technologies:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v22+) | High-performance server environment. |
| **Framework** | Express.js | Robust API routing and middleware management. |
| **Database** | MongoDB (Mongoose) | Schema-based data persistence and session tracking. |
| **AI SDK** | Google Gemini API | Natural Language Processing and Student Advisory. |
| **Security** | JWT & Bcrypt.js | Encrypted authentication and role-based access. |
| **Styling** | Vanilla CSS | Custom design system with glassmorphism and animations. |

---

## 🧠 AI Intelligence Layer
After a thorough "Deep Audit" of various AI providers (Grok, OpenRouter, GitHub), the system has been unified to use the **Google Gemini 1.5 Flash** engine for its superior balance of speed, accuracy, and free-tier reliability.

### AI Configuration:
- **Model**: `gemini-1.5-flash-latest`
- **Logic**: Implements a "History-Aware" prompt engineering technique, where the last 4 messages are injected into the context to maintain conversational continuity.
- **Fallback**: If the AI encounters a quota limit, it returns a graceful "Syncing" message instead of crashing the frontend.

---

## 🗄️ Database & Persistence
The database is the backbone of AcadBot's memory. We use **MongoDB Atlas** for its cloud-native scalability.

### 📊 Data Schema:

#### 1. `Chat` Model (Sessions)
This model tracks individual conversations.
| Field | Type | Description |
| :--- | :--- | :--- |
| `userName` | String | The ID or Name of the student. |
| `title` | String | Auto-generated title based on the first query. |
| `messages` | Array | Objects containing `role` (user/assistant) and `content`. |
| `updatedAt` | Date | Used to sort "Recent Conversations" in the sidebar. |

#### 2. `User` Model (Auth)
Handles login and registration.
| Field | Type | Description |
| :--- | :--- | :--- |
| `studentId` | String | Unique identifier (e.g., STU007). |
| `password` | String | Bcrypt-hashed password for security. |
| `role` | String | Defaults to `student`, can be upgraded to `admin`. |

---

## ✨ UI/UX Features
The interface is designed to "WOW" the user from the first click:

1.  **ChatGPT Sidebar**: A persistent navigation bar that lists previous sessions, allows for session deletion, and quick navigation.
2.  **Smart Chat Input**: "Enter to Send" functionality with a sleek, glowing send button.
3.  **Real-time Insights**: An Admin Dashboard that tracks student engagement and AI performance.
4.  **Glassmorphism**: Transparent, frosted-glass effects on cards and modals for a modern premium feel.

---

## 🚀 Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/ishikasinghal04/acadmic-chat-bot.git
    cd academic-advisor-chatbot
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_atlas_connection_string
    GEMINI_API_KEY=your_google_ai_studio_key
    ```

4.  **Run the Server**:
    ```bash
    npm start
    ```

---

## 🛡️ Maintenance & Diagnostics
The project includes an internal diagnostic suite for developers:

- **`test-gemini.js`**: Run this to verify if your Gemini API key is active and has quota.
- **Non-Blocking Connection**: If your MongoDB password is wrong, the server will still boot and allow you to test the AI interface in "Offline Mode".

---

**Developed with ❤️ by the AcadBot Team.**
