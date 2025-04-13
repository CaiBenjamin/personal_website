import irlCorgiOnBed from './assets/irl_corgi_on_bed.jpg';
import corgiPupCup from './assets/corgi_pup_cup.jpg';

function About() {
  return (
    <div style={{ position: 'relative', padding: '20px', fontFamily: 'Sour Gummy, cursive' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, textAlign: 'left', maxWidth: '600px' /* Adjust max width as needed */ }}>
          <h1>About Me</h1>
          <p>Hi, my name is Benjamin Cai, and when I’m not loving my pet corgi or playing volleyball, I’m helping design solutions of the future. I have a passion to learn new technologies, and this site is just a little profile of all the features I am exploring and learning.</p>
          <p>My experience as a Full Stack Developer at Freddie Mac includes designing websites in R Shiny and creating work papers for detailed analysis, as well as my own independent React projects and web scraping with Selenium and Beautiful Soup.</p>
          <p>As a competitive TFT player and lover of indie games, my passion to be the best at games carries over to my work, constantly learning the new meta and optimizing for maximum efficiency.</p>
          <p>Thank you for taking a look at my profile, and I hope you reach out to connect.</p>
        </div>
        <img 
          src={irlCorgiOnBed} 
          alt="Corgi Pup Cup" 
          style={{ 
            width: 'clamp(200px, 20vw, 300px)', 
            height: 'clamp(250px, 25vw, 350px)', 
            objectFit: 'cover', 
            marginLeft: '20px', 
            alignSelf: 'flex-end' 
          }} 
        />
      </div>
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#F4E1D2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'Chelsea Market', marginBottom: '10px' }}>Let’s Connect!</h2>
          <p>📍 DMV Area, but Open to Anything</p>
          <p>🎓 University of Maryland College Park </p>
          <p>📧 bcai@terpmail.umd.edu</p>
          <p>🔗 <a href="https://www.linkedin.com/in/benjamin-cai-a59822159/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0077B5' }}>https://www.linkedin.com/in/benjamin-cai</a></p>
          <button 
            style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#A3C585', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontFamily: 'Chelsea Market' }}
            onClick={() => window.open('https://www.linkedin.com/in/benjamin-cai-a59822159/', '_blank')}
          >
            Ready? Connect with me!
          </button>
        </div>
        <div style={{ marginLeft: '20px', textAlign: 'center' }}>
          <img src={corgiPupCup} alt="One of my furbabies" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
          <p style={{ marginTop: '10px', fontSize: '0.9em', fontStyle: 'italic' }}>One of my furbabies, Sir Poggletons!</p>
        </div>
      </div>
    </div>
  );
}

export default About;