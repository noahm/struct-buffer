/**
 * Minimal compile-time type assertion helpers.
 *
 * These have no runtime footprint — they exist purely so that `tsc --build`
 * (which type-checks the `test` project) fails when a type drifts from what
 * we expect. The file name is underscore-prefixed so ava ignores it while
 * tsc still includes it.
 *
 * Usage:
 *
 *   type _ = Expect<Equal<Actual, Expected>>;
 */

/**
 * True only when `A` and `B` are the exact same type. Crucially this
 * distinguishes `any` from every other type, so it catches accidental `any`
 * leaks (e.g. from an over-broad index signature).
 */
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** Passes type checking only when `T` is exactly `true`. */
export type Expect<T extends true> = T;

/** True when `T` is `any`, false otherwise. */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/** True when `T` is *not* `any`. Wrap in `Expect<>` to assert. */
export type NotAny<T> = Equal<IsAny<T>, false>;
