const { createHash } = require("crypto");
const mongoose = require('mongoose');

const yuser = require("../../../dist");

describe("Mongo Edition", () => {

    const getHash = () => {
        return createHash("md5")
            .update(Date.now() + Math.random() + "")
            .digest("hex");
    };

    const sleep = (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
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

    describe("Default Static Function Test Unit", () => {

        let user = {
            username: getHash(),
            password: getHash()
        };

        const updateUser = () => {
            user = {
                username: getHash(),
                password: getHash()
            };
            return user;
        };

        beforeEach(() => {
            updateUser();
        });

        afterEach(() => {
            return model.remove({ }).exec();
        });

        it("create", async () => {
            let obj = await model.create(user);
            obj = obj.toObject();
            obj.should.have.not.property("password", user.password);
        });

        it("count", async () => {
            await model.create(updateUser());
            await model.create(updateUser());
            let num = await model.count({ }).exec();
            num.should.be.a.Number().which.eql(2);
            num = await model.count(user).exec();
            num.should.be.a.Number().which.eql(1);
        });

        it("find", async () => {
            await model.create(user);
            const obj = await model.find(user).exec();
            obj.should.be.an.Array().which.length(1);
        });

        it("findOne", async () => {
            const rawObj = await model.create(user);
            const findObj = await model.findOne(user).exec();
            should(findObj).should.be.not.a.null();
            findObj.should.have.property("_id", rawObj._id);
        });

        it("findById", async () => {
            const rawObj = await model.create(user);
            const findObj = await model.findById(rawObj._id).exec();
            should(findObj).should.be.not.a.null();
        });

        it("findByIdAndRemove", async () => {
            const rawObj = await model.create(user);
            let num = await model.count({ }).exec();
            num.should.be.a.Number().which.eql(1);
            const obj = await model.findByIdAndRemove(rawObj._id).exec();
            num = await model.count({ }).exec();
            num.should.be.a.Number().which.eql(0);
        });

        it("findByIdAndUpdate", async () => {
            const password = "update.password";
            const rawObj = await model.create(user);
            await model.findByIdAndUpdate(rawObj._id, {
                password
            }).exec();
            await sleep(200);
            const findObj = await model.findById(rawObj._id).exec();
            findObj.toObject().should.have.not.property("password", password);
        });

        it.skip("update", async () => {
            const password = "update.password";
            const rawObj = await model.create(user);
            await model.update({_id: rawObj._id}, {
                password
            }).exec();
            await sleep(200);
            const findObj = await model.findById(rawObj._id).exec();
            findObj.toObject().should.have.not.property("password", password);
        });

        it("save", async () => {
            const m = new model(user);
            const rawObj = await m.save();
            const findObj = await model.findById(rawObj._id).exec();
            should(findObj).be.not.a.null();
        });
    });
});
