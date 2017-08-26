/**
 * Created by s113958 on 9-4-15.
 */
function GeoData(path, done) {
    "use strict";
    var values = ['event-id', 'timestamp', 'location-lat', 'location-long', 'tag-local-identifier'],
        map = this,
        dateTimeFormat = d3.time.format("%Y-%m-%d %H:%M:%S.%L"),
        item;

    map.path = path;
    map.line_separator = '\n';
    map.word_separator = ',';
    map.id_field = 'event-id';
    map.value_names = [];
    map.items = {};
    map.trajectories = {};

    function keep(valueNames) {
        var keepMap = {},
            remove = [],
            k, r;

        for (k in valueNames) {
            keepMap[valueNames[k]] = true;
        }

        for (k in map.value_names) {
            if (keepMap[map.value_names[k]] !== true) {
                remove.push(map.value_names[k]);
            }
        }

        map.value_names = valueNames;

        for (k in map.items) {
            item = map.items[k];

            for (r in remove) {
                delete item[remove[r]];
            }
        }
    }

    $.get(map.path, function (csv) {
        var lines = csv.split(map.line_separator),
            i, k,
            item,
            words,
            pass;

        map.value_names = lines[0].split(map.word_separator);
        for (i = 1; i < lines.length; i++) {
            item = {};
            words = lines[i].split(map.word_separator);

            for (k in words) {
                item[map.value_names[k]] = words[k];
            }

            pass = true;
            for (k in values) {
                if (item[values[k]] === undefined || item[values[k]] === "") {
                    pass = false;
                    break;
                }
            }

            if (pass) {
                map.items[item[map.id_field]] = item;

                if (map.trajectories[item['tag-local-identifier']] === undefined) {
                    map.trajectories[item['tag-local-identifier']] = [];
                }

                map.trajectories[item['tag-local-identifier']].push(item);

                try {
                    item.timestamp = dateTimeFormat.parse(item.timestamp).getTime();
                } catch (err) {
                    console.log(item);
                }
            }
        }

        keep(values);
    }).done(function () {
        done();
    });
}

GeoData.prototype.print = function () {
    var map = this,
        lines = [],
        k, l, a,
        item,
        values;

    lines.push(map.value_names.join(map.word_separator));

    for (k in map.items) {
        item = map.items[k];

        values = [];

        for (l in map.value_names) {
            values.push(item[map.value_names[l]]);
        }

        lines.push(values.join(map.word_separator));

    }

    a = lines.join('\n');
    console.log(a);
}