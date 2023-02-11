

import {
    must_implement,
} from "../errors.mjs";
import { assert } from "../fb.mjs";
import { UnitTest } from "./unit_test.mjs";
// import { Functor } from "./functor.mjs";


export {
    Maybe,
    SomeT, NoneT, // maybe not export those?
    Some, None,
    Test,
}



/** @template T */
class Maybe {
    /** @returns {T | null} */
    get() {
        must_implement();
    }

    static sas(){}
}


/**
 * @template T
 * @implements {Maybe<T>}
 */
class SomeT {
    /** @param {T} x */
    constructor(x) {
        this.inner = x;
    }

    get() {
        return this.inner;
    }

    /** @returns {T} */
    unwrap() {
        return this.inner;
    }
}


/**
 * @template T
 * @implements {Maybe<T>}
 */
class NoneT {
    constructor() { }

    get() {
        return null;
    }
}


/**
 * @template T
 * @param {T} x
 * @returns {Maybe<T>}
 */
function Some(x) {
    return new SomeT(x);
}


/**
 * @template T
 * @returns {Maybe<T>}
 */
function None() {
    return new NoneT();
}



class Test extends UnitTest {
    tests = [
        Test.function_test,
    ];


    static function_test() {
        /**
         * @param {string} str
         * @returns {Maybe<number>}
         */
        function str_to_int(str) {
            let parsed = parseInt(str);
            return parsed != NaN ? Some(parsed) : None();
        }

        let a = str_to_int("42");
        let b = str_to_int("Quwe");
        let sum = (a.get() ?? 0) + (b.get() ?? 0);
        assert(sum === 42);
    }
}

