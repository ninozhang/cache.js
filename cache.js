(function() {
var defaults = {
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
};

Cache.prototype.add = function(key, value) {
    var algorithm = this.algorithm;
    if (algorithm._set) {
        algorithm._set.call(this, key, value);
    }
};

Cache.prototype.replace = function(key, value) {
    if (this.get(key)) {
        this.set(key, value);
    }
};

Cache.prototype.append = function(key, value) {
    var data = this.get(key);

};

Cache.prototype.prepend = function(key, value) {
    var data = this.get(key);
};

Cache.prototype.get = function(key) {
    var algorithm = this.algorithm;
    if (algorithm._get) {
        algorithm._get.call(this, key);
    }
};

Cache.prototype.remove = function(key) {
    var algorithm = this.algorithm;
    if (algorithm._remove) {
        algorithm._remove.call(this, key);
    }
};

Cache.prototype.flush = function() {
    var algorithm = this.algorithm;
    if (algorithm._flush) {
        algorithm._flush.call(this);
    }
};

Cache.prototype.flush = function() {
    var algorithm = this.algorithm;
    if (algorithm._flush) {
        algorithm._flush.call(this);
    }
};

Cache.extend = function(algorithms) {
    extend(Cache.prototype.algorithms, algorithms);
};

window.Cache = window.Cache || Cache;
})();