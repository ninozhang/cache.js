var map = new HashMap(),
    key1, value1,
    key2, value2;

module('HashMap');

test('set', function() {
    equal(map.get('not-exists'), void(0), '获取未设置的值');

    equal(map.isEmpty(), true, '判断是否为空');

    map.set('test', 'test');
    equal(map.get('test'), 'test', '设置字符串并取出');

    equal(map.size(), 1, 'size()获取数量是否正确，1个');
    equal(map.length, 1, 'length属性获取数量是否正确，1个');

    map.set(1, 2);
    equal(map.get(1), 2, '设置数值并取出');

    equal(map.size(), 2, 'size()获取数量是否正确，2个');
    equal(map.length, 2, 'length属性获取数量是否正确，2个');

    key1 = {id: 1};
    value1 = {name: 'map1'};
    key2 = {id: 2};
    value2 = {name: 'map2'};

    map.set(key1, value1);
    equal(map.get(key1), value1, '设置对象并取出');
    deepEqual(map.get({id: 1}), {name: 'map1'}, '设置对象并取出');
    notEqual(map.get(key1), {name: 'map1'}, '设置对象并取出');
    deepEqual(map.get(key1), {name: 'map1'}, '设置对象并取出');

    equal(map.has('test'), true, '判断是否存在对应的值');
    equal(map.has(1), true, '判断是否存在对应的值');
    equal(map.has(key1), true, '判断是否存在对应的值');

    map.add('test', true);
    equal(map.get('test'), 'test', '无法保存已存在key');

    map.add('test2', true);
    equal(map.get('test2'), true, '保存未存在的key');

    equal(map.size(), 4, 'size()获取数量是否正确，4个');
    equal(map.length, 4, 'length属性获取数量是否正确，4个');

    equal(map.isEmpty(), false, '判断是否为空');

    deepEqual(map.keys(), ['test', 1, key1, 'test2'], '获取当前存在的keys');

    map.remove(key1);
    deepEqual(map.keys(), ['test', 1, 'test2'], '获取当前存在的keys');

    map.remove(1);
    deepEqual(map.keys(), ['test', 'test2'], '获取当前存在的keys');

    equal(map.size(), 2, 'size()获取数量是否正确，2个');
    equal(map.length, 2, 'length属性获取数量是否正确，2个');

    var keys = [],
        values = [],
        expectedKeys = ['test', 'test2'],
        expectedValues = ['test', true];
    map.each(function(value, key) {
        values.push(value);
        keys.push(key);
    });
    deepEqual(keys, expectedKeys, '遍历');
    deepEqual(values, expectedValues, '遍历');
    deepEqual(map.keys(), expectedKeys, '获取keys');
    deepEqual(map.values(), expectedValues, '获取values');

    map.clear();
    equal(map.size(), 0, 'size()获取数量是否正确，0个');
    equal(map.length, 0, 'length属性获取数量是否正确，0个');

    var defaultValue = function() {
            var name = this.name || null;
            return 'this is ' + name;
        },
        context = {name: 'map'};
    equal(map.get(1, '1'), '1', '获取默认值, 有默认值');
    equal(map.get(2, defaultValue), defaultValue, '获取默认值, 不执行方法');
    equal(map.get(3, defaultValue, true), 'this is null', '获取默认值, 执行方法');
    equal(map.get(4, defaultValue, true, context), 'this is map', '获取默认值, 执行方法');

    equal(map.size(), 4, 'size()获取数量是否正确，4个');
    equal(map.length, 4, 'length属性获取数量是否正确，4个');

});