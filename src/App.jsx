import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Projects from './Projects';
import About from './About';
import RagProject from './RagProject'; // Import the RagProject page

function App() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <Router>
      <div id="root" style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 1s ease-in' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', fontFamily: "Chelsea Market" }}>
          <img src="/src/assets/transparent_corgi.png" alt="Nap Time" style={{ width: '75px', height: '75px', objectFit: 'cover', position: 'absolute', left: '20px', top: '10px' }} />
          <nav style={{ display: 'flex', alignItems: 'center', position: 'fixed', top: '10px', right: '20px', zIndex: 1000, fontFamily: "Chelsea Market" }}>
            <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
            <Link to="/projects" style={{ margin: '0 10px' }}>Projects</Link>
            <Link to="/about" style={{ margin: '0 10px' }}>About</Link>
            <button
              onClick={() => window.open('https://www.linkedin.com/in/benjamin-cai-a59822159/', '_blank')}
              style={{ margin: '0 10px', padding: '5px 10px', cursor: 'pointer', fontFamily: "Chelsea Market" }}
            >
              Connect
            </button>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: "Chelsea Market", color: '#F4A261', fontSize: '1.5em', padding: '20px 0', position: 'relative' }}>
              <p style={{ maxWidth: '900px', margin: '0 auto' }}>
                Benjamin Cai is a software developer who thrives on building innovative projects, solving complex problems, and exploring new technologies.
              </p>
              <img src="/src/assets/sleeping_corgi.png" alt="Sleeping Corgi" style={{ width: '150px', height: '150px', objectFit: 'cover', position: 'absolute', right: '20px', top: '50%' }} />
            </div>
          } />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          {/* Define the route for RagProject */}
          <Route path="/projects/RagProject" element={<RagProject />} />
          <Route path="*" element={<div>Page Not Found</div>} /> {/* Fallback route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
