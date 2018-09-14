/**
 * Der MainViewCalendar stellt initial die belegung der aktuellen KW dar. Für
 * angemeldete Benutzer (mit der entsprechenden Kompetenz) bietet er auch noch
 * Möglichkeiten des editierens eines Termins
 */
var MainViewCalendar = function() {

    this.currentDate = new Date();
    this.mode = MainViewCalendar.WEEKLY;
    this.showMyTermine = false;

    var self = this;
    WorkSpaceFrame.call(this, "gui/main_view/calendar.html", function() {

	OpenHoursModelHelper.load(function(openHoursModel) {
	    self.openHoursModel = openHoursModel;
	    self.setupUI();
	    self.update();
	    new TouchGesturesObserver("workspace-frame-calendar-body", self);
	});
    });
}
MainViewCalendar.prototype = Object.create(WorkSpaceFrame.prototype)

/**
 * Konstanten
 */
MainViewCalendar.WEEKLY = 0;
MainViewCalendar.MONTHLY = 1;

/**
 * 
 */
MainViewCalendar.prototype.getTitle = function() {

    var result = "Eddy CrashPaddy - ";
    switch (this.mode) {
    case MainViewCalendar.WEEKLY:
	result += DateTimeUtils.formatDate(this.currentDate, "KW {w}-{yyyy}")
	break;

    case MainViewCalendar.MONTHLY:
	result += DateTimeUtils.formatDate(this.currentDate, "{MM} {yyyy}")
	break;

    default:
	break;
    }
    return result;
}

/**
 * 
 */
MainViewCalendar.prototype.setupUI = function() {

    var self = this;

    var self = this;
    this.actionGoBack = this.createToolButton("gui/images/go-back.svg", "Zurück", function() {
	if (self.mode == MainViewCalendar.WEEKLY) {
	    self.oneWeekBack();
	} else {
	    self.oneMonthBack();
	}
    });

    this.actionGoFore = this.createToolButton("gui/images/go-fore.svg", "Vorwärts", function() {
	if (self.mode == MainViewCalendar.WEEKLY) {
	    self.oneWeekFore();
	} else {
	    self.oneMonthFore();
	}

    });

    this.actionGoToday = this.createToolButton("gui/images/view-calendar-today.svg", "Heute", function() {
	self.currentDate = new Date();
	self.update();

    });

    this.actionViewMonth = this.createToolButton("gui/images/view-calendar-month.svg", "Monats-Übersicht", function() {
	self.mode = MainViewCalendar.MONTHLY;
	self.actionViewMonth.hide();
	self.actionViewWeek.show();
	self.update();
    });

    this.actionViewWeek = this.createToolButton("gui/images/view-calendar-week.svg", "Wochen-Übersicht", function() {
	self.mode = MainViewCalendar.WEEKLY;
	self.actionViewMonth.show();
	self.actionViewWeek.hide();
	self.update();
    });
    this.actionViewWeek.hide();

    if (SessionManager.hasSession()) {

	this.actionViewMine = this.createToolToggleButton("gui/images/view-my-calendar.svg", "Meine Termine", function(val) {
	    self.showMyTermine = val;
	    self.update();
	});

	this.actionPrint = this.createToolButton("gui/images/print.svg", "Plan drucken", function() {

	    var from = self.findStartDate();
	    var until = self.findLastDate();
	    var url = "getDocument/planning.pdf?from=" + from.getTime() + "&until=" + until.getTime();
	    window.open(url);
	});
    }
}

/**
 * 
 */
MainViewCalendar.prototype.oneWeekBack = function() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.update();

}

/**
 * 
 */
MainViewCalendar.prototype.oneWeekFore = function() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.update();

}

/**
 * 
 */
MainViewCalendar.prototype.oneMonthBack = function() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.update();

}

/**
 * 
 */
MainViewCalendar.prototype.oneMonthFore = function() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.update();

}

/**
 * 
 */
MainViewCalendar.prototype.swipeToLeft = function() {

    this.actionGoFore.click();
}
/**
 * 
 */
MainViewCalendar.prototype.swipeUp = function() {

    this.actionGoFore.click();
}

/**
 * 
 */
MainViewCalendar.prototype.swipeToRight = function() {

    this.actionGoBack.click();
}

/**
 * 
 */
MainViewCalendar.prototype.swipeDown = function() {

    this.actionGoBack.click();
}

/**
 * 
 */
MainViewCalendar.prototype.update = function() {

    // update title
    WorkSpace.setTitle(this.getTitle());

    // startDate/endDate finden
    var startDate = this.findStartDate();
    var endDate = this.findLastDate();

    var self = this;
    this.loadModel(startDate, endDate, function() {

	self.fill(startDate, endDate);
	self.model.addChangeListener("//calendar-model", function() {
	    self.fill(startDate, endDate);
	});
    });

}

/**
 * 
 */
MainViewCalendar.prototype.fill = function(startDate, endDate) {

    UIUtils.clearChilds("workspace-frame-calendar-body");
    switch (this.mode) {
    case MainViewCalendar.WEEKLY:
	this.fillWeek(startDate, endDate);
	break;

    case MainViewCalendar.MONTHLY:
	this.fillMonth(startDate, endDate);

    default:
	break;
    }
}

/**
 * Finde vom aktuellen Datum aus den ersten Montag in der Vergangenheit
 */
MainViewCalendar.prototype.findStartDate = function() {

    var result = new Date(this.currentDate);
    if (this.mode == MainViewCalendar.MONTHLY) {
	result.setDate(1);
    }

    result.setDate(result.getDate() - DateTimeUtils.normalizeDayOfWeek(result));
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    return result;
}

/**
 * Finde vom aktuellen Datum aus den ersten Sonntag in der Zukunft
 */
MainViewCalendar.prototype.findLastDate = function() {

    var result = null
    switch (this.mode) {
    case MainViewCalendar.WEEKLY:
	result = new Date(this.findStartDate());
	result.setDate(result.getDate() + 6);
	break;

    case MainViewCalendar.MONTHLY:
	result = new Date(this.currentDate);
	result.setDate(1);
	result.setMonth(result.getMonth() + 1);
	result.setDate(result.getDate() - 1);
	// auf den nächsten Samstag hoch rechnen
	while (result.getDay() != 0) {
	    result.setDate(result.getDate() + 1);
	}
	break;
    }
    return result;
}

/**
 * 
 */
MainViewCalendar.prototype.getState = function(date) {

    var result = MainViewCalendar.STATE_CLOSED;
    if (this.openHoursModel.mustBeOpen(date)) {

	if (this.isClosedByComment(date)) {
	    result = MainViewCalendar.STATE_CLOSED_BY_COMMENT;
	} else {
	    if (this.hasGaps(date)) {
		result = MainViewCalendar.STATE_OPEN_WITH_GAPS;
	    } else {
		result = MainViewCalendar.STATE_OPEN;
	    }
	}
    }
    return result;
}
MainViewCalendar.STATE_OPEN = 0;
MainViewCalendar.STATE_OPEN_WITH_GAPS = 1;
MainViewCalendar.STATE_CLOSED = 2;
MainViewCalendar.STATE_CLOSED_BY_COMMENT = 3;

/**
 * Prüft, ob für das angegebene Datum GAP's vorliegen. Also Zeitbereiche, welche
 * durch die Theki-Planung noch nicht abgedeckt sind
 * 
 * @param date
 *                dazu zu prüfende Datum
 * @return true, wenn Gaps vorliegen, ansonsten false
 */
MainViewCalendar.prototype.hasGaps = function(date) {

    var result = this.openHoursModel.mustBeOpen(date);
    if (result) {

	var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
	var from = this.findFrom(baseXPath);
	var until = this.findUntil(baseXPath);

	result = !from || from > this.openHoursModel.getFrom(date) || !until || until < this.openHoursModel.getUntil(date);
    }
    return result;
}

/**
 * Prüft, ob für das angegebene Datum GAP's vorliegen. Also Zeitbereiche, welche
 * durch die Theki-Planung noch nicht abgedeckt sind
 * 
 * @param date
 *                dazu zu prüfende Datum
 * @return true, wenn Gaps vorliegen, ansonsten false
 */
MainViewCalendar.prototype.isClosedByComment = function(date) {

    var xpath = "//calendar-model/comments/comment[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and closed='true']";
    return this.model.evaluateXPath(xpath).length != 0;
}

/**
 * 
 */
MainViewCalendar.prototype.hasPurifier = function(date) {

    var strDate = DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}");
    var xpath = "//calendar-model/purifier-entries/purifier-entry[date='" + strDate + "']";
    return this.model.evaluateXPath(xpath).length;
}

/**
 * 
 */
MainViewCalendar.prototype.findFrom = function(xpath) {

    var result = null;

    var allFrom = this.model.evaluateXPath(xpath + "/begin");
    for (var i = 0; i < allFrom.length; i++) {
	var curr = DateTimeUtils.parseTime(allFrom[i].textContent, "hh:mm");
	if (result == null || curr < result) {
	    result = curr;
	}
    }
    return result;
}

/**
 * 
 */
MainViewCalendar.prototype.findUntil = function(xpath) {

    var result = null;

    var allFrom = this.model.evaluateXPath(xpath + "/end");
    for (var i = 0; i < allFrom.length; i++) {
	var curr = DateTimeUtils.parseTime(allFrom[i].textContent, "hh:mm");
	if (result == null || curr > result) {
	    result = curr;
	}
    }
    return result;
}

/**
 * 
 */
MainViewCalendar.prototype.isMyWorkingDay = function(date) {

    var result = false;

    var id = SessionManager.getCurrentMemberId();
    if (id) {

	var strDate = DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}");

	var xpath = "//calendar-model/keeper-entries/keeper-entry[keeper = '" + id + "' and date = '" + strDate + "']";
	result = this.model.evaluateXPath(xpath).length != 0;
    }
    return result;
}

/**
 * Lade das Wochen-Model
 */
MainViewCalendar.prototype.loadModel = function(startDate, endDate, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "calendar-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("GET_CALENDER_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("GET_CALENDER_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, mess);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("GET_CALENDER_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("GET_CALENDER_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, mess);
    }

    var req = XmlUtils.createDocument("get-calendar-req");
    XmlUtils.setNode(req, "from", DateTimeUtils.formatDate(startDate, "{dd}.{mm}.{yyyy}"));
    XmlUtils.setNode(req, "until", DateTimeUtils.formatDate(endDate, "{dd}.{mm}.{yyyy}"));
    caller.invokeService(req);
}

/**
 * 
 */
MainViewCalendar.prototype.fillWeek = function(startDate, endDate) {

    var calBody = UIUtils.getElement("workspace-frame-calendar-body");

    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
	calBody.appendChild(this.makeWeekDay(new Date(currentDate)));
	currentDate.setDate(currentDate.getDate() + 1);
    }
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekDay = function(date) {

    var day = document.createElement("div");
    day.className = "calendar-weekday flex-1 flex-row";

    var state = this.getState(date);
    day.appendChild(this.makeWeekStatus(state));

    var content = this.makeWeekContent(date, state);
    day.appendChild(content);

    var self = this;
    if (SessionManager.hasSession()) {

	UIUtils.addClass(content, "clickable");
	content.addEventListener("click", function() {
	    new MainViewDetails(self.model, date);
	});

	if (self.hasPurifier(date)) {
	    content.className += " calendar-has-purifier"
	}

	if (self.showMyTermine && !self.isMyWorkingDay(date)) {
	    content.className += " disabled";
	}
    }
    return day;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekStatus = function(state) {

    var status = document.createElement("div");
    status.className = "calendar-weekday-status flex-0 flex-col";

    switch (state) {
    case MainViewCalendar.STATE_OPEN:
	status.className += " calendar-weekday-open";
	break;

    case MainViewCalendar.STATE_OPEN_WITH_GAPS:
	status.className += " calendar-weekday-planning-gap";
	break;

    case MainViewCalendar.STATE_CLOSED:
	status.className += " calendar-weekday-closed";
	break;

    case MainViewCalendar.STATE_CLOSED_BY_COMMENT:
	status.className += " calendar-weekday-closed";
	break;
    }
    return status;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekContent = function(date, state) {

    var content = document.createElement("div");
    content.className = "calendar-weekday-content flex-1 flex-col";

    var row1 = row = document.createElement("div");    
    row1.className = "calendar-weekday-row flex-1 flex-row";
    row1.appendChild(this.makeWeekTitleSection(date));
    content.appendChild(row1);

    var row2 = document.createElement("div");
    row2.className = "flex-1 calendar-weekday-comment";
    content.appendChild(row2);

    switch (state) {
    case MainViewCalendar.STATE_OPEN:
    case MainViewCalendar.STATE_OPEN_WITH_GAPS:
	var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
	row1.appendChild(this.makeWeekTimeSection(baseXPath));
	if (SessionManager.hasSession()) {
	    row2.textContent = this.makeWeekNameSection(baseXPath);
	}
	break;

    case MainViewCalendar.STATE_CLOSED:
	row2.textContent = this.makeWeekHolidaySection(date);
	break;

    case MainViewCalendar.STATE_CLOSED_BY_COMMENT:
	row2.textContent = this.makeWeekCommentSection(date);
	break;
    }
    return content;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekContentRow = function() {

    var row = document.createElement("div");
    row.className = "calendar-weekday-row flex-1 flex-row";
    return row;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekTitleSection = function(date) {

    var title = document.createElement("div");
    title.className = "calendar-weekday-date flex-1";
    if (DateTimeUtils.isToday(date)) {
	title.className += " calendar-today";
    }
    title.textContent = DateTimeUtils.formatDate(date, "{D} - {dd}.{mm}.{yyyy}");
    return title;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekTimeSection = function(xpath) {

    var time = document.createElement("div");
    time.className = "calendar-weekday-time flex-0";

    var from = this.findFrom(xpath);
    var until = this.findUntil(xpath);
    if (from && until) {

	var begin = DateTimeUtils.formatTime(from, "{hh}:{mm}");
	var end = DateTimeUtils.formatTime(until, "{hh}:{mm}");
	time.textContent = begin + " - " + end;
    }

    return time;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekNameSection = function(xpath) {

    var content = "";

    if (SessionManager.hasSession()) {

	var memberIds = this.model.evaluateXPath(xpath + "/keeper");
	for (var i = 0; i < memberIds.length; i++) {
	    if (content != "") {
		content += ", ";
	    }

	    var memberId = memberIds[i].textContent;
	    var memberXPath = "//calendar-model/members/member[id='" + memberId + "']";
	    content += this.model.getValue(memberXPath + "/vname").charAt(0).toUpperCase();
	    content += ".";
	    content += this.model.getValue(memberXPath + "/zname");
	}
    }
    return content;
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekHolidaySection = function(date) {

    return "Ruhetag";
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekCommentSection = function(date) {

    var xpath = "//calendar-model/comments/comment[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and closed='true']/text";
    return this.model.getValue(xpath);
}
/**
 * 
 */
MainViewCalendar.prototype.fillMonth = function(startDate, endDate) {

    var currentDate = new Date(startDate);
    var row = null;
    var calBody = UIUtils.getElement("workspace-frame-calendar-body");
    calBody.appendChild(this.makeMonthRuler());
    while (currentDate <= endDate) {

	if (currentDate.getDay() == 1 || row == null) {
	    row = document.createElement("div");
	    row.className = "calendar-monthly-row flex-1 flex-row";
	    calBody.appendChild(row);
	}

	for (var i = 0; i < 7; i++) {

	    row.appendChild(this.makeMonthDay(new Date(currentDate)));
	    currentDate.setDate(currentDate.getDate() + 1);
	}
    }
}

/**
 * 
 */
MainViewCalendar.prototype.makeMonthRuler = function() {

    var row = document.createElement("div");
    row.className = "calendar-monthly-header flex-0 flex-row";

    var days = [ "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So" ];
    for (var i = 0; i < days.length; i++) {
	var cell = document.createElement("div");
	cell.className = "calendar-monthly-header-cell flex-1";
	cell.textContent = days[i];
	row.appendChild(cell);
    }
    return row;
}

/**
 * 
 */
MainViewCalendar.prototype.makeMonthDay = function(date) {

    var cell = document.createElement("div");
    cell.className = "calendar-monthly-day flex-1 flex-col";

    cell.appendChild(this.makeMonthDayHeader(date));
    cell.appendChild(this.makeMonthDayContent(date));

    var self = this;
    if (SessionManager.hasSession()) {

	UIUtils.addClass(cell, "clickable");
	cell.addEventListener("click", function() {
	    new MainViewDetails(self.model, date);
	});

	if (self.hasPurifier(date)) {
	    cell.className += " calendar-has-purifier";
	}

	if (self.showMyTermine && !self.isMyWorkingDay(date)) {
	    cell.className += " disabled";
	}
    }
    return cell;
}

/**
 * 
 */
MainViewCalendar.prototype.makeMonthDayHeader = function(date) {

    var header = document.createElement("div");
    header.className = "calenday-monthly-day-header flex-0";
    if (DateTimeUtils.isToday(date)) {
	header.className += " calendar-today";
    }

    switch (this.getState(date)) {
    case MainViewCalendar.STATE_OPEN:
	header.className += " calendar-monthly-day-open";
	break;

    case MainViewCalendar.STATE_OPEN_WITH_GAPS:
	header.className += " calendar-monthly-day-planning-gap";
	break;

    case MainViewCalendar.STATE_CLOSED:
	header.className += " calendar-monthly-day-closed";

    case MainViewCalendar.STATE_CLOSED_BY_COMMENT:
	header.className += " calendar-monthly-day-closed";
	break;
    }

    header.textContent = DateTimeUtils.formatDate(date, "{d}");
    return header;
}

/**
 * 
 */
MainViewCalendar.prototype.makeMonthDayContent = function(date) {

    var content = document.createElement("div");
    content.className = "calendar-monthly-day-time flex-1";

    var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
    var entries = this.model.evaluateXPath(baseXPath);
    if (entries.length != 0) {

	var begin = DateTimeUtils.formatTime(this.findFrom(baseXPath), "{hh}:{mm}");
	var end = DateTimeUtils.formatTime(this.findUntil(baseXPath), "{hh}:{mm}");
	content.textContent = begin + " " + end;
    } else {
	content.innerHTML = "&nbsp;";
    }
    return content;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MainViewDetails = function(model, day) {

    this.model = new ModelWorkingCopy(model, "//calendar-model");
    this.day = day;

    var self = this;
    WorkSpaceFrame.call(this, "gui/main_view/details.html", function() {

	self.enableSaveButton(false);
	self.actionAddKeeper = self.createAddKeeperAction();
	self.actionAddPurifier = self.createAddPurifierAction();
	self.actionRemovePerson = self.createRemovePersonAction();

	self.loadMemberModel(function() {
	    OpenHoursModelHelper.load(function(openingHours) {
		self.openingHoursModel = openingHours;
		self.update();
		var observingXPath = "//calendar-model";
		self.model.addChangeListener(observingXPath, function() {
		    self.enableSaveButton(true);
		});
	    })
	});
    });
}
MainViewDetails.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * Lade das Model aller TeamMember
 */
MainViewDetails.prototype.loadMemberModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "members-model":
	    self.memberModel = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-all-members-req");
    caller.invokeService(req);
}

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
MainViewDetails.prototype.createAddKeeperAction = function() {

    var self = this;
    var btn = this.createToolButton("gui/images/person-add.svg", "Theki hinzu fügen", function() {

	new MemberSelector(function(memberId) {
	    var doc = XmlUtils.parse(MainViewDetails.EMPTY_KEEPER);
	    XmlUtils.setNode(doc, "keeper", memberId);
	    XmlUtils.setNode(doc, "date", DateTimeUtils.formatDate(self.day, "{dd}.{mm}.{yyyy}"));

	    var dayXPath = "//opening-hours-model/entry[day-of-week='" + self.day.getDay() + "']";
	    XmlUtils.setNode(doc, "begin", self.openingHoursModel.getValue(dayXPath + "/from"));
	    XmlUtils.setNode(doc, "end", self.openingHoursModel.getValue(dayXPath + "/until"));

	    self.currEntryXPath = self.model.addElement("//calendar-model/keeper-entries", doc.documentElement);
	    self.currEntry = self.fillOneKeeper(self.currEntryXPath);
	    self.currEntry.container.querySelector("input").focus();
	});

    });
    return btn;
}
MainViewDetails.EMPTY_KEEPER = "<keeper-entry><id/><action>CREATE</action><date/><begin/><end/><keeper/></keeper-entry>";

/**
 * 
 */
MainViewDetails.prototype.createAddPurifierAction = function() {

    var self = this;
    var btn = this.createToolButton("gui/images/purifier-add.svg", "Heinzelmännchen hinzu fügen", function() {

	new MemberSelector(function(memberId) {
	    var doc = XmlUtils.parse(MainViewDetails.EMPTY_PURIFIER);
	    XmlUtils.setNode(doc, "purifier", memberId);
	    XmlUtils.setNode(doc, "date", DateTimeUtils.formatDate(self.day, "{dd}.{mm}.{yyyy}"));
	    self.currEntryXPath = self.model.addElement("//calendar-model/purifier-entries", doc.documentElement);
	    self.currEntry = self.fillOnePurifier(self.currEntryXPath);
	});
    });
    return btn;
}
MainViewDetails.EMPTY_PURIFIER = "<purifier-entry><id/><action>CREATE</action><date/><purifier/></purifier-entry>";

/**
 * 
 */
MainViewDetails.prototype.createRemovePersonAction = function() {

    var self = this;
    var btn = this.createToolButton("gui/images/person-remove.svg", "Löschen", function() {

	var title = MessageCatalog.getMessage("REMOVE_KEEPER_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_KEEPER_QUERY");
	new MessageBox(MessageBox.QUERY, title, messg, function() {
	    var action = self.model.getValue(self.currEntryXPath + "/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currEntryXPath);
	    } else {
		self.model.setValue(self.currEntryXPath + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currEntry.container);
	    self.currEntry = self.currEntryXPath = null;
	    btn.hide();
	});
    });
    btn.hide();
    return btn;
}

/**
 * 
 */
MainViewDetails.prototype.createAddCommentAction = function() {

    var self = this;
    var btn = this.createToolButton("gui/images/note-add.svg", "Einen Kommentar hinzu fügen", function() {

    });
    return btn;
}

/**
 * 
 */
MainViewDetails.prototype.createRemoveCommentAction = function() {

    var self = this;
    var btn = this.createToolButton("gui/images/note-remove.svg", "Löschen", function() {

	var title = MessageCatalog.getMessage("REMOVE_COMMENT_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_COMMENT_QUERY");
	new MessageBox(MessageBox.QUERY, title, messg, function() {
	    var action = self.model.getValue(self.currCommentXPath + "/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currCommentXPath);
	    } else {
		self.model.setValue(self.currCommentXPath + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currComment.container);
	    self.currComment = self.currCommentXPath = null;
	    btn.hide();
	});
    });
    btn.hide();
    return btn;
}

/**
 * 
 */
MainViewDetails.prototype.update = function() {

    UIUtils.clearChilds("details-members-body");
    this.fillAllKeepers();
    this.fillAllPurifiers();

    if (SessionManager.isAdmin()) {
	UIUtils.removeClass("details-comment-header", "hidden");
	UIUtils.removeClass("details-comment-body", "hidden");

	var toXML = function(attribute) {
	    return attribute ? "true" : "false";
	}
	var fromXML = function(text) {
	    return text == "true";
	}
	var xpath = this.getCommentXPath();
	this.model.createAttributeBinding("details-is-closed", "checked", xpath + "/closed", null, toXML, fromXML);
	this.model.createValueBinding("details-comment", xpath + "/text");

	var self = this;
	this.model.addChangeListener(xpath, function() {
	    if (self.model.getValue(xpath + "/action") == "NONE") {
		self.model.setValue(xpath + "/action", "MODIFY");
	    }
	});
    }
}

/**
 * liefert den XPath zur Comment-Node des Tages. sollte eine solche nicht
 * existieren, so wird sie angelegt.
 */
MainViewDetails.prototype.getCommentXPath = function() {

    var result = null;
    var fmtDate = DateTimeUtils.formatDate(this.day, "{dd}.{mm}.{yyyy}");
    var xpath = "//calendar-model/comments/comment[date='" + fmtDate + "']";
    if (this.model.evaluateXPath(xpath) != 0) {
	result = xpath;
    } else {

	var doc = new Model(XmlUtils.parse(MainViewDetails.EMPTY_COMMENT_NODE));
	doc.setValue("//comment/date", fmtDate);
	result = this.model.addElement("//calendar-model/comments", doc.getDocument().documentElement);
    }
    return result;
}
MainViewDetails.EMPTY_COMMENT_NODE = "<comment><id/><action>CREATE</action><closed>false</closed><date/><text/></comment>";

/**
 * 
 */
MainViewDetails.prototype.fillAllKeepers = function() {

    var xpath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(this.day, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
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
    UIUtils.getElement("details-members-body").appendChild(radio);

    var entry = new MainViewDetailsKeeperEntry(this.model, entryXPath, this.memberModel);
    var entryUI = entry.container;
    UIUtils.getElement("details-members-body").appendChild(entryUI);

    var self = this;
    entryUI.addEventListener("click", function() {

	// click the radio to enable the css-rule for selected entries
	radio.click();

	var memberId = self.model.getValue(entryXPath + "/keeper");
	if (SessionManager.isAdmin() || SessionManager.isMee(memberId)) {
	    self.currEntry = entry;
	    self.currEntryXPath = entryXPath;
	    self.actionRemovePerson.show();
	} else {
	    self.currEntry = self.currEntryXPath = null;
	    self.actionRemovePerson.hide();
	}

	self.model.addChangeListener(entryXPath, function() {

	    var action = self.model.getValue(entryXPath + "/action");
	    if (action == "NONE") {
		self.model.setValue(entryXPath + "/action", "MODIFY");
	    }
	});
    });
    return entry;
}

/**
 * 
 */
MainViewDetails.prototype.fillAllPurifiers = function() {

    var xpath = "//calendar-model/purifier-entries/purifier-entry[date='" + DateTimeUtils.formatDate(this.day, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
    var allEntries = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allEntries.length; i++) {

	var entryXPath = XmlUtils.getXPathTo(allEntries[i]);
	this.fillOnePurifier(entryXPath);
    }
}

/**
 * 
 */
MainViewDetails.prototype.fillOnePurifier = function(entryXPath) {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.className = "hidden";
    radio.name = "mainview_details_entry";
    UIUtils.getElement("details-members-body").appendChild(radio);

    var entry = new MainViewDetailsPurifierEntry(this.model, entryXPath, this.memberModel);
    var entryUI = entry.container;
    UIUtils.getElement("details-members-body").appendChild(entryUI);

    var self = this;
    entryUI.addEventListener("click", function() {

	// click the radio to enable the css-rule for selected entries
	radio.click();

	var memberId = self.model.getValue(entryXPath + "/purifier");
	if (SessionManager.isAdmin() || SessionManager.isMee(memberId)) {
	    self.currEntry = entry;
	    self.currEntryXPath = entryXPath;
	    self.actionRemovePerson.show();
	} else {
	    self.currEntry = self.currEntryXPath = null;
	    self.actionRemovePerson.hide();
	}
    });
    return entry;
}

/**
 * 
 */
MainViewDetails.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-calender-model-ok-rsp":
	    self.commitModel();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_CALENDER_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_CALENDER_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;

	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_CALENDER_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_CALENDER_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());

}

/**
 * entferne alle als gelöscht markierten elemente (keeper/purifier/Kommentare)
 * und setze bei allen mit CREATE oder MODIFY markierten Elementen die Aktion
 * zurück auf NONE.
 * 
 * Im ANschluss wird die WorkingCopy committet
 */
MainViewDetails.prototype.commitModel = function() {

    this.model.forEach("//calendar-model/keeper-entries/keeper-entry[action = 'REMOVE']", function(entry) {
	entry.parentNode.removeChild(entry);
    });
    this.model.forEach("//calendar-model/keeper-entries/keeper-entry[action != 'NONE']", function(entry) {
	entry.getElementsByTagName("action")[0].textContent = "NONE";
    });
    this.model.forEach("//calendar-model/purifier-entries/purifier-entry[action = 'REMOVE']", function(entry) {
	entry.parentNode.removeChild(entry);
    });
    this.model.forEach("//calendar-model/purifier-entries/purifier-entry[action != 'NONE']", function(entry) {
	entry.getElementsByTagName("action")[0].textContent = "NONE";
    });
    this.model.forEach("//calendar-model/comments/comment[action = 'REMOVE']", function(entry) {
	entry.parentNode.removeChild(entry);
    });
    this.model.forEach("//calendar-model/comments/comment[action != 'NONE']", function(entry) {
	entry.getElementsByTagName("action")[0].textContent = "NONE";
    });
    this.model.commit();
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MainViewDetailsKeeperEntry = function(model, entryXPath, memberModel) {

    this.model = model;
    this.entryXPath = entryXPath;
    this.memberModel = memberModel;

    this.container = document.createElement("div");
    this.container.className = "details-entry-cnr flex-row";

    var memberId = this.model.getValue(this.entryXPath + "/keeper");
    this.container.appendChild(this.makeAvatar(memberId));

    this.nameSection = this.makeNameSection(memberId);
    this.container.appendChild(this.nameSection);

    this.container.appendChild(this.makeTimeSection(memberId));
}

/**
 * 
 */
MainViewDetailsKeeperEntry.prototype.makeAvatar = function(memberId) {

    var img = document.createElement("img");
    img.className = "avatar flex-0";
    img.src = "getDocument/memberImage/?id=" + memberId;
    return img;
}

/**
 * 
 */
MainViewDetailsKeeperEntry.prototype.makeNameSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-namesection flex-1";

    var xpath = "//members-model/members/member[id='" + memberId + "']";
    var vname = this.memberModel.getValue(xpath + "/vname");
    var zname = this.memberModel.getValue(xpath + "/zname");
    result.textContent = vname + " " + zname;
    return result;
}

/**
 * 
 */
MainViewDetailsKeeperEntry.prototype.makeTimeSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-timesection flex-0";

    if (SessionManager.isAdmin() || SessionManager.isMee(memberId)) {

	// zeiten
	var from = document.createElement("input");
	from.className = "mandatory";
	from.setAttribute("type", "time");
	from.dataset.type = "time";
	from.title = from.placeholder = "von";
	this.model.createValueBinding(from, this.entryXPath + "/begin");
	result.appendChild(from);

	var fill = document.createElement("span");
	fill.textContent = " - ";
	result.appendChild(fill);

	var end = document.createElement("input");
	end.className = "mandatory";
	end.setAttribute("type", "time");
	end.dataset.type = "time";
	end.title = end.placeholder = "bis";
	this.model.createValueBinding(end, this.entryXPath + "/end");
	result.appendChild(end);
    } else {
	result.textContent = this.model.getValue(this.entryXPath + "/begin");
	result.textContent += " - ";
	result.textContent += this.model.getValue(this.entryXPath + "/end");
    }
    return result;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MainViewDetailsPurifierEntry = function(model, entryXPath, memberModel) {

    this.model = model;
    this.entryXPath = entryXPath;
    this.memberModel = memberModel;

    this.container = document.createElement("div");
    this.container.className = "details-entry-cnr flex-row";

    var memberId = this.model.getValue(this.entryXPath + "/purifier");
    this.container.appendChild(this.makeAvatar(memberId));

    this.nameSection = this.makeNameSection(memberId);
    this.container.appendChild(this.nameSection);
}

/**
 * 
 */
MainViewDetailsPurifierEntry.prototype.makeAvatar = function(memberId) {

    var img = document.createElement("img");
    img.className = "avatar flex-0";
    img.src = "getDocument/memberImage/?id=" + memberId;
    img.src = "gui/images/heinzelmaennchen.jpg";
    return img;
}

/**
 * 
 */
MainViewDetailsPurifierEntry.prototype.makeNameSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-namesection flex-1";

    var xpath = "//members-model/members/member[id='" + memberId + "']";
    var vname = this.memberModel.getValue(xpath + "/vname");
    var zname = this.memberModel.getValue(xpath + "/zname");
    result.textContent = vname + " " + zname;
    return result;
}
