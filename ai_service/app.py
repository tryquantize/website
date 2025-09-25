from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_agent import AISearchAgent
from comparison_agent import ComparisonAgent
from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
import logging
import time
from functools import lru_cache
import hashlib
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize AI agents
ai_agent = AISearchAgent()
comparison_agent = ComparisonAgent()

# Simple in-memory cache for responses
response_cache = {}
CACHE_TTL = 300  # 5 minutes

def get_cache_key(query, model, types):
    """Generate cache key for request"""
    cache_data = f"{query}_{model}_{sorted(types) if types else []}"
    return hashlib.md5(cache_data.encode()).hexdigest()

def get_cached_response(cache_key):
    """Get cached response if valid"""
    if cache_key in response_cache:
        cached_data, timestamp = response_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data
        else:
            del response_cache[cache_key]
    return None

def cache_response(cache_key, response):
    """Cache response with timestamp"""
    response_cache[cache_key] = (response, time.time())

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        health_status = ai_agent.health_check()
        return jsonify(health_status), 200 if health_status['success'] else 500
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "success": False
        }), 500

@app.route('/search', methods=['POST'])
def ai_search():
    """Main AI search endpoint with caching"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "error": "Query is required",
                "success": False
            }), 400
        
        query = data['query']
        context = data.get('context', {})
        selected_model = data.get('selectedModel')
        selected_types = data.get('selectedTypes', [])
        
        # Check cache first
        cache_key = get_cache_key(query, selected_model, selected_types)
        cached_result = get_cached_response(cache_key)
        if cached_result:
            logger.info(f"Returning cached result for query: {query}")
            return jsonify(cached_result), 200
        
        logger.info(f"Processing search query: {query} with model: {selected_model} and types: {selected_types}")
        
        # Process the search using AI agent
        result = ai_agent.search_ai_tools(query, context, selected_model, selected_types)
        
        # Cache successful results
        if result.get('success'):
            cache_response(cache_key, result)
        
        # Return the result
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error in ai_search: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/suggestions', methods=['POST'])
def generate_suggestions():
    """Generate search suggestions based on a query"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "error": "Query is required",
                "success": False
            }), 400
        
        query = data['query']
        
        # Generate suggestions using the AI agent
        suggestions = ai_agent._generate_search_suggestions(query, "")
        
        return jsonify({
            "query": query,
            "suggestions": suggestions,
            "success": True
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/extract-companies', methods=['POST'])
def extract_companies():
    """Extract company information from search results"""
    try:
        data = request.get_json()
        
        if not data or 'search_result' not in data:
            return jsonify({
                "error": "Search result is required",
                "success": False
            }), 400
        
        search_result = data['search_result']
        
        logger.info(f"Extracting companies from search result")
        
        # Extract companies using the AI agent
        companies = ai_agent.extract_companies(search_result)
        
        return jsonify({
            "companies": companies,
            "success": True
        }), 200
        
    except Exception as e:
        logger.error(f"Error extracting companies: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/compare', methods=['POST'])
def compare_items():
    """Compare multiple items using AI"""
    try:
        data = request.get_json()
        
        if not data or 'items' not in data:
            return jsonify({
                "error": "Items are required",
                "success": False
            }), 400
        
        items = data['items']
        query = data.get('query', '')
        budget = data.get('budget', '')
        
        if len(items) < 2:
            return jsonify({
                "error": "At least 2 items required for comparison",
                "success": False
            }), 400
        
        logger.info(f"Comparing {len(items)} items for query: {query}")
        
        # Generate comparison using AI agent
        result = comparison_agent.compare_items(items, query, budget)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in compare_items: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "success": False
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "success": False
    }), 500

if __name__ == '__main__':
    logger.info(f"Starting AI service on {FLASK_HOST}:{FLASK_PORT}")
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)