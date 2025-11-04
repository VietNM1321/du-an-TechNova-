import cors from 'cors';

const corsMiddleware = cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

export default corsMiddleware;