import request from "request";
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let handleGetStarted = () => {
    return Promise(async(reslove, reject) => {
        try {
            let response = { "text": "Chào bạn tôi là NVN" }
            await this.callSendAPI(response);
            reslove('done');
        } catch (e) {
            reject(e);
        }
    });

}
let callSendAPI = () => {
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
module.exports = {
    handleGetStarted: handleGetStarted,
    callSendAPI: callSendAPI
}