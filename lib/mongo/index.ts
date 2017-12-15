// Check ORM Module exist
try {
    require("mongoose");
} catch (error) {
    /* istanbul ignore next */
    throw new TypeError(`
        I need the \`mongoose\` module, Please install it.
        You can use the command \`npm install --save mongoose\` to install.
    `);
}

import * as userFactory from "./user";
import { isString } from "util";

export enum FACTORY_TYPE {
    USER
}

export const getFactory = (type: FACTORY_TYPE | string) => {
    if (isString(type)) {
        type = type.toUpperCase();
        return getFactory(FACTORY_TYPE[type]);
    }
    switch (type) {
        case FACTORY_TYPE.USER:
            return userFactory;
        /* istanbul ignore next */
        default:
            break;
    }
};
