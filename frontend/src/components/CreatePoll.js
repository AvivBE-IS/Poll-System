import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePoll.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CreatePoll() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Please enter a poll title');
      return;
    }

    if (!creator.trim()) {
      setError('Please enter your username');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    if (validOptions.length > 8) {
      setError('Maximum 8 options allowed');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/polls`, {
        title: title.trim(),
        creator: creator.trim(),
        options: validOptions
      });

      // Save username to localStorage for future use
      localStorage.setItem('pollUsername', creator.trim());

      // Navigate to the poll
      navigate(`/poll/${response.data.pollId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
      setLoading(false);
    }
  };

  return (
    <div className="create-poll-container">
      <div className="create-poll-card">
        <h1>Create a Poll</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="creator">Your Username:</label>
            <input
              type="text"
              id="creator"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="Enter your username"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Poll Question:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              maxLength={200}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Options:</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  disabled={loading}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="remove-option-btn"
                    disabled={loading}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="add-option-btn"
                disabled={loading}
              >
                + Add Option
              </button>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePoll;
