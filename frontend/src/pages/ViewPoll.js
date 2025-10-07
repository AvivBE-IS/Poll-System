import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ViewPoll.css';

const API_BASE_URL = 'http://localhost:3001/api';

function ViewPoll() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  const fetchPoll = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/${pollId}`);
      setPoll(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load poll');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const checkIfVoted = async (user) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/${pollId}/check-vote/${user}`);
      setHasVoted(response.data.hasVoted);
      setVotedOptionId(response.data.votedOptionId);
    } catch (err) {
      console.error('Failed to check vote status');
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setShowUsernameInput(false);
      checkIfVoted(username);
    }
  };

  const handleVote = async (optionId) => {
    if (!username) {
      setShowUsernameInput(true);
      setSelectedOption(optionId);
      return;
    }

    setError('');
    try {
      await axios.post(`${API_BASE_URL}/polls/${pollId}/vote`, {
        optionId,
        username
      });
      setHasVoted(true);
      setVotedOptionId(optionId);
      fetchPoll(); // Refresh poll data to show updated vote counts
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vote');
    }
  };

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert('Poll link copied to clipboard!');
  };

  if (loading) {
    return <div className="loading">Loading poll...</div>;
  }

  if (error && !poll) {
    return <div className="error-message">{error}</div>;
  }

  if (!poll) {
    return <div className="error-message">Poll not found</div>;
  }

  const calculatePercentage = (votes) => {
    if (poll.totalVotes === 0) return 0;
    return ((votes / poll.totalVotes) * 100).toFixed(1);
  };

  return (
    <div className="view-poll">
      <div className="poll-header">
        <h2>{poll.title}</h2>
        <p className="poll-creator">Created by: {poll.creator}</p>
        <button className="share-button" onClick={copyShareLink}>
          📋 Share Poll
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showUsernameInput && (
        <div className="username-modal">
          <div className="modal-content">
            <h3>Enter Your Name</h3>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                required
                autoFocus
              />
              <button type="submit">Continue</button>
            </form>
          </div>
        </div>
      )}

      {!username && !showUsernameInput && (
        <div className="username-prompt">
          <button onClick={() => setShowUsernameInput(true)}>
            Enter Your Name to Vote
          </button>
        </div>
      )}

      {username && hasVoted && (
        <div className="vote-status">
          ✓ You have already voted on this poll
        </div>
      )}

      <div className="options-list">
        {poll.options.map((option) => {
          const percentage = calculatePercentage(option.votes);
          const isSelected = hasVoted && option.id === votedOptionId;

          return (
            <div
              key={option.id}
              className={`option-item ${hasVoted ? 'voted' : ''} ${isSelected ? 'selected' : ''}`}
            >
              <div className="option-content">
                <div className="option-text">
                  {option.option_text}
                  {isSelected && <span className="your-vote"> (Your vote)</span>}
                </div>
                {!hasVoted && username && (
                  <button
                    className="vote-button"
                    onClick={() => handleVote(option.id)}
                  >
                    Vote
                  </button>
                )}
              </div>
              
              {hasVoted && (
                <div className="vote-stats">
                  <div 
                    className="vote-bar" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="vote-info">
                    <span className="vote-count">{option.votes} votes</span>
                    <span className="vote-percentage">{percentage}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="poll-footer">
        <p>Total votes: {poll.totalVotes}</p>
      </div>
    </div>
  );
}

export default ViewPoll;
