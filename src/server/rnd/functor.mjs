import { must_implement } from "../errors.mjs";
import { assert } from "../fb.mjs";
import { UnitTest } from "./unit_test.mjs";

export {
    Wrapper,
    Functor,
    FunctorDefault,
    Test,
}


/**
 * @template T
 * @interface
 */
class Wrapper {
    /** @returns {T} */
    get_inner() {
        must_implement();
    }


    /**
     * @template A
     * @param {A} x
     * @returns {FunctorDefault<A>}
     */
    static pure(x) {
        must_implement();
    }


    /**
     * @param {T} x
     * @returns {Wrapper<T>}
     */
    pure(x) {
        return Wrapper.pure(x);
    }
}


/**
 * @template T
 * @interface
 */
class Functor {
    /**
     * @template U
     * @param {(x: T) => U} f
     * @returns {Functor<U>}
     */
    fmap(f) {
        must_implement();
    }
}


/**
 * @template T
 * @implements {Wrapper<T>}
 * @interface
 */
class FunctorDefault extends Functor {
    /** @returns {T} */
    get_inner() {
        must_implement();
    }

    /**
     * @param {T} x
     * @returns {FunctorDefault<T>}
     */
    pure(x) {
        must_implement();
    }

    /**
     * @template A
     * @param {A} x
     * @returns {FunctorDefault<A>}
     */
    static pure(x) {
        must_implement();
    }

    /**
     * @template U
     * @param {(x: T) => U} f
     * @returns {FunctorDefault<U>}
     */
    fmap(f) {
        return FunctorDefault.pure(f(this.get_inner()));
    }
}



class Test extends UnitTest {
    tests = [
        Test.test_basic,
        Test.test_maybe,
    ];

    static test_basic() {
        /**
         * @template T
         * @implements {FunctorDefault}
         */
        class Box {
            /**
             * @param {T} x 
             */
            constructor(x) {
                this.inner = x;
            }


            /**
             * @template T
             * @param {T} x
             * @returns {Box<x>}
             */
            static pure(x) {
                return new Box(x);
            }
            

            /**
             * @param {T} x
             * @returns {Box<x>}
             */
            pure(x) {
                return new Box(x);
            }


            get_inner() {
                return this.inner;
            }

            /**
             * @template U
             * @param {(x: T) => U} f
             * @returns {Box<U>}
             */
            fmap(f) {
                return Box.pure(f(this.get_inner()));
            }
        }

        let a = new Box(21);
        let b = a.fmap(x => x * 2);
        assert(b.get_inner() === 42);
    }

    static test_maybe() {
        
    }
}



