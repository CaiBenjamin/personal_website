from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/process', methods=['POST'])
def process():
    try:
        data = request.get_json()
        transcript = data.get('transcript', '')
        query = data.get('query', '')

        # Simulate processing logic
        if not transcript or not query:
            return jsonify({'error': 'Invalid input'}), 400

        # Example response
        response = {
            'output': f"Processed query '{query}' for transcript '{transcript}'"
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)