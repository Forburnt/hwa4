"use strict";

import * as req from './req.js';
import { tr } from './locale.js';
import * as elems from './elems.js';

export {
    string_enum,
    sussy,
}



/**
 * @description bad idea to use, remove this later
 * @param {string[]} fields
 * @returns {Object<string, string>}
 */
function string_enum(...fields) {
    /** @type {Object<string, string>} */
    let enum1 = {};
    let a = "asds";
    fields.forEach(key => {
        enum1[key] = key;
    })
    return enum1;
}



function sussy() {
    alert('amogus');
}

