import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock endpoints for testing (no Firebase required)

/**
 * GET /api/feed/health
 * Health check endpoint
 */
app.get('/api/feed/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      server: 'running',
      firebase: 'not configured (demo mode)'
    }
  });
});

/**
 * Mock connections endpoints for testing
 */

// GET /api/users/:userId/connections
app.get('/api/users/:userId/connections', (req: any, res: any) => {
  const { userId } = req.params;
  res.json({
    followers: Math.floor(Math.random() * 1000),
    following: Math.floor(Math.random() * 500),
    connections: Math.floor(Math.random() * 1500),
    note: 'Mock data - Firebase not configured'
  });
});

// POST /api/users/:userId/follow
app.post('/api/users/:userId/follow', (req: any, res: any) => {
  const { userId } = req.params;
  const { targetUserId } = req.body;
  
  res.status(201).json({
    success: true,
    message: `User ${userId} now follows ${targetUserId} (mock)`,
    followId: 'mock-follow-id-' + Date.now()
  });
});

// DELETE /api/users/:userId/follow
app.delete('/api/users/:userId/follow', (req: any, res: any) => {
  const { userId } = req.params;
  const { targetUserId } = req.body;
  
  res.json({
    success: true,
    message: `User ${userId} unfollowed ${targetUserId} (mock)`
  });
});

// GET /api/users/:userId/follow-status/:targetUserId
app.get('/api/users/:userId/follow-status/:targetUserId', (req: any, res: any) => {
  res.json({
    isFollowing: Math.random() > 0.5,
    note: 'Mock data - Firebase not configured'
  });
});

// GET /api/users/:userId/followers
app.get('/api/users/:userId/followers', (req: any, res: any) => {
  const mockFollowers = Array.from({ length: 5 }, (_, i) => ({
    userId: `user-${i + 1}`,
    followedAt: new Date(Date.now() - i * 86400000).toISOString()
  }));
  
  res.json({
    followers: mockFollowers,
    hasMore: false,
    note: 'Mock data - Firebase not configured'
  });
});

// GET /api/users/:userId/following
app.get('/api/users/:userId/following', (req: any, res: any) => {
  const mockFollowing = Array.from({ length: 3 }, (_, i) => ({
    userId: `followed-user-${i + 1}`,
    followedAt: new Date(Date.now() - i * 86400000).toISOString()
  }));
  
  res.json({
    following: mockFollowing,
    hasMore: false,
    note: 'Mock data - Firebase not configured'
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Clique Backend Demo Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/feed/health`);
  console.log(`🔗 Connections API: http://localhost:${PORT}/api/users/test-user/connections`);
  console.log(`⚠️  Note: This is a demo server with mock data (Firebase not configured)`);
});

export default app;