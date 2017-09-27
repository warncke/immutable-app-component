'use strict'

/* npm modules */
const ImmutableCore = require('immutable-core')
const ImmutableGlobal = require('immutable-global')
const _ = require('lodash')

/* application modules */
const initModule = require('./immutable-app-component/init-module')

// initialize global data
const immutableGlobal = new ImmutableGlobal('ImmutableAppComponent')

/* exports */
module.exports = ImmutableAppComponent

/** 
 * @function ImmutableAppComponent
 *
 * instantiate a new ImmutableAppComponent
 *
 * @param {object} args
 *
 * @returns {ImmutableAppComponent}
 */
function ImmutableAppComponent (args) {
    // store copy of args
    this.args = _.cloneDeep(args)
    // create ImmutableCore module and methods
    this.initModule()
}

/* public methods */
ImmutableAppComponent.prototype = {
    global: global,
    initModule: initModule,
    // class properties
    class: 'ImmutableAppComponent',
    ImmutableAppComponent: true,
}

/* static methods */
ImmutableAppComponent.global = global
ImmutableAppComponent.reset = reset

/**
 * @function global
 *
 * return global data
 *
 * @returns {object}
 */
function global () {
    return immutableGlobal.data
}

/**
 * @function reset
 *
 * reset global data
 */
function reset () {
    immutableGlobal.reset()
}