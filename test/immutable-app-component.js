'use strict'

/* npm modules */
const Promise = require('bluebird')
const chai = require('chai')

/* application modules */
const ImmutableAppComponent = require('../lib/immutable-app-component')

/* chai config */
const assert = chai.assert

describe('immutable-app-component', function () {

    it('should instantiate new component', function () {
        var component = new ImmutableAppComponent({
            name: 'foo',
            server: {
                new: () => {},
            },
        })
    })

})