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
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      FRONTEND_URL, 
      "http://localhost:3000", 
      "http://localhost:5173", 
      "https://blog-sphere-app-kappa.vercel.app"
    ];
    
    if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

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
