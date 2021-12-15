require('dotenv').config();
import request from "request";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
import chatbotService from '../services/chatbotService';
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
function handleMessage(sender_psid, received_message) {

    let response;

    // Checks if the message contains text
    if (received_message.text) {
        if (received_message.text = 'NVN') {
            let titile = `Link font tổng hợp NVN`;
            let subtitle = `Chào Nguyễn Văn Nam  !
            Đây là tổng hợp các font việt hóa của NVN
            Link tải xuống: https://tinyurl.com/NVNVintAge
            Hoặc nhấn vào nút "Tải Xuống".
            Vui lòng không rep tin nhắn này. 
            Nếu rep tn này bot sẽ tự động block đó nhé
            #NVNFONT `
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{

                            "image_url": 'https://scontent.fhan3-3.fna.fbcdn.net/v/t1.15752-9/p180x540/261763414_1211473426012223_1071923516214947637_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=ae9488&_nc_ohc=osBCyJCwRJsAX-Vg6mD&_nc_ht=scontent.fhan3-3.fna&oh=03_AVLJi0FaUKXn8HM7-sDDV5d7duTp5dWZP0QSAuzVaLGKHA&oe=61DE9B30',
                            "buttons": [{
                                    "type": "postback",
                                    "title": "Yes!",
                                    "payload": "yes",
                                },
                                {
                                    "type": "postback",
                                    "title": "No!",
                                    "payload": "no",
                                }
                            ],
                        }]
                    }
                }
            }
        }

    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "carousel",
                "padding": 10,
                "elements": [{
                        "type": "vertical",
                        "tag": "generic",
                        "elements": [{
                            "type": "vertical",
                            "elements": [{
                                "type": "image",
                                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ_w8UO-QDbk2S2ZLuiuePHB7j6Qb86DLsjwddhp_yq4WaL_LL",
                                "tooltip": "Flowers"
                            }, {
                                "type": "text",
                                "tag": "title",
                                "text": "Title",
                                "tooltip": "Title"
                            }, {
                                "type": "text",
                                "tag": "subtitle",
                                "text": "subtitle",
                                "tooltip": "subtitle"
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "publishText",
                                        "text": "Add to cart pressed"
                                    }]
                                }
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "link",
                                        "name": "Flowers",
                                        "uri": "https://www.pinterest.com/lyndawhite/beautiful-flowers/"
                                    }]
                                }
                            }]
                        }]
                    },
                    {
                        "type": "vertical",
                        "tag": "generic",
                        "elements": [{
                            "type": "vertical",
                            "elements": [{
                                "type": "image",
                                "url": "https://i.pinimg.com/736x/cf/05/dc/cf05dc6becf9d387707597a788250a1c--blue-bridal-bouquets-bridal-flowers.jpg",
                                "tooltip": "Flowers"
                            }, {
                                "type": "text",
                                "tag": "title",
                                "text": "Title",
                                "tooltip": "Title"
                            }, {
                                "type": "text",
                                "tag": "subtitle",
                                "text": "subtitle",
                                "tooltip": "subtitle"
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "publishText",
                                        "text": "Add to cart pressed"
                                    }]
                                }
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "link",
                                        "name": "Flowers",
                                        "uri": "https://www.pinterest.com/lyndawhite/beautiful-flowers/"
                                    }]
                                }
                            }]
                        }]
                    },
                    {
                        "type": "vertical",
                        "tag": "generic",
                        "elements": [{
                            "type": "vertical",
                            "elements": [{
                                "type": "image",
                                "url": "https://i.pinimg.com/736x/27/9a/d7/279ad7bfd3fe7ee87638a5ce064d25a5---year-old-girl-cut-flowers.jpg",
                                "tooltip": "Flowers"
                            }, {
                                "type": "text",
                                "tag": "title",
                                "text": "Title",
                                "tooltip": "Title"
                            }, {
                                "type": "text",
                                "tag": "subtitle",
                                "text": "subtitle",
                                "tooltip": "subtitle"
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "publishText",
                                        "text": "Add to cart pressed"
                                    }]
                                }
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "link",
                                        "name": "Flowers",
                                        "uri": "https://www.pinterest.com/lyndawhite/beautiful-flowers/"
                                    }]
                                }
                            }]
                        }]
                    },
                    {
                        "type": "vertical",
                        "tag": "generic",
                        "elements": [{
                            "type": "vertical",
                            "elements": [{
                                "type": "image",
                                "url": "https://i.pinimg.com/736x/06/dc/b3/06dcb32c02c30a035b189ad267674f1c--pink-bouquet-floral-bouquets.jpg",
                                "tooltip": "Flowers"
                            }, {
                                "type": "text",
                                "tag": "title",
                                "text": "Title",
                                "tooltip": "Title"
                            }, {
                                "type": "text",
                                "tag": "subtitle",
                                "text": "subtitle",
                                "tooltip": "subtitle"
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "publishText",
                                        "text": "Add to cart pressed"
                                    }]
                                }
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "link",
                                        "name": "Flowers",
                                        "uri": "https://www.pinterest.com/lyndawhite/beautiful-flowers/"
                                    }]
                                }
                            }]
                        }]
                    },
                    {
                        "type": "vertical",
                        "tag": "generic",
                        "elements": [{
                            "type": "vertical",
                            "elements": [{
                                "type": "image",
                                "url": "https://i.pinimg.com/736x/a8/28/26/a8282621d4fe30717de5fab28975b7a3--pink-peonies-pink-flowers.jpg",
                                "tooltip": "Flowers"
                            }, {
                                "type": "text",
                                "tag": "title",
                                "text": "Title",
                                "tooltip": "Title"
                            }, {
                                "type": "text",
                                "tag": "subtitle",
                                "text": "subtitle",
                                "tooltip": "subtitle"
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "publishText",
                                        "text": "Add to cart pressed"
                                    }]
                                }
                            }, {
                                "type": "button",
                                "tooltip": "Add to cart",
                                "title": "Add to cart",
                                "click": {
                                    "actions": [{
                                        "type": "link",
                                        "name": "Flowers",
                                        "uri": "https://www.pinterest.com/lyndawhite/beautiful-flowers/"
                                    }]
                                }
                            }]
                        }]
                    }
                ]
            }
        }
    }

    // Send the response message
    callSendAPI(sender_psid, response);
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
            await chatbotService.handleGetStarted(sender_psid);
            callSendAPI(sender_psid, response);
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
module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile


}