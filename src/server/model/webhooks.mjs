import * as req from "./req.mjs";


export {
    send_msg,
    wh1, charlotte,
    wh_default,
}


const wh1 = "https://discord.com/api/webhooks/1053731991150923806/YBhbrqcXrbgdJJjt0QU3JeuFOOk8Frp5SPN9uvCaRIvLzCM9TKzt4Ik1Rh-lLOElmM3g";
const charlotte = "https://discord.com/api/webhooks/1053744804141469768/Jo6wIUiZgfr1E4WlcljRP6aWzhPwCjoQE3eU9XNVMEjuZKNg6vo6x3x3Gyhh-_uiGQbh";

const wh_default = wh1;



let headers = {
    'Content-Type': 'application/json',
};

/**
 * @param {string} webhook
 * @param {string} content
 * @param {string} author
 */
function send_msg(webhook, content, author) {
    // console.log(`sending webhook...`);
    let params = {
        content: content,
        username: author,
    };
    req.post_raw(webhook, params, headers).then(reply => {
        
    });
}


