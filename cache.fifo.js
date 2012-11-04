(function() {
var Cache = window.Cache;
if (!Cache) {
    return;
}
Cache.extend({
    'fifo': {
        _init: function() {
            this.data = {};
            this.getAllLocal();
            this.inited = true;
        },
        _set: function (key, value) {
            if (typeof value === 'undefined') {
                return this;
            }
            var data = this.data;
            if (typeof data[key] === 'undefined') {
                while (!isNaN(this.maxSize) &&
                    this.size >= this.maxSize) {
                    this.pop();
                }
                this.counter(1);
            }
            data[key] = value;
            if (this.inited === true &&
                this.persistent === true) {
                this.setLocal(key, value);
            }
            return this;
        },
        _add: function (key, value) {
            if (typeof this.data[key] === 'undefined') {
                this.set(key, value);
            }
            return this;
        },
        _has: function(key) {
            return typeof this.data[key] !== 'undefined';
        },
        _get: function (key) {
            return this.data[key];
        },
        _pop: function() {
            for (var key in this.data) {
                var value = this.data[key];
                this.remove(key);
                return value;
            }
            return null;
        },
        _each: function(fn, context, reverse) {
            if (!fn) {
                return this;
            }
            var data = this.data,
                key;
            if (!context) {
                context = this;
            }
            reverse = reverse === true;
            if (!reverse) {
                for (key in data) {
                    fn.call(context, data[key], key);
                }
            } else {
                var keys = [];
                for (key in data) {
                    keys.push(key);
                }
                for (var i = keys.length - 1; i <= 0; i--) {
                    key = keys[i];
                    fn.call(context, data[key], key);
                }
            }
            return this;
        },
        _remove: function (key) {
            if (this.has(key)) {
                delete this.data[key];
                this.removeLocal(key);
                this.counter(-1);
            }
        },
        _flush: function () {
            for (var key in this.data) {
                this.remove(key);
            }
            this.data = {};
            this.size = 0;
        }
    }
});
})();