const express = require("express");

const cors = require("cors");
const  cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");


const profileRoutes = require("./routes/profileRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const adminLoginRoutes = require("./routes/adminLoginRoutes.js");
const adminUsersRoutes = require("./routes/adminUsersRoutes.js");
const adminfeedbackRoutes = require("./routes/adminfeedbackRoutes.js");
const foodRoutes = require("./routes/foodRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes.js");
const onboardingRoutes = require("./routes/onboardingRoutes.js");
const inventoryRoutes = require("./routes/inventoryRoutes.js");
const dashboarddietRoutes = require("./routes/dashboarddietRoutes.js");
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


// ✅ Routes
app.use("/auth", authRoutes);
app.use("/api/admin/login", adminLoginRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/inventory", inventoryRoutes);
//app.use("/api/feedback", feedbackRoutes);
//app.use("/api/feedback/users", feedbackusersRoutes);
app.use("/api/dashboard/diet", dashboarddietRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin/feedback", adminfeedbackRoutes);
app.use("/api/feedback", feedbackRoutes);


// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});


app.listen(5000, () => {
  console.log("Server started on port 5000");
});


