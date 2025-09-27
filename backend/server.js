// server.js
// run "node server.js" to start server before testing with postman (must run every time you change the code)
// for each route, must add new import/require that points to file path 
// AND must mount routes to paths/urls
const express = require('express');
const momentsRoutes = require('./routes/moments'); // CommonJS import
const usersRoutes = require('./routes/users');
const stacksRoutes = require('./routes/stacks');
const friendsRoutes = require('./routes/friends');
const shelvesRoutes = require('./routes/shelves');



const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount your routes (one for each ex: moments, users, stacks etc.)
app.use('/api/moments', momentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stacks', stacksRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/shelves', shelvesRoutes);
console.log('helo');

// Start the server
const PORT = 5000; // or process.env.PORT if deployed
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});