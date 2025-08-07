# Biographical Survey Application

## Overview

This is a full-stack web application for conducting biographical surveys with both text and audio response capabilities. The application presents users with a series of structured questions about their life history, allowing them to respond either through written text or audio recordings. It's built as a modern single-page application with a React frontend and Express.js backend, designed to collect comprehensive biographical data for research or personal documentation purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and API interactions
- **Routing**: React Router for client-side navigation
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload using tsx for TypeScript execution
- **Build Process**: ESBuild for production bundling

### Data Storage
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Connection pooling with @neondatabase/serverless

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Surveys Table**: Survey completion records linked to email addresses
- **Responses Table**: Individual question responses supporting both text and audio formats
- **Response Types**: Flexible response system supporting text answers, audio URLs, and word counts

### Authentication and Data Flow
- **Storage Interface**: Abstracted storage layer with both memory and database implementations
- **Data Validation**: Zod schemas for runtime type checking and API request validation
- **Response Handling**: Support for both text responses (with word counting) and audio responses (with URL storage)

### Audio Capabilities
- **Recording**: Browser-based audio recording using MediaRecorder API
- **Playback**: HTML5 audio controls for response playback
- **Storage**: Audio files stored as blobs with URL references in the database

### Development Experience
- **Hot Reload**: Vite development server with React hot module replacement
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Path Aliases**: Configured import aliases for clean module resolution
- **Error Handling**: Runtime error overlay for development debugging

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM and query builder
- **express**: Web application framework for the backend API
- **react**: Frontend UI framework with hooks and context
- **@tanstack/react-query**: Server state management and API caching

### UI and Styling
- **@radix-ui/react-***: Accessible UI component primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe utility for creating component variants
- **lucide-react**: Icon library with React components

### Development and Build Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution engine for Node.js
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### Form and Data Management
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolvers for form integration
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### Audio and Media
- **MediaRecorder API**: Browser-native audio recording capabilities
- **HTML5 Audio**: Built-in audio playback functionality

### Database and Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

## Recent Migration Improvements (January 2025)

**Migration from Lovable to Replit - COMPLETED**
- ✅ Successfully migrated from Supabase to PostgreSQL with Drizzle ORM
- ✅ Implemented intermediate progress saving with auto-save functionality  
- ✅ Added survey completion tracking and resume capabilities
- ✅ Created JSON export functionality for survey data
- ✅ Optimized frontend with modern React patterns and TanStack Query
- ✅ Added comprehensive progress tracking (87 total questions)
- ✅ Implemented proper database schema with surveys, responses, and user tables
- ✅ Added API endpoints for CRUD operations with proper validation
- ✅ Enhanced UI with progress indicators, auto-save notifications, and export buttons
- ✅ Verified complete end-to-end workflow functionality