import request from "request";
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let handleGetStarted = (sender_psid) => {
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response = { "text": `Chào ${username} tôi là NVN` }
            await callSendAPI(sender_psid, response);
            reslove('done');
        } catch (e) {
            reject(e);
        }
    });

}
let sendTyping = (sender_psid) => {
    let request_body = {
            "recipient": {
                "id": sender_psid
            },
            "sender_action": "typing_on"
        }
        // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v9.0/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('sendTyping Ok')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
let sendReadMessage = (sender_psid) => {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "mark_seen"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v9.0/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('sendTyping Ok')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
let sendMessage = (sender_psid, name) => {
    let nameFont, linkFont, imageFont;
    let config = require('../../font.json');
    var item = config.find(item => item.key === name);
    console.log(item);
    nameFont = item['name'];
    linkFont = item['link'];
    imageFont = item['img'];
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response2 = {
                "attachment": {
                    "type": "image",
                    "payload": {

                        "url": imageFont,
                        "is_reusable": true
                    }
                }

            }
            await callSendAPI(sender_psid, response2);
            let message = `Chào ${username}\nTôi đã nhận được yêu cầu từ bạn\nTên font: ${nameFont}\nLink download: ${linkFont}\nVui lòng không phản hồi lại tin nhắn này\n#NVNFONT`
            let response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": message,
                        "buttons": [{
                            "type": "web_url",
                            "url": linkFont,
                            "title": "Tải xuống"
                        }, ]
                    }
                }
            }
            await callSendAPI(sender_psid, response);
            reslove('done');
        } catch (e) {
            reject(e);
        }
    });
}

let callSendAPI = async(sender_psid, response) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }
    await sendTyping(sender_psid);
    await sendReadMessage(sender_psid);

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v9.0/me/messages",
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


let getUserName = async(sender_psid) => {
    return new Promise((reslove, reject) => {
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
            "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                body = JSON.parse(body);
                let username = `${body.name}`;
                reslove(username)
            } else {
                console.error("Unable to send message:" + err);
                reject(err);
            }
        });
    });
}
module.exports = {
    handleGetStarted: handleGetStarted,
    callSendAPI: callSendAPI,
    sendMessage: sendMessage
}