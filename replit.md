# Overview

This project is an AI tools discovery platform that connects businesses with relevant AI solutions through intelligent search. The platform features a ChatGPT-like conversational interface for clients to discover tools and a comprehensive dashboard for AI startups to manage their tool listings. The system includes role-based access control supporting clients, startups, and administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React 18 with TypeScript in a Vite development environment. It uses wouter for client-side routing instead of React Router, providing lightweight navigation. The UI is styled with Tailwind CSS and uses shadcn/ui components for consistent design patterns. State management is handled through Zustand for authentication state and TanStack Query for server state management and caching.

## Backend Architecture
The backend uses Express.js with TypeScript, providing RESTful API endpoints for authentication, tool management, search functionality, and administrative operations. The server implements middleware for request logging and error handling, with development-specific features like Vite integration for hot module replacement during development.

## Database Design
The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes users with role-based permissions (client, startup, admin), AI tools with approval workflows, contact requests for business connections, search queries for analytics, and tool analytics for tracking engagement. The database supports enum types for user roles, tool statuses, and pricing models.

## Authentication & Authorization
Authentication is implemented using bcrypt for password hashing and session-based authentication. The system maintains user sessions and implements role-based access control throughout the application. Client-side authentication state is persisted using Zustand with localStorage persistence.

## Search & Discovery
The platform implements both traditional filtering (by pricing model, industries, features) and prepares for semantic search capabilities through a dedicated embeddings table. The search interface mimics a ChatGPT-like conversational experience, allowing users to describe their needs in natural language.

## UI Component System
The frontend uses a comprehensive component library based on Radix UI primitives with custom styling through shadcn/ui. This provides accessible, customizable components including forms, dialogs, tables, and navigation elements. The design system supports both light and dark themes with CSS custom properties.

# External Dependencies

- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack React Query for server state, Zustand for client state
- **Password Security**: bcryptjs for hashing
- **Development**: Vite for build tooling and development server
- **Deployment**: Replit-specific plugins for development environment integration