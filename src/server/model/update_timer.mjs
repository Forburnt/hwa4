/** @module update_timer */
"use strict";

// import {}

export {
    UpdateTimer,
    MAX_UPDATE_TIMEOUT, LONG_MAX_UPDATE_TIMEOUT,
}


/**
 * @type {number}
 * @description 1 minute
*/
const MAX_UPDATE_TIMEOUT = 60_000;

/**
 * @type {number}
 * @description 3 minutes
*/
const LONG_MAX_UPDATE_TIMEOUT = 180_000;



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
        this.updated_at = this.created_at;
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
