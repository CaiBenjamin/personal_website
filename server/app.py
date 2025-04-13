from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import subprocess
import signal
import atexit
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rag_lemonade.rag_lemonade import chain

app = Flask(__name__)
CORS(app)

# Store references to subprocesses
subprocesses = []

@app.route('/api/process', methods=['POST'])
def process_query():
    try:
        data = request.get_json()
        print("Received data:", data)  # Log the incoming data
        query = data.get('query', '')
        if not query:
            return jsonify({"error": "Query is required"}), 400
        print("Processing query:", query)  # Log the query
        response = chain.invoke(query)
        print("Response:", response)  # Log the response
        return jsonify({"output": response})
    except Exception as e:
        print("Error:", str(e))  # Log the error
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "Welcome to the Flask App!", 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """Serve the React app for unknown routes."""
    if path != "" and os.path.exists(os.path.join('build', path)):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')

def cleanup():
    """Terminate all subprocesses when the Flask app exits."""
    print("Cleaning up subprocesses...")
    for process in subprocesses:
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)  # Kill the process group
        except Exception as e:
            print(f"Error killing process {process.pid}: {e}")

# Register the cleanup function to run on exit
atexit.register(cleanup)

if __name__ == '__main__':
    # Ensure the React app is built and served from the 'build' directory
    app.run(port=5000)
