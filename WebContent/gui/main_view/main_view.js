/**
 * Der MainviewCalendar stellt initial die belegung der aktuellen KW dar. Für
 * angemeldete Benutzer (mit der entsprechenden Kompetenz) bietet er auch noch
 * Möglichkeiten des editierens eines Termins
 */
var MainViewCalendar = function() {

    this.currentDate = new Date();
    
    var self = this;
    WorkSpaceFrame.call(this, "gui/main_view/calendar.html", function() {

	self.setupUI();
	self.update();
    });
}
MainViewCalendar.prototype = Object.create(WorkSpaceFrame.prototype)

/**
 * 
 */
MainViewCalendar.prototype.getTitle = function() {
    
    return "Eddy CrashPaddy";
}

/**
 * 
 */
MainViewCalendar.prototype.setupUI = function() {

    var self = this;

    this.createToolButton("gui/images/go-back.svg", "Eine Woche zurück", function() {
	self.currentDate.setDate(self.currentDate.getDate() - 7);
	self.update();
    });
    this.createToolButton("gui/images/go-fore.svg", "Eine Woche vor", function() {
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
    // UIUtils.getElement("calendar-title").textContent = weekOfYear;

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

    UIUtils.clearChilds("workspace-frame-content-body");
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
	this.makeDay(new Date(currentDate));
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

    var baseXPath = "/get-calendar-ok-rsp/entries/entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and keeper != '0']";
    var entries = this.model.evaluateXPath(baseXPath);
    if (entries.length == 0) {
	content.className += " calendar-day-closed";
    } else {
	content.className += " calendar-day-open";
	content.appendChild(this.makeOpeningTimeIndicator(baseXPath));
    }
    UIUtils.getElement("workspace-frame-content-body").appendChild(day);

    var self = this;
    if (SessionManager.hasSession()) {

	UIUtils.addClass(content, "clickable");
	content.addEventListener("click", function() {
	    new MainViewDetails(self.model, date);
	});
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

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MainViewDetails = function(model, day) {

    this.model = model;
    this.day = day;

    var self = this;
    WorkSpaceFrame.call(this, "gui/main_view/details.html", function() {
	self.actionRemove = self.createRemoveAction();
	var observingXPath = "//get-calendar-ok-rsp/entries/entry[date='" + DateTimeUtils.formatDate(this.day, "{dd}.{mm}.{yyyy}") + "']";
	self.model.addChangeListener(observingXPath, function() {
	    self.update();
	});
	self.update();
    });
}
MainViewDetails.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MainViewDetails.prototype.getTitle = function() {

    var date = DateTimeUtils.formatDate(this.day, "{dd}.{mm}.{yyyy}");
    return "Tages-Plan für den " + date;
}


/**
 * 
 */
MainViewDetails.prototype.createRemoveAction = function() {

    var btn = this.createToolButton("gui/images/trashbin.svg", "Löschen", function() {

    });
    btn.hide();
    return btn;
}

/**
 * 
 */
MainViewDetails.prototype.update = function() {

    UIUtils.clearChilds("mainview-details-body");
    this.fillAllKeepers();
    // this.fillAllPurifiers(day);
}

/**
 * 
 */
MainViewDetails.prototype.fillAllKeepers = function() {

    var xpath = "//get-calendar-ok-rsp/entries/entry[date='" + DateTimeUtils.formatDate(this.day, "{dd}.{mm}.{yyyy}") + "' and keeper!= '0']";
    var allEntries = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allEntries.length; i++) {

	var entryXPath = XmlUtils.getXPathTo(allEntries[i]);
	this.fillOneKeeper(entryXPath);
    }
}

/**
 * 
 */
MainViewDetails.prototype.fillOneKeeper = function(entryXPath) {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.className = "hidden";
    radio.name = "mainview_details_entry";
    UIUtils.getElement("mainview-details-body").appendChild(radio);

    var entry = new MainViewDetailsEntry(this.model, entryXPath);
    var entryUI = entry.container;
    UIUtils.getElement("mainview-details-body").appendChild(entryUI);

    var self = this;
    entryUI.addEventListener("click", function() {

	// click the radio to enable the css-rule for selected entries
	radio.click();

	var memberId = self.model.getValue(entryXPath + "/keeper");
	if (SessionManager.isAdmin() || SessionManager.isMee(memberId)) {
	    self.currEntry = entry;
	    self.currEntryXPath = entryXPath;
	    self.actionRemove.show();
	} else {
	    self.currEntry = self.currEntryXPath = null;
	    self.actionRemove.hide();
	}
    });
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MainViewDetailsEntry = function(model, entryXPath) {

    this.model = model;
    this.entryXPath = entryXPath;

    this.container = document.createElement("div");
    this.container.className = "details-entry-cnr";

    var memberId = this.model.getValue(this.entryXPath + "/keeper");
    this.container.appendChild(this.makeAvatar(memberId));

    this.container.appendChild(this.makeNameSection(memberId));
    this.container.appendChild(this.makeTimeSection(memberId));
}

/**
 * 
 */
MainViewDetailsEntry.prototype.makeAvatar = function(memberId) {

    var img = document.createElement("img");
    img.className = "avatar";
    img.src = "getDocument/memberImage/?id=" + memberId;
    return img;
}

/**
 * 
 */
MainViewDetailsEntry.prototype.makeNameSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-namesection";

//    var isEditable = SessionManager.isAdmin() || SessionManager.isMee(memberId);
//    if (isEditable) {
//	result.className += " details-content-selectable";
//
//	var self = this;
//	result.addEventListener("click", function() {
//	    new MemberOverview(self.model, "//get-calendar-ok-rsp/members", function(id) {
//	    }, memberId);
//	});
//    }

    var self = this;
    var xpath = "//get-calendar-ok-rsp/members/member[id='" + memberId + "']";
    var fromXML = function(val) {
	var vname = self.model.getValue(xpath + "/vname");
	var zname = self.model.getValue(xpath + "/zname");
	return vname + " " + zname;
    }
    this.model.createAttributeBinding(result, "textContent", xpath, null, null, fromXML);
    return result;
}

/**
 * 
 */
MainViewDetailsEntry.prototype.makeTimeSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-timesection";

    // zeiten
    var from = document.createElement("input");
    from.className = "details-content-time";
    this.model.createValueBinding(from, this.entryXPath + "/begin");
    result.appendChild(from);

    var fill = document.createElement("span");
    fill.textContent = " - ";
    result.appendChild(fill);

    var end = document.createElement("input");
    end.className = "details-content-time";
    this.model.createValueBinding(end, this.entryXPath + "/end");
    result.appendChild(end);

    if (!SessionManager.isAdmin() && !SessionManager.isMee(memberId)) {
	from.disabled = end.disabled = true;
    }

    return result;
}
