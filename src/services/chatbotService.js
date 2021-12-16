import request from "request";
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let handleGetStarted = (sender_psid) => {
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response = { "text": `Chào ${username} tôi là NVN` }
            let response2 = getImageGetStarted();
            let response3 = getStartedQuickReplyTemplate();
            await callSendAPI(sender_psid, response);
            await callSendAPI(sender_psid, response2);
            await callSendAPI(sender_psid, response3);
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
    let nameFont, linkFont, imageFont, messagebody;
    let config = require('../../font.json');
    var item = config.find(item => item.key === name);
    console.log(item);
    messagebody = item['msg'].trim();
    nameFont = item['name'].trim();
    linkFont = item['link'].trim();
    imageFont = item['img'].trim();
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            if (imageFont != null && imageFont != '') {
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
            }
            let message = `Chào ${username}\nTôi đã nhận được yêu cầu từ bạn\nTên font: ${nameFont}\nLink download: ${linkFont}\n${messagebody}\n#NVNFONT`
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
    return new Promise(async(reslove, reject) => {
        try {
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
                    reslove('message sent!')
                } else {
                    console.error("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    })

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
let getFontSupport = () => {
    let dataFont = '';
    let config = require('../../font.json');
    let arr = [];
    for (let i = 0; i < config.length; i++) {
        if (!arr.includes(config[i].name)) {
            arr.push(config[i].name);
        }
    }
    for (const element of arr) {
        dataFont += element + '\n';
    }
    return dataFont;
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
let getStartedQuickReplyTemplate = () => {
    let respone = {
        "text": "Bạn cần tôi giúp gì không nhỉ?",
        "quick_replies": [{
                "content_type": "text",
                "title": "HD Sử dụng",
                "payload": "BOT_TUTORIAL"
            },
            {
                "content_type": "text",
                "title": "List Font hỗ trợ",
                "payload": "LIST_FONT"
            }, {
                "content_type": "text",
                "title": "Giá Việt hóa",
                "payload": "PRICE_SERVICE"
            }
        ]
    }
    return respone;

}
let getArraydatafromJson = (file) => {
    let config = require(`../../${file}.json`);
    let arr = [];
    for (let i = 0; i < config.length; i++) {
        arr.push(config[i].key);
    }
    return arr;
}
let getImageGetStarted = () => {
    let respone = {
        "attachment": {
            "type": "image",
            "payload": {

                "url": 'https://bit.ly/3sakE56',
                "is_reusable": true
            }
        }
    }
    return respone;

}
module.exports = {
    handleGetStarted: handleGetStarted,
    callSendAPI: callSendAPI,
    sendMessage: sendMessage,
    stripAccents: stripAccents,
    sendTextMessage: sendTextMessage,
    getFontSupport: getFontSupport,
    getArraydatafromJson: getArraydatafromJson,
}