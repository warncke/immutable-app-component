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

async function getTest (args) {
    // create new foo component
    var foo = await this.component.foo.new()
    // return component for template
    return {
        components: {
            foo: foo,
        },
    }
}