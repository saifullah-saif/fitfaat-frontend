const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const authRoutes = require("./routes/authRoutes.js");
const marketplaceRoutes = require("./routes/marketplaceRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const communityRoutes = require("./routes/communityRoutes.js");
const adminContentRoutes = require("./routes/admin-contentRoutes.js");
const adminGroupRoutes = require("./routes/admin-groupRoutes.js");

const exerciseRoutes = require("./routes/exerciseRoutes.js");
const workoutRoutes = require("./routes/workoutRoutes.js");
const gymRoutes = require("./routes/gymRoutes.js");
const rankingRoutes = require("./routes/rankingRoutes.js");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ['Content-Length', 'Content-Type'],
  })
);
// Increase payload size limits to handle larger requests (like images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/marketplace", marketplaceRoutes);
app.use("/cart", cartRoutes);
app.use("/community", communityRoutes);
app.use("/admin-content", adminContentRoutes);
app.use("/admin-group", adminGroupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/rankings", rankingRoutes);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
