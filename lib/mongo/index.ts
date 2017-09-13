import { Schema, Model } from "mongoose";
type ObjectId = Schema.Types.ObjectId;
import lodash = require("lodash");
import md5 = require("md5");

import {
    IDefault, IDefaultRaw,
    DefaultSchema, DefinitionType, OptionsType
} from "./default";

const definition: DefinitionType = {
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
};

export interface IUserRaw extends IDefaultRaw {
    username: string;
    password: string;
    active: boolean;
}

export interface IUser<T extends IUserRaw> extends IDefault<T> { }

type UserDoc = IUser<IUserRaw>;
type UserModel = Model<UserDoc>;

const options: OptionsType = {
    collection: "user"
};

namespace UserStatics {
    export function createUser(name: string, pass: string) {
        return this.create({
            username: name,
            password: UserFactory.encryptFn(pass)
        });
    }
    export function deleteUser(id: ObjectId) {
        return this.findOneAndRemove(id).exec();
    }
    export function modifyPass(id: ObjectId, newPass: string) {
        return this.findByIdAndUpdate(id, {
            password: UserFactory.encryptFn(newPass)
        }).select("-password").exec();
    }
    export function activeUser(id: ObjectId) {
        return this.findByIdAndUpdate(id, {
            active: true
        }).select("-password").exec();
    }
    export function inactiveUser(id: ObjectId) {
        return this.findByIdAndUpdate(id, {
            active: false
        }).select("-password").exec();
    }
    export function findUserById(id: ObjectId) {
        return this.findById(id).select("-password").exec();
    }
    export function findUserByName(name: string) {
        return this.findOne({ username: name }).select("-password").exec();
    }
    export function checkUser(name: string, pass: string) {
        return this.findOne({ username: name }).exec().then((obj) => {
            if (!obj) { return; }
            const user = obj.toObject();
            if (UserFactory.compareFn(pass, user.password)) {
                return obj;
            } else {
                return false;
            }
        });
    }
    export function listUsers() {
        return this.find().select("-password").exec();
    }
}

export class UserFactory extends DefaultSchema {

    public static encryptFn = (value: string) => {
        let salt: string;
        try {
            const config = require("y-config");
            salt = config["y-system"].user.salt;
        } catch (e) {
            salt = "";
        }
        const getHashCode = (val = value) => {
            return md5(`${salt}${val}`);
        };
        return getHashCode(getHashCode());
    }

    public static compareFn = (inputVal: string, dbVal: string) => {
        let salt: string;
        try {
            const config = require("y-config");
            salt = config["y-system"].user.salt;
        } catch (e) {
            salt = "";
        }
        const getHashCode = (val = inputVal) => {
            return md5(`${salt}${val}`);
        };
        return getHashCode(getHashCode()) === dbVal;
    }

    constructor(defs?: DefinitionType, opts?: OptionsType) {
        super(definition, options);
        this.setDefinition(defs);
        this.setOptions(opts);
    }

    public createModel(name: string): Model<UserDoc> {
        let statics: object | void ;
        try {
            const config = require("y-config");
            statics = config["y-system"].user.statics;
        } catch (e) {
            statics = void 0;
        }
        const hasConfig = !!statics;
        for (const name of Object.keys(UserStatics)) {
            if (hasConfig) {
                if (lodash.isBoolean(statics[name]) && !statics[name]) {
                    continue;
                }
            }
            this.addStatic(name, UserStatics[name]);
        }
        return super.createModel(name) as Model<UserDoc>;
    }
}
