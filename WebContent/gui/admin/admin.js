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
    btnBox.appendChild(new NavigationButton("Crew verwalten", "gui/images/person-group.svg", function() {
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
	OpenHoursModelHelper.load(function(model) {
	    self.model = model;
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

    OpenHoursModelHelper.save(this.model, function() {
    });
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var OpenHoursModel = function(xmlDoc) {

    Model.call(this, xmlDoc);
}
OpenHoursModel.prototype = Object.create(Model.prototype);

/**
 * liefere den Öffnungs-Zeit
 */
OpenHoursModel.prototype.getFrom = function(date) {

    var result = null;
    var xpath = "//opening-hours-model/entry[day-of-week='" + date.getDay() + "']/from";
    var from = this.getValue(xpath);
    if(from) {
	var time = DateTimeUtils.parseTime(from, "hh:mm");
	result = new Date(0);
	result.setHours(time.getHours());
	result.setMinutes(time.getMinutes());
	result.setSeconds(0);
    }
    return result;
}

/**
 * liefere den Zeit des schliessens
 */
OpenHoursModel.prototype.getUntil = function(date) {

    var result = null;
    var xpath = "//opening-hours-model/entry[day-of-week='" + date.getDay() + "']/until";
    var until = this.getValue(xpath);
    if(until) {
	var time = DateTimeUtils.parseTime(until, "hh:mm");
	result = new Date(0);
	result.setHours(time.getHours());
	result.setMinutes(time.getMinutes());
	result.setSeconds(0);
    }
    return result;
}

/**
 * liefere den Zeit des schliessens
 */
OpenHoursModel.prototype.mustBeOpen = function(date) {

    return this.getFrom(date) && this.getUntil(date);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var OpenHoursModelHelper = (function() {

    return {

	/**
	 * lade das Model der Öffnungszeiten.
	 * 
	 * @param onsuccess
	 *                wird gerufen, wenn das laden erfolgreich war. als
	 *                Parameter wird das OpenHoursModel übergeben
	 */
	load : function(onsuccess) {

	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		switch (rsp.documentElement.nodeName) {
		case "opening-hours-model":
		    onsuccess(new OpenHoursModel(rsp));
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

	},

	/**
	 * speichere das Model
	 * 
	 * @param model
	 *                das model
	 * @param onsuccess
	 *                wird nach dem speichern gerufen
	 */
	save : function(model, onsuccess) {

	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		switch (rsp.documentElement.nodeName) {
		case "save-opening-hours-model-ok-rsp":
		    onsuccess();
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

	    caller.invokeService(model.getDocument());

	}
    }
})();