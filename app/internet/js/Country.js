function Country(feature, countryToTimeData) {

    this.geometry = feature.geometry;
    this.type = feature.type;

    this.name = feature.properties.name;
    this.timeData = countryToTimeData[this.name];

    this._highlighted = false;
    this.highlightCallbacks = {};
    this.selectedCallbacks = {};
    this.visComponents = {};
}

Country.selected = {};


Country.prototype.addVisComponent = function(id, component) {
    this.visComponents[id] = component;
};

Country.prototype.getVisComponent = function(id) {
    return this.visComponents[id];
};

Country.prototype.removeVisComponent = function(id) {
    delete this.visComponents[id];
    delete this.highlightCallbacks[id];
    delete this.selectedCallbacks[id];
};

Country.prototype.getTimeDataFromClock = function(clock) {
    if (clock.index == clock.maxIndex)
        return this.timeData[clock.times[clock.index]];
    else
        return (1 - clock.indexFraction) * this.timeData[clock.times[clock.index]] + clock.indexFraction * this.timeData[clock.times[clock.index + 1]];
};

Country.prototype.getTimeData = function(time) {
    return this.timeData[time];
};

Country.prototype.select = function() {
    if (this.isSelected()) {
        delete Country.selected[this.name];
    } else {
        Country.selected[this.name] = this;
    }

    this.runSelectedCallbacks();
}

Country.prototype.isSelected = function() {
    return Country.selected[this.name] != undefined;
}

Country.prototype.addSelectedCallback = function(id, callback) {
    if (this.selectedCallbacks[id] === undefined) {
        this.selectedCallbacks[id] = [];
    }

    this.selectedCallbacks[id].push(callback);
};

Country.deselectAll = function() {
    var deselectedCountries = [];

    for (var k in this.selected) {
        deselectedCountries.push(this.selected[k]);
    }

    for (var k in deselectedCountries) {
        delete this.selected[deselectedCountries[k].name];
        deselectedCountries[k].runSelectedCallbacks();
    }
}

Country.prototype.runSelectedCallbacks = function() {
    for (var k in this.selectedCallbacks) {
        for (var l in this.selectedCallbacks[k]) {
            this.selectedCallbacks[k][l](this);
        }
    }
};

Country.prototype.isHighlighted = function(){
    return this._highlighted;
};

Country.prototype.addHighlightCallback = function(id, callback) {
    if (this.highlightCallbacks[id] === undefined) {
        this.highlightCallbacks[id] = [];
    }

    this.highlightCallbacks[id].push(callback);
};

Country.prototype.setHighlighted = function(highlighted, callback) {
    this._highlighted = highlighted;

    if (callback == undefined || callback === true) {
        this.runHighlightCallbacks();
        Group.countryNameToGroup[this.name]._highlighted = highlighted;
        Group.countryNameToGroup[this.name].runHighlightCallbacks();
    }
};

Country.prototype.runHighlightCallbacks = function() {

    for (var k in this.highlightCallbacks) {
        for (var l in this.highlightCallbacks[k]) {
            this.highlightCallbacks[k][l](this);
        }
    }
};