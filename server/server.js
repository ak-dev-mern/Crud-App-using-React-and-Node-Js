import { createServer } from "node:http";
import mysql from "mysql2";

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "users", // Ensure that the 'users' database and 'user_table' table exist
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.log("Error in DB connection:", err);
    return;
  }
  console.log("Database connected");
});

// Create the server and handle requests
const server = createServer((req, res) => {
  // Set headers to allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Basic GET route
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Welcome to Node Js" }));
  }

  // Fetch all users from the database
  else if (req.method === "GET" && req.url === "/users") {
    const getQuery = "SELECT * FROM user_table";
    db.query(getQuery, (err, results) => {
      if (err) {
        console.log("Unable to fetch data from DB:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Database query error" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Success",
          records: results.length,
          data: results,
        })
      );
    });
  }

  // Save user data to the database
  else if (req.method === "POST" && req.url === "/api/save") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const data = JSON.parse(body);
      const { name, email, city, dob } = data;

      // SQL query to insert the user data into the database
      const insertQuery =
        "INSERT INTO user_table (name, email, city, dob) VALUES (?, ?, ?, ?)";
      db.query(insertQuery, [name, email, city, dob], (err, result) => {
        if (err) {
          console.log("Error inserting data:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Error saving data to database" }));
          return;
        }

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Data saved successfully", data }));
      });
    });
  }

  // Delete user data
  else if (req.method === "DELETE" && req.url.startsWith("/api/delete/")) {
    // Extract user ID from the URL
    const userId = req.url.split("/")[3]; 

    if (!userId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User ID is required" }));
      return;
    }

    const deleteQuery = "DELETE FROM user_table WHERE id = ?";
    db.query(deleteQuery, [userId], (err, results) => {
      if (err) {
        console.error("Error deleting user:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Error deleting user from database" })
        );
        return;
      }

      if (results.affectedRows === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not found" }));
        return;
      }

      console.log("Deleted user:", results.affectedRows);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User deleted successfully" }));
    });
  }

  // Update user data
  else if (req.method === "PUT" && req.url.startsWith("/api/update/")) {
    // Extract user ID from the URL
    const userId = req.url.split("/")[3]; 

    if (!userId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User ID is required" }));
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const data = JSON.parse(body);
      const { name, email, city, dob } = data;

      // SQL query to update user data in the database
      const updateQuery =
        "UPDATE user_table SET name = ?, email = ?, city = ?, dob = ? WHERE id = ?";

      db.query(updateQuery, [name, email, city, dob, userId], (err, result) => {
        if (err) {
          console.log("Error updating data:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Error updating data in the database" })
          );
          return;
        }

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "User not found" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User updated successfully" }));
      });
    });
  }

  // If the route is not found
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "404 Page Not Found" }));
  }
});

// Start the server
server.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
