from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rag_lemonade.rag_lemonade import chain

app = Flask(__name__)
CORS(app)

@app.route('/api/process', methods=['POST'])
def process_query():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({"error": "Query is required"}), 400
        response = chain.invoke(query)
        return jsonify({"output": response})
    except Exception as e:
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
        return Response("Hello from Vercel!")

    app.wsgi_app = DispatcherMiddleware(application, {"/": app})
    return app.wsgi_app(event, context)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)