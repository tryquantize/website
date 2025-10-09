import os
import logging
from typing import Dict, Any
from openai import OpenAI
from config.config import AI_MODEL, OPENROUTER_API_KEY, OPENROUTER_BASE_URL

logger = logging.getLogger(__name__)

class TextEnhancementService:
    def __init__(self):
        self.client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY
        )
        self.model = AI_MODEL
    
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
                max_tokens=self._get_max_tokens(text_type),
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
    
    def _get_max_tokens(self, text_type: str) -> int:
        """Get appropriate max tokens based on text type"""
        if text_type == 'product':
            return 50  # One line for products
        elif text_type in ['feature', 'useCase']:
            return 400  # 200-300 words for features and use cases
        else:
            return 100  # Default
    
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
5. Keeping it concise but informative (ONE LINE ONLY, maximum 15 words)

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
5. Creating a comprehensive 200-300 word paragraph with detailed explanations

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
5. Creating a comprehensive 200-300 word paragraph with detailed use case scenarios

Enhanced version:"""
        
        else:
            return f"""
{base_context}

Task: Enhance and improve this text to be more professional and compelling.

Original text: "{text}"

Please improve this text while maintaining its core meaning and keeping it concise.

Enhanced version:"""