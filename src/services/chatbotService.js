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
let sendMessage = (sender_psid) => {
    return new Promise(async(reslove, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let message = `Chào ${username}\nTôi đã nhận được yêu cầu từ bạn\nTên font: NVN Suýt nữa thì\nLink download: https://tinyurl.com/NVNVintAge\nVui lòng không phản hồi lại tin nhắn này\n#NVNFONT`
            let response = { "text": message }
            await callSendAPI(sender_psid, response);
            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "media",
                        "elements": [{
                            "media_type": "image",
                            "url": "https://scontent.xx.fbcdn.net/v/t1.15752-9/s320x320/248435284_555706965526892_5202570491916652285_n.jpg?_nc_cat=104&ccb=1-5&_nc_sid=58c789&_nc_ohc=eUsk9EdAgwkAX9kuo1l&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AVICnvTT1xmXuEBxAUfdLXSd318mLMHZ8TH_Qk8JUNzzDA&oe=61DFEA3C"
                        }]
                    }
                }
            }
            await callSendAPI(sender_psid, response2);
            reslove('done');
        } catch (e) {
            reject(e);
        }
    });
}

let callSendAPI = (sender_psid, response) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

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