var visMap;
var visPlot;
var visBar;

var featureMap = {};
var features = [];
var propertyMap = {};
var propertyFilterMap = {};

var colorActive = 'blue';
var colorInactive = 'darkgray';
var colorFiltered = '#cc99ff';
var colorHighlighted = 'red';

$.getJSON('./data/cities-geometry.json', function(citiesGeometry) {
    $.get('./data/cities-data.txt', function(citiesData) {

        var gm_codeToProperties = {};

        var lines = citiesData.split('\n');
        var propertyIds = lines[0].split('\t');
        var propertyList = [];

        for (var i = 5; i < propertyIds.length; i++) {
            var id = propertyIds[i].toLowerCase();
            if (i == propertyIds.length - 1) {
                id = id.replace('\r', '');
            }
            createProperty(id, false, 'primitive');
            propertyList[i] = id;
        }

        // last line of cities-data is rubbish, and split method added trash index at end
        for (var i = 1; i < lines.length - 2; i++) {

            var lineWords = lines[i].split('\t');

            var gm_code = lineWords[0];
            var properties = {};

            for (var j = 5; j < lineWords.length; j++) {
                var value = parseFloat(lineWords[j]);

                propertyFilterMap[propertyList[j]].updateLowerBound(value);
                propertyFilterMap[propertyList[j]].updateUpperBound(value);

                properties[propertyList[j]] = value;
            }

            gm_codeToProperties[gm_code] = properties;
        }

        for (var k in citiesGeometry.features) {
            var feature = new Feature(citiesGeometry.features[k]);

            if (gm_codeToProperties[feature.gm_code] == undefined) {
                //console.log('geometry but no cities-data for ' + feature.gm_code + ' - ' + feature.gm_naam);
                continue;
            }

            featureMap[feature.gm_code] = feature;
            features.push(feature);
            feature.properties = gm_codeToProperties[feature.gm_code];

            delete gm_codeToProperties[feature.gm_code];
        }

        //console.log('cities-data but no geometry for');
        //console.log(gm_codeToProperties);

        loaded();
    });
});

function trimNumber(n) {
    if (n % 1 == 0)
        return '' + n;

    var split = '';
}

function getExtremes(propertyId, includeInactiveFeatures) {
    var minValue = Number.MAX_VALUE;
    var maxValue = Number.MIN_VALUE;

    for (var i = 0; i < features.length; i++) {
        if ((features[i].isActive() && features[i].passesFilters()) || includeInactiveFeatures) {

            var feature = features[i];
            var propertyValue = feature.properties[propertyId];

            if (propertyValue > maxValue)
                maxValue = propertyValue;

            if (propertyValue < minValue)
                minValue = propertyValue;
        }
    }
    return [minValue, maxValue];
}

function addPropertyFromModal() {
    var name = $('#inputPropertyName').val();

    var definition = $('#inputPropertyDefinition').val();

    if (name.indexOf('$') > -1) {
        alert('Name cannot contain $.');
        return;
    }
    else if (name == '') {
        alert('Name cannot be empty');
        return;
    }
    else if (propertyMap[name] != undefined) {
        alert('Attribute with name ' + name + ' already exists.');
        return;
    }
    else if (definition == '') {
        alert('Definition cannot be empty.');
        return;
    }
    else { //still a bit buggy
        createProperty(name, true, definition);

        var moddedDef =  definition.replace(/\$/g, 'feature.properties.');

        var calculateProperty = Function('feature', 'return ' + moddedDef);

        for (var k in features) {
            var feature = features[k];
            var value = calculateProperty(feature)

            feature.properties[name] = value;
            propertyFilterMap[name].updateLowerBound(value);
            propertyFilterMap[name].updateUpperBound(value);
        }

        initializePropertyLists();

        $('#buttonCloseModal').click();
    }
}

function createProperty(id, userDefined, definition) {
    var property = new Property(id, userDefined, definition);
    propertyMap[property.id] = property;
    propertyFilterMap[property.id] = new PropertyFilter(property);

    return property;
}

function removeProperty(propertyId) {

    for (var k in features) {
        delete features[k].properties[propertyId];
    }

    delete propertyMap[propertyId];
    propertyFilterMap[propertyId].setEnabled(false);
    delete propertyFilterMap[propertyId];

    initializePropertyLists();
}

function sortPropertiesOnId(properties) {
    properties.sort(function(p1, p2) {
        if (p1.id < p2.id)
            return -1;
        else if (p1.id > p2.id)
            return 1;
        else
            return 0;
    });
}

function configureFilter(propertyId) {
    var filter = propertyFilterMap[propertyId];

    $('#filterPanel').show();

    var $icon = $('#filterPanelIcon');
    var $toggleFilter = $('#buttonToggleFilter');

    var updateEnabled = function() {
        $icon.removeClass(filter.isEnabled() ? 'btn-default' : 'btn-success');
        $icon.addClass(filter.isEnabled() ? 'btn-success' : 'btn-default');

        $toggleFilter.empty();
        $toggleFilter.append(filter.isEnabled() ? 'Disable' : 'Enable');

        var $iconList = $('#btn_filter_' + filter.id);
        $iconList.removeClass(filter.isEnabled() ? 'btn-default' : 'btn-success');
        $iconList.addClass(filter.isEnabled() ? 'btn-success' : 'btn-default');
    }

    updateEnabled();

    $('#filterPanelName').empty();
    $('#filterPanelName').append(filter.id);

    var $minVal = $('#filterMinVal');
    var $maxVal = $('#filterMaxVal');

    var updateMinMax = function() {
        $minVal.empty();
        $minVal.append(filter.minValue);

        $maxVal.empty();
        $maxVal.append(filter.maxValue);
    }

    updateMinMax();

    $('#filterSlider').slider({
        range : true,
        min : filter.lowerBound - (filter.upperBound - filter.lowerBound) * 0.04,
        max : filter.upperBound + (filter.upperBound - filter.lowerBound) * 0.04,
        values : [filter.minValue, filter.maxValue],
        step : (filter.upperBound - filter.lowerBound) * 0.01,
        slide : function() {
            visBar.$cell.call(visBar.brush.clear());
            var values = $(this).slider('values');
            filter.setMinMaxValue(values[0], values[1]);
            updateMinMax();
        },
        stop : function() {
            $(this).slider('values', [filter.minValue, filter.maxValue]);
        }
    });

    $toggleFilter.off('click');
    $toggleFilter.click(function() {
        filter.setEnabled(!filter.isEnabled());

        updateEnabled();
    });

}

function changeScope() {
    if (!visPlot.brush.empty() || !visBar.brush.empty()) {
        var activeFeatures = {};
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
                activeFeatures[d.gm_naam] = d;
        }

        clearBrushes();
        Feature.setActive(features, function(d) {return activeFeatures[d.gm_naam]});
        Feature.setHighlighted(features, function(d) {return false;}, function(d) {return false;});
    }
}

function clearBrushes() {
    visPlot.$cell.call(visPlot.brush.clear());
    visBar.$cell.call(visBar.brush.clear());

    for (var d in features) {
        features[d].setHighlighted(false, false);
    }
}

function initializePropertyLists() {
    var $propertiesList = $('#propertiesList');
    var $xAxisList = $('#xAxisList');
    var $yAxisList = $('#yAxisList');
    var $yAxisListBar = $('#yAxisListBar');
    $propertiesList.empty();
    $xAxisList.empty();
    $yAxisList.empty();
    $yAxisListBar.empty();

    var properties = [];

    for (var k in propertyMap) {
        properties.push(propertyMap[k]);
    }

    sortPropertiesOnId(properties);

    for (var k in properties) {
        var property = properties[k];
        var item;

        if (property.userDefined) {
            item = '<a class="list-group-item" data-property="' + properties[k].id + '" data-toggle="tooltip" data-placement="right" title="' + property.definition + '">' + properties[k].id +
                '<button id="btn_filter_' + property.id + '" style="float: right" class="btn-filter btn btn-xs ' + (propertyFilterMap[property.id].isEnabled() ? 'btn-success' : 'btn-default') + '"><i class="fa fa-filter"></i></button>' +
                '<button style="float: right" class="btn btn-xs btn-danger btn-remove"><i class="fa fa-trash-o"></i></button></a>';
            $propertiesList.append(item);
            item = '<li><a data-property="' + properties[k].id + '" data-toggle="tooltip" data-placement="right" title="' + property.definition + '">' + properties[k].id + '</a></li>';
            $xAxisList.append(item);
            $yAxisList.append(item);
            $yAxisListBar.append(item);
        } else {
            item ='<a class="list-group-item" data-property="' + properties[k].id + '">' + properties[k].id + '<button id="btn_filter_' + property.id + '" style="float: right" class="btn-filter btn btn-xs ' +
                (propertyFilterMap[property.id].isEnabled() ? 'btn-success' : 'btn-default') + '"><i class="fa fa-filter"></i></button></a>';
            $propertiesList.append(item);
            item ='<li><a data-property="' + properties[k].id + '">' + properties[k].id + '</a></li>';
            $xAxisList.append(item);
            $yAxisList.append(item);
            $yAxisListBar.append(item);
        }
    }

    $('#xAxisList a').click(function() {
       visPlot.drawPlot($(this).attr('data-property'), visPlot.getYProperty());
    });

    $('#yAxisList a').click(function() {
        visPlot.drawPlot(visPlot.getXProperty(), $(this).attr('data-property'));
    });

    $('#yAxisListBar a').click(function() {
        visBar.drawChart($(this).attr('data-property'));
    });

    $('#propertiesList a').click(function() {
        visMap.drawMap($(this).attr('data-property'));
    });

    $('.propertyList a .btn-remove').click(function(event) {
        event.stopPropagation();
        var propertyId = $(this).closest('a').attr('data-property');
        if (confirm('Are you sure you want to remove ' + propertyId + '?'))
            removeProperty(propertyId);
    });

    $('.propertyList a .btn-filter').click(function(event) {
        event.stopPropagation();
        var propertyId = $(this).closest('a').attr('data-property');
        configureFilter(propertyId);
    });
}

function loaded() {

    initializePropertyLists();

    $('#changeScopeButton').click(changeScope);

    $('#select-all ').click(function() {
        clearBrushes();
        Feature.setActive(features, function(){return true;});
    });

    $('#deselect-all ').click(function() {
        clearBrushes();
        Feature.setActive(features, function(){return false;});
    });

    $('#invert-selection ').click(function() {
        clearBrushes();
        Feature.setActive(features, function(feature){return !feature.isActive()});
    });

    $('#filterPanel').hide();

    $('#buttonCloseFilterPanel').click(function() {
        $('#filterPanel').hide();
    });

    $('#mapContainer').visMap(null);
    visMap = $('#mapContainer').visMap();
    visMap.drawMap('aant_inw');

    $('#scatterPlotContainer').visScatterPlot(null);
    visPlot = $('#scatterPlotContainer').visScatterPlot();
    visPlot.drawPlot('aant_inw', 'aant_man');

    $('#barChartContainer').visBar(null);
    visBar = $('#barChartContainer').visBar();
    visBar.drawChart('aant_inw');

}