/** GLOBAL VARIABLES */

/* (int*) Years of which there is data per country. */
var years = [];

/* country.name -> country */
var countryMap = {};
var countries = [];

var clock;

var colorFunc;

var lastClickedSeries = {groupConfig: {}, changedGroupConfig: function() {}};
var lastSelectedGroup = null;
var $countryList;
var $groupList;
var $groupSpecificList;
var $groupSpecificListTitle;
var $iconAddGroup;

/** DATA LOADING */

d3.json("./data/world-topo-min.json", function(error, world) {
    $.get('./data/internet_usage.txt', function(internetUsage) {
        var countriesData = topojson.feature(world, world.objects.countries).features;
        var countryToTimeData = {};

        var lines = internetUsage.split('\n');
        var attributes = lines[0].split('\t');

        for (var i = 1; i < attributes.length; i++) {
            years.push(parseInt(attributes[i]));
        }

        var Europe = {};
        var NorthUS = {};
        var SouthUS = {};
        var Asia = {};
        var Oceania = {};
        var Africa = {};


        // split method adds trash index at end
        for (var i = 1; i < lines.length - 1; i++) {

            var lineWords = lines[i].split('\t');

            var countryName = lineWords[0];
            var timeData = {};

            var prev1 = null;

            for (var j = 1; j < lineWords.length; j++) {
                var value = parseFloat(lineWords[j]);

                if (isNaN(value)) {
                    if (prev1 == null) {
                        value = 0;
                    }
                    else  {
                        value = prev1;
                    }
                }

                timeData[years[j - 1]] = value;
                prev1 =  value;
            }

            countryToTimeData[countryName] = timeData;
        }

        for (var k in countriesData) {
            var country = new Country(countriesData[k], countryToTimeData);
            var n = country.name;
            countryMap[n] = country;
            countries.push(country);

            if (n == "St. Helena" || n == "Algeria" || n == "Angola" || n == "Benin" || n == "Botswana" || n == "Burkina Faso" || n == "Burundi" || n == "Cameroon" || n == "Cape Verde" || n == "Central African Republic" || n == "Chad" || n == "Comoros" || n == "Congo" || n == "Congo, the Democratic Republic of the" || n == "Djibouti" || n == "Egypt" || n == "Equatorial Guinea" || n == "Eritrea" || n == "Ethiopia" || n == "Gabon" || n == "Gambia" || n == "Ghana" || n == "Guinea" || n == "Guinea-Bissau" || n == "Côte d'Ivoire" || n == "Coast" || n == "Kenya" || n == "Lesotho" || n == "Liberia" || n == "Libya" || n == "Madagascar" || n == "Malawi" || n == "Mali" || n == "Mauritania" || n == "Mauritius" || n == "Morocco" || n == "Mozambique" || n == "Namibia" || n == "Niger" || n == "Nigeria" || n == "Rwanda" || n == "Sao Tome & Principe" || n == "Senegal" || n == "Seychelles" || n == "Sierra Leone" || n == "Somalia" || n == "South Africa" || n == "South Sudan" || n == "Sudan" || n == "Swaziland" || n == "Tanzania" || n == "Togo" || n == "Tunisia" || n == "Uganda" || n == "Zambia" || n == "Zimbabwe") {
                Africa[n] = country;
            }

            if (n == "Palestine" || n == "Macao, China" || n == "Hong Kong" || n == "Taiwan, Province of China" || n == "Afghanistan" || n == "Bahrain" || n == "Bangladesh" || n == "Bhutan" || n == "Brunei Darussalam" || n == "Burma" || n == "Myanmar" || n == "Cambodia" || n == "China" || n == "East Timor" || n == "Timor-Leste" || n == "India" || n == "Indonesia" || n == "Iran" || n == "Iraq" || n == "Israel" || n == "Japan" || n == "Jordan" || n == "Kazakhstan" || n == "North Korea"|| n == "South Korea" || n == "Kuwait" || n == "Kyrgyzstan" || n == "Lao" || n == "Lebanon" || n == "Malaysia" || n == "Maldives" || n == "Mongolia" || n == "Nepal" || n == "Oman" || n == "Pakistan" || n == "Philippines" || n == "Qatar" || n == "Russia" || n == "Saudi Arabia" || n == "Singapore" || n == "Sri Lanka" || n == "Syria" || n == "Tajikistan" || n == "Thailand" || n == "Turkey" || n == "Turkmenistan" || n == "United Arab Emirates" || n == "Uzbekistan" || n == "Viet Nam" || n == "Yemen")
                Asia[n] = country;

            if (n == "Montserrat" || n == "Jersey" || n == "Guernsey" || n == "Faroe Islands" || n == "Falkland Islands" || n == "Albania" || n == "Andorra" || n == "Armenia" || n == "Austria" || n == "Azerbaijan" || n == "Belarus" || n == "Belgium" || n == "Bosnia and Herzegovina" || n == "Bulgaria" || n == "Croatia" || n == "Cyprus" || n == "Czech Republic" || n == "Denmark" || n == "Estonia" || n == "Finland" || n == "France" || n == "Georgia" || n == "Germany" || n == "Greece" || n == "Hungary" || n == "Iceland" || n == "Ireland" || n == "Italy" || n == "Latvia" || n == "Liechtenstein" || n == "Lithuania" || n == "Luxembourg" || n == "Macedonia" || n == "Malta" || n == "Moldova" || n == "Monaco" || n == "Montenegro" || n == "Netherlands" || n == "Norway" || n == "Poland" || n == "Portugal" || n == "Romania" || n == "San Marino" || n == "Serbia" || n == "Slovakia" || n == "Slovenia" || n == "Spain" || n == "Sweden" || n == "Switzerland" || n == "Ukraine" || n == "United Kingdom" || n == "Vatican City")
                Europe[n] = country;

            if (n == "Virgin Islands, US" || n == "Virgin Islands, British" || n == "Cayman Islands" || n == "Bermuda" || n == "Anguilla" || n == "Greenland" || n == "Antigua & Barbuda" || n == "Bahamas" || n == "Barbados" || n == "Belize" || n == "Canada" || n == "Costa Rica" || n == "Cuba" || n == "Dominica" || n == "Dominican Republic" || n == "El Salvador" || n == "Grenada" || n == "Guatemala" || n == "Haiti" || n == "Honduras" || n == "Jamaica" || n == "Mexico" || n == "Nicaragua" || n == "Panama" || n == "St. Kitts and Nevis" || n == "St. Lucia" || n == "St. Vincent and the Grenadines" || n == "Trinidad & Tobago" || n == "United States")
                NorthUS[n] = country;

            if (n == "Aruba" || n == "Argentina" || n == "Puerto Rico" || n == "Bolivia" || n == "Brazil" || n == "Chile" || n == "Colombia" || n == "Ecuador" || n == "Guyana" || n == "Paraguay" || n == "Peru" || n == "Suriname" || n == "Uruguay" || n == "Venezuela")
                SouthUS[n] = country;

            if (n == "Wallis and Futuna" || n == "French Polynesia" || n == "Niue" || n == "Guam" || n == "New Caledonia" || n == "Australia" || n == "Fiji" || n == "Kiribati" || n == "Marshall Islands" || n == "Micronesia" || n == "Nauru" || n == "New Zealand" || n == "Palau" || n == "Papua New Guinea" || n == "Samoa" || n == "Solomon Islands" || n == "Tonga" || n == "Tuvalu" || n == "Vanuatu")
                Oceania[n] = country;
        }


        new Group('Europe', Europe);
        new Group('Asia', Asia);
        new Group('North America', NorthUS);
        new Group('South America', SouthUS);
        new Group('Oceania', Oceania);
        new Group('Africa', Africa);

        doneLoading();
    });
});

/** LOGIC GOES IN HERE */
function doneLoading() {
    $countryList = $('#countryList');
    $groupList = $('#groupList');
    $groupSpecificList = $('#groupSpecificList');
    $groupSpecificListTitle = $('#groupSpecificListTitle');
    $iconAddGroup = $('#iconAddGroup');

    $('#clockGuiTemplate').clock(years);
    clock = $('#clockGuiTemplate').clock();

    d3.select(window).on("resize", throttle);

    colorFunc = d3.scale.category20();
    colorFunc.domain(Array.prototype.push.apply(Object.keys(countryMap), ["Europe", "Asia", "North America", "South America", "Africa", "Oceania"]));

    var throttleTimer;
    function throttle() {
        window.clearTimeout(throttleTimer);
        throttleTimer = window.setTimeout(function() {
            //redraw();
        }, 200);
    }

    $('#mapContainer').Map(null);
    $('.multiple').TimeSeriesVis(null);

    $('#btnDeselectAll').click(function() {
        Country.deselectAll();
    });

    buildCountryList();
    buildGroupList();

    Group.addChangedCallback(function(group) {
        buildGroupList

        if (lastSelectedGroup == group) {

            if (Group.groups[group.name] == undefined) {
                $groupSpecificList.empty();
                $groupSpecificListTitle.empty();
            }
            else
                buildGroupSpecificList(group);
        }
    });

    $iconAddGroup.click(function() {
        var count = 0;
        for (var k in Country.selected) {
            count++;
        }

        var name = prompt('Create a new group of ' + count + ' selected countries. Name?', '');
        if (name == null) {
            return;
        }
        while (Group.groups[name] != undefined || name == '') {
            if (name == '') {
                name = prompt('Name cannot be empty.');
            } else {
                name = prompt('Name ' + name + ' already taken.', '');
            }

            if (name == null) {
                return;
            }
        }

        new Group(name, Country.selected);
        Country.deselectAll();
        buildGroupList();
    });
}

function buildCountryList() {
    $countryList.empty();

    for (var k in countryMap) {
        var $item = $('<a class="list-group-item">' + k + '</a>');
        var country = countryMap[k];
        $item.data('country', country);
        $item.on('mouseover', function() { $(this).data('country').setHighlighted(true) });
        $item.on('mouseleave', function() { $(this).data('country').setHighlighted(false) });

        $item.click(function() {
            var country = $(this).data('country');
            country.select();
        });

        country.addVisComponent("countryList", $item);

        country.addSelectedCallback("countryList", function(country) {
            var listItem = country.getVisComponent("countryList");

            if (country.isSelected()) {
               listItem.css("background-color", "blue")
               listItem.css("color", "white");
           } else {
                listItem.css("background-color", "white");
                listItem.css("color", "black");
           }
        });

        country.addHighlightCallback("countryList", function(someCountry) {
            if (someCountry.isSelected())
                return;

            var listItem = someCountry.getVisComponent("countryList");
            if (someCountry.isHighlighted()) {
                listItem.css("background-color", "red")
                listItem.css("color", "white");
            }
            else {
                listItem.css("background-color", "white");
                listItem.css("color", "black");
            }
        });

        $countryList.append($item);
    }
};

function buildGroupList() {
    $groupList.empty();

    for (var k in Group.groups) {
        var $item = $('<a class="list-group-item"></a>');
        var $icon = $('<span><i class="fa ' + (lastClickedSeries.groupConfig[k] != undefined ? 'fa-check-circle-o' : 'fa-circle-o') + '"></i> ' + k + ' </span>');

        $item.data('group', Group.groups[k]);
        $icon.data('group', Group.groups[k]);

        $item.append($icon);

        var $remove = $('<i class="fa fa-remove pull-right"></i>');
        $remove.data('group', Group.groups[k]);
        $remove.click(function() {
            var group = $(this).data('group');
            group.setHighlighted(false);
            if (confirm('Remove group ' + group.name + '?')) {
                group.remove();
            }
        });

        $item.append($remove);

        if (lastClickedSeries.groupConfig[k] != undefined) {

            var config = lastClickedSeries.groupConfig[k];

            var $menu = $(
                '<div class="dropdown" style="margin-top:5px">' +
                    '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true"> ' + config + ' ' +
                        '<span class="caret"style="margin-left: 4px"></span>' +
                    '</button>' +
                    '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"></ul>' +
                '</div>');

            var $list = $menu.find('.dropdown-menu');

            $list.append('<li role="presentation" data-config="Average"><a role="menuitem" tabindex="-1"> Average </a></li>');
            $list.append('<li role="presentation" data-config="Minimum"><a role="menuitem" tabindex="-1"> Minimum </a></li>');
            $list.append('<li role="presentation" data-config="Maximum"><a role="menuitem" tabindex="-1"> Maximum </a></li>');
            $list.append('<li role="presentation" data-config="All countries"><a role="menuitem" tabindex="-1"> All countries </a></li>');

            $list.children().data('groupName', k);

            $list.children().click(function() {
                var config = $(this).attr('data-config');
                var groupName = $(this).data('groupName');

                lastClickedSeries.groupConfig[groupName] = config;
                lastClickedSeries.changedGroupConfig();
            });

            $item.append($menu);
        }

        $item.on('mouseenter', function() {
            var group = $(this).data('group');
            lastSelectedGroup = group;
            buildGroupSpecificList(group);
            group.setHighlighted(true);
        });

        $item.on('mouseleave click', function() {
            var group = $(this).data('group');
            group.setHighlighted(false);
        });

        $icon.click(function() {
            var group = $(this).data('group');

            if (lastClickedSeries.groupConfig[group.name] == undefined) {
                lastClickedSeries.groupConfig[group.name] = 'Average';
            } else {
                delete lastClickedSeries.groupConfig[group.name];
            }

            lastClickedSeries.changedGroupConfig();
        });

        Group.groups[k].addVisComponent("groupList", $item);
        Group.groups[k].addHighlightCallback("groupList", function(someGroup) {
            var listItem = someGroup.getVisComponent("groupList");
            if (someGroup.isHighlighted()) {
                listItem.css("background-color", "red");
                listItem.css("color", "white");
            }
            else {
                listItem.css("background-color", "white");
                listItem.css("color", "black");
            }
        });

        $groupList.append($item);
    }
}

function buildGroupSpecificList(group) {
    $groupSpecificList.empty();
    $groupSpecificListTitle.empty();
    $groupSpecificListTitle.append(group.name + ' ');

    var $btnAddToGroup = $('<div class="btn btn-xs btn-primary"><i class="fa fa-plus"></i></div>');
    $btnAddToGroup.data('group', group);

    $btnAddToGroup.click(function() {
        var group = $(this).data('group');

        var count = 0;
        for (var k in Country.selected) {
            count++;
        }

        if (confirm('Add ' + count + ' selected countries to ' + group.name + '?')) {
            for (var k in Country.selected) {
                group.addCountry(Country.selected[k]);
            }

            Country.deselectAll();
        }
    });

    $groupSpecificListTitle.append($btnAddToGroup);

    var $btnRemoveFromGroup = $('<div class="btn btn-xs btn-danger"><i class="fa fa-remove"></i></div>');
    $btnRemoveFromGroup.data('group', group);

    $btnRemoveFromGroup.click(function() {
        var group = $(this).data('group');

        var count = 0;
        for (var k in Country.selected) {
            count++;
        }

        if (confirm('Remove selected ' + count + ' countries from ' + group.name + '?')) {
            group.multiRemove(Country.selected);
            Country.deselectAll();
        }

    });

    $groupSpecificListTitle.append($btnRemoveFromGroup);

    for (var k in group.countryMap) {
        var $item = $('<a class="list-group-item">' + k + '</a>');
        var country = group.countryMap[k];
        $item.data('country', country);

        $item.on('mouseover', function() { $(this).data('country').setHighlighted(true) });
        $item.on('mouseleave', function() { $(this).data('country').setHighlighted(false) });

        $item.click(function() {
            var country = $(this).data('country');
            country.select();
        });

        country.addVisComponent("groupSpecificList", $item);

        if (country.isSelected()) {
            $item.css("background-color", "blue")
            $item.css("color", "white");
        }

        delete country.selectedCallbacks["groupSpecificList"];
        delete country.highlightCallbacks["groupSpecificList"];

        country.addSelectedCallback("groupSpecificList", function(country) {
            var listItem = country.getVisComponent("groupSpecificList");

            if (country.isSelected()) {
                listItem.css("background-color", "blue")
                listItem.css("color", "white");
            } else {
                listItem.css("background-color", "white");
                listItem.css("color", "black");
            }
        });

        country.addHighlightCallback("groupSpecificList", function(someCountry) {
            if (someCountry.isSelected())
                return;

            var listItem = someCountry.getVisComponent("groupSpecificList");
            if (someCountry.isHighlighted()) {
                listItem.css("background-color", "red");
                listItem.css("color", "white");
            }
            else {
                listItem.css("background-color", "white");
                listItem.css("color", "black");
            }
        });

        var $remove = $('<i class="fa fa-remove pull-right"></i>');
        $remove.data('group', group);
        $remove.data('country', country);
        $remove.click(function(evt) {
            evt.stopPropagation();
            var group = $(this).data('group');
            var country = $(this).data('country');
            country.setHighlighted(false);
            if (confirm('Remove ' + country.name + ' from ' + group.name + '?')) {
                group.removeCountry(country);
            }
        });
        $item.append($remove);

        $groupSpecificList.append($item);
    }
}