(function() {
var Cache = window.Cache;
if (!Cache) {
    return;
}
Cache.extend({
    'lfu': {
        _init: function() {
            this.inited = true;
        },
        _set: function (key, value) {

        },
        _add: function (key, value) {

        },
        _get: function (key) {

        },
        _each: function(fn, context, reverse) {

        },
        _remove: function (key) {

        },
        _flush: function () {

        }
    }
});
})();