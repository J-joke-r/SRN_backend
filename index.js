require("dotenv").config();
const cors = require("cors");
const express = require("express");

const app = express();

// -------------------- Middleware --------------------
// Configure CORS based on allowed origins from env
const rawAllowed = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "";
const allowedOrigins = rawAllowed
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // In production, require explicit allow-list; in dev allow localhost
      const isDev = process.env.NODE_ENV !== "production";
      const devAllowed = isDev && /localhost|127\.0\.0\.1|192\.168\./.test(origin);
      const isAllowed =
        allowedOrigins.length === 0
          ? devAllowed
          : allowedOrigins.some((o) => origin === o || origin.startsWith(o));

      if (isAllowed) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// -------------------- Route Imports --------------------
const personalDetailsRoutes = require("./routes/personalDetails");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const adminGetUsersRoute = require('./api/admin/get-users');
const adminEditUserRoute = require('./api/admin/edit-user');
const adminPersonalDetailsRoute = require('./api/admin/personal-details');
const checkRoleRoute = require("./routes/checkRole");
const announcementsRoute = require("./routes/announcements");


// -------------------- Public API Routes --------------------
app.use("/api/personal-details", personalDetailsRoutes);
app.use("/api/users", userRoutes);
app.use("/check-role", checkRoleRoute); // Check role for logged-in user

// -------------------- Admin Routes --------------------
// ✅ Auth middleware is already applied in routes/admin.js
app.use("/api/admin", adminRoutes);
app.use('/api/admin', adminGetUsersRoute);
app.use('/api/admin', adminEditUserRoute);
app.use('/api/admin/personal-details', adminPersonalDetailsRoute);

// Announcements route
app.use("/api/announcements", announcementsRoute);

// -------------------- Health Check --------------------
app.get("/", (req, res) => {
  res.send("🚀 SRN Project Backend is running");
});
// Health check route already defined above

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
