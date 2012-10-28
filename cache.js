(function() {
var localStorage = window.localStorage;
var cachePrefix = 'cache:',
    defaults = {
    maxSize: NaN,
    maxMemSize: NaN,
    ttl: NaN,
    algorithm: '',
    namespace: ''
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
    if (options) {
        extend(this, options);
    }
    if (typeof this.algorithm === 'string') {
        this.switchAlgorithm(this.algorithm);
    }
};

Cache.prototype.switchAlgorithm = function(name) {
    this.algorithm = this.algorithms[name];
};

Cache.prototype.set = function(key, value) {
    var algorithm = this.algorithm;
    if (algorithm._set) {
        algorithm._set.call(this, key, value);
    }
    return this;
};

Cache.prototype.add = function(key, value) {
    var algorithm = this.algorithm;
    if (algorithm._set) {
        algorithm._set.call(this, key, value);
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
    var data = this.get(key);
    return this;
};

Cache.prototype.prepend = function(key, value) {
    var data = this.get(key);
    return this;
};

Cache.prototype.get = function(key) {
    var algorithm = this.algorithm;
    if (algorithm._get) {
        return algorithm._get.call(this, key);
    }
    return null;
};

Cache.prototype.each = function(fn, context, reverse) {
    var algorithm = this.algorithm;
    if (algorithm._each) {
        algorithm._each.call(this, fn, context, reverse);
    }
    return this;
};

Cache.prototype.remove = function(key) {
    var algorithm = this.algorithm;
    if (algorithm._remove) {
        algorithm._remove.call(this, key);
    }
    return this;
};

Cache.prototype.flush = function() {
    var algorithm = this.algorithm;
    if (algorithm._flush) {
        algorithm._flush.call(this);
    }
    return this;
};

Cache.prototype.stringify = function(obj) {
    return JSON.stringify(obj);
};

Cache.prototype.parse = function(str) {
    return JSON.parse(str);
};

Cache.prototype.setAllLocal = function() {
    var k, v,
        namespace = this.namespace;
    this.each(function(key, value) {
        k = cachePrefix + namespace + key;
        v = this.stringify(value);
        localStorage.setItem(k, v);
    }, this);
    return this;
};

Cache.prototype.getAllLocal = function() {
    var length = localStorage.length,
        namespace = this.namespace,
        keyPrefix = cachePrefix + namespace,
        keyStart = keyPrefix.length,
        key, value;
    for (var i = 0; i < length; i++) {
        key = storage.key(i);
        if (key.indexOf(keyPrefix) === 0) {
            value = localStorage.getItem(key);
            key = key.substring(keyStart);
            this.set(key, value);
        }
    }
    return this;
};

window.Cache = window.Cache || Cache;
})();