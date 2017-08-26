function Interval(start, end, weight) {
    "use strict";
    this.start = start;
    this.end = end;
    this.weight = weight;
}

Interval.prototype.contains = function (x, leftInclusive, rightInclusive) {
    "use strict";
    var rightOfStart = false,
        leftOfEnd = false;

    if (leftInclusive) {
        rightOfStart = x >= this.start;
    } else {
        rightOfStart = x > this.start;
    }

    if (rightInclusive) {
        leftOfEnd = x <= this.end;
    } else {
        leftOfEnd = x < this.end;
    }

    return rightOfStart && leftOfEnd;
};

Interval.prototype.clone = function () {
    "use strict";
    return new Interval(this.start, this.end, this.weight);
};