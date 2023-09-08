const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // Import mysql2

const app = express();

app.use(express.json());

// Database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};
// Create a MySQL pool for handling connections
const pool = mysql.createPool(dbConfig);
// Logic goes here
// Register
app.post("/register", async (req, res) => {
    // Our register logic starts here
    try {
        // Get user input
        const { username, password } = req.body;

        // Validate user input
        if (!(username && password)) {
            res.status(400).send("All input is required");
            return;
        }

        // Check if user already exists
        const [rows] = await pool.query("SELECT * FROM utente WHERE username = ?", [
            username,
        ]);

        if (rows.length > 0) {
            return res.status(409).send("User Already Exists. Please Login");
        }

        // Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create token

        // Create user in the database
        await pool.query("INSERT INTO utente (username, password) VALUES (?, ?)", [
            username.toLowerCase(),
            encryptedPassword,
        ]);

        const token = jwt.sign(
            { username },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        // Return new user
        res.status(201).json({ username, token });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
    // Our register logic ends here
});

// Login
app.post("/login", async (req, res) => {
    // Our login logic goes here
    try {
        const { username, password } = req.body;

        // Fetch user from the database
        const [rows] = await pool.query("SELECT * FROM utente WHERE username = ?", [
            username,
        ]);

        if (rows.length === 0) {
            return res.status(401).send("Invalid credentials");
        }

        const user = rows[0];

        // Check if the provided password matches the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send("Invalid credentials");
        }

        // Create token
        const token = jwt.sign(
            { username },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        res.status(200).json({ username, token, message: "Login effettuato" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

const auth = require("./middleware/auth");
app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

module.exports = app;