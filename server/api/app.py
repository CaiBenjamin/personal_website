from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv
import logging  # Add logging import

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables from .env file
load_dotenv(dotenv_path="/Users/bcai/projects/personal_website/.env")

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rag_lemonade.rag_lemonade import chain

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

@app.route('/api/process', methods=['POST'])
def process_query():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({"error": "Query is required"}), 400
        logging.debug(f"Received query: {query}")  # Debugging log
        response = chain.invoke(query)
        logging.debug(f"Response: {response}")  # Debugging log
        return jsonify({"output": response})
    except Exception as e:
        logging.error(f"Error in process_query: {str(e)}")  # Error log
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "Welcome to the Flask App!", 200

# Vercel requires this entry point
def handler(event, context):
    from werkzeug.middleware.dispatcher import DispatcherMiddleware
    from werkzeug.serving import run_simple
    from werkzeug.wrappers import Request, Response

    @Request.application
    def application(request):
        return Response("Hello from https://personal-website-c07i.onrender.com!")  # Updated URL

    app.wsgi_app = DispatcherMiddleware(application, {"/": app})
    return app.wsgi_app(event, context)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)