function GeoJSON() {
    "use strict";
    this.type = "FeatureCollection";
    this.features = [];
}


GeoJSON.prototype.addSegments = function (segments) {
    "use strict";
    var segment;
    for (segment in segments) {
        this.addSegment(segments[segment]);
    }
};

GeoJSON.prototype.addSegment = function (segment) {
    "use strict";
    var feature = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [segment.p1.x, segment.p1.y],
                [segment.p2.x, segment.p2.y]
            ]
        },
        "properties": {"edgeweight": segment.weight}
    };

    this.features.push(feature);
};

