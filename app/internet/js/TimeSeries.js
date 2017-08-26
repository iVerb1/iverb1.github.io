function TimeSeries($div) {
    var timeSeriesVis = this;

    var topMargin = 34;

    this.$div = $div;
    this.$body;
    this.$dropdown;
    this.$groupsButton;
    this.id = this.$div.attr('id');;
    this.visualization = null;

    this.items = [];
    this.groupConfig = {};
    for (var k in Group.groups) {
        this.groupConfig[Group.groups[k].name] = 'Average';
    }

    this.changedGroupCallback = function(group) {
        if (Group.groups[group.name] == undefined && timeSeriesVis.groupConfig[group.name] != undefined) {
            delete timeSeriesVis.groupConfig[group.name];
        }

        timeSeriesVis.changedGroupConfig();
    }

    Group.addChangedCallback(this.changedGroupCallback);

    this.initialize = function() {
        var timeSeries = this;

        timeSeriesVis.$body = $('<div id=' + timeSeriesVis.id + '_body></div>');
        timeSeriesVis.$dropdown = $(
            '<div class="btn-group" style="margin-right: 5px">' +
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    'Visualization Type <span class="caret"></span>' +
                '</button>' +
                '<ul class="dropdown-menu visTypeDropdown" role="menu">' +
                    '<li class="noChart"><a> None </a></li>' +
                    '<li class="lineChart"><a> Line Chart </a></li>' +
                    '<li class="standardStreamGraph"><a> Standard Stream Graph </a></li>' +
                    '<li class="normalizedStreamGraph"><a> Normalized Stream Graph </a></li>' +
                '</ul>' +
            '</div>');
        timeSeriesVis.$groupsButton = $('<button type="button" class="btn btn-default"> <i class="fa fa-group"></i> Group Configuration</button>');

        timeSeriesVis.$div.append(this.$dropdown);
        timeSeriesVis.$div.append(this.$groupsButton);
        timeSeriesVis.$div.append(this.$body);

        timeSeriesVis.$dropdown.children().find('.noChart').click(function() {
            timeSeriesVis.$body.empty();

            if (timeSeriesVis.visualization != null)
                timeSeriesVis.visualization.dispose();
        });

        timeSeriesVis.$dropdown.children().find('.lineChart').click(function() {
            timeSeriesVis.$body.empty();

            if (timeSeriesVis.visualization != null)
                timeSeriesVis.visualization.dispose();

            timeSeriesVis.visualization = timeSeriesVis.$body.LineChart(timeSeriesVis.items, timeSeriesVis.$div.width(), timeSeriesVis.$div.height() - topMargin);
        });

        timeSeriesVis.$dropdown.children().find('.standardStreamGraph').click(function() {
            timeSeriesVis.$body.empty();

            if (timeSeriesVis.visualization != null)
                timeSeriesVis.visualization.dispose();

            timeSeriesVis.visualization = timeSeriesVis.$body.StreamGraph(timeSeriesVis.items, timeSeriesVis.$div.width(), timeSeriesVis.$div.height() - topMargin, false);
        });

        timeSeriesVis.$dropdown.children().find('.normalizedStreamGraph').click(function() {
            timeSeriesVis.$body.empty();

            if (timeSeriesVis.visualization != null)
                timeSeriesVis.visualization.dispose();

            timeSeriesVis.visualization = timeSeriesVis.$body.StreamGraph(timeSeriesVis.items, timeSeriesVis.$div.width(), timeSeriesVis.$div.height() - topMargin, true);
        });

        timeSeriesVis.$groupsButton.click(function() {
            if (lastClickedSeries == timeSeries)
                lastClickedSeries = {groupConfig: {}, changedGroupConfig: function() {}};
            else
                lastClickedSeries = timeSeries;

            buildGroupList();
        });
    };

    this.changedGroupConfig = function() {

        var items = [];

        for (var k in this.groupConfig) {
            if (Group.groups[k] == undefined) {
                removedGroups.push(k);
            }

            var config = this.groupConfig[k];
            var group = Group.groups[k];

            if (config == 'All countries') {
                for (var l in group.countryMap) {
                    items.push(new TimeSeriesItem(group.countryMap[l], function(country, time){
                        return country.getTimeData(time);
                    }, function(country, clock){
                        return country.getTimeDataFromClock(clock);
                    }));
                }
            } else if (config == 'Average') {
                items.push(new TimeSeriesItem(group, function(group, time) {
                    return group.getTimeDataAverage(time);
                }, function(group, clock) {
                    return group.getTimeDataFromClockAverage(clock);
                }));
            } else if (config == 'Minimum') {
                items.push(new TimeSeriesItem(group, function(group, time) {
                    return group.getTimeDataMin(time);
                }, function(group, clock) {
                    return group.getTimeDataFromClockMin(clock);
                }));
            } else if (config == 'Maximum') {
                items.push(new TimeSeriesItem(group, function(group, time) {
                    return group.getTimeDataMax(time);
                }, function(group, clock) {
                    return group.getTimeDataFromClockMax(clock);
                }));
            }
        }

        this.items = items;

        if (this.visualization != null) {
            this.visualization.items = this.items;
            this.visualization.reinitialize();
        }

        buildGroupList();
    }

    this.changedGroupConfig();
}

(function($) {

    /** Global subject list namespace declaration. */
    $.TimeSeriesVis = {};

    $.fn.TimeSeriesVis = function() {

        this.each(function() {
            var timeSeriesVis = new TimeSeries($(this));

            timeSeriesVis.initialize();

            $(this).data('TimeSeriesVis', TimeSeries);
        });

        return null;
    };
})(jQuery);