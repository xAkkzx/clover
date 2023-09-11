const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // Import mysql2
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

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

function extractQuery(text) {
  const queryRegex = /SELECT[\s\S]*;/i;

  const match = text.match(queryRegex);

  if (match) {
    const query = match[0].trim();

    return query;
  }

  return null; // Restituisce null se non viene trovata alcuna corrispondenza
}
async function dentroZipitiCsv(data, csvFilePath) {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(data[0]);

    const csvHeader = keys.join(",");

    const csvRows = data.map((obj) => keys.map((key) => obj[key]).join(","));

    const csvString = `${csvHeader}\n${csvRows.join("\n")}`;

    fs.appendFile(csvFilePath, csvString + "\n\n", (err) => {
      if (err) {
        console.error("Error writing to CSV file:", err.message);

        reject(err);
      } else {
        console.log("CSV data successfully written to file:", csvFilePath);

        convertCSVtoTSV(csvString)
          .then((tsvString) => {
            console.log(tsvString);

            resolve();
          })

          .catch((error) => {
            console.error("Error converting CSV to TSV:", error.message);

            reject(error);
          });
      }
    });
  });
}

async function query(completion_text, nomeDb) {
  return new Promise((resolve, reject) => {
    connection_data.query("USE " + nomeDb, function (err, result) {
      if (err) {
        console.error("Error using the database: " + err.message);

        connection_data.end();

        reject(err);

        return;
      }

      const queries = completion_text.split(";").map((query) => query.trim());

      const validQueries = queries.filter((query) => query !== "");

      const queryPromises = validQueries.map((queryString) => {
        return new Promise((resolve, reject) => {
          connection_data.query(queryString, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });

      Promise.all(queryPromises)

        .then(async (results) => {
          for (const result of results) {
            await dentroZipitiCsv(result, "./dati.csv");
            // await dentroZipitiTsv(result);
          }

          resolve(results);
        })

        .catch((err) => {
          console.error("Error executing queries:", err.message);

          reject(err);
        });
    });
  });
}
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

    const token = jwt.sign({ username }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

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
    const token = jwt.sign({ username }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

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

app.post("/chat", auth, async (req, res) => {
  try {
    const { nomeDb, richiesta } = req.body;
    const db = fs.readFileSync(`dbz/${nomeDb}Tables.txt`, "utf-8");
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const regola = process.env.REGOLAMYSQL;
    var history = [
      [db, ""],

      [regola, ""],
    ];
    const messages = [];
    for (const [input_text, completion_text] of history) {
      messages.push({ role: "user", content: input_text });

      messages.push({ role: "assistant", content: completion_text });
    }
    messages.push({ role: "user", content: richiesta });
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",

        messages: messages,
      });

      completion_text = completion.data.choices[0].message.content;

      let onlyquery = await extractQuery(completion_text);
      console.log(onlyquery + "\n");
      let c = await query(onlyquery, nomeDb);
      res.status(200).send(c);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
