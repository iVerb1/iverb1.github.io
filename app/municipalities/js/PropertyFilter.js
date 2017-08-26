function PropertyFilter(property) {
    this.id = property.id;
    this.lowerBound = Number.MAX_VALUE;
    this.upperBound = Number.MIN_VALUE;
    this.minValue = this.lowerBound;
    this.maxValue = this.upperBound;
    this._enabled = false;
}

PropertyFilter.enabledFilters = {};

PropertyFilter.checkPassing = function() {

    Feature.setPassesFilters(features, function(feature) {

        for (var k in PropertyFilter.enabledFilters) {
            if (!PropertyFilter.enabledFilters[k].passes(feature)) {
                return false;
            }
        }

        return true;
    });
}

PropertyFilter.prototype.changed = function() {
    PropertyFilter.checkPassing();
}

PropertyFilter.prototype.setEnabled = function(enabled) {
    this._enabled = enabled;

    if (this.isEnabled())
        PropertyFilter.enabledFilters[this.id] = this;
    else
        delete PropertyFilter.enabledFilters[this.id];

    this.changed();
}

PropertyFilter.prototype.isEnabled = function() {
    return this._enabled
}

PropertyFilter.prototype.passes = function (feature) {
    return  this.minValue <= feature.properties[this.id] && feature.properties[this.id] <= this.maxValue;
}

PropertyFilter.prototype.setMinMaxValue = function(minValue, maxValue) {
    this.minValue = Math.max(this.lowerBound, minValue);
    this.maxValue = Math.min(this.upperBound, maxValue);

    this.changed();
}

PropertyFilter.prototype.updateLowerBound = function(candidate) {
    if (candidate < this.lowerBound) {
        this.lowerBound = candidate;
        this.minValue = this.lowerBound;
    }
}

PropertyFilter.prototype.updateUpperBound = function(candidate) {
    if (candidate > this.upperBound) {
        this.upperBound = candidate;
        this.maxValue = this.upperBound;
    }
}