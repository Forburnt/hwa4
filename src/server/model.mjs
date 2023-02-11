/** @module model */
"use strict";

import * as fb from "./fb.mjs";

import * as errors from "./errors.mjs";
import {
    AuthError, IdentError,
    ok, err,
} from "./errors.mjs";

import { IdentName } from "./model/ident_name.mjs";
import { Rooms, Room, IdentRoom } from "./model/rooms.mjs";
import {
    Members, Member, MemberPath,
    IdentMember,
} from "./model/members.mjs";
import { Message } from "./model/chat.mjs";
import { PlayerStatus } from "./model/player.mjs";
import { UserUpdate } from "./model/user_update.mjs";



export {
    Model,
    UserUpdate,
}



class Model {
    /** @type {Rooms} */
    rooms;

    constructor() {
        this.rooms = new Rooms();
    }


    /**
     * @param {IdentRoom | MemberPath} path
     * @returns {Room}
     * @throws {AuthError}
     */
    get_room(path) {
        return this.rooms.get_room(path);
    }


    /**
     * @param {MemberPath} member_path
     * @returns {Member}
     * @throws {AuthError}
     */
    get_member(member_path) {
        return this.rooms.get_member(member_path);
    }


    /**
     * @param {MemberPath} path
     * @returns {[Room, Member]}
     * @throws {AuthError}
     */
    get_room_and_member(path) {
        return this.rooms.get_room_and_member(path);
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} allow_unchanged
     * @returns {Member}
     * @throws {AuthError}
     */
    register_member(path, allow_unchanged=false) {
        return this.rooms.register_member(path, allow_unchanged);
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} allow_new_room
     * @returns {Member}
     * @throws {AuthError, Error}
     */
    user_join_room(path, allow_new_room=false, allow_unchanged=true) {
        let member = this.rooms.user_join_room(
            path, allow_new_room, allow_unchanged);
        member.room?.chat.spawn_system_message(
            `${member.get_username()} joined the room!`
        );
        return member;
    }
    

    /**
     * @param {MemberPath} path
     * @returns {UserUpdate}
     * @throws {AuthError, Error}
     */
    user_update(path) {
        let [room, member] = this.get_room_and_member(path);
        return UserUpdate.update_user(member);
    }


    /**
     * @param {MemberPath} path
     * @param {string} content
     */
    user_send_msg(path, content) {
        let [room, member] = this.get_room_and_member(path);
        return room.chat.spawn_member_message(member, content);
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} is_playing
     * @param {number} time
     * @param {Date} sent_at
     * @return {boolean}
     */
    set_player_status(path, is_playing, time, sent_at) {
        let [room, member] = this.get_room_and_member(path);
        return room.player.try_update(is_playing, time, sent_at,
            member.ident_name);
    }

}


