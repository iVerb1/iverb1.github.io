/**
 * Created by Helmond on 16-4-2015.
 */
// The 4 points defining the rectangle. No check for right angles is done.
function Rectangle(p1, p2, p3, p4) {
    "use strict";
    this.ls = [new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p4), new Segment(p4, p1)];
    var k,
        side;

    for (k in this.ls) {
        side = this.ls[k];

        // vertical
        if (side.p1.x === side.p2.x) {
            if (this.left === undefined || side.p1.x < this.left.p1.x) {
                this.left = side;
            }

            if (this.right === undefined || side.p1.x > this.right.p1.x) {
                this.right = side;
            }
        } else {
            // horizontal
            if (this.bottom === undefined || side.p1.y < this.bottom.p1.y) {
                this.bottom = side;
            }

            if (this.top === undefined || side.p1.y > this.top.p1.y) {
                this.top = side;
            }
        }
    }
    return this;
}

//Returns true if the point p is inside this rectangle.
Rectangle.prototype.isInside = function (p) {
    "use strict";
    return (p.x >= this.left.p1.x && p.x <= this.right.p1.x && p.y >= this.bottom.p1.y && p.y <= this.top.p1.y);
};

//Returns an array [t,u] such that the line defined by l.getPointAt(t) and l.getPoint(u) lies inside the rectangle.
// Returns an empty array if the line does not overlap with the rectangle.
Rectangle.prototype.getSubLineInside = function (l) {
    "use strict";
    var lp1 = l.p1,
        lp2 = l.p2,
        in1 = this.isInside(lp1),
        in2 = this.isInside(lp2),
        ts = [],
        i, inter, t;

    if (in1 && in2) {
        return [0, 1];
    }

    for (i = 0; i < 4; i++) {
        inter = l.getIntersection(this.ls[i]);
        if (inter !== null) {
            ts.push(inter);
        }
    }

    if (ts.length === 0) {
        return [];
    }

    //1 point inside
    if (ts.length === 1 || (ts.length === 2 && ts[0][0] === ts[1][0])) {
        t = ts[0][0];
        if (in1) {
            return [0, t];
        }
        return [t, 1];
    }
    if (ts[0][0] < ts[1][0]) {
        return ([ts[0][0], ts[1][0]]);
    }
    return ([ts[1][0], ts[0][0]]);
};