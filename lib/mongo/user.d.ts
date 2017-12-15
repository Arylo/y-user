import { Model, SchemaOptions, SchemaDefinition } from "mongoose";
import { IDefault, IDefaultRaw, ObjectId } from "./common.d";

export interface IUserRaw extends IDefaultRaw {
    username: string;
    password: string;
    active: boolean;
}

export interface IUserStatics<T> {
    createUser(name: string, pass: string): Promise<T>;
    deleteUser(id: ObjectId): Promise<T>;
    modifyPass(id: ObjectId, newPass: string): Promise<T>;
    activeUser(id: ObjectId): Promise<T>;
    inactiveUser(id: ObjectId): Promise<T>;
    findUserById(id: ObjectId): Promise<T | null>;
    findUserByName(name: string): Promise<T | null>;
    checkUser(name: string, pass: string): Promise<T | false | null>;
    listUsers(): Promise<T[]>;
}

interface IUserDoc<T extends IUserRaw> extends IDefault<T> { }
export type UserDoc = IUserDoc<IUserRaw>;

interface IUserModel<T extends UserDoc> extends Model<T>, IUserStatics<T> { }
export type UserModel = IUserModel<UserDoc>;

export interface IFactoryOptions {
    salt?: string;
    flag?: string;
    options?: SchemaOptions;
}
