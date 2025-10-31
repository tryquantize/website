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
                        "content": "You are an expert business copywriter specializing in AI company descriptions. Your task is to enhance and improve text while maintaining accuracy and professionalism. IMPORTANT: Return ONLY the enhanced text without any metadata, introductory phrases, asterisks, hyphens, bullet points, or formatting. Just provide the clean, enhanced content directly."
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
            
            # Clean up the response thoroughly
            enhanced_text = self._clean_enhanced_text(enhanced_text)
            
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
    
    def _clean_enhanced_text(self, text: str) -> str:
        """Clean enhanced text to remove metadata and formatting"""
        # Remove quotes
        if text.startswith('"') and text.endswith('"'):
            text = text[1:-1]
        
        # Remove common metadata prefixes
        prefixes_to_remove = [
            "Enhanced version:",
            "Here's the enhanced version:",
            "Enhanced text:",
            "Improved version:",
            "Here's an enhanced",
            "Here's the improved",
            "Enhanced:",
            "Improved:"
        ]
        
        for prefix in prefixes_to_remove:
            if text.lower().startswith(prefix.lower()):
                text = text[len(prefix):].strip()
        
        # Remove asterisks and hyphens at the beginning of lines
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            # Remove bullet points
            if line.startswith('* '):
                line = line[2:].strip()
            elif line.startswith('- '):
                line = line[2:].strip()
            elif line.startswith('• '):
                line = line[2:].strip()
            
            if line:  # Only add non-empty lines
                cleaned_lines.append(line)
        
        return ' '.join(cleaned_lines).strip()
    
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

Please improve this by making it more specific, detailed, and professional. Keep it concise (ONE LINE ONLY, maximum 15 words). Return ONLY the enhanced text without any metadata or formatting:"""
        
        elif text_type == 'feature':
            return f"""
{base_context}

Task: Enhance this feature description to be more compelling and specific.

Original text: "{text}"

Please improve this by adding specific technical details, business value, and professional terminology. Create a comprehensive 200-300 word paragraph. Return ONLY the enhanced text without any metadata, bullet points, or formatting:"""
        
        elif text_type == 'useCase':
            return f"""
{base_context}

Task: Enhance this use case description to be more specific and compelling.

Original text: "{text}"

Please improve this by adding specific industry context, quantifiable benefits, and real-world applications. Create a comprehensive 200-300 word paragraph with detailed use case scenarios. Return ONLY the enhanced text without any metadata, bullet points, or formatting:"""
        
        else:
            return f"""
{base_context}

Task: Enhance and improve this text to be more professional and compelling.

Original text: "{text}"

Please improve this text while maintaining its core meaning and keeping it concise. Return ONLY the enhanced text without any metadata or formatting:"""