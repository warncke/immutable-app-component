'use strict'

var assert = chai.assert

describe('immutable-app-component set', function () {

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
        // create stubs on preSet and postSet
        component.preSet = sandbox.stub()
        component.postSet = sandbox.stub()
    })

    afterEach(function () {
        // reset sinon sandbox
        sandbox.restore()
    })

    it('should set value for simple property', function () {
        // set value
        assert.isTrue(component.set('foo', 'bar', 'event'))
        // check value
        assert.deepEqual(component.data, {foo: 'bar'})
    })

    it('should set value for nested property with dot notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar', 'bam', 'event'))
        // check value
        assert.deepEqual(component.data, {foo: {bar: 'bam'}})
    })

    it('should set value for nested property with array notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar[0]', 'bam', 'event'))
        // check value
        assert.deepEqual(component.data, {foo: {bar: ['bam']}})
    })

    it('should set value for nested property with object notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar[0].baz["wtf"]', 'bam', 'event'))
        // check value
        assert.deepEqual(component.data, {foo: {bar: [ {baz: {wtf: 'bam'} } ] }})
    })

    it('should set clean:false', function () {
        // set value
        assert.isTrue(component.set('foo', 'bar', 'event'))
        // check value
        assert.isFalse(component.clean)
    })

    it('should call pre and post hooks on set', function () {
        // set value
        assert.isTrue(component.set('foo', 'bar', 'event'))
        // check hooks
        assert.calledOnce(component.preSet)
        assert.calledWith(component.preSet, 'foo', 'bar', 'event')
        assert.calledOnce(component.postSet)
        assert.calledWith(component.postSet, 'foo', 'bar', 'event')
    })

    it('should not set value if pre hook returns false', function () {
        component.preSet.returns(false)
        // set value
        assert.isFalse(component.set('foo', 'bar', 'event'))
        // check hooks
        assert.notCalled(component.postSet)
    })

    it('should not set value if data not changed', function () {
        component.data.foo = 'bar'
        // set value
        assert.isFalse(component.set('foo', 'bar', 'event'))
        // check hooks
        assert.notCalled(component.postSet)
    })

})