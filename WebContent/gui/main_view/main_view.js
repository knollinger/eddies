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
    
    this.createToolButton("gui/images/calendar-today.svg", "Gehe zu heute", function() {
	self.currentDate = new Date();
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

    var self = this;
    var startDate = this.findStartDate();
    var endDate = this.findLastDate();
    this.loadModel(startDate, endDate, function() {

	self.model.addChangeListener("//calendar-model", function() {
	    self.fillWeek(startDate, endDate);
	});
	self.fillWeek(startDate, endDate);
    });
}

/**
 * 
 */
MainViewCalendar.prototype.fillWeek = function(startDate, endDate) {

    UIUtils.clearChilds("workspace-frame-calendar-body");
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

    var baseXPath = "//calendar-model/keeper-entries/keeper-entry[date='" + DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}") + "' and action != 'REMOVE']";
    var entries = this.model.evaluateXPath(baseXPath);
    if (entries.length == 0) {
	content.className += " calendar-day-closed";
    } else {
	content.className += " calendar-day-open";
	content.appendChild(this.makeOpeningTimeIndicator(baseXPath));
    }
    UIUtils.getElement("workspace-frame-calendar-body").appendChild(day);

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

    var begin = DateTimeUtils.formatTime(this.findFrom(xpath), "{hh}:{mm}");
    var end = DateTimeUtils.formatTime(this.findUntil(xpath), "{hh}:{mm}");
    var time = document.createElement("div");
    time.className = "calendar-day-time";
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
	    var observingXPath = "//calendar-model";
	    self.model.addChangeListener(observingXPath, function() {
		self.enableSaveButton(true);
	    });
	    self.update();
	});
    });
}
MainViewDetails.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
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
	entry.parentElement.removeChild(entry);
    });
    this.model.forEach("//calendar-model/keeper-entries/keeper-entry[action != 'NONE']", function(entry) {
	entry.getElementsByTagName("action")[0].textContent = "NONE";
    });
    this.model.forEach("//calendar-model/purifier-entries/purifier-entry[action = 'REMOVE']", function(entry) {
	entry.parentElement.removeChild(entry);
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
    from.className = "details-content-time mandatory";
    from.type = "time";
    from.title = from.placeholder = "von";
    this.model.createValueBinding(from, this.entryXPath + "/begin");
    result.appendChild(from);

    var fill = document.createElement("span");
    fill.textContent = " - ";
    result.appendChild(fill);

    var end = document.createElement("input");
    end.className = "details-content-time mandatory";
    end.type = "time";
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
