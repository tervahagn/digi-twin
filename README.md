# DigiTwin

![DigiTwin Logo](attached_assets/logo%203_1754592565987.png)

A comprehensive biographical survey application for creating digital twins through structured personal data collection.

## Overview

DigiTwin is a web application that guides users through an extensive biographical questionnaire designed to capture the essence of their personality, experiences, and worldview. The collected data can be used to create digital representations or AI models that reflect the user's unique characteristics.

## Features

- **Comprehensive Survey**: 70+ questions across 15 categories covering biography, values, relationships, and more
- **Flexible Response Types**: Text or audio responses for each question
- **Real-time Progress Tracking**: Visual progress indicators and auto-save functionality  
- **Multiple Export Formats**: Download responses as Markdown, PDF, or send via email
- **Audio Recording**: Built-in voice recording with playback capabilities
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript, Tailwind CSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Audio**: Web Audio API for recording functionality
- **Email**: SendGrid integration for survey delivery

## 🚀 Live Demo

**Custom Domain**: https://digi-twin.tervahagn.com/
**GitHub Pages**: https://tervahagn.github.io/digi-twin/

> **Note**: If you see this README instead of the app, the GitHub Actions deployment is still in progress. Please wait a few minutes and refresh.

## Getting Started

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5000`

### GitHub Pages Deployment

This project is configured for deployment to GitHub Pages from the `main` branch (serving the `docs/` folder):

- **Build static files**: `npm run build:gh-pages` (output goes into `docs/`)

#### GitHub Pages Setup
1. Go to repository Settings → Pages
2. Under "Source", select **main** branch and `/docs` folder
3. Save to enable GitHub Pages serving from `docs/`

### Full Production Setup (Optional)

For full backend functionality:

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your database and SendGrid API key
   ```

2. **Run database migrations**
   ```bash
   npm run db:push
   ```

3. **Build and start**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (full-stack)
- `npm run build:gh-pages` - Build for GitHub Pages (frontend only)
- `npm run start` - Start production server
- `npm run preview` - Preview production build locally
- `npm run db:push` - Push database schema changes

## Survey Categories

The questionnaire covers 15 comprehensive sections:
- Biography & Personal History
- Values, Beliefs & Character Traits  
- Relationships & Significant People
- Professional & Creative Experience
- Hobbies, Tastes & Preferences
- Emotions & Behavioral Reactions
- Philosophy, Meaning & Legacy
- Speech Style & Communication
- Digital Ethics & Legacy
- Daily Habits & Routines
- Thinking & Decision-Making
- Humor & Perception Style
- Cultural & Social Context
- Archetypes & Symbols
- Visual Preferences & Metaphors

## License

MIT License - see LICENSE file for details
