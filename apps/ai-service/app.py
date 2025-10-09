import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask, request, jsonify
from flask_cors import CORS
from services.ai_agent import AISearchAgent
from config.config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for local development only
CORS(app, origins=[
    "http://localhost:3001",
    "http://127.0.0.1:3001"
])

# Initialize AI agent
ai_agent = AISearchAgent()

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

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint"""
    return jsonify({
        "message": "AI service is running",
        "success": True,
        "timestamp": "2025-10-03"
    }), 200

@app.route('/search', methods=['POST'])
def ai_search():
    """Main AI search endpoint"""
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
        selected_locations = data.get('selectedLocations', [])
        web_search_enabled = data.get('webSearchEnabled', False)
        
        logger.info(f"Processing search query: {query} with model: {selected_model}, types: {selected_types}, locations: {selected_locations}")
        logger.info(f"Web search enabled: {web_search_enabled} (type: {type(web_search_enabled)})")
        logger.info(f"Selected types type: {type(selected_types)}, length: {len(selected_types) if selected_types else 0}")
        logger.info(f"Selected locations type: {type(selected_locations)}, length: {len(selected_locations) if selected_locations else 0}")
        logger.info(f"Full request data: {data}")
        
        # Process the search using AI agent
        result = ai_agent.search_ai_tools(query, context, selected_model, selected_types, selected_locations, web_search_enabled)
        
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
def compare_companies():
    """Compare multiple companies and provide decision guidance"""
    try:
        data = request.get_json()
        
        if not data or 'companies' not in data:
            return jsonify({
                "error": "Companies data is required",
                "success": False
            }), 400
        
        companies = data['companies']
        
        if not isinstance(companies, list) or len(companies) < 2:
            return jsonify({
                "error": "At least 2 companies required for comparison",
                "success": False
            }), 400
        
        logger.info(f"Comparing {len(companies)} companies")
        
        # Generate comparison using the AI agent
        comparison = ai_agent.compare_companies(companies)
        
        return jsonify({
            "comparison": comparison,
            "success": True
        }), 200
        
    except Exception as e:
        logger.error(f"Error comparing companies: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/add-company', methods=['POST'])
def add_company():
    """Add a new company to RAG database"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "Company data is required",
                "success": False
            }), 400
        
        logger.info(f"Adding company: {data.get('companyName', 'Unknown')}")
        
        # Import and use company submission service
        from services.company_submission import CompanySubmissionService
        submission_service = CompanySubmissionService()
        
        result = submission_service.submit_company(data)
        
        if result['success']:
            # Reload RAG data to include new company
            ai_agent.rag_service.reload_data()
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error adding company: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/enhance-text', methods=['POST'])
def enhance_text():
    """Enhance text using AI"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data or 'type' not in data:
            return jsonify({
                "error": "Text and type are required",
                "success": False
            }), 400
        
        text = data['text']
        text_type = data['type']
        context = data.get('context', {})
        
        logger.info(f"Enhancing {text_type} text: {text[:50]}...")
        
        # Import and use text enhancement service
        from services.text_enhancement import TextEnhancementService
        enhancement_service = TextEnhancementService()
        
        result = enhancement_service.enhance_text(text, text_type, context)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error enhancing text: {str(e)}")
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