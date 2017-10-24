import UserFactory = require("y-user");

const factory = UserFactory.mode("mongo");

const userFactory = new factory();

userFactory.createModel("user").listUsers().then((objs) => {
    return objs.map((item) => item.toObject());
});
