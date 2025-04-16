import { useState } from 'react';

const chunking_configs = {
  "lemonade-stand-podcast": {"chunk_size": 1000, "chunk_overlap": 20},
  "lemonade-stand-2000": {"chunk_size": 2000, "chunk_overlap": 20},
  "lemonade-stand-500": {"chunk_size": 500, "chunk_overlap": 20},
  "lemonade-stand-2000-extra-overlap": {"chunk_size": 2000, "chunk_overlap": 50},
  "lemonade-stand-1000-extra-overlap": {"chunk_size": 1000, "chunk_overlap": 50},
};

function RagProject() {
  const [query, setQuery] = useState(''); // State for user input
  const [result, setResult] = useState(''); // State for query result
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [chatHistory, setChatHistory] = useState([]); // State for chat history
  const [allConfigsQuery, setAllConfigsQuery] = useState(''); // Separate state for all configs query

  const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://personal-website-c07i.onrender.com';

  const handleQueryChange = (event) => {
    setQuery(event.target.value); // Update query state
  };

  const handleAllConfigsQueryChange = (event) => {
    setAllConfigsQuery(event.target.value); // Update allConfigsQuery state
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
    if (!allConfigsQuery.trim()) return; // Prevent empty queries

    setIsLoading(true); // Show loading indicator
    const data = {
      query: allConfigsQuery, // Use the allConfigsQuery state
    };

    fetch(`${backendUrl}/api/process_all_configs`, {
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
        setResult(result); // Update the result state
        setChatHistory((prev) => [...prev, { sender: 'bot', message: result.output || result.error }]);
      })
      .catch((error) => {
        console.error('Error sending data to backend for all configs:', error);
        setChatHistory((prev) => [...prev, { sender: 'bot', message: 'Error: Unable to process the request for all configurations. Please try again later.' }]);
      })
      .finally(() => {
        setIsLoading(false); // Hide loading indicator
        // Removed setAllConfigsQuery('') to keep the query displayed
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
        <h2>Exploring How Chunk Size and Overlap Can Affect Outputs</h2>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'left' }}>
        <p>
          Chunk size and overlap can play a huge role in how well the data RAG can work, but it’s not a one size fits all glove and can heavily depend on the data source you're trying to work on as well. For example, an FAQ with typically short questions and answers might require a small chunk size like 100-200 characters. For a long technical document, you might need a lot of context and larger chunks like 1000-2000 characters or even more, and sometimes you need a middle ground in between the two. Sometimes it can be helpful to have multiple different chunk sizes. Let me walk you through some of my tests:
        </p>
        <p>
        <br />
        </p>
        <p>
          <strong>Query:</strong> "What happened with the Mark Rober and Tesla video?"<br />
          The longer chunks are generally better in my opinion because they provide full context and details about the situation, offering a complete explanation of what happened in the video. In contrast, shorter chunks might give responses like, 'The Mark Rober and Tesla video had a significant market impact, although it is not seen as a big scandal.' While this covers the main point, it lacks the necessary explanation, leaving the user wondering why it had such an impact. However, even the 2000-character context with 50 overlap can become lengthy and include extra unnecessary details.
        </p>
        <br />
        <p>
          <strong>Query:</strong> "What does Doug think about the consequences of infinite scroll?"<br />
          Doug’s explanation of infinite scroll wasn’t delivered in a single uninterrupted paragraph — it was spread out, interwoven with anecdotes, side comments, and banter. The 50-character overlap helped connect context between banter between the other podcasters while the 20-character overlap struggled to maintain this connection.
        </p>
        <br />
        <p>
          Based on my testing, a 1000-character chunk with a 50-character overlap seems to be a good benchmark for podcasts with multiple speakers and dynamic banter. Shorter chunks often get lost in the conversation, while longer ones can sometimes include jokes or off-topic discussions, as the topics in the podcast can switch quickly.
        </p>
        <br />
        <p>
          Now that you’ve heard my explanation, you can test short, medium, and long chunk sizes. Unfortunately, I don't have the option to set custom presets due to the limited indexes I can have on Pinecone. However, if you reach out, I’d be happy to collaborate and test with you! :)
        </p>
      </div>

      {/* Query Input for All Configurations */}
      <div style={{ marginTop: '20px' }}>
        <h3>Run Query Across All Chunking Configurations</h3>
        <input
          type="text"
          value={allConfigsQuery}
          onChange={handleAllConfigsQueryChange}
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

      {/* Display Results for All Configurations */}
      {result && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Results from All Chunking Configurations</h3>
          <div>
            <strong>Query:</strong> {allConfigsQuery}
            <br />
            {Object.entries(result.outputs).map(([config, response], index) => {
              const chunkSize = chunking_configs[config]?.chunk_size || 'unknown';
              const chunkOverlap = chunking_configs[config]?.chunk_overlap || 'unknown';
              const displayConfig = (
                <>
                  Embedding with {chunkSize} characters and overlap with {chunkOverlap} characters
                  <br />
                </>
              );
              return (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <strong>{displayConfig}</strong>
                  <div>{response}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RagProject;
