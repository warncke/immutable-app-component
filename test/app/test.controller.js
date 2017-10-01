'use strict'

module.exports = {
    paths: {
        '/test': {
            get: {
                method: getTest,
                template: 'test',
            },
        },
    },
}

function getTest (args) {
    // create new foo component
    var foo = this.component.foo.new()
    // return component for template
    return {
        components: {
            foo: foo,
        },
    }
}