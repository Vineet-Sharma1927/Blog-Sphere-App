require('dotenv').config();
const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const userRoute = require("./routes/userRoutes");
const blogRoute = require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
const app = express();
const path = require("path");

const _dirname = path.resolve();

const port = PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: [FRONTEND_URL, "https://your-vercel-domain.vercel.app", "https://blog-sphere-app-kappa.vercel.app", "*"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Health check endpoint for Vercel
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Test endpoint to check API connectivity
app.get("/api/v1/test", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "API is accessible",
    env: {
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: FRONTEND_URL,
      port: port
    }
  });
});

// API routes
app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute);

// Handle API routes - fix the app.handle approach which may be causing issues
app.all("/api/*", (req, res, next) => {
  if (!req.path.startsWith('/api/v1')) {
    req.url = req.url.replace(/^\/api/, '/api/v1');
  }
  next();
});

// Comment out or remove frontend serving code since frontend is deployed separately
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(_dirname, "/frontend/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
//   });
// } else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
// }

// Start server if not on Vercel
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log("Server Started at port", port);
    dbConnect();
    cloudinaryConfig();
  });
}

// For Vercel, we need to export the app
dbConnect();
cloudinaryConfig();
module.exports = app;
