import requests
import json
from typing import Dict, List, Any
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL
import logging

logger = logging.getLogger(__name__)

class ResearchAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = AI_MODEL
    
    def generate_step_content(self, query: str, step_id: int) -> Dict[str, Any]:
        """Generate relevant content for each research step"""
        try:
            step_prompts = {
                1: f"For the query '{query}', briefly explain what intent and context we're analyzing to personalize results. Maximum 50 words, friendly tone.",
                2: f"For '{query}', mention what hidden gems and startups we're discovering beyond typical SEO results. Maximum 50 words, friendly tone.",
                3: f"For '{query}', explain what credibility factors and trust signals we're verifying across sources. Maximum 50 words, friendly tone.",
                4: f"For '{query}', describe how we're matching solution fit and value alignment to user needs. Maximum 50 words, friendly tone.",
                5: f"For '{query}', explain how we're preparing instant connections with chat, demo, and contact options. Maximum 50 words, friendly tone."
            }
            
            prompt = step_prompts.get(step_id, "")
            if not prompt:
                return {"content": "Analyzing your requirements...", "success": False}
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Quantize Research"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful research assistant. Provide brief, friendly explanations."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 80
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                content = response_data['choices'][0]['message']['content'].strip()
                return {"content": content, "success": True}
            else:
                return {"content": "Analyzing your requirements...", "success": False}
                
        except Exception as e:
            logger.error(f"Error generating step content: {str(e)}")
            return {"content": "Analyzing your requirements...", "success": False}
    
    def generate_all_steps_content(self, query: str) -> Dict[str, Any]:
        """Generate content for all 5 research steps"""
        try:
            steps_content = {}
            for step_id in range(1, 6):
                result = self.generate_step_content(query, step_id)
                steps_content[f"step_{step_id}"] = result["content"]
            
            return {
                "query": query,
                "steps": steps_content,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error generating all steps content: {str(e)}")
            return {
                "query": query,
                "steps": {
                    "step_1": "Understanding your intent and personalizing the search...",
                    "step_2": "Discovering hidden gems beyond typical results...",
                    "step_3": "Verifying credibility and trust signals...",
                    "step_4": "Matching solutions to your specific needs...",
                    "step_5": "Preparing instant connection options..."
                },
                "success": False
            }