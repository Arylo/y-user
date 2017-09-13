const fs = require('fs');

const DIST_PATH = `${__dirname}/dist`;

if (!fs.existsSync(DIST_PATH)) {
    throw(new TypeError('[Y-User] Miss Dist Folder'));
}

const {
    UserFactory
} = require(DIST_PATH);

module.exports = UserFactory;
