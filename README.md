# Poll System

A simple web application similar to WhatsApp polls where users can create, share, and vote on polls. Built with React for the frontend, Express for the backend, and SQLite for the database.

## Features

- ✅ Create polls with a title/question and 2–8 options
- ✅ Identify creator by username (no authentication required)
- ✅ Vote once per poll per username
- ✅ View results with vote counts, percentages, and totals
- ✅ Generate shareable links for direct access to polls
- ✅ Real-time results with auto-refresh
- ✅ Beautiful, responsive UI with WhatsApp-like design

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Styling**: CSS3 with modern gradients and animations

## Project Structure

```
Poll-System/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── polls.db           # SQLite database (auto-generated)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreatePoll.js    # Poll creation page
│   │   │   ├── CreatePoll.css
│   │   │   ├── Poll.js          # Voting page
│   │   │   ├── Poll.css
│   │   │   ├── Results.js       # Results display page
│   │   │   └── Results.css
│   │   ├── App.js              # Main app with routing
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The app will open in your browser at `http://localhost:3000`

## Usage

### Creating a Poll

1. Open the application at `http://localhost:3000`
2. Enter your username
3. Enter your poll question
4. Add 2-8 options (use + button to add more, ✕ to remove)
5. Click "Create Poll"
6. You'll be redirected to the poll page with a shareable link

### Voting on a Poll

1. Visit a poll using its unique URL: `http://localhost:3000/poll/{pollId}`
2. Enter your username
3. Select an option
4. Click "Submit Vote"
5. You'll be redirected to the results page

### Viewing Results

1. From the poll page, click "View Results"
2. Or visit directly: `http://localhost:3000/poll/{pollId}/results`
3. Results auto-refresh every 5 seconds
4. Your vote is highlighted in green

### Sharing Polls

- Click the "📋 Copy Share Link" button on any poll or results page
- Share the copied link with others
- Anyone with the link can vote and see results

## API Endpoints

### POST `/api/polls`
Create a new poll
- **Body**: `{ title, options, creator }`
- **Response**: `{ pollId, message, shareLink }`

### GET `/api/polls/:id`
Get poll details
- **Response**: `{ id, title, creator, createdAt, options }`

### POST `/api/polls/:id/vote`
Vote on a poll
- **Body**: `{ optionId, username }`
- **Response**: `{ message }`

### GET `/api/polls/:id/results`
Get poll results with vote counts and percentages
- **Query**: `?username=<username>` (optional, to identify user's vote)
- **Response**: `{ id, title, creator, createdAt, results, totalVotes, userVote }`

## Database Schema

### polls
- `id` (TEXT, PRIMARY KEY) - Unique poll identifier
- `title` (TEXT) - Poll question
- `creator` (TEXT) - Username of poll creator
- `created_at` (DATETIME) - Creation timestamp

### poll_options
- `id` (INTEGER, PRIMARY KEY) - Option identifier
- `poll_id` (TEXT, FOREIGN KEY) - Reference to poll
- `option_text` (TEXT) - Option text

### votes
- `id` (INTEGER, PRIMARY KEY) - Vote identifier
- `poll_id` (TEXT, FOREIGN KEY) - Reference to poll
- `option_id` (INTEGER, FOREIGN KEY) - Reference to option
- `username` (TEXT) - Voter username
- `voted_at` (DATETIME) - Vote timestamp
- UNIQUE constraint on (poll_id, username)

## Features in Detail

### One Vote Per User
- Each username can only vote once per poll
- Attempts to vote again will be rejected
- Username is stored in localStorage for convenience

### Real-time Results
- Results page auto-refreshes every 5 seconds
- Shows live vote counts and percentages
- Highlights the current user's vote

### Shareable Links
- Each poll gets a unique UUID
- Direct link access to any poll
- Easy sharing via copy-paste

### Responsive Design
- Works on desktop and mobile devices
- Modern gradient backgrounds
- Smooth animations and transitions
- WhatsApp-inspired color scheme

## Development

### Backend Development
```bash
cd backend
npm start  # Runs on port 5000
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on port 3000
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The build folder will contain optimized production files.

## License

ISC

## Author

Poll System - A simple and elegant polling application
