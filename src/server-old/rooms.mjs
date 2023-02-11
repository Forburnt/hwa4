/** @module rooms */
"use strict";

import * as fb from "./fb.mjs";

export {
    Rooms, Room,
    IdentName,
    Members, Member, MemberPath,
    Player,
    Chat, Message, SystemMessage,
    // UpdateTimer,
};



/**
 * @type {number}
 * @description 1 minute
*/
const MAX_UPDATE_TIMEOUT = 60000;
const LONG_MAX_UPDATE_TIMEOUT = 180000;




/** @classdesc A top-level object managing `Room`s. */
class Rooms {
    /** @type {Map<IdentName, Room>} */
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
        this.rooms = new Map();
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
        return created_successfully;
    }

    /**
     * @param {Room} room
     * @returns {boolean}
     */
    remove_room(room) {
        let deleted_ok = this.rooms.delete(room.ident_name);
        this.update();
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
}



/** @classdesc A server `Room` representing a single hordewatch session. */
class Room {
    /** @type {IdentName} */
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
     * @param {IdentName} ident_name
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
        this.chat = chat ?? new Chat();
        // this.chat.of_room(this);
    }


    /** @returns {boolean} */
    is_active() {
        return this.members.is_active() || this.update_timer.was_recently_updated();
    }
}



class IdentName {
    /** @type {!string} */
    ident_name;

    /**
     * @todo Assert this can be an ident_name.
     * @param {string} ident_name
     * @throws {Error}
    */
    constructor(ident_name) {
        fb.assert(typeof ident_name === "string");
        ident_name = ident_name.trim();
        fb.assert(ident_name.length >= 2,
            Error("IdentName cannot be shorter that 2 characters!"));
        fb.assert(ident_name.length <= 16,
            Error("IdentName cannot be longer that 16 characters!"));
        fb.assert(/^[a-zA-Z][a-zA-Z_]+[a-zA-Z]$/.test(ident_name),
            Error("IdentName must only contain lowercase and uppercase latin letters"
                + " and underscores; it must not begin or end with an underscore."));
        this.ident_name = ident_name;
    }

    /**
     * @param {string} ident_name
     * @returns {(IdentName|Error)}
     */
    static try_new(ident_name) {
        try {
            return new IdentName(ident_name);
        }
        /** @param {Error} error */
        catch (error) {
            if (error instanceof Error)
                return error;
            else
                return Error(`Unexpected error: ${error}`);
        }
    }
}



class Members {
    /** @type {Map<IdentName, Member>} */
    members;
    /** @type {?Room} */
    room;

    /**
     * @param {Member[]} member_list
     */
    constructor(member_list = []) {
        fb.assert(member_list.every(m => m instanceof Member));
        this.members = new Map();
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
     * @returns {boolean}
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
    //     let name_with_hash = new IdentName(`${member.ident_name}#${hash}`);
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
}



class Member {
    /** @type {!IdentName} */
    ident_name;
    /** @type {string} */
    ip;
    /** @type {!UpdateTimer} */
    update_timer;
    /** @type {?Room} */
    room = null;

    /**
     * @param {!IdentName} ident_name
     * @param {string} ip
     */
    constructor(ident_name, ip) {
        this.ident_name = ident_name;
        this.ip = ip;
        // this.last_update = last_update;
        this.update_timer = new UpdateTimer();
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

    // update() {
    //     this.update_timer.update();
    // }

    /**
     * @returns {boolean}
     */
    is_connected() {
        return this.update_timer.was_recently_updated();
    }
}



class MemberPath {
    /** @type {IdentName} */
    room_id;
    /** @type {IdentName} */
    username;
    /** @type {string} */
    ip;

    /**
     * @param {IdentName} room_id
     * @param {IdentName} member_id
     * @param {string} ip
     */
    constructor(room_id, member_id, ip) {
        this.room_id = room_id;
        this.member_id = member_id;
        this.ip = ip;
    } 
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
}



class Chat {
    /** @type {Message[]} */
    messages;
    /** @type {number} */
    current_id;
    /** @type {UpdateTimer} */
    update_timer;


    constructor() {
        this.messages = [];
        this.current_id = 0;
        this.update_timer = new UpdateTimer();
    }


    /**
     * @param {Date} created_at
     * @param {IdentName} author
     * @param {string} content
     * @returns {Message}
     */
    spawn_message(created_at, author, content) {
        let id = this.current_id;
        this.current_id += 1;
        let message = new Message(id, created_at, author, content);
        // don't sort, because it breaks users receiving messages
        return this.push_message(message);
    }


    /**
     * @param {string} content
     * @param {Date?} created_at
     * @param {IdentName?} author
     * @returns {Message}
     */
    spawn_system_message(content, created_at=null, author=null) {
        created_at = created_at ?? new Date();
        let id = this.current_id;
        this.current_id += 1;
        let message = new SystemMessage(id, created_at, content);
        message.author = author ?? message.author;
        return this.push_message(message);
    }


    /**
     * @param {Message} message
     * @returns {Message}
     */
    push_message(message) {
        this.messages.push(message);
        this.update_timer.update();
        return message;
    }


    /**
     * @param {Message} message 
     * @returns {number}
     */
    remove_message(message) {
        return fb.remove_by_value(this.messages, message);
    }
}



class Message {
    /** @type {number} */
    id;
    /** @type {Date} */
    created_at;
    /** @type {Date} */
    spawned_at;
    /** @type {IdentName} */
    author;
    /** @type {string} */
    content;

    
    /**
     * @param {number} id
     * @param {Date} created_at
     * @param {IdentName} author
     * @param {string} content
     */
    constructor(id, created_at, author, content) {
        this.id = id;
        this.created_at = created_at;
        this.spawned_at = new Date();
        this.author = author;
        // !! add sanitization
        this.content = content;
    }
}



class SystemMessage extends Message {
    /**
     * @param {number} id
     * @param {Date} created_at
     * @param {string} content
     */
    constructor(id, created_at, content) {
        let author = new IdentName("[System]");
        super(id, created_at, author, content);
    }
}



class UpdateTimer {
    /** @type {Date} */
    created_at;
    /** @type {Date} */
    updated_at;
    /** @type {number} */
    max_update_timeout;


    /**
     * 
     * @param {?Date} created_at
     */
    constructor(created_at = null, max_update_timeout = MAX_UPDATE_TIMEOUT) {
        this.created_at = created_at ?? new Date();
        this.update(this.created_at);
        this.max_update_timeout = max_update_timeout;
    }


    /**
     * 
     * @param {?Date} updated_at
     */
    update(updated_at = null) {
        if (updated_at === null) {
            this.updated_at = new Date();
        } else if (updated_at >= this.updated_at) {
            this.updated_at = updated_at;
        } else {
            // !! ??
        }
        // this.updated_at = updated_at ?? new Date();
    }


    /**
     * 
     * @returns {boolean}
     */
    was_recently_updated() {
        let now = new Date();
        let diff = now.valueOf() - this.updated_at.valueOf();
        return diff < this.max_update_timeout;
    }
}



// mix()