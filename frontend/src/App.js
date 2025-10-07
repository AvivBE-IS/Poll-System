import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CreatePoll from './pages/CreatePoll';
import ViewPoll from './pages/ViewPoll';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Poll System</h1>
          <nav>
            <Link to="/">Home</Link>
          </nav>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:pollId" element={<ViewPoll />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
