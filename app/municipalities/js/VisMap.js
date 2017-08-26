function VisMap($div) {
    var visMap = this;
    var strokeNormal = 'grey';
    var strokeWidthNormal = '1px';
    var strokeHighlighted = 'red';
    var strokeWidthHighlighted = '2px';

    var mapWidth = 620;
    var mapHeight = 700;
    var scaleWidth = 100;
    var scaleHeight = 12;
    //var colorInactive = '#c0c0c0';
    //var colorFiltered = 'LightBlue';
    var linearColorScale = d3.scale.linear().range(["yellow", "black"]);

    var mouseDown = false;
    var setActive = false;

    this.path;
    this.$paths;
    this.$div = $div;
    this.id = this.$div.attr('id');
    this.moduleDataId = 'data-' + this.id;
    this.propertyId;

    this.$title;
    this.$body;
    this.$minValue;
    this.$maxValue;

    this.initialize = function() {

        Feature.addActiveCallback(visMap.redraw);
        Feature.addFilterCallback(visMap.redraw);

        visMap.$div.append(
            '<div style="width: ' + mapWidth + 'px">' +
                '<h3 class="pull-left" id="'+ (visMap.id + '_title') + '"></h3>' +
                '<div class="pull-right" style="margin-top:30px; margin-right: 30px;">' +
                '<b  id="' + (visMap.id + '_minValue') + '" class="pull-left" style="text-align: right; width:100px; height: 15px"></b>' +
                '<canvas  id="'+ (visMap.id + '_scale') + '"></canvas>' +
                '<b id="' + (visMap.id + '_maxValue') + '" class="pull-right" style="text-align: left; width:100px; height: 15px"></b>' +
                '</div>' +
                '</div>' +
                '<div id="'+ (visMap.id + '_body') +'"></div>');

        visMap.$title = $('#' + visMap.id + '_title');
        visMap.$minValue = $('#' + visMap.id + '_minValue');
        visMap.$maxValue = $('#' + visMap.id + '_maxValue');
        visMap.$body = $('#' + visMap.id + '_body');

        d3.select('#' + visMap.id + '_scale')
            .attr("width", scaleWidth)
            .attr("height", 1)
            .style("width", scaleWidth + "px")
            .style("height", scaleHeight + "px")
            .style("margin-left", '5px')
            .style("margin-right", '5px');

        var scale = document.getElementById(visMap.id + '_scale');
        var context = scale.getContext("2d");
        var image = context.createImageData(scaleWidth, 1);
        linearColorScale.domain([0, scaleWidth]);
        for (var k = 0, j = -1, c; k < scaleWidth; ++k) {
            c = d3.rgb(linearColorScale(k));
            image.data[++j] = c.r;
            image.data[++j] = c.g;
            image.data[++j] = c.b;
            image.data[++j] = 255;
        }
        context.putImageData(image, 0, 0);

        // Setup the map projection for a good depiction of The Netherlands. The
        // projection is centered on the geographical center of the country, which
        // happens to be the city of Lunteren.
        var projection = d3.geo.albers()
            .rotate([0, 0])
            .center([5.6, 52.1])
            .parallels([50, 53])
            .scale(13000)
            .translate([mapWidth/2,mapHeight/2]);

        visMap.path = d3.geo.path().projection(projection);

        visMap.$body.empty();

        var svg = d3.select('#' + visMap.id + '_body').append("svg")
            .attr("width", mapWidth)
            .attr("height", mapHeight);

        visMap.$paths = svg.append("g");

        visMap.$paths.selectAll("path")
            .data(features).enter()
            .append("path")
            .attr("d", visMap.path)
            .on('mousedown', function(d) {
                mouseDown = true;
                setActive = !d.isActive();
                Feature.setActive([d], function(){return setActive;});
            })
            .on('mouseup', function(d) {
                mouseDown = false;
            })
            .on('mouseover', function(d) {
                if (mouseDown) {
                    Feature.setActive([d], function(){return setActive;});
                }

                d.setHighlighted(true);
            })
            .on('mouseout', function(d) {
                d.setHighlighted(false);
            })
            .each(function(d) {
                d[visMap.moduleDataId] = {};
                d[visMap.moduleDataId].$path = this;
                d.addHighlightCallback(function(d) {

                    if (d.isHighlighted()) {
                        d[visMap.moduleDataId].$path.style.stroke = strokeHighlighted;
                        d[visMap.moduleDataId].$path.style.strokeWidth = strokeWidthHighlighted;
                    }
                    else {
                        d[visMap.moduleDataId].$path.style.stroke = strokeNormal;
                        d[visMap.moduleDataId].$path.style.strokeWidth = strokeWidthNormal;
                    }});
            });
    };

    this.redraw = function() {
        visMap.drawMap(visMap.propertyId);
    };

    this.drawMap = function(id) {
        var changed = id !== visMap.propertyId;
        //var extremes = getExtremes(id, false);

        var data = features
            .filter(function(d) { return d.isActive() && d.passesFilters(); });

        visMap.propertyId = id;
        visMap.$title.empty();
        visMap.$title.append(visMap.propertyId);
        //linearColorScale.domain(extremes);
        linearColorScale.domain(d3.extent(data, function(d) { return d.properties[id] }));

        for (var k in features) {
            var feature = features[k];
            if (feature.isActive()) {
                if (feature.passesFilters()) {
                    feature[visMap.moduleDataId].$path.style.fill = linearColorScale(feature.properties[visMap.propertyId]);
                    feature[visMap.moduleDataId].$path.style.title = feature.gm_naam + ", " + feature.properties[visMap.propertyId];
                } else {
                    feature[visMap.moduleDataId].$path.style.fill = colorFiltered;
                    feature[visMap.moduleDataId].$path.style.title = feature.gm_naam + ', filtered out';
                }
            } else {
                feature[visMap.moduleDataId].$path.style.fill = colorInactive;
                feature[visMap.moduleDataId].$path.style.title = feature.gm_naam + '. deselected';
            }
        }

        visMap.$minValue.empty();
        visMap.$maxValue.empty();
        //if (extremes[0] != Number.MAX_VALUE && extremes[1] != Number.MIN_VALUE) {
        if (data.length > 0) {
            visMap.$minValue.append(linearColorScale.domain.call(0)[0]);
            visMap.$maxValue.append(linearColorScale.domain.call(0)[1]);
        }

        if (changed) {
            for (var k in features) {
                var feature = features[k];
                var $path = feature[visMap.moduleDataId].$path;

                $($path).attr('data-original-title', feature.gm_naam + " " + feature.properties[id]);
                $($path).tooltip({container: 'body'});
            }
            /*
            visMap.$paths.selectAll("path")
                .data(features)
                .each(function(d) {
                    $(this).attr('data-original-title', d.gm_naam + " " + d.properties[id]);
                    $(this).tooltip({container: 'body'});
                });
            */
        }
    }
}

(function($) {

    /** Global subject list namespace declaration. */
    $.visMap = {};

    /**
     * Creates a vis map for given subjects.
     */
    $.fn.visMap = function() {

        if (arguments.length == 0)
            return this.first().data('VisMap');

        this.each(function() {
            var visMap = new VisMap($(this));

            visMap.initialize();

            $(this).data('VisMap', visMap);
        });

        return null;
    };
})(jQuery);