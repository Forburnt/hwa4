"use strict";

import * as req from './req.js';
import * as ws from './ws.js';
import { tr } from './locale.js';
import * as elems from './elems.js';
import { auth } from "./room.js";

export {
    add_message, add_system_message, log, add_new_messages,
}



elems.input_msg.addEventListener("keyup", input_msg_onkeyup);



/** @param {KeyboardEvent} event */
function input_msg_onkeyup(event) {
    if (event.code === "Enter") {
        ui_chat();
    }
}


function ui_chat() {
    if (!auth.joined) {
        alert("Please join a room first!");
        return;
    }
    let input = elems.input_msg.value;
    elems.input_msg.value = "";
    input = input.trim();
    ws.send("send_msg", {
        room_id: auth.room,
        username: auth.username,
        content: input,
    });
    // req.post("send_msg", {
    //     room_id: auth.room,
    //     username: auth.username,
    //     content: input,
    // }).then(reply => {
    //     if (!reply.success) {
    //         console.log(reply);
    //     }
    // });
}

ws.receive("send_msg", reply => {
    if (!reply.success) {
        console.log(reply);
    }
})


/** @typedef {{created_at: Date, author: string, content: string}} Msg */

/**
 * @param {Msg} msg
 */
function add_message(msg, pseudo = false) {
    let d = new Date(msg.created_at);
    let time = d.toISOString().split('T')[1].split('.')[0];
    // let time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    let template = pseudo ? elems.pseudo_message : elems.chat_message;
    let msg_html = template(msg.author, time, msg.content);
    let msg_elem = elems.parse_html(msg_html);
    if (msg_elem == null) {
        console.error(`${msg_elem} couldn't be inserted into chat!`);
        return;
    }
    elems.chat_kludge.append(msg_elem);
    // @ts-ignore
    msg_elem.scrollIntoView();
}


/**
 * @param {string} content
 * @param {string} author
 * @param {Date?} created_at
 */
function add_system_message(content, author="[Client]", created_at=null) {
    return add_message({
        created_at: created_at ?? new Date(),
        author: author,
        content: content,
    });
}


/**
 * @param {string} content
 * @param {string} author
 * @param {Date?} created_at
 */
function log(content, author="[Client]", created_at=null) {
    created_at = created_at ?? new Date();
    console.log(author, created_at, content);
    return add_system_message(content, author, created_at);
}



/**
 * @param {Msg[]} msgs
 */
function add_new_messages(msgs) {
    msgs.forEach(msg => add_message(msg));
}

/*
return {
    created_at: this.created_at,
    author: this.author.raw(),
    content: this.content,
}
*/

