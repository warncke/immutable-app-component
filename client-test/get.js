'use strict'

var assert = chai.assert

describe('immutable-app-component get', function () {

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
        // create stubs
        component.preGet = sandbox.stub()
        component.postGet = sandbox.stub()
        component.preSet = sandbox.stub()
        component.postSet = sandbox.stub()
    })

    afterEach(function () {
        // reset sinon sandbox
        sandbox.restore()
    })

    it('should get value for simple property', function () {
        // set value
        assert.isTrue(component.set('foo', 'bar'))
        // check value
        assert.strictEqual(component.get('foo'), 'bar')
    })

    it('should get value for nested property with dot notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar', 'bam'))
        // check value
        assert.strictEqual(component.get('foo.bar'), 'bam')
    })

    it('should get value for nested property with array notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar[0]', 'bam'))
        // check value
        assert.strictEqual(component.get('foo.bar[0]'), 'bam')
    })

    it('should get value for nested property with object notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar[0].baz["wtf"]', 'bam'))
        // check value
        assert.strictEqual(component.get('foo.bar[0].baz["wtf"]'), 'bam')
    })

    it('should call pre and post hooks on get', function () {
        // set value
        assert.isTrue(component.set('foo', 'bar'))
        // get value
        assert.strictEqual(component.get('foo'), 'bar')
        // check hooks
        assert.calledOnce(component.preGet)
        assert.calledWith(component.preGet, 'foo')
        assert.calledOnce(component.postGet)
        assert.calledWith(component.postGet, 'foo', 'bar')
    })

    it('should call pre and post hooks on get with object notation', function () {
        // set value
        assert.isTrue(component.set('foo.bar[0].baz["wtf"]', 'bam'))
        // get value
        assert.strictEqual(component.get('foo.bar[0].baz["wtf"]'), 'bam')
        // check hooks
        assert.calledOnce(component.preGet)
        assert.calledWith(component.preGet, 'foo.bar[0].baz["wtf"]')
        assert.calledOnce(component.postGet)
        assert.calledWith(component.postGet, 'foo.bar[0].baz["wtf"]', 'bam')
    })

    it('should return value from pre-hook and call post-hook with it', function () {
        component.preGet.returns('bam')
        // set value
        assert.isTrue(component.set('foo', 'bar'))
        // get value
        assert.strictEqual(component.get('foo'), 'bam')
        // check hooks
        assert.calledOnce(component.preGet)
        assert.calledWith(component.preGet, 'foo')
        assert.calledOnce(component.postGet)
        assert.calledWith(component.postGet, 'foo', 'bam')
    })

    it('should return value from post-hook', function () {
        component.postGet.returns('bam')
        // set value
        assert.isTrue(component.set('foo', 'bar'))
        // get value
        assert.strictEqual(component.get('foo'), 'bam')
    })
})