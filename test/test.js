module('Cache');

test('FIFO', function() {
    var fifo = new Cache({
        algorithm: 'fifo'
    });
console.log(fifo);
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