function Map($div) {
    var map = this;

    var width = 800;
    var height = width / 1.5;

    var strokeNormal = 'lightgrey';
    var strokeWidthNormal = '0.2px';
    var strokeHighlighted = 'red';
    var strokeWidthHighlighted = '1px';
    var strokeSelected = 'blue';
    var strokeWidthSelected = '1px';

    var linearColorScale = d3.scale.linear().range(["yellow", "black"]);
    var scaleWidth = 100;
    var scaleHeight = 12;

    this.$div = $div;
    this.$body;
    this.$tooltip;
    this.$countries;

    //offsets for tooltips
    this.offsetL;
    this.offsetT;

    this.id = this.$div.attr('id');
    this.moduleDataId = 'data-' + this.id;

    this.zoom = d3.behavior.zoom()
        .scaleExtent([1, 15])
        .on("zoom", function() { map.move(); });


    this.initialize = function() {
        map.$body = map.$div.append('<div id=' + map.id + '_body></div>');

        map.offsetL = document.getElementById(map.id + "_body").offsetLeft + 5;
        map.offsetT = document.getElementById(map.id + "_body").offsetTop - 30;

        map.$tooltip = d3.select("#" + map.id + "_body")
            .append("div")
            .attr("class", "tooltip hidden");

        map.$div.append(
            '<div style="top: 10px; position: absolute; right: 70px">' +
                '<div style="text-align: center; font-weight: bold">Connectivity</div>' +
                '<b>0%</b>' +
                '<canvas  id="'+ (map.id + '_scale') + '"></canvas>' +
                '<b> 100% </b>' +
             '</div>');

        d3.select('#' + map.id + '_scale')
            .attr("width", scaleWidth)
            .attr("height", 1)
            .style("width", scaleWidth + "px")
            .style("height", scaleHeight + "px")
            .style("margin-left", '5px')
            .style("margin-right", '5px');

        var scale = document.getElementById(map.id + '_scale');
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

        var countries = [];
        for (var k in countryMap) {
            countries.push(countryMap[k]);
        }

        var projection = d3.geo.mercator()
            .translate([(width/2), (height/2) + 120])
            .scale( width / 2 / Math.PI);

        var path = d3.geo.path().projection(projection);

        var svg = d3.select("#" + map.id + "_body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "lightsteelblue")
            .call(map.zoom)
            .append("g");

        map.$countries = svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .style("stroke", strokeNormal)
            .style("stroke-width", strokeWidthNormal)
            .on('click', function(d) {
                d.select();
            })
            .on('mouseover', function(d) {
                if (map.mouseDown) {
                    d.select();
                }

                d.setHighlighted(true);
            })
            .on('mouseleave', function(d) {
                d.setHighlighted(false);
            })
            .each(function(d) {
                var that = this;
                d.addVisComponent(map.id, this);
                d.addHighlightCallback(map.id, function() {
                    if (d.isSelected())
                        return;

                    if (d.isHighlighted()) {
                        d.getVisComponent(map.id).style.stroke = strokeHighlighted;
                        d.getVisComponent(map.id).style.strokeWidth = strokeWidthHighlighted;
                        d3.select(that).each(function(){
                            this.parentNode.appendChild(this);
                        });
                    }
                    else {
                        if (d.isSelected()) {
                            d.getVisComponent(map.id).style.stroke = strokeSelected;
                            d.getVisComponent(map.id).style.strokeWidth = strokeWidthSelected;
                        }
                        else {
                            d.getVisComponent(map.id).style.stroke = strokeNormal;
                            d.getVisComponent(map.id).style.strokeWidth = strokeWidthNormal;
                        }
                    }
                });
                d.addSelectedCallback(map.id, function() {
                    if (d.isSelected()) {
                        d.getVisComponent(map.id).style.stroke = strokeSelected;
                        d.getVisComponent(map.id).style.strokeWidth = strokeWidthSelected;
                    }
                    else {
                        d.getVisComponent(map.id).style.stroke = strokeNormal;
                        d.getVisComponent(map.id).style.strokeWidth = strokeWidthNormal;
                    }
                });
            });

        linearColorScale.domain([0, 100]);
        clock.addCallback(function(someClock) {
            map.redraw(someClock);
        });

        map.redraw(clock);
    };

    this.redraw = function(someClock) {

        map.$countries
            .style("fill", function(d) {
                var value = d.getTimeDataFromClock(someClock);
                return linearColorScale(value);
            });

        map.$countries
            .on("mousemove", function(d, i) {
                var value = d.getTimeDataFromClock(someClock);
                var body = d3.select("#" + map.id + "_body");
                var mouse = d3.mouse(body.node()).map( function(d) { return parseInt(d); } );

                map.$tooltip.classed("hidden", false)
                    .attr("style", "margin-left:"+(mouse[0] + map.offsetL)+"px; margin-top:"+(mouse[1] + map.offsetT)+"px")
                    .html(d.name + ": " + value + "%");

            })
            .on("mouseout",  function(d,i) {
                map.$tooltip.classed("hidden", true);
            });
    };

    this.move = function() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        zscale = s;
        var h = height/4;


        t[0] = Math.min(
            (width/height)  * (s - 1),
            Math.max( width * (1 - s), t[0] )
        );

        t[1] = Math.min(
            (height/width) * (s - 1) + h * s,
            Math.max(height  * (1 - s) - h * s, t[1])
        );

        map.zoom.translate(t);
        d3.select("#" + map.id + "_body svg g")
            .attr("transform", "translate(" + t + ")scale(" + s + ")");

        //adjust the country hover stroke width based on zoom level
        d3.selectAll(".country").style("stroke-width", strokeWidthNormal / s);

    };

}

(function($) {

    /** Global subject list namespace declaration. */
    $.Map = {};

    /**
     * Creates a vis map for given subjects.
     */
    $.fn.Map = function() {

        this.each(function() {

            var visMap = new Map($(this));

            visMap.initialize(countryMap);

            $(this).data('Map', Map);
        });

        return null;
    };
})(jQuery);