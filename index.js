const fs = require('fs');

const DIST_PATH = `${__dirname}/dist`;

/* istanbul ignore if  */
if (!fs.existsSync(DIST_PATH)) {
    throw(new TypeError('[Y-User] Miss Dist Folder'));
}

module.exports = require(DIST_PATH);
