const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // Import mysql2
const fs = require("fs");
const Papa = require("papaparse");
const OpenAI = require("openai");
const mssql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
var messages = [];
let numRichiesta = 0;
let dataBaseVecchio = "";

var uploadDir;
var userId;
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${originalName}${fileExtension}`;

    // Check if the file already exists.
    if (fs.existsSync(path.join(uploadDir, uniqueFilename))) {
      return cb(new Error("File with this name already exists."));
    }
    cb(null, uniqueFilename);
  },
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith("tables.txt")) {
      cb(null, true); // Accept the file
    } else {
      // Return an error if the file name doesn't match the required format
      cb(new Error("File name must end with 'Tables.txt'"));
    }
  },
});

async function createFolderForUser() {
  try {
    // Database configuration
    const dbConfig = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    };

    // Create a MySQL pool for handling connections
    const pool = mysql.createPool(dbConfig);

    // Query the database to get the userId for the given username
    const [rows] = await pool.execute("SELECT id__utente FROM utente;");

    if (rows.length === 0) {
      // User not found, handle the error or return an appropriate response
      console.error("User not found");
      return false;
    }

    for (const row of rows) {
      const userId = row.id__utente;
      const userFolderPath = `./dbz/${userId}`;

      // Check if the user's folder exists; create it if it doesn't
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
        console.log(`Folder created for user with ID ${userId}`);
      }
    }

    return true; // Folders creation successful
  } catch (error) {
    console.error("Error creating folder:", error);
    return false; // Folder creation failed
  }
}
createFolderForUser();

const app = express();

app.use(cors());

app.use(express.json());


function uppy(){
  uploadDir = `./dbz/${userId}`;
  storage = multer.diskStorage({
    destination: (req, file, cb) => {

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const originalName = path.parse(file.originalname).name;
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${originalName}${fileExtension}`;

      // Check if the file already exists.
      if (fs.existsSync(path.join(uploadDir, uniqueFilename))) {
        return cb(new Error("File with this name already exists."));
      }
      cb(null, uniqueFilename);
    },
  });
  upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.originalname.toLowerCase().endsWith("tables.txt")) {
        cb(null, true); // Accept the file
      } else {
        // Return an error if the file name doesn't match the required format
        cb(new Error("File name must end with 'Tables.txt'"));
      }
    },
  });
}


function extractQuery(text) {
  const queryRegex = /SELECT[\s\S]*;/i;

  const match = text.match(queryRegex);

  if (match) {
    const query = match[0].trim();
    return query;
  }
  return null; // Restituisce null se non viene trovata alcuna corrispondenza
}
async function convertCSVtoTSV(csvText) {
  try {
    // Parse the CSV text

    const parsed = Papa.parse(csvText);

    // Get the data rows from the parsed CSV

    const rows = parsed.data;

    // Convert the rows to TSV format with fixed column width

    const tsvText = rows

      .map((row) => {
        const firstThreeColumns = row.slice(0, 3); // Get the first three columns

        return firstThreeColumns.map((cell) => cell.padEnd(45)).join("\t");
      })

      .join("\n");

    // console.log("Displaying only the first 3 columns\n");

    return tsvText;
  } catch (error) {
    throw new Error("Error converting CSV to TSV: " + error.message);
  }
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
        // console.log("CSV data successfully written to file:", csvFilePath);

        convertCSVtoTSV(csvString)
          .then((tsvString) => {
            // console.log(tsvString);
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
  // Database configuration
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: nomeDb,
  };
  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);
  return new Promise(async (resolve, reject) => {
    try {
      const connection = await pool.getConnection();
      // await connection.query("USE " + nomeDb);

      const queries = completion_text.split(";").map((query) => query.trim());
      const validQueries = queries.filter((query) => query !== "");

      const queryPromises = validQueries.map(async (queryString) => {
        try {
          const [result] = await connection.execute(queryString);
          return result;
        } catch (err) {
          throw err;
        }
      });

      Promise.all(queryPromises)
        .then(async (results) => {
          for (const result of results) {
            await dentroZipitiCsv(result, "./dati.csv");
          }
          resolve(results);
        })
        .catch((err) => {
          console.error("Error executing queries:", err.message);
          reject(err);
        })
        .finally(() => {
          connection.release(); // Release the connection back to the pool
        });
    } catch (err) {
      console.error("Error using the database:", err.message);
      reject(err);
    }
  });
}

async function queryMSSQL(completion_text, dbName) {
  const mssql_config = {
    server: process.env.MSSQLBOOKAPPSRV,

    user: process.env.MSSQLBOOKAPPUSR,

    password: process.env.MSSQLBOOKAPPPSWD,

    database: dbName,

    options: {
      trustServerCertificate: true,

      crypto: {
        rejectUnauthorized: false,
      },
    },
  };

  try {
    const pool = await mssql.connect(mssql_config);

    const request = pool.request();

    const queries = completion_text.split(";").map((query) => query.trim());

    const validQueries = queries.filter((query) => query !== "");

    const queryPromises = validQueries.map((queryString) => {
      return request

        .query(queryString)

        .then((result) => result)

        .catch((err) => {
          console.warn("Warning executing query:", err.message);

          return null;
        });
    });

    const results = await Promise.all(queryPromises);

    for (const result of results) {
      if (result !== null) {
        console.log("!!!" + result);

        await dentroZipitiCsv(result.recordset, "./dati.csv");
      }
    }

    mssql.close();

    return results.filter((result) => result !== null);
  } catch (err) {
    console.error("Error connecting to the MSSQL database:", err.message);

    throw err;
  }
}

// Logic goes here
// Register
app.post("/register", async (req, res) => {
  // Database configuration
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);
  // Our register logic starts here
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(username || password)) {
      return res.status(400).send("All input is required");
    } else {
      if (!username) {
        return res.status(400).send("Username required");
      } else {
        if (!password) {
          return res.status(400).send("Password required");
        }
      }
    }
    // let a = await pool.query("USE autenticazione");
    // Check if user already exists
    // await pool.query("USE autenticazione");

    // Seconda query: SELECT * FROM utente WHERE username = 'm'
    const [rows] = await pool.execute(
      "SELECT * FROM utente WHERE username = ?",
      [username]
    );

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

    const [rowz] = await pool.execute(
      "SELECT id__utente FROM utente WHERE username = ?",
      [username]
    );
    if (rowz.length > 0) {
      userId = rowz[0].id__utente;
      console.log(userId);
      uppy();
      createFolderForUser();
    } else {
      console.log("unlucky non esiste");
    }

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
  // Database configuration
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);
  // Our login logic goes here

  // console.log(req.body);
  try {
    const { username, password } = req.body;

    if (username === "" && password === "") {
      return res.status(401).send("Missing credentials");
    } else {
      if (username === "") {
        return res.status(401).send("Missing username");
      } else {
        if (password === "") {
          return res.status(401).send("Missing password");
        }
      }
    }

    // await pool.query("USE autenticazione");
    // Seconda query: SELECT * FROM utente WHERE username = 'm'
    const [rows] = await pool.execute(
      "SELECT * FROM utente WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).send("User not found, please Sign In");
    }

    const user = rows[0];

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Invalid Password");
    }

    // Create token
    const token = jwt.sign({ username }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    const [rowz] = await pool.execute(
      "SELECT id__utente FROM utente WHERE username = ?",
      [username]
    );
    if (rowz.length > 0) {
      userId = rowz[0].id__utente;
      console.log(userId);
      uppy();
    } else {
      console.log("unlucky non esiste");
    }

    res.status(200).json({ username, token, message: "Login effettuato" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

const auth = require("./middleware/auth");
app.get("/welcome", (req, res) => {
  try {
    console.log("aia");
    // Create a JSON payload and send it as the response
    const jsonResponse = {
      message: "Welcome",
    };
    res.status(200).json(jsonResponse);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/chat", auth, async (req, res) => {
  try {
    const { nomeDb, tipoDb, richiesta } = req.body;
    const db = fs.readFileSync(`dbz/${userId}/${nomeDb}Tables.txt`, "utf-8");
    console.log(`dbz/${nomeDb}Tables.txt`);
    var c;
    const regola = process.env.REGOLAMYSQL;
    // const tipoDatabase = parseInt(tipoDb, 10)

    if(numRichiesta == 0)
    {
      dataBaseVecchio = nomeDb;
      messages = [];
      var history = [
        [db, ""],
        [regola, ""],
      ];
      for (const [input_text, completion_text] of history) {
        messages.push({ role: "user", content: input_text });

        messages.push({ role: "assistant", content: completion_text });
      }
      numRichiesta++;
    }
    else if (dataBaseVecchio != nomeDb) {
      numRichiesta = 1;
      messages = [];
      var history = [
        [db, ""],
        [regola, ""],
      ];
      for (const [input_text, completion_text] of history) {
        messages.push({ role: "user", content: input_text });

        messages.push({ role: "assistant", content: completion_text });
      }
      dataBaseVecchio = nomeDb;
    } else if (dataBaseVecchio == nomeDb) {
      numRichiesta++;
    }

    messages.push({ role: "user", content: richiesta });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: messages,
      });

      completion_text = completion.choices[0].message.content;
      messages.push({ role: "assistant", content: completion_text });
      //   console.log(completion_text)
      // console.log("uooo");

      let onlyquery = await extractQuery(completion_text);
      console.log(onlyquery + "\n");
      if (tipoDb == "0") {
        c = await queryMSSQL(onlyquery, nomeDb);
      } else if (tipoDb == "1") {
        c = await query(onlyquery, nomeDb);
      } else {
        res
          .status(405)
          .send("Non è stato possibile eseguire la tua richiesta.");
      }
      res.status(200).send(c);
    } catch (err) {
      console.error(err);
      res.status(405).send("Non è stato possibile eseguire la tua richiesta.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/protected", auth, (req, res) => {
  try{
    res.json({ message: "Access granted!" });
  } catch(err)
  {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
})


app.post("/save", async (req, res) => {
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  
  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);

  try {
    const { userId, role, message, timestamp } = req.body;

    // Verifica che tutti i parametri siano definiti
    if (userId !== undefined && role !== undefined && message !== undefined && timestamp !== undefined) {
      // Esegui un'operazione di inserimento nella tabella "chat_history"
      await pool.execute(
        "INSERT INTO chat (id_utente, messaggio, mittente, data_ora) VALUES (?, ?, ?, ?)",
        [userId, message, role,timestamp]
      );

      res.status(200).send("Messaggio salvato con successo nella cronologia della chat.");
    } else {
      // Se almeno uno dei parametri è undefined, restituisci un errore 400 Bad Request
      res.status(406).send("I parametri della richiesta contengono valori undefined.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


app.post("/loadMessages", async (req, res) => {

  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  
  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);

  try {
    const { userId } = req.body;

    // Esegui un'operazione di query per recuperare i messaggi dell'utente
    const [messages] = await pool.execute(
      "SELECT * FROM chat WHERE id_utente = ?",
      [userId]
    );

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore durante il recupero dei messaggi.");
  }
});

app.post("/uid", async (req, res) => {
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  
  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);

  try {
    const { username } = req.body;

    // Verifica che l'username sia presente nella richiesta
    if (!username) {
      return res.status(402).send("Username non presente in richiesta");
    }

    // Esegui una query per ottenere l'ID dell'utente in base all'username
    const [rows] = await pool.execute(
      "SELECT id__utente FROM utente WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      const userId = rows[0].id__utente;
      console.log(userId)
      return res.status(200).json({userId});
    } else {
      return res.status(404).send("Utente non trovato" );
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Errore durante la ricerca dell'utente");
  }
});


app.post("/clear", async (req, res) => {
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };

  // Create a MySQL pool for handling connections
  const pool = mysql.createPool(dbConfig);

  try {
    const { userId } = req.body;

    // Verifica che l'userId sia presente nella richiesta
    if (!userId) {
      return res.status(400).send("L'ID utente (userId) deve essere fornito nella richiesta.");
    }

    // Esegui un'operazione di cancellazione dei messaggi dell'utente in base all'userId
    await pool.execute("DELETE FROM chat WHERE id_utente = ?", [userId]);

    return res.status(200).send("Tutti i messaggi dell'utente sono stati cancellati con successo.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Errore durante la cancellazione dei messaggi dell'utente.");
  }
});











app.post("/upload", auth, (req, res, next) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload error: " + err.message });
    } else if (!req.file) {
      return res.status(405).json({ error: "No file uploaded." });
    }

    let message = "File input success";
    res.status(200).json({ message });
  });
});

app.post("/delete", auth, (req, res) =>{
  const { nomeDb } = req.body;
  // Construct the file path
  const filePath = path.join(
    __dirname,
    "dbz",
    `${userId}`,
    `${nomeDb}Tables.txt`
  );
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // If the file exists, delete it
    fs.unlinkSync(filePath);
    res.status(200).json({ message: "File deleted successfully" });
  } else {
    // If the file does not exist, return an error response
    res.status(404).json({ error: "File not found" });
  }
});


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send("File upload error: " + err.message);
  }
  return next(err);
});



app.get("/dbz", auth, (req, res) =>{
  const folderPath = `./dbz/${userId}`;
  // Initialize an empty array to store the file names without extensions
  const fileNames = [];
  // Use fs.readdirSync() to get a list of file names in the specified folder
  try {
    const files = fs.readdirSync(folderPath);
    // Iterate through the list of files and add their names without extensions to the array
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      // Check if the path is a file (not a directory)
      if (fs.statSync(filePath).isFile()) {
        const fileNameWithoutExtension = path.parse(file).name;
        const resultString = fileNameWithoutExtension.replace(/Tables$/, "");
        fileNames.push(resultString.toLowerCase()); // Convert to lowercase
      }
    }
    console.log("File names (without extensions) in the folder:", fileNames);
    res.status(200).json({ fileNames });

  } catch (error) {
    console.error("Error reading the folder:", error);
  }
});

module.exports = app;
