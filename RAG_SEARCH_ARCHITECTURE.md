# RAG Search Architecture - Complete Technical Documentation

## Overview

The Quantize website implements a sophisticated RAG (Retrieval-Augmented Generation) search system with dual modes: **RAG-Only Mode** for curated data and **Web Search Mode** for real-time information. The system intelligently switches between these modes based on user preferences.

## Architecture Flow

```
Frontend → Express API → Python Flask AI Service → {RAG System OR Exa API} → LLM Processing → Response
```

## Search Modes

### 1. RAG-Only Mode (`webSearchEnabled = false`)
- Uses pre-curated local company data
- Fast, accurate, and reliable results
- No external API dependencies for data retrieval
- LLM used only for formatting and presentation

### 2. Web Search Mode (`webSearchEnabled = true`)
- Uses real-time Exa API for current information
- LLM extracts and structures web data
- Includes proper citations and sources
- Fallback to RAG data if APIs fail

## Detailed Data Flow

### Step 1: Frontend Search Initiation
**Location**: `apps/web/src/components/search-interface.tsx`

**Request Format**:
```json
{
  "query": "user search query",
  "userId": "user_id",
  "selectedModel": "GPT-4o Mini",
  "selectedTypes": ["company", "product"],
  "selectedLocations": ["San Francisco"],
  "webSearchEnabled": true/false
}
```

### Step 2: Express API Processing
**Location**: `apps/api/src/routes/routes.ts` - `/api/search` endpoint

**Actions**:
- Records search analytics
- Proxies request to Python AI service at `http://localhost:5002/search`
- Handles fallback responses if AI service fails

### Step 3: AI Service Decision Logic
**Location**: `apps/ai-service/src/services/ai_agent.py`

**Critical Decision**: Routes to RAG or Web Search based on `webSearchEnabled` flag

## RAG-Only Mode Implementation

### Data Loading Process
**Location**: `apps/ai-service/src/rag/services/data_loader.py`

**Data Structure**:
```
apps/ai-service/src/rag/companies/[company_name]/
├── company_info.txt    # Basic company information
├── features.txt        # Key features and capabilities
├── pricing.txt         # Pricing models and ranges
├── use_cases.txt       # Applications and use cases
├── clients.txt         # Client information
└── links.json          # Social and web links
```

**Process**:
- Loads all company data into memory on service startup
- Supports hot-reloading for data updates
- Structured text parsing for consistent data format

### Text Matching Algorithm
**Location**: `apps/ai-service/src/rag/services/text_matcher.py`

**Scoring System**:
- **Exact phrase matches**: +20.0 points
- **Multi-word phrase matches**: +15.0 points
- **Individual word matches**: +1.5 to +3.0 points (weighted by section)
- **Company name matches**: +10.0 points
- **Category relevance**: +5.0 points
- **Minimum threshold**: 5.0 points for relevance
- **Match requirement**: 50% of query words must match

### LLM Enrichment (RAG Mode)
**Location**: `apps/ai-service/src/rag/services/llm_enricher.py`

**Usage**: ONLY for formatting and presentation - NO new information generation

**Functions**:
- Formats RAG data into conversational responses
- Generates enhanced descriptions (150 words)
- Creates key specifications (5 specs, 10 words each)
- Produces enhanced use cases (3 cases, 15 words each)
- Uses strict prompts to prevent hallucination

## Web Search Mode Implementation

### Exa API Integration
**Location**: `apps/ai-service/src/services/exa_search.py`

**Configuration**:
- **API Key**: `EXA_API_KEY` from environment
- **Endpoint**: `https://api.exa.ai/search`
- **Search Type**: Neural search with content extraction

**Domain Targeting**:
- **Companies**: techcrunch.com, crunchbase.com, yourstory.com
- **Products**: producthunt.com, github.com
- **Freelancers**: upwork.com, freelancer.com

### Real-time Data Processing
**Process**:
1. Enhances query with location filters
2. Calls Exa API with domain-specific searches
3. Extracts titles, URLs, and content snippets
4. Creates citation references for sources
5. Formats results for LLM processing

### LLM Processing (Web Mode)
**Functions**:
- Extracts structured company data from unstructured web content
- Generates AI responses with proper citations
- Creates company cards with real-time information
- Handles data enrichment and formatting

## Company Card Data Population

### RAG Mode Data Mapping
| Card Field | Data Source | Processing |
|------------|-------------|------------|
| Basic Info | `company_info.txt` | Direct parsing |
| Features | `features.txt` | List extraction |
| Pricing | `pricing.txt` | Text parsing |
| Key Specifications | `features.txt` + `use_cases.txt` | LLM generation (5 specs) |
| Enhanced About | All files | LLM generation (150 words) |
| Enhanced Use Cases | `use_cases.txt` + industries | LLM generation (3 cases) |
| Location | `company_info.txt` | Direct extraction |
| Founded | `company_info.txt` | Direct extraction |
| Employees | `company_info.txt` | Direct extraction |

### Web Search Mode Data Sources
- **Primary**: Real-time Exa API results
- **Processing**: LLM extraction and structuring
- **Enrichment**: CompanyEnrichmentAgent enhancement
- **Fallback**: Predefined company data

## LLM Usage Breakdown

### When LLM IS Used
1. **RAG Enhancement**: Formatting raw data into user-friendly descriptions
2. **Web Data Extraction**: Structuring unstructured web content
3. **Response Generation**: Creating coherent AI explanations
4. **Suggestion Generation**: Related search recommendations
5. **Company Comparison**: Comparative analysis generation
6. **Content Enhancement**: Specifications, descriptions, use cases

### When LLM is NOT Used
1. **Data Loading**: Direct file system operations
2. **Text Matching**: Algorithmic keyword matching and scoring
3. **Basic Parsing**: Structured data extraction from text files
4. **Filtering**: Type and location filtering logic
5. **Citation Management**: Simple reference numbering

## External API Dependencies

### OpenRouter API (LLM Operations)
- **Key**: `OPENROUTER_API_KEY`
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Models**: GPT-4o Mini, Gemini 2.0 Flash, Qwen2.5, Llama 3.1, etc.
- **Usage**: All text generation and enhancement operations

### Exa API (Web Search)
- **Key**: `EXA_API_KEY`
- **Endpoint**: `https://api.exa.ai/search`
- **Usage**: Real-time web search when `webSearchEnabled = true`
- **Features**: Neural search, domain filtering, content extraction

### ⚠️ Important Note: Exotel API
**Exotel API is NOT used** in the RAG search functionality. The system only uses OpenRouter and Exa APIs.

## Fallback Mechanisms

### API Failure Handling
1. **Exa API Failure**: Falls back to predefined company data
2. **OpenRouter API Failure**: Uses simple text formatting
3. **Complete Service Failure**: Returns helpful error messages with suggestions
4. **Data Missing**: Provides default values for all fields

### Data Reliability
- **RAG Mode**: 100% reliable (local data)
- **Web Mode**: High reliability with multiple fallback layers
- **Hybrid Approach**: Best of both worlds with intelligent switching

## Performance Optimizations

### Caching Strategy
- **RAG Data**: Loaded once on startup, kept in memory
- **LLM Responses**: Optimized token limits for faster processing
- **Web Results**: Temporary caching for citation management

### Response Times
- **RAG Mode**: ~500ms (local processing)
- **Web Mode**: ~2-3s (includes API calls)
- **Fallback**: ~200ms (cached responses)

## Configuration Files

### Environment Variables
```bash
# AI Service
OPENROUTER_API_KEY=your_openrouter_key
EXA_API_KEY=your_exa_key
AI_SERVICE_URL=http://localhost:5002

# Model Configuration
AI_MODEL=openai/gpt-4o-mini
```

### Key Configuration Files
- `apps/ai-service/src/config/config.py` - API keys and model settings
- `apps/ai-service/app.py` - Flask service entry point
- `apps/api/src/routes/routes.ts` - Express API endpoints

## Data Management

### Adding New Companies (RAG)
1. Create folder: `apps/ai-service/src/rag/companies/[company_name]/`
2. Add required files: `company_info.txt`, `features.txt`, `pricing.txt`, `use_cases.txt`
3. Restart AI service or call reload endpoint
4. Company automatically available in RAG searches

### Data Format Standards
- **Text Files**: UTF-8 encoding, structured format
- **Features**: Bullet points starting with `-` or `•`
- **Company Info**: Key-value pairs with `:` separator
- **Pricing**: Clear pricing models and ranges

## Monitoring and Analytics

### Search Analytics
- All searches recorded in Express API storage
- User behavior tracking for optimization
- Performance metrics for both modes

### Health Checks
- **Endpoint**: `/health` on AI service
- **Checks**: API connectivity, model availability, data loading status
- **Monitoring**: Service uptime and response times

## Development and Deployment

### Local Development
```bash
# Start all services
yarn launch

# Individual services
yarn dev          # Frontend only
cd apps/ai-service && python app.py  # AI service only
```

### Service Ports
- **Frontend**: http://localhost:3001
- **Express API**: http://localhost:3000
- **AI Service**: http://localhost:5002

### Testing
```bash
# Health check
curl http://localhost:5002/health

# Test search
curl -X POST http://localhost:5002/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI tools", "webSearchEnabled": false}'
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Startup script automatically kills existing processes
2. **API key errors**: Check `.env.local` configuration
3. **RAG data not loading**: Verify file permissions and encoding
4. **Slow responses**: Check API key limits and network connectivity

### Debug Mode
- Enable debug logging in `config.py`
- Monitor AI service logs for detailed processing information
- Use health check endpoint for service status

## Future Enhancements

### Planned Features
- Vector embeddings for improved RAG matching
- Caching layer for frequently accessed data
- Real-time data synchronization
- Advanced analytics and insights

### Scalability Considerations
- Database integration for RAG data
- Distributed caching system
- Load balancing for AI service
- API rate limiting and optimization