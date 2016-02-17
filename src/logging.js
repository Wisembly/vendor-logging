var WisemblyLogging = (function (global) {

    var logWrapped;

    var getEventNames = function (object) {

        var eventNames = [];

        for (var propertyName in object)
            if (propertyName.match(/^on[a-z]+$/))
                eventNames.push(propertyName.substr(2));

        return eventNames;

    };

    var wrap = function (fn, instance) {

        if (typeof fn !== 'function')
            return fn;

        if (fn.__is_log_wrap__)
            return fn;

        if (fn.__log_wrap__)
            return fn.__log_wrap__;

        var dispatch = function (error) {

            if (typeof error === 'object')
                error.__has_been_logged__ = true;

            instance.captureException(error);
            instance.rethrowError(error);

        };

        var wrapper = function () {

            var args = [];

            for (var t = 0; t < arguments.length; ++ t)
                args.push(arguments[t]);

            if (logWrapped) {
                return fn.apply(this, args);
            } else {
                logWrapped = true;
                try {
                    return fn.apply(this, args);
                } catch (error) {
                    dispatch(error);
                } finally {
                    logWrapped = false;
                }
            }

        };

        wrapper.prototype = fn.prototype;

        wrapper.__is_log_wrap__ = true;
        wrapper.__log_original_fn__ = fn;

        fn.__log_wrap__ = wrapper;

        return wrapper;

    };

    var hook = function (object, property, replacement) {

        var original;

        // Some browsers throw an exception if we try to access Element.prototype.on{Event}
        // We catch it and ignore it, since it means that the behaviour is actually there

        try {
            original = object[property];
        } catch (e) {
            original = null;
        }

        if (typeof original === 'undefined')
            return ;

        Object.defineProperty(object, property, replacement(original));

    };

    var hookEventListeners = function (instance) {

        var classes = [Window, Document, HTMLElement, XMLHttpRequest];

        for (var t = 0, T = classes.length; t < T; ++ t) {

            var prototype = classes[t].prototype;
            var eventNames = getEventNames(prototype);

            hook(prototype, 'addEventListener', function (original) {

                return { value: function (eventName, callback, useCapture) {
                    return original.call(this, eventName, wrap(callback, instance), useCapture);
                } };

            });

            hook(prototype, 'removeEventListener', function (original) {

                return { value: function (eventName, callback, useCapture) {
                    return original.call(this, eventName, callback && callback.__log_wrap__, useCapture);
                } };

            });

            for (var u = 0, U = eventNames.length; u < U; ++ u) {

                var eventName = eventNames[u];

                hook(prototype, 'on' + eventName, function (eventName) {

                    return {

                        get: function () {

                            return this['__' + eventName];

                        },

                        set: function (callback) {

                            this.removeEventListener(eventName, this['__' + eventName]);
                            this['__' + eventName] = callback;
                            this.addEventListener(eventName, this['__' + eventName]);

                        }

                    };

                }.bind(null, eventName));

            }

        }

    };

    var hookTimeout = function (instance) {

        hook(window, 'setTimeout', function (original) {

            return { value: function (callback, duration) {
                return original.call(this, wrap(callback, instance), duration);
            } };

        });

    };

    var hookInterval = function (instance) {

        hook(window, 'setInterval', function (original) {

            return { value: function (callback, duration) {
                return original.call(this, wrap(callback, instance), duration);
            } };

        });

    };

    var hookAnimationFrame = function (instance) {

        hook(window, 'requestAnimationFrame', function (original) {

            return { value: function (callback, element) {
                return original.call(this, wrap(callback, instance), element);
            } };

        });

    };

    var WisemblyLogging = function (options) {

        this.transformers = [];

        if (options && (options === true || options.hookEventListeners))
            hookEventListeners(this);

        if (options && (options === true || options.hookAnimationFrame))
            hookAnimationFrame(this);

        if (options && (options === true || options.hookTimeout))
            hookTimeout(this);

        if (options && (options === true || options.hookInterval)) {
            hookInterval(this);
        }

    };

    WisemblyLogging.prototype.addTransformer = function (transformer) {

        if (typeof transformer !== 'function')
            throw new Error('A transformer has to be a function');

        this.transformers.push(transformer);

    };

    WisemblyLogging.prototype.captureMessage = function (message, extra) {

        if (!window.logmatic)
            return ;

        for (var t = 0, T = this.transformers.length; t < T; ++ t)
            extra = this.transformers[t](extra);

        window.logmatic.log(message, extra);

    };

    WisemblyLogging.prototype.captureException = function (error, extra) {

        if (typeof error !== 'object')
            error = { message: String(error) };

        if (window.StackTrace && error.stack) {

            window.StackTrace.fromError(error).then(function (stackFrames) {
                this.captureMessage(error.message, { severity: 'error', error: { mode: 'JSException', stackFrames: stackFrames }, extra: extra });
            }.bind(this)).catch(function () {
                this.captureMessage(error.message, { severity: 'error', error: { mode: 'JSException', stackFrames: '<StackTrace error>' }, extra: extra });
            }.bind(this));

        } else {

            window.setTimeout(function () {
                this.captureMessage(error.message, { severity: 'error', error: { mode: 'JSException', stackFrames: '<StackTrace missing or missing stacktrace>' }, extra: extra });
            }.bind(this));

        }

    };

    WisemblyLogging.prototype.rethrowError = function (error) {

        throw error;

    };

    if (global)
        global.WisemblyLogging = WisemblyLogging;

    return WisemblyLogging;

})(typeof window !== 'undefined' ? window : null);
