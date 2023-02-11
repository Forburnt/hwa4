"use strict";

import * as req from './req.js';
import { tr } from './locale.js';
import * as elems from './elems.js';
import { start_update_loop, stop_update_loop } from "./update_loop.js";
import * as chat from "./chat.js";

export {
    auth,
    ui_join, ui_leave,
    BtnJoinStates, btn_join_state,
}


var auth = {
    username: "",
    room: "",
    joined: false,
};



elems.btn_join.addEventListener("click", ui_join);



function ui_join() {
    if (btn_join_state != BtnJoinStates.normal) {
        return ui_leave();
    }
    set_btn_join_state(BtnJoinStates.pending);
    let room_id = elems.input_room.value;
    let username = elems.input_username.value;
    chat.log(`Joining room ${room_id} as ${username}...`);
    req.post("join_room", {
        room_id: room_id,
        username: username,
    }).then(reply => {
        console.log(reply);
        if (reply.success) {
            connect(reply.room_id, reply.username);
        } else {
            alert(reply.msg);
            disconnect();
        }
    });
    // }).then(reply => alert(JSON.stringify(reply)));
}


function ui_leave() {
    disconnect();
    req.post("leave_room", {
        room_id: elems.input_room.value,
        username: elems.input_username.value,
    }).then(reply => {
        console.log(reply);
    });
}


/** @typedef {string} BtnJoinState */
// const BtnJoinStates = string_enum("normal", "pending", "joined");
const BtnJoinStates = {
    "normal": "normal",
    "pending": "pending",
    "joined": "joined",
}

/** @type {BtnJoinState} */
var btn_join_state = BtnJoinStates.normal;

/**
 * @param {BtnJoinState} state
 */
function set_btn_join_state(state) {
    switch (state) {
        case "normal":
            elems.input_username.disabled = false;
            elems.input_room.disabled = false;
            elems.btn_join.disabled = false;
            elems.btn_join.textContent = tr.join;
            btn_join_state = state;
            break;
        case "pending":
            elems.input_username.disabled = true;
            elems.input_room.disabled = true;
            elems.btn_join.disabled = true;
            elems.btn_join.textContent = tr.leave;
            btn_join_state = state;
            break;
        case "joined":
            elems.input_username.disabled = true;
            elems.input_room.disabled = true;
            elems.btn_join.disabled = false;
            elems.btn_join.textContent = tr.leave;
            btn_join_state = state;
            break;
    }
}



/**
 * @param {string} room
 * @param {string} username
 */
function connect(room, username) {
    auth.room = room;
    auth.username = username;
    auth.joined = true;
    start_update_loop();

    elems.input_room.value = auth.room;
    elems.input_username.value = auth.username;
    set_btn_join_state(BtnJoinStates.joined);

    chat.log(`Connected to ${room} as ${username}!`);
}



function disconnect() {
    let room = auth.room;

    stop_update_loop();
    auth.room = "";
    auth.username = "";
    auth.joined = false;

    set_btn_join_state(BtnJoinStates.normal);

    if (room) {
        chat.log(`Disconnected from ${room}!`);
    }
}

