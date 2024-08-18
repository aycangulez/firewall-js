const testService = {
    prop1: 'hello',
    prop2: 'world',
    prop3: { subProp1: 'deep down' },
    increment: (x) => x + 1,
};

const UserService = function () {
    this.create = (firstName, lastName) => {
        let getFullName = () => firstName + ' ' + lastName;
        return { firstName, lastName, getFullName };
    };
};

function square(x) {
    return x * x;
}

module.exports = {
    testService,
    UserService,
    square,
};
