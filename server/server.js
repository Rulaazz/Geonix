const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));

app.get('/', (req, res) => {
  console.log('HOME ROUTE WAS CALLED');
  res.status(200).send('Geonix backend is running!');
});

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});