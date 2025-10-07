import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Poll.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Poll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Get username from localStorage
    const savedUsername = localStorage.getItem('pollUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    const fetchPoll = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/polls/${id}`);
        setPoll(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load poll');
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    setVoting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/polls/${id}/vote`, {
        optionId: selectedOption,
        username: username.trim()
      });

      // Save username for future use
      localStorage.setItem('pollUsername', username.trim());

      setHasVoted(true);
      // Navigate to results
      navigate(`/poll/${id}/results?username=${encodeURIComponent(username.trim())}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vote');
      setVoting(false);
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="poll-container">
        <div className="poll-card">
          <div className="loading">Loading poll...</div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="poll-container">
        <div className="poll-card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/')} className="back-btn">
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-container">
      <div className="poll-card">
        <div className="poll-header">
          <h1>{poll.title}</h1>
          <p className="poll-creator">Created by: {poll.creator}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!hasVoted && (
          <>
            <div className="username-input">
              <label htmlFor="username">Your Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={50}
                disabled={voting}
              />
            </div>

            <div className="options-list">
              {poll.options.map((option) => (
                <div
                  key={option.id}
                  className={`option-item ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => !voting && setSelectedOption(option.id)}
                >
                  <div className="option-radio">
                    {selectedOption === option.id && <div className="radio-dot"></div>}
                  </div>
                  <span className="option-text">{option.option_text}</span>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button
                onClick={handleVote}
                className="vote-btn"
                disabled={voting || !selectedOption}
              >
                {voting ? 'Submitting...' : 'Submit Vote'}
              </button>
              
              <button
                onClick={() => navigate(`/poll/${id}/results`)}
                className="results-btn"
              >
                View Results
              </button>
            </div>
          </>
        )}

        <div className="share-section">
          <button onClick={copyShareLink} className="share-btn">
            📋 Copy Share Link
          </button>
        </div>

        <button onClick={() => navigate('/')} className="back-btn">
          Create New Poll
        </button>
      </div>
    </div>
  );
}

export default Poll;
