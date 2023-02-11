/** @module auth */
"use strict";

// import * as fb from "./fb.mjs";

export {
    AuthError, IdentError, UnimplementedError,
    unimplemented, todo, must_implement,
    response_ok, response_from_error,
    ok, err,
};



class AuthError extends Error {
    /**
     * @param {string | undefined} message
     */
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}


class IdentError extends Error {
    /**
     * @param {string | undefined} message
     */
    constructor(message) {
        super(message);
        this.name = "IdentError";
    }
}


class UnimplementedError extends Error {
    /**
     * @param {string | undefined} message
     * @param {string?} kind
     */
    constructor(message, kind=null) {
        super(message);
        this.name = "UnimplementedError";
        this.kind = kind;
    }
}


/**
 * @param {string | undefined} message
 * @throws {UnimplementedError}
 * @returns {never}
 */
function unimplemented(message = undefined) {
    throw new UnimplementedError(message, "unimplemented");
}


/**
 * @param {string | undefined} message
 * @throws {UnimplementedError}
 * @returns {never}
 */
function must_implement(message = undefined) {
    throw new UnimplementedError(message, "must_implement");
}


/**
 * @param {string | undefined} message
 * @throws {UnimplementedError}
 * @returns {never}
 */
function todo(message = undefined) {
    throw new UnimplementedError(message, "todo");
}



/** @typedef {{success: boolean, msg: string}} StatusReply */

/**
 * @param {Error | any} error
 * @param {Object} fields
 * @returns {StatusReply}
 */
function response_from_error(error, fields = {}) {
    if (error instanceof Error) {
        return { success: false, msg: error.message, ...fields };
    }
    else {
        return { success: false, msg: "Unknown error occured.", ...fields };
    }
}


/**
 * @param {string} message
 * @param {Object} fields
 * @returns {StatusReply}
 */
function response_ok(message, fields = {}) {
    return { success: true, msg: message, ...fields };
}


const ok = response_ok;
const err = response_from_error;

