import { Schema, Document as Doc } from 'mongoose';

export type ObjectId = string | Schema.Types.ObjectId;

export interface IDefaultRaw {
    createdAt: Date;
    updatedAt: Date;
}

export interface IDefault<T extends IDefaultRaw> extends Doc {
    toObject(): T;
}
