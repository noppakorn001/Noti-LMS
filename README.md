<div align="center">

# 📚 Noti-LMS

### A modern, intelligent task-tracking dashboard for Moodle LMS

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-notilms.noppakornwunnoy01.workers.dev-0078D4?style=for-the-badge)](https://notilms.noppakornwunnoy01.workers.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **🔗 Live Website:** https://notilms.noppakornwunnoy01.workers.dev/

</div>

---

## 📖 Overview

**Noti-LMS** is a full-stack web application designed to enhance the Moodle LMS experience by providing a clean, premium dashboard that aggregates assignments and quizzes across all enrolled courses into a single, unified view.

Instead of navigating through multiple Moodle pages to find upcoming due dates, students can log in once and instantly see all their pending tasks—sorted by urgency, color-coded by status, and directly linked to the corresponding Moodle activity page.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | Authenticates directly with your institution's Moodle server using the official Moodle Web Services API |
| 📋 **Unified Task View** | Aggregates all assignments and quizzes across every enrolled course into a single dashboard |
| 🔗 **Deep Linking** | Every task card is clickable and opens the corresponding Moodle activity in a new tab |
| 🟢 **Visual Status Indicators** | Color-coded badges instantly communicate deadline urgency (Overdue, Due Soon, Upcoming, Completed) |
| 🔔 **Push Notifications** | PWA with Service Worker push support — works on iPhone (iOS 16.4+), Android, and desktop |
| 📱 **Mobile Responsive** | Fully optimized layout for all screen sizes — desktop, tablet, and mobile |
| ⚡ **Edge Performance** | Deployed on Cloudflare Workers for global, low-latency performance |

---

## 🖼️ Screenshots

> Login with your Moodle URL, username, and password — no new account needed.

The dashboard displays:
- **Course name** for each task
- **Due date** formatted clearly
- **Submission status** badge (Overdue / Due Soon / Upcoming / Submitted)
- **Direct link** to the Moodle activity page

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript 6 |
| **Styling** | Tailwind CSS v4 |
| **Data Fetching** | TanStack Query (React Query) v5 |
| **UI Components** | Lucide React, Class Variance Authority |
| **Deployment** | Cloudflare Workers via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) |
| **External API** | [Moodle Web Services REST API](https://docs.moodle.org/dev/Web_services) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18.x
- A running Moodle instance (self-hosted or institutional)
- Moodle Web Services enabled with the **Moodle Mobile Web** service

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/noppakorn001/Noti-LMS-main.git
cd Noti-LMS-main

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

> Open [http://localhost:3000](http://localhost:3000) in your browser.

### Or use the included scripts

```bash
# Linux / macOS
./run.sh

# Windows
Double-click run.bat
```

---

## 🔑 How to Use

1. Navigate to the live site or your local server.
2. Enter your **Moodle Site URL** (e.g., `https://lms.youruniversity.edu`).
3. Enter your **Moodle Username** and **Password** — the same credentials you use to log into Moodle.
4. Click **Sign In** to load your personalized task dashboard.

> ⚠️ **Note:** Your credentials are sent directly to your institution's Moodle server. They are **never** stored by this application.

---

## ☁️ Deployment (Cloudflare Workers)

This project uses the [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare) to run on Cloudflare Workers.

### Build for Cloudflare

```bash
npm run build:cf
```

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

> On first run, Wrangler will open a browser window to authenticate your Cloudflare account.

### Or use the included scripts

```bash
# Linux / macOS
./deploy.sh

# Windows
Double-click deploy.bat
```

### Build Settings for Cloudflare Pages (GitHub CI/CD)

| Setting | Value |
|---|---|
| **Build command** | `npm run build:cf` |
| **Build output directory** | `.open-next` |
| **Compatibility Flag** | `nodejs_compat` |

---

## 📁 Project Structure

```
Noti-LMS-main/
├── app/
│   ├── api/
│   │   └── moodle/
│   │       ├── token/route.ts    # Moodle authentication proxy
│   │       └── rest/route.ts     # Moodle REST API proxy
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page entry point
├── components/
│   ├── dashboard-app.tsx         # Main dashboard component
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── moodle-url.ts             # URL normalization utility
│   └── utils.ts                  # Shared utilities
├── services/
│   ├── authService.ts            # Authentication service
│   ├── assignmentService.ts      # Assignment data fetching
│   ├── examService.ts            # Quiz/exam data fetching
│   └── moodleClient.ts           # Moodle API client
├── wrangler.jsonc                # Cloudflare Workers config
├── open-next.config.ts           # OpenNext build config
├── run.bat                       # Local dev helper (Windows)
└── deploy.bat                    # Cloudflare deploy helper (Windows)
```

---

## 🔒 Security

- All Moodle API calls are proxied through Next.js API routes — the client never calls Moodle directly.
- Credentials are transmitted over HTTPS and used only to obtain a short-lived Moodle session token.
- No user data, passwords, or tokens are persisted on the server or in any database.
- Rate limiting and input validation are applied at the API proxy layer.

---

## 📄 License

This project is intended for educational and personal use.

---

<div align="center">

Built with ❤️ by **Noppakorn** | Powered by [Cloudflare Workers](https://workers.cloudflare.com/) & [Next.js](https://nextjs.org/)

**🌐 [https://notilms.noppakornwunnoy01.workers.dev/](https://notilms.noppakornwunnoy01.workers.dev/)**

</div>
