/** @module auth */
"use strict";

import * as fb from "./fb.mjs";

import * as errors from "./errors.mjs";
import {
    AuthError, IdentError,
    ok, err,
} from "./errors.mjs";

// import { IdentName } from "./model/ident_name.mjs";
import { MemberPath } from "./model/members.mjs";
import { Model } from "./model.mjs";

/** @typedef {import("./errors.mjs").StatusReply} StatusReply */



export {
    View,
};




class View {
    /** @type {Model} */
    model;

    constructor(model = null) {
        this.model = model ?? new Model();
    }



    /**
     * @param {string | undefined} room_name
     * @param {string | undefined} username
     * @param {string | undefined} ip
     * @param {boolean} allow_creating_room
     * @returns {StatusReply}
     * @throws {AuthError | IdentError | TyperError}
     */
    user_join_room(room_name, username, ip, allow_creating_room = true) {
        try {
            let member_path = MemberPath.try_new(room_name, username, ip);
            let member = this.model.user_join_room(
                member_path, allow_creating_room);
            return ok("Joined successfully!", member.get_path().raw());
        } catch (error) {
            return err(error);
        }
    }


    /**
     * @param {string | undefined} room_name
     * @param {string | undefined} username
     * @param {string | undefined} ip
     * @returns {StatusReply}
     * @throws {AuthError | IdentError | TyperError}
     */
    user_update(room_name, username, ip) {
        try {
            let path = MemberPath.try_new(room_name, username, ip);
            let user_update = this.model.user_update(path);
            return ok("Update", user_update.raw());
        } catch (error) {
            return err(error);
        }
    }


    /**
     * @param {string | undefined} room_name
     * @param {string | undefined} username
     * @param {string | undefined} ip
     * @param {string | undefined} content
     * @returns {StatusReply}
     * @throws {AuthError | IdentError | TyperError}
     */
    send_msg(room_name, username, ip, content) {
        if (!content) {
            return err(new Error("Message must have content!"));
        }
        try {
            let path = MemberPath.try_new(room_name, username, ip);
            let msg = this.model.user_send_msg(path, content);
            return ok("Msg sent");
        } catch (error) {
            return err(error);
        }
    }


    /**
     * @param {string | undefined} room_name
     * @param {string | undefined} username
     * @param {string | undefined} ip
     * @param {boolean | undefined} is_playing
     * @param {number | undefined} time
     * @param {Date | undefined} sent_at
     * @returns {StatusReply}
     * @throws {AuthError | IdentError | TyperError}
     */
    set_player_status(room_name, username, ip, is_playing, time, sent_at) {
        if (is_playing == null || time == null || sent_at == null) {
            return err(new Error("set_player_status expects [...]"));
        }
        try {
            let path = MemberPath.try_new(room_name, username, ip);
            if (this.model.set_player_status(path, is_playing, time, sent_at)) {
                return ok("Player status changed");
            } else {
                return ok("Outdated update");
            }
        } catch (error) {
            return err(error);
        }
    }

}

