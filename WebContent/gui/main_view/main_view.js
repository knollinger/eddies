/**
 * Der MainViewCalendar stellt initial die belegung der aktuellen KW dar. Für
 * angemeldete Benutzer (mit der entsprechenden Kompetenz) bietet er auch noch
 * Möglichkeiten des editierens eines Termins
 */
var MainViewCalendar = function() {

    this.currentDate = new Date();
    this.mode = MainViewCalendar.WEEKLY;

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

    this.actionGoToday = this.createToolButton("gui/images/calendar-today.svg", "Heute", function() {
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

	self.model.addChangeListener("//calendar-model", function() {
	    self.fill(startDate, endDate);
	});
	self.fill(startDate, endDate);
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

    var result;
    var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
    var entries = this.model.evaluateXPath(baseXPath);
    if (entries.length == 0) {
	if (this.openHoursModel.isOpen(date)) {
	    result = MainViewCalendar.STATE_OPEN_WITH_GAPS;
	} else {
	    result = MainViewCalendar.STATE_CLOSED;
	}
    } else {
	// TODO: check for GAPS
	result = MainViewCalendar.STATE_OPEN;
    }
    return result;
}
MainViewCalendar.STATE_OPEN = 0;
MainViewCalendar.STATE_OPEN_WITH_GAPS = 1;
MainViewCalendar.STATE_CLOSED = 2;

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
	    new MessageBox(MessageBox.ERROR, title, message);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("GET_CALENDER_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("GET_CALENDER_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, message);
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

    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
	this.makeWeekDay(new Date(currentDate));
	currentDate.setDate(currentDate.getDate() + 1);
    }
}

/**
 * 
 */
MainViewCalendar.prototype.makeWeekDay = function(date) {

    var day = document.createElement("div");
    day.className = "calendar-weekday";

    var content = document.createElement("div");
    content.className = "calendar-weekday-content";
    day.appendChild(content);

    var row = document.createElement("div");
    row.className = "calendar-weekday-row";
    content.appendChild(row);

    var title = document.createElement("div");
    title.className = "calendar-weekday-date";
    if (DateTimeUtils.isToday(date)) {
	title.className += " calendar-today";
    }
    title.textContent = DateTimeUtils.formatDate(date, "{D} - {dd}.{mm}.{yyyy}");
    row.appendChild(title);

    var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
    switch (this.getState(date)) {
    case MainViewCalendar.STATE_OPEN:
	content.className += " calendar-weekday-open";
	row.appendChild(this.makeOpeningTimeIndicator(baseXPath));
	break;

    case MainViewCalendar.STATE_OPEN_WITH_GAPS:
	content.className += " calendar-weekday-planning-gap";
	break;

    case MainViewCalendar.STATE_CLOSED:
	content.className += " calendar-weekday-closed";
	break;

    }

    row = document.createElement("div");
    row.className = "calendar-weekday-row";
    content.appendChild(row);

    var self = this;
    if (SessionManager.hasSession()) {

	UIUtils.addClass(content, "clickable");
	content.addEventListener("click", function() {
	    new MainViewDetails(self.model, date);
	});

	if (self.hasPurifier(date)) {
	    content.className += " calendar-has-purifier"
	}

	row.appendChild(this.makeNameSection(baseXPath));
    }
    UIUtils.getElement("workspace-frame-calendar-body").appendChild(day);
}

/**
 * 
 */
MainViewCalendar.prototype.makeNameSection = function(xpath) {

    var result = document.createElement("div");
    result.className = "calendar-weekday-keepers";
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
	result.textContent = content;
    }
    return result;
}

/**
 * 
 */
MainViewCalendar.prototype.fillMonth = function(startDate, endDate) {

    var currentDate = new Date(startDate);
    var row = null;
    var calBody = UIUtils.getElement("workspace-frame-calendar-body");
    calBody.appendChild(this.makeMonthHeader());
    while (currentDate <= endDate) {

	if (currentDate.getDay() == 1 || row == null) {
	    row = document.createElement("div");
	    row.className = "calendar-monthly-row";
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
MainViewCalendar.prototype.makeMonthHeader = function() {

    var row = document.createElement("div");
    row.className = "calendar-monthly-header";

    var days = [ "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So" ];
    for (var i = 0; i < days.length; i++) {
	var cell = document.createElement("div");
	cell.className = "calendar-monthly-header-cell";
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
    cell.className = "calendar-monthly-day";

    var header = document.createElement("div");
    header.className = "calenday-monthly-day-header";
    if (DateTimeUtils.isToday(date)) {
	header.className += " calendar-today";
    }
    header.textContent = DateTimeUtils.formatDate(date, "{d}");
    cell.appendChild(header);

    var content = document.createElement("div");
    content.className = "calendar-monthly-day-time";
    cell.appendChild(content);

    switch (this.getState(date)) {
    case MainViewCalendar.STATE_OPEN:
	header.className += " calendar-monthly-day-open";
	break;
	
    case MainViewCalendar.STATE_OPEN_WITH_GAPS:
	header.className += " calendar-monthly-day-planning-gap";
	break;
	
    case MainViewCalendar.STATE_CLOSED:
	header.className += " calendar-monthly-day-closed";
    }

    var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
    var entries = this.model.evaluateXPath(baseXPath);
    if (entries.length != 0) {

	var begin = DateTimeUtils.formatTime(this.findFrom(baseXPath), "{hh}:{mm}");
	var end = DateTimeUtils.formatTime(this.findUntil(baseXPath), "{hh}:{mm}");
	content.textContent = begin + " " + end;
    }

    var self = this;
    if (SessionManager.hasSession()) {

	UIUtils.addClass(cell, "clickable");
	cell.addEventListener("click", function() {
	    new MainViewDetails(self.model, date);
	});

	if (self.hasPurifier(date)) {
	    this.className += " calendar-has-purifier";
	}

    }
    return cell;
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
MainViewCalendar.prototype.makeOpeningTimeIndicator = function(xpath) {

    var begin = DateTimeUtils.formatTime(this.findFrom(xpath), "{hh}:{mm}");
    var end = DateTimeUtils.formatTime(this.findUntil(xpath), "{hh}:{mm}");
    var time = document.createElement("div");
    time.className = "calendar-weekday-time";
    time.textContent = begin + " - " + end;

    return time;
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
	self.actionRemove = self.createRemoveAction();

	self.loadMemberModel(function() {
	    OpenHoursModelHelper.load(function(openingHours) {
		self.openingHoursModel = openingHours;
		var observingXPath = "//calendar-model";
		self.model.addChangeListener(observingXPath, function() {
		    self.enableSaveButton(true);
		});
		self.update();
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
MainViewDetails.prototype.createRemoveAction = function() {

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
MainViewDetails.prototype.update = function() {

    this.fillAllKeepers();
    this.fillAllPurifiers();
}

/**
 * 
 */
MainViewDetails.prototype.fillAllKeepers = function() {

    UIUtils.clearChilds("mainview-details-keepers");
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
    UIUtils.getElement("mainview-details-keepers").appendChild(radio);

    var entry = new MainViewDetailsKeeperEntry(this.model, entryXPath, this.memberModel);
    var entryUI = entry.container;
    UIUtils.getElement("mainview-details-keepers").appendChild(entryUI);

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

    UIUtils.clearChilds("mainview-details-purifiers");
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
    UIUtils.getElement("mainview-details-purifiers").appendChild(radio);

    var entry = new MainViewDetailsPurifierEntry(this.model, entryXPath, this.memberModel);
    var entryUI = entry.container;
    UIUtils.getElement("mainview-details-purifiers").appendChild(entryUI);

    var self = this;
    entryUI.addEventListener("click", function() {

	// click the radio to enable the css-rule for selected entries
	radio.click();

	var memberId = self.model.getValue(entryXPath + "/purifier");
	if (SessionManager.isAdmin() || SessionManager.isMee(memberId)) {
	    self.currEntry = entry;
	    self.currEntryXPath = entryXPath;
	    self.actionRemove.show();
	} else {
	    self.currEntry = self.currEntryXPath = null;
	    self.actionRemove.hide();
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
	    new MessageBox(MessageBox.ERROR, title, message);
	    break;

	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_CALENDER_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_CALENDER_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, message);
    }
    caller.invokeService(this.model.getDocument());

}

/**
 * entferne alle als gelöscht markierten elemente (keeper/purifier) und setzen
 * bei allen mit CREATE oder MODIFY markierten Elementen die Aktion zurück auf
 * NONE.
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
    this.container.className = "details-entry-cnr";

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
    img.className = "avatar";
    img.src = "getDocument/memberImage/?id=" + memberId;
    return img;
}

/**
 * 
 */
MainViewDetailsKeeperEntry.prototype.makeNameSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-namesection";

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
    result.className = "details-timesection";

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

    if (!SessionManager.isAdmin() && !SessionManager.isMee(memberId)) {
	from.disabled = end.disabled = true;
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
    this.container.className = "details-entry-cnr";

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
    img.className = "avatar";
    img.src = "getDocument/memberImage/?id=" + memberId;
    return img;
}

/**
 * 
 */
MainViewDetailsPurifierEntry.prototype.makeNameSection = function(memberId) {

    var result = document.createElement("div");
    result.className = "details-namesection";

    var xpath = "//members-model/members/member[id='" + memberId + "']";
    var vname = this.memberModel.getValue(xpath + "/vname");
    var zname = this.memberModel.getValue(xpath + "/zname");
    result.textContent = vname + " " + zname;
    return result;
}
