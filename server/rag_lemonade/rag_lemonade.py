import os
from dotenv import load_dotenv
from langchain_openai.chat_models import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document  # or from langchain.schema import Document depending on your version
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from flask import Flask, request, jsonify
import logging

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path="/Users/bcai/projects/personal_website/.env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please check your .env file.")

if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY environment variable is not set. Please check your .env file.")

model = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo")

parser = StrOutputParser()
chain = model | parser

template = """
Answer the question based on the context below. If you can't 
answer the question, reply "I don't know".

Context: {context}

Question: {question}
"""

find_relevant_template = """
Identify the most relevant sentence or phrase in the context that answers the question. If no such sentence exists, say "I don't know."

Context: {context}

Question: {question}
"""

factua_template = """
Give a factual answer using only the context. Do not speculate or fill in gaps. If the context lacks the necessary info, respond with "I don't know."

Context: {context}

Question: {question}
"""

# Define multiple prompt templates for testing
prompt_templates = {
    "default": """
    Answer the question based on the context below. If you can't 
    answer the question, reply "I don't know".

    Context: {context}

    Question: {question}
    """,
    "find_relevant": """
    Identify the most relevant sentence or phrase in the context that answers the question. If no such sentence exists, say "I don't know."

    Context: {context}

    Question: {question}
    """,
    "factual": """
    Give a factual answer using only the context. Do not speculate or fill in gaps. If the context lacks the necessary info, respond with "I don't know."

    Context: {context}

    Question: {question}
    """,
    "summarize": """
    Summarize the context below in one or two sentences, focusing on the key points. If the context is unclear, say "I don't know."

    Context: {context}
    """,
    "explain": """
    Explain the context below in simple terms as if you were teaching it to a beginner. If the context is unclear, say "I don't know."

    Context: {context}
    """,
    "compare": """
    Compare and contrast the key points in the context below. Highlight similarities and differences. If the context lacks sufficient information, say "I don't know."

    Context: {context}
    """
}

prompt = ChatPromptTemplate.from_template(template)

# Construct the absolute path to the transcript file
TRANSCRIPTS_DIR = os.path.join(os.path.dirname(__file__), 'transcripts')
TRANSCRIPT_FILE = "Lemonade Stand Podcast Combined.txt"

loader = TextLoader(os.path.join(TRANSCRIPTS_DIR, TRANSCRIPT_FILE))

text_documents = loader.load()

documents_raw = [Document(page_content=doc.page_content, metadata=doc.metadata) for doc in text_documents]

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=20)
documents = text_splitter.split_documents(documents_raw)


embeddings = OpenAIEmbeddings()

index_name = "lemonade-stand-podcast"

chunking_configs = {
    "lemonade-stand-podcast": {"chunk_size": 1000, "chunk_overlap": 20},  # Renamed from lemonade-stand-podcast
    "lemonade-stand-2000": {"chunk_size": 2000, "chunk_overlap": 20},
    "lemonade-stand-500": {"chunk_size": 500, "chunk_overlap": 20},
    "lemonade-stand-2000-extra-overlap": {"chunk_size": 2000, "chunk_overlap": 50},  # New index
    "lemonade-stand-1000-extra-overlap": {"chunk_size": 1000, "chunk_overlap": 50},  # New index
}

# Define batch size for processing documents
# BATCH_SIZE = 100  # Adjust this value based on Pinecone's constraints and your requirements

## Add documents to Pinecone in batches
# try:
#     pinecone_vectorstore = PineconeVectorStore(embedding=embeddings, index_name=index_name)

#     for i in range(0, len(documents), BATCH_SIZE):
#         batch = documents[i:i + BATCH_SIZE]
#         print(f"Processing batch {i // BATCH_SIZE + 1} with {len(batch)} documents...")
#         pinecone_vectorstore.add_documents(batch)

# except Exception as e:
#     raise RuntimeError(f"Error adding documents to Pinecone VectorStore: {e}")

pinecone_vectorstore = PineconeVectorStore(embedding=embeddings, index_name=index_name)

chain = (
    {"context": pinecone_vectorstore.as_retriever(), "question": RunnablePassthrough()}
    | prompt
    | model
    | parser
)

# Function to process and print prompts with chunks
def process_and_print_prompts():
    for prompt_name, prompt_template in prompt_templates.items():
        print(f"\nUsing Prompt: {prompt_name}\n")
        for i in range(0, len(documents), 5):  # Process 5 chunks at a time
            chunk_batch = documents[i:i + 5]
            context = "\n".join([chunk.page_content for chunk in chunk_batch])
            formatted_prompt = prompt_template.format(context=context, question="What is the main idea?")
            print(f"Prompt:\n{formatted_prompt}\n")

# Call the function to process and print prompts
process_and_print_prompts()

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG)

@app.route('/api/process', methods=['POST'])
def process_query():
    data = request.get_json()
    query = data.get('query', '')

    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        # Pass the user query to the chain
        response = chain.invoke(query)
        return jsonify({"output": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process_all_configs', methods=['POST'])
def process_query_all_configs():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({"error": "Query is required"}), 400

        logging.debug(f"Received query for all configs: {query}")  # Debugging log
        responses = {}

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)