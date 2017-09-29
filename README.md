# immutable-app-component

Immutable App Component integrates with the
[Immutable App](https://www.npmjs.com/package/immutable-app) ecosystem to
provide a framework for defining dynamic UI components.

Immutable App Commponent is an Immutable App module that provides the client
side runtime for components and the endpoints that clients use to communicate
with the server.

[ImmutableCoreComponent](https://www.npmjs.com/package/immutable-core-component)
is used to instantiate component classes and provides much of the functionality
that Immutable App Component exposes.

## Why use Immutable App Component

Given that there are already several large and actively developed UI frameworks
out there why use Immutable App Component?

What sets Immutable App Component apart is that it is specifically *not* meant
for Single Page Apps (SPAs) and it specifically *is* designed to support
dynamic components that integrate into a traditional server rendered HTTP
application.

Server rendered pages load and render faster, have greater compatibility, work
with SEO out of the box, are less prone to error and degrade more gracefully
when errors do occur.

Immutable App Component is ideal for applications that need some dynamic
content but do not need a full SPA.

Immutable App Component uses
[Handlebars](https://www.npmjs.com/package/handlebars) templates and
plain JavaScript so the learning curve is shallow and you do not need to set
up any additional tooling to get started.

## Component architecture overview

At its simplest a component contains a server side method that instantiates
some data and renders it with a template.

The initial page render includes the fully rendered component as well as
javascript that registers the component with a client side component service.

The compiled version of the component template is sent to the client so that
if the data changes the client can re-render the component.

On the server side components are exposed via an endpoint that allows the
client to refresh the component data. Components can be declared with a
periodic refresh interval so that they are automatically refreshed.

Components can be bound to input elements and data will be updated by new
input. Data can also be set manually via a set method. Data set on the client
will then be sent to the server component set method if supported.

The client side component service checks components on an interval and if the
component needs to be refreshed a request will be made to the server to check
if the data has changed. If the data has changed the template will be
re-rendered.

Components can also include javascript that executes on the client to integrate
the component lifecycle with other javascript on the page.

## Component directory structure

    my-app
      |
      +-- app
      |
      +-- app.js
      |
      +-- components
      |     |
      |     +-- my-component
      |     |     |
      |     |     +-- my-component.css
      |     |     +-- my-component.hbs
      |     |     +-- my-component.client.js
      |     |     +-- my-component.server.js

By default each component is stored in a separate folder in the `components`
directory at the root of the Immutable App directory where other default
directories like `app`, `assets`, `helpers` and `partials` are stored.

In this example the `my-component.server.js` file contains the server side
component definition which must be a plain object that can be passed to
`new ImmutableCoreComponent`.

`my-component.client.js` contains the client side component definition which
must be a plain object that can be passed to `new ImmutableAppComponent`
in the client browser.

`my-component.hbs` is the component template. This template will be use to
render the component on the server. It will also be compiled and delivered to
the client so that the component can be re-rendered by the client.

`my-component.css` is an optional stylesheet file that will be delivered to
the client.

Like [models](https://www.npmjs.com/package/immutable-core-model),
[controllers](https://www.npmjs.com/package/immutable-core-controller)
and templates in Immutable App, components defined in separate modules can be
extended and overriden by other modules required later in your app.

## Creating a new component

    // my-component.server.js

    module.exports = {
        new: function (args) {

        }
    }

## Using a component in your app

    // controller

    function getPage (args) {
        var myComponent = await this.component.myComponent.new({ ... })

        return {myComponent: myComponent}
    }

    // template

    <...>{{myComponent}}</...>


In controller methods components can be accessed via `this.component`. The
`new` method creates a new instance of the component. The data returned by
the `new` method is used to render the template.

The component object has a `toString` method that renders the template so the
component object can be placed in a template as a simple variable.

## ImmutableAppComponent

Every component that is rendered on the server instantiates a new instance of
that component on the client. All components are registered with the global
`ImmutableAppComponent` instance which manages the components on the page
and coordinates all communications with the server.

Every component is given a unique id which will be the component name in param
case for the first instance of the component (my-component) and with a count
appended if there are additional instances (my-component-1, my-component-2).

### Working with client component instances

    var myComponent = ImmutableAppComponent.getComponent('my-component')

The `getComponent` method on the global ImmutableAppComponent instance
will return the component instance identified by its id.

### Client component instance methods

| method name | description                                                    |
|-------------|----------------------------------------------------------------|
| bind        | bind an input elemement id to a component data property        |
| get         | get a component data property                                  |
| refresh     | request data from server and re-render if changed              |
| render      | render data on client                                          |
| set         | set a component data property                                  |

#### bind

    myComponent.bind('element-id', 'property')

Immutable App Components support the binding of input elements to data
properties that will be set from that input if it is changed.

The data property can reference deeply nested data structures via standard
JS syntax (e.g. my.deeply.nested[1].property).

This is a two-way binding so updates to the component data will also update
the bound element.

The bound element can be either inside or outside of the component.

If the bound element is inside the component then data changes triggered by the
element will not cause the component to re-render and external data changes
will be set on the element instead of doing a full re-render.

#### get

    myComponent.get('property')

Get a property from the component data state. Like `bind`, `get` also supports
accessing deeply nested data properties.

#### refresh

    myComponent.refresh()

The refresh method makes a request to the server to retrieve the latest data.
If the data has changed the client will re-render the template.

If the client sends the current data id then data will only be returned if it
has changed.

If the data has changed the client `render` method will be called to re-render
the data.

    myComponent.refresh({serverRender: true})

The `serverRender` option can be used to have the template rendered on the
server or this can set by default in the component configuration.

#### render

    myComponent.render()

The render method will execute the compiled handlebars template with the current
component data and replace the existing component in the DOM.

Every time the component is rendered its internal state is marked as `clean` and
it will not be automatically re-rendered until its data is changed.

#### set

    myComponent.set('property', value)

Set a property in the component state data. Like `bind` and `get`, `set` also
supports accessing deeply nested data properties.

Whenever set is called the `clean` property will be set to false and the
component will be automatically re-rendered at the next interval.

### Component method hooks

    myComponent.preRender = function (data) {
        ...
    }

Each component method (`bind`, `get`, `refresh`, `render`, `set`) has a pre and
a post hook that can be set with a function that customizes the component
behavior.

These methods are: `preBind`, `preGet`, `preRefresh`, `preRender`, `preSet`,
`postBind`, `postGet`, `postRefresh`, `postRender` and `postSet`.

Hooks can be used both to modify default actions and to integrate components
together and with other application code.

Hooks can be defined in the client.js file or set on the client side by code
outside of the component. Since each hook has only a single function care must
be taken to avoid overwriting hooks.

#### preBind

    myComponent.preBind = function (elementId, property, event) {
        ...
    }

`preBind` is called with the the id of the element to be bound, the name of the
property to bind to, and the name of the event to bind to which may be `change`,
`input` or `undefined` (both). If `preBind` returns `false` the bind will not be
performed.

#### preGet

    myComponent.preGet = function (property) {
        ...
    }

`preGet` is called with the name of the property to get. If `preGet` returns a
value this value will be returned to the caller of `get` and `postGet` will be
called.

#### preRefresh

    myComponent.preRefresh = function (args) {
        ...
    }

`preRefresh` is called with the arguments to refresh if there were any. If
`preRefresh` returns `false` the refresh will not be performed.

#### preRender

    myComponent.preRender = function (args) {
        ...
    }

`preRender` is called with the arguments to render if there were any. If
`preRender` returns `false` the render will not be performed.

#### preSet

    myComponent.preSet = function (property, value, event) {
        ...
    }

`preSet` is called with the property to set, and the value to set. If `preSet`
returns false the set will not be performed.

If `preSet` is called from an event handler the `event` that triggered it will
be passed as the optional third argument.

#### postBind

    myComponent.postBind = function (bind) {
        ...
    }

`postBind` is called with a data object containing information about the bind.
`postBind` will not be called if the bind failed. The return value of `postBind`
is ignored.

#### postGet

    myComponent.postGet = function (property, value) {
        ...
    }

`postGet` is called with the name of the property, and the value retrieved. If
`postGet` returns a value that value will be returned to the caller of `get`.

#### postRefresh

    myComponent.postRefresh = function (args, data) {
        ...
    }

`postRefresh` is called with the arguments to `refresh` and the data returned
from the server. If `postRefresh` returns a value that value will be called to
the caller of `refresh`.

#### postRender

    myComponent.postRender = function (args) {
        ...
    }

`postRender` is called with the args to `render` if any. Any return value will
be ignored.

#### postSet

    myComponent.postSet = function (property, value, event) {
        ...
    }

`postSet` is called with the property and value set and optionally the event that triggered the set. Any return value will be ignored.

## ImmutableCoreComponent

On the server side each component is backed by an
[Immutable Core](https://www.npmjs.com/package/immutable-core) module with
methods for `new`, `get`, and `set`.

All components are accessed through a single endpoint and the client batches
calls from multiple components into a single request.

### Instantiating a new server component

    var component = this.components.myComponent.new({...})

This syntax can be used from controllers and other Immutable Core methods using
the [Immutable AI](https://www.npmjs.com/package/immutable-ai) instance that
they are called with.

Alternatively you can do:

    var component = new ImmutableCoreComponent({
        name: 'myComponent',
        ...
    })

When the new ImmutableCoreComponent instance is instantiated the component
name will be looked up in the global component register and the `new` method on
the component module will be called with the original args.

The data return by `new` is the initial state of the component instance that
will be used to render the component.

The component will only be rendered when the `toString` method is called.

Immutable Core bind methods (`after`, `before`, `detach`, `with`) can be used to
modify and extend default component methods.

### Server component methods

    // my-component.server.js

    module.exports = {
        get: function (args) {},
        new: function (args) {},
        set: function (args) {},
    }

#### get

The get method is called whenever a client makes a `refresh` request to the
server. The resulting data will be returned to the client and used to
re-render the component. This method is optional.

#### new

The new method returns the initial data state for the component. `new` must be
called with a single object as arguments and should return a plain object. This
method is required.

#### set

The set method is called whenever data is changed by the client. The arguments
for the set method will include a `data` property that includes the full current
data state.