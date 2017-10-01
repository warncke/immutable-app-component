var get = 0;
var set = 0;

module.exports = {
    get: function (args) {
        return {
            data: {
                getCount: get++,
            },
        }
    },
    new: function (args) {
        return {
            data: {
                newMessage: 'Hello World',
            },
        }
    },
    set: function (args) {
        return {
            data: {
                setCount: set++,
            },
        }
    }
}