function TimeSeriesItem(item, getTimeData, getTimeDataFromClock) {
    this.name = item.name;
    this.item = item;
    this.timeData = getTimeData;
    this.timeDataFromClock = getTimeDataFromClock;

    this.getTimeData = function(time) {
        return this.timeData(this.item, time);
    }

    this.getTimeDataFromClock = function(clock) {
        return this.timeDataFromClock(this.item, clock);
    }
}