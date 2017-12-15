const mongoose = require('mongoose');

module.exports = () => {
    const dbHost =
        process.env.npm_package_config_mongodbhost ||
        process.env.npm_config_mongodbhost ||
        "127.0.0.1";
    const dbUrl = `mongodb://${dbHost}/y-user-test`;
    mongoose.connect(dbUrl, { useMongoClient: true });
    mongoose.Promise = global.Promise;
};
