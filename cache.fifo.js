/**
 * 示意图:
 *
 *       value     value     value     value
 *       ______    ______    ______    ______
 *      |first |  |      |  |      |  | last |
 *      |  A   |  |  B   |  |  C   |  |  D   |
 *      |______|  |______|  |______|  |______|
 *
 *  将被移除  <--  <--  <--  <--  <--  <--  新添加
 */
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
        },
        _set: function (key, value) {
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
        },
        _add: function (key, value) {
            if (!this.has(key)) {
                this.set(key, value);
            }
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
        },
        _each: function(fn, context, reverse) {
            var data = this.data,
                key;
            if (!reverse) {
                for (key in data) {
                    fn.call(context, data[key], key);
                }
            } else {
                var keys = [];
                for (key in data) {
                    keys.push(key);
                }
                for (var i = keys.length - 1; i >= 0; i--) {
                    key = keys[i];
                    fn.call(context, data[key], key);
                }
            }
        },
        _remove: function (key) {
            if (this.has(key)) {
                var value = this.data[key];
                delete this.data[key];
                this.removeLocal(key);
                this.counter(-1);
                return value;
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