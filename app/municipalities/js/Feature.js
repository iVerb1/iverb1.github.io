function Feature(featureData) {

    for (var k in featureData) {
        this[k] = featureData[k];
    }

    this.activeCallbacks = [];
    this.highlightCallbacks = [];
    this.filterCallbacks = [];
    this.highlightLockedCallbacks = [];

    this._active = true;
    this._highlighted = false;
    this._passesFilters = true;
    this._highlightLocked = false;
}

Feature.activeCallbacks = [];
Feature.filterCallbacks = [];

/** ACTIVE */

Feature.addActiveCallback = function(callback) {
    this.activeCallbacks.push(callback);
};

Feature.removeActiveCallback = function(callback) {
    this.activeCallbacks = this.activeCallbacks.filter(function(d) {
        return d !== callback;
    });
};

Feature.setActive = function(features, condition) {
    for (var k in features)
        features[k].setActive(condition(features[k]));

    for (var k in this.activeCallbacks) {
        this.activeCallbacks[k]();
    }
};

Feature.prototype.addActiveCallback = function(callback) {
    this.activeCallbacks.push(callback);
};

Feature.prototype.setActive = function(active, callback) {

    this._active = active;

    if (callback == undefined || callback === true) {
        this.runActiveCallbacks();
    }
};

Feature.prototype.runActiveCallbacks = function() {
    for (var k in this.activeCallbacks) {
        this.activeCallbacks[k](this);
    }
};

Feature.prototype.isActive = function() {
    return this._active;
};

/** FILTERS */

Feature.addFilterCallback = function(callback) {
    this.filterCallbacks.push(callback);
};

Feature.removeFilterCallback = function(callback) {
    this.filterCallbacks = this.filterCallbacks.filter(function(d) {
        return d !== callback;
    });
};

Feature.setPassesFilters = function(features, condition) {

    for (var k in features) {
        features[k].setPassesFilters(condition(features[k]));
    }

    for (var k in this.filterCallbacks) {
        this.filterCallbacks[k]();
    }
};


Feature.prototype.setPassesFilters = function(passesFilters, callback) {
    this._passesFilters = passesFilters;

    if (callback == undefined || callback === true) {
        this.runPassesFiltersCallbacks();
    }
};

Feature.prototype.runPassesFiltersCallbacks = function() {
    for (var k in this.filterCallbacks) {
        this.filterCallbacks[k](this);
    }
};

Feature.prototype.addFilterCallback = function(callback) {
    this.filterCallbacks.push(callback);
};

Feature.prototype.passesFilters = function(){
    return this._passesFilters;
};

/** HIGHLIGHTED */

Feature.prototype.addHighlightCallback = function(callback) {
    this.highlightCallbacks.push(callback);
};

Feature.setHighlighted = function(features, conditionHighlighted, conditionLocked) {
    for (var k in features) {
        features[k].setHighlighted(conditionHighlighted(features[k]), conditionLocked(features[k]));
    }

    for (var k in this.highlightCallbacks) {
        this.highlightCallbacks[k]();
    }
};

Feature.prototype.setHighlighted = function(highlighted, locked, callback) {
    var runCallbacks = false;

    if (!this._highlightLocked || locked === false) {
        this._highlighted = highlighted;
        runCallbacks = true;
    }

    if (locked !== undefined)
        this._highlightLocked = locked;

    if (runCallbacks && (callback == undefined || callback === true)) {
        this.runHighlightCallbacks();
    }
};

Feature.prototype.isHighlightLocked= function() {
    return this._highlightLocked;
};

Feature.prototype.runHighlightCallbacks = function() {
    for (var k in this.highlightCallbacks) {
        this.highlightCallbacks[k](this);
    }
};

Feature.prototype.isHighlighted = function(){
    return this._highlighted;
};