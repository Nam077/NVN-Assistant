import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine";
import webRoutes from "./routes/web";
import initApiRoute from './routes/api';
import request from 'request';
import connection from './configs/connectDB';
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view Engine
viewEngine(app);

//config web routes
webRoutes(app);
console.log("sdfnkds");
initApiRoute(app);

let port = process.env.PORT || 8080;


app.listen(port, () => {

    console.log("App is running at the port: " + port);
})