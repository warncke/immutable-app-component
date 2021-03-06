(function () {

'use strict'

// null function to use for default hooks
function nullFunction () {}
// helper to check if variable defined
function defined (arg) { return arg !== undefined}
// getElementById
var getId = document.getElementById.bind(document)

// do not re-initialize if already defined
if (defined(window.ImmutableAppComponent)) {
    return
}

// export constructor
window.ImmutableAppComponent = ImmutableAppComponent

// global register of components
var components = {}
// list of registered components
var componentList = []

// map of supported bind elements
var bindElementTypes = {
    input: true,
    textarea: true,
    select: true,
}

// list of supported hooks
var hooks = [
    'preBind',
    'preGet',
    'preRefresh',
    'preRender',
    'preSet',
    'postBind',
    'postGet',
    'postRefresh',
    'postRender',
    'postSet',
]

// required arguments
var requiredArgs = [
    'data',
    'id',
]

// optional arguments
var optionalArgs = [
    'refreshInterval',
]

// map of binds by id for the entire document
var bindsById = {}

// map of nested properties with pre-calculated data to look them up
var nestedProperties = {}

// regex to split nested property strings
var getNestedPropertyRegEx = /\[|\]|\.|\'|\"/g
var setNestedPropertyRegEx = /\.|\[/g

// regex to match brackets in property names
var quotedBracketRegex = /['"]\]$/
var bracketRegex = /\]$/

/**
 * @function ImmutableAppComponent
 *
 * instantiate new ImmutableAppComponent instance
 *
 * @param {object} args
 *
 * @returns {ImmutableAppComponent}
 */
function ImmutableAppComponent (args) {
    var self = this
    // args must be object
    if (!args || typeof args !== 'object') {
        throw new Error('args must be object')
    }
    // set require args
    requiredArgs.forEach(function (arg) {
        // arg must be defined
        if (!defined(args[arg])) {
            throw new Error('missing required arg '+arg)
        }
        // set arg
        self[arg] = args[arg]
    })
    // set optional args
    optionalArgs.forEach(function (arg) {
        // set arg if defined
        if (defined(args[arg])) {
            self[arg] = args[arg]
        }
    })
    // set hooks
    hooks.forEach(function (arg) {
        var hook = args[arg]
        // set hook if defined
        if (defined(hook)) {
            // require function
            if (typeof hook !== 'function') {
                throw new Error('hook '+arg+' must be function')
            }
            // set hook
            self[arg] = args[arg]
        }
    })
    // component must not be already registered
    if (defined(components[this.id])) {
        throw new Error(this.id+' already defined')
    }
    // add component to global register
    components[this.id] = this
    // also add to list for faster iteration
    componentList.push(this)
    // map of bound properties to ids
    this.bindsByProperty = {}
    // handlebars helpers
    this.helpers = {}
    // handlebars partials
    this.partials = {}
    // set to true if there are placeholders
    this.hasPlaceholders = false
    // placeholders for data
    this.placeholders = {}
    // set to true once binds done
    this.ready = false
    // set to false if data has changed without setting on server
    this.clean = true
    // time in ms of last refresh
    this.lastRefresh = 0
    // add placeholders if any
    if (defined(args.placeholders)) {
        // require object
        if (typeof args.placeholders !== 'object') {
            throw new Error('placeholders must be object')
        }
        // add placeholders
        Object.keys(args.placeholders).forEach(function (property) {
            // store placeholder
            self.placeholders[property] = args.placeholders[property]
            // set placeholders flag to true
            self.hasPlaceholders = true
        })
    }
    // do binds when dom ready
    document.addEventListener('DOMContentLoaded', function () {
        // binds array
        if (Array.isArray(args.binds)) {
            args.binds.forEach(function (name) {
                // array values are both elementId and property
                self.bind(name, name)
            })
        }
        // binds object
        else if (typeof args.binds === 'object') {
            Object.keys(args.binds).forEach(function (elementId) {
                // object is elementId: property
                self.bind(elementId, args.binds[elementId])
            })
        }
    })
}

// static methods
ImmutableAppComponent.component = component
ImmutableAppComponent.reset = reset

// public methods
ImmutableAppComponent.prototype = {
    bind: bind,
    get: get,
    refresh: refresh,
    render: render,
    set: set,
    // default hooks
    preBind: nullFunction,
    preGet: nullFunction,
    preRefresh: nullFunction,
    preRender: nullFunction,
    preSet: nullFunction,
    postBind: nullFunction,
    postGet: nullFunction,
    postRefresh: nullFunction,
    postRender: nullFunction,
    postSet: nullFunction,
}

/** 
 * @function bind
 *
 * bind element to property. event is optional and can be either change
 * or input if set. if not set property will be updated on both input and
 * change events.
 *
 * @param {string} elementId
 * @param {string} property
 * @param {string} event
 *
 * @returns {boolean}
 */
function bind (elementId, property, event) {
    // run pre-bind hook first and do not continue if it returns false
    if (this.preBind(elementId, property, event) === false) {
        return false
    }
    // check event argument
    if (defined(event)) {
        if (event !== 'change' && event !== 'input') {
            throw new Error('unsupported event '+event)
        }
    }
    // create bind spec
    var bind = {
        component: this,
        elementId: elementId,
        event: event,
        property: property,
    }
    // initialize bound element with value from data if it exists
    setBindValue(bind, this.get(property))
    // create list of binds for element if not defined
    if (!defined(bindsById[elementId])) {
        bindsById[elementId] = []
    }
    // add bind to list
    bindsById[elementId].push(bind)
    // create list of binds for data property if not defined
    if (!defined(this.bindsByProperty[property])) {
        this.bindsByProperty[property] = []
    }
    // add bind to list
    this.bindsByProperty[property].push(bind)
    // call post bind
    this.postBind(bind)
    // return true on success
    return true
}

/**
 * @function get
 *
 * get property from data
 *
 * @param {string} property
 *
 * @returns {any}
 */
function get (property) {
    // run pre-get which may return value
    var value = this.preGet(property)
    // if pre-get did not return value then do normal get
    if (!defined(value)) {
        value = _get(this.data, property)
    }
    // run post-get hook
    var postGet = this.postGet(property, value)
    // return post-get value if defined or original value
    return defined(postGet) ? postGet : value
}

function _get (data, property) {
    // if property is defined then use it
    if (defined(data[property])) {
        return data[property]
    }
    // otherwise split to check if nested
    var segments = property
        .split(getNestedPropertyRegEx)
        .filter(function (str) {return str !== ''})
    // get number of segments not including the last
    var length = segments.length - 1
    // lookup each segment
    for (var i=0; i < length; i++) {
        var segment = segments[i]
        // if segment does not have value then none of the nested segments
        /// will have values either
        if (!defined(data[segment])) {
            // clear data
            data = undefined
            // skip further evaluation
            break
        }
        // set data for next interation
        data = data[segment]
    }
    // try to get value from data
    return typeof data === 'object' && data ? data[segments[length]] : undefined
}

/**
 * @function refresh
 *
 * get data from server and re-render if changed
 *
 * @param {object} args
 *
 * @returns {boolean}
 */
function refresh (args) {

}

/**
 * @function render
 *
 * render template
 *
 * @param {object} args
 *
 * @returns {boolean}
 */
function render (args) {
    var self = this
    // get component element
    var elm = getId(this.id)
    // require element
    if (!defined(elm)) {
        throw new Error(this.id+' element not found')
    }
    // data to render template with
    var data
    // if there are placeholders need to add to data
    if (this.hasPlaceholders) {
        // clone data to modify
        data = JSON.parse(JSON.stringify(this.data))
        // set each placeholder
        Object.keys(this.placeholders).forEach(function (property) {
            // get current value
            var value = _get(data, property)
            // set placeholder if not defined in data
            if (!defined(value) || value === '') {
                _set(data, property, self.placeholders[property])
            }
        })
    }
    // otherwise use raw data
    else {
        data = this.data
    }
    // render template
    elm.innerHTML = this.template(data, {})
    // set component to clean
    this.clean = true
}

/**
 * @function set
 *
 * set data property
 *
 * @param {string} property
 * @param {string} value
 * @param {object} event
 *
 * @returns {boolean}
 */
function set (property, value, event) {
    // if pre-set hook returns false do not continue
    if (this.preSet(property, value, event) === false) {
        return false
    }
    // return if value not changed
    if (!_set(this.data, property, value)) {
        return false
    }
    // set flag to trigger set with server
    this.clean = false
    // get binds for property
    var binds = this.bindsByProperty[property]
    // if there are binds set values
    if (binds) {
        // set value for each bound element
        binds.forEach(function (bind) {
            setBindValue(bind, value)
        })
    }
    // call post-set hook
    this.postSet(property, value, event)
    // return true on success
    return true
}

function _set (data, property, value) {
    // set local property which will change for nested
    var localProperty = property
    // if property is not defined need to check if it is nested
    if (!defined(data[property])) {
        // split property into segments to check if nested - this does not need
        // to be filtered for empty strings because unlike get it leaves any
        // trailing characters (']) on the end of strings so it will never
        // create an empty string at the end of an array
        var segments = property.split(setNestedPropertyRegEx)
        // set nested flag to true if there is more than one segment
        var nested = segments.length > 1
        // property is nested
        if (nested) {
            // get number of segments
            var length = segments.length - 1
            // property used to set value is final segment
            localProperty = segments[length]
            // strip any extra chargs
            localProperty = localProperty.replace(getNestedPropertyRegEx, '')
            // lookup each segment - create if necessary
            for (var i=0; i < length; i++) {
                var segment = segments[i]
                // strip any extra chars from segment
                segment = segment.replace(getNestedPropertyRegEx, '')
                // skip segments with no length
                if (segment.length === 0) {
                    continue
                }
                // if property not defined create appropriate object
                if (!defined(data[segment])) {
                    // get next sement to determine type of this property
                    var nextSegment = segments[i+1]
                    // if next segment has a '] this is an object
                    if (nextSegment.match(quotedBracketRegex)) {
                        data[segment] = {}
                    }
                    // if next segment has bracket and no quotes this is array
                    else if (nextSegment.match(bracketRegex)) {
                        data[segment] = []
                    }
                    // otherwise this is object
                    else {
                        data[segment] = {}
                    }
                }
                // set data context for next iteration
                data = data[segment]
            }
        }
    }
    // if data value is alredy the same do not set
    if (data[localProperty] === value) {
        return false
    }
    // set property in data
    data[localProperty] = value
    // return true if value changed
    return true
}

/* static methods */

/**
 * @function component
 *
 * get component - throws error if not defined
 *
 * @param {string} name
 *
 * @returns {ImmutableCoreComponent}
 *
 * @throws {Error}
 */
function component (name) {
    // get component by name from global register
    var component = components[name]
    // throw error if not defined
    if (!defined(component)) {
        throw new Error(name+' component not defined')
    }
    // return component
    return component
}

/**
 * @function reset
 *
 * clear global registers
 */
function reset () {
    bindsById = {}
    components = {}
    nestedProperties = {}
}

/* private methods */

/**
 * @function getBindTagName
 *
 * get element details for bind - this is only done once
 *
 * @param {object} bind
 * @param {object} element
 */
function getBindTagName (bind, element) {
    // get element tag name
    var tagName = element.tagName.toLowerCase()
    // if tag is input also get type
    if (tagName === 'input') {
        var type = element.getAttribute('type')
    }
    // require supported type
    if (!defined(bindElementTypes[tagName])) {
        throw new Error('unsupported element '+type)
    }
    // set tagName and type for bind
    bind.tagName = tagName
    bind.type = type
}

/**
 * @function getBindValue
 *
 * get the value of bound element. either boolean for checkbox/radio or
 * string for others. returns true if value changed and false if not.
 *
 * @param {object} bind
 * @param {object} element
 *
 * @returns {boolean}
 */
function getBindValue (bind, element) {
    // get element if not passed
    if (!defined(element)) {
        element = getId(bind.elementId)
        // if element is not found then do not continue
        if (!defined(element)) {
            return false
        }
    }
    // get tag name and type for bind if not defined
    if (!defined(bind.tagName)) {
        getBindTagName(bind, element)
    }
    // if element is checkbox or radio then get checked attribute
    var value = bind.tagName === 'input' && (bind.type === 'checkbox' || bind.type === 'radio') ? element.checked : element.value
    // for radio button need to uncheck all others
    if (bind.type === 'radio' && element.checked === true) {
        uncheckRadios(bind, element)
    }
    // if value not changed then do not continue
    if (value === bind.value) {
        return false
    }
    // set new value
    else {
        bind.value = value
        return true
    }
}

/**
 * @function setBindValue
 *
 * get the value of bound element. either boolean for checkbox/radio or
 * string for others.
 *
 * @param {object} bind
 * @param {string} value
 * @param {object} element
 *
 * @returns {boolean}
 */
function setBindValue (bind, value, element) {
    // do not set undefined
    if (!defined(value)) {
        return false
    }
    // if value not changed do not continue
    if (bind.value === value) {
        return false
    }
    // get element if not passed
    if (!defined(element)) {
        element = getId(bind.elementId)
        // if element is not found then do not continue
        if (!defined(element)) {
            return false
        }
    }
    // get tag name and type for bind if not defined
    if (!defined(bind.tagName)) {
        getBindTagName(bind, element)
    }
    // set value on bind
    bind.value = value
    // if element is checkbox or radio then get checked attribute
    if (bind.tagName === 'input' && (bind.type === 'checkbox' || bind.type === 'radio')) {
        // set value on element
        element.checked = !!bind.value
        // for radio button need to uncheck all others
        if (bind.type === 'radio' && element.checked === true) {
            uncheckRadios(bind, element)
        }
    }
    // otherwise get value
    else {
        // set value on element
        element.value = bind.value
    }
    // return true when value set
    return true
}

/**
 * @function uncheckRadios
 *
 * uncheck all other radios except the given element
 *
 * @param {object} bind
 * @param {object} element
 */
function uncheckRadios (bind, element) {
    // get name of radio element
    var name = element.getAttribute('name')
    // select all radio elements with same name
    var nodes = document.querySelectorAll('input[name='+name+']')
    // do nothing if none
    if (!nodes) {
        return
    }
    // uncheck all except the current
    nodes.forEach(function (node) {
        // skip current element
        if (node.id === bind.elementId) {
            return
        }
        // get bind for element
        var nodeBinds = bindsById[node.id]
        // skip unless bound
        if (!defined(nodeBinds)) {
            return
        }
        // set all bound properties to false
        nodeBinds.forEach(function (nodeBind) {
            nodeBind.component.set(nodeBind.property, false)
        })
    })
}

/* global service setup */

// capture all change and input events on document
document.addEventListener('change', bindEventHandler)
document.addEventListener('input', bindEventHandler)

setInterval(refreshHandler, 50)

/**
 * @function bindEventHandler
 *
 * event handler that catches all change and input events and checks to see
 * if there are any binds on the element and sets the current value if there
 * are.
 *
 * @param {object} event
 */
function bindEventHandler (event) {
    // get bind by event target id
    var binds = bindsById[event.target.id]
    // if target id does not have id then do nothing
    if (!defined(binds)) {
        return
    }
    // get value of element - use first bind - if there are more than one the
    // must all be to the same id - if false value not changed
    if (!getBindValue(binds[0], event.target)) {
        return
    }
    // set value in data
    binds.forEach(function (bind) {
        bind.component.set(bind.property, bind.value, event)
    })
}

var skip = false;

/**
 * @function refreshHandler
 *
 * refresh/re-render components as needed at a fixed interval
 */
function refreshHandler () {
    // get number of components
    var length = componentList.length
    // check each component
    for (var i=0; i < length; i++) {
        var component = componentList[i]
        // if component is not clean then re-render
        if (!component.clean) {
            component.render()
        }
    }
}

})();