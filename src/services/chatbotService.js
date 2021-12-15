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

    if (name == 'vintage') {
        nameFont = 'Park tổng hợp Font Việt hóa theo style Vintage';
        linkFont = 'https://tinyurl.com/NVNVintAge';
        imageFont = 'https://scontent.fhan3-4.fna.fbcdn.net/v/t1.15752-9/s960x960/248435284_555706965526892_5202570491916652285_n.jpg?_nc_cat=104&ccb=1-5&_nc_sid=ae9488&_nc_ohc=eUsk9EdAgwkAX-wWLMP&_nc_ht=scontent.fhan3-4.fna&oh=03_AVL15oOhDbdrG2XUUOT9AUwtYJ245LMwJ5ctu-GziJcdKA&oe=61DF9468';
    }
    if (name == 'parka') {
        nameFont = 'NVN Parka';
        linkFont = 'https://by.com.vn/NVNParka-Dl';
        imageFont = 'https://scontent.fhan3-3.fna.fbcdn.net/v/t1.15752-9/p180x540/261763414_1211473426012223_1071923516214947637_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=ae9488&_nc_ohc=osBCyJCwRJsAX-pzVwy&_nc_ht=scontent.fhan3-3.fna&oh=03_AVJ2zWI78rqzaIsy-ounDpkR_rAdcVLBRdnqVB-y1jXAKw&oe=61DE9B30';

    }
    if (name == 'funky') {
        nameFont = 'NVN Funky Signture';
        linkFont = 'https://by.com.vn/NVN-Funky';
        imageFont = 'https://scontent.fhph1-1.fna.fbcdn.net/v/t1.15752-9/261793210_1537719816584241_5028259824830068449_n.jpg?_nc_cat=110&ccb=1-5&_nc_sid=58c789&_nc_ohc=MFwKTebchtsAX-v2ZW7&_nc_oc=AQk0m9gUYq9JqgpG3GET48ZpDEHzE29W3_cxIA3p2maZFkhlrGn7KgCblEkHWgHSmCA&_nc_ht=scontent.fhph1-1.fna&oh=1bf94b295345726eb333cb3ee577b000&oe=61CE61A9';
    }
    if (name == 'hillstown') {
        nameFont = 'NVN Funky Hillstown';
        linkFont = 'https://by.com.vn/NVNHillstown';
        imageFont = 'https://scontent.fhph1-2.fna.fbcdn.net/v/t1.15752-9/254004882_577743266617015_7572437153716210192_n.png?_nc_cat=101&ccb=1-5&_nc_sid=58c789&_nc_ohc=5nNeIVnd9yoAX_9VJiq&_nc_ht=scontent.fhph1-2.fna&oh=edece631d9210f619d4df23b559df8e9&oe=61CF1CB7';
    }
    if (name == 'excellent') {
        nameFont = 'NVN Excellent Display';
        linkFont = 'https://by.com.vn/NVN-Excellent';
        imageFont = 'https://scontent.fhph1-3.fna.fbcdn.net/v/t1.15752-9/262281572_275736067847585_7660979964445610325_n.jpg?_nc_cat=107&ccb=1-5&_nc_sid=58c789&_nc_ohc=HUxacpwymzwAX__PCob&_nc_ht=scontent.fhph1-3.fna&oh=543f5a8ecae3f84b8ead68357de197ac&oe=61D0F310';
    }
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