require("dotenv").config();
import chatbotService from "../services/chatbotService";
import pool from "../configs/connectDB";
import request from "request";
import cheerio from "cheerio";
import axios from "axios";
import { config } from "dotenv";
import { each, first } from "cheerio/lib/api/traversing";
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");
const translate = require("translate-google");
const PRIVATE_KEY =
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5HoFZFah8impx\nX2s4LmCImHQarqevuxy6L1hQcvtuVyNizNgSCpvyb59gnplIvMuBoEzgAJppjq5d\nEVNrdfJjRCWj6PL0hDN/Y+ONMJXvnmhfeeZpiFdnW7+hz1jkyK8w0ZK3/nLGz2fE\nz015F8dIuCWWvBXq0BQUm+5Z3qPLemylXJb//Wu3eZkCQpAAZUgInSHOUNBwqzek\nxS44BHQ6uCt5QPIgUMXZ1aiioCo/3tGYcURDdqk1yVJVFvUY/J1GGB7t0Cho8Q/y\nIiX5CWQnnApqtU71vE7GDtffN/ZXzP5CiSiia/+0xkJ3XsigYO9PVd5Bky4XfenK\nb+oHcS0bAgMBAAECggEABlAnAx28+DpUNPeXFXxnaGEinIJWT6Tm7uaMcXnqXzHz\nj/wCZmMcPGFYIxhli9h8bDhGRuFeYrkt8xiTKrgEAySgz/0yw+n6Q57pdLgydNCH\nKLJkjDbNHEZBu8fxdSPu7ZBIG6Q+z87k8A5NyxJnhnBZP9G8QZzFAorqzv/LwDWm\nwrbmujbG6NjddMoNcOIZdYhVVuPCrmrkk4b3GYi282dtBbcEjf190yin9HrfK8qB\nHgAdudUa7ZG2YVw27OlJX7ljWaKB6boHgVa1hsCrOxeRC/aiXazngXphgF7ZE2wj\nkX9GkjrqqGZUvW+m3+pUCJpbdj5j5ivwgZzV/JPkEQKBgQDe0fLgC9ZD4kT+0J+v\nxVaeMnRquOMRa+CDqa6izBZutCHimO+qXR6Go+vMYqaYbB3otVwILTBxW87WIrNp\nVZ9d4izSNDMCUSnldyZXY1y5Iegd6e+1X4zTLkpQJKvmw8LF/DlxfeXq+cCf2gDA\nUts+RSptDiTClbAelpY+AUc+2QKBgQDUr18C/voDG6ybYP+DdaP8dopvAvnhIbR7\nlA2nMq4qn6DjYF7D7KesS0cVgUiHU/ZpOujS8aPwwjHt0EX2KF2O/s5tQI9XUaDE\nnGe4bOAZWl9DCRzXv0ZezJWSEN8NXvuPQNTN/jYHhaWiLuePoDKnp7vfF4AK/7QP\nD/WqfNe7EwKBgAXgA0dlCIFBthAB8DPyQBZrviYSOep7ra/LCY/BUdYZactPvQIA\n8o0aRV1ePIZIU4GPRp3wkxZqFUoQICrm1wziqcvhFHc7LJ+gRKKJPCilfDlNscRW\ngKAQ2GTEksPC5Z/SxrD3YNiRPUL5vItVo/JAYJ3/gXif+cTUs6Fu5zIBAoGBAJzs\nxFqujQNsEOAYIo75ZsRpJl0gQgSlXMhtheFemHkkjI4X1fQTkeejJ1Crsjr/bWlZ\nKN4zonWKo1JHgMdOIzHVubOMlfakaM2IZVMDKhoqvuz0NU7Od3qM0rMSNbFk6pFZ\nEWrn7S+BoaNXnk0vsxBWx1yktznmTxFqAiYHtRj3AoGAHpKWPmng3itZ3Xsr2UXP\nTVYdulHGCCYpr9TecYsGb0MHsotbmHyQl9sn74relRTxJtkqz5PlmdCqZNDHDLko\nEl1VUM5kyLdhv0V3pADIpDmOAVkvjwg5YVCG7hodtbC7zdM8HULhtyt/sTJ5XbEK\nWJSed/k0HM+fZueJbFS0uZk=\n-----END PRIVATE KEY-----\n";
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const SHEET_ID = process.env.SHEET_ID;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
//process.env.NAME_VARIABLES
let getHomePage = (req, res) => {
    return res.render("homepage.ejs");
};

let postWebhook = async(req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === "page") {
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log("Gửi từ PSID: " + sender_psid);
            console.log(webhook_event.message);
            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

// Handles messages events
async function handleMessage(sender_psid, received_message) {
    let username = await chatbotService.getUserName(sender_psid);
    let response;

    // Checks if the message contains text
    if (received_message.quick_reply && received_message.quick_reply.payload) {
        if (received_message.quick_reply.payload === "BOT_TUTORIAL") {
            let response3 = chatbotService.getVideoTutorial();
            await chatbotService.callSendAPI(sender_psid, response3);
            response = {
                text: "Vui lòng gửi tên font bạn cần tìm vào đây\nNếu không có bot sẽ không phản hồi!",
            };
            await chatbotService.callSendAPI(sender_psid, response);
            let response2 = {
                text: "Nếu bạn muốn nhận hướng dẫn đầy đủ vui lòng gửi lại tin nhắn 'HDSD'",
            };
            await chatbotService.callSendAPI(sender_psid, response2);
            return;
        }
        if (received_message.quick_reply.payload === "PRICE_SERVICE") {
            response = { text: "Giá là 50.000 đồng một font nhé." };
            await chatbotService.callSendAPI(sender_psid, response);
            let response2a = {
                text: "Nếu bạn muốn sử dụng thì vui lòng liên hệ qua m.me/nam077.me",
            };
            await chatbotService.callSendAPI(sender_psid, response2a);
            return;
        }
        if (received_message.quick_reply.payload === "LIST_FONT") {
            await chatbotService.getFontSupport(sender_psid);
            let response2 = {
                text: "Nếu bạn muốn lấy link nào thì nhắn tin tên một font trong list này\nHệ thống sẽ gửi cho bạn",
            };
            await chatbotService.callSendAPI(sender_psid, response2);
            return;
        }
        return;
    }
    if (received_message.text) {
        let [font] = await pool.execute("SELECT `key` FROM `nvnfont` ");
        let arr = font.map(({ key }) => key);
        let [data] = await pool.execute("SELECT `key` FROM `data` ");
        let arr2 = data.map(({ key }) => key);
        let message = received_message.text;
        message = message.toLowerCase();
        let keyfont = chatbotService.checkKey(arr, message);
        let keydata = chatbotService.checkKey(arr2, message);
        if (keyfont != null && keyfont != undefined) {
            await chatbotService.sendMessage(sender_psid, keyfont);
            return;
        } else if (keydata != null && keydata != undefined) {
            await chatbotService.sendTextMessage(sender_psid, keydata);
            return;
        } else if (
            message.indexOf("bắt đầu") != -1 ||
            message.indexOf("start") != -1
        ) {
            await chatbotService.handleGetStarted(sender_psid);
            return;
        } else if (
            message.toLowerCase().indexOf("xổ số") != -1 ||
            message.toLowerCase().indexOf("xo so") != -1
        ) {
            await chatbotService.getLuckyNumber(sender_psid);
            return;
        } else if (
            message.toLowerCase().indexOf("covid") != -1 ||
            message.toLowerCase().indexOf("corona") != -1 ||
            message.toLowerCase().indexOf("cov") != -1
        ) {
            await chatbotService.getCovidApi(sender_psid, message);
            return;
        } else if (
            message.indexOf("mấy giờ") != -1 ||
            message.indexOf("giờ giấc") != -1
        ) {
            let msg = chatbotService.getTimeVietNam();
            let response = { text: `Bây giờ là ${msg} ` };
            await chatbotService.callSendAPI(sender_psid, response);
            let msgtime = chatbotService.checktime(username);
            let response2 = { text: msgtime };
            await chatbotService.callSendAPI(sender_psid, response2);
            return;
        } else if (
            message.indexOf("danh sách font") != -1 ||
            message.indexOf("list font") != -1
        ) {
            await chatbotService.getFontSupport(sender_psid);
            let response2 = {
                text: "Nếu bạn muốn lấy link nào thì nhắn tin tên một font trong list này\nHệ thống sẽ gửi cho bạn",
            };
            await chatbotService.callSendAPI(sender_psid, response2);
            return;
        } else {
            await chatbotService.getGooleSearch(sender_psid, received_message.text);
            return;
        }
    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Bạn chắc chắc đây là ảnh của bạn chứ",
                        subtitle: "Nhấn vào nút để trả lời",
                        image_url: attachment_url,
                        buttons: [{
                                type: "postback",
                                title: "Đúng!",
                                payload: "yes",
                            },
                            {
                                type: "postback",
                                title: "Không phải!",
                                payload: "no",
                            },
                        ],
                    }, ],
                },
            },
        };
        await chatbotService.callSendAPI(sender_psid, response);
    }

    // Send the response message
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    switch (payload) {
        case "yes":
            response = { text: "Hỏi vậy chứ không có gì :vv" };
            await chatbotService.callSendAPI(sender_psid, response);
            break;
        case "no":
            response = { text: "Kaka Kệ" };
            await chatbotService.callSendAPI(sender_psid, response);
            break;
        case "BOT_TUTORIAL":
            let response3 = chatbotService.getVideoTutorial();
            await chatbotService.callSendAPI(sender_psid, response3);
            response = {
                text: "Vui lòng gửi tên font bạn cần tìm vào đây\nNếu không có bot sẽ không phản hồi!",
            };
            await chatbotService.callSendAPI(sender_psid, response);
            let response2 = {
                text: "Nếu bạn muốn nhận hướng dẫn đầy đủ vui lòng gửi lại tin nhắn 'HDSD'",
            };
            await chatbotService.callSendAPI(sender_psid, response2);
            break;
        case "LIST_FONT":
            await chatbotService.getFontSupport(sender_psid);
            let responseaa = {
                text: "Nếu bạn muốn lấy link nào thì nhắn tin tên một font trong list này\nHệ thống sẽ gửi cho bạn",
            };
            await chatbotService.callSendAPI(sender_psid, responseaa);
            break;
        case "PRICE_SERVICE":
            response = {
                text: "Hiện tại bên mình nhận việt hóa với giá 50.000 đồng một font.",
            };
            await chatbotService.callSendAPI(sender_psid, response);
            let response2a = {
                text: "Nếu bạn muốn sử dụng thì vui lòng liên hệ qua m.me/nam077.me",
            };
            await chatbotService.callSendAPI(sender_psid, response2a);
            break;
        case "GET_STARTED_PAYLOAD":
        case "RESTART_BOT":
            await chatbotService.handleGetStarted(sender_psid);
            break;
        default:
            response = { text: "Xin lỗi tôi không hiểu" };
            await chatbotService.callSendAPI(sender_psid, response);
    }
    // Send the message to acknowledge the postback
}

// Sends response messages via the Send API

let setupProfile = async(req, res) => {
    //call profile facebook api
    // Construct the message body
    let request_body = {
        get_started: {
            payload: "GET_STARTED_PAYLOAD",
        },
        whitelisted_domains: ["https://chatbot-nvn.herokuapp.com/"],
    };
    //
    // Send the HTTP request to the Messenger Platform
    await request({
            uri: `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: "POST",
            json: request_body,
        },
        (err, res, body) => {
            if (!err) {
                console.log("Cấu hình Profile thành công");
            } else {
                console.error("Unable Setup user profile:" + err);
            }
        }
    );

    return res.send("Set up thành công");
};
let setupPersistentMenu = async(req, res) => {
    //call profile facebook api
    // Construct the message body
    let request_body = {
        persistent_menu: [{
            locale: "default",
            composer_input_disabled: false,
            call_to_actions: [{
                    type: "web_url",
                    title: "Xem Trang",
                    url: "https://www.facebook.com/NVNFONT/",
                    webview_height_ratio: "full",
                },
                {
                    type: "web_url",
                    title: "Tham gia group",
                    url: "https://www.facebook.com/groups/NVNFONT/",
                    webview_height_ratio: "full",
                },
                {
                    type: "postback",
                    title: "Xem hướng dẫn sử dụng bot",
                    payload: "BOT_TUTORIAL",
                },
                {
                    type: "postback",
                    title: "Danh sách font hỗ trợ",
                    payload: "LIST_FONT",
                },
                {
                    type: "postback",
                    title: "Xem giá Việt hóa",
                    payload: "PRICE_SERVICE",
                },
                {
                    type: "postback",
                    title: "Khởi động lại bot",
                    payload: "RESTART_BOT",
                },
            ],
        }, ],
    };
    //
    // Send the HTTP request to the Messenger Platform
    await request({
            uri: `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: "POST",
            json: request_body,
        },
        (err, res, body) => {
            if (!err) {
                console.log("Setup user profile succes");
            } else {
                console.error("Unable Setup user profile:" + err);
            }
        }
    );

    return res.send("Set up thành công");
};
let getGoogleSheet = async(req, res) => {
    try {
        await pool.execute("DELETE FROM `nvnfont`");
        await pool.execute("DELETE FROM `data`");
        await pool.execute("DELETE FROM `listfont`");
        await pool.execute("ALTER TABLE `nvnfont` AUTO_INCREMENT = 1;");
        await pool.execute("ALTER TABLE `data` AUTO_INCREMENT = 1;");
        await pool.execute("ALTER TABLE `listfont` AUTO_INCREMENT = 1;");
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet(SHEET_ID);

        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth({
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        });
        await doc.loadInfo(); // loads document properties and worksheets
        const sheet = doc.sheetsByIndex[0];
        const sheet2 = doc.sheetsByIndex[1];
        const rows2 = await sheet2.getRows(); // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const name = [];
        const key = [];
        const linkdownload = [];
        const linkimage = [];
        const msg = [];
        const img = [];
        const respone = [];
        const keylist = [];
        const rows = await sheet.getRows();
        for (const element of rows) {
            name.push(element.Name);
            key.push(element.Key.toLowerCase());
            linkdownload.push(element.Link);
            linkimage.push(element.Image);
            msg.push(element.Message);
        }
        for (const element of rows2) {
            keylist.push(element.Key.toLowerCase());
            respone.push(element.Respone);
            img.push(element.Image);
        }
        var objectFont = [];
        for (let i = 0; i < key.length; i++) {
            let listkeyfont = [];
            listkeyfont = key[i].split(",");
            for (let j = 0; j < listkeyfont.length; j++) {
                let singlekey = listkeyfont[j].trim();
                if (singlekey != null && singlekey != "") {
                    var singleObj = {};
                    singleObj["name"] = name[i];
                    singleObj["key"] = singlekey;
                    singleObj["link"] = linkdownload[i];
                    singleObj["img"] = linkimage[i];
                    singleObj["msg"] = msg[i];
                    objectFont.push(singleObj);
                }
            }
        }
        let objectData = [];
        for (let i = 0; i < keylist.length; i++) {
            let listKey = [];
            listKey = keylist[i].split(",");
            for (let j = 0; j < listKey.length; j++) {
                let singlekey = listKey[j].trim();
                if (singlekey != null && singlekey != "") {
                    var singleObj = {};
                    singleObj["key"] = singlekey;
                    singleObj["respone"] = respone[i];
                    if (img[i] != null && img[i] != "") {
                        singleObj["image"] = img[i];
                    } else {
                        singleObj["image"] = "";
                    }
                    objectData.push(singleObj);
                }
            }
        }
        const data = JSON.stringify(objectFont);
        const data2 = JSON.stringify(objectData);
        var file = fs.createWriteStream("font.json");
        try {
            fs.writeFileSync("font.json", data);
            console.log("Lưu danh sách font thành công !");
        } catch (error) {
            console.error(err);
        }
        var file2 = fs.createWriteStream("data.json");
        try {
            fs.writeFileSync("data.json", data2);
            console.log("Lưu dữ liệu thành công !");
        } catch (error) {
            console.error(err);
        }

        let configs = objectFont;
        let dataFont = "";
        let arr = [];
        let arr2 = [];
        var objectListFont = [];
        let count = 0;
        let dem = 1;
        for (let i = 0; i < configs.length; i++) {
            if (!arr.includes(configs[i].name)) {
                arr.push(configs[i].name);
            }
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr2.length == 40) {
                for (const element of arr2) {
                    dataFont += element + "\n";
                }
                let singleObj = {};
                singleObj["list"] = dataFont;
                objectListFont.push(singleObj);
                count = count + 1;
                arr2 = [];
                dataFont = "";
                dem += 1;
            }
            if (arr2.length < 40) {
                arr2.push(arr[i]);
            }
            if (i == arr.length - 1) {
                if (i > 40 * dem || i < 40 * dem) {
                    for (const element of arr2) {
                        dataFont += element + "\n";
                    }
                    let singleObj = {};
                    singleObj["list"] = dataFont;
                    objectListFont.push(singleObj);
                    arr2 = [];
                    dataFont = "";
                }
            }
        }
        const data3 = JSON.stringify(objectListFont);
        var file3 = fs.createWriteStream("listfont.json");
        try {
            fs.writeFileSync("listfont.json", data3);
            console.log("Lưu danh sách font hỗ trợ thành công!");
        } catch (error) {
            console.error(err);
        }
        return res.redirect("/database");
    } catch (e) {
        console.log(e);
        return res.send(
            "Oops! Something wrongs, check logs console for detail ... "
        );
    }
};
let updateMySQL = (req, res) => {
    var mysql = require("mysql2");
    let host = process.env.HOSTDATABASE;
    let user = process.env.USERDATABASE;
    let password = process.env.PASSDATABASE;
    let database = process.env.NAMEDATABASE;
    var con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database,
    });
    let config = require("../../font.json");
    let objectFont = config;
    var FontResult = [];
    for (var i = 0; i < objectFont.length; i++) {
        FontResult.push(
            Object.keys(objectFont[i]).map((key) => objectFont[i][key])
        );
    }
    let config2 = require("../../data.json");
    let objectData = config2;
    var listDataResult = [];
    for (var i = 0; i < objectData.length; i++) {
        listDataResult.push(
            Object.keys(objectData[i]).map((key) => objectData[i][key])
        );
    }
    let config3 = require("../../listfont.json");
    let objectListFont = config3;
    var listFontResult = [];
    for (var i = 0; i < objectListFont.length; i++) {
        listFontResult.push(
            Object.keys(objectListFont[i]).map((key) => objectListFont[i][key])
        );
    }
    con.connect(function(err) {
        if (err) throw err;
        //Make SQL statement:
        var sql = "INSERT INTO nvnfont (`name`, `key`, `link`,`image`,`message`) VALUES ?";
        var sql2 = "INSERT INTO data (`key`, `respone`,`image`) VALUES ?";
        var sql3 = "INSERT INTO listfont (`list`) VALUES ?";
        //Make an array of values:
        //Execute the SQL statement, with the value array:
        con.query(sql, [FontResult], function(err, result) {
            if (err) throw err;
            console.log("Lưu danh sách font thành công: " + result.affectedRows);
            return;
        });
        con.query(sql2, [listDataResult], function(err, result) {
            if (err) throw err;
            console.log("Lưu dữ liệu thành công: " + result.affectedRows);
            return;
        });
        con.query(sql3, [listFontResult], function(err, result) {
            if (err) throw err;
            console.log("Lưu danh sách font hỗ trợ thành công: " + result.affectedRows);
            return;
        });
    });
    return res.redirect("/");
};

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,
    getGoogleSheet: getGoogleSheet,
    updateMySQL: updateMySQL,
};