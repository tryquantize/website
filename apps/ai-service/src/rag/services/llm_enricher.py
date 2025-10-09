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
    
    def generate_enhanced_about(self, company_name: str, company_info: str, features: str, use_cases: str) -> str:
        """Generate enhanced about paragraph focusing on company mission, vision, and expertise"""
        try:
            prompt = f"""Create a compelling 150-word about paragraph for {company_name}. Focus ONLY on what the company does, vision, mission, expertise, and value proposition. DO NOT include team size, location, year, pricing, or client names.

Company Info: {company_info}
Features: {features}
Use Cases: {use_cases}

Write exactly 150 words:"""
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "Write compelling company about sections focusing on value proposition and expertise only."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 200
            }
            
            response = requests.post(f"{self.base_url}/chat/completions", 
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}, 
                json=payload)
            
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content'].strip()
            else:
                raise Exception(f"API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Enhanced about generation failed: {e}")
            return f"{company_name} specializes in innovative AI solutions, delivering cutting-edge technology that transforms business operations. With expertise spanning multiple domains and a commitment to excellence, they provide tailored solutions addressing specific industry challenges while maintaining the highest standards of quality and reliability."
    
    def generate_enhanced_use_cases(self, company_name: str, use_cases_text: str, industries_served: List[str]) -> List[str]:
        """Generate 2-3 enhanced use case bullet points (15 words each) from use cases and industries"""
        try:
            industries_str = ', '.join(industries_served) if industries_served else 'various industries'
            
            prompt = f"""Create exactly 3 use case bullet points for {company_name}. Each bullet point should be exactly 15 words long and focus on specific industry applications.

Use Cases Data:
{use_cases_text}

Industries Served: {industries_str}

Generate 3 specific use case bullet points (exactly 15 words each) that combine the use cases with the industries served. Format as a simple list.

Use Cases:"""
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "Generate specific use case bullet points that are exactly 15 words each, focusing on industry applications."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 150
            }
            
            response = requests.post(f"{self.base_url}/chat/completions", 
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}, 
                json=payload)
            
            if response.status_code == 200:
                response_text = response.json()['choices'][0]['message']['content'].strip()
                
                # Parse response into list
                use_cases = []
                for line in response_text.split('\n'):
                    line = line.strip().lstrip('•-*').strip()
                    if line and not line.startswith('Use Cases:'):
                        use_cases.append(line)
                
                # Ensure we have exactly 3 use cases
                if len(use_cases) >= 3:
                    return use_cases[:3]
                else:
                    fallback_cases = [
                        "Business process automation and optimization solutions",
                        "Data analytics and insights for decision making", 
                        "Customer experience enhancement through AI integration"
                    ]
                    while len(use_cases) < 3:
                        use_cases.append(fallback_cases[len(use_cases)])
                    return use_cases[:3]
            else:
                raise Exception(f"API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Enhanced use cases generation failed: {e}")
            return [
                "Business process automation and optimization solutions",
                "Data analytics and insights for decision making",
                "Customer experience enhancement through AI integration"
            ]