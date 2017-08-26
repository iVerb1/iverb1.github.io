/**
 * Created by Helmond on 17-4-2015.
 */
//parses the geodata into trajectory data, applies simplification, returns
function preProcess(geodata, epsilon, alpha, equalize) {
    "use strict";
    var trajectories = [],
        origsegs = 0,
        doSimplify = true,
        simplified = [],
        newsegs = 0,
        seg,
        simp,
        k, i, a, b,
        traj,
        ct;

    for (k in geodata.trajectories) {
        traj = geodata.trajectories[k];
        ct = [];
        for (i = 0; i < traj.length - 1; i++) {
            a = traj[i];
            b = traj[i + 1];

            ct.push(new Segment(new Vector(+a['location-long'], +a['location-lat']), new Vector(+b['location-long'], +b['location-lat'])));
        }
        trajectories.push(ct);
        origsegs += ct.length;
    }

    for (i = 0; i < trajectories.length; i++) {
        if (doSimplify) {
            simp = simplify(trajectories[i], epsilon, alpha, equalize);
        } else {
            simp = [];
            for (seg in trajectories[i]) {
                simp.push(trajectories[i][seg]);
            }
        }
        simplified.push(simp);
        newsegs += simp.length;
    }
    if (doSimplify) {
        console.log("Simplified from " + origsegs + " to " + newsegs + " segments");
    }
    return simplified;
}

//returns a simplified version of the trajectory
function simplify(trajectory, epsilon, alpha, equalize) {
    "use strict";
    var traj1 = simplify1(trajectory, epsilon),
        traj2 = simplify2(traj1, alpha);
    if (equalize) {
        return simplify3(traj2, epsilon);
    }
    return traj2;
}

// Driemel algorithm.
function simplify1(trajectory, minlength) {
    "use strict";
    var simplified = [],
        p1 = trajectory[0].p1,
        i,
        nextp,
        seg;
    for (i = 0; i < trajectory.length; i++) {
        nextp = trajectory[i].p2;
        seg = new Segment(p1, nextp);
        if (seg.length >= minlength) {
            simplified.push(seg);
            p1 = nextp;
        }
    }
    if (p1 !== trajectory[trajectory.length - 1].p2) {
        simplified.push(new Segment(p1, trajectory[trajectory.length - 1].p2));
    }

    return simplified;
}

// Straightens out any slight curves. All bends are more than alpha after this algorithm.
function simplify2(trajectory, alpha) {
    "use strict";
    var simplified = [],
        s1 = trajectory[0],
        d1 = trajectory[0].d.normalize(),
        i, s1, s2, d1, d2,
        dot, angle, nseg;

    for (i = 1; i < trajectory.length; i++) {
        s2 = trajectory[i];
        d2 = s2.d.normalize();
        dot = Vector.prototype.dot(d1, d2);
        angle = Math.acos(dot);

        if (angle >= alpha) {
            nseg = new Segment(s1.p1, s2.p1);
            s1 = s2;
            d1 = d2;
            simplified.push(nseg);
        }
    }
    nseg = new Segment(s1.p1, trajectory[trajectory.length - 1].p2);
    simplified.push(nseg);
    return simplified;
}

// Makes sure no segments exceed 2 * epsilon in length.
function simplify3(trajectory, epsilon) {
    "use strict";
    var simplified = [],
        pieces,
        percent,
        seg,
        i, j, l, p1, p2;

    for (i = 0; i < trajectory.length; i++) {
        seg = trajectory[i];
        l = seg.length;
        pieces = l / (2 * epsilon);
        if (pieces > 1) {
            pieces = Math.ceil(pieces);
            p1 = seg.p1;
            for (j = 0; j < pieces; j++) {
                percent = (j + 1) / pieces;
                p2 = seg.getPointAt(percent);
                simplified.push(new Segment(p1, p2));
                p1 = p2;
            }
        } else {
            simplified.push(seg);
        }
    }
    return simplified;
}

