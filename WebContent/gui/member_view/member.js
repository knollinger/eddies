/**
 * Zeigt alle Member an, welche im angegebenen Model unter dem durch
 * memberCnrXPath referenzierten XML-Container enthalten sind
 */
var MemberOverview = function(model, memberCnrXPath, onselect) {

    this.model = model;
    this.memberCnrXPath = memberCnrXPath;

    var self = this;
    WorkSpaceFrame.call(this, "gui/member_view/member_overview.html", function() {
	self.enableSaveButton(false);
	self.fillTable();
	self.model.addChangeListener(self.memberCnrXPath, function() {
	    self.enableSaveButton();
	});
    });
}
MemberOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberOverview.prototype.fillTable = function() {

    var allMember = this.model.evaluateXPath(this.memberCnrXPath + "/member");
    for (var i = 0; i < allMember.length; i++) {

	var memberXPath = XmlUtils.getXPathTo(allMember[i]);
	var entry = new MemberOverviewEntry(this.model, memberXPath);
	UIUtils.getElement("member-overview-body").appendChild(entry.container);
    }
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MemberOverviewEntry = function(model, memberXPath) {

    this.model = model;
    this.memberXPath = memberXPath;

    this.memberId = this.model.getValue(this.memberXPath + "/id");
    this.isEditable = SessionManager.isAdmin() || SessionManager.isMee(this.memberId);

    this.container = document.createElement("div");
    this.container.className = "member-overview-entry";

    var radio = this.createRadio();
    this.container.appendChild(radio);

    this.container.appendChild(this.createNameRow());
    this.container.appendChild(this.createPhoneRow());
    this.container.appendChild(this.createMailRow());

    this.container.addEventListener("click", function() {
	radio.click();
    });
}

/*
 * 
 * 
 */
MemberOverviewEntry.prototype.createRadio = function() {

    var memberId = this.model.getValue(this.memberXPath + "/id");

    var result = document.createElement("input");
    result.type = "radio";
    result.className = "image-radio";
    result.name = "member-overview_selection";
    result.style.backgroundImage = "url('getDocument/memberImage?id=" + memberId + "')";

    return result;
}

/*
 * 
 * 
 */
MemberOverviewEntry.prototype.createNameRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.makeField(this.memberXPath + "/zname", "grid-col-1", "mandatory", "Name"));
    row.appendChild(this.makeField(this.memberXPath + "/vname", "grid-col-1", "mandatory", "Vorname"));


    return row;
}

/*
 * 
 * 
 */
MemberOverviewEntry.prototype.createPhoneRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.makeField(this.memberXPath + "/mobile", "grid-col-1", "mandatory", "Mobile-Nummer"));
    row.appendChild(this.makeField(this.memberXPath + "/phone", "grid-col-1", null, "Festnetz"));

    return row;
}

/*
 * 
 * 
 */
MemberOverviewEntry.prototype.createMailRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.makeField(this.memberXPath + "/email", "grid-col-2", "mandatory", "Email"));


    return row;
}

/*
 * Erstelle ein SubField. Wenn für den Entry die Eigenschafft "editable" gesetzt
 * ist, dann wird ein InputField generiert, anderenfalls ein span.
 * 
 */
MemberOverviewEntry.prototype.makeField = function(xpath, gridClasses, editClasses, title) {

    var result = null;
    if (this.isEditable) {
	result = document.createElement("input");
	result.title = result.placeholder = title;
	this.model.createValueBinding(result, xpath, "input");	
	UIUtils.addClass(result, editClasses);
    } else {
	result = document.createElement("span");
	this.model.createAttributeBinding(result, "textContent", xpath, "input");
    }
    UIUtils.addClass(result, gridClasses);
    return result;
}