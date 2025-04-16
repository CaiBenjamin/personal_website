import { useState } from 'react';
import { Link } from 'react-router-dom';

const chunking_configs = {
  "lemonade-stand-podcast": {"chunk_size": 1000, "chunk_overlap": 20},
  "lemonade-stand-2000": {"chunk_size": 2000, "chunk_overlap": 20},
  "lemonade-stand-500": {"chunk_size": 500, "chunk_overlap": 20},
  "lemonade-stand-2000-extra-overlap": {"chunk_size": 2000, "chunk_overlap": 50},
  "lemonade-stand-1000-extra-overlap": {"chunk_size": 1000, "chunk_overlap": 50},
};

const prompt_templates = {
  default: `Answer the question based on the context below. If you can't 
  answer the question, reply "I don't know".

  Context: {context}

  Question: {question}`,
  find_relevant: `Identify the most relevant sentence or phrase in the context that answers the question. If no such sentence exists, say "I don't know."

  Context: {context}

  Question: {question}`,
  factual: `Give a factual answer using only the context. Do not speculate or fill in gaps. If the context lacks the necessary info, respond with "I don't know."

  Context: {context}

  Question: {question}`,
  summarize: `Summarize the context below in one or two sentences, focusing on the key points. If the context is unclear, say "I don't know."

  Context: {context}`,
  explain: `Explain the context below in simple terms as if you were teaching it to a beginner. If the context is unclear, say "I don't know."

  Context: {context}`,
  compare: `Compare and contrast the key points in the context below. Highlight similarities and differences. If the context lacks sufficient information, say "I don't know."

  Context: {context}`,
};

const documents = [
  { page_content: "Chunk 1 content goes here." },
  { page_content: "Chunk 2 content goes here." },
  { page_content: "Chunk 3 content goes here." },
  { page_content: "Chunk 4 content goes here." },
  { page_content: "Chunk 5 content goes here." },
];

function RagProject() {
  const [query, setQuery] = useState(''); // State for user input
  const [result, setResult] = useState(''); // State for query result
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [chatHistory, setChatHistory] = useState([]); // State for chat history

  const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://personal-website-c07i.onrender.com';

  const handleQueryChange = (event) => {
    setQuery(event.target.value); // Update query state
  };

  const handleSubmit = () => {
    if (!query.trim()) return; // Prevent empty queries

    setIsLoading(true); // Show loading indicator
    const data = {
      query: query, // Use the query state
    };

    // Add the user's query to the chat history
    setChatHistory((prev) => [...prev, { sender: 'user', message: query }]);

    fetch(`${backendUrl}/api/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        console.log('Response from backend:', result); // Display the result from rag_lemonade.py
        setChatHistory((prev) => [...prev, { sender: 'bot', message: result.output || result.error }]);
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        setChatHistory((prev) => [...prev, { sender: 'bot', message: 'Error: Unable to process the request. Please try again later.' }]);
      })
      .finally(() => {
        setIsLoading(false); // Hide loading indicator
        setQuery(''); // Clear the input field
      });
  };

  return (
    <div style={{ fontFamily: 'Sour Gummy, cursive', maxWidth: '900px', margin: '0 auto' }}>
      <h2>RAG For The Lemonade Stand Podcast</h2>
    <p>The Lemonade Stand Podcast is a series thats explores the business world from the perespective of DougDoug, Atrioc and Aiden, three streamers who explore the business world.
    I combined the episodes from the Lemonade Stand Podcasts, allowing users to ask any question and receive contextually responses from the podcast.</p>

      <div
        style={{
          borderRadius: '8px',
          padding: '10px',
          height: '400px',
          overflowY: 'auto', // Changed from 'scroll' to 'auto'
          marginBottom: '20px',
        }}
      >
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            style={{
              textAlign: chat.sender === 'user' ? 'right' : 'left',
              margin: '10px 0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: chat.sender === 'user' ? '#d1e7dd' : '#f8d7da',
                color: chat.sender === 'user' ? '#0f5132' : '#842029',
                maxWidth: '70%',
                wordWrap: 'break-word',
              }}
            >
              {chat.message}
            </span>
          </div>
        ))}
      </div>
      {/* Query Input */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Type your message..."
          style={{ flex: 1, fontSize: '16px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
          }}
        >
          Send
        </button>
      </div>
      {/* Loading indicator */}
      {isLoading && (
        <div style={{ marginTop: '20px', fontSize: '16px', color: 'orange' }}>
          <p>Loading...</p>
        </div>
      )}
   
      {/* Section Title for Chunking Configurations */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <h2>Explore How Chunk Size and Overlap Can Affect Outputs</h2>
        <p>
          <Link to="/chunk-size-overlap">Learn more about chunk size and overlap</Link>
        </p>
      </div>
    </div>
  );
}

export default RagProject;
