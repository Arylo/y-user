import { Schema, Model } from "mongoose";
type ObjectId = Schema.Types.ObjectId;

import { IUserRaw } from "../common/interfaces";
import { IDefault } from "./default";

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

export interface IUserDoc<T extends IUserRaw> extends IDefault<T> { }
export type UserDoc = IUserDoc<IUserRaw>;

export type UserModel = Model<UserDoc> & IUserStatics<UserDoc>;
