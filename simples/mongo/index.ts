import factory = require("y-user");
import mongoose = require("mongoose");

const mongoFactory = factory.mode("mongo");
const userModelFactory = mongoFactory.getFactory("USER");
const model = userModelFactory.createModel();

const dbUrl = "mongodb://127.0.0.1/y-user-simple";
mongoose.connect(dbUrl, { useMongoClient: true });
mongoose.Promise = global.Promise;

mongoFactory.model.listUsers().then((objs) => {
    return objs.map((item) => item.toObject());
});
