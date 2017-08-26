/**
 * Created by Helmond on 16-4-2015.
 */
function Segment(p1, p2, weight) {
    "use strict";
    this.weight = 1;

    if (weight !== undefined) {
        this.weight = weight;
    }

    if (p1.x < p2.x) {
        this.p1 = p1;
        this.p2 = p2;
    } else {
        this.p1 = p2;
        this.p2 = p1;
    }

    this.updateD();
    this.length = this.d.length();

    this.intervalTree = new IntervalTree();
    this.removed = false;

    return this;
}


Segment.prototype.updateD = function () {
    "use strict";
    this.d = this.p2.subtract(this.p1);
};

// Returns null if the lines are collinear, or partially overlap.
// Otherwise, returns an array [t,u] such that the intersection point lies at this.getPointAt(t) or l.getPointAt(u)
// http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
// Returns the intersection point between line l1 and l2
Segment.prototype.getIntersection = function (l) {
    "use strict";
    var A = this.p1,
        B = this.p2,
        C = l.p1,
        D = l.p2,
        p = A,
        r = B.subtract(A),
        q = C,
        s = D.subtract(C),
        qminp = q.subtract(p),
        rs = Vector.prototype.cross2D(r, s),
        t, u;
    // Lines are colinear or parallel.
    if (rs === 0) {
        //We do not care if colinear lines overlap
        return null;
    }

    t = Vector.prototype.cross2D(qminp, s) / rs;
    // Can be optimized by returning null if we already know t<0 || t>1
    u = Vector.prototype.cross2D(qminp, r) / rs;
    if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
        return ([t, u]);
    }
    return null;
};

Segment.prototype.clone = function () {
    "use strict";
    return new Segment(this.p1.clone(), this.p2.clone());
};

//Returns the point on this line that lies at 100*t % from p1 to p2.
Segment.prototype.getPointAt = function (t) {
    "use strict";
    return this.p1.add(this.d.scale(t));
};

//Returns at what side of the line
//http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
Segment.prototype.sideOf = function (p) {
    "use strict";
    var A = -(this.p2.y - this.p1.y),
        B = (this.p2.x - this.p1.x),
        C = -(A * this.p1.x + B * this.p1.y);
    return A * p.x + B * p.y + C;
};

Segment.prototype.projectOn = function (segment) {
    "use strict";
    var s1 = new Segment(this.p1, this.p2),
        s2 = new Segment(segment.p1, segment.p2),
        angle;

    // translate so s1.p1 is on origin
    s1.p2 = s1.p2.subtract(s1.p1);
    s2.p1 = s2.p1.subtract(s1.p1);
    s2.p2 = s2.p2.subtract(s1.p1);
    // must be done last
    s1.p1 = s1.p1.subtract(s1.p1);

    angle = Math.atan(s1.p2.y / s1.p2.x);

    // s1 is now on the positive x-axis
    s1.p2.x = s1.p2.length();
    s1.p2.y = 0;

    // rotates s2
    s2.p1 = s2.p1.rotate(-angle);
    s2.p2 = s2.p2.rotate(-angle);

    var epsBox = new Rectangle(new Vector(s1.p1.x, -EPS), new Vector(s1.p2.x, -EPS),
                               new Vector(s1.p2.x, EPS),  new Vector(s1.p1.x, EPS));
    var interval = epsBox.getSubLineInside(s2);

    var result = {
        segmentInterval: null,
        baseInterval: null
    };

    if (interval.length > 0) {
        s2.updateD();
        var a = (s2.getPointAt(interval[0]).x / s1.p2.x),
            b = (s2.getPointAt(interval[1]).x / s1.p2.x);

        result.segmentInterval = new Interval(interval[0], interval[1]);
        result.baseInterval = new Interval(Math.min(a, b), Math.max(a, b));
    }
    return result;
};

Segment.prototype.toString = function () {
    "use strict";
    return '<' + this.p1.toString() + '   ' + this.p2.toString() + '>';
};

Segment.prototype.toString = function () {
    "use strict";
    return '<' + this.p1.toString() + '   ' + this.p2.toString() + '>';
};

Segment.prototype.getSubSegments = function () {
    "use strict";
    //if (this.p1.x > -85.97 && this.p1.x < -85.96 && this.p1.y < -0.854 && this.p1.y > -0.855 ||
    //    this.p2.x > -85.97 && this.p2.x < -85.96 && this.p2.y < -0.854 && this.p2.y > -0.855) {
    //    console.log(this);
    //}

    var intervals = this.intervalTree.intervals,
        segments = [],
        points = [],
        i;

    points.push(this.getPointAt(intervals[0].start));

    //if (this.p1.x > -85.97 && this.p1.x < -85.96 && this.p1.y < -0.854 && this.p1.y > -0.855 ||
    //    this.p2.x > -85.97 && this.p2.x < -85.96 && this.p2.y < -0.854 && this.p2.y > -0.855) {
    //    console.log(points);
    //}

    for (i = 0; i < intervals.length; i++) {
        points.push(this.getPointAt(intervals[i].end));

        //if (this.p1.x > -85.97 && this.p1.x < -85.96 && this.p1.y < -0.854 && this.p1.y > -0.855 ||
        //    this.p2.x > -85.97 && this.p2.x < -85.96 && this.p2.y < -0.854 && this.p2.y > -0.855) {
        //    console.log(segments);
        //}

        segments.push(new Segment(points[i], points[i + 1], intervals[i].weight));
    }
    return segments;
};
