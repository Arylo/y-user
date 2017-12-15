import { isString, isArray } from "util";
import { pbkdf2Sync } from "crypto";
import { Schema, model, Types, Query, SchemaOptions } from "mongoose";
import { MongoError } from "mongodb";

import * as common from "./common";
import { ObjectId } from "./common.d";
import { UserModel, UserDoc, IFactoryOptions } from "./user.d";

export const DEFAULT_SALT = common.salt;

export const DEFAULT_FLAG = "users";

export const DEFAULT_COLLECTION = "users";

export const DEFAULT_SCHEMA_DEFINITION = Object.assign({ }, common.definition, {
    username: {
        type: String,
        required: true,
        index: true,
        unique: true,
        minlength: [6, "Username length must greater 6 words"],
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Username length must greater 6 words"],
        trim: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});

export const DEFAULT_SCHEMA_OPTIONS = Object.assign({ }, common.options, {
    collection: DEFAULT_COLLECTION
});

const encryptStrTpl = (str, salt = DEFAULT_SALT) => {
    // Length 64
    return pbkdf2Sync(str, salt, 4096, 32, "sha256").toString("hex");
};

namespace UserStatics {

    export function createUser(name: string, pass: string) {
        const that = this as UserModel;
        return that.create({
            username: name,
            password: pass
        });
    }

    export function deleteUser(id: ObjectId) {
        if (!Types.ObjectId.isValid(id as string)) {
            return Promise.reject(new MongoError("This isnt ObjectID."));
        }
        const that = this as UserModel;
        return that.findOneAndRemove(id).exec();
    }

    export function modifyPass(id: ObjectId, newPass: string) {
        if (!Types.ObjectId.isValid(id as string)) {
            return Promise.reject(new MongoError("This isnt ObjectID."));
        }
        const that = this as UserModel;
        const opts = {
            runValidators: true,
            context: "query"
        };
        return that.findByIdAndUpdate(id, {
            // password: newPass
            $set: { password: newPass }
        }, opts).select("-password").exec();
    }

    export function activeUser(id: ObjectId) {
        if (!Types.ObjectId.isValid(id as string)) {
            return Promise.reject(new MongoError("This isnt ObjectID."));
        }
        const that = this as UserModel;
        return that.findByIdAndUpdate(id, {
            active: true
        }).select("-password").exec();
    }

    export function inactiveUser(id: ObjectId) {
        if (!Types.ObjectId.isValid(id as string)) {
            return Promise.reject(new MongoError("This isnt ObjectID."));
        }
        const that = this as UserModel;
        return that.findByIdAndUpdate(id, {
            active: false
        }).select("-password").exec();
    }

    export function findUserById(id: ObjectId) {
        if (!Types.ObjectId.isValid(id as string)) {
            return Promise.reject(new MongoError("This isnt ObjectID."));
        }
        const that = this as UserModel;
        return that.findById(id).select("-password").exec();
    }

    export function findUserByName(name: string) {
        const that = this as UserModel;
        return that.findOne({ username: name }).select("-password").exec();
    }

    export function checkUser(name: string, pass: string) {
        const that = this as UserModel;
        return that.findOne({
            username: name,
            // password: encryptStr(pass)
            password: pass
        }).select("-password").exec();
    }

    export function listUsers() {
        const that = this as UserModel;
        return that.find().select("-password").exec();
    }

}

const VALIDATORS_FNS = (salt: string) => {

    const encryptStr = (str) => {
        return encryptStrTpl(str, salt);
    };

    function username(model: UserModel) {
        return {
            isAsync: true,
            validator: (value, respond) => {
                model.findOne({
                    username: value
                }).exec().then((obj) => {
                    respond(obj ? false : true);
                }).catch(() => {
                    respond(false);
                });
            },
            message: "Username `{VALUE}` is exist"
        };
    }

    function samePasswordValidator(value: string, respond) {
        if (this && this.isNew) {
            return respond(true);
        }
        const self: Query<UserDoc> = this;
        self.findOne().select("password").exec()
            .then((obj) => {
                if (!obj) {
                    return respond(true);
                }
                const curPassword = obj.toObject().password;
                respond(encryptStr(value) !== curPassword ? true : false);
            });
    }

    function password() {
        return [{
            isAsync: true,
            validator: samePasswordValidator,
            message: "New Password cant eql Old Password"
        }];
    }

    return {
        username, password
    };

};

const PRES_FNS = (salt: string) => {

    const encryptStr = (str) => {
        return encryptStrTpl(str, salt);
    };

    function save() {
        return function(next) {
            if (!this.password) {
                return next();
            }
            this.password = encryptStr(this.password);
            next();
        };
    }

    function commonUpdate() {
        if (!(this instanceof Query)) {
            return;
        }
        const self: Query<UserDoc> = this;
        const query = self.getQuery();
        if (query.password && isString(query.password)) {
            query.password = encryptStr(query.password);
        }
    }

    function count() {
        return function(next) {
            commonUpdate.bind(this)();
            next();
        };
    }

    function find() {
        return function(next) {
            commonUpdate.bind(this)();
            next();
        };
    }

    function findOne() {
        return function(next) {
            commonUpdate.bind(this)();
            next();
        };
    }

    function findOneAndUpdate() {
        return function(next) {
            commonUpdate.bind(this)();
            next();
        };
    }

    function findOneAndRemove() {
        return function(next) {
            commonUpdate.bind(this)();
            next();
        };
    }

    return {
        save, count,
        find, findOne, findOneAndUpdate, findOneAndRemove
    };

};

const POSTS_FNS = (salt: string) => {

    const encryptList: Set<string> = new Set();
    const encryptStr = (str) => {
        return encryptStrTpl(str, salt);
    };

    function commonUpdate(stepName: string, doc: UserDoc) {
        if (!doc || !(this instanceof Query)) {
            return;
        }
        const self: Query<UserDoc> = this;
        const updateObj = self.getUpdate();
        const id: string = doc._id.toString();
        const isPassword = updateObj.password || updateObj.$set.password;
        if (!isPassword) {
            return;
        }
        if (encryptList.has(id)) {
            encryptList.delete(id);
            return;
        }
        const password =
            encryptStr(updateObj.$set.password || updateObj.password);
        if (updateObj.$set.password) {
            updateObj.$set.password = password;
        }
        if (updateObj.password) {
            updateObj.password = password;
        }
        encryptList.add(id);
        self[stepName]({ }, updateObj);
        self.exec();
    }

    function findOneAndUpdate() {
        return function(doc: UserDoc) {
            commonUpdate.bind(this)("findOneAndUpdate", doc);
        };
    }

    // function update() {
    //     return function(error, res, next) {
    //         commonUpdate.bind(this)("update", doc);
    //     };
    // }

    return {
        findOneAndUpdate//, update
    };
};

export function createSchema(opts: SchemaOptions = DEFAULT_SCHEMA_OPTIONS) {
    const schema = new Schema(DEFAULT_SCHEMA_DEFINITION, opts);
    return schema;
}

class UserModelFactory {
    private salt: string = DEFAULT_SALT;

    private modelFlag: string = DEFAULT_FLAG;
    private schemaOptions: SchemaOptions;
    private model: UserModel;

    constructor(opts: IFactoryOptions = { }) {
        const factoryOptions = Object.assign({ }, opts);
        this.modelFlag = factoryOptions.flag as string;
        this.salt = factoryOptions.salt as string;
        this.schemaOptions =
            Object.assign({ }, DEFAULT_SCHEMA_OPTIONS, factoryOptions.options);
    }

    public getModel() {
        if (this.model) {
            return this.model;
        }
        // Create Schema
        const schema = createSchema(this.schemaOptions);
        Object.keys(UserStatics).forEach((name) => {
            const fn = UserStatics[name];
            schema.static(name, fn);
        });
        const pres = PRES_FNS(this.salt);
        Object.keys(pres).forEach((name) => {
            const fn = pres[name]();
            schema.pre(name, fn);
        });
        const posts = POSTS_FNS(this.salt);
        Object.keys(posts).forEach((name) => {
            const fn = posts[name]();
            schema.post(name, fn);
        });
        // Create Model
        const m = model(this.modelFlag, schema) as UserModel;
        const validators = VALIDATORS_FNS(this.salt);
        Object.keys(validators).forEach((name) => {
            let mvalidators = validators[name](m);
            if (!isArray(mvalidators)) {
                mvalidators = [ mvalidators ];
            }
            mvalidators.forEach((validator) => {
                m.schema.path(name).validate(validator);
            });
        });
        this.model = m;
        return this.model;
    }
}

export function createModel(opts?) {
    return new UserModelFactory(opts).getModel();
}
