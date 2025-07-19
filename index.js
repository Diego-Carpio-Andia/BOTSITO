const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/user");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRoutes);

app.set("port", process.env.PORT || 3900);

app.listen(app.get("port"), () => {
  console.log("Servidor corriendo en puerto:", app.get("port"));
});
