function IntervalTree() {
    "use strict";
    this.intervals = [new Interval(0, 1, 1)];
}

//add interval to tree and split the intervals accordingly and change the weights
IntervalTree.prototype.addInterval = function (interval) {
    "use strict";
    var indexLeft = -1,
        indexRight = this.intervals.length,
        i,
        currentInterval,
        newInterval = null,
        intervalLeft,
        intervalRight;

    for (i = 0; i < this.intervals.length; i++) {
        currentInterval = this.intervals[i];
        if (currentInterval.contains(interval.start, false, true)) {
            indexLeft = i;
        }
        if (currentInterval.contains(interval.end, true, false)) {
            indexRight = i;
        }
    }

    //increment weights of intervals contained in given interval
    for (i = indexLeft + 1; i <= indexRight - 1; i++) {
        this.intervals[i].weight++;
    }

    //split left containing interval
    if (indexLeft >= 0) {
        intervalLeft = this.intervals[indexLeft];
        if (intervalLeft.end !== interval.start) {
            newInterval = new Interval(interval.start, intervalLeft.end, intervalLeft.weight + 1);
            intervalLeft.end = interval.start;

            this.intervals.splice(indexLeft + 1, 0, newInterval);
            indexRight++;
        }
    }

    //split right containing interval
    if (indexRight < this.intervals.length) {
        intervalRight = this.intervals[indexRight];
        if (intervalRight.start !== interval.end) {
            newInterval = new Interval(intervalRight.start, interval.end, intervalRight.weight + 1);
            intervalRight.start = interval.end;

            this.intervals.splice(indexRight, 0, newInterval);
        }
    }
};

IntervalTree.prototype.clone = function () {
    "use strict";
    var intervalsCopy = [],
        interval;
    for (interval in this.intervals) {
        intervalsCopy.push(this.intervals[interval].clone());
    }
    return intervalsCopy;
};