import request from "request";
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let handleGetStarted = (sender_psid) => {
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response = { "text": `Chào ${username} tôi là NVN` }
            await callSendAPI(sender_psid, response);
            let response = {
                "text": "Tôi có thể giúp gì cho bạn nhỉ ?:",
                "quick_replies": [{
                    "content_type": "text",
                    "title": "Xem hướng dẫ",
                    "payload": "BOT_TUTORIAL",
                    "image_url": "http://example.com/img/red.png"
                }, {
                    "content_type": "text",
                    "title": "Green",
                    "payload": "PRICE_SERVICE",
                    "image_url": "http://example.com/img/green.png"
                }]


            }
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
let sendTextMessage = (sender_psid, name) => {
    let config = require('../../data.json');
    var item = config.find(item => item.key === name);
    console.log(item);
    let respon = item['respone'];
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response = { "text": respon }
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

let stripAccents = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
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
    sendMessage: sendMessage,
    stripAccents: stripAccents,
    sendTextMessage: sendTextMessage,
}