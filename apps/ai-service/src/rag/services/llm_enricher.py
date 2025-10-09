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
            return response
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
5. Keep response under 120 words
6. Focus on the most relevant companies for the query

USER QUERY: {query}

{rag_context}

Write a helpful, conversational paragraph that directly answers the user's query using the company information above. Make it sound natural and professional.

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
            return "No companies found in our database matching your query."
        
        response = f"Found {len(matching_companies)} companies in our database for '{query}':\n\n"
        
        for company in matching_companies[:5]:  # Top 5 companies
            company_name = company.get('company_name', 'Unknown')
            company_data = company.get('data', {})
            
            response += f"• {company_name}: "
            
            # Add brief description
            company_info = company_data.get('company_info', '')
            if 'Description:' in company_info:
                desc_line = [line for line in company_info.split('\n') if line.startswith('Description:')]
                if desc_line:
                    description = desc_line[0].replace('Description:', '').strip()
                    response += description[:100] + "...\n"
            else:
                response += "AI company providing innovative solutions.\n"
        
        return response
    
    def format_company_comparison(self, companies: List[Dict[str, Any]]) -> str:
        """Format company comparison using only RAG data"""
        if len(companies) < 2:
            return "Need at least 2 companies for comparison."
        
        comparison_context = self._prepare_comparison_context(companies)
        
        prompt = f"""STRICT INSTRUCTION: Compare these companies using ONLY the provided data.

{comparison_context}

Create a brief comparison focusing on:
1. Key differences in features
2. Pricing differences (if available)
3. Best use cases for each

Use ONLY the information provided above. Do not add external knowledge.

Comparison:"""
        
        try:
            return self._call_llm(prompt)
        except Exception as e:
            logger.error(f"Comparison formatting failed: {e}")
            return "Comparison data formatting is currently unavailable."
    
    def _prepare_comparison_context(self, companies: List[Dict[str, Any]]) -> str:
        """Prepare context for company comparison"""
        context = "COMPANIES TO COMPARE:\n\n"
        
        for company in companies:
            company_data = company.get('data', {})
            company_name = company.get('company_name', 'Unknown')
            
            context += f"{company_name}:\n"
            context += f"- Info: {company_data.get('company_info', 'N/A')}\n"
            context += f"- Pricing: {company_data.get('pricing', 'N/A')}\n"
            context += f"- Features: {company_data.get('features', 'N/A')}\n\n"
        
        return context