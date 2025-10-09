# RAG (Retrieval-Augmented Generation) System

This RAG system provides search results based on curated company data and scraped content when web search is disabled.

## 📁 Folder Structure

```
rag/
├── companies/          # Individual company folders
├── categories/         # AI tool categories
├── services/          # Core RAG services
├── utils/             # Utility functions
└── data/              # Cached and processed data
```

## 🏢 Adding Company Data

### Step 1: Create Company Folder
Create a new folder in `companies/` with the company name (lowercase, no spaces):
```
companies/openai/
companies/anthropic/
companies/midjourney/
```

### Step 2: Add Required Files
Each company folder must contain these files:

#### `links.json` - URLs to scrape
```json
{
  "official_pages": [
    "https://openai.com",
    "https://openai.com/pricing"
  ],
  "reviews": [
    "https://www.g2.com/products/openai-gpt-3/reviews"
  ],
  "documentation": [
    "https://platform.openai.com/docs"
  ]
}
```

#### `company_info.txt` - Basic company information
```
Company: OpenAI
Founded: 2015
Headquarters: San Francisco, CA
Products: ChatGPT, GPT-4, DALL-E, Whisper
Description: AI research company focused on safe AGI
Website: https://openai.com
Category: AI Platform
Employees: 500+
```

#### `pricing.txt` - Pricing information
```
ChatGPT Plus: $20/month
GPT-4 API: $0.03/1K input tokens, $0.06/1K output tokens
GPT-3.5 Turbo: $0.001/1K input tokens, $0.002/1K output tokens
DALL-E 3: $0.040 per image
Free Tier: Available with limitations
```

#### `features.txt` - Product features
```
- Natural language processing
- Code generation and debugging
- Image generation with DALL-E
- Speech-to-text with Whisper
- API access for developers
- Custom model fine-tuning
- Enterprise security features
```

#### `use_cases.txt` - Use case examples
```
Content Creation:
- Blog writing and editing
- Social media content
- Marketing copy

Development:
- Code generation
- Bug fixing
- Documentation writing

Business:
- Customer support automation
- Data analysis
- Report generation
```

### Step 3: Optional Files
- `reviews.txt` - User reviews and testimonials
- `integrations.txt` - Available integrations
- `alternatives.txt` - Alternative tools

## 📂 Adding Categories

Create folders in `categories/` for different AI tool types:

### Example: `categories/ai_writing/`

#### `tools_list.txt`
```
OpenAI GPT-4
Jasper AI
Copy.ai
Writesonic
Grammarly
Notion AI
```

#### `comparison.txt`
```
Feature Comparison:
- OpenAI GPT-4: Best overall quality, API access
- Jasper AI: Marketing focused, templates
- Copy.ai: Affordable, user-friendly
- Grammarly: Grammar and style focus
```

#### `pricing_ranges.txt`
```
Free Tier: $0/month (limited)
Basic Plans: $10-30/month
Professional: $30-100/month
Enterprise: $100+/month
```

## 🔧 Usage

### Enable RAG Search
When `webSearchEnabled = false`, the system automatically uses RAG:

```python
# In search request
{
  "query": "AI writing tools for marketing",
  "webSearchEnabled": false  # This triggers RAG search
}
```

### Query Examples
- "AI writing tools under $50/month"
- "Image generation alternatives to DALL-E"
- "OpenAI pricing and features"
- "Best AI tools for code generation"

## 📝 Data Guidelines

### Company Info Format
- Keep descriptions concise (2-3 sentences)
- Include founding year and location
- List main products/services
- Specify target audience

### Pricing Format
- Use consistent currency (USD)
- Include free tiers if available
- Mention usage limits
- Add enterprise pricing if known

### Features Format
- Use bullet points
- Focus on key differentiators
- Include technical capabilities
- Mention integrations

## 🔄 Updating Data

### Manual Updates
1. Edit text files directly
2. Restart AI service to reload data

### Scraping Updates
1. Update `links.json` with new URLs
2. Run scraping service (automatic daily)
3. Check `data/scraped_cache/` for results

## 🚀 Best Practices

1. **Consistent Naming**: Use lowercase folder names without spaces
2. **Regular Updates**: Update pricing and features monthly
3. **Quality Control**: Verify information accuracy
4. **Comprehensive Data**: Include all major competitors
5. **Structured Format**: Follow the template formats exactly

## 🔍 Search Behavior

The RAG system will:
1. Search through all company data
2. Match queries to relevant companies
3. Extract only factual information
4. Use LLM to format and organize results
5. Return structured company data

**Note**: The LLM only formats existing data - it doesn't generate new information.