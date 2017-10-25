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

import { Schema, Model } from "mongoose";
type ObjectId = Schema.Types.ObjectId;
import lodash = require("lodash");

import { EncryptNS } from "../common/namespaces";

import { DefaultSchema, DefinitionType, OptionsType } from "./default";
import { UserModel } from "./index.d";

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

const options: OptionsType = {
    collection: "user"
};

namespace UserStatics {
    export function createUser(name: string, pass: string) {
        const that = this as UserModel;
        return that.create({
            username: name,
            password: UserFactory.encryptFn(pass)
        });
    }
    export function deleteUser(id: ObjectId) {
        const that = this as UserModel;
        return that.findOneAndRemove(id).exec();
    }
    export function modifyPass(id: ObjectId, newPass: string) {
        const that = this as UserModel;
        return that.findByIdAndUpdate(id, {
            password: UserFactory.encryptFn(newPass)
        }).select("-password").exec();
    }
    export function activeUser(id: ObjectId) {
        const that = this as UserModel;
        return that.findByIdAndUpdate(id, {
            active: true
        }).select("-password").exec();
    }
    export function inactiveUser(id: ObjectId) {
        const that = this as UserModel;
        return that.findByIdAndUpdate(id, {
            active: false
        }).select("-password").exec();
    }
    export function findUserById(id: ObjectId) {
        const that = this as UserModel;
        return that.findById(id).select("-password").exec();
    }
    export function findUserByName(name: string) {
        const that = this as UserModel;
        return that.findOne({ username: name }).select("-password").exec();
    }
    export function checkUser(name: string, pass: string) {
        const that = this as UserModel;
        return that.findOne({ username: name }).exec().then((obj) => {
            if (!obj) { return obj; }
            const user = obj.toObject();
            if (UserFactory.compareFn(pass, user.password)) {
                return obj;
            } else {
                return false;
            }
        });
    }
    export function listUsers() {
        const that = this as UserModel;
        return that.find().select("-password").exec();
    }
}

export class UserFactory extends DefaultSchema {

    constructor(defs?: DefinitionType, opts?: OptionsType) {
        super(definition, options);
        this.setDefinition(defs);
        this.setOptions(opts);
    }

    public createModel(name: string) {
        for (const name of Object.keys(UserStatics)) {
            this.addStatic(name, UserStatics[name]);
        }
        return super.createModel(name) as UserModel;
    }
}

export namespace UserFactory {
    export let compareFn = EncryptNS.compareFn;
    export let encryptFn = EncryptNS.encryptFn;
}
