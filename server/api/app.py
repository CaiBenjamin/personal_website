from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv
import logging  # Add logging import
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_pinecone import PineconeVectorStore  # Added missing import
from langchain_openai.embeddings import OpenAIEmbeddings  # Added missing import
import pinecone
from langchain_openai.chat_models import ChatOpenAI
from langchain_core.runnables import RunnableParallel, RunnablePassthrough


# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables from .env file
load_dotenv(dotenv_path="/Users/bcai/projects/personal_website/.env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from rag_lemonade.rag_lemonade import chain

# Initialize embeddings
embeddings = OpenAIEmbeddings()

# Initialize Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

if not PINECONE_API_KEY:
    raise ValueError("Pinecone API key or environment is not set. Please check your .env file.")

# Define chunking_configs and documents_raw for process_all_configs
chunking_configs = {
    "lemonade-stand-500": {"chunk_size": 500, "chunk_overlap": 20},
    "lemonade-stand-podcast": {"chunk_size": 1000, "chunk_overlap": 20},
    "lemonade-stand-2000": {"chunk_size": 2000, "chunk_overlap": 20},
    "lemonade-stand-1000-extra-overlap": {"chunk_size": 1000, "chunk_overlap": 50},
    "lemonade-stand-2000-extra-overlap": {"chunk_size": 2000, "chunk_overlap": 50},
}

# Convert documents_raw to a list of Document objects
documents_raw = [
    Document(page_content="Sample document content 1", metadata={}),
    Document(page_content="Sample document content 2", metadata={}),
]

app = Flask(__name__)
# Allow CORS for specific origins
CORS(app, resources={r"/*": {"origins": ["http://localhost:8000", "https://personal-website-c07i.onrender.com"]}})

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

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

@app.route('/api/process', methods=['GET'])
def process_query_get():
    return "This endpoint only supports POST requests. Please send a POST request with a query.", 405

@app.route('/api/process_all_configs', methods=['POST'])
def process_query_all_configs():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({"error": "Query is required"}), 400

        logging.debug(f"Received query for all configs: {query}")  # Debugging log
        responses = {}

        model = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo")

        parser = StrOutputParser()
        chain = model | parser

        template = """
        Answer the question based on the context below. If you can't 
        answer the question, reply "I don't know".

        Context: {context}

        Question: {question}
        """

        prompt = ChatPromptTemplate.from_template(template)

        for config_name, config in chunking_configs.items():
            try:
                logging.debug(f"Processing config: {config_name}")  # Debugging log
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=config['chunk_size'],
                    chunk_overlap=config['chunk_overlap']
                )
                documents = text_splitter.split_documents(documents_raw)

                pinecone_vectorstore = PineconeVectorStore(embedding=embeddings, index_name=config_name)
                chain = (
                    {"context": pinecone_vectorstore.as_retriever(), "question": RunnablePassthrough()}
                    | prompt
                    | model
                    | parser
                )

                response = chain.invoke(query)
                responses[config_name] = response
                logging.debug(f"Response for {config_name}: {response}")  # Debugging log
            except Exception as e:
                logging.error(f"Error processing config {config_name}: {str(e)}")  # Error log
                responses[config_name] = f"Error: {str(e)}"

        return jsonify({"outputs": responses})
    except Exception as e:
        logging.error(f"Error in process_query_all_configs: {str(e)}")  # Error log
        return jsonify({"error": str(e)}), 500

@app.route('/api/process_all_configs', methods=['GET'])
def process_query_all_configs_get():
    return "This endpoint only supports POST requests. Please send a POST request with a query.", 405

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