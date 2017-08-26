/**
 * Created by Helmond on 16-4-2015.
 */
function Vector(x, y) {
    "use strict";
    this.x = x;
    this.y = y;
    return this;
}

Vector.prototype.add = function (v) {
    "use strict";
    return new Vector(this.x + v.x, this.y + v.y);
};

Vector.prototype.subtract = function (v) {
    "use strict";
    return new Vector(this.x - v.x, this.y - v.y);
};

Vector.prototype.dot = function (u, v) {
    "use strict";
    return u.x * v.x + u.y * v.y;
};

Vector.prototype.cross2D = function (u, v) {
    "use strict";
    return u.x * v.y - u.y * v.x;
};

Vector.prototype.scale = function (s) {
    "use strict";
    return new Vector(this.x * s, this.y * s);
};

Vector.prototype.length = function () {
    "use strict";
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.normalize = function () {
    "use strict";
    return this.scale(1 / this.length());
};

// Returns the 2 normals on this vector in 2D as an array.
Vector.prototype.getNormals = function () {
    "use strict";
    return [new Vector(this.y, -this.x).normalize(),
            new Vector(-this.y, this.x).normalize()];
};

Vector.prototype.clone = function () {
    "use strict";
    return new Vector(this.x, this.y);
};

// Angle in radians.
Vector.prototype.rotate = function (angle) {
    "use strict";
    return new Vector(this.x * Math.cos(angle) - this.y * Math.sin(angle),
                      this.x * Math.sin(angle) + this.y * Math.cos(angle));
};

Vector.prototype.toString = function () {
    "use strict";
    return '( ' + this.x + ' __ ' + this.y + ' )';
};