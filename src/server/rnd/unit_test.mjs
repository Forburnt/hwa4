import { assert } from "../fb.mjs";



/**
 * @callback TestFunction
 * @returns {void}
 * @throws {Error}
 */


export class UnitTest {
    /** @type {TestFunction[]} */
    static tests;


    /**
     * @returns {Array<Error?>}
     */
    static run_all() {
        return UnitTest.run_multiple(this.tests);
    }


    /**
     * @param {TestFunction[]} tests
     * @returns {Array<Error?>}
     */
    static run_multiple(tests) {
        return tests.map(UnitTest.run_test);
    }


    /**
     * @param {TestFunction} test
     * @returns {Error?}
     */
    static run_test(test) {
        try {
            test();
            return null;
        } catch (error) {
            return error;
        }
    }
}


