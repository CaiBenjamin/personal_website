import React, { useState } from 'react';

function Chatbot() {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState({});
  const [chunkingExplanation, setChunkingExplanation] = useState(null);

  const handleQuery = async () => {
    // Fetch chatbot response
    const chatbotResponse = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const chatbotData = await chatbotResponse.json();
    setResponses(chatbotData);

    // Fetch chunking explanation
    const explanationResponse = await fetch('/api/chunking_explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const explanationData = await explanationResponse.json();
    setChunkingExplanation(explanationData.responses);
  };

  return (
    <div>
      <h1>Chatbot</h1>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query here..."
      />
      <button onClick={handleQuery}>Submit</button>
      <div>
        <h2>Chatbot Response</h2>
        <p>{responses.output}</p>
      </div>
      <div>
        <h2>Chunking Configurations and Responses</h2>
        {chunkingExplanation &&
          Object.entries(chunkingExplanation).map(([indexName, response]) => (
            <div key={indexName}>
              <h3>{indexName}</h3>
              <p>{response}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Chatbot;