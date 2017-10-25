import {
    model, Model, Schema, Document as Doc,
    SchemaDefinition, SchemaOptions
} from "mongoose";

import { IDefaultRaw } from "../common/interfaces";

import lodash = require("lodash");

export type DefinitionType = SchemaDefinition | SchemaDefinition[] | undefined;
export type OptionsType = SchemaOptions | SchemaOptions[] | undefined;

export interface IDefault<T extends IDefaultRaw> extends Doc {
    toObject(): T;
}

export class DefaultSchema {
    private defaultDefinition: SchemaDefinition = { };
    private defaultOptions: SchemaOptions = {
        timestamps: true
    };
    private defaultMethods = { };
    private defaultStatics = { };
    private defaultSchema: Schema;

    constructor(defs?: DefinitionType, opts?: OptionsType) {
        this.setDefinition(defs);
        this.setOptions(opts);
    }

    public getDefinition() {
        return this.defaultDefinition;
    }

    protected setDefinition(defs: DefinitionType) {
        if (!defs) { return false; }
        if (!lodash.isArray(defs)) {
            defs = [ defs as SchemaDefinition ];
        }
        lodash.merge(this.defaultDefinition, ...(defs as SchemaDefinition[]));
        return true;
    }

    public getOptions() {
        return this.defaultOptions;
    }

    protected setOptions(opts: OptionsType) {
        if (!opts) { return false; }
        if (!lodash.isArray(opts)) {
            opts = [ opts as SchemaOptions ];
        }
        lodash.merge(this.defaultOptions, ...(opts as SchemaOptions[]));
        return true;
    }

    public addMethod(name: string, fn) {
        this.defaultMethods[name] = fn;
    }

    public addStatic(name: string, fn) {
        this.defaultStatics[name] = fn;
    }

    public createSchema() {
        if (!this.defaultSchema) {
            const definition = this.defaultDefinition;
            const options = this.defaultOptions;
            this.defaultSchema = new Schema(definition, options);
        }
        return this.defaultSchema;
    }

    public createModel(name: string) {
        if (!this.defaultSchema) {
            this.defaultSchema = this.createSchema();
        }
        Object.keys(this.defaultMethods).forEach((name) => {
            const fn = this.defaultMethods[name];
            this.defaultSchema.method(name, fn);
        });
        Object.keys(this.defaultStatics).forEach((name) => {
            const fn = this.defaultStatics[name];
            this.defaultSchema.static(name, fn);
        });
        return model(name, this.defaultSchema) as Model<IDefault<IDefaultRaw>>;
    }
}
