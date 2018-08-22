/**
 * Editor
 * 
 */
var MemberEditor = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/member_view/member_overview.html", function() {

	self.enableSaveButton(false);
	self.loadModel(function() {

	    self.fillTable();
	    self.model.addChangeListener("//members-model/members", function() {
		self.enableSaveButton();
	    });

	    if (SessionManager.isAdmin()) {
		self.actionAdd = self.createAddAction();
		self.actionRemove = self.createRemoveAction();
	    }
	});
    });
}
MemberEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberEditor.prototype.getTitle = function() {

    return "Crew verwalten";
}

/**
 * 
 */
MemberEditor.prototype.createAddAction = function() {

    var self = this;
    var action = this.createToolButton("gui/images/person-add.svg", "Person hinzu fügen", function() {

	var doc = XmlUtils.parse(MemberEditor.EMPTY_ENTRY);
	self.currXPath = self.model.addElement("//members-model/members", doc.documentElement);
	self.currEntry = new MemberEditorEntry(self.model, self.currXPath);
	UIUtils.getElement("member-overview-body").appendChild(self.currEntry.container);
	self.currEntry.container.addEventListener("click", function() {
	    self.actionRemove.show();
	});
	self.currEntry.select();
    });
    return action;
}
MemberEditor.EMPTY_ENTRY = "<member><id/><action>CREATE</action><zname/><vname/><phone/><mobile/><email/><sex/><role/></member>";

/**
 * 
 */
MemberEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = this.createToolButton("gui/images/person-remove.svg", "Person entfernen", function() {

	var title = MessageCatalog.getMessage("REMOVE_MEMBER_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_MEMBER_QUERY");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action = self.model.getValue(self.currXPath, +"/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currXPath);
	    } else {
		self.model.setValue(self.currXPath + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currEntry.container);
	    self.currEntry = self.currXPath = null;
	});
    });
    action.hide();
    return action;
}

/**
 * 
 */
MemberEditor.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "members-model":
	    self.model = new Model(rsp);
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
MemberEditor.prototype.fillTable = function(memberId) {

    var self = this;
    var allMember = this.model.evaluateXPath("//members-model/members/member");
    for (var i = 0; i < allMember.length; i++) {

	var xpath = XmlUtils.getXPathTo(allMember[i]);
	var entry = this.createOneEntry(xpath);
	UIUtils.getElement("member-overview-body").appendChild(entry.container);

	if (i == 0) {
	    entry.container.focus();
	}
    }
}

/**
 * 
 */
MemberEditor.prototype.createOneEntry = function(xpath) {

    var entry = new MemberEditorEntry(this.model, xpath);

    var memberId = this.model.getValue(xpath + "/id");
    if (SessionManager.isAdmin() || SessionManager.isMee(memberId)) {

	var self = this;
	entry.container.addEventListener("click", function() {
	    self.currXPath = xpath;
	    self.currEntry = entry;
	    self.actionRemove.show();
	});

	this.model.addChangeListener(xpath, function() {
	    var action = self.model.getValue(xpath + "/action");
	    if (action == "NONE") {
		self.model.setValue(xpath + "/action", "MODIFY");
	    }
	});
    }
    return entry;
}

/**
 * 
 */
MemberEditor.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-membersmodel-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_MEMBEROVERVIEW_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_MEMBEROVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_MEMBEROVERVIEW_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_MEMBEROVERVIEW_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MemberEditorEntry = function(model, memberXPath) {

    this.model = model;
    this.memberXPath = memberXPath;

    this.memberId = this.model.getValue(this.memberXPath + "/id");
    this.isEditable = SessionManager.isAdmin() || SessionManager.isMee(this.memberId);

    this.container = document.createElement("div");
    this.container.className = "member-overview-entry";

    this.radio = this.createRadio();
    this.container.appendChild(this.radio);

    var titleRow = this.createTitleRow(this.radio);
    this.container.appendChild(titleRow);

    var content = document.createElement("div");
    content.className = "grid member-overview-content";
    this.container.appendChild(content);

    var nameRow = this.createNameRow();
    content.appendChild(nameRow);

    var row = document.createElement("div");
    row.className = "grid-row-0";
    row.appendChild(this.createSexSelector());
    if (SessionManager.isAdmin()) {
	row.appendChild(this.createRoleSelector());
    }
    content.appendChild(row);

    var phoneRow = this.createPhoneRow();
    content.appendChild(phoneRow);

    var mailRow = this.createMailRow();
    content.appendChild(mailRow);
}

/**
 * 
 */
MemberEditorEntry.prototype.createRadio = function() {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.className = "hidden";
    radio.name = "member_overview_sel";
    return radio;

}

/**
 * 
 */
MemberEditorEntry.prototype.createTitleRow = function(radio) {

    var result = document.createElement("div");
    result.className = "member-overview-title-row";

    var img = this.createImage();
    result.appendChild(img);

    var label = this.createLabel();
    result.appendChild(label);

    var self = this;
    result.addEventListener("click", function(evt) {
	if (evt.target != radio) {
	    self.select();
	}

    });
    return result;
}

/**
 * 
 */
MemberEditorEntry.prototype.createImage = function() {

    var self = this;
    var img = document.createElement("img");
    img.className = "avatar";
    img.title = "Hier klicken um das Bild zu ändern";
    img.src = "getDocument/memberImage?id=" + this.model.getValue(this.memberXPath + "/id");
    if (this.isEditable) {
	UIUtils.addClass(img, "clickable");
	new FilePicker(img, function(name, type, data) {
	    self.model.addValue(self.memberXPath, "img", data);
	    self.model.addValue(self.memberXPath, "img-type", type);
	    img.src = UIUtils.createDataUrl(type, data);
	});
    }
    return img;
}

/*
 * 
 * 
 */
MemberEditorEntry.prototype.createLabel = function() {

    var result = document.createElement("span");
    var self = this;
    var fromXML = function(val) {
	var vname = self.model.getValue(self.memberXPath + "/vname");
	var zname = self.model.getValue(self.memberXPath + "/zname");
	return vname + " " + zname;
    }
    this.model.createAttributeBinding(result, "textContent", self.memberXPath, null, null, fromXML);
    return result;
}

/*
 * 
 * 
 */
MemberEditorEntry.prototype.createNameRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.makeField(this.memberXPath + "/zname", "grid-col-2", "mandatory", "Name"));
    row.appendChild(this.makeField(this.memberXPath + "/vname", "grid-col-2", "mandatory", "Vorname"));

    return row;
}

/*
 * 
 * 
 */
MemberEditorEntry.prototype.createSexSelector = function() {

    var select = document.createElement("select");
    select.className = "grid-col-2";

    var opt = document.createElement("option");
    opt.disabled = opt.selected = true;
    opt.textContent = "Geschlecht";
    opt.value = "";
    select.appendChild(opt);

    opt = document.createElement("option");
    opt.textContent = "Männlich";
    opt.value = "M";
    select.appendChild(opt);

    opt = document.createElement("option");
    opt.textContent = "Weiblich";
    opt.value = "F";
    select.appendChild(opt);

    this.model.createValueBinding(select, this.memberXPath + "/sex");

    if (this.isEditable) {
	UIUtils.addClass(select, "mandatory");
    } else {
	select.disabled = true;
    }
    return select;
}

/*
 * 
 * 
 */
MemberEditorEntry.prototype.createRoleSelector = function() {

    var select = document.createElement("select");
    select.className = "grid-col-2 mandatory";

    var opt = document.createElement("option");
    opt.disabled = opt.selected = true;
    opt.textContent = "Rolle";
    opt.value = "";
    select.appendChild(opt);

    opt = document.createElement("option");
    opt.textContent = "Administrator";
    opt.value = "ADMIN";
    select.appendChild(opt);

    opt = document.createElement("option");
    opt.textContent = "Team-Mitglied";
    opt.value = "MEMBER";
    select.appendChild(opt);

    this.model.createValueBinding(select, this.memberXPath + "/role");

    return select;
}

/*
 * 
 * 
 */
MemberEditorEntry.prototype.createPhoneRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.makeField(this.memberXPath + "/mobile", "grid-col-2", "mandatory", "Mobile-Nummer"));
    row.appendChild(this.makeField(this.memberXPath + "/phone", "grid-col-2", null, "Festnetz"));

    return row;
}

/*
 * 
 * 
 */
MemberEditorEntry.prototype.createMailRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.makeField(this.memberXPath + "/email", "grid-col-4", "mandatory", "Email"));

    return row;
}

/*
 * Erstelle ein SubField. Wenn für den Entry die Eigenschafft "editable" gesetzt
 * ist, dann wird ein InputField generiert, anderenfalls ein span.
 * 
 */
MemberEditorEntry.prototype.makeField = function(xpath, gridClasses, editClasses, title) {

    var result = document.createElement("input");
    result.title = result.placeholder = title;
    this.model.createValueBinding(result, xpath, "input");
    UIUtils.addClass(result, gridClasses);
    if (this.isEditable) {
	UIUtils.addClass(result, editClasses);
    } else {
	result.disabled = true;
    }
    return result;
}

/*
 * 
 */
MemberEditorEntry.prototype.select = function() {

    this.radio.click();
    if (this.isEditable) {
	this.container.querySelector(".mandatory").focus();
    }
}

/*---------------------------------------------------------------------------*/
/**
 * Zeigt alle Member an
 * 
 * @param onselect wird gerufen, wenn ein Member ausgewählt wurde
 * 
 */
var MemberSelector = function(onselect) {
    
    this.onselect = onselect;
    var self = this;
    WorkSpaceFrame.call(this, "gui/member_view/member_selector.html", function() {

	self.loadModel(function() {
	    self.fillTable();
	});
    });
}
MemberSelector.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberSelector.prototype.getTitle = function() {

    return "Ein Team-Mitglied auswählen";
}

/**
 * 
 */
MemberSelector.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "members-model":
	    self.model = new Model(rsp);
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
MemberSelector.prototype.fillTable = function(memberId) {

    var self = this;
    var allMember = this.model.evaluateXPath("//members-model/members/member");
    for (var i = 0; i < allMember.length; i++) {

	var xpath = XmlUtils.getXPathTo(allMember[i]);
	var entry = this.createOneEntry(xpath);
	UIUtils.getElement("member-selector-body").appendChild(entry);
    }
}

/**
 * 
 */
MemberSelector.prototype.createOneEntry = function(xpath) {

    var self = this;
    
    var result = document.createElement("div");
    result.className = "member-overview-title-row";
    result.appendChild(this.createImage(xpath));
    result.appendChild(this.createLabel(xpath));    

    result.addEventListener("click", function() {
	
	self.close();
	var id = self.model.getValue(xpath + "/id");
	self.onselect(id);
    });
    return result;
}

/**
 * 
 */
MemberSelector.prototype.createImage = function(xpath) {

    var img = document.createElement("img");
    img.className = "avatar clickable";
    img.src = "getDocument/memberImage?id=" + this.model.getValue(xpath + "/id");
    return img;
}

/*
 * 
 * 
 */
MemberSelector.prototype.createLabel = function(xpath) {

    var result = document.createElement("span");
    var vname = this.model.getValue(xpath + "/vname");
    var zname = this.model.getValue(xpath + "/zname");
    result.textContent = vname + " " + zname;
    return result;
}
