"use strict";

import * as req from './req.js';
import * as ws from './ws.js';
import { tr } from './locale.js';
import * as elems from './elems.js';
import { auth } from "./room.js";
import { log } from "./chat.js";

export {
    update_player,
}

/**
 * @typedef {{
 *     is_playing: boolean,
 *     time: number,
 *     updated_at: string,
 *     author: string,
 * }} PlayerStatus
 */


// TODO: add `id` and `author` fields to PlayerStatus
// kinda already did the second one
// maybe i should update the comment then? nah...



var should_sync = true;

var server_playing = false;
var server_time = 0.0;
var server_bumped_at = new Date(Date.now() - 360_000);

var manual_time = 0.0;

var server_updated_at = new Date(Date.now() - 360_000);
var manually_updated_at = new Date(Date.now() - 360_000);

var server_seeking = false;



elems.cbox_sync.addEventListener("change", on_cbox_sync_changed);
elems.player.addEventListener("play", on_player_play);
elems.player.addEventListener("pause", on_player_pause);
elems.player.addEventListener("seeked", on_player_seeked);

elems.btn_load_video.addEventListener("click", load_video);
elems.input_file.addEventListener("change", load_video_file);




function on_cbox_sync_changed() {
    should_sync = elems.cbox_sync.checked;
}


function on_player_play() {
    console.log(`on play ${elems.player.currentTime}`)
    // if (!should_sync) return;
    if (!server_playing) {
        // doesn't match the server bump, assume to be an action from user
        request_send();
    }
}


function on_player_pause() {
    console.log(`on pause ${elems.player.currentTime}`)
    // if (!should_sync) return;
    if (server_playing) {
        // doesn't match the server bump, assume to be an action from user
        request_send();
    }
}


function on_player_seeked() {
    console.log(`on seeked ${elems.player.currentTime}`)
    // if (!should_sync) return;
    if (!server_seeking) {
        // was not because of a server bump, assume to be an action from user
        request_send();
    } else {
        server_seeking = false;
    }
}



function request_send() {
    // recognize we updated manually since last bump from server
    manually_updated_at = new Date();
    manual_time = elems.player.currentTime;

    if (!should_sync) {
        return;
    }

    if (!auth.joined) {
        // alert("Please join a room first!");
        return;
    }

    let is_playing = !elems.player.paused;
    let time = elems.player.currentTime;

    ws.send("set_player_status", {
        room_id: auth.room,
        username: auth.username,
        is_playing: is_playing,
        time: time,
        sent_at: new Date(),
    });
    // req.post("set_player_status", {
    //     room_id: auth.room,
    //     username: auth.username,
    //     is_playing: is_playing,
    //     time: time,
    //     sent_at: new Date(),
    // }).then(reply => {
    //     console.log(reply);
    //     // if (!reply.success) {
    //     //     console.log(reply);
    //     // }
    // });
}

ws.receive("set_player_status", reply => console.log(reply));



/**
 * 
 * @param {PlayerStatus?} status 
 */
 function update_player(status=null) {
    if (!status) {
        console.log(`Provided null status to update_player!`);
        return;
    }

    let new_server_bumped_at = new Date(status.updated_at);
    if (new_server_bumped_at <= server_bumped_at) {
        // outdated bump, already got newer
        return;
    }

    console.log("Attempting to update player status to", status, {
        server_bumped_at,
        new_server_bumped_at,
        server_updated_at,
        manually_updated_at,
    });
    server_playing = status.is_playing;
    server_time = status.time;
    server_bumped_at = new_server_bumped_at;
    // server_updated_at = status.updated_at;

    if (!should_sync) {
        // cbox_sync unchecked
        return;
    }

    let last_server_updated_at = server_updated_at;
    server_updated_at = new Date();

    if (status.author == auth.username) {
        // ignore bumps from self
        return;
    }

    if (manually_updated_at >= server_bumped_at
        || last_server_updated_at >= server_bumped_at)
    {
        // already moved the player since the last bump from server
        server_updated_at = new Date();
        return;
    }

    // // recognize we have updated in response to a bump from server
    // server_updated_at = new Date();

    // if (elems.player.currentTime != server_time) {
    if (significant_time_diff(manual_time, server_time)
        || last_server_updated_at > manually_updated_at
        && significant_time_diff(elems.player.currentTime, server_time))
    {
        console.log(`Seeking bumped time ${server_time}`);
        server_seeking = true;
        elems.player.currentTime = server_time;
    }

    if (server_playing && elems.player.paused) {
        console.log(`Playing because of a server bump.`);
        elems.player.play();
    }
    else if (!server_playing && !elems.player.paused) {
        console.log(`Pausing because of a server bump.`);
        elems.player.pause();
    }
}


/**
 * @param {number} x
 * @param {number} y
 */
function significant_time_diff(x, y) {
    const MIN_SIGNIFICANT_DIFF = 0.1;
    return Math.abs(x - y) >= MIN_SIGNIFICANT_DIFF;
}



function load_video() {
    let url = elems.input_url.value;
    log(`Fetching url <mono>${url}</mono>...`);
    elems.player.src = url;
}


function load_video_file() {
    let files = elems.input_file.files;
    if (!files) return;
    let file = files[0];
    let blob = URL.createObjectURL(file);
    // verify blob type
    elems.input_url.value = blob;
    // load_video();
}

