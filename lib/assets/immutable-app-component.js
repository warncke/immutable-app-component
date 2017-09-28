(function () {

'use strict'

// null function to use for default hook
function nullFunction () {}
// helper to check if variable defined
function defined (arg) { return arg !== undefined}

// do not re-initialize if already defined
if (defined(window.ImmutableAppComponent)) {
    return
}

// export constructor
window.ImmutableAppComponent = ImmutableAppComponent

// global register of components
var components = {}

// map of supported bind elements
var bindElementTypes = {
    input: true,
    textarea: true,
    select: true,
}

// list of supported hooks
var hooks = [
    preBind,
    preGet,
    preRefresh,
    preRender,
    preSet,
    postBind,
    postGet,
    postRefresh,
    postRender,
    postSet,
]

// required arguments
var requiredArgs = [
    'id',
]

// optional arguments
var optionalArgs = [
    'refreshInterval'
]

// map of binds by id for the entire document
var bindsById = {}

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
        this[arg] = args[arg]
    })
    // set optional args
    optionalArgs.forEach(function (arg) {
        // set arg if defined
        if (defined(args[arg])) {
            this[arg] = args[arg]
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
            this[arg] = args[arg]
        }
    })
    // map of bound properties to ids
    this.bindsByProperty = {}
}

// static methods

// public methods
ImmutableAppComponent.prototype = {
    bind: bind,
    get: get,
    refresh: refresh,
    render: render,
    set: set,
    // default hooks
    preBind,
    preGet,
    preRefresh,
    preRender,
    preSet,
    postBind,
    postGet,
    postRefresh,
    postRender,
    postSet,
}

/** 
 * @function bind
 *
 * bind element to property
 *
 * @param {string} elementId
 * @param {string} property
 *
 * @returns {boolean}
 */
function bind (elementId, property) {
    // run pre-bind hook first and do not continue if it returns false
    if (this.preBind(elementId, property) === false) {
        return
    }
    // get element
    var element = document.getElementById(elementId)
    // require element
    if (element === null) {
        throw new Error(elementId+' not found')
    }
    // get element tag name
    var tagName = element.tagName.toLowerCase()
    // if tag is input also get type
    if (tagName === 'input') {
        var type = element.getAttribute('type')
    }
    // require supported type
    if (!defined(bindElementTypes[type])) {
        throw new Error('unsupported element '+type)
    }
    // instantiate new Bind instance - throws error if element does not exist
    var bind = {
        component: this,
        elementId: elementId,
        element: element,
        property: property,
        tagName: tagName,
        type: type,
    }
    // get current value of element
    getBindValue(bind)
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
    // if simple property is defined then return
    if (defined(this.data[property])) {
        return this.data[property]
    }
    // otherwise split and lookup
    var segments = property.split(/\[|\]|\./)
    // get number of segments not including the last
    var length = segments.length
    // set initial data state
    var data = this.data
    // lookup each segment
    for (var i=0; i < length; i++) {
        var segment = segments[i]
        // skip segments with no length
        if (segment.length === 0) {
            continue
        }
        // if segment does not have value then none of the nested segments
        /// will have values either
        if (!defined(data[segment])) {
            return
        }
        // set data for next interation
        data = data[segment]
    }
    // try to get value from data
    return typeof data === 'object' && data ? data[segments[i+1]] : undefined
}

function set (property, value, event) {
    // split property to check for nested properties
    var segments = property.split(/\[|\]|\./)
}

/* private methods */

/**
 * @getBindValue
 *
 * get the value of bound element. either boolean for checkbox/radio or
 * string for others.
 *
 * @param {object} bind
 *
 * @returns {}
 */
function getBindValue (bind) {
    // if element is checkbox or radio then get checked attribute
    if (bind.tagName === 'input' && (bind.type === 'checkbox' || bind.type === 'radio')) {
        // set value on bind
        bind.value = bind.element.checked
    }
    // otherwise get value
    else {
        // set value on bind
        bind.value = bind.element.value
    }
    // return bind value
    return bind.value
}

/**
 * @setBindValue
 *
 * get the value of bound element. either boolean for checkbox/radio or
 * string for others.
 *
 * @param {object} bind
 *
 * @returns {}
 */
function setBindValue (bind, value) {
    // set value on bind
    bind.value = value
    // if element is checkbox or radio then get checked attribute
    if (bind.tagName === 'input' && (bind.type === 'checkbox' || bind.type === 'radio')) {
        // set value on element
        bind.element.checked = !!bind.value
    }
    // otherwise get value
    else {
        // set value on element
        bind.element.value = bind.value
    }
}

})();