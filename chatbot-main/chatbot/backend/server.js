const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log(`- POST http://localhost:${PORT}/api/auth/register`);
  console.log(`- POST http://localhost:${PORT}/api/auth/login`);
  console.log(`- GET  http://localhost:${PORT}/api/groups`);
  console.log(`- POST http://localhost:${PORT}/api/groups`);
  console.log(`- GET  http://localhost:${PORT}/api/ai/history`);
  console.log(`- POST http://localhost:${PORT}/api/ai/message`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Consider graceful shutdown here
});
