const { createHash } = require("crypto");
const mongoose = require('mongoose');

const yuser = require("../../../dist");

describe("Mongo Edition", () => {

    const getHash = () => {
        return createHash("md5")
            .update(Date.now() + Math.random() + "")
            .digest("hex");
    };

    const factory = yuser
        .mode("mongo")
        .getFactory("USER");
    const model = factory.createModel({
        flag: getHash(),
        options: {
            collection: getHash()
        }
    });

    before(() => {
        const dbUrl = "mongodb://127.0.0.1/y-user-test";
        mongoose.connect(dbUrl, { useMongoClient: true });
        mongoose.Promise = global.Promise;
    });

    describe("User Model Static Function Test Unit", () => {

        let user = {
            username: getHash(),
            password: getHash()
        };

        beforeEach(() => {
            user = {
                username: getHash(),
                password: getHash()
            };
        });

        afterEach(() => {
            return model.remove({ }).exec();
        });

        it("Create User", async () => {
            await model.createUser(user.username, user.password);

            const obj = (await model.findOne({ username: user.username }))
                .toObject();
            obj.should.have.property("username", user.username);
            obj.should.have.not.property("password", user.password);
        });

        it("Create Same User", async () => {
            await model.createUser(user.username, user.password);
            try {
                await model.createUser(user.username, user.password);
            } catch (error) {
                error.toString().should.be.not.empty();
            }
        });

        it("Create short username's User", async () => {
            try {
                await model.createUser("root", user.password);
            } catch (error) {
                error.toString().should.be.not.empty();
            }
        });

        it("Create short username's User", async () => {
            try {
                await model.createUser(user.username, "admin");
            } catch (error) {
                error.toString().should.be.not.empty();
            }
        });

        it("Delete User", async () => {
            const obj = await model.createUser(user.username, user.password);
            await model.deleteUser(obj._id);
            const num = await model.count({ username: user.username }).exec();
            num.should.be.eql(0);
        });

        it("Delete Non-Exist User", async () => {
            const id = "5a2f38e5cdc503f004498780";
            const obj = await model.deleteUser(id);
            should(obj).be.a.null();
        });

        it("Multiple Delete User", async () => {
            const obj = await model.createUser(user.username, user.password);
            await model.deleteUser(obj._id);
            await model.deleteUser(obj._id);
            const num = await model.count({ username: user.username }).exec();
            num.should.be.eql(0);
        });

        it("Modify Password", async () => {
            const newPass = getHash();
            const oldObj = await model.createUser(user.username, user.password);

            const obj = await model.modifyPass(oldObj._id, newPass);
            obj.toObject().should.have.not.property("password");

            const newObj = await model.findById(oldObj._id).exec();
            oldObj.toObject().should.have.not
                .property("password", newObj.toObject().password);
        });

        it("Modify Same Password", async () => {
            const oldObj = await model.createUser(user.username, user.password);
            try {
                await model.modifyPass(oldObj._id, user.password);
            } catch (error) {
                error.toString().should.be.not.empty();
            }
        });

        it("Modify one short Password", async () => {
            const newPass = "admin";
            const oldObj = await model.createUser(user.username, user.password);
            const id = oldObj._id;
            try {
                await model.modifyPass(oldObj._id, newPass);
            } catch (error) {
                error.toString().should.be.not.empty();
            }
        });

        it("Modify Non-Exist User's Password", async () => {
            const id = "5a2f38e5cdc503f004498780";
            const obj = await model.modifyPass(id, getHash());
            should(obj).be.a.null();
        });

        it("Allow User", async () => {
            user.active = false;
            let obj = await model.create(user);
            obj = await model.activeUser(obj._id);
            obj.toObject().should.have.not.property("password");
            obj = await model.findById(obj._id).exec();
            obj.toObject().should.have.property("active", true);
        });

        it("Allow Non-Exist User", async () => {
            const id = "5a2f38e5cdc503f004498780";
            const obj = await model.activeUser(id);
            should(obj).be.a.null();
        });

        it("Ban User", async () => {
            user.active = true;
            let obj = await model.create(user);
            obj = await model.inactiveUser(obj._id);
            obj.toObject().should.have.not.property("password");
            obj = await model.findById(obj._id).exec();
            obj.toObject().should.have.property("active", false);
        });

        it("Ban Non-Exist User", async () => {
            const id = "5a2f38e5cdc503f004498780";
            const obj = await model.inactiveUser(id);
            should(obj).be.a.null();
        });

        it("Find User by ID", async () => {
            let obj = await model.createUser(user.username, user.password);
            obj = (await model.findUserById(obj._id)).toObject();
            obj.should.have.properties(["username", "active"]);
            obj.should.have.not.property("password");
        });

        it("Find Non-Exist User by ID", async () => {
            const id = "5a2f38e5cdc503f004498780";
            const obj = await model.findUserById(id);
            should(obj).be.a.null();
        });

        it("Find User by Name", async () => {
            await model.createUser(user.username, user.password);
            let obj = (await model.findUserByName(user.username)).toObject();
            obj.should.have.properties(["username", "active"]);
            obj.should.have.not.property("password");
        });

        it("Check Exist User", async () => {
            await model.createUser(user.username, user.password);
            let obj = await model.checkUser(user.username, user.password);
            should(obj).be.not.a.null();
            obj = obj.toObject();
            obj.should.have.not.property("password");
        });

        it("Check Non-Exist User", async () => {
            let obj = await model.checkUser(getHash(), getHash());
            should(obj).be.a.null();
        });

        it("User List #0", async () => {
            for (let i = 0; i < 100; i++) {
                await model.createUser(getHash(), getHash());
            }
            const list = await model.listUsers();
            list.should.have.length(100);
        });

        it("User List #1", async () => {
            const list = await model.listUsers();
            list.should.have.length(0);
        });

    });

});
