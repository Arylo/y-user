import { isString } from "util";

import * as mongo from "./mongo";

export enum DB_MODE {
    MONGO
}

export const mode = (modeType: DB_MODE | string) => {
    if (isString(modeType)) {
        modeType = modeType.toUpperCase();
        return mode(DB_MODE[modeType]);
    }
    switch (modeType) {
        case DB_MODE.MONGO:
            return mongo;
        /* istanbul ignore next */
        default:
            break;
    }
};
