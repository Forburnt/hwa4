/** @module auth */
"use strict";

import * as fb from "./fb.mjs";
// import * as rooms from "./rooms.js";
import {
    Rooms, Room,
    IdentName,
    Members, Member, MemberPath,
    Player,
    Chat, Message, SystemMessage,
} from "./rooms.mjs";

export {
    Model,
    AuthError,
}



class Model {
    /** @type {Rooms} */
    rooms;

    constructor() {
        this.rooms = new Rooms();
    }


    /**
     * @param {IdentName | undefined} room_id
     * @param {IdentName | undefined} username
     * @param {string | undefined} ip
     * @returns {Member}
     * @throws {AuthError}
     */
    auth_member(room_id, username, ip) {
        let path = this.get_member_path(room_id, username, ip);

        let room = this.rooms.rooms.get(path.room_id);
        if (room === undefined) {
            throw new AuthError(`Room ${path.room_id} not found!`);
        }

        let member = room.members.members.get(path.username);
        if (member === undefined) {
            throw new AuthError(`Member ${path.username} not found in Room!`);
        }

        if (path.ip != member.ip) {
            throw new AuthError(`IP ${path.ip} doesn't match ${member.ip}!`);
        }

        return member;
    }


    /**
     * @param {IdentName | undefined} room_id
     * @param {IdentName | undefined} username
     * @param {string | undefined} ip
     * @param {boolean} allow_creating_room
     * @returns {Object}
     * @throws {AuthError, Error}
     */
    user_join_room(room_id, username, ip, allow_creating_room=false) {
        if (allow_creating_room && room_id) {
            try {
                this.create_room(room_id, true);
            } catch (error) {
                return response_from_error(error);
            }
        }

        /** @type {Member} */
        let member;
        try {
            member = this.register_member(room_id, username, ip, true);
        } catch (error) {
            return response_from_error(error);
        }

        return response_ok("Joined successfully!", {
            username: username,
            room_id: room_id,
        });
    }


    /**
     * @param {IdentName} room_id
     * @param {boolean} allow_unchanged
     * @returns {Room}
     * @throws {AuthError, Error}
     */
    create_room(room_id, allow_unchanged=false) {
        let existing_room = this.rooms.rooms.get(room_id);
        if (existing_room !== undefined) {
            if (allow_unchanged) return existing_room;
            else throw new AuthError("Room already exists!");
        }
        let room = new Room(room_id);
        this.rooms.add_room(room);
        return room;
    }


    /**
     * @param {IdentName | undefined} room_id
     * @param {IdentName | undefined} username
     * @param {string | undefined} ip
     * @param {boolean} allow_unchanged
     * @returns {Member}
     * @throws {AuthError}
     */
    register_member(room_id, username, ip, allow_unchanged=false) {
        let path = this.get_member_path(room_id, username, ip);
        let room = this.rooms.rooms.get(path.room_id);
        if (room === undefined) {
            throw new AuthError(`Room ${path.room_id} not found!`);
        }
        let member = new Member(path.username, path.ip);
        if (!room.members.add_member(member)) {
            let existing_member = room.members.members.get(path.username);
            if (existing_member && existing_member.ip === path.ip) {
                if (!allow_unchanged) {
                    throw new AuthError("Member is already registered!");
                }
            } else {
                throw new AuthError("Username is already taken!");
            }
        }
        return member;
    }


    /**
     * @param {IdentName | undefined} room_id
     * @param {IdentName | undefined} username
     * @param {string | undefined} ip
     * @returns {MemberPath}
     * @throws {AuthError}
     */
    get_member_path(room_id, username, ip) {
        if (room_id === undefined) {
            throw new AuthError("No Room specified!");
        }

        if (username === undefined) {
            throw new AuthError("No Username specified!");
        }

        if (ip === undefined) {
            throw new AuthError("No IP specified!");
        }

        return new MemberPath(room_id, username, ip);
    }
}



class AuthError extends Error {
    /**
     * @param {string | undefined} message
     */
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}


/** @typedef {{success: boolean, msg: string}} StatusReply */

/**
 * @param {Error | any} error
 * @param {Object} fields
 * @returns {StatusReply}
 */
function response_from_error(error, fields={}) {
    if (error instanceof Error) {
        return {success: false, msg: error.message, ...fields};
    }
    else {
        return {success: false, msg: "Unknown error occured.", ...fields};
    }
}


/**
 * @param {string} message
 * @param {Object} fields
 * @returns {StatusReply}
 */
function response_ok(message, fields={}) {
    return {success: true, msg: message, ...fields};
}


