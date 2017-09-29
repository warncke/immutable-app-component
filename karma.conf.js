'use strict'

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['chai', 'mocha', 'sinon', 'sinon-chai'],
        files: [
            'lib/assets/*.js',
            'client-test/*.js'
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        client: {
            chai: {
                includeStack: true
            }
        },
        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--disable-gpu',
                    '--headless',
                    '--no-sandbox',
                    '--remote-debugging-port=9222',
                ],
            },
        },
    })
}