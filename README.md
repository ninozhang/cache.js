cache.js
========

一个实现 JavaScript 缓存机制的库。

## 特性

* 支持 FIFO, LRU, LFU, Random 等多种缓存算法

* 支持命名空间

* 支持持久化到 localStorage 中，并读取

## 公共属性

* size
当前存储数据的个数

* memsize
当前存储数据所占的内存容量

## 公共方法

* set(key, value)
保存数据，可能覆盖已存储的数据。

* add(key, value)
保存数据，但是如果数据已经存在，则不会覆盖。

* replace(key, value)
替换数据，只有数据已经存在，才会进行替换。

* append(key, value)
将新数据附加在已存在的数据尾部。

* prepend(key, value)
将新数据附加在已存在的数据头部。

* has(key)
判断缓存中是否有对应数据。

* get(key)
获取数据。

* remove(key)
移除数据。

* flush(sec)
清空数据，如果指定了延迟时间，则在延迟时间后再执行清空操作。

## 作者

nino zhang(ninozhang@foxmail.com)

## 协议

MIT

## 相关文档

[Intro to Caching,Caching algorithms and caching frameworks](http://www.jtraining.com/component/content/article/35-jtraining-blog/98.html) （[翻译](http://www.zavakid.com/25)）
