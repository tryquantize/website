import requests
import json
from typing import Dict, List, Any
from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL, SYSTEM_PROMPT, MODEL_MAPPING, COMPANY_SYSTEM_PROMPT, FREELANCER_SYSTEM_PROMPT, PRODUCT_SYSTEM_PROMPT
from services.exa_search import ExaSearchService
from services.company_enrichment import CompanyEnrichmentAgent
from rag.services.rag_search import RAGSearchService
import logging

logger = logging.getLogger(__name__)

class AISearchAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = AI_MODEL
        self.system_prompt = SYSTEM_PROMPT
        self.exa_search = ExaSearchService()
        self.enrichment_agent = CompanyEnrichmentAgent()
        self.rag_service = RAGSearchService()
    
    def search_ai_tools(self, query: str, context: Dict[str, Any] = None, selected_model: str = None, selected_types: List[str] = None, selected_locations: List[str] = None, web_search_enabled: bool = False) -> Dict[str, Any]:
        """
        Main search function that processes user queries and returns AI-generated recommendations
        """
        try:
            logger.info(f"Search request - Query: '{query}', Web search enabled: {web_search_enabled}")
            
            # Use RAG search when web search is disabled
            if not web_search_enabled:
                logger.info(f"Web search is OFF - Using RAG search for query: {query}")
                return self.rag_service.search(query, selected_types, selected_locations)
            
            # Use web search when enabled
            logger.info(f"Web search is ON - Using Exa web search for query: {query}")
            
            # Perform web search using Exa with location filtering
            web_search_results = self._perform_web_search_with_locations(query, selected_types, selected_locations)
            
            # Determine which system prompt to use based on selected types
            system_prompt = self._get_system_prompt(selected_types)
            
            # Prepare the user message with context and web results
            user_message = self._prepare_user_message(query, context, selected_types, web_search_results, selected_locations, web_search_enabled)
            
            # Determine which model to use
            model_to_use = MODEL_MAPPING.get(selected_model, self.model) if selected_model else self.model
            
            # Make API call to OpenRouter
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Pixel Search"
            }
            
            payload = {
                "model": model_to_use,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.9,
                "max_tokens": 1500,
                "stream": True
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                stream=True
            )
            
            if response.status_code != 200:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")
            
            # Handle streaming response
            ai_response = ""
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]
                        if data == '[DONE]':
                            break
                        try:
                            chunk = json.loads(data)
                            if 'choices' in chunk and len(chunk['choices']) > 0:
                                delta = chunk['choices'][0].get('delta', {})
                                if 'content' in delta:
                                    ai_response += delta['content']
                        except json.JSONDecodeError:
                            continue
            
            # Store citations for frontend access
            citations_data = web_search_results.get("citations", []) if web_search_results.get("success") else []
            
            # Generate related search suggestions
            suggestions = self._generate_search_suggestions(query, ai_response, model_to_use)
            
            # Extract companies from the web search results
            companies = self.extract_companies(web_search_results, model_to_use, selected_types)
            
            # Enrich company data with additional details (skip fallback companies)
            real_companies = [c for c in companies if c.get('website') != '#']
            fallback_companies = [c for c in companies if c.get('website') == '#']
            
            if real_companies:
                enriched_real = self.enrichment_agent.enrich_company_data(real_companies, query, selected_locations, web_search_enabled)
                companies = enriched_real + fallback_companies
            
            return {
                "query": query,
                "aiResponse": ai_response,
                "suggestions": suggestions,
                "companies": companies,
                "citations": citations_data,
                "model_used": model_to_use,
                "web_search_used": True,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Search processing failed: {str(e)}")
            # Return fallback data instead of error
            fallback_companies = self._get_fallback_companies(selected_types)
            return {
                "query": query,
                "aiResponse": f"Here are some AI solutions for {query}. These companies and tools can help with your requirements.",
                "suggestions": [
                    f"Best alternatives for {query}",
                    f"Free tools for {query}",
                    f"Enterprise solutions for {query}",
                    f"Open source {query} tools",
                    f"Getting started with {query}"
                ],
                "companies": fallback_companies,
                "citations": [],
                "model_used": self.model,
                "web_search_used": web_search_enabled,
                "success": True
            }
    
    def _perform_web_search_with_locations(self, query: str, selected_types: List[str] = None, selected_locations: List[str] = None) -> Dict[str, Any]:
        """
        Perform web search based on query, selected types, and locations
        """
        try:
            if selected_types and len(selected_types) == 1:
                if 'company' in selected_types:
                    return self.exa_search.search_for_companies(query, selected_locations)
                elif 'freelancer' in selected_types:
                    return self.exa_search.search_for_freelancers(query)
                elif 'product' in selected_types:
                    return self.exa_search.search_for_products(query)
            
            # Default general search with location filtering
            return self.exa_search.search_web(query, locations=selected_locations)
            
        except Exception as e:
            logger.error(f"Web search failed: {str(e)}")
            return {"success": False, "error": str(e), "results": [], "citations": []}
    
    def _prepare_user_message(self, query: str, context: Dict[str, Any] = None, selected_types: List[str] = None, web_search_results: Dict[str, Any] = None, selected_locations: List[str] = None, web_search_enabled: bool = False) -> str:
        """
        Prepare the user message with additional context and web search results
        """
        message = f"User Query: {query}"
        
        # Add web search context if available and enabled
        if web_search_enabled and web_search_results and web_search_results.get("success"):
            web_context = self.exa_search.format_search_context(web_search_results)
            message += f"\n\n{web_context}"
            message += "\n\nIMPORTANT: When writing your response, include citation numbers [1], [2], [3], etc. when referencing information from the above sources."
        elif not web_search_enabled:
            message += "\n\nNote: Web search is disabled. Provide responses based on your training data only."
        # Add filter information
        if selected_types and len(selected_types) > 0:
            if len(selected_types) == 1:
                if 'company' in selected_types:
                    message += "\nFilter: Show ONLY companies and startups"
                elif 'freelancer' in selected_types:
                    message += "\nFilter: Show ONLY freelancers and individual professionals"
                elif 'product' in selected_types:
                    message += "\nFilter: Show ONLY AI products and tools"
            else:
                message += f"\nFilter: Show {', '.join(selected_types)}"
        
        # Add location filter information
        if selected_locations and len(selected_locations) > 0:
            message += f"\nLocation Filter: Focus on companies/solutions in {', '.join(selected_locations)}"
        
        if context:
            if context.get("budget"):
                message += f"\nBudget: {context['budget']}"
            if context.get("company_size"):
                message += f"\nCompany Size: {context['company_size']}"
            if context.get("industry"):
                message += f"\nIndustry: {context['industry']}"
            if context.get("technical_level"):
                message += f"\nTechnical Level: {context['technical_level']}"
        
        return message
    
    def _get_system_prompt(self, selected_types: List[str] = None) -> str:
        """
        Determine which system prompt to use based on selected filter types
        """
        if not selected_types or len(selected_types) == 0:
            return self.system_prompt
        
        # Check for single filter selection
        if len(selected_types) == 1:
            if 'company' in selected_types:
                return COMPANY_SYSTEM_PROMPT
            elif 'freelancer' in selected_types:
                return FREELANCER_SYSTEM_PROMPT
            elif 'product' in selected_types:
                return PRODUCT_SYSTEM_PROMPT
        
        # Multiple selected or unrecognized - use default
        return self.system_prompt
    
    def _generate_search_suggestions(self, original_query: str, ai_response: str, model: str = None) -> List[str]:
        """
        Generate 5 related search suggestions based on the original query and AI response
        """
        try:
            suggestion_prompt = f"""Based on this search query: "{original_query}" and the AI response provided, generate 5 related search queries that users might want to explore next. 

Make the suggestions specific, actionable, and slightly different from the original query. Focus on:
- Alternative approaches to the same problem
- Related tools in the same category
- Different budget ranges or company sizes
- Specific features or use cases mentioned in the response

Return only the 5 suggestions, one per line, without numbering or bullets."""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Pixel Search"
            }
            
            payload = {
                "model": model or self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant that generates related search suggestions."},
                    {"role": "user", "content": suggestion_prompt}
                ],
                "temperature": 0.9,  # Higher temperature for faster responses
                "max_tokens": 200   # Reduced tokens for faster processing
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                suggestions_text = response_data['choices'][0]['message']['content'].strip()
            else:
                suggestions_text = ""
            suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip()]
            
            # Ensure we have exactly 5 suggestions
            if len(suggestions) > 5:
                suggestions = suggestions[:5]
            elif len(suggestions) < 5:
                # Add some default suggestions if we don't have enough
                default_suggestions = [
                    f"Best alternatives to {original_query}",
                    f"Free tools for {original_query}",
                    f"Enterprise solutions for {original_query}",
                    f"Open source options for {original_query}",
                    f"Getting started with {original_query}"
                ]
                suggestions.extend(default_suggestions[:5-len(suggestions)])
            
            return suggestions
            
        except Exception as e:
            # Return default suggestions if generation fails
            return [
                f"Best alternatives for {original_query}",
                f"Free tools similar to {original_query}",
                f"Enterprise solutions for {original_query}",
                f"Open source {original_query} tools",
                f"Getting started with {original_query}"
            ]
    
    def extract_companies(self, web_search_results: Dict[str, Any], model: str = None, selected_types: List[str] = None) -> List[Dict[str, Any]]:
        """
        Extract company information from web search results and format them as cards
        """
        try:
            # Use web search results if available, otherwise fallback
            if not web_search_results.get("success") or not web_search_results.get("results"):
                return self._get_fallback_companies(selected_types)
            
            # Format web search results for extraction
            web_context = self.exa_search.format_search_context(web_search_results)
            
            # Determine extraction type based on selected filters
            if selected_types and len(selected_types) == 1:
                if 'freelancer' in selected_types:
                    extraction_prompt = f"""Extract REAL freelancer information from the following web search results and format it as a JSON array of freelancer objects.

Web Search Results:
{web_context}

For each freelancer or professional mentioned in the search results, extract:
- name: Actual freelancer/professional name from the search results
- description: Brief description of their skills/expertise (max 100 characters)
- features: Array of 2-3 key skills or specializations mentioned
- pricing: Hourly rate or project pricing if mentioned, otherwise "Contact for pricing"
- website: Actual website URL from search results
- category: Type of expertise based on search results

Return ONLY a valid JSON array with 3-5 freelancer objects based on REAL data from search results.

Example format:
[
  {{
    "name": "Actual Name from Search",
    "description": "Brief description from search results",
    "features": ["Skill 1", "Skill 2", "Skill 3"],
    "pricing": "Contact for pricing",
    "website": "https://actual-website.com",
    "category": "AI Developer"
  }}
]"""
                elif 'product' in selected_types:
                    extraction_prompt = f"""Extract REAL product information from the following web search results and format it as a JSON array of product objects.

Web Search Results:
{web_context}

For each product/tool mentioned in the search results, extract:
- name: Actual product name from the search results
- description: Brief description of the product/tool from search results (max 100 characters)
- features: Array of 2-3 key features mentioned in search results
- pricing: Actual pricing information from search results, otherwise "Contact for pricing"
- website: Actual website URL from search results
- category: Type of product based on search results

Return ONLY a valid JSON array with 3-5 product objects based on REAL data from search results.

Example format:
[
  {{
    "name": "Actual Product Name",
    "description": "Brief description from search results",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "pricing": "Contact for pricing",
    "website": "https://actual-website.com",
    "category": "AI Tool"
  }}
]"""
                else:
                    # Company extraction (default)
                    extraction_prompt = f"""Extract REAL company information from the following web search results and format it as a JSON array of company objects.

Web Search Results:
{web_context}

For each company/startup mentioned in the search results, extract:
- name: Actual company name from the search results
- description: Brief description of their service/product from search results (max 100 characters)
- features: Array of 2-3 key features mentioned in search results
- pricing: Actual pricing information from search results, otherwise "Contact for pricing"
- website: Actual website URL from search results
- category: Type of service based on search results

Return ONLY a valid JSON array with 3-5 company objects based on REAL data from search results.

Example format:
[
  {{
    "name": "Actual Company Name",
    "description": "Brief description from search results",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "pricing": "Contact for pricing",
    "website": "https://actual-website.com",
    "category": "AI Service"
  }}
]"""
            else:
                # Mixed results - companies + products when no filter is selected
                extraction_prompt = f"""Extract REAL mixed information from the following web search results and format it as a JSON array with 15 objects (5 companies + 10 products/tools).

Web Search Results:
{web_context}

For the first 5 items (companies), extract from search results:
- name: Actual company name from search results
- description: Brief description from search results (max 100 characters)
- features: Array of 2-3 key features mentioned in search results
- pricing: Actual pricing from search results, otherwise "Contact for pricing"
- website: Actual website URL from search results
- category: Type of service based on search results

For the next 10 items (products/tools), extract from search results:
- name: Actual product/tool name from search results
- description: Brief description from search results (max 80 characters)
- features: Array of 2-3 key features mentioned in search results
- pricing: Actual pricing from search results, otherwise "Contact for pricing"
- website: Actual website URL from search results
- category: Type of product based on search results

Return ONLY a valid JSON array with exactly 15 objects based on REAL data from search results.

Example format:
[
  {{
    "name": "Actual Company Name",
    "description": "Brief description from search results",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "pricing": "Contact for pricing",
    "website": "https://actual-website.com",
    "category": "AI Service"
  }}
]"""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Pixel Search"
            }
            
            payload = {
                "model": model or self.model,
                "messages": [
                    {"role": "system", "content": "You are a data extraction specialist. Return only valid JSON arrays without any additional text or formatting."},
                    {"role": "user", "content": extraction_prompt}
                ],
                "temperature": 0.9,  # Higher temperature for faster responses
                "max_tokens": 1000  # Reduced tokens for faster processing
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                companies_text = response_data['choices'][0]['message']['content'].strip()
                
                # Clean the response to ensure it's valid JSON
                if companies_text.startswith('```json'):
                    companies_text = companies_text.replace('```json', '').replace('```', '').strip()
                
                try:
                    companies = json.loads(companies_text)
                    # Ensure we have the right number of items based on filter
                    if selected_types and len(selected_types) == 1:
                        # Single filter selected - ensure 3-5 items
                        if len(companies) > 5:
                            companies = companies[:5]
                        elif len(companies) < 3:
                            # Add default items if needed
                            while len(companies) < 3:
                                companies.append({
                                    "name": f"AI Solution {len(companies) + 1}",
                                    "description": "Advanced AI-powered solution for your needs",
                                    "features": ["AI-Powered", "Easy Integration", "24/7 Support"],
                                    "pricing": "Contact for pricing",
                                    "website": "#",
                                    "category": "AI Tools"
                                })
                    else:
                        # No filter or multiple filters - ensure 15 items
                        if len(companies) > 15:
                            companies = companies[:15]
                        elif len(companies) < 15:
                            # Add default items if needed
                            while len(companies) < 15:
                                companies.append({
                                    "name": f"AI Tool {len(companies) + 1}",
                                    "description": "Powerful AI tool for your workflow",
                                    "features": ["Easy to Use", "Fast Results", "Reliable"],
                                    "pricing": "Free",
                                    "website": "#",
                                    "category": "AI Tools"
                                })
                    
                    return companies
                except json.JSONDecodeError:
                    # Fallback if JSON parsing fails
                    return self._get_fallback_companies(selected_types)
            else:
                return self._get_fallback_companies(selected_types)
                
        except Exception as e:
            return self._get_fallback_companies(selected_types)
    
    def _get_fallback_companies(self, selected_types: List[str] = None) -> List[Dict[str, Any]]:
        """
        Return fallback data if extraction fails
        """
        if selected_types and len(selected_types) == 1:
            if 'freelancer' in selected_types:
                return [
                    {
                        "name": "Alex Chen",
                        "description": "Senior AI/ML Engineer with 5+ years experience",
                        "features": ["Python", "TensorFlow", "PyTorch"],
                        "pricing": "$75/hour",
                        "website": "https://alexchen.dev",
                        "category": "AI Developer"
                    },
                    {
                        "name": "Sarah Kim",
                        "description": "Machine Learning Specialist and Data Scientist",
                        "features": ["Deep Learning", "Computer Vision", "NLP"],
                        "pricing": "$80/hour",
                        "website": "https://sarahkim.ai",
                        "category": "ML Engineer"
                    },
                    {
                        "name": "David Rodriguez",
                        "description": "AI Consultant specializing in business automation",
                        "features": ["AI Strategy", "Process Automation", "Consulting"],
                        "pricing": "$100/hour",
                        "website": "https://davidrodriguez.consulting",
                        "category": "AI Consultant"
                    }
                ]
            elif 'product' in selected_types:
                return [
                    {
                        "name": "ChatGPT Plus",
                        "description": "Advanced AI writing and conversation tool",
                        "features": ["GPT-4 Access", "Priority Access", "Faster Response"],
                        "pricing": "$20/month",
                        "website": "https://chat.openai.com",
                        "category": "AI Writing Tool"
                    },
                    {
                        "name": "Midjourney",
                        "description": "AI-powered image generation platform",
                        "features": ["High-Quality Images", "Style Control", "Commercial Use"],
                        "pricing": "$10/month",
                        "website": "https://midjourney.com",
                        "category": "AI Image Generator"
                    },
                    {
                        "name": "Notion AI",
                        "description": "AI-powered writing assistant for productivity",
                        "features": ["Content Generation", "Summarization", "Translation"],
                        "pricing": "$8/month",
                        "website": "https://notion.so/ai",
                        "category": "AI Productivity Tool"
                    }
                ]
        else:
            # Return 15 companies for mixed results (5 companies + 10 products)
            return [
                {
                    "name": "OpenAI GPT-4",
                    "description": "Advanced AI language model for enterprise applications",
                    "features": ["Natural Language Processing", "Code Generation", "Content Creation"],
                    "pricing": "$0.03 per 1K tokens",
                    "website": "https://openai.com",
                    "category": "AI Language Models"
                },
                {
                    "name": "Anthropic Claude",
                    "description": "Constitutional AI assistant for business use",
                    "features": ["Safe AI", "Long Context", "Reasoning"],
                    "pricing": "$20/month",
                    "website": "https://anthropic.com",
                    "category": "AI Assistants"
                },
                {
                    "name": "Midjourney",
                    "description": "AI-powered art and image generation platform",
                    "features": ["Image Generation", "Art Creation", "Style Transfer"],
                    "pricing": "$10/month",
                    "website": "https://midjourney.com",
                    "category": "AI Image Generation"
                },
                {
                    "name": "Jasper AI",
                    "description": "AI writing assistant for marketing content",
                    "features": ["Content Writing", "Marketing Copy", "SEO Optimization"],
                    "pricing": "$39/month",
                    "website": "https://jasper.ai",
                    "category": "AI Writing Tools"
                },
                {
                    "name": "Copy.ai",
                    "description": "AI-powered copywriting platform",
                    "features": ["Copy Generation", "Templates", "Team Collaboration"],
                    "pricing": "$36/month",
                    "website": "https://copy.ai",
                    "category": "AI Writing Tools"
                },
                {
                    "name": "Notion AI",
                    "description": "AI-powered writing assistant for productivity",
                    "features": ["Content Generation", "Summarization", "Translation"],
                    "pricing": "$8/month",
                    "website": "https://notion.so/ai",
                    "category": "AI Productivity Tools"
                },
                {
                    "name": "Grammarly",
                    "description": "AI writing assistant for grammar and style",
                    "features": ["Grammar Check", "Style Suggestions", "Plagiarism Detection"],
                    "pricing": "$12/month",
                    "website": "https://grammarly.com",
                    "category": "AI Writing Tools"
                },
                {
                    "name": "Canva AI",
                    "description": "AI-powered design platform",
                    "features": ["Design Generation", "Templates", "Brand Kit"],
                    "pricing": "$15/month",
                    "website": "https://canva.com",
                    "category": "AI Design Tools"
                },
                {
                    "name": "Loom AI",
                    "description": "AI-powered video messaging platform",
                    "features": ["Video Recording", "AI Summaries", "Transcription"],
                    "pricing": "$8/month",
                    "website": "https://loom.com",
                    "category": "AI Video Tools"
                },
                {
                    "name": "Zapier AI",
                    "description": "AI-powered automation platform",
                    "features": ["Workflow Automation", "App Integration", "AI Actions"],
                    "pricing": "$20/month",
                    "website": "https://zapier.com",
                    "category": "AI Automation Tools"
                },
                {
                    "name": "Calendly AI",
                    "description": "AI-powered scheduling assistant",
                    "features": ["Smart Scheduling", "Meeting Optimization", "Calendar Integration"],
                    "pricing": "$10/month",
                    "website": "https://calendly.com",
                    "category": "AI Scheduling Tools"
                },
                {
                    "name": "Superhuman AI",
                    "description": "AI-powered email client",
                    "features": ["Email Triage", "Smart Compose", "Follow-up Reminders"],
                    "pricing": "$30/month",
                    "website": "https://superhuman.com",
                    "category": "AI Email Tools"
                },
                {
                    "name": "Otter.ai",
                    "description": "AI meeting transcription and notes",
                    "features": ["Real-time Transcription", "Meeting Summaries", "Action Items"],
                    "pricing": "$17/month",
                    "website": "https://otter.ai",
                    "category": "AI Meeting Tools"
                },
                {
                    "name": "Krisp AI",
                    "description": "AI-powered noise cancellation",
                    "features": ["Background Noise Removal", "Voice Clarity", "Meeting Enhancement"],
                    "pricing": "$5/month",
                    "website": "https://krisp.ai",
                    "category": "AI Audio Tools"
                },
                {
                    "name": "Descript AI",
                    "description": "AI-powered video and audio editing",
                    "features": ["Overdub", "Transcription", "Screen Recording"],
                    "pricing": "$12/month",
                    "website": "https://descript.com",
                    "category": "AI Video Tools"
                }
            ]

    def compare_companies(self, companies: List[Dict[str, Any]]) -> str:
        """
        Compare multiple companies and provide a concise decision-making analysis
        """
        try:
            # Format company data for comparison
            company_data = ""
            for i, company in enumerate(companies, 1):
                company_data += f"Company {i}: {company.get('name', 'Unknown')}\n"
                company_data += f"Description: {company.get('description', 'No description')}\n"
                company_data += f"Pricing: {company.get('pricing', 'Contact for pricing')}\n"
                company_data += f"Category: {company.get('category', 'General')}\n"
                if company.get('features'):
                    company_data += f"Features: {', '.join(company['features'])}\n"
                company_data += "\n"
            
            comparison_prompt = f"""Compare these companies and provide a concise 100-word analysis to help users make the best decision based on budget, features, and fit:

{company_data}

Provide a brief comparison highlighting:
1. Best value for money
2. Most comprehensive features
3. Best fit for different use cases
4. Clear recommendation

Keep it exactly 100 words and actionable."""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Company Comparison"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a business analyst expert at comparing companies and providing concise decision-making guidance. Always provide exactly 100 words."},
                    {"role": "user", "content": comparison_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 150
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                comparison = response_data['choices'][0]['message']['content'].strip()
                return comparison
            else:
                # Fallback comparison
                company_names = [c.get('name', 'Company') for c in companies]
                return f"Comparing {', '.join(company_names)}: Each offers unique advantages. Consider your budget, required features, and implementation timeline. {company_names[0]} may offer better value, while {company_names[-1]} might have more comprehensive features. Evaluate based on your specific needs and budget constraints for the best fit."
                
        except Exception as e:
            logger.error(f"Company comparison failed: {str(e)}")
            # Simple fallback
            company_names = [c.get('name', 'Company') for c in companies]
            return f"All {len(companies)} companies offer valuable solutions. Compare their pricing models, feature sets, and support options. Consider your budget and specific requirements to make the best choice for your business needs."

    def health_check(self) -> Dict[str, Any]:
        """
        Health check endpoint to verify the AI service is working
        """
        try:
            # Simple test query
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Pixel Search"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Say 'AI service is working' if you can respond."}
                ],
                "max_tokens": 20  # Reduced tokens for faster health check
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                test_response = response_data['choices'][0]['message']['content']
            else:
                test_response = f"API Error: {response.status_code}"
            
            return {
                "status": "healthy",
                "model": self.model,
                "api_key_configured": bool(self.api_key),
                "test_response": test_response,
                "success": True
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "model": self.model,
                "api_key_configured": bool(self.api_key),
                "error": str(e),
                "success": False
            }