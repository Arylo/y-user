const md5 = require('md5');
const mongoose = require('mongoose');

describe('User Model', () => {

    let UserModel;
    const getHashcode = () => md5(Date.now() + "");
    let Auth = null;
    const createAuth = () => {
        return {
            user: `test${getHashcode()}`,
            pass: getHashcode()
        };
    };

    before(() => {
        const dbUrl = `mongodb://127.0.0.1/y-user-database`;
        mongoose.connect(dbUrl, { useMongoClient: true });
        mongoose.Promise = Promise;
    });

    before(() => {
        const userFactory = require('../');
        const collectionName = `user${md5(Date.now())}`;
        const factory = new userFactory(void 0, { collection: collectionName });
        UserModel = factory.createModel(collectionName);
    });

    beforeEach(() => {
        Auth = createAuth();
    });

    afterEach(() => {
        Auth = null;
    });

    it('Functions', () => {
        let fns = [
            'createUser', 'deleteUser',
            'modifyPass', 'activeUser', 'inactiveUser',
            'findUserById', 'findUserByName', 'checkUser', 'listUsers'
        ];
        UserModel.should.have.properties(fns);
    });

    it('Create User', () => {
        UserModel.createUser(Auth.user, Auth.pass).should.be.a.Promise()
            .which.be.fulfilled();
    });

    it('Delete User', () => {
        return UserModel.createUser(Auth.user, Auth.pass).then((user) => {
            user = user.toObject();
            return UserModel.deleteUser(user._id).then((user) => {
                user.should.be.not.empty();
            });
        });
    });

    describe('Exist User', () => {

        let user = null;

        beforeEach(() => {
            return UserModel.createUser(Auth.user, Auth.pass).then((obj) => {
                user = obj.toObject();
            });
        });

        afterEach(() => {
            return UserModel.deleteUser(user._id).then(() => {
                user = null;
            });
        });

        it('Create Same User', () => {
            UserModel.createUser(Auth.user, Auth.pass).should.be.a.Promise()
                .which.be.rejected();
        });

        it('Modify Passwod', () => {
            let oldUser = null;
            return UserModel.findById(user._id).exec().then((obj) => {
                oldUser = obj.toObject();
                return UserModel.modifyPass(user._id, 'root')
            }).then((obj) => {
                obj.should.be.not.an.empty();
                return UserModel.findById(user._id).exec();
            }).then((obj) => {
                let user = obj.toObject();
                user.should.have.not.property('password', oldUser.password);
            });
        });

        it('Active User', () => {
            return UserModel.activeUser(user._id).then((obj) => {
                obj.should.be.not.an.empty();
                return UserModel.findById(user._id).exec();
            }).then((obj) => {
                let user = obj.toObject();
                user.active.should.be.true();
            });
        });

        it('Inactive User', () => {
            return UserModel.inactiveUser(user._id).then((obj) => {
                obj.should.be.not.an.empty();
                return UserModel.findById(user._id).exec();
            }).then((obj) => {
                let user = obj.toObject();
                user.active.should.be.false();
            });
        });

        it('Find User By ID', () => {
            return Promise.all([
                UserModel.findUserById(user._id),
                UserModel.findById(user._id).exec(),
            ]).then((objs) => {
                let [api, native] = objs;
                api = api.toObject();
                native = native.toObject();
                for (let key in api) {
                    if (key == 'password') {
                        api[key].should.be.an.empty();
                        continue;
                    }
                    api[key].should.be.eql(native[key]);
                }
            });
        });

        it('Find User By Not Exist ID', () => {
            let id = user._id.toString().replace(/\d/g, '1');
            UserModel.findUserById(id).then((obj) => {
                (!obj).should.be.true();
            });
        });

        it('Find User By Username', () => {
            return Promise.all([
                UserModel.findUserByName(Auth.user),
                UserModel.findOne({ username: Auth.user }).exec(),
            ]).then((objs) => {
                let [api, native] = objs;
                api = api.toObject();
                native = native.toObject();
                for (let key in api) {
                    if (key == 'password') {
                        api[key].should.be.an.empty();
                        continue;
                    }
                    api[key].should.be.eql(native[key]);
                }
            });
        });

        it('Find User By Not Exist Name', () => {
            UserModel.findUserByName(`test${Date.now()}`).then((obj) => {
                (!obj).should.be.true();
            });
        });

        it('Check User', () => {
            return UserModel.checkUser(Auth.user, Auth.pass).then((obj) => {
                obj.should.be.not.empty();
            });
        });

        it('Check User By wrong username', () => {
            UserModel.checkUser(Date.now() + "", Auth.pass).then((obj) => {
                (!obj).should.be.true();
            });
        });

        it('Check User By wrong password', () => {
            UserModel.checkUser(Auth.user, Date.now() + "").then((obj) => {
                (!obj).should.be.true();
            });
        });

        it('List Users', () => {
            let curCount = 0;
            return UserModel.listUsers().then((objs) => {
                objs.should.be.not.empty();
                curCount = objs.length;
                return UserModel.createUser(Date.now(), Date.now());
            }).then(() => UserModel.listUsers())
            .then((objs) => {
                objs.should.length(curCount + 1);
                curCount = objs.length;
                return Promise.all([
                    UserModel.createUser(Date.now(), Date.now()),
                    UserModel.createUser(Date.now() + 1, Date.now()),
                    UserModel.createUser(Date.now() + 2, Date.now())
                ]);
            }).then(() => UserModel.listUsers())
            .then((objs) => {
                objs.should.length(curCount + 3);
            });
        });

    });
});
