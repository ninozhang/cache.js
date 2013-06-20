/**
 * 示意图:
 *
 *       entry            entry            entry            entry
 *       ______           ______           ______           ______
 *      | head |.next => |      |.next => |      |.next => | tail |
 *      |  A   |         |  B   |         |  C   |         |  D   |
 *      |______| <= prev.|______| <= prev.|______| <= prev.|______|
 *
 *  将被移除  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  新添加
 */

(function () {
var Cache = window.Cache;
if (!Cache || !Cache.extend) {
    return;
}
Cache.extend({
    'lru': {
        _init: function () {
            this.data = {};
            this.head = null;
            this.tail = null;
        },
        _set: function (entry) {
            this.remove(entry.key);
            this._popExtra();

            this.data[entry.key] = entry;
            this._counter(1);

            entry.prev = null;
            entry.next = null;
            if (this.tail) {
                this.tail.next = entry;
                entry.prev = this.tail;
            } else {
                this.head = entry;
            }
            this.tail = entry;

            if (this.persistent === true) {
                this._setLocal(entry);
            }
        },
        _has: function (key) {
            var entry = this.data[key];
            return entry && !this._isExpire(entry) ? true : false;
        },
        _get: function (key) {
            var entry = this.data[key];
            if (entry) {
                this._set(entry);
                return entry;
            }
        },
        _pop: function () {
            if (this.head) {
                this.remove(this.head.key);
            }
        },
        _each: function (fn, reverse) {
            var entry = reverse ? this.tail : this.head,
                flag = reverse ? 'prev' : 'next';
            while (entry) {
                fn.call(this, entry, entry.key);
                entry = entry[flag];
            }
        },
        _remove: function (key) {
            var entry = this.data[key];
            if (!entry) {
                return;
            }
            delete this.data[key];
            if (entry.next && entry.prev) {
                entry.next.prev = entry.prev;
                entry.prev.next = entry.next;
            } else if (entry.next) {
                entry.next.prev = null;
                this.head = entry.next;
            } else if (entry.prev) {
                entry.prev.next = null;
                this.tail = entry.prev;
            } else {
                this.head = null;
                this.tail = null;
            }
            this._removeLocal(key);
            this._counter(-1);
            return entry.value;
        },
        _flush: function () {
            var entry = this.head;
            while (entry) {
                this.remove(entry.key);
                entry = entry.next;
            }
            this.data = {};
            this.size = 0;
        }
    }
});
})();