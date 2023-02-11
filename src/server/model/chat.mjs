/** @module chat */
"use strict";

import * as fb from "../fb.mjs";
import { UpdateTimer } from "./update_timer.mjs";
import { IdentName } from "./ident_name.mjs";
import { IdentMember, IdentFakeMember, Member } from "./members.mjs";
import * as webhooks from "./webhooks.mjs";




export {
    Chat,
    Message, SystemMessage,
}



class Chat {
    /** @type {Message[]} */
    messages;
    /** @type {number} */
    current_id;
    /** @type {UpdateTimer} */
    update_timer;
    /** @type {string} */
    webhook;


    constructor(webhook="") {
        this.messages = [];
        this.current_id = 0;
        this.update_timer = new UpdateTimer();
        this.webhook = webhook;
    }


    /**
     * @param {Date} created_at
     * @param {IdentMember} author
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
     * @param {Member} member
     * @param {string} content
     * @returns {Message}
     */
    spawn_member_message(member, content) {
        return this.spawn_message(new Date(), member.ident_name, content);
    }


    /**
     * @param {string} content
     * @param {Date?} created_at
     * @param {IdentMember?} author
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
        if (this.webhook) {
            webhooks.send_msg(this.webhook,
                message.content, message.author.raw())
        }
        return message;
    }


    /**
     * @param {Message} message 
     * @returns {number}
     */
    remove_message(message) {
        return fb.remove_by_value(this.messages, message);
    }


    /**
     * @param {Member?} member
     * @param {Date?} since
     * @returns {Message[]}
     */
    queue_msgs(member=null, since=null) {
        let idx = member?.last_msg_idx ?? -1;
        since = since ?? member?.last_updated_at() ?? new Date();

        /** @type {number} */
        let from;
        if (idx >= 1
         && idx < this.messages.length
         && this.messages[idx - 1].spawned_at < since
         && this.messages[idx].spawned_at > since
        ) {
            from = idx;
        } else {
            from = this.find_msg_index_since(since);
        }
        if (from == -1) {
            return [];
        }

        if (member) {
            member.last_msg_idx = this.messages.length;
        }

        return this.messages.slice(from);
    }


    /**
     * @param {Date} since
     */
    find_msg_index_since(since) {
        return this.messages.findIndex(msg => msg.spawned_at >= since);
    }
}



class Message {
    /** @type {number} */
    id;
    /** @type {Date} */
    created_at;
    /** @type {Date} */
    spawned_at;
    /** @type {IdentMember} */
    author;
    /** @type {string} */
    content;

    
    /**
     * @param {number} id
     * @param {Date} created_at
     * @param {IdentMember} author
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


    raw() {
        return {
            created_at: this.created_at,
            author: this.author.raw(),
            content: this.content,
        }
        // return this.valueOf();
    }
}



class SystemMessage extends Message {
    /**
     * @param {number} id
     * @param {Date} created_at
     * @param {string} content
     */
    constructor(id, created_at, content) {
        let author = new IdentFakeMember("[Server]");
        super(id, created_at, author, content);
    }
}
