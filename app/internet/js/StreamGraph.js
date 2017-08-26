function StreamGraph($body) {
    var streamGraph = this;

    this.$body = $body;
    this.$timeLine;
    this.$layers;
    this.$tooltip;
    this.id = this.$body.attr('id');
    this.moduleDataId = 'data-' + this.id;

    this.width;
    this.height;
    this.offsetL = document.getElementById(streamGraph.id).offsetLeft + 5;
    this.offsetT = document.getElementById(streamGraph.id).offsetTop - 65;
    this.callbackId;

    this.items = [];

    var strokeWidthHighlighted = '4px';
    var strokeHighlighted = 'red';
    var strokeSelected = 'blue';
    var strokeWidthSelected = '4px';
    var fillHighlighted = 'red';
    var fillSelected = 'blue';

    var margin = {top: 20, right: 100, bottom: 30, left: 40};


    var layerStrokeCallback = function(item) {

        var selected = (item instanceof Country ? item.isSelected() : false);
        if (item.isHighlighted() && !selected) {
            item.getVisComponent(streamGraph.id).style.strokeWidth = strokeWidthHighlighted;
            item.getVisComponent(streamGraph.id).style.stroke = strokeHighlighted;
            item.getVisComponent(streamGraph.id).style.fill = fillHighlighted;
        }
        else {
            if (selected) {
                item.getVisComponent(streamGraph.id).style.strokeWidth = strokeWidthSelected;
                item.getVisComponent(streamGraph.id).style.stroke = strokeSelected;
                item.getVisComponent(streamGraph.id).style.fill = fillSelected;
            }
            else {
                item.getVisComponent(streamGraph.id).style.strokeWidth = "0px";
                item.getVisComponent(streamGraph.id).style.fill = colorFunc(item.name);
            }
        }
    };


    this.initialize = function(items, width, height, normalized) {

        this.items = items;
        this.initWidth = width;
        this.initHeight = height;
        this.initNormalized = normalized;

        this.reinitialize();

        streamGraph.callbackId = clock.addCallback(function(someClock) {
            streamGraph.updateTime(someClock);
        });

    };

    this.reinitialize = function() {
        var width = this.initWidth;
        var height = this.initHeight;
        var normalized = this.initNormalized;

        var streamGraph = this;

        this.$body.empty();

        streamGraph.$tooltip = d3.select("#" + streamGraph.id)
            .append("div")
            .attr("class", "tooltip hidden");

        var yAxisText;
        var stack = d3.layout.stack().values(function(d) { return d.values });
        if (normalized) {
            stack.offset("expand");
            yAxisText = "Proportion total connectivity";
        }
        else {
            stack.offset("zero");
            yAxisText = "Accumulated connectivity (%)";
        }

        var layers = stack(d3.range(streamGraph.items.length).map(function(index) {
            var item = streamGraph.items[index];
            var result = [];

            for (var i = 2000; i <= 2013; i++) {
                var value = item.getTimeData(i);
                result.push({year: i, y: value});
            }

            return {timeSeriesItem: item, values: result};
        }));

        streamGraph.width = width - margin.left - margin.right;
        streamGraph.height = height - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .domain([2000, 2013])
            .range([0, streamGraph.width]);

        var y = d3.scale.linear()
            .domain([0, d3.max(layers, function(layer) { return d3.max(layer.values, function(d) { return d.y0 + d.y; }); })])
            .range([streamGraph.height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function(d) {
                return "'" + d.toString().substring(2);
            });

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .x(function(d) {  return x(d.year); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var $svg =  d3.select("#" + streamGraph.id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var $layerContainer = $svg.selectAll(".layers")
            .data(layers)
            .enter().append("g")
            .attr("class", "layers")
            .each(function(d) {
                var that = this;
                var item = d.timeSeriesItem.item;
                item.addHighlightCallback(streamGraph.id, function() {
                    if (item.isHighlighted()) {
                        d3.select(that).each(function(){
                            var secondToLast = this.parentNode.lastChild.previousSibling.previousSibling;
                            this.parentNode.insertBefore(this, secondToLast);
                        });
                    }
                });
            });

        streamGraph.$layers = $layerContainer.append("path")
            .attr("class", "area")
            .attr("d", function(d) { return area(d.values) })
            //.style("fill", function(d) { return colorFunc(d.timeSeriesItem.name); })
            .on('mouseover', function(d) {
                d.timeSeriesItem.item.setHighlighted(true);
            })
            .on('mouseleave', function(d) {
                d.timeSeriesItem.item.setHighlighted(false);
            })
            .on('click', function(d) {
                if (d.timeSeriesItem.item instanceof Country) {
                    d.timeSeriesItem.item.select();
                }
            })
            .each(function(d) {
                var item = d.timeSeriesItem.item;
                item.addVisComponent(streamGraph.id, this);


                if (item instanceof Country) {
                    item.addSelectedCallback(streamGraph.id, function() {
                        layerStrokeCallback(item);
                    });
                }

                item.addHighlightCallback(streamGraph.id, function() {
                    layerStrokeCallback(item);
                });

                layerStrokeCallback(item);
            });

        $layerContainer.append("text")
            .datum(function(d) { return {name: d.timeSeriesItem.item.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(2013) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        var $xAxis = $svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + streamGraph.height + ")")
            .call(xAxis);
        var $yAxis = $svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        $xAxis.append("text")
            .attr("x", streamGraph.width - 5)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Year");
        $yAxis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -5)
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yAxisText);

        streamGraph.$timeLine = $svg.append("line")
            .attr("y1", 0)
            .attr("y2", streamGraph.height)
            .style("stroke", "black")
            .style("stroke-width", "2px");

        streamGraph.updateTime(clock);

    };

    this.updateTime = function(someClock) {

        var x = (someClock.index + someClock.indexFraction) * (streamGraph.width / 13);
        streamGraph.$timeLine
            .attr("x1", x)
            .attr("x2", x);

        streamGraph.$layers
            .on("mousemove", function(d) {

                var value = d.timeSeriesItem.getTimeDataFromClock(someClock);
                var body = d3.select("#" + streamGraph.id);
                var mouse = d3.mouse(body.node()).map( function(d) { return parseInt(d); } );

                streamGraph.$tooltip.classed("hidden", false)
                    .attr("style", "margin-left:"+(mouse[0] + streamGraph.offsetL)+"px; margin-top:"+(mouse[1] + streamGraph.offsetT)+"px")
                    .html(d.timeSeriesItem.item.name + ": " + value + "%");

            })
            .on("mouseout",  function(d,i) {
                streamGraph.$tooltip.classed("hidden", true);
            });
    }

    this.dispose = function() {

        for (var c in countries) {
            countries[c].removeVisComponent(streamGraph.id);
        }

        for (var g in Group.groups) {
            Group.groups[g].removeVisComponent(streamGraph.id);
        }

        clock.removeCallback(streamGraph.callbackId);
    }
}

(function($) {

    /** Global subject list namespace declaration. */
    $.StreamGraph = {};

    $.fn.StreamGraph = function(items, width, height, normalized) {

            var streamGraph = new StreamGraph($(this));

            streamGraph.initialize(items, width, height, normalized);

            $(this).data('StreamGraph', StreamGraph);

            return streamGraph;
    };
})(jQuery);