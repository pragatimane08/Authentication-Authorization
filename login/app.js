const express = require('express');
const authRoutes = require('./routes/authrought');
const app = express();

app.use(express.json()); // Ensure this line is present

app.use('/auth', authRoutes);

module.exports = app;
