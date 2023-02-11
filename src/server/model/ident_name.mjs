/** @module ident_name */
"use strict";

import * as fb from "../fb.mjs";

import {
    IdentError,
} from "../errors.mjs";


export {
    IdentName,
    IdentMap,
}



class IdentName {
    /** @type {!string} */
    ident_name;

    /**
     * @todo Assert this can be an ident_name.
     * @param {string | undefined} ident_name
     * @throws {TypeError | IdentError}
    */
    constructor(ident_name) {
        fb.assert(ident_name !== undefined && ident_name !== null,
            TypeError("IdentName must be provided!"));
        if (typeof ident_name !== "string") {
            throw new TypeError("IdentName must be a string!");
        }
        ident_name = ident_name.trim();
        fb.assert(ident_name.length >= 3,
            new IdentError(
                "IdentName cannot be shorter that 3 characters!"));
        fb.assert(ident_name.length <= 16,
            new IdentError(
                "IdentName cannot be longer that 16 characters!"));
        fb.assert(/^[a-zA-Z][a-zA-Z_]+[a-zA-Z]$/.test(ident_name),
            new IdentError(
                "IdentName must only contain lowercase and uppercase latin letters"
                + " and underscores; it must not begin or end with an underscore."));
        this.ident_name = ident_name;
    }


    /**
     * 
     * @returns {string}
     */
    raw() {
        return this.ident_name;
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


/** @template T */
class IdentMap {
    constructor() {
        /** @type {Map<string, T>} */
        this.inner = new Map();
        // this.size = this.inner.size;
        new Map().set
    }


    get size() {
        return this.inner.size;
    }


    /**
     * @param {IdentName} key
     */
    get(key) {
        return this.inner.get(key.ident_name);
    }

    /**
     * @param {IdentName} key
     * @param {T} value
     */
    set(key, value) {
        return this.inner.set(key.ident_name, value);
    }

    /**
     * @param {IdentName} key
     */
    has(key) {
        return this.inner.has(key.ident_name);
    }

    /**
     * @param {(value: T, key: string, map: Map<string, T>) => void} callbackfn
     * @param {any} thisArg
     */
    forEach(callbackfn, thisArg=undefined) {
        return this.inner.forEach(callbackfn, thisArg);
    }

    values() {
        return this.inner.values();
    }

    keys() {
        return this.inner.keys();
    }

    clear() {
        return this.inner.clear();
    }

    /**
     * @param {IdentName} key
     */
    delete(key) {
        return this.inner.delete(key.ident_name);
    }

    entries() {
        return this.inner.entries();
    }

    valueOf() {
        return JSON.stringify(this.inner, json_replacer);
    }
}


/**
 * @param {any} key
 * @param {any} value
 */
function json_replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}