import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePoll.css';

const API_BASE_URL = 'http://localhost:3001/api';

function CreatePoll() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShareUrl('');

    // Validation
    if (!title.trim()) {
      setError('Poll title is required');
      return;
    }

    if (!creator.trim()) {
      setError('Your name is required');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (validOptions.length > 8) {
      setError('Maximum 8 options allowed');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/polls`, {
        title,
        creator,
        options: validOptions
      });

      const pollId = response.data.pollId;
      setShareUrl(`${window.location.origin}/poll/${pollId}`);
      
      // Optionally navigate to the poll after a delay
      setTimeout(() => {
        navigate(`/poll/${pollId}`);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Poll link copied to clipboard!');
  };

  return (
    <div className="create-poll">
      <h2>Create a New Poll</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {shareUrl ? (
        <div className="share-section">
          <h3>Poll Created Successfully! 🎉</h3>
          <p>Share this link with others:</p>
          <div className="share-url">
            <input type="text" value={shareUrl} readOnly />
            <button onClick={copyToClipboard}>Copy</button>
          </div>
          <p className="redirect-message">Redirecting to poll...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Poll Title/Question:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., What's your favorite programming language?"
              required
            />
          </div>

          <div className="form-group">
            <label>Options:</label>
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeOption(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 8 && (
              <button type="button" className="add-option-button" onClick={addOption}>
                + Add Option
              </button>
            )}
          </div>

          <button type="submit" className="submit-button">
            Create Poll
          </button>
        </form>
      )}
    </div>
  );
}

export default CreatePoll;
