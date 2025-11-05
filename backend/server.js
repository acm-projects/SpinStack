// server.js
// run "node server.js" to start server before testing with postman (must run every time you change the code)
// for each route, must add new import/require that points to file path 
// AND must mount routes to paths/urls
const AWS = require('aws-sdk');
const express = require('express');
const momentsRoutes = require('./routes/moments');
const usersRoutes = require('./routes/users');
const stacksRoutes = require('./routes/stacks');
const friendsRoutes = require('./routes/friends');
const shelvesRoutes = require('./routes/shelves');
const groupsRoutes = require('./routes/groups');
const groupMemRoutes = require('./routes/group_members');
const dailiesRoutes = require('./routes/dailies');
const likesStacksRoutes = require('./routes/likes_stacks');
const likesMomentsRoutes = require('./routes/likes_moments');
const uploadRoutes = require('./routes/upload');
const dotenv = require('dotenv');
const spotifyRoutes = require('./routes/spotify');
const storyRoutes = require('./routes/story_moments');
const likesStoriesRoutes = require('./routes/likes_stories');
const dailySubmissionsRoutes = require('./routes/daily_submissions');

dotenv.config();



const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount your routes (one for each ex: moments, users, stacks etc.)
app.use('/api/moments', momentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stacks', stacksRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/shelves', shelvesRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/group_members', groupMemRoutes);
app.use('/api/dailies', dailiesRoutes);
app.use('/api/likes_stacks', likesStacksRoutes);
app.use('/api/likes_moments', likesMomentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/story_moments', storyRoutes);
app.use('/api/likes_stories', likesStoriesRoutes);
app.use('/api/daily_submissions', dailySubmissionsRoutes);

// Start the server
const PORT = 3000; // or process.env.PORT if deployed
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});