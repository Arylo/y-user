import {
    SchemaDefinition, SchemaOptions
} from "mongoose";

export * from "./common.d";

export const salt = "y-user";

export const definition: SchemaDefinition = { };

export const options: SchemaOptions = {
    timestamps: true
};
