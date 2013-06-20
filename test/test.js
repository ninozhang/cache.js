var undef;

module('Cache');

test('cache._type', function () {
    var cache = new Cache(),
        entry;

    equal(cache._type(true), 'boolean', 'type');
    equal(cache._type('abc'), 'string', 'type');
    equal(cache._type(123), 'number', 'type');
    equal(cache._type(Cache), 'function', 'type');
    equal(cache._type([]), 'array', 'type');
    equal(cache._type(new Date()), 'date', 'type');
    equal(cache._type({}), 'object', 'type');
});

test('cache._extend', function () {
    var cache = new Cache(),
        entry;

    deepEqual(cache._extend({'a': 'a'}, {'b': 'b'}), {'a': 'a', 'b': 'b'}, 'extend');
});

test('cache.size', function () {
    var cache = new Cache(),
        entry;

    equal(cache.size, 0, 'size');
    cache._counter(1);
    equal(cache.size, 1, 'size');
    cache._counter(2);
    equal(cache.size, 3, 'size');
    cache._counter(-2);
    equal(cache.size, 1, 'size');
});

test('cache._now', function () {
    var cache = new Cache(),
        entry;

    equal(cache._type(cache._now()), 'number', 'now');
});

test('cache._wrap', function () {
    var cache = new Cache(),
        entry;

    entry = cache._wrap('a', 'b', 10);
    equal(entry.key, 'a', 'wrap');
    equal(entry.value, 'b', 'wrap');
    equal(cache._type(entry.exp), 'number', 'wrap');
});

asyncTest('cache._isExpire', function() {
    var cache = new Cache(),
        entry1 = cache._wrap('a', 'b', 1),
        entry2 = cache._wrap('a', 'b', 3);
    setTimeout(function() {
        equal(cache._isExpire(entry1), true, 'isExpire');
        equal(cache._isExpire(entry2), false, 'isExpire');
        start();
    }, 1200);
});

test('cache._clone', function () {
    var cache = new Cache(),
        obj;

    obj = cache._clone('a');
    equal(obj, 'a', 'clone');
    obj = cache._clone({'a': 'a', 'b': 'b', 'c': 'c'});
    deepEqual(obj, {'a': 'a', 'b': 'b', 'c': 'c'}, 'clone');
    obj = cache._clone({'a': 'a', 'b': 'b', 'c': 'c'}, ['a']);
    deepEqual(obj, {'a': 'a'}, 'clone');
});

test('FIFO', function () {
    var cache = new Cache({
        algorithm: 'fifo',
        ns: 'fifo',
        maxSize: 2
    });
    cache.set('a', 'a');
    equal(cache.get('a'), 'a', 'get');
    equal(cache.has('a'), true, 'has');
    equal(cache.has('b'), false, 'has');
    cache.set('b', 'b');
    equal(cache.has('b'), true, 'has');
    equal(cache.size, 2, 'size');
    cache.set('c', 'c');
    equal(cache.size, 2, 'size');
    equal(cache.get('a'), void(0), 'cache');

    cache.config({
        maxSize: 3
    });
    cache.set('d', 'd');
    equal(cache.get('d'), 'd', 'get');
    equal(cache.size, 3, 'size');

    var arr = [];
    cache.each(function (value, key) {
        arr.push(value);
    });
    deepEqual(arr, ['b', 'c', 'd'], 'each');
    arr = [];
    cache.each(function (value, key) {
        this.push(value);
    }, arr, true);
    deepEqual(arr, ['d', 'c', 'b'], 'each.reverse');

    cache.add('d', 'dd');
    equal(cache.get('d'), 'd', 'get');

    cache.remove('d');
    equal(cache.get('d'), void(0), 'remove');

    cache.add('d', ['d']);
    cache.append('d', 'e');
    cache.append('d', ['f', 'g']);
    cache.prepend('d', 'c');
    cache.prepend('d', ['a', 'b']);
    deepEqual(cache.get('d'), ['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'append, prepend');

    cache.add('nini', 'nino');
    cache.add('nino', 'nino');
    cache.add('nono', 'nono');
    cache.remove('ni*');
    equal(cache.get('nini'), void(0), 'remove *');
    equal(cache.get('nino'), void(0), 'remove *');
    equal(cache.get('nono'), 'nono', 'remove *');

    cache.flush();
    equal(cache.get('a'), void(0), 'flush');
    equal(cache.get('b'), void(0), 'flush');
    equal(cache.get('c'), void(0), 'flush');
    equal(cache.get('d'), void(0), 'flush');
});

asyncTest('FIFO.exp', function() {
    var cache = new Cache(4, 'fifo', 'fifo-exp');
    cache.set('a', 1, 0);
    cache.set('b', 2, 1);
    cache.set('c', 3, 3);
    setTimeout(function() {
        equal(cache.has('a'), true);
        equal(cache.has('b'), false);
        equal(cache.has('c'), true);
        start();
    }, 1200);
});

test('LFU', function () {
    var lfu = new Cache({
        algorithm: 'lfu'
    });
    ok('lfu');
});

test('LRU', function () {
    var cache = new Cache({
        algorithm: 'lru',
        ns: 'lru',
        maxSize: 2
    });
    cache.set('a', 'a');
    equal(cache.get('a'), 'a', 'get');
    equal(cache.has('a'), true, 'has');
    equal(cache.has('b'), false, 'has');
    cache.set('b', 'b');
    equal(cache.has('b'), true, 'has');
    equal(cache.size, 2, 'size');
    cache.set('c', 'c');
    equal(cache.size, 2, 'size');
    equal(cache.get('a'), void(0), 'cache');

    cache.config({
        maxSize: 3
    });
    cache.set('d', 'd');
    equal(cache.get('d'), 'd', 'get');
    equal(cache.size, 3, 'size');

    cache.add('d', 'dd');
    equal(cache.get('d'), 'd', 'get');

    cache.remove('d');
    equal(cache.get('d'), void(0));

    cache.add('d', ['d']);
    cache.append('d', 'e');
    cache.append('d', ['f', 'g']);
    cache.prepend('d', 'c');
    cache.prepend('d', ['a', 'b']);
    deepEqual(cache.get('d'), ['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'append, prepend');

    cache.set('d', 'd');
    cache.get('b');
    cache.get('c');
    cache.get('d');
    // b < c < d

    cache.set('a', 'a');
    equal(cache.get('b'), void(0), 'get');
    equal(cache.get('c'), 'c', 'get');
    equal(cache.get('d'), 'd', 'get');
    equal(cache.get('a'), 'a', 'get');
    // c < d < a

    var arr = [];
    cache.each(function (value, key) {
        arr.push(value);
    });
    deepEqual(arr, ['c', 'd', 'a'], 'each');
    arr = [];
    cache.each(function (value, key) {
        this.push(value);
    }, arr, true);
    deepEqual(arr, ['a', 'd', 'c'], 'each-reverse');

    cache.set('b', 'b');
    equal(cache.get('a'), 'a', 'get');
    equal(cache.get('b'), 'b', 'get');
    equal(cache.get('c'), void(0), 'get');
    equal(cache.get('d'), 'd', 'get');

    cache.add('nini', 'nino');
    cache.add('nino', 'nino');
    cache.add('nono', 'nono');
    cache.remove('ni*');
    equal(cache.get('nini'), void(0), 'remove *');
    equal(cache.get('nino'), void(0), 'remove *');
    equal(cache.get('nono'), 'nono', 'remove *');

    cache.flush();
    equal(cache.get('a'), void(0), 'flush');
    equal(cache.get('b'), void(0), 'flush');
    equal(cache.get('c'), void(0), 'flush');
    equal(cache.get('d'), void(0), 'flush');
});

test('Random', function () {
    var random = new Cache({
        algorithm: 'random'
    });
    ok('random');
});