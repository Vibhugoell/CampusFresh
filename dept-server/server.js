const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Dept DB Connected"))
.catch(err => console.log("Dept DB Error:", err));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/laundry", require("./routes/laundry"));
app.use("/complaints", require("./routes/complaint"));

app.listen(5001, () => console.log("Department Server running on 5001"));
