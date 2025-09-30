# Quantize Web

This package contains the Next.js frontend for Quantize.

## Overview

The web application is built with [Next.js](https://nextjs.org/) (App Router) and styled with [Tailwind CSS](https://tailwindcss.com/). It provides the main user interface for interacting with the Quantize platform.

### Key Features

- **Server-Side Rendering (SSR):** For fast initial page loads and improved SEO.
- **API Routes:** Backend logic is handled by Next.js API routes.
- **Authentication:** User authentication is managed via Firebase.
- **Component-Based Architecture:** The UI is built with reusable React components.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/)

### Development

To run the web application in a development environment, use the following command:

```bash
pnpm dev
```

This will start the Next.js development server on [http://localhost:3000](http://localhost:3000).

### Building for Production

To create a production-ready build, run:

```bash
pnpm build
```

This will generate an optimized version of the application in the `.next` directory.

## Docker

The web application can also be run inside a Docker container.

### Development

To start the development server with Docker, use:

```bash
docker-compose -f docker-compose.dev.yml up --build web
```

### Production

To build and run the application in a production environment, use:

```bash
docker-compose up --build web
```

