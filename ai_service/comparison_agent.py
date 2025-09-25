import requests
import json
from typing import Dict, List, Any
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL
import logging

logger = logging.getLogger(__name__)

class ComparisonAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = AI_MODEL
    
    def compare_items(self, items: List[Dict[str, Any]], query: str = "", budget: str = "") -> Dict[str, Any]:
        """Compare multiple items and provide AI-powered analysis"""
        try:
            # Format items for comparison
            items_text = ""
            for i, item in enumerate(items, 1):
                items_text += f"{i}. {item['name']}\n"
                items_text += f"   Description: {item['description']}\n"
                items_text += f"   Pricing: {item['pricing']}\n"
                items_text += f"   Features: {', '.join(item.get('features', []))}\n"
                items_text += f"   Category: {item['category']}\n\n"
            
            prompt = f"""Compare these {len(items)} options for the query "{query}" with budget "{budget}":

{items_text}

Provide a friendly comparison in 2-3 sentences that:
1. Identifies the best fit based on the user's query and budget
2. Explains why it's the best choice (cost, features, quality)
3. Mentions any trade-offs or alternatives

Be conversational and helpful, like a friend giving advice. Start with "Based on your needs..."
"""
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Quantize Comparison"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful comparison assistant. Provide friendly, concise comparisons that help users make decisions."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 200
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                comparison = response_data['choices'][0]['message']['content'].strip()
                return {"comparison": comparison, "success": True}
            else:
                return {"comparison": "Unable to generate comparison at this time.", "success": False}
                
        except Exception as e:
            logger.error(f"Error generating comparison: {str(e)}")
            return {"comparison": "Comparison service temporarily unavailable.", "success": False}