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

# Define batch size for processing documents
# BATCH_SIZE = 100  # Adjust this value based on Pinecone's constraints and your requirements

# Add documents to Pinecone in batches
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

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)