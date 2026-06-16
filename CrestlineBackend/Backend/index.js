const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// 1. CRITICAL FIX: Load Environment Variables at the VERY top of your runtime entry point
require("dotenv").config();

// 2. Declare the allowed origins array
const allowedOrigins = [
  "http://localhost:5175", // Your Customer/User Frontend
  "http://localhost:5176", // Your Staff/Admin Frontend
  "http://localhost:5173",
  "http://localhost:5174"
];

// 3. Dynamic CORS Engine Integration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or postman requests (no origin header)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 4. Global Parsing Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 5. Database Connectivity Infrastructure
const URI = process.env.MONGO_URI;
mongoose
  .connect(URI)
  .then(() => {
    console.log("mongoose has been successfully connected");
  })
  .catch((err) => {
    console.log("mongodb not connecting");
    console.log(err);
  });

const PORT = process.env.PORT || 5300;

// 6. Router Mount Registrations
const userRouter = require("./routes/User.route");
const adminRouter = require("./routes/Admin.route");
const staffRouter = require("./routes/Staff.route");
const investRouter = require("./routes/Invest.route");
const receiptRouter = require("./routes/Usertransactionsreceipt")
const opsfeeRouter = require("./routes/ops.routes")
const settingRouter = require("./routes/settings.routes")

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/staff", staffRouter);
app.use("/invest", investRouter); // <-- Your investment sub-route table points here!
app.use("/reciept", receiptRouter)
app.use("/ops", opsfeeRouter)
app.use("/settings", settingRouter)
app.get("/ping", (req, res) => res.json({ alive: true }));

// 7. Server Boot Engine
app.listen(PORT, (err) => {
  if (err) {
    console.log("App is not working!!!!!!:" + PORT);
  } else {
    console.log(`App has started running on port ${PORT}`);
  }
});