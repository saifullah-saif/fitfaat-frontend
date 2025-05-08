const express = require("express");

const cors = require("cors");
const  cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");


const authRoutes = require("./routes/authRoutes.js");


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

app.listen(5000, () => {
  console.log("Server started on port 5000");
});


