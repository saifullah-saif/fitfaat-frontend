const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes.js");
const exerciseRoutes = require("./routes/exerciseRoutes.js");
const workoutRoutes = require("./routes/workoutRoutes.js");
const gymRoutes = require("./routes/gymRoutes.js");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/gyms", gymRoutes);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
