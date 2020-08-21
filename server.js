const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Connect to DB
connectDB();

app.get("/", (req, res) => {
	res.send("API Running.");
});

const PORT = process.env.PORT || 3001;

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
