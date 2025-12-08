const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/campusfresh_dept", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Dept DB Connected");
  } catch (err) {
    console.log("Dept DB Error: ", err);
  }
};

module.exports = connectDB;
