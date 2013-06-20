(function () {
var class2type = {},
    toString = class2type.toString,
    cachePrefix = 'cache',
    defaults = {
        inited: false, // 初始化
        size: 0, // 当前缓存容量
        maxSize: NaN, // 缓存容量上限
        ttl: NaN, // 
        sign: ':', // 存储 key 的分隔符
        algorithm: 'lru', // 缓存算法
        ns: 'cache', // 命名空间
        persistent: true // 持久化
    },
    undef;

['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'].forEach(function (name) {
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

function Cache(size, algorithm, ns, persistent) {
    var options;
    if (this._type(size) === 'object') {
        options = size;
    } else {
        options = {};
        if (size) {
            options.size = size;
        }
        if (algorithm) {
            options.algorithm = algorithm;
        }
        if (ns) {
            options.ns = ns;
        }
        if (this._type(persistent) === 'boolean') {
            options.persistent = persistent;
        }
    }
    // 设置默认参数
    extend(this, defaults, options);
    // 初始化算法
    this._switchAlgorithm(this.algorithm);
}

Cache.extend = function (algorithms) {
    extend(Cache.prototype.algorithms, algorithms);
};

Cache.prototype.algorithms = {};

// 提供动态设置参数
Cache.prototype.config = function (options) {
    var hasChange = false;
    if (!options) {
        return;
    }

    // 判断是否持久化
    if (type(options.persistent) === 'boolean' &&
        this.persistent !== options.persistent) {
        this._removeAllLocal();
        this.persistent = options.persistent;
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
        this._setAllLocal();
    }

    // 改变缓存算法
    if (type(options.algorithm) === 'string' &&
        this.algorithms !== options.algorithm) {
        this.algorithms = options.algorithm;
        this._switchAlgorithm(this.algorithm);
    }
};

Cache.prototype.get = function (key) {
    var entry = this._get(key);
    if (entry && !this._isExpire(entry)) {
        return this._clone(entry.value);
    }
};

Cache.prototype.pop = function () {
    var entry = this._pop(this);
    return entry && entry.value;
};

Cache.prototype.set = function (key, value, exp) {
    if (this._type(value) === 'undefined') {
        return this;
    }
    var entry = this._wrap(key, value, exp);
    this._set(entry);
    return this;
};

Cache.prototype.add = function (key, value, exp) {
    if (type(this.get(key)) === 'undefined') {
        this.set(key, value, exp);
    }
    return this;
};

Cache.prototype.replace = function (key, value, exp) {
    if (type(this.get(key)) !== 'undefined') {
        this.set(key, value, exp);
    }
    return this;
};

Cache.prototype.append = function (key, value, exp) {
    return this._pend(key, value, exp, 'append');
};

Cache.prototype.prepend = function (key, value, exp) {
    return this._pend(key, value, exp, 'prepend');
};

Cache.prototype.has = function (key) {
    return this._has(key);
};

Cache.prototype.each = function (fn, context, reverse) {
    if (!fn) {
        return;
    }
    if (!context) {
        context = this;
    }
    var iterator = function (entry, key) {
        if (entry) {
            fn.call(context, entry.value, key);
        }
    };
    reverse = reverse === true;
    this._each(iterator, reverse);
    return this;
};

Cache.prototype.remove = function (key) {
    if (!key) {
        return;
    }
    if (key.indexOf('*') > -1) {
        var prefix = key.substring(0, key.indexOf('*'));
        this.each(function (value, key) {
            if (key.indexOf(prefix) === 0) {
                this.remove(key);
            }
        }, this);
    } else {
        return this._remove(key);
    }
};

Cache.prototype.restore = function () {
    var entries = this._getAllLocal();
    entries.forEach(function (entry) {
        this.data[entry.key] = entry;
    }, this);
};

Cache.prototype.flush = function () {
    this._flush();
    return this;
};

Cache.prototype._setLocal = function (entry) {
    var key = [cachePrefix, this.ns, entry.key].join(this.sign),
        newEntry = this._clone(entry, ['key', 'value', 'exp']);
    localStorage.setItem(key, this._stringify(newEntry));
    return this;
};

Cache.prototype._getLocal = function (key) {
    var k = [cachePrefix, this.ns, key].join(this.sign),
        item = localStorage.getItem(key);
    if (!item) {
        return;
    }
    entry = this._parse(item);
    if (this._isExpire(entry)) {
        return;
    }
    return entry;
};

Cache.prototype._removeLocal = function (key) {
    var k = [cachePrefix, this.ns, key].join(this.sign);
    localStorage.removeItem(k);
    return this;
};

Cache.prototype._setAllLocal = function () {
    this._each(function (entry) {
        this._setLocal(entry);
    }, this);
    return this;
};

Cache.prototype._getAllLocal = function () {
    var length = localStorage.length,
        keyPrefix = cachePrefix + this.sign + this.ns + this.sign,
        key, item, entry,
        entries = [];
    for (var i = 0; i < length; i++) {
        key = localStorage.key(i);
        if (key && key.indexOf(keyPrefix) === 0) {
            item = localStorage.getItem(key);
            if (item) {
                entry = this._parse(item);
            }
            if (entry) {
                entries.push(entry);
            }
        }
    }
    return entries;
};

Cache.prototype._removeAllLocal = function () {
    var length = localStorage.length,
        keyPrefix = cachePrefix + this.sign + this.ns + this.sign,
        key;
    for (var i = 0; i < length; i++) {
        key = localStorage.key(i);
        if (key && key.indexOf(keyPrefix) === 0) {
            localStorage.removeItem(key);
        }
    }
    return this;
};

Cache.prototype._type = type;

Cache.prototype._extend = extend;

// 切换算法
Cache.prototype._switchAlgorithm = function (name) {
    this.inited = false;
    var algorithm = this.algorithms[name];
    if (algorithm) {
        for (var key in algorithm) {
            if (algorithm.hasOwnProperty(key)) {
                this[key] = algorithm[key];
            }
        }
        this._init();
        this.restore();
    }
    this.inited = true;
};

Cache.prototype._pend = function (key, value, exp, action) {
    if (type(key) === 'undefined' ||
        type(value) === 'undefined') {
        return this;
    }

    var entry = this._get(key);

    if (!entry) {
        return this;
    }

    // 已存储的值是数组，附加元素
    if (Array.isArray(entry.value)) {
        var array = Array.isArray(value) ? value : [value],
            length = array.length,
            i;
        if (action === 'append') {
            for (i = 0; i < length; i++) {
                entry.value.push(array[i]);
            }
        } else {
            for (i = length - 1; i >= 0; i--) {
                entry.value.unshift(array[i]);
            }
        }

    // 已存储的值是对象，附加属性
    } else if (entry.value) {
        extend(entry.value, value);
    }

    this._set(entry);
    return this;
};

Cache.prototype._counter = function (diff) {
    if (!isNaN(diff)) {
        this.size += diff;
    }
    return this.size;
};

Cache.prototype._now = function () {
    return Date.now();
};

Cache.prototype._wrap = function (key, value, exp) {
    var now = this._now(),
        entry;
    value = this._clone(value);
    entry = {
        key: key,
        value: value,
        exp: exp ? exp * 1000 + now : 0
    };
    return entry;
};

// 被动检测对象是否过期
Cache.prototype._isExpire = function (entry) {
    var now = this._now();
    if (entry &&
        ((entry.exp && entry.exp > now) ||
            !entry.exp)) {
        return false;
    }
    return true;
};

// 克隆简单对象
Cache.prototype._clone = function (obj, fields) {
    if (this._type(obj) !== 'object' && !Array.isArray(obj)) {
        return obj;
    }
    if (fields && Array.isArray(fields)) {
        var o = {};
        fields.forEach(function (field) {
            o[field] = JSON.parse(JSON.stringify(obj[field]));
        });
        return o;
    } else {
        return JSON.parse(JSON.stringify(obj));
    }
};

Cache.prototype._stringify = function (obj) {
    return obj ? JSON.stringify(obj) : undef;
};

Cache.prototype._parse = function (str) {
    return str ? JSON.parse(str) : undef;
};

// 弹走超出上限的东东，清理出一个空位
Cache.prototype._popExtra = function () {
    while (!isNaN(this.maxSize) &&
        this.size >= this.maxSize) {
        this.pop();
    }
};

window.Cache = window.Cache || Cache;
})();