module.exports = (function () {
    function PostMessage(window) {
        this.eventObject = {
            trigger: (function(event, data) {
                try {
                    var event = new CustomEvent(event, {detail: data}); // Not working in IE
                } catch(e) {
                    var event = document.createEvent('CustomEvent');
                    event.initCustomEvent(event, true, true, data);
                }
                document.dispatchEvent(event);
            }).bind(this),
            on: (function(event, handle, options) {
                document.addEventListener(event, handle, options);
            }).bind(this),
            off: (function(event, handle, options) {
                document.removeEventListener(event, handle, options);
            }).bind(this)
        };

        this.linkedWindow = window;

        global.window.addEventListener && global.window.addEventListener("message", (function (event) {
            if (event.source !== this.linkedWindow) {
                return;
            }

            var message = {};
            if (typeof event.data === 'string' && global.JSON !== undefined) {
                try {
                    message = global.JSON.parse(event.data);
                } catch (e) {
                }
            }

            if (message.command) {
                this.eventObject.trigger(message.command, message.data);
            }
        }).bind(this));
    }

    /** Private Members **/
    PostMessage.prototype.eventObject = null;
    PostMessage.prototype.linkedWindow = null;

    /** Public Members **/
    PostMessage.prototype.send = function(command, data, targetOrigin) {
        if (data === undefined) {
            data = {};
        }

        if (targetOrigin === undefined) {
            targetOrigin = '*';
        }

        if (!this.linkedWindow || this.linkedWindow.postMessage === undefined || global.window.JSON === undefined) {
            return false;
        }

        try {
            this.linkedWindow.postMessage(global.JSON.stringify({data: data, command: command}), targetOrigin);
        } catch (e) {
        }

        return true;
    };

    PostMessage.prototype.on = function (event, handle, options) {
        document.addEventListener(event, handle, options);
    };

    PostMessage.prototype.off = function (event, handle, options) {
        document.removeEventListener(event, handle, options);
    };

    return PostMessage;
})();
