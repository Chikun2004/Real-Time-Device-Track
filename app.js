const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Handle receiving location data from a client
    socket.on('send-location', (data) => {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    // Handle when a user disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        io.emit('user-disconnected', socket.id);
    });
});

// Handle the root route to render the main page
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
