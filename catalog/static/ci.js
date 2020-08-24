/*!
 * @author      Angelo Dini
 * @version     1.0
 * @copyright   Distributed under the BSD License.
 */

(function(){
    'use strict';

    // saving constants
    var VERSION = '1.0';
    var ORIGINAL = window.Class;

    // creating global class variable
    var Class = window.Class = function (obj) {
        obj = obj || {};
        // call initialize if given
        var constructor = function () {
            return (this.initialize) ? this.initialize.apply(this, arguments) : self;
        };
        // adds implement to the class itself
        if(obj.implement) {
            var self = window === this ? copy(constructor.prototype) : this;
            var imp = obj.implement;
            remove(obj, 'implement');
            obj = extend(obj, implement(imp));
        }
        // assign prototypes
        constructor.prototype = copy(obj);
        // assign correct constructor for correct instanceof comparison
        constructor.constructor = constructor;
        // save initial object as parent so it can be called by this.parent
        constructor._parent = copy(obj);
        // attaching class properties to constructor
        for(var i = 0, values = ['extend', 'implement', 'getOptions', 'setOptions']; i < values.length; i++) {
            constructor[values[i]] = Class[values[i]];
        }

        return constructor;
    };

    // adding class method extend
    Class.extend = function (obj) {
        var self = this;
        // check if implement is passed through extend
        if(obj.implement) {
            this.prototype = extend(this.prototype, implement(obj.implement));
            // remove implement from obj
            remove(obj, 'implement');
        }
        // check if we should invoke parent when its called within a method
        for(var key in obj) {
            obj[key] = typeof obj[key] === 'function' && /parent/.test(obj[key].toString()) ? (function (method, name) {
                return function () {
                    this.parent = self._parent[name];
                    return method.apply(this, arguments);
                };
            })(obj[key], key) : obj[key]
        }
        // assign new parent
        this._parent = extend(this._parent, obj, true);
        // assign new prototype
        this.prototype = extend(this.prototype, obj);
        // return the class if its assigned
        return this;
    };

    // adding class method implement
    Class.implement = function (array) {
        return this.prototype = extend(this.prototype, implement(array));
    };

    // gets options from constructor
    Class.getOptions = function () {
        return this.prototype.options || {};
    };

    // sets options for constructor
    Class.setOptions = function (options) {
        return this.prototype.options = extend(this.prototype.options, options);
    };

    // preventing conflicts
    Class.noConflict = function () {
        // reassign original Class obj to window
        window.Class = ORIGINAL;
        return Class;
    };

    // returns current running version
    Class.version = VERSION;

    // helper for assigning methods to a new prototype
    function copy(obj) {
        var F = function () {};
            F.prototype = obj.prototype || obj;
        return new F();
    }

    // insures the removal of a given method name
    function remove(obj , name, safe){
        // if save is active we need to copy all attributes over.
        if(safe) {
            var safeObj = {};
            for(var key in obj) {
                if(key !== name) safeObj[key] = obj[key];
            }
        } else {
            delete obj[name];
        }
        return safeObj || obj;
    }

    // helper for merging two object with each other
    function extend(oldObj, newObj, preserve) {
        // failsave if something goes wrong
        if(!oldObj || !newObj) return oldObj || newObj || {};

        // make sure we work with copies
        oldObj = copy(oldObj);
        newObj = copy(newObj);

        for(var key in newObj) {
            if(Object.prototype.toString.call(newObj[key]) === '[object Object]') {
                extend(oldObj[key], newObj[key]);
            } else {
                // if preserve is set to true oldObj will not be overwritten by newObj if
                // oldObj has already a method key
                oldObj[key] = (preserve && oldObj[key]) ? oldObj[key] : newObj[key];
            }
        }

        return oldObj;
    }

    // helper for implementing other classes or objects
    function implement(array) {
        var collection = {};

        for(var i = 0; i < array.length; i++) {
            // check if a class is implemented and save its prototype
            if(typeof(array[i]) === 'function') array[i] = array[i].prototype;

            // safely remove initialize
            var safe = remove(array[i], 'initialize', true);

            // we use implement again if array has the apropriate methiod, otherwise we extend
            if(safe.implement) {
                collection = implement(safe.implement);
            } else {
                collection = extend(collection, safe);
            }
        }

        return collection;
    }

})();


/*!
 * @author      Angelo Dini - github.com/finalangel/classjs-plugins
 * @copyright   Distributed under the BSD License.
 * @version     1.1.7
 */

// ensure namespace is defined
var Cl = window.Cl || {};

(function($){
    'use strict';

    // creating class
    Cl.Accordion = new Class({
        /*
            TODO 1.2.0
            - add api for additional close elements (or api triggers)?
            - add fadeIn / fadeOut options
         */

        options: {
            'index': null,
            'expanded': false,
            'event': 'click',
            'easing': 'swing',
            'duration': 300,
            'grouping': true,
            'forceClose': false,
            'disableAnchors': true,
            'autoHeight': false,
            'cls': {
                'expanded': 'expanded',
                'collapsed': 'collapsed',
                'trigger': '.trigger',
                'container': '.container',
                'text': '.text'
            },
            'lang': {
                'expanded': 'Expanded ',
                'collapsed': 'Collapsed '
            },
            'callbacks': {}
        },

        initialize: function (container, options) {
            this.container = $(container);
            this.options = $.extend(true, {}, this.options, options);

            this.triggers = this.container.find(this.options.cls.trigger);
            this.containers = this.container.find(this.options.cls.container);
            this.index = null;
            this.callbacks = this.options.callbacks;

            // cancel if triggers and containers are not even
            if(this.triggers.length !== this.containers.length) return false;

            // move to setup
            this._setup();
        },

        _setup: function () {
            var that = this;

            // set the correct height
            if(this.options.autoHeight) this._setHeight();

            // add event to each trigger
            this.triggers.on(this.options.event, function (e) {
                if(that.options.disableAnchors) e.preventDefault();
                that.toggle(that.triggers.index(this));
            });

            // prevent click events on substitutes
            if(this.options.disableAnchors) {
                this.triggers.find('a', function (e) {
                    e.preventDefault();
                });
            }

            // setup initial states
            for (var i = 0; i < this.triggers.length; i++) {
                if (this.options.expanded || this.container.data('expanded') || this.triggers.eq(i).data('expanded')) {
                    this.show(i, true);
                }
                else {
                    this.hide(i, true);
                }
            }

            // set first item
            if(this.options.index !== null) this.show(this.options.index, true);

            // check for hash
            var hash = window.location.hash;
            if(!this.options.expanded && hash !== undefined) {
                var el = this.container.find('a[href="'+hash+'"]');
                if(el.length) el.trigger(this.options.event);
            }
        },

        toggle: function (index) {
            // cancel if index is the same end forceClose disabled or not provided
            if(this.index === index && !this.options.forceClose || this.index === undefined) return false;
            // set global index
            this.index = index;

            // redirect to required behaviour
            (this.containers.eq(index).is(':visible')) ? this.hide(index) : this.show(index);

            // trigger callback
            this._fire('toggle');
        },

        show: function (index, fast) {
            // if no index is provided, show all
            this._setExpanded(index, fast);

            // trigger callback
            this._fire('show');
        },

        hide: function (index, fast) {
            // if no index is provided, hide all
            this._setCollapsed(index, fast);

            // trigger callback
            this._fire('hide');
        },

        _setExpanded: function (index, fast) {
            // exception if grouping is enabled
            if(this.options.grouping && !fast) this.hide();

            if(index === undefined) {
                if(!fast) this.containers.slideDown({
                    duration:this.options.duration,
                    easing: this.options.easing
                });
                if(fast) this.containers.show();

                this.containers
                    .attr('aria-hidden', false);

                this.triggers
                    .addClass(this.options.cls.expanded)
                    .removeClass(this.options.cls.collapsed)
                    .attr('aria-selected', true)
                    .attr('aria-expanded', true)
                        .find(this.options.cls.text).html(this.options.lang.expanded);
            } else {
                if(!fast) this.containers.eq(index)
                    .slideDown({
                        duration:this.options.duration,
                        easing: this.options.easing,
                        complete: this.callbacks.complete
                    })
                    .attr('aria-hidden', false);
                this.containers.eq(index).show();

                this.triggers.eq(index)
                    .addClass(this.options.cls.expanded)
                    .removeClass(this.options.cls.collapsed)
                    .attr('aria-selected', true)
                    .attr('aria-expanded', true)
                        .find(this.options.cls.text).html(this.options.lang.expanded);
            }

            // assign correct index
            if (typeof(index) !== 'undefined') {
                this.index = index;
            }
        },

        _setCollapsed: function (index, fast) {
            if(index === undefined) {
                if(!fast) this.containers.slideUp(this.options.duration, this.options.easing);
                if(fast) this.containers.hide();

                this.containers
                    .attr('aria-hidden', true);

                this.triggers
                    .addClass(this.options.cls.collapsed)
                    .removeClass(this.options.cls.expanded)
                    .attr('aria-selected', false)
                    .attr('aria-expanded', false)
                        .find(this.options.cls.text).html(this.options.lang.collapsed);
            } else {
                if(!fast) this.containers.eq(index)
                    .slideUp(this.options.duration, this.options.easing)
                    .attr('aria-hidden', true);
                if(fast) this.containers.eq(index).hide();

                this.triggers.eq(index)
                    .addClass(this.options.cls.collapsed)
                    .removeClass(this.options.cls.expanded)
                    .attr('aria-selected', false)
                    .attr('aria-expanded', false)
                        .find(this.options.cls.text).html(this.options.lang.collapsed);
            }
        },

        _setHeight: function () {
            this.containers.each(function (index, item) {
                $(item).height($(item).height());
            });
        },

        _fire: function (keyword) {
            // cancel if there is no callback found
            if(this.callbacks[keyword] === undefined) return false;
            // excecute callback
            this.callbacks[keyword](this);
        }

    });

})(jQuery);