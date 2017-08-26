/**
 * Created by Jeffrey Aben on 9-4-15.
 *
 * Screw spherical geometry for now. Use euclidean geometry for lazyness reasons
 */
function GeoGraph(data) {

    this.segments = [];
    var i, j,
        traj,
        p1, p2;

    for (i in data.trajectories) {
        traj = data.trajectories[i];
        p1 = itemToVector(traj[0]);
        for (j = 1; j < traj.length; j++) {
            p2 = itemToVector(traj[j]);
            this.segments.push(new Segment(p1, p2));
            p1 = p2;
        }
    }
    console.log("n = " + this.segments.length);

    function itemToVector(i) {
        return new Vector(+i["location-long"], +i["location-lat"]);
    }
}