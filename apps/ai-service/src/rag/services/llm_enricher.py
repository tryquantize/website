import requests
from typing import Dict, List, Any
from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL
import logging

logger = logging.getLogger(__name__)

class LLMEnricher:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = AI_MODEL
    
    def enrich_rag_data(self, query: str, matching_companies: List[Dict[str, Any]]) -> str:
        """
        Use LLM to format and enrich RAG data - NO NEW INFORMATION GENERATION
        LLM only organizes and presents the existing RAG data
        """
        if not matching_companies:
            return "No matching companies found in our knowledge base for your query."
        
        # Prepare RAG context from company data
        rag_context = self._prepare_rag_context(matching_companies)
        
        # Create strict prompt that prevents hallucination
        prompt = self._create_enrichment_prompt(query, rag_context)
        
        try:
            response = self._call_llm(prompt)
            if response and len(response.strip()) > 10:
                return response
            else:
                logger.warning("LLM returned empty/short response, using fallback")
                return self._fallback_formatting(query, matching_companies)
        except Exception as e:
            logger.error(f"LLM enrichment failed: {e}")
            # Fallback to simple formatting
            return self._fallback_formatting(query, matching_companies)
    
    def _prepare_rag_context(self, matching_companies: List[Dict[str, Any]]) -> str:
        """Prepare structured context from RAG data"""
        context = "AVAILABLE COMPANY DATA:\n\n"
        
        for i, company in enumerate(matching_companies[:10], 1):  # Limit to top 10
            company_data = company.get('data', {})
            company_name = company.get('company_name', 'Unknown')
            
            context += f"Company {i}: {company_name}\n"
            
            # Add company info
            if company_data.get('company_info'):
                context += f"Info: {company_data['company_info'][:300]}...\n"
            
            # Add pricing
            if company_data.get('pricing'):
                context += f"Pricing: {company_data['pricing'][:200]}...\n"
            
            # Add features
            if company_data.get('features'):
                context += f"Features: {company_data['features'][:200]}...\n"
            
            # Add use cases
            if company_data.get('use_cases'):
                context += f"Use Cases: {company_data['use_cases'][:200]}...\n"
            
            context += "\n"
        
        return context
    
    def _create_enrichment_prompt(self, query: str, rag_context: str) -> str:
        """Create strict prompt that prevents LLM from generating new information"""
        return f"""You are a professional business consultant. Write a clean, conversational response using ONLY the provided company data.

STRICT FORMATTING RULES:
1. Write in smooth, flowing paragraphs - NO bullet points, asterisks (*), or lists
2. Use ONLY information from the data below - NO external knowledge
3. Write conversationally as if speaking to a business colleague
4. NO raw data dumps or technical formatting
5. Keep response between 80-150 words
6. Focus on the most relevant companies for the query
7. Always start with a direct answer to the user's query
8. Mention specific company names and their key capabilities

USER QUERY: {query}

{rag_context}

Write a helpful, conversational response that directly answers the user's query using the company information above. Start with "Based on our database, here are some great options for {query.lower()}..." and make it sound natural and professional.

Response:"""
    
    def _call_llm(self, prompt: str) -> str:
        """Call OpenRouter LLM API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://localhost:3001",
            "X-Title": "RAG Enrichment"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a professional business consultant who writes clean, conversational responses. Never use bullet points, asterisks, or raw data formatting. Write in smooth, natural paragraphs only."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "temperature": 0.4,  # Slightly higher for natural language
            "max_tokens": 180    # Focused responses
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code} - {response.text}")
        
        response_data = response.json()
        return response_data['choices'][0]['message']['content'].strip()
    
    def _fallback_formatting(self, query: str, matching_companies: List[Dict[str, Any]]) -> str:
        """Simple fallback formatting when LLM fails"""
        if not matching_companies:
            return f"No companies found matching '{query}' in our database."
        
        company_names = [company.get('company_name', 'Unknown') for company in matching_companies[:3]]
        
        if len(company_names) == 1:
            return f"Found {company_names[0]} for {query.strip()}. Check the company card below for detailed information about their AI voice solutions."
        elif len(company_names) == 2:
            return f"Found {company_names[0]} and {company_names[1]} for {query.strip()}. Both offer AI voice agent solutions - compare their features and pricing below."
        else:
            return f"Found several AI voice agent providers including {company_names[0]}, {company_names[1]}, and {company_names[2]}. Review the company cards below to find the best solution for your needs."
    

    
    def generate_key_specifications(self, company_name: str, features_text: str, use_cases_text: str, query: str = "") -> List[str]:
        """Generate 5 short key specifications using LLM from features and use cases, tailored to search query"""
        try:
            query_context = f"\n\nUser Search Query: {query}\nIMPORTANT: Focus specifications on features/capabilities most relevant to '{query}' from the company data." if query else ""
            
            prompt = f"""Based on the following company information, generate exactly 5 key specifications. Each specification should be exactly 10 words long.

Company: {company_name}

Features:
{features_text}

Use Cases:
{use_cases_text}{query_context}

Generate 5 technical specifications (exactly 10 words each) that highlight the most important capabilities{' related to the search query' if query else ''}. Format as a simple list, one per line.

Specifications:"""
            
            response = self._call_llm_simple(prompt)
            
            # Parse response into list
            specs = []
            for line in response.split('\n'):
                line = line.strip().lstrip('•-*').strip()
                if line and not line.startswith('Specifications:'):
                    specs.append(line)
            
            # Ensure we have exactly 5 specs
            if len(specs) >= 5:
                return specs[:5]
            else:
                fallback_specs = ["AI-powered solutions", "Easy integration", "Professional support", "Scalable architecture", "24/7 monitoring"]
                while len(specs) < 5:
                    specs.append(fallback_specs[len(specs)])
                return specs[:5]
                
        except Exception as e:
            logger.error(f"Key specifications generation failed: {e}")
            return ["AI-powered solutions", "Easy integration", "Professional support", "Scalable architecture", "24/7 monitoring"]
    
    def _call_llm_simple(self, prompt: str) -> str:
        """Simple LLM call for specifications generation"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://localhost:3001",
            "X-Title": "Specifications Generator"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a technical specification writer. Generate technical specifications that are exactly 10 words long each."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 100
        }
        
        response = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code}")
        
        return response.json()['choices'][0]['message']['content'].strip()
    
