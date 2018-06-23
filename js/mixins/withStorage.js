function withStorage() {

    this.get = function(key, callback, _this) {
        chrome.storage.local.get(key, function(items) {
            if (callback) {
                callback.call(_this || this, items);
            }
        });
    };

    this.set = function(obj, callback) {
        chrome.storage.local.set(obj, callback);
    };
}
