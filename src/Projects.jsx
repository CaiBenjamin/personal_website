import { useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/projects/RagProject'); // Correct the path to match App.jsx
  };

  return (
    <div style={{ fontFamily: 'Sour Gummy, cursive' }}>
      {/* Full-width Header - Center aligned */}
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Projects</h1>
        <p>Here are some of the projects I've worked on:</p>
      </div>
      {/* Add a button to redirect */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleRedirect}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Go to Rag Project
        </button>
      </div>
    </div>
  );
}

export default Projects;

