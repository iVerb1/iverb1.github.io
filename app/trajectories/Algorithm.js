function runAlgorithm(segments) {
    "use strict";

    sortOnLength(segments);

    var addedSegments,
        base,
        segment,
        intervals,
        baseInterval,
        segmentInterval,
        newSegment,
        result = [],
        i, j, k, s;

    for (i = 0; i < segments.length - 1; i++) {

        addedSegments = [];
        base = segments[i];
        if (!base.removed) {

           for (j = i + 1; j < segments.length; j++) {

                segment = segments[j];
                if (!segment.removed && addedSegments.indexOf(segment) === -1) {

                    intervals = base.projectOn(segment);

                    if (intervals.baseInterval !== null && intervals.segmentInterval !== null) {

                        //updating base interval tree
                        baseInterval = intervals.baseInterval;
                        base.intervalTree.addInterval(baseInterval);

                        //removing/redirecting segments
                        segment.removed = true;
                        segmentInterval = intervals.segmentInterval;

                        //possibly inserting new segments. note that these segments are always inserted in a later part of @code{segments}.
                        if (segmentInterval.start !== 0) {
                            newSegment = new Segment(segment.p1, base.getPointAt(baseInterval.start));
                            insertSegment(segments, newSegment);
                            addedSegments.push(newSegment);
                        } else if (segmentInterval.end !== 1) {
                            newSegment = new Segment(base.getPointAt(baseInterval.end), segment.p2);
                            insertSegment(segments, newSegment);
                            addedSegments.push(newSegment);
                        }
                    }
                }
            }
        }
    }

    for (k in segments) {
        s = segments[k];
        if (!s.removed) {
            result = result.concat(s.getSubSegments());
        }
    }

    return result;
}

function sortOnLength(segments) {
    "use strict";

    segments.sort(function (s1, s2) {
        return s2.d.length() - s1.d.length();
    });
}

function insertSegment(segments, segment) {
    "use strict";

    segments.splice(linearSearch(segments, segment), 0, segment);
}

function linearSearch(segments, segment) {
    "use strict";
    var i, s;

    for (i = 0; i < segments.length; i++) {
        s = segments[i];
        if (segment.d.length() > s.d.length()) {
            return i;
        }
    }
    return segments.length;
}

function binarySearch(segments, segment) {
    "use strict";

    var minIndex = 0,
        maxIndex = segments.length - 1,
        currentIndex,
        currentSegment;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentSegment = segments[currentIndex];

        console.log(currentSegment.d.length() + " " + segment.d.length());
        console.log(minIndex + " " + maxIndex + " " + currentIndex);

        if (currentSegment.d.length() > segment.d.length()) {
            minIndex = currentIndex + 1;
        } else if (currentSegment.d.length() < segment.d.length()) {
            maxIndex = currentIndex - 1;
        } else {
            return currentIndex;
        }
    }
    return segments.length;
}
