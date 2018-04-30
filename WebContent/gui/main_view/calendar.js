/**
 * Der MainviewCalendar stellt initial die belegung der aktuellen KW dar. Für
 * angemeldete Benutzer (mit der entsprechenden Kompetenz) bietet er auch noch
 * Möglichkeiten des editierens eines Termins
 */
var MainViewCalendar = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/main_view/content.html", function() {

	self.currentDate = new Date();
	self.setupUI();
	self.update();
    });
}
MainViewCalendar.prototype = Object.create(WorkSpaceFrame.prototype)

/**
 * 
 */
MainViewCalendar.prototype.setupUI = function() {

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
MainViewCalendar.prototype.update = function() {

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
MainViewCalendar.prototype.fillWeek = function(startDate, endDate) {

    UIUtils.clearChilds("calendar-body");
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {

	// var day = this.makeDay(currentDate);
	// UIUtils.getElement("calendar-body").appendChild(day);
	// currentDate.setDate(currentDate.getDate() + 1);
	this.makeDay(currentDate);
	currentDate.setDate(currentDate.getDate() + 1);
    }
}

/**
 * Finde vom aktuellen Datum aus den ersten Montag in der Vergangenheit
 */
MainViewCalendar.prototype.findStartDate = function() {

    var result = new Date(this.currentDate);
    result.setDate(result.getDate() - DateTimeUtils.normalizeDayOfWeek(result));
    return result;
}

/**
 * Finde vom aktuellen Datum aus den ersten Sonntag in der Zukunft
 */
MainViewCalendar.prototype.findLastDate = function() {

    var result = new Date(this.findStartDate());
    result.setDate(result.getDate() + 6);
    return result;
}

/**
 * Lade das Wochen-Model
 */
MainViewCalendar.prototype.loadModel = function(startDate, endDate, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	self.model = new Model(rsp);
	onsuccess();
    }
    caller.onError = function(req, status) {
	// TODO: not yet implemented
    }

    var req = XmlUtils.createDocument("get-calendar-req");
    XmlUtils.setNode(req, "from", DateTimeUtils.formatDate(startDate, "{dd}.{mm}.{yyyy}"));
    XmlUtils.setNode(req, "until", DateTimeUtils.formatDate(endDate, "{dd}.{mm}.{yyyy}"));
    caller.invokeService(req);
}

/**
 * 
 */
MainViewCalendar.prototype.makeDay = function(date) {

    var day = document.createElement("div");
    day.className = "calendar-day";

    var content = document.createElement("div");
    content.className = "calendar-day-content";
    day.appendChild(content);

    var title = document.createElement("div");
    title.className = "calendar-day-title";
    title.textContent = DateTimeUtils.formatDate(date, "{D} - {dd}.{mm}.{yyyy}");
    content.appendChild(title);

    var filler = document.createElement("div");
    filler.className = "calendar-day-filler";
    content.appendChild(filler);

    var baseXPath = "/get-calendar-ok-rsp/entries/entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and keeper!= '0']";
    var entries = this.model.evaluateXPath(baseXPath);
    if (entries.length == 0) {
	content.className += " calendar-day-closed";
    } else {
	content.className += " calendar-day-open";
	content.appendChild(this.makeOpeningTimeIndicator(baseXPath));
    }
    UIUtils.getElement("calendar-body").appendChild(day);

    if (SessionManager.getSessionModel()) {

	var expand = this.createPropertiesMenu(baseXPath);
	content.appendChild(expand);
    }
}

/**
 * 
 */
MainViewCalendar.prototype.makeOpeningTimeIndicator = function(xpath) {

    var allFrom = this.model.evaluateXPath(xpath + "/begin");
    var allUntil = this.model.evaluateXPath(xpath + "/end");

    var begin = allFrom[0].textContent;
    var end = allUntil[allUntil.length - 1].textContent;

    var time = document.createElement("div");
    time.className = "calendar-day-time";
    time.textContent = begin + " - " + end;

    return time;
}

/**
 * 
 */
MainViewCalendar.prototype.createPropertiesMenu = function(xpath) {

    var menu = document.createElement("div");
    menu.className = "calendar-day-propmenu";
    return menu;
}
