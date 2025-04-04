const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const userRoute = require("./routes/userRoutes");
const blogRoute = require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
const app = express();
const path = require("path");
require('dotenv').config();

const _dirname = path.resolve();

const port = PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL ,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Hello Ji Ki hal Bhai ke"); 
});

app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute);

// Comment out or remove the static file serving for production
// Only use API routes when running backend and frontend separately
/*
app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
}
);
*/

app.listen(port, () => {
  console.log("Server Started at port", port);
  dbConnect();
  cloudinaryConfig();
});
