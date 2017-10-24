import md5 = require("md5");

export namespace EncryptNS {
    export function encryptFn(value: string) {
        return md5(md5(value));
    }

    export function compareFn(inputVal: string, dbVal: string) {
        return md5(md5(inputVal)) === dbVal;
    }
}
