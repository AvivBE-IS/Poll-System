import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import Poll from './components/Poll';
import Results from './components/Results';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<Poll />} />
          <Route path="/poll/:id/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
