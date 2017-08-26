function Clock($div, times) {

    this.$div = $div;
    this.id = this.$div.attr('id');

    this.times = times;
    this.timeIndexMap = {};

    for (var k in times) {
        this.timeIndexMap[times[k]] = parseInt(k);
    }

    this.minIndex;
    this.maxIndex;
    this.index;
    this.indexFraction;

    // amount of steps it takes to go from index i to index i + 1
    this.fractionalSteps;

    // if true, resets and restarts the clock when the last index is reached while running
    this.repeat;
    // if true, auto-stops when an index is reached
    this.sticky;
    this.running;

    this.secondsPerIndex;
    this.interval = null;

}

Clock.prototype.initialize = function() {
    this.restore();

    var clock = this;

    this.newMinMaxIsMin = null;

    var $minMaxRow = this.$div.find('.min-max-row');
    var $timeRow = this.$div.find('.time-row');

    for (var k in this.times) {
        var $minMaxCell = $('<td class="min-max-cell"></td>');
        $minMaxCell.data('index', parseInt(k));

        $minMaxCell.click(function() {
            var index = $(this).data('index');

            if (clock.newMinMaxIsMin == null) {
                if (index == clock.minIndex) {
                    clock.newMinMaxIsMin = true;
                } else if (index == clock.maxIndex) {
                    clock.newMinMaxIsMin = false;
                }
            } else {
                if (clock.newMinMaxIsMin && index < clock.maxIndex) {
                    clock.updateMinMax(index, clock.maxIndex);
                }
                else if (index > clock.minIndex) {
                    clock.updateMinMax(clock.minIndex, index);
                }

                clock.newMinMaxIsMin = null;
            }
        });

        $minMaxRow.append($minMaxCell);

        var $timeCell = $('<td class="time-cell">' + this.times[k] + '</td>');
        $timeCell.data('time', this.times[k]);

        $timeCell.click(function() {
            var time = $(this).data('time');

            clock.setTime(time);
        });

        $timeRow.append($timeCell);
    }

    this.$progressBar = this.$div.find('.progression-div');
    this.$progressBar.css('width', '0px');

    var updateProgressBar = function(target) {
        clock.$progressBar.css('width', ((target.index - target.minIndex + target.indexFraction) * 35) + 'px');
    }

    this.addCallback(updateProgressBar);

    this.updateMinMaxCells();

    //this.$div.draggable({ containment: "body" });

    this.$iconStartStop = this.$div.find('.clock-icon-start-stop');

    this.$div.find('.clock-start-stop').click(function() {

        if (clock.running) {
            clock.stop();
        } else {
            clock.start();
        }
    });

    this.$div.find('.clock-seconds').change(function() {
        var val = $(this).val();
        clock.secondsPerIndex = val;

        if (clock.running) {
            clock.stop();
            clock.start();
        }
    });

    this.$div.find('.clock-steps').change(function() {
        var val = $(this).val();
        clock.fractionalSteps = val;

        if (clock.running) {
            clock.stop();
            clock.start();
        }
    });

    this.$div.find('.clock-sticky').change(function() {
        var val = $(this).prop('checked');
        clock.sticky = val;
    });

    this.$div.find('.clock-repeat').change(function() {
        var val = $(this).prop('checked');
        clock.repeat = val;
    });
};



Clock.prototype.updateMinMax = function(min, max) {
    if (min >= max || max <= min)
        return;

    this.minIndex = min;
    this.maxIndex = max;

    this.updateMinMaxCells();

    this.resetTime();
}

Clock.prototype.updateMinMaxCells = function() {
    this.$div.find('.pre-progression-div').css('width', 35*(this.minIndex + 1) - 2);

    var $cells = this.$div.find('.min-max-cell');
    $cells.removeClass('min-max-cell-selected');
    $cells.slice(this.minIndex + 1, this.maxIndex + 1).addClass('min-max-cell-selected');
};

Clock.prototype.callbackIdGen = 0;
Clock.prototype.callbacks = {};

Clock.prototype.addCallback = function (callback) {
    var id = this.callbackIdGen++;

    this.callbacks[id] = callback;

    return id;
};

Clock.prototype.removeCallback = function(id) {
    delete this.callbacks[id];
};

Clock.prototype.runCallbacks = function() {

    for (var k in this.callbacks) {
        this.callbacks[k](this);
    }
};

Clock.prototype.restore = function() {
    this.stop();
    this.minIndex = 0;
    this.maxIndex = this.times.length - 1;
    this.resetTime();
    this.fractionalSteps = 16;
    this.repeat = false;
    this.sticky = false;
    this.secondsPerIndex = 1;
};

Clock.prototype.resetTime = function() {
    this.setIndex(this.minIndex, 0);
};

Clock.prototype.start = function() {
    clearInterval(this.interval);

    this.running = true;
    var clock = this;
    this.interval = setInterval(function() { clock.tick(); }, 1000 * this.secondsPerIndex / this.fractionalSteps);

    if (this.$iconStartStop != undefined) {
        this.$iconStartStop.removeClass('fa-play');
        this.$iconStartStop.addClass('fa-pause');
    }
};

Clock.prototype.stop = function() {
    clearInterval(this.interval);

    this.running = false;

    if (this.$iconStartStop != undefined) {
        this.$iconStartStop.removeClass('fa-pause');
        this.$iconStartStop.addClass('fa-play');
    }
};

Clock.prototype.tick = function() {
    if (this.index >= this.maxIndex) {
        this.resetTime();
        return;
    }

    var index = this.index;
    var indexFraction = this.indexFraction + 1/this.fractionalSteps;

    if (indexFraction >= 1 - 0.5/this.fractionalSteps) {
        index++;
        indexFraction = 0;

        if (this.sticky || (index == this.maxIndex && !this.repeat))
            this.stop();
    }

    this.setIndex(index, indexFraction);
};

Clock.prototype.setIndex = function(index, indexFraction) {
    this.index = index;
    this.indexFraction = indexFraction;

    this.runCallbacks();
};

Clock.prototype.setTime = function(time) {
    this.setIndex(this.timeIndexMap[time], 0);
};

(function($) {

    /** Global subject list namespace declaration. */
    $.clock = {};

    /**
     * Creates a GUI for the given clock.
     */
    $.fn.clock = function(times) {

        if (arguments.length == 0)
            return this.first().data('Clock');

        this.each(function() {
            var clock = new Clock($(this), times);

            clock.initialize();

            $(this).data('Clock', clock);
        });

        return null;
    };
})(jQuery);