'use strict'

var assert = chai.assert

describe('immutable-app-component', function () {

    var component, sandbox

    beforeEach(function () {
        // create sanbox for each test
        sandbox = sinon.createSandbox()
        // reset global data
        ImmutableAppComponent.reset()
        // instantiate new component instance
        component = new ImmutableAppComponent({
            data: {},
            id: 'foo',
            refreshInterval: 1000,
        })
    })

    it('should instantiate new component', function () {
        assert.isFunction(component.bind)
        assert.isFunction(component.get)
        assert.isFunction(component.refresh)
        assert.isFunction(component.render)
        assert.isFunction(component.set)

        assert.strictEqual(component.id, 'foo')
        assert.strictEqual(component.refreshInterval, 1000)
    })

})