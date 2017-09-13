import {
    Schema, Model, Document as Doc,
    SchemaDefinition, SchemaOptions
} from 'mongoose';
import { DefinitionType, OptionsType } from "./lib/mongo/default";

import { IUser, IUserRaw } from './lib/index';

type UserDoc = IUser<IUserRaw>;

type UserModel<T extends UserDoc> = Model<T> & {
    createUser(): Promise<T>;
    deleteUser(): Promise<T>;
    modifyPass(): Promise<T>;
    activeUser(): Promise<T>;
    inactiveUser(): Promise<T>;
    findUserById(): Promise<T>;
    findUserByName(): Promise<T>;
    checkUser(): Promise<T>;
    listUsers(): Promise<T[]>;
};

declare class UserFactory {
    constructor(defs?: DefinitionType, opts?: OptionsType)
    public static encryptFn(value: string): string;
    public static compareFn(inputVal: string, dbVal: string): string;
    public createSchema(): Schema;
    public createModel(name: string): UserModel<UserDoc>;
    public getDefinition(): SchemaDefinition;
    public getOptions(): SchemaOptions;
}

declare namespace UserFactory {

}

export = UserFactory;
