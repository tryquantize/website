# Migration Guide

This document helps you migrate from the old structure to the new monorepo structure.

## What Changed?

### Directory Structure

**Before:**
```
.
├── ai_service/
├── client/
├── server/
├── shared/
├── launch.sh
├── startup.sh
├── start-services.js
├── cleanup.js
└── restart.txt
```

**After:**
```
.
├── packages/
│   ├── ai-service/
│   ├── client/
│   ├── server/
│   └── shared/
├── docker-compose.yml
├── docker-compose.dev.yml
└── .dockerignore
```

### Key Changes

1. **Monorepo Structure**: All packages moved to `packages/` directory
2. **Renamed**: `ai_service` → `ai-service` (with hyphen)
3. **Removed Files**: All redundant startup scripts removed
4. **Docker Support**: Complete Docker configuration added
5. **CI/CD**: GitHub Actions workflow added

## Migration Steps

### For Developers

1. **Pull the latest changes:**
   ```bash
   git pull origin main
   ```

2. **Remove old dependencies:**
   ```bash
   rm -rf node_modules
   rm -rf packages/ai-service/venv
   ```

3. **Reinstall dependencies:**
   ```bash
   yarn install
   ```

4. **Set up AI service (if needed):**
   ```bash
   cd packages/ai-service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ../..
   ```

### Updated Commands

#### Old Commands vs New Commands

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `./launch.sh` | `yarn dev` | Simpler development start |
| `./startup.sh` | `yarn dev` | Unified command |
| `node cleanup.js` | *Removed* | No longer needed |
| `cd ai_service && python app.py` | `cd packages/ai-service && python app.py` | Updated path |

#### New Docker Commands

```bash
# Production
docker-compose up -d

# Development with hot-reload
docker-compose -f docker-compose.dev.yml up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Import Path Updates

If you have any custom code that imports from these packages:

**Before:**
```typescript
import { schema } from "@shared/schema";
import Component from "@/components/Component";
```

**After:**
```typescript
// No change needed - aliases are configured automatically
import { schema } from "@shared/schema";
import Component from "@/components/Component";
```

The TypeScript path mappings have been updated in `tsconfig.json` to handle the new structure automatically.

### Environment Variables

No changes needed for environment variables. Continue using:
- `packages/ai-service/.env` for AI service configuration

### Deployment Changes

#### Old Deployment
```bash
# Manual startup
./launch.sh
```

#### New Deployment

**Option 1: Docker (Recommended)**
```bash
docker-compose up -d
```

**Option 2: Traditional**
```bash
yarn build
yarn start
```

## Troubleshooting

### Issue: Import errors after migration

**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
yarn install
```

### Issue: TypeScript errors about paths

**Solution:** Clear TypeScript build cache:
```bash
rm -rf node_modules/typescript/tsbuildinfo
yarn check
```

### Issue: AI service not found

**Solution:** Update the path:
```bash
cd packages/ai-service  # Not ai_service
```

### Issue: Docker build fails

**Solution:** Ensure you're building from the project root:
```bash
# For server and client, build from root
docker-compose build

# For ai-service specifically
docker build -f packages/ai-service/Dockerfile packages/ai-service
```

## Benefits of New Structure

1. **Better Organization**: Clear separation of packages
2. **Docker Support**: Easy deployment and development
3. **Consistent Naming**: Hyphenated package names
4. **Simpler Commands**: Single `yarn dev` command
5. **CI/CD Ready**: Automated testing with GitHub Actions
6. **Better Documentation**: Comprehensive README files with diagrams

## Getting Help

If you encounter issues:
1. Check this migration guide
2. Review the main [README.md](README.md)
3. Check package-specific README files in `packages/*/README.md`
4. Open an issue on GitHub

## Rollback (if needed)

If you need to temporarily rollback:
```bash
git checkout HEAD~4  # Go back before migration
```

However, we recommend moving forward with the new structure as it provides better long-term maintainability.
