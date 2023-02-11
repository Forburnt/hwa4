"use strict";

import * as req from './req.js';
import * as ws from './ws.js';
import { tr } from './locale.js';
import * as elems from './elems.js';
import { add_new_messages } from "./chat.js";
import { auth } from "./room.js";
import { update_player } from "./player.js";

/** @typedef {import("./chat.js").Msg} Msg */

/** @typedef {import("./player.js").PlayerStatus} PlayerStatus */


export {
    start_update_loop, stop_update_loop,
}



const INTERVAL_TIMEOUT = 1000;



// /** @type {number?} */
/** @type {NodeJS.Timer?} */
var update_loop_handle = null;



function start_update_loop() {
    console.log("Starting update loop...");
    update_loop_handle = setInterval(request_update, INTERVAL_TIMEOUT);
}


function stop_update_loop() {
    console.log("Stopping update loop...");
    if (update_loop_handle !== null) {
        clearInterval(update_loop_handle);
        update_loop_handle = null;
    }
}



function request_update() {
    if (auth.room == "" || auth.username == "") {
        console.log("No auth information! Stopping update loop...")
        stop_update_loop();
    }
    ws.send("update", {
        room_id: auth.room,
        username: auth.username,
    });
    // req.post("update", {
    //     room_id: auth.room,
    //     username: auth.username,
    // }).then(handle_update_reply);
}

ws.receive("update", handle_update_reply);





/**
 * @typedef {{
 *     is_connected: boolean,
 *     updated_at: Date,
 *     new_msgs: Msg[],
 *     player_status: PlayerStatus,
 * }} UpdateReply
 */


/**
 * @param {UpdateReply} reply
 */
function handle_update_reply(reply) {
    // console.log(reply);
    if (!reply["success"]) return;
    if (!reply.is_connected) return;
    add_new_messages(reply.new_msgs);
    update_player(reply.player_status);
}





