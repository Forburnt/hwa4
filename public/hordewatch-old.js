"use strict";

import * as req from './req.js';


/** @type {Object} */
var tr;
req.get("get_tr", {}).then(reply => {
    tr = reply;
});


// Initialize
let input_msg = /** @type {HTMLInputElement} */
    (document.getElementById("input_msg"));
input_msg.addEventListener("keyup", input_msg_onkeyup);

let input_username = /** @type {HTMLInputElement} */
    (document.getElementById("input_username"));

let input_room = /** @type {HTMLInputElement} */
    (document.getElementById("input_room"));

let btn_join = /** @type {HTMLButtonElement} */
    (document.getElementById("btn_join"));
btn_join.addEventListener("click", ui_join);



/** @param {KeyboardEvent} event */
function input_msg_onkeyup(event) {
    if (event.code === "Enter") {
        let input = input_msg.value;
        // just sanitize input on the server, I suppose
        input = input.trim();
        req.post("allo", {
            sanitize_this_pls: input,
        }).then(data => console.log(JSON.stringify(data)));
    }
}


function ui_chat() {
    alert("chat");
}


function ui_join() {
    if (btn_join_state == BtnJoinStates.joined) {
        return ui_leave();
    }
    set_btn_join_state(BtnJoinStates.pending);
    req.post("join_room", {
        room_id: input_room.value,
        username: input_username.value,
    }).then(reply => {
        if (reply.success) {
            input_room.value = reply.room_id;
            input_username.value = reply.username;
            set_btn_join_state(BtnJoinStates.joined);
        }
        else {
            alert(reply.msg);
            set_btn_join_state(BtnJoinStates.normal);
        }
    });
    // }).then(reply => alert(JSON.stringify(reply)));
}


function ui_leave() {
    
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
            input_username.disabled = false;
            input_room.disabled = false;
            btn_join.disabled = false;
            btn_join.textContent = tr.join;
            btn_join_state = state;
            break;
        case "pending":
            input_username.disabled = true;
            input_room.disabled = true;
            btn_join.disabled = true;
            btn_join.textContent = tr.leave;
            btn_join_state = state;
            break;
        case "joined":
            input_username.disabled = true;
            input_room.disabled = true;
            btn_join.disabled = false;
            btn_join.textContent = tr.leave;
            btn_join_state = state;
            break;
    }
}


// /**
//  * @param {string[]} fields
//  * @returns {Object<string, string>}
//  */
// function string_enum(...fields) {
//     /** @type {Object<string, string>} */
//     let enum1 = {};
//     let a = "asds";
//     fields.forEach(key => {
//         enum1[key] = key;
//     })
//     return enum1;
// }

