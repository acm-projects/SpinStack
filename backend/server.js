// server.js
const express = require('express');
const momentsRoutes = require('./routes/moments'); // CommonJS import

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount your routes
app.use('/api/moments', momentsRoutes);

// Start the server
const PORT = 5000; // or process.env.PORT if deployed
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
