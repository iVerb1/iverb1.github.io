function LineChart($body) {
    var lineChart = this;

    var margin = {top: 20, right: 100, bottom: 30, left: 30};

    this.$body = $body;
    this.$timeLine;
    this.$lines;
    this.$tooltip;
    this.id = this.$body.attr('id');

    this.width;
    this.height;
    this.offsetL = document.getElementById(lineChart.id).offsetLeft + 5;
    this.offsetT = document.getElementById(lineChart.id).offsetTop - 65;
    this.callbackId;
    this.items = [];

    var strokeWidthNormal = '2px';
    var strokeWidthHighlighted = '6px';
    var strokeWidthSelected = '6px';
    var strokeSelected = 'blue';
    var strokeHighlighted = 'red';

    var lineStrokeCallback = function(item) {
        var selected = (item instanceof Country ? item.isSelected() : false);

        if (item.isHighlighted() && !selected) {
            item.getVisComponent(lineChart.id).style.strokeWidth = strokeWidthHighlighted;
            item.getVisComponent(lineChart.id).style.stroke = strokeHighlighted;
        }
        else {
            if (selected) {
                item.getVisComponent(lineChart.id).style.strokeWidth = strokeWidthSelected;
                item.getVisComponent(lineChart.id).style.stroke = strokeSelected;
            }
            else {
                item.getVisComponent(lineChart.id).style.strokeWidth = strokeWidthNormal;
                item.getVisComponent(lineChart.id).style.stroke = colorFunc(item.name)
            }
        }
    };

    this.initialize = function(items, width, height) {

        this.items = items;
        this.initWidth = width;
        this.initHeight = height;

        this.reinitialize();

        lineChart.callbackId = clock.addCallback(function(someClock) {
            lineChart.updateTime(someClock);
        });

    };

    this.reinitialize = function() {
        var width = this.initWidth;
        var height = this.initHeight;

        this.$body.empty();

        lineChart.$tooltip = d3.select("#" + lineChart.id)
            .append("div")
            .attr("class", "tooltip hidden");

        lineChart.width = width - margin.left - margin.right,
        lineChart.height = height - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, lineChart.width]);

        var y = d3.scale.linear()
            .range([lineChart.height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function(d) {
                return "'" + d.toString().substring(2);
            });

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.value); });

        x.domain([2000, 2013]);

        y.domain([0, 100]);

        var $svg = d3.select("#" + lineChart.id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var $xAxis = $svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + lineChart.height + ")")
            .call(xAxis);
        var $yAxis = $svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        $xAxis.selectAll('g.tick line')
            .attr("y1", 6)
            .attr("y2", -lineChart.height);
        $yAxis.selectAll('g.tick line')
            .attr("x1", -6)
            .attr("x2", lineChart.width);

        var $countries = $svg.selectAll(".city")
            .data(lineChart.items)
            .enter()
            .append("g")
            .attr("class", "city")
            .each(function(d) {
                var that = this;
                var item = d.item;
                item.addHighlightCallback(lineChart.id, function() {
                    if (item.isHighlighted()) {
                        d3.select(that).each(function(){
                            var secondToLast = this.parentNode.lastChild.previousSibling.previousSibling;
                            this.parentNode.insertBefore(this, secondToLast);
                        });
                    }
                });
            });

        lineChart.$lines = $countries.append("path")
            .attr("class", "line")
            .attr("d", function(item) {
                var values = [];
                for (var i = 2000; i <= 2013; i++) {
                    var value = item.getTimeData(i);
                    values.push({year: i, value: value});
                }
                return line(values);
            })
            .on('mouseover', function(d) {
                d.item.setHighlighted(true);
            })
            .on('mouseleave', function(d) {
                d.item.setHighlighted(false);
            })
            .on('click', function(d) {
                if (d.item instanceof Country) {
                    d.item.select();
                }
            })
            .each(function(d) {
                var item = d.item;
                item.addVisComponent(lineChart.id, this);

                if (item instanceof Country) {
                    item.addSelectedCallback(lineChart.id, function() {
                        lineStrokeCallback(item);
                    });
                }

                item.addHighlightCallback(lineChart.id, function() {
                    lineStrokeCallback(item);
                });

                lineStrokeCallback(item);
            });

        $countries.append("text")
            //.datum(function(country) { return {name: country.name, value: country.getTimeData(2013)}; })
            .attr("transform", function(country) {
                var value = country.getTimeData(2013);
                return "translate(" + x(2013) + "," + y(value) + ")";
            })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        $svg.append("text")
            .attr("x", lineChart.width - 5)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Year");
        $svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -5)
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Connectivity (%)");

        lineChart.$timeLine = $svg.append("line")
            .attr("y1", 0)
            .attr("y2", lineChart.height)
            .style("stroke", "black")
            .style("stroke-width", "2px");

        lineChart.updateTime(clock);
    };

    this.updateTime = function(someClock) {

        var x = (someClock.index + someClock.indexFraction) * (lineChart.width / 13);
        lineChart.$timeLine
            .attr("x1", x)
            .attr("x2", x);


        lineChart.$lines
            .on("mousemove", function(d) {

                var value = d.getTimeDataFromClock(someClock);
                var body = d3.select("#" + lineChart.id);
                var mouse = d3.mouse(body.node()).map( function(d) { return parseInt(d); } );

                lineChart.$tooltip.classed("hidden", false)
                    .attr("style", "margin-left:"+(mouse[0] + lineChart.offsetL)+"px; margin-top:"+(mouse[1] + lineChart.offsetT)+"px")
                    .html(d.name + ": " + value + "%");

            })
            .on("mouseout",  function(d,i) {
                lineChart.$tooltip.classed("hidden", true);
            });
    }

    this.dispose = function() {
        for (var c in countries) {
            countries[c].removeVisComponent(lineChart.id);
        }

        for (var g in Group.groups) {
            Group.groups[g].removeVisComponent(lineChart.id);
        }

        clock.removeCallback(lineChart.callbackId);
    }

}

(function($) {

    /** Global subject list namespace declaration. */
    $.TimeSeriesVis = {};

    $.fn.LineChart = function(items, width, height) {

            var lineChart = new LineChart($(this));

            lineChart.initialize(items, width, height);

            $(this).data('LineChart', LineChart);

            return lineChart;
    };
})(jQuery);