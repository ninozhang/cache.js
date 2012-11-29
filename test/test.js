module('Cache');

test('FIFO', function() {
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
    equal(localStorage.getItem('cache:fifo:a'), void(0), 'localStorage');
    equal(cache.parse(localStorage.getItem('cache:fifo:b')), 'b', 'localStorage');

    cache.config({
        sign: '-',
        maxSize: 3
    });
    cache.set('d', 'd');
    equal(cache.get('d'), 'd', 'get');
    equal(cache.size, 3, 'size');
    equal(cache.parse(localStorage.getItem('cache-fifo-d')), 'd', 'localStorage');

    var arr = [];
    cache.each(function(value, key) {
        arr.push(value);
    });
    deepEqual(arr, ['b', 'c', 'd'], 'each');
    arr = [];
    cache.each(function(value, key) {
        this.push(value);
    }, arr, true);
    deepEqual(arr, ['d', 'c', 'b'], 'each-reverse');

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
    equal(localStorage.getItem('cache-fifo-a'), void(0), 'flush');
    equal(localStorage.getItem('cache-fifo-b'), void(0), 'flush');
    equal(localStorage.getItem('cache-fifo-c'), void(0), 'flush');
    equal(localStorage.getItem('cache-fifo-d'), void(0), 'flush');
});

test('LFU', function() {
    var lfu = new Cache({
        algorithm: 'lfu'
    });
    ok('lfu');
});

test('LRU', function() {
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
    equal(localStorage.getItem('cache:lru:a'), void(0), 'localStorage');
    equal(cache.parse(localStorage.getItem('cache:lru:b')), 'b', 'localStorage');

    cache.config({
        sign: '-',
        maxSize: 3
    });
    cache.set('d', 'd');
    equal(cache.get('d'), 'd', 'get');
    equal(cache.size, 3, 'size');
    equal(cache.parse(localStorage.getItem('cache-lru-d')), 'd', 'localStorage');

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
    cache.each(function(value, key) {
        arr.push(value);
    });
    deepEqual(arr, ['c', 'd', 'a'], 'each');
    arr = [];
    cache.each(function(value, key) {
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
    equal(localStorage.getItem('cache-fifo-a'), void(0), 'flush');
    equal(localStorage.getItem('cache-fifo-b'), void(0), 'flush');
    equal(localStorage.getItem('cache-fifo-c'), void(0), 'flush');
    equal(localStorage.getItem('cache-fifo-d'), void(0), 'flush');
});

test('Random', function() {
    var random = new Cache({
        algorithm: 'random'
    });
    ok('random');
});