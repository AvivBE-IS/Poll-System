import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h2>Welcome to Poll System</h2>
      <p>Create polls and share them with others to gather opinions!</p>
      <button 
        className="create-poll-button"
        onClick={() => navigate('/create')}
      >
        Create New Poll
      </button>
    </div>
  );
}

export default Home;
