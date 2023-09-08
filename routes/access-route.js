const express = require('express')
const routera = express.Router()
const jwt = require("jsonwebtoken")
require("dotenv").config();
const exampleroute = require('./example-route')

routera.use('/api', exampleroute)

const users = [
    { id: 1, username: 'admin', password: 'scimmia123' },
    { id: 2, username: 'gio', password: 'lemonsunday32' },
]

// Secret key for signing JWT tokens (should be kept secret)
const secretKey = process.env.SECRETKEYZ

// Authentication endpoint for username and password
routera.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user by username and password (replace with your own authentication logic)
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
        // If user is not found or authentication fails, return a 401 Unauthorized status
        return res.status(401).json({ message: 'Authentication failed' });
    }

    // If authentication is successful, generate a JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { 
        // expiresIn: '1h', // Token expiration time
    });

    // Return the token in the response
    res.json({ token });
    // res.redirect('/authentication')
})

routera.get('/authentication', (req, res) => {
    // Get the token from the request header
    const token = req.headers.authorization;
    // console.log(token)
    // Check if the token is provided and starts with "Bearer "
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    // Extract the token without the "Bearer " prefix
    const tokenValue = token.split(' ')[1];

    // Secret key used to sign the token
    const secretKey = process.env.SECRETKEYZ // Replace with your secret key

    // Verify the token
    jwt.verify(tokenValue, secretKey, (err, decoded) => {
        if (err) {
            // Token verification failed, return a 401 Unauthorized response
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Token is valid, 'decoded' contains the decoded payload
        console.log('JWT verification successful:', decoded);

        // You can access the decoded payload here (e.g., decoded.userId, decoded.username)
        // Respond with a success message or protected data
        // res.json({ message: 'Access granted to protected route' });
        
    });             
    res.redirect('/security/api/napoli')
});

routera.get('/dentro', (req, res, next) => {
    res.redirect('/security/api/napoli')
})

module.exports = routera