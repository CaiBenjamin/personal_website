import React, { useState } from 'react';

function ChunkSizeOverlap() {
  const [allConfigsQuery, setAllConfigsQuery] = useState(''); // State for query input
  const [result, setResult] = useState(null); // State for query results
  const [isLoadingAllConfigs, setIsLoadingAllConfigs] = useState(false); // Loading state

  const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://personal-website-c07i.onrender.com';

  const handleAllConfigsQueryChange = (event) => {
    setAllConfigsQuery(event.target.value);
  };

  const handleSubmitAllConfigs = () => {
    if (!allConfigsQuery.trim()) return;

    setIsLoadingAllConfigs(true);
    const data = {
      query: allConfigsQuery,
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
        console.log('Response from backend for all configs:', result);
        setResult(result);
      })
      .catch((error) => {
        console.error('Error sending data to backend for all configs:', error);
      })
      .finally(() => {
        setIsLoadingAllConfigs(false);
      });
  };

  return (
    <div style={{ fontFamily: 'Sour Gummy, cursive', margin: '0 auto', textAlign: 'left' }}>
      <h1 style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '275%' }}>Exploring How Chunk Size and Overlap Can Affect Outputs</h1>
      <br />
      <br />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <p>
          Chunk size and overlap can play a huge role in how well the data RAG can work, but it’s not a one-size-fits-all glove and can heavily depend on the data source you're trying to work on as well. For example, an FAQ with typically short questions and answers might require a small chunk size like 100-200 characters. For a long technical document, you might need a lot of context and larger chunks like 1000-2000 characters or even more, and sometimes you need a middle ground in between the two.
        </p>
        <br />
        <p>
          Sometimes it can be helpful to have multiple different chunk sizes. Let me walk you through some of my tests:
        </p>
        <br />
        <p>
          <strong>Query:</strong> "What happened with the Mark Rober and Tesla video?"<br />
          The longer chunks are generally better in my opinion because they provide full context and details about the situation, offering a complete explanation of what happened in the video. In contrast, shorter chunks might give responses like, "The Mark Rober and Tesla video had a significant market impact, although it is not seen as a big scandal." While this covers the main point, it lacks the necessary explanation, leaving the user wondering why it had such an impact. However, even the 2000-character context with 50 overlap can become lengthy and include extra unnecessary details.
        </p>
        <br />
        <p>
          <strong>Query:</strong> "What does Doug think about the consequences of infinite scroll?"<br />
          Doug’s explanation of infinite scroll wasn’t delivered in a single uninterrupted paragraph — it was spread out, interwoven with anecdotes, side comments, and banter. The 50-character overlap helped connect context between banter between the other podcasters, while the 20-character overlap struggled to maintain this connection.
        </p>
        <br />
        <p>
          Based on my testing, a 1000-character chunk with a 50-character overlap seems to be a good benchmark for podcasts with multiple speakers and dynamic banter. Shorter chunks often get lost in the conversation, while longer ones can sometimes include jokes or off-topic discussions, as the topics in the podcast can switch quickly.
        </p>
        <br />
        <p>
          Now that you’ve heard my explanation, you can test short, medium, and long chunk sizes. Unfortunately, I don't have the option to set custom presets due to the limited indexes I can have on Pinecone. However, if you reach out, I’d be happy to collaborate and test with you! :)
        </p>

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

        {/* Loading indicator for All Configurations */}
        {isLoadingAllConfigs && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: 'blue' }}>
            <p>Loading results for all configurations...</p>
          </div>
        )}

        {/* Display Results for All Configurations */}
        {result && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>Results from All Chunking Configurations</h3>
            <div>
              <strong style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', textDecoration: 'underline' }}>Query:</strong> {allConfigsQuery}
              <br />
              {Object.entries(result.outputs).map(([config, response], index) => {
                const chunkSize = config.includes('2000') ? '2000' : config.includes('1000') ? '1000' : '500';
                const chunkOverlap = config.includes('extra-overlap') ? '50' : '20';
                return (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <strong>Embedding with {chunkSize} characters and overlap with {chunkOverlap} characters:</strong>
                    <p>{response}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Future Exploration Section */}
        <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '20px' }}>Future Exploration</h2>
        <p>
          So far, I’ve only scratched the surface of what’s possible when building a RAG system. My current setup uses a basic configuration, but there are a lot of areas I’d like to explore further:
        </p>
        <ul>
          <li>Vector Stores: I plan to experiment with FAISS for more efficient and scalable retrieval.</li>
          <li>Embeddings: I want to try different embedding models to see how they impact retrieval quality and relevance.</li>
          <li>Model Strength: Upgrading to more powerful LLMs (e.g., GPT-4, Claude, or open-source alternatives like Mistral) could help improve reasoning and reduce hallucinations.</li>
          <li>Prompt Engineering: I haven’t really tested this or explored it at all. I’m interested in maybe seeing if I can type it to answer in more playful ways or stay factual.</li>
          <li>Chunking Strategies: I’ve explored basic chunking approaches and tested different chunk sizes and overlaps, but I’d like to dive deeper. Since the content comes from a podcast with three speakers, adding speaker labels to each chunk could help the model when I would want to ask specific questions about what each speaker said.</li>
        </ul>
      </div>
    </div>
  );
}

export default ChunkSizeOverlap;