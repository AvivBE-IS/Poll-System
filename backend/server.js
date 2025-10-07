const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./polls.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      creator TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS poll_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      FOREIGN KEY (poll_id) REFERENCES polls(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id TEXT NOT NULL,
      option_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (poll_id) REFERENCES polls(id),
      FOREIGN KEY (option_id) REFERENCES poll_options(id),
      UNIQUE(poll_id, username)
    )
  `);
}

// API Routes

// Create a new poll
app.post('/api/polls', (req, res) => {
  const { title, options, creator } = req.body;

  // Validation
  if (!title || !options || !creator) {
    return res.status(400).json({ error: 'Title, options, and creator are required' });
  }

  if (!Array.isArray(options) || options.length < 2 || options.length > 8) {
    return res.status(400).json({ error: 'Poll must have between 2 and 8 options' });
  }

  if (options.some(opt => !opt || opt.trim() === '')) {
    return res.status(400).json({ error: 'All options must have text' });
  }

  const pollId = uuidv4();

  // Insert poll
  db.run(
    'INSERT INTO polls (id, title, creator) VALUES (?, ?, ?)',
    [pollId, title, creator],
    function (err) {
      if (err) {
        console.error('Error creating poll:', err);
        return res.status(500).json({ error: 'Failed to create poll' });
      }

      // Insert options
      const stmt = db.prepare('INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)');
      
      options.forEach(option => {
        stmt.run(pollId, option);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error adding options:', err);
          return res.status(500).json({ error: 'Failed to add options' });
        }
        
        res.status(201).json({ 
          pollId,
          message: 'Poll created successfully',
          shareLink: `/poll/${pollId}`
        });
      });
    }
  );
});

// Get poll details
app.get('/api/polls/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM polls WHERE id = ?', [id], (err, poll) => {
    if (err) {
      console.error('Error fetching poll:', err);
      return res.status(500).json({ error: 'Failed to fetch poll' });
    }

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    db.all('SELECT * FROM poll_options WHERE poll_id = ?', [id], (err, options) => {
      if (err) {
        console.error('Error fetching options:', err);
        return res.status(500).json({ error: 'Failed to fetch options' });
      }

      res.json({
        id: poll.id,
        title: poll.title,
        creator: poll.creator,
        createdAt: poll.created_at,
        options
      });
    });
  });
});

// Vote on a poll
app.post('/api/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { optionId, username } = req.body;

  if (!optionId || !username) {
    return res.status(400).json({ error: 'Option ID and username are required' });
  }

  // Check if user has already voted
  db.get(
    'SELECT * FROM votes WHERE poll_id = ? AND username = ?',
    [id, username],
    (err, existingVote) => {
      if (err) {
        console.error('Error checking vote:', err);
        return res.status(500).json({ error: 'Failed to check vote' });
      }

      if (existingVote) {
        return res.status(400).json({ error: 'User has already voted on this poll' });
      }

      // Verify option belongs to this poll
      db.get(
        'SELECT * FROM poll_options WHERE id = ? AND poll_id = ?',
        [optionId, id],
        (err, option) => {
          if (err) {
            console.error('Error verifying option:', err);
            return res.status(500).json({ error: 'Failed to verify option' });
          }

          if (!option) {
            return res.status(400).json({ error: 'Invalid option for this poll' });
          }

          // Record vote
          db.run(
            'INSERT INTO votes (poll_id, option_id, username) VALUES (?, ?, ?)',
            [id, optionId, username],
            function (err) {
              if (err) {
                console.error('Error recording vote:', err);
                return res.status(500).json({ error: 'Failed to record vote' });
              }

              res.json({ message: 'Vote recorded successfully' });
            }
          );
        }
      );
    }
  );
});

// Get poll results
app.get('/api/polls/:id/results', (req, res) => {
  const { id } = req.params;
  const { username } = req.query;

  // Get poll details
  db.get('SELECT * FROM polls WHERE id = ?', [id], (err, poll) => {
    if (err) {
      console.error('Error fetching poll:', err);
      return res.status(500).json({ error: 'Failed to fetch poll' });
    }

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Get options with vote counts
    db.all(
      `SELECT 
        po.id, 
        po.option_text, 
        COUNT(v.id) as vote_count
      FROM poll_options po
      LEFT JOIN votes v ON po.id = v.option_id
      WHERE po.poll_id = ?
      GROUP BY po.id, po.option_text
      ORDER BY po.id`,
      [id],
      (err, options) => {
        if (err) {
          console.error('Error fetching results:', err);
          return res.status(500).json({ error: 'Failed to fetch results' });
        }

        // Calculate total votes and percentages
        const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
        const results = options.map(opt => ({
          id: opt.id,
          text: opt.option_text,
          votes: opt.vote_count,
          percentage: totalVotes > 0 ? ((opt.vote_count / totalVotes) * 100).toFixed(1) : 0
        }));

        // Check if user has voted
        let userVote = null;
        if (username) {
          db.get(
            'SELECT option_id FROM votes WHERE poll_id = ? AND username = ?',
            [id, username],
            (err, vote) => {
              if (vote) {
                userVote = vote.option_id;
              }
              
              res.json({
                id: poll.id,
                title: poll.title,
                creator: poll.creator,
                createdAt: poll.created_at,
                results,
                totalVotes,
                userVote
              });
            }
          );
        } else {
          res.json({
            id: poll.id,
            title: poll.title,
            creator: poll.creator,
            createdAt: poll.created_at,
            results,
            totalVotes,
            userVote: null
          });
        }
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
