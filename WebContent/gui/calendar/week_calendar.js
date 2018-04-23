var WeekCalendar = function(date) {

    this.currentDate = date || new Date();
    this.setupUI();
    this.update();
}

/**
 * 
 */
WeekCalendar.prototype.setupUI = function() {

    var self = this;
    UIUtils.getElement("calendar-go-back").addEventListener("click", function(evt) {
	self.currentDate.setDate(self.currentDate.getDate() - 7);
	self.update();
    });
    UIUtils.getElement("calendar-go-fore").addEventListener("click", function(evt) {
	self.currentDate.setDate(self.currentDate.getDate() + 7);
	self.update();
    });
}

/**
 * 
 */
WeekCalendar.prototype.update = function() {

    // update title
    var weekOfYear = DateTimeUtils.formatDate(this.currentDate, "Kalenderwoche {w}-{yyyy}");
    UIUtils.getElement("calendar-title").textContent = weekOfYear;

    var self = this;
    var startDate = this.findStartDate();
    var endDate = this.findLastDate();
    this.loadModel(startDate, endDate, function() {
	self.fillWeek(startDate, endDate);
    });
}

/**
 * 
 */
WeekCalendar.prototype.fillWeek = function(startDate, endDate) {

    UIUtils.clearChilds("workspace-body");
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {

	var day = this.makeDay(currentDate);
	UIUtils.getElement("workspace-body").appendChild(day);
	currentDate.setDate(currentDate.getDate() + 1);
    }
}

/**
 * Finde vom aktuellen Datum aus den ersten Montag in der Vergangenheit
 */
WeekCalendar.prototype.findStartDate = function() {

    var result = new Date(this.currentDate);
    result.setDate(result.getDate() - DateTimeUtils.normalizeDayOfWeek(result));
    return result;
}

/**
 * Finde vom aktuellen Datum aus den ersten Sonntag in der Zukunft
 */
WeekCalendar.prototype.findLastDate = function() {

    var result = new Date(this.findStartDate());
    result.setDate(result.getDate() + 6);
    return result;
}

/**
 * Lade das Wochen-Model
 */
WeekCalendar.prototype.loadModel = function(startDate, endDate, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	self.model = new Model(rsp);
	onsuccess();
    }
    caller.onError = function(req, status) {

    }

    var req = XmlUtils.createDocument("get-calendar-req");
    XmlUtils.setNode(req, "from", DateTimeUtils.formatDate(startDate, "{dd}.{mm}.{yyyy}"));
    XmlUtils.setNode(req, "until", DateTimeUtils.formatDate(endDate, "{dd}.{mm}.{yyyy}"));
    caller.invokeService(req);
}

/**
 * 
 */
WeekCalendar.prototype.makeDay = function(date) {

    var day = document.createElement("div");
    day.className = "calendar-day";

    var content = document.createElement("div");
    content.className = "calendar-day-content";
    day.appendChild(content);

    var title = document.createElement("div");
    title.className = "calendar-day-title";
    title.textContent = DateTimeUtils.formatDate(date, "{D} - {dd}.{mm}.{yyyy}");
    content.appendChild(title);

    // TODO: den Filler kannten mer noch brauchen...
    var filler = document.createElement("div");
    filler.className = "calendar-day-filler";
    content.appendChild(filler);

    var baseXPath = "/get-calendar-ok-rsp/entries/entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "']";
    var begin = this.model.getValue(baseXPath + "/begin");
    var end = this.model.getValue(baseXPath + "/end");
    if (begin && end) {

	content.className += " calendar-day-open";

	var time = document.createElement("div");
	time.className = "calendar-day-time";
	time.textContent += begin + " - " + end;
	content.appendChild(time);
    } else {
	content.className += " calendar-day-closed";
    }
    return day;
}
