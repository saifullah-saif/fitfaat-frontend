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


app.use("/auth", authRoutes);
app.use("/marketplace", marketplaceRoutes);
app.use("/cart", cartRoutes);
app.use("/community", communityRoutes);


app.listen(5000, () => {
  console.log("Server started on port 5000");
});


