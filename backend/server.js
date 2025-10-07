const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create a new poll
app.post('/api/polls', (req, res) => {
  const { title, options, creator } = req.body;

  // Validation
  if (!title || !options || !creator) {
    return res.status(400).json({ error: 'Title, options, and creator are required' });
  }

  if (options.length < 2 || options.length > 8) {
    return res.status(400).json({ error: 'Poll must have between 2 and 8 options' });
  }

  const pollId = uuidv4();

  db.serialize(() => {
    // Insert poll
    db.run(
      'INSERT INTO polls (id, title, creator) VALUES (?, ?, ?)',
      [pollId, title, creator],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create poll' });
        }

        // Insert options
        const stmt = db.prepare('INSERT INTO options (poll_id, option_text) VALUES (?, ?)');
        options.forEach((option) => {
          stmt.run(pollId, option);
        });
        stmt.finalize();

        res.status(201).json({ 
          pollId,
          message: 'Poll created successfully',
          shareUrl: `http://localhost:3000/poll/${pollId}`
        });
      }
    );
  });
});

// Get poll details
app.get('/api/polls/:pollId', (req, res) => {
  const { pollId } = req.params;

  db.get('SELECT * FROM polls WHERE id = ?', [pollId], (err, poll) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch poll' });
    }

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    db.all('SELECT * FROM options WHERE poll_id = ?', [pollId], (err, options) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch options' });
      }

      // Get vote counts for each option
      db.all(
        `SELECT option_id, COUNT(*) as count 
         FROM votes 
         WHERE poll_id = ? 
         GROUP BY option_id`,
        [pollId],
        (err, voteCounts) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch vote counts' });
          }

          const voteMap = {};
          voteCounts.forEach((v) => {
            voteMap[v.option_id] = v.count;
          });

          const optionsWithVotes = options.map((option) => ({
            ...option,
            votes: voteMap[option.id] || 0
          }));

          const totalVotes = Object.values(voteMap).reduce((sum, count) => sum + count, 0);

          res.json({
            ...poll,
            options: optionsWithVotes,
            totalVotes
          });
        }
      );
    });
  });
});

// Submit a vote
app.post('/api/polls/:pollId/vote', (req, res) => {
  const { pollId } = req.params;
  const { optionId, username } = req.body;

  if (!optionId || !username) {
    return res.status(400).json({ error: 'Option ID and username are required' });
  }

  // Check if user has already voted
  db.get(
    'SELECT * FROM votes WHERE poll_id = ? AND username = ?',
    [pollId, username],
    (err, existingVote) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check existing vote' });
      }

      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this poll' });
      }

      // Insert vote
      db.run(
        'INSERT INTO votes (poll_id, option_id, username) VALUES (?, ?, ?)',
        [pollId, optionId, username],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to submit vote' });
          }

          res.status(201).json({ message: 'Vote submitted successfully' });
        }
      );
    }
  );
});

// Check if user has voted
app.get('/api/polls/:pollId/check-vote/:username', (req, res) => {
  const { pollId, username } = req.params;

  db.get(
    'SELECT option_id FROM votes WHERE poll_id = ? AND username = ?',
    [pollId, username],
    (err, vote) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check vote' });
      }

      res.json({ 
        hasVoted: !!vote,
        votedOptionId: vote ? vote.option_id : null
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
