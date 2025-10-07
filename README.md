# Poll System

A simple polling application similar to WhatsApp polls where users can create polls, share them, and vote on them. Built with React frontend and Express server with SQLite database.

## Features

- **Create Polls**: Create polls with 2-8 multiple choice options
- **Vote on Polls**: Users can select one option per poll (one vote per username)
- **View Results**: Display vote counts, percentages, and total votes
- **Share Polls**: Generate shareable poll links for easy access
- **Real-time Updates**: Vote counts update after each vote
- **Username-based Voting**: Simple username identification (no authentication required)

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Express.js, Node.js
- **Database**: SQLite3
- **Styling**: CSS3

## Project Structure

```
Poll-System/
├── backend/
│   ├── server.js          # Express server and API endpoints
│   ├── database.js        # Database setup and schema
│   ├── package.json       # Backend dependencies
│   └── polls.db          # SQLite database (generated)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js           # Home page component
│   │   │   ├── CreatePoll.js     # Poll creation component
│   │   │   └── ViewPoll.js       # Poll viewing/voting component
│   │   ├── App.js         # Main app component with routing
│   │   └── App.css        # Global styles
│   └── package.json       # Frontend dependencies
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Poll-System
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3001`

### Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the React development server:
   ```bash
   npm start
   ```

   The app will open in your browser at `http://localhost:3000`

## Usage

### Creating a Poll

1. Click "Create New Poll" on the home page
2. Enter your name
3. Enter a poll title/question
4. Add 2-8 options (use the "+ Add Option" button to add more)
5. Click "Create Poll"
6. Copy the shareable link or wait to be redirected to the poll

### Voting on a Poll

1. Open a poll link (either by creating one or receiving a shared link)
2. Enter your name when prompted
3. Click "Vote" on your preferred option
4. View the results with vote counts and percentages

### Sharing a Poll

- After creating a poll, copy the generated link
- Or click the "📋 Share Poll" button on any poll page
- Share the link with others via any medium

## API Endpoints

### POST /api/polls
Create a new poll
- Body: `{ title, options, creator }`
- Returns: `{ pollId, message, shareUrl }`

### GET /api/polls/:pollId
Get poll details
- Returns: Poll data with options and vote counts

### POST /api/polls/:pollId/vote
Submit a vote
- Body: `{ optionId, username }`
- Returns: `{ message }`

### GET /api/polls/:pollId/check-vote/:username
Check if user has voted
- Returns: `{ hasVoted, votedOptionId }`

## Database Schema

### polls
- `id` (TEXT, PRIMARY KEY): Unique poll identifier
- `title` (TEXT): Poll question
- `creator` (TEXT): Poll creator's name
- `created_at` (DATETIME): Creation timestamp

### options
- `id` (INTEGER, PRIMARY KEY): Unique option identifier
- `poll_id` (TEXT): Reference to poll
- `option_text` (TEXT): Option text

### votes
- `id` (INTEGER, PRIMARY KEY): Unique vote identifier
- `poll_id` (TEXT): Reference to poll
- `option_id` (INTEGER): Reference to option
- `username` (TEXT): Voter's name
- `voted_at` (DATETIME): Vote timestamp
- UNIQUE constraint on (poll_id, username)

## Features Detail

### Duplicate Vote Prevention
- Each username can only vote once per poll
- Enforced by database UNIQUE constraint
- UI displays "You have already voted" message

### Vote Statistics
- Real-time vote counts per option
- Percentage calculations
- Visual progress bars showing vote distribution
- Total vote count display

### Validation
- Poll title required
- 2-8 options enforced
- Username required for voting
- Empty options filtered out

## Development

To contribute or modify:

1. Backend changes: Edit files in `backend/` directory
2. Frontend changes: Edit React components in `frontend/src/`
3. Test changes by running both servers
4. Database schema changes: Modify `backend/database.js`

## License

ISC
