require('dotenv').config();
import chatbotService from '../services/chatbotService';
import request from "request";
import moment from "moment";

const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require("fs")
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5HoFZFah8impx\nX2s4LmCImHQarqevuxy6L1hQcvtuVyNizNgSCpvyb59gnplIvMuBoEzgAJppjq5d\nEVNrdfJjRCWj6PL0hDN/Y+ONMJXvnmhfeeZpiFdnW7+hz1jkyK8w0ZK3/nLGz2fE\nz015F8dIuCWWvBXq0BQUm+5Z3qPLemylXJb//Wu3eZkCQpAAZUgInSHOUNBwqzek\nxS44BHQ6uCt5QPIgUMXZ1aiioCo/3tGYcURDdqk1yVJVFvUY/J1GGB7t0Cho8Q/y\nIiX5CWQnnApqtU71vE7GDtffN/ZXzP5CiSiia/+0xkJ3XsigYO9PVd5Bky4XfenK\nb+oHcS0bAgMBAAECggEABlAnAx28+DpUNPeXFXxnaGEinIJWT6Tm7uaMcXnqXzHz\nj/wCZmMcPGFYIxhli9h8bDhGRuFeYrkt8xiTKrgEAySgz/0yw+n6Q57pdLgydNCH\nKLJkjDbNHEZBu8fxdSPu7ZBIG6Q+z87k8A5NyxJnhnBZP9G8QZzFAorqzv/LwDWm\nwrbmujbG6NjddMoNcOIZdYhVVuPCrmrkk4b3GYi282dtBbcEjf190yin9HrfK8qB\nHgAdudUa7ZG2YVw27OlJX7ljWaKB6boHgVa1hsCrOxeRC/aiXazngXphgF7ZE2wj\nkX9GkjrqqGZUvW+m3+pUCJpbdj5j5ivwgZzV/JPkEQKBgQDe0fLgC9ZD4kT+0J+v\nxVaeMnRquOMRa+CDqa6izBZutCHimO+qXR6Go+vMYqaYbB3otVwILTBxW87WIrNp\nVZ9d4izSNDMCUSnldyZXY1y5Iegd6e+1X4zTLkpQJKvmw8LF/DlxfeXq+cCf2gDA\nUts+RSptDiTClbAelpY+AUc+2QKBgQDUr18C/voDG6ybYP+DdaP8dopvAvnhIbR7\nlA2nMq4qn6DjYF7D7KesS0cVgUiHU/ZpOujS8aPwwjHt0EX2KF2O/s5tQI9XUaDE\nnGe4bOAZWl9DCRzXv0ZezJWSEN8NXvuPQNTN/jYHhaWiLuePoDKnp7vfF4AK/7QP\nD/WqfNe7EwKBgAXgA0dlCIFBthAB8DPyQBZrviYSOep7ra/LCY/BUdYZactPvQIA\n8o0aRV1ePIZIU4GPRp3wkxZqFUoQICrm1wziqcvhFHc7LJ+gRKKJPCilfDlNscRW\ngKAQ2GTEksPC5Z/SxrD3YNiRPUL5vItVo/JAYJ3/gXif+cTUs6Fu5zIBAoGBAJzs\nxFqujQNsEOAYIo75ZsRpJl0gQgSlXMhtheFemHkkjI4X1fQTkeejJ1Crsjr/bWlZ\nKN4zonWKo1JHgMdOIzHVubOMlfakaM2IZVMDKhoqvuz0NU7Od3qM0rMSNbFk6pFZ\nEWrn7S+BoaNXnk0vsxBWx1yktznmTxFqAiYHtRj3AoGAHpKWPmng3itZ3Xsr2UXP\nTVYdulHGCCYpr9TecYsGb0MHsotbmHyQl9sn74relRTxJtkqz5PlmdCqZNDHDLko\nEl1VUM5kyLdhv0V3pADIpDmOAVkvjwg5YVCG7hodtbC7zdM8HULhtyt/sTJ5XbEK\nWJSed/k0HM+fZueJbFS0uZk=\n-----END PRIVATE KEY-----\n'
const CLIENT_EMAIL = process.env.CLIENT_EMAIL
const SHEET_ID = process.env.SHEET_ID;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
//process.env.NAME_VARIABLES
let getHomePage = (req, res) => {
    return res.render('homepage.ejs');
};

let postWebhook = (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

let getWebhook = (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

// Handles messages events
async function handleMessage(sender_psid, received_message) {

    let response;
    // Checks if the message contains text
    if (received_message.text) {
        let message = received_message.text;
        message = message.toLowerCase();
        let a;
        console.log(message);
        let config = require('../../font.json');
        let font = config;
        let arr = []
        let name;
        for (let i = 0; i < font.length; i++)
            arr[i] = font[i].key;
        console.log(arr);
        for (const element of arr) {
            if (message.indexOf(element) > -1) {
                a = 1;
                name = element;
                break;
            }
            a = -1;
        }
        if (a != -1) {
            await chatbotService.sendMessage(sender_psid, name);
            callSendAPI(sender_psid, response);
        } else if (message == 'bắt đầu' || message == 'start') {
            await chatbotService.handleGetStarted(sender_psid);
        } else {
            response = { "text": "Bot không hiểu chờ admin vào rep nha ^^ !" };
            callSendAPI(sender_psid, response);
        }

    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Bạn chắc chắc đây là ảnh của bạn chứ",
                        "subtitle": "Nhấn vào nút để trả lời",
                        "image_url": attachment_url,
                        "buttons": [{
                                "type": "postback",
                                "title": "Đúng!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "Không phải!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
        callSendAPI(sender_psid, response);
    }

    // Send the response message

}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;


    switch (payload) {
        case 'yes':
            response = { "text": "Thanks!" }
            callSendAPI(sender_psid, response);
            break;
        case 'no':
            response = { "text": "Oops, try sending another image." }
            callSendAPI(sender_psid, response);
            break;
        case 'GET_STARTED_PAYLOAD':
        case 'RESTART_BOT':
            await chatbotService.handleGetStarted(sender_psid);
            break;
        default:
            response = { "text": 'Xin lỗi tôi không hiểu' }
            callSendAPI(sender_psid, response);
    }
    // Send the message to acknowledge the postback

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
let setupProfile = async(req, res) => {
    //call profile facebook api
    // Construct the message body
    let request_body = {
            "get_started": {
                "payload": "GET_STARTED_PAYLOAD"
            },
            "whitelisted_domains": ["https://chatbot-nvn.herokuapp.com/"]
        }
        //
        // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body);
        if (!err) {
            console.log('Setup user profile succes')
        } else {
            console.error("Unable Setup user profile:" + err);
        }
    });

    return res.send("Set up thành công")

}
let setupPersistentMenu = async(req, res) => {
    //call profile facebook api
    // Construct the message body
    let request_body = {
            "persistent_menu": [{
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [{
                        "type": "web_url",
                        "title": "Xem Trang",
                        "url": "https://www.facebook.com/NVNFONT/",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "web_url",
                        "title": "Tham gia group",
                        "url": "https://www.facebook.com/groups/NVNFONT/",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Xem hướng dẫn sử dụng bot",
                        "payload": "BOT_TUTORIAL"
                    },
                    {
                        "type": "postback",
                        "title": "Xem giá Việt hóa",
                        "payload": "PRICE_SERVICE"
                    },
                    {
                        "type": "postback",
                        "title": "Khởi động lại bot",
                        "payload": "RESTART_BOT"
                    },

                ]
            }]
        }
        //
        // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body);
        if (!err) {
            console.log('Setup user profile succes')
        } else {
            console.error("Unable Setup user profile:" + err);
        }
    });

    return res.send("Set up thành công")
}
let getGoogleSheet = async(req, res) => {
    try {

        let currentDate = new Date();

        const format = "HH:mm DD/MM/YYYY"

        let formatedDate = moment(currentDate).format(format);

        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet(SHEET_ID);

        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth({
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        });
        await doc.loadInfo(); // loads document properties and worksheets
        const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const name = [];
        const key = [];
        const linkdownload = [];
        const linkimage = [];
        const rows = await sheet.getRows();
        for (const element of rows) {
            name.push(element.Name);
            key.push(element.Key.toLowerCase());
            linkdownload.push(element.linkDownload);
            linkimage.push(element.linkImage);
        }
        var listOfObjects = [];
        for (let i = 0; i < key.length; i++) {
            var singleObj = {}
            singleObj['id'] = i;
            singleObj['key'] = key[i];
            singleObj['name'] = name[i];
            singleObj['link'] = linkdownload[i];
            singleObj['img'] = linkimage[i];
            listOfObjects.push(singleObj);
        };
        const data = JSON.stringify(listOfObjects);
        var file = fs.createWriteStream('font.json');
        try {
            fs.writeFileSync('font.json', data);
            console.log("JSON data is saved.");
        } catch (error) {
            console.error(err);
        }
        res.redirect('/');
        return console.log('ok');
    } catch (e) {
        console.log(e);
        return res.send('Oops! Something wrongs, check logs console for detail ... ')
    }
}


module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,
    getGoogleSheet: getGoogleSheet,
}