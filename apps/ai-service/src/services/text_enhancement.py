import os
import logging
from typing import Dict, Any
from openai import OpenAI

logger = logging.getLogger(__name__)

class TextEnhancementService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY")
        )
        self.model = "openai/gpt-4o-mini"
    
    def enhance_text(self, text: str, text_type: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Enhance text using AI based on the type and context"""
        try:
            if not text.strip():
                return {
                    'success': False,
                    'error': 'Text cannot be empty'
                }
            
            # Create context-aware prompt based on text type
            prompt = self._create_enhancement_prompt(text, text_type, context or {})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert business copywriter specializing in AI company descriptions. Your task is to enhance and improve text while maintaining accuracy and professionalism."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            enhanced_text = response.choices[0].message.content.strip()
            
            # Clean up the response (remove quotes if present)
            if enhanced_text.startswith('"') and enhanced_text.endswith('"'):
                enhanced_text = enhanced_text[1:-1]
            
            return {
                'success': True,
                'enhancedText': enhanced_text,
                'originalText': text
            }
            
        except Exception as e:
            logger.error(f"Text enhancement failed: {str(e)}")
            return {
                'success': False,
                'error': f'Enhancement failed: {str(e)}'
            }
    
    def _create_enhancement_prompt(self, text: str, text_type: str, context: Dict[str, Any]) -> str:
        """Create a context-aware prompt for text enhancement"""
        
        company_name = context.get('companyName', 'the company')
        category = context.get('category', 'AI technology')
        description = context.get('description', '')
        
        base_context = f"""
Company Context:
- Company: {company_name}
- Category: {category}
- Description: {description[:200]}...
        """.strip()
        
        if text_type == 'product':
            return f"""
{base_context}

Task: Enhance this product/service description to be more compelling and detailed while maintaining accuracy.

Original text: "{text}"

Please improve this by:
1. Making it more specific and detailed
2. Adding technical capabilities where appropriate
3. Highlighting unique value propositions
4. Using professional business language
5. Keeping it concise but informative (max 2-3 sentences)

Enhanced version:"""
        
        elif text_type == 'feature':
            return f"""
{base_context}

Task: Enhance this feature description to be more compelling and specific.

Original text: "{text}"

Please improve this by:
1. Adding specific technical details or metrics where appropriate
2. Explaining the business value or benefit
3. Using professional terminology
4. Making it more concrete and measurable
5. Keeping it concise (max 2 sentences)

Enhanced version:"""
        
        elif text_type == 'useCase':
            return f"""
{base_context}

Task: Enhance this use case description to be more specific and compelling.

Original text: "{text}"

Please improve this by:
1. Adding specific industry context or scenarios
2. Including quantifiable benefits or outcomes
3. Making it more concrete with real-world applications
4. Using professional business language
5. Highlighting the problem it solves (max 2-3 sentences)

Enhanced version:"""
        
        else:
            return f"""
{base_context}

Task: Enhance and improve this text to be more professional and compelling.

Original text: "{text}"

Please improve this text while maintaining its core meaning and keeping it concise.

Enhanced version:"""