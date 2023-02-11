"use strict";

export {
    set_fetch,
    request,
    get, post, get_raw, post_raw
};


var fetch;

function set_fetch(new_fetch) {
    fetch = new_fetch;
}



/**
 * 
 * @param {string} url 
 * @param {any} params 
 * @param {string} method 
 * @param {boolean} dojson 
 * @returns {Promise<any>}
 */
async function request(url, params = {}, method = "GET", dojson = true,
    headers = {}) {
    let options = { method, headers };
    if ("GET" === method) {
        url += "?" + new URLSearchParams(params).toString();
    } else {
        options.body = JSON.stringify(params);
    }

    if (dojson) {
        return fetch(url, options).then(response => response.json());
    }
    else {
        return fetch(url, options);
    }
}


/**
 * @param {string} url
 * @param {any} params
 * @param {any} headers
 * @returns {Promise<any>}
 */
const get = (url, params, headers = {}) => request(
    url, params, "GET", true, headers);

/**
 * @param {string} url
 * @param {any} params
 * @param {any} headers
 * @returns {Promise<any>}
 */
const post = (url, params, headers = {}) => request(
    url, params, "POST", true, headers);

/**
 * @param {string} url
 * @param {any} params
 * @param {any} headers
 * @returns {Promise<Response>}
 */
const get_raw = (url, params, headers = {}) => request(
    url, params, "GET", false, headers);

/**
 * @param {string} url
 * @param {any} params
 * @param {any} headers
 * @returns {Promise<Response>}
 */
const post_raw = (url, params, headers = {}) => request(
    url, params, "POST", false, headers);


/** @returns {string} */
const window_url = () => window.location.href;
