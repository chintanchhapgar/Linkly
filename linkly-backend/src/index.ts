import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

console.log('1️⃣ Loading imports...');

import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/link.routes';
import analyticsRoutes from './routes/analytics.routes';
import redirectRoutes from './routes/redirect.routes';
import userRoutes from './routes/user.routes';
import subscriptionRoutes from './routes/subscription.routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler } from './middleware/error.middleware';

console.log('2️⃣ All imports loaded ✅');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));

// Webhook BEFORE express.json()
app.use('/api/webhook', webhookRoutes);

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Linkly API is running!' });
});

console.log('3️⃣ Registering API routes...');

// API Routes
app.use('/api/auth', authRoutes);
console.log('   ✅ /api/auth registered');

app.use('/api/links', linkRoutes);
console.log('   ✅ /api/links registered');

app.use('/api/analytics', analyticsRoutes);
console.log('   ✅ /api/analytics registered');

app.use('/api/user', userRoutes);
console.log('   ✅ /api/user registered');

app.use('/api/subscription', subscriptionRoutes);
console.log('   ✅ /api/subscription registered');

console.log('4️⃣ All API routes registered ✅');

// Redirect route (MUST be last)
app.use('/', redirectRoutes);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/subscription/plans\n`);
});