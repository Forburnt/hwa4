/** @module player */
"use strict";

import * as fb from "../fb.mjs";
import { IdentMember } from "./members.mjs";
import { UpdateTimer } from "./update_timer.mjs";
// import { IdentName } from "./ident_name.mjs";


export {
    Player, PlayerStatus,
}



class Player {
    /** @type {!boolean} */
    is_playing;
    /** @type {!number} */
    time;
    /** @type {!number} */
    length;
    /** @type {UpdateTimer} */
    update_timer;
    /** @type {IdentMember?} */
    last_update_by;


    /**
     * @param {!boolean} is_playing
     * @param {!number} time
     * @param {!number} length
     */
    constructor(is_playing = false, time = 0.0, length = 0.0) {
        fb.assert(is_playing != null && time != null);
        this.is_playing = is_playing;
        this.time = time;
        this.length = length;
        this.update_timer = new UpdateTimer();
        this.last_update_by = null;
    }


    /**
     * @param {boolean} is_playing
     * @param {number} time
     * @param {Date} sent_at
     * @param {IdentMember?} by
     * @returns {boolean} updated
     * @throws {Error}
     */
    try_update(is_playing, time, sent_at, by=null) {
        let now = new Date();
        if (sent_at > now) {
            throw new Error("Time travel is not permitted.");
        }
        if (sent_at < this.update_timer.updated_at) {
            // considered irrelevant
            return false;
        }
        this.is_playing = is_playing;
        this.time = time;
        this.update_timer.update();
        this.last_update_by = by;
        return true;
    }


    /**
     * @param {boolean} playing
     * @param {?number} time
     */
    set_playing(playing, time = null) {
        this.is_playing = playing
        if (time !== null) this.time = time;
        this.update_timer.update();
    }


    /**
     * 
     * @param {?number} time 
     */
    play(time = null) {
        this.set_playing(true, time);
        this.update_timer.update();
    }


    stop() {
        this.set_playing(false);
        this.update_timer.update();
    }


    /**
     * 
     * @param {number} time 
     */
    seek(time) {
        this.time = time;
        this.update_timer.update();
    }


    /**
     * 
     * @param {?number} time 
     */
    stop_and_seek(time = null) {
        this.set_playing(false, time);
        this.update_timer.update();
    }


    status() {
        return new PlayerStatus(this.is_playing, this.time,
            this.update_timer.updated_at, this.last_update_by);
    }
}



class PlayerStatus {
    /**
     * @param {boolean} is_playing
     * @param {number} time
     * @param {Date} updated_at
     * @param {IdentMember?} author
     */
    constructor(is_playing, time, updated_at, author) {
        this.is_playing = is_playing;
        this.time = time;
        this.updated_at = updated_at;
        this.author = author;
    }


    raw() {
        return {
            is_playing: this.is_playing,
            time: this.time,
            updated_at: this.updated_at,
            author: this.author?.raw() ?? "",
        }
    }
}

