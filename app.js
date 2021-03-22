const express = require("express");
const mainRouter = require("./routes/index");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const URI =
  "mongodb+srv://flenkyboy:flenkyboy@cluster0.obmwc.mongodb.net/analytica?retryWrites=true&w=majority";
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
app.use(express.static(path.join(__dirname, "public")));
app.use("/", mainRouter);
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
