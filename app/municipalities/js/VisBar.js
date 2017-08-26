function VisBar($div) {
    var visBar = this;

    var margin = {top: 20, right: 20, bottom: 30, left: 55},
        width = 700 - margin.left - margin.right,
        height = 310 - margin.top - margin.bottom;

    //var colorActive = 'steelblue';
    //var colorHighlighted = 'red';

    this.xScale = d3.scale.ordinal()
        .rangeBands([0, width], .1);
    this.yScale = d3.scale.linear()
        .range([height, 0]);
    this.xAxis = d3.svg.axis()
        .scale(visBar.xScale)
        .orient("bottom");
    this.yAxis = d3.svg.axis()
        .scale(visBar.yScale)
        .orient("left");
    this.brush = d3.svg.brush()
        .x(visBar.xScale)
        .on("brush", function() {visBar.brushmove()});

    this.$div = $div;
    this.$title;
    this.$body;
    this.$xAxis;
    this.$yAxis;
    this.$bars;
    this.$cell;

    this.id = this.$div.attr('id');
    this.propertyId;

    this.initialize = function() {
        Feature.addActiveCallback(visBar.redraw);
        Feature.addFilterCallback(visBar.redraw);

        visBar.$body = $('<div id="'+ (visBar.id + '_body') +'"></div>');
        visBar.$div.append(visBar.$body);
        visBar.$title = $('#barChartTitle');

        var fillCallback = function(d) {
            if (d.isHighlighted()) {
                d[visBar.moduleDataId].$bar.style.fill = colorHighlighted;
            }
            else {
                d[visBar.moduleDataId].$bar.style.fill = colorActive;
            }
        };

        var svg = d3.select('#' + visBar.id + '_body').append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        visBar.$xAxis = svg.append("g")
            .attr("class", "x-axis-barchart")
            .attr("transform", "translate(0," + height + ")");

        visBar.$yAxis = svg.append("g")
            .attr("class", "y-axis-barchart");

        visBar.$cell = svg.append("g")
            .attr("class", "cell");

        visBar.$cell
            .append("rect")
            .attr("class", "frame")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        visBar.$cell
            .call(visBar.brush);

        svg.selectAll('g.cell rect')
            .attr("height", height);

        visBar.$bars = svg.select('g.cell').selectAll('.bar')
            .data(features)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("width", 150)
            .attr("y", 0)
            .on('mouseover', function(d) {
                d.setHighlighted(true);
            })
            .on('mouseout', function(d) {
                d.setHighlighted(false);
            })
            .on('mousedown', function(d) {
                Feature.setActive([d], function(feature) { return !feature.isActive(); });
            })
            .each(function(d) {
                d[visBar.moduleDataId] = {};
                d[visBar.moduleDataId].$bar = this;
                d.addHighlightCallback(fillCallback);
                fillCallback(d);
            });
    };

    this.redraw = function() {
        visBar.drawChart(visBar.propertyId);
    };

    this.drawChart = function(id) {

        if (id !== visBar.propertyId) {
            visBar.$title.empty();
            visBar.$title.append(id);
        }

        visBar.propertyId = id;

        var data = features
            .filter(function(d) { return d.isActive() && d.passesFilters(); })
            .sort(function(a, b) { return b.properties[id] - a.properties[id]; });

        var yMin = d3.min(data, function(d) { return d.properties[id]; });
        visBar.xScale.domain(data.map(function(d) { return d.gm_naam; }));
        if (yMin >= 0)
            visBar.yScale.domain([0, d3.max(data, function(d) { return d.properties[id]; })]);
        else
            visBar.yScale.domain([yMin, d3.max(data, function(d) { return d.properties[id]; })]);

        visBar.$xAxis.call(visBar.xAxis);

        visBar.$yAxis.call(visBar.yAxis);

        visBar.$yAxis.selectAll("g.tick line")
            .attr("x2", width);

        visBar.$bars
            .each(function(d) {
                if (visBar.xScale(d.gm_naam) !== undefined) {
                    $(this).css("display", "inline");
                    $(this).attr("width", visBar.xScale.rangeBand());
                    $(this).attr("height", height - visBar.yScale(d.properties[id]));
                    $(this).attr("x", visBar.xScale(d.gm_naam));
                    $(this).attr("y", visBar.yScale(d.properties[id]));
                }
                else {
                    $(this).css("display", "none");
                }
                $(this).attr('data-original-title', d.gm_naam + "<br>" + d.properties[id]);
                $(this).tooltip({placement: 'top', container: 'body', html: true});
            })
    };

    this.brushmove = function() {
        var ePlot = visPlot.brush.extent();
        var eBar = visBar.brush.extent();
        for (var f in features) {
            var d = features[f];
            var highlightedInPlot = (ePlot[0][0] <= d.properties[visPlot.propertyIdX] && d.properties[visPlot.propertyIdX] <= ePlot[1][0]
                && ePlot[0][1] <= d.properties[visPlot.propertyIdY] && d.properties[visPlot.propertyIdY] <= ePlot[1][1]
                && visPlot.dataMap[d.gm_naam] !== undefined);
            var highlightedInBarchart = (eBar[0] <= visBar.xScale(d.gm_naam) && eBar[1] >= visBar.xScale(d.gm_naam)
                && visBar.xScale(d.gm_naam) !== undefined);
            if(highlightedInPlot || highlightedInBarchart)
                d.setHighlighted(true, true);
            else
                d.setHighlighted(false, false);
        }
    };
}

(function($) {
    /** Global subject list namespace declaration. */
    $.visBar = {};

    /**
     * Creates a vis map for given subjects.
     */
    $.fn.visBar = function() {

        if (arguments.length == 0)
            return this.first().data('VisBar');

        this.each(function() {
            var visBar = new VisBar($(this));

            visBar.initialize();

            $(this).data('VisBar', visBar);
        });

        return null;
    };
})(jQuery);