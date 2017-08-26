function VisScatterPlot($div) {
    var visPlot = this;

    var margin = {top: 20, right: 20, bottom: 35, left: 55};
    var width = 700 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    //var colorActive = 'blue';
    //var colorHighlighted = 'red';
    var strokeWidthHighlighted = "10px";
    var opacity = .7;

    var dotStyleCallback = function(d) {
        if (d.isHighlighted()) {
            d[visPlot.moduleDataId].$dot.style.fill = colorHighlighted;
            d[visPlot.moduleDataId].$dot.style.stroke = colorHighlighted;
            d[visPlot.moduleDataId].$dot.style.fillOpacity = 1;
        }
        else {
            d[visPlot.moduleDataId].$dot.style.fill = colorActive;
            d[visPlot.moduleDataId].$dot.style.stroke = "none";
            d[visPlot.moduleDataId].$dot.style.fillOpacity = opacity;
        }
        if (d.isHighlightLocked())
            d[visPlot.moduleDataId].$dot.style.strokeWidth = "0px";
        else
            d[visPlot.moduleDataId].$dot.style.strokeWidth = strokeWidthHighlighted;
    };

    this.$div = $div;
    this.$xAxisTitle;
    this.$yAxisTitle;
    this.$xAxis;
    this.$yAxis;
    this.$cell;
    this.$dots;
    this.dataMap;

    this.id = this.$div.attr('id');
    this.moduleDataId = 'data-' + this.id;
    this.propertyIdX;
    this.propertyIdY;

    this.xScale = d3.scale.linear().range([0, width]);
    this.yScale = d3.scale.linear().range([height, 0]);
    this.xAxis = d3.svg.axis()
        .scale(visPlot.xScale)
        .orient("bottom");
    this.yAxis = d3.svg.axis()
        .scale(visPlot.yScale)
        .orient("left");
    this.brush = d3.svg.brush()
        .x(visPlot.xScale)
        .y(visPlot.yScale)
        .on("brush", function() {visPlot.brushmove()});

    this.initialize = function() {
        Feature.addActiveCallback(visPlot.redraw);
        Feature.addFilterCallback(visPlot.redraw);

        visPlot.$xAxisTitle = $('#scatterPlotXAxisTitle');
        visPlot.$yAxisTitle = $('#scatterPlotYAxisTitle');
        visPlot.$body = $('<div id="'+ (visPlot.id + '_body') +'"></div>');
        visPlot.$div.append(visPlot.$body);

        var svg = d3.select('#' + visPlot.id + '_body').append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        visPlot.$xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")");

        visPlot.$xAxis
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end");

        visPlot.$yAxis = svg.append("g")
            .attr("class", "y-axis");

        visPlot.$yAxis
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        visPlot.$cell = svg.append("g")
            .attr("class", "cell");

        visPlot.$cell
            .append("rect")
            .attr("class", "frame")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        svg.select('g.cell')
            .call(visPlot.brush);

        visPlot.$dots = visPlot.$cell.selectAll(".dot")
            .data(features)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", 0)
            .attr("cy", 0)
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
                d[visPlot.moduleDataId] = {};
                d[visPlot.moduleDataId].$dot = this;
                d.addHighlightCallback(dotStyleCallback);
                dotStyleCallback(d);
            });

    };

    this.redraw = function () {
        visPlot.drawPlot(visPlot.propertyIdX, visPlot.propertyIdY);
    };

    this.getXProperty = function() {
        return visPlot.propertyIdX;
    };

    this.getYProperty = function() {
        return visPlot.propertyIdY;
    };

    this.drawPlot = function(idX, idY) {
        visPlot.propertyIdX = idX;
        visPlot.propertyIdY = idY;

        visPlot.$xAxisTitle.empty();
        visPlot.$xAxisTitle.append(idX);
        visPlot.$yAxisTitle.empty();
        visPlot.$yAxisTitle.append(idY);

        visPlot.dataMap = {};
        var dataArray = [];
        for (var f in features) {
            var d = features[f];
            if (d.isActive() && d.passesFilters()) {
                visPlot.dataMap[d.gm_naam] = d;
                dataArray.push(d);
            }
        }

        visPlot.xScale.domain(d3.extent(dataArray, function(d) {return d.properties[idX]} ));
        visPlot.yScale.domain(d3.extent(dataArray, function(d) {return d.properties[idY]} ));

        visPlot.$xAxis
            .call(visPlot.xAxis);

        visPlot.$xAxis.select('text')
            .text(idX);

        visPlot.$yAxis
            .call(visPlot.yAxis);

        visPlot.$yAxis.select('text')
            .text(idY);

        visPlot.$xAxis.selectAll('g.tick line')
            .attr("y2", -height);

        visPlot.$yAxis.selectAll('g.tick line')
            .attr("x2", width);

        visPlot.$dots
            .each(function(d) {
                if (visPlot.dataMap[d.gm_naam] !== undefined) {
                    $(this).css("display", "inline");
                    $(this).attr("cx", visPlot.xScale(d.properties[idX]));
                    $(this).attr("cy", visPlot.yScale(d.properties[idY]));
                }
                else {
                    $(this).css("display", "none");
                }
                $(this).attr('data-original-title', d.gm_naam + "<br> (" + d.properties[idX] + ", " + d.properties[idY] + ")");
                $(this).tooltip({placement: 'top', container: 'body', html: true});
            });

        visPlot.$cell.call(visPlot.brush.clear());

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
    $.visScatterPlot = {};

    /**
     * Creates a vis map for given subjects.
     */
    $.fn.visScatterPlot = function() {

        if (arguments.length == 0)
            return this.first().data('VisScatterPlot');

        this.each(function() {
            var visScatterPlot = new VisScatterPlot($(this));

            visScatterPlot.initialize();

            $(this).data('VisScatterPlot', visScatterPlot);
        });

        return null;
    };
})(jQuery);