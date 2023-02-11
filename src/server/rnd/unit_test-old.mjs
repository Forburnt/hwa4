import { assert } from "../fb.mjs";



export class UnitTest {
    /**
     * @callback TestFunction
     * @returns {void}
     * @throws {Error}
     */

    /**
     * @param {TestFunction[]} tests
     */
    constructor(tests) {
        this.tests = tests;
    }


    /**
     * @returns {Array<Error?>}
     */
    run_all() {
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


class TestUnitTest extends UnitTest {
    test_1() {
        assert(40 + 2 === 42);
    }
}

