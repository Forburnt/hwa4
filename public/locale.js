"use strict";

import * as req from './req.js';

export{
    tr,
}


let headers = new Headers({
    'Content-Type': 'application/json',
});

/** @type {Object} */
var tr = {};
req.get("get_tr", {}, headers).then(reply => {
    tr = reply;
});

