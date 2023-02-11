"use strict";

import { tr } from "./locale.js";

// import * as req from './req.js';

export {
  input_msg,
  input_username, input_room, btn_join,
  chat_kludge,
  player,
  cbox_sync,
  input_url, input_file, btn_load_video,
  subs_en, subs_ru,
  select_subs,
  chat_message, pseudo_message,
  dom_parser, parse_html,
};


// Initialize
let input_msg = /** @type {HTMLInputElement} */
  (document.getElementById("input_msg"));

let input_username = /** @type {HTMLInputElement} */
  (document.getElementById("input_username"));

let input_room = /** @type {HTMLInputElement} */
  (document.getElementById("input_room"));

let btn_join = /** @type {HTMLButtonElement} */
  (document.getElementById("btn_join"));

let chat_kludge = /** @type {HTMLDivElement} */
  (document.getElementById("chat_kludge"));

let player = /** @type {HTMLVideoElement} */
  (document.getElementById("player"));

let cbox_sync = /** @type {HTMLInputElement} */
  (document.getElementById("cbox_sync"));

let btn_load_video = /** @type {HTMLButtonElement} */
  (document.getElementById("btn_load_video"));

let input_url = /** @type {HTMLInputElement} */
  (document.getElementById("input_url"));

let input_file = /** @type {HTMLInputElement} */
  (document.getElementById("input_file"));

let subs_en = /** @type {HTMLTrackElement} */
  (document.getElementById("subs_en"));

let subs_ru = /** @type {HTMLTrackElement} */
  (document.getElementById("subs_ru"));

let select_subs = /** @type {HTMLSelectElement} */
  (document.getElementById("select_subs"));

// let cbox_bump = /** @type {HTMLInputElement} */
//     (document.getElementById("cbox_bump"));



/**
 * @param {string} author
 * @param {string} time
 * @param {string} content
 */
function chat_message(author, time, content) {
  // let time_at = tr.time_at = "@";
  return `
    <div class="msg">
    <div class="header">${author} @ ${time}</div>
    <div class="content">${content}</div>
    </div>
    `;
}


/**
 * @param {string} author
 * @param {string} time
 * @param {string} content
 */
function pseudo_message(author, time, content) {
  // let time_at = tr.time_at = "@";
  return `
    <div class="msg pseudo">
    <div class="header">${author} @ ${time}</div>
    <div class="content">${content}</div>
    </div>
    `;
}


const dom_parser = new DOMParser();


/**
 * @param {string} html
 * @returns {Node?}
 */
function parse_html(html) {
  return dom_parser.parseFromString(html, "text/html").body.firstChild;
}

