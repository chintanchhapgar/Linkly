import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/link.routes';
import analyticsRoutes from './routes/analytics.routes';
import redirectRoutes from './routes/redirect.routes';
import userRoutes from './routes/user.routes';
import subscriptionRoutes from './routes/subscription.routes';
import webhookRoutes from './routes/webhook.routes';
import apiKeyRoutes from './routes/apiKey.routes';
import publicRoutes from './routes/public.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// ✅ Updated CORS with all methods
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

app.use(morgan('dev'));

// Webhook BEFORE express.json()
app.use('/api/webhook', webhookRoutes);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Linkly API is running! 🚀' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/public', publicRoutes);

// Redirect route (MUST be last)
app.use('/', redirectRoutes);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});