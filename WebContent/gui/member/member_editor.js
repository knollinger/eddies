var MemberOverview = function() {

    var self = this;
    WorkSpaceFrame.call(this);
    this.load("gui/member/member_overview.html", function() {

	self.setTitle("Team-Übersicht");
	new TableDecorator("member_overview_resultset");

	self.loadModel(function() {

	    self.actionEdit = self.createEditAction();
	    self.actionAdd = self.createAddAction();

	    self.model.addChangeListener("//get-member-overview-ok-rsp/members", function() {
		self.fillTable();
	    });
	    self.fillTable();

	});
    });
}
MemberOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * lade das Model
 */
MemberOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-member-overview-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var messg = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    var title = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_ERROR_TITLE");
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    };

    caller.onError = function(req, status) {
	var messg = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_TECH_ERROR", status);
	var title = MessageCatalog.getMessage("LOAD_MEMBEROVERVIEW_ERROR_TITLE");
	new MessageBox(MessageBox.ERROR, title, messg);
    };

    var req = XmlUtils.createDocument("get-member-overview-req");
    caller.invokeService(req);

}

/**
 * lade das Model
 */
MemberOverview.prototype.fillTable = function() {

    var self = this;
    var fields = this.getColumnDescriptor();
    var onclick = function(tr, member) {

	self.currMember = XmlUtils.getXPathTo(member);
	var radio = "member_overview_radio_" + member.getElementsByTagName("id")[0].textContent;
	document.getElementById(radio).click();
	self.actionEdit.show();
    }

    var filter = function(member) {
	return member.getElementsByTagName("action")[0].textContent != "CREATE";
    }

    this.model.createTableBinding("member_overview_resultset", fields, "//get-member-overview-ok-rsp/members/member", onclick, filter);
}

/**
 * 
 */
MemberOverview.prototype.getColumnDescriptor = function() {

    var fields = [];

    fields.push(function(member) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "member_overview_radio";
	radio.id = "member_overview_radio_" + member.getElementsByTagName("id")[0].textContent;
	return radio;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("phone");
    fields.push("mobile");
    fields.push("email");

    return fields;
}

MemberOverview.EMPTY_MEMBER = "<member><id/><action>CREATE</action><title/><zname/><vname/><vname2/><phone/><mobile/><email/></member>";

/**
 * 
 */
MemberOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-edit.svg", "Team-Mitglied bearbeiten", function() {

	new MemberEditor(self.model, self.currMember);
    });

    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
MemberOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Team-Mitglied anlegen", function() {

	var doc = XmlUtils.parse(MemberOverview.EMPTY_MEMBER);
	var xpath = self.model.addElement("//get-member-overview-ok-rsp/members", doc.documentElement);
	new MemberEditor(self.model, xpath);
    });

    this.addAction(action);
    return action;
}

/*---------------------------------------------------------------------------*/
/**
 * Der MemberEditor
 */
var MemberEditor = function(model, xpath) {

    WorkSpaceFrame.call(this);
    this.model = new ModelWorkingCopy(model, xpath);

    var self = this;
    this.load("gui/member/member_editor.html", function() {
	self.model.createValueBinding("member_editor_title", "//member/title");
	self.model.createValueBinding("member_editor_zname", "//member/zname");
	self.model.createValueBinding("member_editor_vname", "//member/vname");
	self.model.createValueBinding("member_editor_vname2", "//member/vname2");
	self.model.createValueBinding("member_editor_title", "//member/title");
	self.model.createValueBinding("member_editor_phone", "//member/phone");
	self.model.createValueBinding("member_editor_mobile", "//member/mobile");
	self.model.createValueBinding("member_editor_email", "//member/email");

	self.model.addChangeListener("//member", function() {
	    self.enableSaveButton(true);
	    if (self.model.getValue("//member/action") != "CREATE") {
		self.model.setValueSilent("//member/action", "MODIFY");
	    }
	    self.adjustTitle();
	});
	self.adjustTitle();

    });
}
MemberEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberEditor.prototype.adjustTitle = function() {

    var zname = this.model.getValue("//member/zname");
    var vname = this.model.getValue("//member/vname");
    var title = "Team-Mitglied bearbeiten";
    if (zname || vname) {

	title += " [" + zname + ", " + vname + "]";
    }
    this.setTitle(title);
}

/**
 * 
 */
MemberEditor.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "member":
	    self.model.setValue("//member/id", XmlUtils.evaluateXPath(rsp, "//member/id")[0].textContent);
	    self.model.setValue("//member/action", XmlUtils.evaluateXPath(rsp, "//member/action")[0].textContent);
	    self.model.commit();
	    self.close();
	    break;

	case "error-response":
	    var messg = MessageCatalog.getMessage("SAVE_MEMBER_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    var title = MessageCatalog.getMessage("SAVE_MEMBER_ERROR_TITLE");
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var messg = MessageCatalog.getMessage("SAVE_MEMBER_TECH_ERROR", status);
	var title = MessageCatalog.getMessage("SAVE_MEMBER_ERROR_TITLE");
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());
}
