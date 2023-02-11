/** @module fb */
"use strict";

export {
    assert, check, try_throw,
    mix,
    insert, remove, remove_by_value,
}

/**
 * @param {boolean} expr
 * @param {?Error} error
 * @returns {void}
 * @throws {Error}
 */
function assert(expr, error = null) {
    console.assert(expr);
    if (!expr) throw error ?? Error("Assertion failed!");

}

/**
 * @param {boolean} expr
 * @returns {boolean}
 */
function check(expr) {
    console.assert(expr);
    return expr;
}



/**
 * @param {Error?} error
 * @throws Error
 */
function try_throw(error) {
    if (error instanceof Error) {
        throw error;
    }
}


/**
 * @param {any} base_class
 * @param {any} mixin
 * @returns {any} The mixed class.
 */
function mix(base_class, mixin) {
    Object.assign(base_class.prototype, mixin);
}



/**
 * @template T
 * @param {Array<T>} array
 * @param {number} index
 * @param {T} element
 */
function insert(array, index, element) {
    array.splice(index, 0, element);
}


/**
 * @template T
 * @param {Array<T>} array
 * @param {number} index
 * @returns {T}
 */
function remove(array, index) {
    return array.splice(index, 1)[0];
}


/**
 * @template T
 * @param {Array<T>} array
 * @param {T} element
 * @returns {number}
 */
function remove_by_value(array, element) {
    let index = array.indexOf(element)
    if (index === -1) return index;
    array.splice(index, 1);
    return index;
}




