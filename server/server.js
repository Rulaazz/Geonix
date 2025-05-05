const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
console.log(process.env);  // Log all the environment variables to check if MONGO_URI is present
console.log('Process environment:', process.env); // This will log all the environment variables loaded
console.log('MONGO_URI:', process.env.MONGO_URI); // Specifically log MONGO_UR
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/auth', require('./routes/auth'));

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
const fs = require('fs');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('.env file is missing!');
} else {
  console.log('.env file found.');
}