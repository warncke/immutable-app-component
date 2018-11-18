'use strict'

var assert = chai.assert
sinon.assert.expose(chai.assert, { prefix: '' })

describe('immutable-app-component bind', function () {

    var changeEvent, component, inputEvent, sandbox

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
        // create parser 
        var parser = new DOMParser();
        // parse test html
        var fragment = parser.parseFromString(`
            <div id="test">
                <input type="text" id="textInput" />
                <input type="radio" id="radioInput" />
                <input type="checkbox" id="checkboxInput" />

                <textarea id="textarea"></textarea>

                <select id="select">
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                <p id="foobar"></p>
            </div>
        `, 'text/html')
        // get body
        var body = document.getElementsByTagName('body')[0]
        // inject into body
        body.appendChild(fragment.getElementById('test'))
        // create mock change event
        changeEvent = new Event('change', {
            bubbles: true,
            cancelable: true,
        })
        // create mock input event
        inputEvent = new Event('input', {
            bubbles: true,
            cancelable: true,
        })
    })

    afterEach(function () {
        // reset sinon sandbox
        sandbox.restore()
    })

    it('should bind to input', function () {
        // do bind
        assert.isTrue(component.bind('textInput', 'textInput'))
        // check bind
        assert.isObject(component.bindsByProperty['textInput'][0])
    })

    it('should set value from input on input event', function () {
        component.set = sandbox.stub()

        // do bind
        assert.isTrue(component.bind('textInput', 'textInput'))
        // set value on element
        var textInput = document.getElementById('textInput')
        textInput.value = 'foo'
        // trigger event
        textInput.dispatchEvent(inputEvent)

        assert.calledOnce(component.set)
        assert.calledWithMatch(component.set, 'textInput', 'foo', {})
    })

    it('should set value on input', function () {
        // do bind
        assert.isTrue(component.bind('textInput', 'textInput'))
        // set value
        component.set('textInput', 'foo')
        // get element
        var textInput = document.getElementById('textInput')
        // check value
        assert.strictEqual(textInput.value, 'foo')
    })

    it('should bind to textarea', function () {
        // do bind
        assert.isTrue(component.bind('textarea', 'textarea'))
        // check bind
        assert.isObject(component.bindsByProperty['textarea'][0])
    })

    it('should set value from input on input event', function () {
        component.set = sandbox.stub()

        // do bind
        assert.isTrue(component.bind('textarea', 'textarea'))
        // set value on element
        var textarea = document.getElementById('textarea')
        textarea.value = 'foo'
        // trigger event
        textarea.dispatchEvent(inputEvent)

        assert.calledOnce(component.set)
        assert.calledWithMatch(component.set, 'textarea', 'foo', {})
    })

    it('should set value on input', function () {
        // do bind
        assert.isTrue(component.bind('textarea', 'textarea'))
        // set value
        component.set('textarea', 'foo')
        // get element
        var textarea = document.getElementById('textarea')
        // check value
        assert.strictEqual(textarea.value, 'foo')
    })

    it('should bind to select', function () {
        // do bind
        assert.isTrue(component.bind('select', 'select'))
        // check bind
        assert.isObject(component.bindsByProperty['select'][0])
    })

    it('should set value from input on input event', function () {
        component.set = sandbox.stub()

        // do bind
        assert.isTrue(component.bind('select', 'select'))
        // set value on element
        var select = document.getElementById('select')
        select.value = '2'
        // trigger event
        select.dispatchEvent(inputEvent)

        assert.calledOnce(component.set)
        assert.calledWithMatch(component.set, 'select', '2', {})
    })

})