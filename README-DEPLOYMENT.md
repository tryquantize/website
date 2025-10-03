# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Set up required environment variables

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `quantize-website`

### 2. Configure Build Settings

Vercel should automatically detect the settings, but verify:

- **Framework Preset**: Other
- **Build Command**: `yarn build`
- **Output Directory**: `dist/public`
- **Install Command**: `yarn install`

### 3. Environment Variables

Add these environment variables in Vercel dashboard:

```
NODE_ENV=production
```

Optional (for database):
```
DATABASE_URL=your_database_url_here
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Project Structure for Vercel

```
quantize-website/
├── server/           # Backend API (serverless functions)
├── client/           # React frontend
├── shared/           # Shared schemas
├── vercel.json       # Vercel configuration
├── package.json      # Build scripts
└── .vercelignore     # Files to ignore during deployment
```

## Build Process

1. **Frontend Build**: Vite builds React app to `dist/public/`
2. **Backend**: Server files are deployed as serverless functions
3. **Routing**: API routes go to `/server/index.ts`, static files served from `dist/public/`

## Features Disabled in Production

- **AI Service**: Python AI service is disabled in production (Vercel doesn't support Python)
- **Fallback**: Traditional search is used instead of AI-powered search

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compilation with `yarn check`

### Runtime Errors

1. Check function logs in Vercel dashboard
2. Verify environment variables are set
3. Check API routes are working

### Frontend Issues

1. Verify static files are being served from `dist/public/`
2. Check browser console for errors
3. Ensure all imports use relative paths (not aliases)

## Local Testing

Test the production build locally:

```bash
yarn build
yarn start
```

## Monitoring

- **Analytics**: Available in Vercel dashboard
- **Logs**: Function logs available in dashboard
- **Performance**: Core Web Vitals tracking included