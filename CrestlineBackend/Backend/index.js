const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const allowedOrigins = [
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const URI = process.env.MONGO_URI;
mongoose
  .connect(URI)
  .then(() => {
    console.log("mongoose has been successfully connected");
  })
  .catch((err) => {
    console.log("mongodb not connecting", err);
  });

const PORT = process.env.PORT || 5300;

const userRouter = require("./routes/User.route");
const adminRouter = require("./routes/Admin.route");
const staffRouter = require("./routes/Staff.route");
const investRouter = require("./routes/Invest.route");
const receiptRouter = require("./routes/Usertransactionsreceipt");
const opsfeeRouter = require("./routes/ops.routes");
const settingRouter = require("./routes/settings.routes");

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/staff", staffRouter);
app.use("/invest", investRouter);
app.use("/reciept", receiptRouter);
app.use("/ops", opsfeeRouter);
app.use("/settings", settingRouter);

app.get("/ping", (req, res) => res.json({ alive: true }));

app.listen(PORT, () => {
  console.log(`🚀 Crestline Backend running smoothly on port ${PORT}`);
});