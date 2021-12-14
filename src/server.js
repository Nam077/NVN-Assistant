import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine";
import webRoutes from "./routes/web";

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view Engine
viewEngine(app);

//config web routes
webRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("App is running at the port: " + port);
})