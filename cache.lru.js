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

(function() {
var Cache = window.Cache;
if (!Cache) {
    return;
}
Cache.extend({
    'lru': {
        init: function() {
            this.data = {};
            this.head = null;
            this.tail = null;
            this.getAllLocal();
        },
        set: function (key, value) {
            var entry = {
                    key: key,
                    value: value,
                    next: null,
                    prev: null
                };

            this.remove(key);
            while (!isNaN(this.maxSize) &&
                this.size >= this.maxSize) {
                this.pop();
            }

            this.data[key] = entry;
            this.counter(1);

            if (this.tail) {
                this.tail.next = entry;
                entry.prev = this.tail;
            } else {
                this.head = entry;
            }
            this.tail = entry;

            if (this.inited === true &&
                this.persistent === true) {
                this.setLocal(key, value);
            }
        },
        add: function (key, value) {
            if (!this.has(key)) {
                this.set(key, value);
            }
        },
        has: function(key) {
            return !!this.data[key];
        },
        get: function (key) {
            var entry = this.data[key];
            if (!entry) {
                return;
            }
            this.set(entry.key, entry.value);
            return entry.value;
        },
        pop: function() {
            if (this.head) {
                this.remove(this.head.key);
            }
        },
        each: function(fn, context, reverse) {
            var entry = reverse ? this.tail : this.head,
                flag = reverse ? 'prev' : 'next';
            while (entry) {
                fn.call(context, entry.value, entry.key);
                entry = entry[flag];
            }
        },
        remove: function (key) {
            var entry = this.data[key];
            if (!entry) {
                return;
            }
            delete this.data[entry.key];
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
            this.removeLocal(key);
            this.counter(-1);
            return entry.value;
        },
        flush: function () {
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