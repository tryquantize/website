import re
from typing import Dict, List, Any
import logging
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures

logger = logging.getLogger(__name__)

class TextMatcher:
    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
        }
        # Minimum score threshold to filter out irrelevant results
        self.min_score_threshold = 5.0  # Increased threshold for better precision
    
    def find_matching_companies(self, query: str, companies_data: Dict[str, Dict[str, Any]], 
                              selected_types: List[str] = None, industry_detected: str = None) -> List[Dict[str, Any]]:
        """Find companies that match the search query using parallel processing with industry filtering"""
        query_words = self._extract_keywords(query)
        original_query = query.lower()
        matches = []
        
        # Parallel processing of company scoring
        with ThreadPoolExecutor(max_workers=8) as executor:
            future_to_company = {
                executor.submit(self._calculate_match_score, query_words, original_query, 
                              company_data.get('data', company_data), industry_detected): (company_name, company_data)
                for company_name, company_data in companies_data.items()
            }
            
            for future in concurrent.futures.as_completed(future_to_company):
                company_name, company_data = future_to_company[future]
                try:
                    score = future.result()
                    # Only include companies that meet the minimum relevance threshold
                    if score >= self.min_score_threshold:
                        matches.append({
                            'company_name': company_name,
                            'data': company_data.get('data', company_data),
                            'score': score
                        })
                except Exception as e:
                    logger.error(f"Error scoring company {company_name}: {e}")
        
        # Sort by relevance score
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        # Filter by selected types if provided
        if selected_types:
            matches = self._filter_by_types(matches, selected_types)
        
        # Filter by industry if detected
        if industry_detected:
            matches = self._filter_by_industry(matches, industry_detected)
        
        return matches
    
    def _extract_keywords(self, query: str) -> List[str]:
        """Extract meaningful keywords from query"""
        # Convert to lowercase and remove special characters
        clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
        
        # Split into words and remove stop words
        words = [word.strip() for word in clean_query.split() 
                if word.strip() and word.strip() not in self.stop_words and len(word.strip()) > 2]
        
        return words
    
    def _calculate_match_score(self, query_words: List[str], original_query: str, company_data: Dict[str, Any], industry_detected: str = None) -> float:
        """Calculate relevance score for a company based on query words and phrases with semantic context"""
        score = 0.0
        
        # Get text sections
        company_info = company_data.get('company_info', '').lower()
        features = company_data.get('features', '').lower()
        pricing = company_data.get('pricing', '').lower()
        use_cases = company_data.get('use_cases', '').lower()
        searchable_text = self._get_searchable_text(company_data).lower()
        
        # Industry relevance boost
        if industry_detected:
            industry_keywords = self._get_industry_keywords(industry_detected)
            for keyword in industry_keywords:
                if keyword in searchable_text:
                    score += 15.0  # Significant boost for industry relevance
                    break
        
        # 1. Check for exact phrase matches (highest priority)
        if len(original_query) > 3:  # Only for meaningful queries
            if original_query in searchable_text:
                score += 50.0  # Increased from 30.0 for exact matches
        
        # 2. Semantic compound term handling (e.g., "space infrastructure")
        if len(query_words) >= 2:
            # For compound terms, require ALL words to be present for high relevance
            all_words_present = all(word.lower() in searchable_text for word in query_words)
            
            if all_words_present:
                # Check for proximity - words should appear close to each other
                proximity_score = self._calculate_word_proximity(query_words, searchable_text)
                score += proximity_score
                
                # Multi-word phrase matches
                for i in range(len(query_words) - 1):
                    phrase = f"{query_words[i]} {query_words[i+1]}"
                    if phrase in searchable_text:
                        score += 35.0  # Increased from 20.0
                
                # 3-word phrases (even more specific)
                if len(query_words) >= 3:
                    for i in range(len(query_words) - 2):
                        phrase = f"{query_words[i]} {query_words[i+1]} {query_words[i+2]}"
                        if phrase in searchable_text:
                            score += 45.0  # Increased from 25.0
            else:
                # If not all words are present, heavily penalize for compound terms
                if len(query_words) >= 2:
                    score *= 0.1  # Heavy penalty for missing key terms
        
        # 3. Individual word matching with stricter context requirements
        matched_words = 0
        total_words = len(query_words)
        word_scores = []
        
        for word in query_words:
            word_lower = word.lower()
            word_score = 0.0
            
            # Give higher scores for specific technical terms
            multiplier = 1.0
            if word_lower in ['space', 'infrastructure', 'voice', 'calling', 'agent', 'chatbot', 'automation', 'analytics']:
                multiplier = 3.0  # Increased multiplier for key terms
            
            # Weight different sections differently
            if word_lower in company_info:
                word_score += 3.0 * multiplier
            if word_lower in features:
                word_score += 2.5 * multiplier
            if word_lower in use_cases:
                word_score += 2.5 * multiplier
            if word_lower in pricing:
                word_score += 1.5 * multiplier
                
            if word_score > 0:
                matched_words += 1
                word_scores.append(word_score)
        
        # Add individual word scores
        score += sum(word_scores)
        
        # 4. Stricter matching requirements for compound terms
        if total_words > 0:
            match_percentage = matched_words / total_words
            
            # For compound terms (2+ words), require higher match percentage
            if total_words >= 2:
                if match_percentage < 0.8:  # 80% of words must match for compound terms
                    score *= 0.2  # Heavy penalty
                elif match_percentage < 1.0:  # Not all words match
                    score *= 0.6  # Moderate penalty
            else:  # Single word queries
                if match_percentage < 0.5:
                    score *= 0.5
        
        # 5. Special handling for general AI queries (only if no specific compound terms)
        if len(query_words) <= 2:
            ai_keywords = ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'ml', 'tool', 'tools', 'platform', 'software']
            if any(word.lower() in ai_keywords for word in query_words):
                if any(keyword in searchable_text for keyword in ['ai', 'artificial intelligence', 'machine learning', 'platform', 'tool']):
                    score += 2.0
        
        # 6. Boost for company name matches
        company_name = company_data.get('folder_name', '').lower()
        for word in query_words:
            if word.lower() in company_name:
                score += 15.0  # Increased from 10.0
        
        # 7. Boost for category relevance
        category_info = self._extract_category_from_info(company_info)
        for word in query_words:
            if word.lower() in category_info.lower():
                score += 8.0  # Increased from 5.0
        
        return score
    
    def _get_searchable_text(self, company_data: Dict[str, Any]) -> str:
        """Combine all text fields for searching"""
        # Handle nested data structure
        if 'data' in company_data:
            company_data = company_data['data']
            
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
    
    def _extract_category_from_info(self, company_info: str) -> str:
        """Extract category information from company info"""
        for line in company_info.split('\n'):
            if line.startswith('category:') or line.startswith('products:') or line.startswith('description:'):
                return line.split(':', 1)[1].strip() if ':' in line else ''
        return ''
    
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
    
    def _filter_by_industry(self, matches: List[Dict[str, Any]], industry_detected: str) -> List[Dict[str, Any]]:
        """Filter matches based on detected industry with strict filtering"""
        if not industry_detected:
            return matches
        
        industry_keywords = self._get_industry_keywords(industry_detected)
        if not industry_keywords:
            logger.info(f"No keywords found for industry '{industry_detected}', returning all matches")
            return matches
        

        
        filtered_matches = []
        
        for match in matches:
            company_data = match['data']
            company_info = company_data.get('company_info', '').lower()
            use_cases = company_data.get('use_cases', '').lower()
            features = company_data.get('features', '').lower()
            
            # Strict industry matching - company must explicitly serve this industry
            industry_match = False
            
            # 1. Check industries served field (highest priority)
            for line in company_info.split('\n'):
                if line.startswith('industries served:'):
                    industries_text = line.replace('industries served:', '').strip().lower()
                    for keyword in industry_keywords:
                        if keyword in industries_text:
                            industry_match = True
                            logger.info(f"Company {match['company_name']} matches industry '{industry_detected}' via industries served: {keyword}")
                            break
                    break
            
            # 2. Check use cases for industry-specific applications
            if not industry_match:
                for keyword in industry_keywords:
                    if keyword in use_cases:
                        industry_match = True
                        logger.info(f"Company {match['company_name']} matches industry '{industry_detected}' via use cases: {keyword}")
                        break
            
            # 3. Check features for industry-specific mentions
            if not industry_match:
                for keyword in industry_keywords:
                    if keyword in features:
                        industry_match = True
                        logger.info(f"Company {match['company_name']} matches industry '{industry_detected}' via features: {keyword}")
                        break
            
            # 4. Check company description for industry focus
            if not industry_match:
                for line in company_info.split('\n'):
                    if line.startswith('description:'):
                        description = line.replace('description:', '').strip().lower()
                        for keyword in industry_keywords:
                            if keyword in description:
                                industry_match = True
                                logger.info(f"Company {match['company_name']} matches industry '{industry_detected}' via description: {keyword}")
                                break
                        break
            
            if industry_match:
                filtered_matches.append(match)
            else:
                logger.info(f"Company {match['company_name']} does NOT match industry '{industry_detected}' - filtered out")
        
        logger.info(f"Industry filtering for '{industry_detected}': {len(matches)} -> {len(filtered_matches)} companies")
        return filtered_matches
    
    def _calculate_word_proximity(self, query_words: List[str], text: str) -> float:
        """Calculate proximity score based on how close query words appear to each other in text"""
        if len(query_words) < 2:
            return 0.0
        
        words = text.split()
        word_positions = {}
        
        # Find positions of each query word in the text
        for i, word in enumerate(words):
            for query_word in query_words:
                if query_word.lower() in word.lower():
                    if query_word not in word_positions:
                        word_positions[query_word] = []
                    word_positions[query_word].append(i)
        
        # If not all query words are found, return 0
        if len(word_positions) < len(query_words):
            return 0.0
        
        # Calculate minimum distance between all pairs of query words
        min_distances = []
        query_word_list = list(word_positions.keys())
        
        for i in range(len(query_word_list)):
            for j in range(i + 1, len(query_word_list)):
                word1_positions = word_positions[query_word_list[i]]
                word2_positions = word_positions[query_word_list[j]]
                
                # Find minimum distance between any occurrence of word1 and word2
                min_dist = float('inf')
                for pos1 in word1_positions:
                    for pos2 in word2_positions:
                        min_dist = min(min_dist, abs(pos1 - pos2))
                
                min_distances.append(min_dist)
        
        if not min_distances:
            return 0.0
        
        # Calculate proximity score (closer words get higher scores)
        avg_distance = sum(min_distances) / len(min_distances)
        
        # Score decreases as distance increases
        if avg_distance <= 2:  # Words are very close (within 2 positions)
            return 25.0
        elif avg_distance <= 5:  # Words are moderately close
            return 15.0
        elif avg_distance <= 10:  # Words are somewhat close
            return 8.0
        else:  # Words are far apart
            return 2.0
    
    def _get_industry_keywords(self, industry: str) -> List[str]:
        """Get keywords for industry matching"""
        industry_keywords = {
            'healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'patient', 'doctor', 'nurse', 'pharmaceutical', 'medicine'],
            'finance': ['finance', 'financial', 'banking', 'fintech', 'investment', 'trading', 'payment', 'insurance', 'accounting', 'tax'],
            'education': ['education', 'learning', 'school', 'university', 'student', 'teacher', 'training', 'course', 'academic'],
            'ecommerce': ['ecommerce', 'e-commerce', 'retail', 'shopping', 'store', 'marketplace', 'sales', 'customer'],
            'marketing': ['marketing', 'advertising', 'social media', 'content', 'seo', 'campaign', 'brand', 'promotion'],
            'real estate': ['real estate', 'property', 'housing', 'rental', 'mortgage', 'construction', 'architecture'],
            'logistics': ['logistics', 'supply chain', 'shipping', 'delivery', 'transportation', 'warehouse', 'inventory'],
            'legal': ['legal', 'law', 'lawyer', 'attorney', 'compliance', 'contract', 'litigation'],
            'hr': ['hr', 'human resources', 'recruitment', 'hiring', 'employee', 'workforce', 'talent'],
            'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'automation', 'quality control'],
            'travel': ['travel', 'tourism', 'hotel', 'booking', 'flight', 'vacation', 'hospitality'],
            'gaming': ['gaming', 'game', 'entertainment', 'mobile game', 'video game', 'esports'],
            'agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'food production', 'agtech'],
            'aerospace': ['aerospace', 'space', 'satellite', 'aviation', 'aircraft', 'rocket', 'orbital', 'flight']
        }
        
        return industry_keywords.get(industry, [])
    
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