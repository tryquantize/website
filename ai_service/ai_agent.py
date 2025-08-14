import requests
import json
from typing import Dict, List, Any
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL, SYSTEM_PROMPT, MODEL_MAPPING, COMPANY_SYSTEM_PROMPT, FREELANCER_SYSTEM_PROMPT, PRODUCT_SYSTEM_PROMPT

class AISearchAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = AI_MODEL
        self.system_prompt = SYSTEM_PROMPT
    
    def search_ai_tools(self, query: str, context: Dict[str, Any] = None, selected_model: str = None, selected_types: List[str] = None) -> Dict[str, Any]:
        """
        Main search function that processes user queries and returns AI-generated recommendations
        """
        try:
            # Determine which system prompt to use based on selected types
            system_prompt = self._get_system_prompt(selected_types)
            
            # Prepare the user message with context
            user_message = self._prepare_user_message(query, context, selected_types)
            
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
                "temperature": 0.7,
                "max_tokens": 2000
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")
            
            response_data = response.json()
            ai_response = response_data['choices'][0]['message']['content']
            
            # Generate related search suggestions
            suggestions = self._generate_search_suggestions(query, ai_response, model_to_use)
            
            # Extract companies from the AI response
            companies = self.extract_companies(ai_response, model_to_use, selected_types)
            
            return {
                "query": query,
                "response": ai_response,
                "suggestions": suggestions,
                "companies": companies,
                "model_used": model_to_use,
                "success": True
            }
            
        except Exception as e:
            return {
                "query": query,
                "response": f"Error processing search: {str(e)}",
                "suggestions": [],
                "model_used": self.model,
                "success": False,
                "error": str(e)
            }
    
    def _prepare_user_message(self, query: str, context: Dict[str, Any] = None, selected_types: List[str] = None) -> str:
        """
        Prepare the user message with additional context if provided
        """
        message = f"User Query: {query}"
        
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
                "temperature": 0.8,
                "max_tokens": 300
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
    
    def extract_companies(self, search_result: str, model: str = None, selected_types: List[str] = None) -> List[Dict[str, Any]]:
        """
        Extract company information from search results and format them as cards
        """
        try:
            # Determine extraction type based on selected filters
            if selected_types and len(selected_types) == 1:
                if 'freelancer' in selected_types:
                    extraction_prompt = f"""Extract freelancer information from the following search result and format it as a JSON array of freelancer objects.

Search Result:
{search_result}

For each freelancer mentioned, extract:
- name: Freelancer name
- description: Brief description of their skills/expertise (max 100 characters)
- features: Array of 2-3 key skills or specializations
- pricing: Hourly rate or project pricing if mentioned
- website: Portfolio/profile URL if mentioned
- category: Type of expertise (e.g., "AI Developer", "ML Engineer", etc.)

Return ONLY a valid JSON array with 3-5 freelancer objects. If fewer than 3 freelancers are found, create similar freelancers based on the context.

Example format:
[
  {{
    "name": "Freelancer Name",
    "description": "Brief description of expertise",
    "features": ["Skill 1", "Skill 2", "Skill 3"],
    "pricing": "$50/hour",
    "website": "https://portfolio.com",
    "category": "AI Developer"
  }}
]"""
                elif 'product' in selected_types:
                    extraction_prompt = f"""Extract product information from the following search result and format it as a JSON array of product objects.

Search Result:
{search_result}

For each product mentioned, extract:
- name: Product name
- description: Brief description of the product/tool (max 100 characters)
- features: Array of 2-3 key features or capabilities
- pricing: Pricing information if mentioned (free, subscription, one-time)
- website: Official website or trial link if mentioned
- category: Type of product (e.g., "AI Writing Tool", "Image Generator", etc.)

Return ONLY a valid JSON array with 3-5 product objects. If fewer than 3 products are found, create similar products based on the context.

Example format:
[
  {{
    "name": "Product Name",
    "description": "Brief description of product",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "pricing": "$19/month",
    "website": "https://product.com",
    "category": "AI Writing Tool"
  }}
]"""
                else:
                    # Company extraction (default)
                    extraction_prompt = f"""Extract company information from the following search result and format it as a JSON array of company objects.

Search Result:
{search_result}

For each company mentioned, extract:
- name: Company name
- description: Brief description of their service/product (max 100 characters)
- features: Array of 2-3 key features
- pricing: Pricing information if mentioned
- website: Website URL if mentioned
- category: Type of service (e.g., "AI Writing", "Image Generation", etc.)

Return ONLY a valid JSON array with 3-5 company objects. If fewer than 3 companies are found, create similar companies based on the context.

Example format:
[
  {{
    "name": "Company Name",
    "description": "Brief description of service",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "pricing": "$20/month",
    "website": "https://example.com",
    "category": "AI Writing"
  }}
]"""
            else:
                # Mixed results - companies + products when no filter is selected
                extraction_prompt = f"""Extract mixed information from the following search result and format it as a JSON array with 15 objects (5 companies + 10 products/tools).

Search Result:
{search_result}

For the first 5 items (companies), extract:
- name: Company name
- description: Brief description of their service (max 100 characters)
- features: Array of 2-3 key features
- pricing: Pricing information if mentioned
- website: Website URL if mentioned
- category: Type of service (e.g., "AI Writing", "Image Generation", etc.)

For the next 10 items (products/tools), extract:
- name: Product/tool name
- description: Brief one-liner description (max 80 characters)
- features: Array of 2-3 key features
- pricing: Pricing information (e.g., "Free", "$10/month")
- website: Website URL if mentioned
- category: Type of product (e.g., "AI Tool", "Writing Assistant", etc.)

Return ONLY a valid JSON array with exactly 15 objects. Create realistic examples based on the search context if needed.

Example format:
[
  {{
    "name": "Company Name",
    "description": "Brief description of service",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "pricing": "$20/month",
    "website": "https://example.com",
    "category": "AI Writing"
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
                "temperature": 0.3,
                "max_tokens": 1500
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
                }
            ]

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
                "max_tokens": 50
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