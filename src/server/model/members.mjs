/** @module members */
"use strict";

import * as fb from "../fb.mjs";
import { UpdateTimer } from "./update_timer.mjs";
import { IdentMap, IdentName } from "./ident_name.mjs";
import { Room, IdentRoom } from "./rooms.mjs";

import { AuthError, IdentError } from "../errors.mjs";


export {
    Members, Member,
    MemberPath,
    IdentMember, IdentFakeMember,
}



class Members {
    /** @type {IdentMap<Member>} */
    members;
    /** @type {?Room} */
    room;

    /**
     * @param {Member[]} member_list
     */
    constructor(member_list = []) {
        fb.assert(member_list.every(m => m instanceof Member));
        this.members = new IdentMap();
        member_list.forEach(member =>
            this.members.set(member.ident_name, member));
    }


    /**
     * @param {Room | null} room
     */
    of_room(room) {
        this.room = room;
    }


    /**
     * @param {Member} member
     * @param {boolean} replace
     * @returns {boolean} added successfully
     */
    add_member(member, replace = true) {
        member.update_timer.update();
        member.in_room(this.room);
        if (!this.members.has(member.ident_name) || replace) {
            this.members.set(member.ident_name, member);
            return true;
        }
        return false;
    }


    // /**
    //  * @param {Member} member
    //  */
    // add_member_with_hash(member) {
    //     let hash = 1;
    //     member.update_timer.update();
    //     member.in_room(this.room);
    //     let name_with_hash = new IdentMember(`${member.ident_name}#${hash}`);
    //     while (this.members.has(name_with_hash)) {
    //         member
    //     }

    //     // if (!this.members.has(member.ident_name) || replace)
    //     //     this.members.set(member.ident_name, member);
    // }


    /**
     * @param {Member} member
     * @returns {boolean}
     */
    remove_member(member) {
        member.in_room(null);
        return this.members.delete(member.ident_name);
    }

    /**
     * @description Purges disconnected members.
     * @returns {number} Members left after purge.
     */
    purge_members() {
        this.members.forEach(member =>
            !member.is_connected() ? this.remove_member(member) : null);
        return this.members.size;
    }

    /** 
     * 
     * @param {boolean} purge_inactive
     * @returns {boolean} */
    is_active(purge_inactive = false) {
        if (purge_inactive) this.purge_members();
        return this.members.size > 0;
    }


    /**
     * @param {MemberPath} path
     * @param {string} room
     * @param {boolean} verify_ip
     * @returns {Member}
     * @throws {AuthError}
     */
    get_member(path, room = "", verify_ip=true) {
        let member = this.members.get(path.member_id);
        if (member == undefined) {
            let room_padded = room ? ` ${room}` : "";
            throw new AuthError(
                `Member ${path.member_id} not in room${room_padded}!`);
        }
        if (verify_ip) member.verify_ip(path);
        return member;
    }


    /**
     * @param {MemberPath} path
     * @param {boolean} allow_unchanged
     * @returns {Member}
     * @throws {AuthError}
     */
    register_member(path, allow_unchanged=false) {
        let member = new Member(path.member_id, path.ip);
        if (!this.add_member(member)) {
            let existing_member = this.members.get(path.member_id);
            if (existing_member && existing_member.ip === path.ip) {
                if (!allow_unchanged) {
                    throw new AuthError(
                        `Member ${path.member_id} is already registered!`);
                }
            } else {
                throw new AuthError(
                    `Username ${path.member_id} is already taken!`);
            }
        }
        return member;
    }
}



class Member {
    /** @type {!IdentMember} */
    ident_name;
    /** @type {string} */
    ip;
    /** @type {!UpdateTimer} */
    update_timer;
    /** @type {?Room} */
    room = null;
    /** @type {number} */
    last_msg_idx;

    /**
     * @param {!IdentMember} ident_name
     * @param {string} ip
     */
    constructor(ident_name, ip) {
        this.ident_name = ident_name;
        this.ip = ip;
        // this.last_update = last_update;
        this.update_timer = new UpdateTimer();
        this.last_msg_idx = 0;
    }


    /**
     * @param {Date | null} updated_at
     */
    update(updated_at = null) {
        this.update_timer.update(updated_at)
    }


    last_updated_at() {
        return this.update_timer.updated_at;
    }


    /**
     * @param {Room | null} room
     */
    in_room(room) {
        this.room = room;
    }


    /**
     * 
     * @param {Room} room 
     * @param {boolean} replace 
     */
    join_room(room, replace = false) {
        this.leave_room();
        room.members.add_member(this, replace);
    }


    leave_room() {
        if (this.room) fb.assert(this.room.members.remove_member(this));
    }


    /**
     * @returns {boolean}
     */
    is_connected() {
        return this.update_timer.was_recently_updated();
    }


    /**
     * @param {string | MemberPath} path
     */
    verify_ip(path) {
        let ip = path instanceof MemberPath ? path.ip : path;
        fb.assert(this.ip == ip,
            new AuthError(`Member IP ${this.ip} doesn't match ${ip}!`));
    }


    /**
     * @returns {MemberPath}
     * @throws {AuthError}
     */
    get_path() {
        if (this.room == null) throw new AuthError(
            `Member ${this.ident_name} is not in a room!`);
        let room_id = this.room.ident_name;
        return new MemberPath(room_id, this.ident_name, this.ip);
    }


    get_username() {
        return this.ident_name.raw();
    }


    is_connected_adv() {
        return this.is_connected() && this.room != undefined;
    }
}



class MemberPath {
    /** @type {IdentRoom} */
    room_id;
    /** @type {IdentMember} */
    member_id;
    /** @type {string} */
    ip;

    /**
     * @param {IdentRoom} room_id
     * @param {IdentMember} member_id
     * @param {string} ip
     */
    constructor(room_id, member_id, ip) {
        this.room_id = room_id;
        this.member_id = member_id;
        this.ip = ip;
    }

    /**
     * @param {string | undefined} room_name
     * @param {string | undefined} username
     * @param {string | undefined} ip
     * @returns {MemberPath}
     * @throws {AuthError | IdentError | TypeError}
     */
    static try_new(room_name, username, ip) {
        fb.assert(room_name != undefined, new AuthError(
            "No Room specified!"
        ))
        let room_id = new IdentRoom(room_name);
        
        fb.assert(username != undefined, new AuthError(
            "No Username specified!"
        ))
        let user_id = new IdentMember(username);
 
        if (ip === undefined) {
            throw new AuthError("No IP specified!");
        }
 
        return new MemberPath(room_id, user_id, ip);
   }


   /**
    * @returns {{room_id: string, username: string, ip: string}}
    */
   raw() {
       return {
           room_id: this.room_id.raw(),
           username: this.member_id.raw(),
           ip: this.ip,
       }
   }
}



class IdentMember extends IdentName {
    /**
     * @param {string | undefined} ident_name
     */
    constructor(ident_name) {
        super(ident_name)
    }
}


class IdentFakeMember extends IdentMember {
    /**
     * @todo Assert this can be an ident_name.
     * @param {string | undefined} ident_name
     * @throws {TypeError | IdentError}
    */
    constructor(ident_name) {
        super("aaa")
        this.ident_name = ident_name ?? "";
    }
}


