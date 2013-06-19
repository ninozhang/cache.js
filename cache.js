(function() {
var class2type = {},
    toString = class2type.toString,
    cachePrefix = 'cache',
    defaults = {
        inited: false, // 初始化
        size: 0, // 当前缓存容量
        maxSize: NaN, // 缓存容量上限
        ttl: NaN, // 
        sign: ':', // 存储 key 的分隔符
        algorithm: '', // 缓存算法
        ns: '', // 命名空间
        persistent: true // 持久化
    };

['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'].forEach(function(name) {
    class2type['[object ' + name + ']'] = name.toLowerCase();
});

// 获取类型
function type(obj) {
    return obj == null ? String(obj) :
        class2type[toString.call(obj)] || 'object';
}

// 扩展
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1),
        length = args.length,
        source;
    for (var i = 0; i < length; i++) {
        source = args[i];
        for (var prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
}

// 克隆简单对象
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function Cache() {
    this._init.apply(this, arguments);
}

Cache.extend = function(algorithms) {
    extend(Cache.prototype.algorithms, algorithms);
};

Cache.prototype.algorithms = {};

Cache.prototype._init = function(options) {
    // 设置默认参数
    extend(this, defaults);
    // 设置初始化参数
    this.config(options);
};

// 提供动态设置参数
Cache.prototype.config = function(options) {
    var hasChange = false;
    if (!options) {
        return;
    }

    // 判断是否持久化
    if (type(options.persistent) === 'boolean' &&
        this.persistent !== options.persistent) {
        this.removeAllLocal();
        this.persistent = options.persistent;
        hasChange = true;
    }

    // 判断是否修改了命名空间或分隔符
    if ((type(options.ns) === 'string' &&
            this.ns !== options.ns) ||
        (type(options.sign) === 'string' &&
            this.sign !== options.sign)) {
        this.removeAllLocal();
        this.ns = options.ns || this.ns;
        this.sign = options.sign || this.sign;
        hasChange = true;
    }

    // 判断容量上限是否变化
    if (type(options.maxSize) === 'number') {
        this.maxSize = options.maxSize;
        while (this.size > this.maxSize) {
            this.pop();
            hasChange = true;
        }
    }

    // 将所有变更持久化
    if (this.persistent && hasChange) {
        this.setAllLocal();
    }

    // 改变缓存算法
    if (type(options.algorithm) === 'string' &&
        this.algorithm !== options.algorithm) {
        this.algorithm = options.algorithm;
        this._switchAlgorithm(this.algorithm);
    }
};

// 切换算法
Cache.prototype._switchAlgorithm = function(name) {
    this.inited = false;
    this.algorithm = this.algorithms[name] || {};
    if (this.algorithm.init) {
        this.algorithm.init.call(this);
    }
    this.inited = true;
};

Cache.prototype.set = function(key, value) {
    if (type(value) === 'undefined') {
        return this;
    }
    if (this.algorithm.set) {
        this.algorithm.set.call(this, key, value);
    }
    return this;
};

Cache.prototype.add = function(key, value) {
    if (type(value) === 'undefined') {
        return this;
    }
    if (this.algorithm.add) {
        this.algorithm.add.call(this, key, value);
    }
    return this;
};

Cache.prototype.replace = function(key, value) {
    if (this.get(key)) {
        this.set(key, value);
    }
    return this;
};

Cache.prototype.append = function(key, value) {
    this._pend(key, value, 'append');
    return this;
};

Cache.prototype.prepend = function(key, value) {
    this._pend(key, value, 'prepend');
    return this;
};

Cache.prototype._pend = function(key, value, action) {
    if (type(key) === 'undefined' ||
        type(value) === 'undefined') {
        return this;
    }

    var data = this.get(key);
    // 已存储的值是数组，附加元素
    if (Array.isArray(data)) {
        var array = Array.isArray(value) ? value : [value],
            length = array.length,
            i;
        if (action === 'append') {
            for (i = 0; i < length; i++) {
                data.push(array[i]);
            }
        } else {
            for (i = length - 1; i >= 0; i--) {
                data.unshift(array[i]);
            }
        }

    // 已存储的值是对象，附加属性
    } else if (data) {
        extend(data, value);
    }

    this.set(key, data);
    return this;
};

Cache.prototype.has = function(key) {
    if (this.algorithm.has) {
        return this.algorithm.has.call(this, key);
    }
    return false;
};

Cache.prototype.get = function(key) {
    if (this.algorithm.get) {
        return this.algorithm.get.call(this, key);
    }
};

Cache.prototype.pop = function(ey) {
    if (this.algorithm.pop) {
        return this.algorithm.pop.call(this);
    }
};

Cache.prototype.each = function(fn, context, reverse) {
    if (!fn) {
        return this;
    }
    if (this.algorithm.each) {
        if (!context) {
            context = this;
        }
        reverse = reverse === true;
        this.algorithm.each.call(this, fn, context, reverse);
    }
    return this;
};

Cache.prototype.remove = function(key) {
    if (key.indexOf('*') > -1) {
        var prefix = key.substring(0, key.indexOf('*'));
        this.each(function(value, key) {
            if (key.indexOf(prefix) === 0) {
                this.remove(key);
            }
        }, this);
    } else {
        if (this.algorithm.remove) {
            return this.algorithm.remove.call(this, key);
        }
    }
};

Cache.prototype.flush = function() {
    if (this.algorithm.flush) {
        this.algorithm.flush.call(this);
    }
    return this;
};

Cache.prototype._counter = function(diff) {
    if (!isNaN(diff)) {
        this.size += diff;
    }
    return this.size;
};

Cache.prototype._stringify = function(obj) {
    return JSON.stringify(obj);
};

Cache.prototype._parse = function(str) {
    return JSON.parse(str);
};

Cache.prototype.setLocal = function(key, value) {
    key = [cachePrefix, this.ns, key].join(this.sign);
    value = this.stringify(value);
    localStorage.setItem(key, value);
    return this;
};

Cache.prototype.getLocal = function(key) {
    var value;
    key = [cachePrefix, this.ns, key].join(this.sign);
    value = localStorage.getItem(key);
    return this.parse(value);
};

Cache.prototype.removeLocal = function(key) {
    key = [cachePrefix, this.ns, key].join(this.sign);
    localStorage.removeItem(key);
    return this;
};

Cache.prototype.setAllLocal = function() {
    var k, v;
    this.each(function(value, key) {
        k = [cachePrefix, this.ns, key].join(this.sign);
        v = this.stringify(value);
        localStorage.setItem(k, v);
    }, this);
    return this;
};

Cache.prototype.getAllLocal = function() {
    var length = localStorage.length,
        keyPrefix = cachePrefix + this.sign + this.ns + this.sign,
        keyStart = keyPrefix.length,
        key, value;
    for (var i = 0; i < length; i++) {
        key = localStorage.key(i);
        if (key && key.indexOf(keyPrefix) === 0) {
            value = this.parse(localStorage.getItem(key));
            key = key.substring(keyStart);
            this.set(key, value);
        }
    }
    return this;
};

Cache.prototype.removeAllLocal = function() {
    var length = localStorage.length,
        keyPrefix = [cachePrefix, this.ns].join(this.sign),
        key;
    for (var i = 0; i < length; i++) {
        key = localStorage.key(i);
        if (key && key.indexOf(keyPrefix) === 0) {
            localStorage.removeItem(key);
        }
    }
    return this;
};

window.Cache = window.Cache || Cache;
})();