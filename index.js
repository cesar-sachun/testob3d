import express from "express";
import routes from "./routes.js";
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/build", express.static("node_modules/three/build"));
app.use("/jsm", express.static("node_modules/three/examples/jsm"));
app.use(routes);
app.listen(3050, () => {
    console.log("Server started on port http://localhost:3050");
});