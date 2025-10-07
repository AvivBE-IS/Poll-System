import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Results.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const url = username 
          ? `${API_URL}/api/polls/${id}/results?username=${encodeURIComponent(username)}`
          : `${API_URL}/api/polls/${id}/results`;
        
        const response = await axios.get(url);
        setResults(response.data);
        setLoading(false);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load results');
        setLoading(false);
      }
    };

    fetchResults();
    // Auto-refresh results every 5 seconds
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [id, username]);

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="results-card">
          <div className="loading">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="results-container">
        <div className="results-card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/')} className="back-btn">
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h1>{results.title}</h1>
          <p className="poll-creator">Created by: {results.creator}</p>
          <p className="total-votes">Total Votes: {results.totalVotes}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results-list">
          {results.results.map((option) => {
            const isUserVote = results.userVote === option.id;
            return (
              <div key={option.id} className="result-item">
                <div className="result-header">
                  <span className="result-text">
                    {option.text}
                    {isUserVote && <span className="your-vote"> (Your vote)</span>}
                  </span>
                  <span className="result-votes">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''} ({option.percentage}%)
                  </span>
                </div>
                <div className="result-bar-container">
                  <div
                    className={`result-bar ${isUserVote ? 'user-vote' : ''}`}
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {results.totalVotes === 0 && (
          <div className="no-votes-message">
            No votes yet. Be the first to vote!
          </div>
        )}

        <div className="button-group">
          {!results.userVote && (
            <button
              onClick={() => navigate(`/poll/${id}`)}
              className="vote-btn"
            >
              Vote Now
            </button>
          )}
          
          <button onClick={copyShareLink} className="share-btn">
            📋 Copy Share Link
          </button>
        </div>

        <button onClick={() => navigate('/')} className="back-btn">
          Create New Poll
        </button>

        <div className="auto-refresh-notice">
          Results auto-refresh every 5 seconds
        </div>
      </div>
    </div>
  );
}

export default Results;
