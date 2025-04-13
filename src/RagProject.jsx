import { useState } from 'react';

function RagProject() {
  const [query, setQuery] = useState(''); // State for user input
  const [result, setResult] = useState(''); // State for query result
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const handleQueryChange = (event) => {
    setQuery(event.target.value); // Update query state
  };

  const handleSubmit = () => {
    setIsLoading(true); // Show loading indicator
    const data = {
      query: query, // Use the query state
    };

    fetch('http://localhost:5000/api/process', {
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
        setResult(`Response: ${result.output || result.error}`); // Add "Response:" before the answer
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        setResult('Error: Unable to process the request. Please try again later.');
      })
      .finally(() => setIsLoading(false)); // Hide loading indicator
  };

  return (
    <div style={{ fontFamily: 'Sour Gummy, cursive' }}>
      <h1>Rag Project Page</h1>
      {/* Query Section */}
      <div style={{ textAlign: 'left', padding: '20px' }}>
        <h2>Query</h2>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Enter your query here"
          style={{ width: '100%', fontSize: '16px', padding: '10px' }}
        />
      </div>
      <button
        onClick={handleSubmit}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Submit
      </button>
      {/* Loading indicator */}
      {isLoading && (
        <div style={{ marginTop: '20px', fontSize: '16px', color: 'orange' }}>
          <p>Loading...</p>
        </div>
      )}
      {/* Display the result at the bottom */}
      <div style={{ marginTop: '20px', fontSize: '16px', color: 'blue', whiteSpace: 'pre-line' }}>
        <h3>Result:</h3>
        <p>{result}</p>
      </div>
    </div>
  );
}

export default RagProject;
