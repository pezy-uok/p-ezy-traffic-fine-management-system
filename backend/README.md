# System Development Backend

A Node.js Express backend server for the System Development Project.

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Supabase account for database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

3. Configure environment variables in `.env` as needed.

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

### API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Project Structure

```
backend/
├── src/
│   ├── index.js           # Main server file
│   ├── routes/            # API route handlers
│   └── middleware/        # Custom middleware
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Development

To add new routes:
1. Create files in `src/routes/`
2. Import and use them in `src/index.js`

Example route file:
```javascript
import express from 'express';
const router = express.Router();

router.get('/example', (req, res) => {
  res.json({ message: 'Example endpoint' });
});

export default router;
```

Then add to `src/index.js`:
```javascript
import exampleRoutes from './routes/example.js';
app.use('/api', exampleRoutes);
```

## License

ISC
