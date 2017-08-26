function Group(name, countryMap) {

    this.name = name;
    this.size = 0;
    this.countryMap = {};
    for (var k in countryMap) {

        this.addCountry(countryMap[k]);
    }

    Group.groups[this.name] = this;

    this._highlighted = false;
    this.highlightCallbacks = {};
    this.visComponents = {};
}

Group.groups = {};
Group.garbageBin = new Group('garbage_bin', []);
delete Group.groups[Group.garbageBin.name];

Group.countryNameToGroup = {};

Group.prototype.addCountry = function(country) {
    var curGroup = Group.countryNameToGroup[country.name];

    if (curGroup != undefined)
        curGroup.removeCountry(country);
    
    this.countryMap[country.name] = country;
    Group.countryNameToGroup[country.name] = this;

    this.size++;
    Group.runChangedCallbacks(this);
};

Group.prototype.removeCountry = function(country) {
    Group.countryNameToGroup[country.name] = Group.garbageBin;
    delete this.countryMap[country.name];
    this.size--;
    Group.runChangedCallbacks(this);
};

Group.prototype.multiRemove = function(countries) {
    for (var k in countries) {
        var country = countries[k];

        if (this.countryMap[country.name] != undefined) {
            delete this.countryMap[country.name];
            Group.countryNameToGroup[country.name] = Group.garbageBin;
            this.size--;
        }
    }

    Group.runChangedCallbacks(this);
}

Group.prototype.remove = function() {
    delete Group.groups[this.name];
    Group.runChangedCallbacks(this);
}

Group.prototype.getTimeDataFromClockAverage = function(clock) {
    var total = 0;
    var count = 0;

    for (var k in this.countryMap) {

        total += this.countryMap[k].getTimeDataFromClock(clock);
        count++;
    }

    return total/count;
}

Group.prototype.getTimeDataFromClockMin = function(clock) {
    var min = 100;

    for (var k in this.countryMap) {
        var val = this.countryMap[k].getTimeDataFromClock(clock);

        if (val < min) {
            min = val;
        }
    }

    return min;
}

Group.prototype.getTimeDataFromClockMax = function(clock) {
    var max = 0;

    for (var k in this.countryMap) {
        var val = this.countryMap[k].getTimeDataFromClock(clock);

        if (val > max) {
            max = val;
        }
    }

    return max;
}

Group.prototype.getTimeDataAverage = function(time) {
    var total = 0;
    var count = 0;

    for (var k in this.countryMap) {

        total += this.countryMap[k].getTimeData(time);
        count++;
    }

    return total/count;
}

Group.prototype.getTimeDataMin = function(time) {
    var min = 100;

    for (var k in this.countryMap) {
        var val = this.countryMap[k].getTimeData(time);

        if (val < min) {
            min = val;
        }
    }

    return min;
}

Group.callbackIdGen = 0;
Group.changedCallbacks = {};

Group.addChangedCallback = function(callback) {
    var id = this.callbackIdGen++;

    this.changedCallbacks[id] = callback;
}

Group.removeChangedCallback = function(id) {
    delete this.changedCallbacks[id];
}

Group.runChangedCallbacks = function(group) {
    for (var k in this.changedCallbacks) {
        this.changedCallbacks[k](group);
    }
}

Group.prototype.getTimeDataMax = function(time) {
    var max = 0;

    for (var k in this.countryMap) {
        var val = this.countryMap[k].getTimeData(time);

        if (val > max) {
            max = val;
        }
    }

    return max;
}

Group.prototype.addVisComponent = function(id, component) {
    this.visComponents[id] = component;
};

Group.prototype.getVisComponent = function(id) {
    return this.visComponents[id];
};

Group.prototype.removeVisComponent = function(id) {
    delete this.visComponents[id];
    delete this.highlightCallbacks[id];
};

Group.prototype.isHighlighted = function(){
    return this._highlighted;
};

Group.prototype.addHighlightCallback = function(id, callback) {
    if (this.highlightCallbacks[id] === undefined) {
        this.highlightCallbacks[id] = [];
    }

    this.highlightCallbacks[id].push(callback);
};

Group.prototype.setHighlighted = function(highlighted, callback) {
    this._highlighted = highlighted;

    if (callback == undefined || callback === true) {
        this.runHighlightCallbacks();
        var that = this;
        Object.keys(this.countryMap).map(function(d) {
            that.countryMap[d]._highlighted = highlighted;
            that.countryMap[d].runHighlightCallbacks()
        });
    }
};

Group.prototype.runHighlightCallbacks = function() {
    for (var k in this.highlightCallbacks) {
        for (var l in this.highlightCallbacks[k]) {
            this.highlightCallbacks[k][l](this);
        }
    }
};