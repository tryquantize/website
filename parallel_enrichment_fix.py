import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any

# Current sequential implementation (SLOW)
def _format_companies_for_response_sequential(self, matching_companies, query, selected_locations):
    companies_list = []
    for company_match in matching_companies[:15]:
        # Each company processed one by one - SEQUENTIAL
        enhanced_about = self._generate_enhanced_about(company_data, company_name)  # ~500ms
        enhanced_use_cases = self._generate_enhanced_use_cases(...)  # ~400ms
        key_specs = self._extract_key_specifications(...)  # ~400ms
        # Total: ~1300ms per company
        companies_list.append(company_obj)
    return companies_list

# NEW parallel implementation (FAST)
def _format_companies_for_response_parallel(self, matching_companies, query, selected_locations):
    companies_list = []
    
    # Process all companies in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for company_match in matching_companies[:15]:
            future = executor.submit(self._enrich_single_company, company_match, query)
            futures.append(future)
        
        # Wait for all companies to be enriched in parallel
        for future in futures:
            enriched_company = future.result()
            companies_list.append(enriched_company)
    
    return companies_list

def _enrich_single_company(self, company_match, query):
    # All LLM calls for this company happen in parallel too
    with ThreadPoolExecutor(max_workers=3) as executor:
        about_future = executor.submit(self._generate_enhanced_about, company_data, company_name)
        cases_future = executor.submit(self._generate_enhanced_use_cases, ...)
        specs_future = executor.submit(self._extract_key_specifications, ...)
        
        # Wait for all 3 LLM calls to complete
        enhanced_about = about_future.result()
        enhanced_use_cases = cases_future.result() 
        key_specs = specs_future.result()
    
    return company_obj