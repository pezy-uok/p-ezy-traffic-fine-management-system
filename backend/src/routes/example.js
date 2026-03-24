import express from 'express';

const router = express.Router();

// Example GET endpoint
router.get('/example', (req, res) => {
  res.json({
    message: 'This is an example endpoint',
    timestamp: new Date().toISOString(),
  });
});

// Example POST endpoint
router.post('/example', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
