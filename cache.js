(function() {
var localStorage = window.localStorage;
var cachePrefix = 'cache',
    defaults = {
        inited: false,
        size: 0,
        maxSize: NaN,
        ttl: NaN,
        sign: ':',
        algorithm: '',
        ns: '',
        persistent: true
    };

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

function Cache() {
    this.init.apply(this, arguments);
}

Cache.extend = function(algorithms) {
    extend(Cache.prototype.algorithms, algorithms);
};

Cache.prototype.algorithms = {};

Cache.prototype.init = function(options) {
    extend(this, defaults);
    this.config(options);
};

Cache.prototype.config = function(options) {
    if (!options) {
        return;
    }
    if (typeof options.persistent === 'boolean' &&
        this.persistent !== options.persistent) {
        this.removeAllLocal();
        this.persistent = options.persistent;
    }
    if ((typeof options.ns === 'string' &&
            this.ns !== options.ns) ||
        (typeof options.sign === 'string' &&
            this.sign !== options.sign)) {
        this.removeAllLocal();
        this.ns = options.ns || this.ns;
        this.sign = options.sign || this.sign;
    }
    if (typeof options.maxSize === 'number') {
        this.maxSize = options.maxSize;
        while (this.size > this.maxSize) {
            this.pop();
        }
    }
    if (this.persistent) {
        this.setAllLocal();
    }
    if (typeof options.algorithm === 'string' &&
        this.algorithm !== options.algorithm) {
        this.algorithm = options.algorithm;
        this.switchAlgorithm(this.algorithm);
    }
};

Cache.prototype.switchAlgorithm = function(name) {
    this.inited = false;
    this.algorithm = this.algorithms[name];
    if (this.algorithm._init) {
        this.algorithm._init.call(this);
    }
};

Cache.prototype.set = function(key, value) {
    if (this.algorithm._set) {
        this.algorithm._set.call(this, key, value);
    }
    return this;
};

Cache.prototype.add = function(key, value) {
    if (this.algorithm._add) {
        this.algorithm._add.call(this, key, value);
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
    if (typeof key === 'undefined' ||
        typeof value === 'undefined') {
        return this;
    }

    var data = this.get(key);
    // 已存储得值是数组，附加元素
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
        
    // 已存储得值是对象，附加属性
    } else if (data) {
        extend(data, value);
    }

    this.set(key, data);
    return this;
};

Cache.prototype.has = function(key) {
    if (this.algorithm._has) {
        return this.algorithm._has.call(this, key);
    }
    return false;
};

Cache.prototype.get = function(key) {
    if (this.algorithm._get) {
        return this.algorithm._get.call(this, key);
    }
    return null;
};

Cache.prototype.pop = function(ey) {
    if (this.algorithm._pop) {
        return this.algorithm._pop.call(this);
    }
    return null;
};

Cache.prototype.each = function(fn, context, reverse) {
    if (this.algorithm._each) {
        this.algorithm._each.call(this, fn, context, reverse);
    }
    return this;
};

Cache.prototype.remove = function(key) {
    if (this.algorithm._remove) {
        this.algorithm._remove.call(this, key);
    }
    return this;
};

Cache.prototype.flush = function() {
    if (this.algorithm._flush) {
        this.algorithm._flush.call(this);
    }
    return this;
};

Cache.prototype.counter = function(diff) {
    if (!isNaN(diff)) {
        this.size += diff;
    }
    return this.size;
};

Cache.prototype.stringify = function(obj) {
    return JSON.stringify(obj);
};

Cache.prototype.parse = function(str) {
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