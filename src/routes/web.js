import express from "express";
import homeController from "../controllers/HomeController";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);
    router.get("/setup-profile", homeController.setupProfile);
    router.get("/setup-persistent-menu", homeController.setupPersistentMenu);
    router.post('/webhook', homeController.postWebhook);
    router.get('/webhook', homeController.getWebhook);
    router.get('/database', homeController.updateMySQL);
    router.get("/excel", homeController.getGoogleSheet);
    router.get("/crawler", homeController.getCrawler);
    return app.use('/', router);
}

module.exports = initWebRoutes;