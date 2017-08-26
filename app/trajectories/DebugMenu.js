var DebugMenu = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    onAdd: function (map) {
        "use strict";
        var container = L.DomUtil.create('div', 'dev-menu-container');

        var devMenu = d3.select(container).append("div")
            .attr("id", "dev-menu")
            .text("test test test")
            // Commence dirty inline HTML.
            .html('<div class="panel panel-default">\
                            <div class="panel-heading">\
                                <h3 class="panel-title">Debug Menu</h3>\
                            </div>\
                            <div class="panel-body">\
                                <div class="input-group">\
                                    <span class="input-group-addon">&epsilon;</span>\
                                    <input type="text" class="form-control" id="epsilon" placeholder="' + EPS + '" aria-describedby="epsilon">\
                                </div>\
                                <div class="input-group">\
                                    <span class="input-group-addon">&epsilon;<sub>s</sub></span>\
                                    <input type="text" class="form-control" id="epsilon_sim" placeholder="' + EPS_S + '" aria-describedby="epsilon_sim">\
                                </div>\
                                <div class="input-group">\
                                    <span class="input-group-addon">&alpha;</span>\
                                    <input type="text" class="form-control" id="alpha" placeholder="' + ALPHA * (180/Math.PI) + '" aria-describedby="alpha">\
                                </div>\
                                <div class="input-group">\
                                    <span class="input-group-addon">\
                                        <input type="checkbox" id="equalize" aria-label="equalize-label">\
                                        <label id="equalize-label" for="equalize">Equalize</label>\
                                    </span>\
                                </div>\
                                <div class="btn-group" role="group" aria-label="...">\
                                    <button type="button" id="recalculate" class="btn btn-default">Recalculate</button>\
                                </div>\
                           </div>');

        var epsilon = devMenu.select("#epsilon"),
            epsilon_sim = devMenu.select("#epsilon_sim"),
            alpha = devMenu.select("#alpha"),
            equalize = devMenu.select("#equalize"),
            recalculate = devMenu.select("#recalculate");

        epsilon.on("change", function () {
            var newVal = +this.value;
            if (isFinite(newVal)) {
                EPS = newVal;
                console.log("EPS set to " + EPS.toString());
            }
        });

        epsilon_sim.on("change", function () {
            var newVal = +this.value;
            if (isFinite(newVal)) {
                EPS_S = newVal;
                console.log("EPS_S set to " + EPS_S.toString());
            }
        });

        alpha.on("change", function () {
            var newVal = (Math.PI / 180) * +this.value;
            if (isFinite(newVal)) {
                ALPHA = newVal;
                console.log("ALPHA set to " + ALPHA.toString());
            }
        });

        equalize.on("change", function () {
            var newVal = this.checked;
            if (newVal) { // newVal is truthy
                EQUALIZE = true;
            }
            else { // newVal is falsy
                EQUALIZE = false;
            }
            console.log("EQUALIZE set to " + EQUALIZE.toString());
        }).property("value", EQUALIZE);

        recalculate.on("click", function () {
            console.log("Recalculate clicked");
            CalculateTrajectories(false);
        });

        return container;
    }
});