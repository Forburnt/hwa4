import { try_throw } from "../fb.mjs";
import { UnitTest } from "./unit_test.mjs";
import * as maybe from "./maybe.mjs";
import * as functor from "./functor.mjs";

export {
    Test,
}


class Test extends UnitTest {
    tests = [
        Test.test_rnd,
    ];

    static test_rnd() {
        maybe.Test.run_all().map(try_throw);
        functor.Test.run_all().map(try_throw);
    }
}

Test.run_all();
