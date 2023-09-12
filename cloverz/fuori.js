const mysql_package = require("mysql");

const sql = require("mssql");

const fs = require("fs");

const path = require("path");

var databaseStructure = [];

const connectionData = mysql_package.createConnection({
  host: "localhost",

  user: "root",

  password: "Grandesql.77",
});

const args = process.argv.slice(2);

const serverType = getServerTypeFromArgs(args);

const selectedDatabase = getSelectedDatabaseFromArgs(args);

const selectedTables = getSelectedTablesFromArgs(args);

const verboseMode = args.includes("-v");

const config = {
  server: "192.168.3.94",

  user: "sa",

  password: "Softeam123",

  database: selectedDatabase, // Il nome del database sarà impostato in base alla scelta dell'utente

  options: {
    trustServerCertificate: true,

    encrypt: false,
  },
};

if (!serverType) {
  console.error("No server type specified.");
} else if (!selectedDatabase) {
  console.error("No database specified.");
} else {
  try {
    if (serverType === "mysql") {
      extractTablesMySQL(selectedDatabase, selectedTables);
    } else if (serverType === "mssql") {
      estraimsql(selectedDatabase)
        .then(() => {
          console.log("Table extraction completed for MSSQL.");
        })

        .catch((err) => {
          console.error(err);
        });
    } else {
      console.error("Invalid server type specified.");
    }
  } catch (err) {
    console.error(err);
  }
}

function extractTablesMySQL(db, tables) {
  const folderName = "dbz";

  const nome = "Tables_in_" + db;

  const texts = [];

  connectionData.connect(function (err) {
    if (err) {
      console.error("Error connecting to the MySQL database: " + err.message);

      return;
    }

    connectionData.query("SHOW DATABASES", function (err, result) {
      if (err) {
        console.error("Error retrieving databases: " + err.message);

        connectionData.end();

        return;
      }

      const availableDatabases = result.map((row) => row.Database);

      if (!availableDatabases.includes(db)) {
        console.error("The specified database does not exist.");

        connectionData.end();

        return;
      }

      connectionData.query("USE " + db, function (err, result) {
        if (err) {
          console.error("Error selecting the database: " + err.message);

          connectionData.end();

          return;
        }

        connectionData.query("SHOW TABLES", function (err, result) {
          if (err) {
            console.error("Error retrieving tables: " + err.message);

            connectionData.end();

            return;
          }

          const availableTables = result.map((row) => row[nome]);

          const selectedTableNames =
            tables.length > 0
              ? tables.filter((table) => availableTables.includes(table))
              : availableTables;

          if (selectedTableNames.length === 0) {
            console.error(
              "No valid tables specified or available in the database."
            );

            connectionData.end();

            return;
          }

          let counter = 0;

          selectedTableNames.forEach((table) => {
            connectionData.query(
              "SHOW CREATE TABLE " + table,

              function (err, result) {
                if (err) {
                  console.error(
                    "Error retrieving table " + table + ": " + err.message
                  );

                  counter++;

                  if (counter === selectedTableNames.length) {
                    connectionData.end();
                  }

                  return;
                }

                let text = pulisci(result[0]["Create Table"]);

                texts.push(text);

                const filePath = path.join(
                  __dirname,

                  folderName,

                  db + "Tables.txt"
                );

                fs.writeFile(
                  filePath,

                  texts.join("\n\n") + "\n",

                  function (err) {
                    if (err) {
                      console.error("Error writing to file: " + err.message);
                    }

                    counter++;

                    if (counter === selectedTableNames.length) {
                      connectionData.end();
                    }
                  }
                );
              }
            );
          });
        });
      });
    });
  });
}

async function estraimsql(db) {
  const folderName = "dbz";

  const nome = "Tables_in_" + db;

  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`USE ${db}`);

    const tables = await pool

      .request()

      .query("SELECT * FROM INFORMATION_SCHEMA.TABLES");

    for (let i = 0; i < tables.recordset.length; i++) {
      const tableName = tables.recordset[i].TABLE_NAME;

      const createTableResult = await pool

        .request()

        .query(`EXEC sp_help '${tableName}'`);

      const createTableText = createTableResult.recordsets[0][0].Name;

      const columnsResult = await pool.request()
        .query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH

                FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);

      const columns = columnsResult.recordset;

      let text = `CREATE TABLE \`${tableName}\` (\n`;

      for (let j = 0; j < columns.length; j++) {
        const column = columns[j];

        text += `  \`${column.COLUMN_NAME}\` ${column.DATA_TYPE}`;

        if (column.CHARACTER_MAXIMUM_LENGTH) {
          text += `(${column.CHARACTER_MAXIMUM_LENGTH})`;
        }

        if (column.IS_NULLABLE === "NO") {
          text += " NOT NULL";
        }

        if (column.COLUMN_DEFAULT) {
          text += ` DEFAULT ${column.COLUMN_DEFAULT}`;
        }

        text += ",\n";
      }

      const primaryKeysResult = await pool.request()
        .query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE

                WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1

                AND TABLE_NAME = '${tableName}'`);

      const primaryKeys = primaryKeysResult.recordset;

      if (primaryKeys.length > 0) {
        const primaryKeyColumns = primaryKeys

          .map((pk) => `\`${pk.COLUMN_NAME}\``)

          .join(", ");

        text += `  PRIMARY KEY (${primaryKeyColumns})\n`;
      }

      const foreignKeysResult = await pool.request().query(`SELECT

                OBJECT_NAME(fkc.constraint_object_id) AS constraint_name,

                COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS column_name,

                OBJECT_NAME(fkc.referenced_object_id) AS referenced_table,

                COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referenced_column

                FROM sys.foreign_key_columns fkc

                INNER JOIN sys.objects obj ON obj.object_id = fkc.constraint_object_id

                INNER JOIN sys.tables tbl ON tbl.object_id = fkc.parent_object_id

                WHERE tbl.name = '${tableName}'`);

      const foreignKeys = foreignKeysResult.recordset;

      for (let k = 0; k < foreignKeys.length; k++) {
        const foreignKey = foreignKeys[k];

        text += `  FOREIGN KEY (\`${foreignKey.column_name}\`) REFERENCES \`${foreignKey.referenced_table}\` (\`${foreignKey.referenced_column}\`),\n`;
      }

      text = text.slice(0, -2); // Rimuovi l'ultima virgola e il newline

      text += "\n)";

      text = pulisci(text);

      databaseStructure.push(text);
    }

    const filePath = path.join(__dirname, folderName, db + "Tables.txt");

    fs.writeFile(
      filePath,

      databaseStructure.join("\n\n") + "\n",

      function (err) {
        if (err) {
          console.error("Errore durante la scrittura del file: " + err.message);
        } else {
          console.log(
            "Struttura del database scritta nel file: " + db + "Tables.txt"
          );
        }
      }
    );

    pool.close();

    if (verboseMode) {
      const csvFilePath = path.join(__dirname, "csvz", db + "TableNames.csv");

      fs.readFile(csvFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading CSV file:", err);
        } else {
          // Process the CSV data

          //console.log('CSV file contents:', data);

          fromTabToView(data, db);
        }
      });
    }
  } catch (err) {
    console.error("Errore durante la connessione al database: " + err.message);
  }
}

function getServerTypeFromArgs(args) {
  const index = args.findIndex((arg) => arg === "-s");

  if (index === -1 || index === args.length - 1) {
    return null;
  }

  return args[index + 1];
}

function getSelectedDatabaseFromArgs(args) {
  const index = args.findIndex((arg) => arg === "-d");

  if (index === -1 || index === args.length - 1) {
    return null;
  }

  return args[index + 1];
}

function getSelectedTablesFromArgs(args) {
  const index = args.findIndex((arg) => arg === "-t");

  if (index === -1 || index === args.length - 1) {
    return [];
  }

  return args.slice(index + 1);
}

function pulisci(string) {
  string = rimuoviEngine(string);

  string = rimuoviKey(string);

  string = replaceIfWholeWord(string, "NOT NULL", "");

  string = replaceIfWholeWord(string, "AUTO_INCREMENT", "");

  string = string.replace(/varchar\(\d+|-\d+\)/g, ""); // Aggiorna la regex per sostituire completamente i tipi di dati varchar

  string = string.replace(/char\(\d+\)/g, "");

  string = string.replace(/int\(\d+|-\d+\)/g, ""); // Aggiorna la regex per sostituire completamente i tipi di dati varchar

  string = string.replace(/binary\(\d+|-\d+\)/g, ""); // Aggiorna la regex per mantenere i binary con qualsiasi numero all'interno delle parentesi

  string = replaceIfWholeWord(string, "bigint", "");

  string = replaceIfWholeWord(string, /int\(\d+\)/g, "");

  string = replaceIfWholeWord(string, "int", "");

  string = string.replace(/decimal\(\d+,\d+\)/g, "");

  string = replaceIfWholeWord(string, "datetime2", "");

  string = replaceIfWholeWord(string, "date", "");

  string = replaceIfWholeWord(string, "bit", "");

  string = replaceIfWholeWord(string, /char/g, "");

  string = replaceIfWholeWord(string, "time", "");

  string = string.replace(/COMMENT[^,]+/g, "");

  string = string.replace(/DEFAULT[^,]+/g, "");

  string = string.replace(/`([^`]+)`/g, "$1"); // Rimuovi gli apici esterni

  string = string.replace(/\(/g, ""); // Rimuovi le parentesi tonde aperte

  string = string.replace(/\)/g, ""); // Rimuovi le parentesi tonde chiuse

  string = replaceIfWholeWord(string, "varchar", "");

  return string;
}

function replaceIfWholeWord(string, word, replacement) {
  const regex = new RegExp("\\b" + word + "\\b", "g");

  return string.replace(regex, replacement);
}

function rimuoviEngine(string) {
  let strings = string.split("\n");

  let cleanedString = "";

  for (let i = 0; i < strings.length; i++) {
    if (!strings[i].includes("ENGINE")) {
      cleanedString += strings[i] + "\n";
    }
  }

  cleanedString += ")\n";

  return cleanedString.trim();
}

function rimuoviKey(string) {
  let strings = string.split("\n");

  let cleanedString = "";

  for (let i = 0; i < strings.length; i++) {
    if (!strings[i].startsWith("  KEY")) {
      cleanedString += strings[i] + "\n";
    }
  }

  cleanedString += "\n";

  return cleanedString.trim();
}

function fromTabToView(testoCsv, ndb) {
  const filePath = path.join(__dirname, "dbz", ndb + "Tables.txt");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading CSV file:", err);
    } else {
      // Process the CSV data

      const lines = testoCsv.split("\n"); // Split the textCSV into lines

      const csvData = lines.map((line) => line.split(",")); // Split each line into fields using comma as the separator

      csvData.forEach(async (fields) => {
        const lastField = fields[fields.length - 1];

        if (lastField.trim() === "") {
        } else {
          console.log(fields[0], fields[fields.length - 1]);

          let createTableField0 = findCreateTable(data, fields[0]);

          let createTableLastField = findCreateTable(
            data,
            fields[fields.length - 1]
          );

          let premerge = createTableLastField;

          // Esegui le azioni desiderate con i risultati

          //console.log("CREATE TABLE per field[size-1]: PRE merge ", createTableLastField);

          createTableLastField = mergeTableFields(
            createTableField0,
            createTableLastField
          );

          //console.log("CREATE TABLE per field[size-1]: POST merge ", createTableLastField);

          data = data.replace(createTableField0, "");

          data = data.replace(premerge, createTableLastField);
        }
      });

      fs.writeFile(filePath, data, "utf8", (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        } else {
          console.log("File written successfully.");
        }
      });
    }
  });
}

function findCreateTable(data, tableName) {
  const regex = new RegExp(
    `CREATE TABLE ${tableName}\\b[^]+?(?=CREATE TABLE|$)`,
    "is"
  );

  const match = data.match(regex);

  return match ? match[0] : null;
}

function mergeTableFields(createTableField0, createTableLastField) {
  const fieldLines = createTableField0.split("\n");

  const lastFieldLines = createTableLastField.split("\n");

  for (let i = 0; i < fieldLines.length; i++) {
    const line = fieldLines[i];

    if (line.includes("PRIMARY KEY") || line.includes("FOREIGN KEY")) {
      const words = line.trim().split(" ");

      const nextWord = words[words.indexOf("KEY") + 1];

      if (createTableLastField.includes(nextWord)) {
        createTableLastField += "\n" + line;
      }
    }
  }

  createTableLastField = createTableLastField.trim().replace(/\n\s*\n/g, "\n");

  return createTableLastField + "\n\n";
}
