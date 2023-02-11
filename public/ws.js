"use strict";

// import * as req from './req.js';
// import { tr } from './locale.js';
// import * as elems from './elems.js';
// import { add_new_messages } from "./chat.js";
// import { auth } from "./room.js";
// import { update_player } from "./player.js";

export {
    send, receive,
}


let socket_protocol = document.location.protocol == "https:" ? "wss:" : "ws:";
let socket_url = `${socket_protocol}//${location.host}/ws`;
let socket = new WebSocket(socket_url);

/** @typedef {(data: any) => any} WSHandler */
/** @typedef {{path: String, data: any}} WSReply */

/** @type {Object.<string, WSHandler[]>} */
let receivers = {};

socket.addEventListener('open', event => {
    console.log("WebSocket opened.")
    send("hello", "Hello, server!");
    receive("hello", hello => {
        console.log(`Server greets: ${hello}`);
    });
})

socket.addEventListener('message', event => {
    /** @type {WSReply} */
    let reply = JSON.parse(event.data);
    receivers[reply.path].forEach(handler => handler(reply.data));
})

socket.addEventListener('error', l => {
    console.log(`WebSocket error: ${JSON.stringify(l)}`);
})


/**
 * @param {String} path
 * @param {any} data
 */
function send(path, data) {
    socket.send(JSON.stringify({
        path: path,
        data: data,
    }));
}


/**
 * @param {String} path
 * @param {WSHandler} handler
 */
function receive(path, handler) {
    if (!receivers[path]) {
        receivers[path] = [];
    }
    receivers[path].push(handler);
}


// /**
//  * @param {String} path
//  * @param {any} data
//  * @param {WSHandler} handler
//  */
// function req(path, data, handler) {
//     send(path, data);
//     receive(path, handler);
// }