import { useState } from 'react';

function RagProject() {
  const [query, setQuery] = useState(''); // State for user input
  const [result, setResult] = useState(''); // State for query result
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [chatHistory, setChatHistory] = useState([]); // State for chat history

  const backendUrl = 'https://personal-website-c07i.onrender.com';

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

  const handleSubmitAllConfigs = () => {
    if (!query.trim()) return; // Prevent empty queries

    setIsLoading(true); // Show loading indicator
    const data = {
      query: query, // Use the query state
    };

    fetch(`${backendUrl}/api/process-all-configs`, {
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
        console.log('Response from backend for all configs:', result); // Display the result
        setChatHistory((prev) => [...prev, { sender: 'bot', message: result.output || result.error }]);
      })
      .catch((error) => {
        console.error('Error sending data to backend for all configs:', error);
        setChatHistory((prev) => [...prev, { sender: 'bot', message: 'Error: Unable to process the request for all configurations. Please try again later.' }]);
      })
      .finally(() => {
        setIsLoading(false); // Hide loading indicator
        setQuery(''); // Clear the input field
      });
  };

  return (
    <div style={{ fontFamily: 'Sour Gummy, cursive', maxWidth: '600px', margin: '0 auto' }}>
      <h2>RAG For The Lemonade Stand Podcast</h2>
    <p>The Lemonade Stand Podcast is a series thats explores the business world from the perespective of DougDoug, Atrioc and Aiden, three streamers who explore the business world.
    I combined the episodes from the Lemonade Stand Podcasts, allowing users to ask any question and receive contextually responses from the podcast.</p>

      <div
        style={{
          // Removed the border property
          borderRadius: '8px',
          padding: '10px',
          height: '400px',
          overflowY: 'scroll',
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
   
      {/* Query Input for All Configurations */}
      <div style={{ marginTop: '20px' }}>
        <h3>Run Query Across All Chunking Configurations</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your query..."
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleSubmitAllConfigs}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
          }}
        >
          Run Query
        </button>
      </div>
    </div>
  );
}

export default RagProject;
