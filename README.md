# 🎓 PROJECT REPORT: ACADBOT ENTERPRISE
### *An Intelligent AI-Driven Student Academic Advisory Portal*

---

## 📄 ABSTRACT
The **AcadBot Enterprise** project is a comprehensive AI solution developed to automate academic counseling. By utilizing state-of-the-art Natural Language Processing (NLP) through the **Google Gemini 1.5 Flash** model, the system provides students with real-time, context-aware guidance. This report outlines the development of the portal from requirement analysis to final deployment, following industry-standard Computer Science methodologies.

---

## 🚀 1. INTRODUCTION
In modern educational environments, students often face a "counseling gap" due to the limited availability of human advisors. AcadBot addresses this by providing a 24/7 intelligent interface that can handle:
- Career stream selection.
- Course curriculum queries.
- Psychological stress management.
- Automated appointment scheduling with human experts.

---

## ⚙️ 2. SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC)
The project was developed using the **Agile Methodology**, ensuring iterative improvements and constant testing.

| Phase | Activities Performed |
| :--- | :--- |
| **Requirement Analysis** | Gathering student pain points and advisor availability constraints. |
| **System Design** | Architecture planning using MVC (Model-View-Controller) pattern. |
| **Development** | Backend logic implementation with Node.js and AI integration. |
| **Testing** | Unit testing for API endpoints and Integration testing for AI modules. |
| **Deployment** | Synchronization with GitHub and cloud-ready configuration. |

---

## 📊 3. SYSTEM REQUIREMENT SPECIFICATION (SRS)

### 3.1 Software Requirements:
- **Operating System**: Cross-platform (Windows/macOS/Linux).
- **Runtime Environment**: Node.js v22.20.0 or higher.
- **Database**: MongoDB Atlas (Cloud-based NoSQL).
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash).
- **Version Control**: Git & GitHub.

### 3.2 Hardware Requirements:
- **Processor**: Dual-Core 2.0GHz or higher.
- **RAM**: 4GB Minimum (8GB Recommended).
- **Storage**: 500MB available space.
- **Network**: Stable broadband for real-time AI API calls.

---

## 🏗️ 4. SYSTEM ARCHITECTURE & DESIGN

### 4.1 MVC Architecture
The system is divided into three interconnected layers:
1.  **Model**: Mongoose schemas (`Chat.js`, `User.js`) defining data structure.
2.  **View**: Frontend (`index.html`, `admin.html`) using Vanilla JS for dynamic DOM updates.
3.  **Controller**: Backend logic (`chat.controller.js`) managing AI calls and DB updates.

### 4.2 Database Design (NoSQL Schema)
We use a schema-less NoSQL approach for flexibility in storing conversational data.

| Entity | Attributes | Primary Key |
| :--- | :--- | :--- |
| **User** | studentId, password, role | studentId |
| **Chat** | userName, title, messages (Array), updatedAt | _id (Auto) |

---

## 🧠 5. CORE IMPLEMENTATION: GEMINI AI ENGINE
The project utilizes the **Gemini 1.5 Flash** model, selected for its high context window and low latency.

- **Endpoint**: `v1beta/models/gemini-1.5-flash-latest`
- **Context Injection**: The system uses a sliding-window technique to pass the last 4 messages as context to the AI, ensuring conversational continuity.
- **Resilient Logic**: Implements an "Offline Mode" where the AI still functions even if the database handshake fails.

---

## 🧪 6. TESTING & QUALITY ASSURANCE

### 6.1 Unit Testing
- Verified individual API endpoints (`/api/chat`, `/api/auth`) using custom diagnostic scripts.
- Tested AI response times (average < 2 seconds).

### 6.2 Integration Testing
- Verified the handshake between the Express.js server and MongoDB Atlas.
- Confirmed that chat sessions correctly persist and populate the sidebar.

### 6.3 User Acceptance Testing (UAT)
- Simulated various student personas (e.g., "The Stressed Student", "The Career Explorer") to validate AI personality consistency.

---

## 📈 7. FUTURE SCOPE
1.  **Multilingual Support**: Integration of regional languages for wider accessibility.
2.  **Voice Recognition**: Enabling speech-to-text advisory.
3.  **Predictive Analytics**: Using student history to suggest courses before they ask.

---

## 🎓 8. CONCLUSION
AcadBot Enterprise successfully demonstrates the integration of modern AI models with a robust full-stack architecture. It serves as a scalable foundation for future AI-driven educational tools, prioritizing user experience, data persistence, and high-IQ reasoning.

---
**Developed by: Kaif Mansoori**  
**Course: Computer Science Engineering**  
**Repository**: [GitHub Link](https://github.com/ishikasinghal04/acadmic-chat-bot.git)
