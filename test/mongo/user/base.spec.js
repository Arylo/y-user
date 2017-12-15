const { createHash } = require("crypto");

const yuser = require("../../../dist");

describe("Mongo Edition", () => {

    const userFactory = yuser.mode("mongo").getFactory("USER");

    describe("User Model Base Parma Test Unit", () => {

        it("Const Values", () => {
            userFactory.should.have.properties([
                "DEFAULT_SALT", // "SALT",
                "DEFAULT_FLAG", "DEFAULT_COLLECTION",
                "DEFAULT_SCHEMA_DEFINITION", "DEFAULT_SCHEMA_OPTIONS"
            ]);
        });

        it("Static Functions", () => {
            userFactory.should.have.properties([
                "createSchema", "createModel"
            ]);
        });

        it("Create Schema", () => {
            const schema = userFactory.createSchema();
            schema.should.be.not.empty();
        });

        it("Create Model", () => {
            return userFactory.createModel();
        });

    });

});
