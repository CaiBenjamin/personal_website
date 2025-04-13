import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5001; // Change the port to 5001 or any other available port

// Explicit path to the transcripts folder
const transcriptsFolder = '/Users/bcai/projects/personal_website/server/transcripts';

// Enable CORS
app.use(cors());

// API endpoint to get transcript file names
app.get('/api/transcripts', (req, res) => {
  fs.readdir(transcriptsFolder, (err, files) => {
    if (err) {
      console.error('Error reading transcripts folder:', err); // Log the error
      return res.status(500).json({ error: 'Unable to fetch transcripts' });
    }
    res.json(files.map((file) => encodeURIComponent(file))); // Encode file names
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});
