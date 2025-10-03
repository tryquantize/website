from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3001",
    "https://quantize-ai.vercel.app",
    "https://*.vercel.app",
    "https://quantize-one.vercel.app"
])

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "success": True,
        "message": "Simple AI service is running"
    }), 200

@app.route('/search', methods=['POST'])
def ai_search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        # Return a simple mock response
        return jsonify({
            "query": query,
            "aiResponse": f"Here are AI solutions for '{query}'. This is a simplified response while we optimize the full AI service.",
            "suggestions": [
                f"Best {query} tools",
                f"Free {query} solutions", 
                f"Enterprise {query} platforms",
                f"Open source {query} alternatives",
                f"Getting started with {query}"
            ],
            "companies": [
                {
                    "name": "AI Solution Pro",
                    "description": f"Advanced {query} platform for businesses",
                    "features": ["AI-Powered", "Easy Integration", "24/7 Support"],
                    "pricing": "Contact for pricing",
                    "website": "https://example.com",
                    "category": "AI Tools"
                },
                {
                    "name": "Smart Assistant",
                    "description": f"Intelligent {query} automation tool",
                    "features": ["Machine Learning", "Custom Workflows", "Analytics"],
                    "pricing": "$29/month",
                    "website": "https://example.com",
                    "category": "AI Automation"
                }
            ],
            "citations": [],
            "success": True,
            "simplified": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=False)