import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class TextMatcher:
    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
        }
    
    def find_matching_companies(self, query: str, companies_data: Dict[str, Dict[str, Any]], 
                              selected_types: List[str] = None) -> List[Dict[str, Any]]:
        """Find companies that match the search query"""
        query_words = self._extract_keywords(query)
        matches = []
        
        for company_name, company_data in companies_data.items():
            score = self._calculate_match_score(query_words, company_data)
            
            if score > 0:
                matches.append({
                    'company_name': company_name,
                    'data': company_data,
                    'score': score
                })
        
        # Sort by relevance score
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        # Filter by selected types if provided
        if selected_types:
            matches = self._filter_by_types(matches, selected_types)
        
        return matches
    
    def _extract_keywords(self, query: str) -> List[str]:
        """Extract meaningful keywords from query"""
        # Convert to lowercase and remove special characters
        clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
        
        # Split into words and remove stop words
        words = [word.strip() for word in clean_query.split() 
                if word.strip() and word.strip() not in self.stop_words]
        
        return words
    
    def _calculate_match_score(self, query_words: List[str], company_data: Dict[str, Any]) -> float:
        """Calculate relevance score for a company based on query words"""
        score = 0.0
        
        # Combine all text data for searching
        searchable_text = self._get_searchable_text(company_data).lower()
        
        for word in query_words:
            word_lower = word.lower()
            
            # Count occurrences of the word
            word_count = searchable_text.count(word_lower)
            
            if word_count > 0:
                # Weight different sections differently
                company_info_score = company_data.get('company_info', '').lower().count(word_lower) * 3.0
                features_score = company_data.get('features', '').lower().count(word_lower) * 2.0
                pricing_score = company_data.get('pricing', '').lower().count(word_lower) * 1.5
                use_cases_score = company_data.get('use_cases', '').lower().count(word_lower) * 2.0
                
                word_score = company_info_score + features_score + pricing_score + use_cases_score
                score += word_score
        
        # Boost score for exact company name matches
        company_name = company_data.get('folder_name', '').lower()
        for word in query_words:
            if word.lower() in company_name:
                score += 10.0
        
        return score
    
    def _get_searchable_text(self, company_data: Dict[str, Any]) -> str:
        """Combine all text fields for searching"""
        text_fields = [
            company_data.get('company_info', ''),
            company_data.get('pricing', ''),
            company_data.get('features', ''),
            company_data.get('use_cases', ''),
            company_data.get('reviews', ''),
            company_data.get('integrations', ''),
            company_data.get('alternatives', '')
        ]
        
        return ' '.join(text_fields)
    
    def _filter_by_types(self, matches: List[Dict[str, Any]], selected_types: List[str]) -> List[Dict[str, Any]]:
        """Filter matches based on selected types"""
        if not selected_types:
            return matches
        
        filtered_matches = []
        
        for match in matches:
            company_data = match['data']
            company_info = company_data.get('company_info', '').lower()
            
            # Check if company matches any selected type
            type_match = False
            
            for selected_type in selected_types:
                if selected_type == 'company':
                    # All entries are companies, so include all
                    type_match = True
                    break
                elif selected_type == 'product':
                    # Look for product-related keywords
                    if any(keyword in company_info for keyword in ['product', 'tool', 'software', 'platform', 'app']):
                        type_match = True
                        break
                elif selected_type == 'freelancer':
                    # Look for freelancer-related keywords
                    if any(keyword in company_info for keyword in ['freelancer', 'consultant', 'individual', 'personal']):
                        type_match = True
                        break
            
            if type_match:
                filtered_matches.append(match)
        
        return filtered_matches
    
    def find_pricing_matches(self, query: str, companies_data: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find companies that match pricing-related queries"""
        pricing_keywords = ['price', 'pricing', 'cost', 'cheap', 'expensive', 'free', 'paid', '$', 'dollar']
        
        query_lower = query.lower()
        has_pricing_intent = any(keyword in query_lower for keyword in pricing_keywords)
        
        if not has_pricing_intent:
            return self.find_matching_companies(query, companies_data)
        
        # Extract price range if mentioned
        price_range = self._extract_price_range(query)
        
        matches = []
        for company_name, company_data in companies_data.items():
            pricing_text = company_data.get('pricing', '').lower()
            
            if pricing_text:
                score = 0.0
                
                # Score based on pricing keywords in query
                for keyword in pricing_keywords:
                    if keyword in query_lower and keyword in pricing_text:
                        score += 2.0
                
                # Score based on price range match
                if price_range and self._matches_price_range(pricing_text, price_range):
                    score += 5.0
                
                if score > 0:
                    matches.append({
                        'company_name': company_name,
                        'data': company_data,
                        'score': score
                    })
        
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches
    
    def _extract_price_range(self, query: str) -> Dict[str, float]:
        """Extract price range from query (e.g., 'under $50', 'between $10 and $100')"""
        price_pattern = r'\$(\d+(?:\.\d{2})?)'
        prices = [float(match) for match in re.findall(price_pattern, query)]
        
        query_lower = query.lower()
        
        if 'under' in query_lower and prices:
            return {'max': prices[0]}
        elif 'over' in query_lower and prices:
            return {'min': prices[0]}
        elif 'between' in query_lower and len(prices) >= 2:
            return {'min': min(prices), 'max': max(prices)}
        elif prices:
            # Assume looking for something around this price
            price = prices[0]
            return {'min': price * 0.5, 'max': price * 1.5}
        
        return {}
    
    def _matches_price_range(self, pricing_text: str, price_range: Dict[str, float]) -> bool:
        """Check if pricing text matches the specified price range"""
        price_pattern = r'\$(\d+(?:\.\d{2})?)'
        prices = [float(match) for match in re.findall(price_pattern, pricing_text)]
        
        if not prices:
            return False
        
        min_price = price_range.get('min', 0)
        max_price = price_range.get('max', float('inf'))
        
        # Check if any price in the text falls within the range
        return any(min_price <= price <= max_price for price in prices)