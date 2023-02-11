/** @module rooms */
"use strict";

import * as fb from "../fb.mjs";

import {
    IdentError, AuthError,
    // ok, err
} from "../errors.mjs";

import {
    UpdateTimer,
    MAX_UPDATE_TIMEOUT, LONG_MAX_UPDATE_TIMEOUT,
} from "./update_timer.mjs";

import { IdentMap, IdentName } from "./ident_name.mjs";
import { Member, Members, MemberPath } from "./members.mjs";
import { Player } from "./player.mjs";
import { Chat } from "./chat.mjs";
import * as webhooks from "./webhooks.mjs";


export {
    Rooms, Room,
    IdentRoom,
}



/** @classdesc A top-level object managing `Room`s. */
class Rooms {
    /** @type {IdentMap<Room>} */
    rooms;
    // /** @type {Date} */
    // updated_at;
    /** @type {UpdateTimer} */
    update_timer;


    /**
     * @param {Room[]} room_list
     * @param {?Date} created_at
     */
    constructor(room_list = [], created_at = null) {
        fb.assert(room_list.every(m => m instanceof Room));
        this.rooms = new IdentMap();
        room_list.forEach(room =>
            this.rooms.set(room.ident_name, room));
        // this.update(created_at);
        this.update_timer = new UpdateTimer(created_at,
            LONG_MAX_UPDATE_TIMEOUT);
    }

    /**
     * 
     * @param {?Date} updated_at
     */
    update(updated_at = null) {
        this.update_timer.update(updated_at);
    }
    

    /**
     * @param {Room} room
     * @param {boolean} replace
     * @returns {boolean} Whether the room was created successfully.
     */
    add_room(room, replace = true) {
        let created_successfully = false;
        if (!this.rooms.has(room.ident_name) || replace) {
            room.update_timer.update();
            this.rooms.set(room.ident_name, room);
            created_successfully = true;
        }
        this.update();
        console.log(`Added room ${room.ident_name.raw()}!`)
        // this.rooms.forEach(x => console.log(x.ident_name.raw()));
        return created_successfully;
    }

    /**
     * @param {Room} room
     * @returns {boolean}
     */
    remove_room(room) {
        let deleted_ok = this.rooms.delete(room.ident_name);
        this.update();
        console.log(`Removed room ${room.ident_name.raw()}!`)
        return deleted_ok;
    }

    /**
     * 
     * @returns {number} The number of rooms left after purge.
     */
    purge_rooms() {
        this.rooms.forEach(room => {
            if (!room.is_active()) this.remove_room(room);
        })
        this.update();
        return this.rooms.size;
    }

    /** @returns {boolean} */
    is_active() {
        return this.rooms.size > 0 || this.update_timer.was_recently_updated();
    }


    /**
     * @param {IdentRoom | MemberPath} path
     * @returns {Room}
     * @throws {AuthError}
     */
    get_room(path) {
        let room_id = path instanceof IdentRoom ? path : path.room_id;
        let room = this.rooms.get(room_id);
        if (room == undefined) {
            let room_list = [];
            this.rooms.forEach(x => {
                let r = x.ident_name.raw();
                let e1 = x.ident_name === room_id;
                let e2 = x.ident_name.raw() === room_id.raw();
                room_list.push(
                    `${r} ${e1} ${e2}`);
            });
            throw new AuthError(`Room ${room_id.raw()} not found!`
            + `\nRooms: ${room_list}`);
        }
        return room;
    }


    /**
     * @param {IdentRoom} room_id
     * @param {boolean} allow_unchanged
     * @returns {Room}
     * @throws {AuthError, Error}
     */
    create_room(room_id, allow_unchanged=false) {
        let existing_room = this.rooms.get(room_id);
        if (existing_room !== undefined) {
            if (allow_unchanged) return existing_room;
            else throw new AuthError(`Room ${room_id} already exists!`);
        }
        let room = new Room(room_id);
        this.add_room(room);
        return room;
    }


    /**
     * @param {MemberPath} path
     * @returns {Member}
     * @throws {AuthError}
     */
    get_member(path) {
        return this.get_room(path).get_member(path);
    }


    /**
     * @param {MemberPath} path
     * @returns {[Room, Member]}
     * @throws {AuthError}
     */
    get_room_and_member(path) {
        let room = this.get_room(path);
        let member = room.get_member(path);
        return [room, member];
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} allow_unchanged
     * @returns {Member}
     * @throws {AuthError}
     */
    register_member(path, allow_unchanged=false) {
        return this.get_room(path).register_member(path, allow_unchanged);
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} allow_new_room
     * @returns {Member}
     * @throws {AuthError, Error}
     */
    user_join_room(path, allow_new_room=false, allow_unchanged=true) {
        if (allow_new_room) this.create_room(path.room_id, allow_unchanged);
        let member = this.register_member(path, allow_unchanged);
        return member;
    }
}



/** @classdesc A server `Room` representing a single hordewatch session. */
class Room {
    /** @type {IdentRoom} */
    ident_name;
    /** @type {UpdateTimer} */
    update_timer;
    /** @type {Members} */
    members;
    /** @type {Player} */
    player;
    /** @type {Chat} */
    chat;

    /**
     * @param {IdentRoom} ident_name
     * @param {Date?} created_at
     * @param {Member?} creator
     * @param {Player?} player
     * @param {Chat?} chat
     */
    constructor(ident_name, created_at=null,
        creator = null, player = null, chat = null)
    {
        this.ident_name = ident_name;
        this.update_timer = new UpdateTimer(created_at);
        this.members = new Members(creator ? [creator] : []);
        this.members.of_room(this);
        this.player = player ?? new Player();
        // this.player.of_room(this);

        let webhook = ident_name.raw() == "horde" ?
            webhooks.charlotte : webhooks.wh1;
        this.chat = chat ?? new Chat(webhook);
        
        // this.chat.of_room(this);
    }


    /** @returns {boolean} */
    is_active() {
        return this.members.is_active() || this.update_timer.was_recently_updated();
    }


    /**
     * @param {MemberPath} path
     * @returns {Member}
     * @throws {AuthError}
     */
    get_member(path) {
        return this.members.get_member(path, this.ident_name.raw());
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} allow_unchanged
     * @returns {Member}
     * @throws {AuthError}
     */
    register_member(path, allow_unchanged=false) {
        return this.members.register_member(path, allow_unchanged);
    }
}


class IdentRoom extends IdentName {
    /**
     * @param {string | undefined} ident_name
     */
     constructor(ident_name) {
        super(ident_name)
    }
}

