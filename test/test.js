var localStorage = window.localStorage;

module('Cache');

test('FIFO', function() {
    var fifo = new Cache({
        algorithm: 'fifo',
        ns: 'fifo',
        maxSize: 2
    });
    fifo.set('a', 'a');
    equal(fifo.get('a'), 'a', 'get');
    equal(fifo.has('a'), true, 'has');
    equal(fifo.has('b'), false, 'has');
    fifo.set('b', 'b');
    equal(fifo.has('b'), true, 'has');
    equal(fifo.size, 2, 'size');
    fifo.set('c', 'c');
    equal(fifo.size, 2, 'size');
    equal(fifo.get('a'), void(0), 'fifo');
    equal(localStorage.getItem('cache:fifo:a'), void(0), 'localStorage');
    equal(fifo.parse(localStorage.getItem('cache:fifo:b')), 'b', 'localStorage');

    fifo.config({
        sign: '-',
        maxSize: 3
    });
    fifo.set('d', 'd');
    equal(fifo.get('d'), 'd', 'get');
    equal(fifo.size, 3, 'size');
    equal(fifo.parse(localStorage.getItem('cache-fifo-d')), 'd', 'localStorage');

    fifo.add('d', 'dd');
    equal(fifo.get('d'), 'd', 'get');

    fifo.remove('d');
    equal(fifo.get('d'), void(0));

    fifo.add('d', ['d']);
    fifo.append('d', 'e');
    fifo.append('d', ['f', 'g']);
    fifo.prepend('d', 'c');
    fifo.prepend('d', ['a', 'b']);
    deepEqual(fifo.get('d'), ['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'append, prepend');
});

test('LFU', function() {
    var lfu = new Cache({
        algorithm: 'lfu'
    });
console.log(lfu);
});

test('LRU', function() {
    var lru = new Cache({
        algorithm: 'lru'
    });
console.log(lru);
});

test('Random', function() {
    var random = new Cache({
        algorithm: 'random'
    });
console.log(random);
});