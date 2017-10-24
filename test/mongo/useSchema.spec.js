const UserFactory = require('../../').mode('mongo');

describe('User Schema', () => {

    describe('Functions', () => {

        const staticFns = [
            'encryptFn', 'compareFn'
        ];

        const instanceFns = [
            'createModel', 'createSchema',
            'getDefinition', 'getOptions'
        ];

        it('Static', () => {
            UserFactory.should.have.properties(staticFns);
            UserFactory.should.have.not.properties(instanceFns);
        });

        it('Instance', () => {
            const userFactory = new UserFactory();
            userFactory.should.have.properties(instanceFns);
            userFactory.should.have.not.properties(staticFns);
        });

    });

    it('Compare Enyption', () => {
        let dbVal = UserFactory.encryptFn('test');
        UserFactory.compareFn('test', dbVal).should.be.true();
        UserFactory.compareFn('unknown', dbVal).should.be.false();
    });

    describe('Default Status', () => {

        it('Get Definition', () => {
            const userFactory = new UserFactory();
            userFactory.getDefinition().should.be.not.an.empty();
        });

        it('Get Options', () => {
            const userFactory = new UserFactory();
            userFactory.getOptions().should.be.not.an.empty();
        });

        it('Create Schema', () => {
            const userFactory = new UserFactory();
            userFactory.createSchema().should.be.not.an.empty();
        });

        it('Create Model', () => {
            const userFactory = new UserFactory();
            userFactory.createModel('test').should.be.not.an.empty();
        });

    });


});
