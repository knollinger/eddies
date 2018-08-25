var AdminView = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/admin/admin_view.html", function() {

	self.setupUI();
    });
}
AdminView.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
AdminView.prototype.setupUI = function() {

    var btnBox = this.body.querySelector(".navigation-button-box");
    btnBox.appendChild(new NavigationButton("Crew verwalten", "gui/images/person.svg", function() {
	new MemberEditor();
    }));

    if (SessionManager.isAdmin()) {

	btnBox.appendChild(new NavigationButton("Öffnungs-Zeiten verwalten", "gui/images/calendar.svg", function() {
	    new OpeningHoursEditor();
	}));
    }
}

/**
 * 
 */
AdminView.prototype.getTitle = function() {

    return "Administration";
}

/*---------------------------------------------------------------------------*/
/**
 * Der editor zur Pflege der Standard-Öffnungszeiten
 */
var OpeningHoursEditor = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/admin/opening_hours_editor.html", function() {

	self.enableSaveButton(false);
	self.loadModel(function() {
	    self.bindModel();
	});
    });
}
OpeningHoursEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
OpeningHoursEditor.prototype.getTitle = function() {
    return "Standard-Öffnungszeiten bearbeiten";
}

/**
 * 
 */
OpeningHoursEditor.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "opening-hours-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_OPENING_HOURS_MODEL_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_OPENING_HOURS_MODEL_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_OPENING_HOURS_MODEL_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_OPENING_HOURS_MODEL_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-opening-hours-model");
    caller.invokeService(req);
}

/**
 * 
 */
OpeningHoursEditor.prototype.bindModel = function() {

    var self = this;
    for (var i = 0; i < 7; i++) {
	this.bindOneDay(i);
    }

    var self = this;
    this.model.addChangeListener("//opening-hours-model", function() {
	self.enableSaveButton(true);
    });
}

/**
 * 
 */
OpeningHoursEditor.prototype.bindOneDay = function(dayOfWeek) {

    var xpath = "//opening-hours-model/entry[day-of-week='" + dayOfWeek + "']";
    this.model.createValueBinding("opening_hours_from_" + dayOfWeek, xpath + "/from");
    this.model.createValueBinding("opening_hours_until_" + dayOfWeek, xpath + "/until");

    var self = this;
    this.model.addChangeListener(xpath, function() {

	var action = self.model.getValue(xpath + "/action");
	if (action == "NONE") {
	    self.model.setValue(xpath + "/action", "MODIFY");
	}
    });
}

/**
 * 
 */
OpeningHoursEditor.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-opening-hours-model-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_OPENING_HOURS_MODEL_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_OPENING_HOURS_MODEL_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_OPENING_HOURS_MODEL_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_OPENING_HOURS_MODEL_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    caller.invokeService(this.model.getDocument());
}
