const config = require("config");
const mongoose = require("mongoose");
const usersRoute = require("./routes/User");
const decklistRoutes = require("./routes/Decklist");
const eventRoutes = require("./routes/Event");
const express = require("express");
const app = express();


//use config module to get the privatekey, if no private key set, end the application
if (!config.get("myprivatekey")) {
  console.error("FATAL ERROR: myprivatekey is not defined.");
  process.exit(1);
}

//connect to mongodb
mongoose
  .connect("mongodb://localhost/magicapp", { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB..."));


app.use(express.json());
//use users route for api/users
app.use("/api/users", usersRoute);
app.use("/api/decklists", decklistRoutes);
app.use("/api/events", eventRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));