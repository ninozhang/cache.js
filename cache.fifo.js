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
(function () {
var Cache = window.Cache;
if (!Cache || !Cache.extend) {
    return;
}
Cache.extend({
    'fifo': {
        _init: function () {
            this.data = {};
        },
        _set: function (entry) {
            if (this._type(this.get(entry.key)) === 'undefined') {
                this._popExtra();
                this._counter(1);
            }
            this.data[entry.key] = entry;
            if (this.persistent === true) {
                this._setLocal(entry);
            }
        },
        _has: function (key) {
            return this._type(this.get(key)) !== 'undefined';
        },
        _get: function (key) {
            return this.data[key];
        },
        _pop: function () {
            for (var key in this.data) {
                var entry = this.data[key];
                this.remove(key);
                return entry;
            }
        },
        _each: function (fn, reverse) {
            var data = this.data,
                key;
            if (!reverse) {
                for (key in data) {
                    fn.call(this, data[key], key);
                }
            } else {
                var keys = [];
                for (key in data) {
                    keys.push(key);
                }
                for (var i = keys.length - 1; i >= 0; i--) {
                    key = keys[i];
                    fn.call(this, data[key], key);
                }
            }
        },
        _remove: function (key) {
            if (this.has(key)) {
                var entry = this.data[key];
                delete this.data[key];
                this._removeLocal(key);
                this._counter(-1);
                return entry;
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