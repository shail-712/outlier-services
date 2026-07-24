require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRouter = require('./routes/auth');
const countriesRouter = require('./routes/countries');
const regionsRouter = require('./routes/regions');
const currenciesRouter = require('./routes/currencies');
const vacsRouter = require('./routes/vacs');
const servicesRouter = require('./routes/services');
const paymentModesRouter = require('./routes/paymentModes');
const transactionsRouter = require('./routes/transactions');

const app = express();

// --- Middleware ---
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Outlier Services API' });
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/countries', countriesRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/currencies', currenciesRouter);
app.use('/api/vacs', vacsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/payment-modes', paymentModesRouter);
app.use('/api/transactions', transactionsRouter);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Outlier Services API running on http://localhost:${PORT}`);
  });
});
