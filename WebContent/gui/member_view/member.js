/**
 * Zeigt alle Member an, welche im angegebenen Model unter dem durch
 * memberCnrXPath referenzierten XML-Container enthalten sind
 */
var MemberOverview = function(model, memberCnrXPath, onselect, memberId) {

    this.model = model;
    this.memberCnrXPath = memberCnrXPath;

    var self = this;
    WorkSpaceFrame.call(this, "gui/member_view/member_overview.html", function() {
	self.enableSaveButton(false);
	self.fillTable(memberId);
	self.model.addChangeListener(self.memberCnrXPath, function() {
	    self.enableSaveButton();
	});
    });
}
MemberOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberOverview.prototype.fillTable = function(memberId) {

    var allMember = this.model.evaluateXPath(this.memberCnrXPath + "/member");
    for (var i = 0; i < allMember.length; i++) {

	var memberXPath = XmlUtils.getXPathTo(allMember[i]);
	var entry = new MemberOverviewEntry(this.model, memberXPath);
	UIUtils.getElement("member-overview-body").appendChild(entry.container);

	if (this.model.getValue(memberXPath + "/id") == memberId) {
	    entry.select();
	}
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

    var titleRow = this.createTitleRow();
    this.container.appendChild(titleRow);
    
    var nameRow = this.createNameRow();    
    this.container.appendChild(nameRow);  
    
    var phoneRow = this.createPhoneRow();
    this.container.appendChild(phoneRow);    
    
    var mailRow = this.createMailRow();
    this.container.appendChild(mailRow);

    var self = this;
    titleRow.addEventListener("click", function() {
//	self.expCol.click();
	self.radio.click();
    });
    
    this.expCol.addEventListener("click", function(evt) {
	evt.stopPropagation();
	if(self.expCol.checked) {
	    UIUtils.removeClass(nameRow, "hidden");
	    UIUtils.removeClass(phoneRow, "hidden");
	    UIUtils.removeClass(mailRow, "hidden");
	    UIUtils.addClass(this.label, "hidden");
	}
	else {
	    UIUtils.addClass(nameRow, "hidden");
	    UIUtils.addClass(phoneRow, "hidden");
	    UIUtils.addClass(mailRow, "hidden");	    
	    UIUtils.removeClass(this.label, "hidden");
	}
    });
}

/**
 * 
 */
MemberOverviewEntry.prototype.createTitleRow = function() {
    
    var result = document.createElement("div");
    result.style.display = "flex";
    result.style.alignItems = "center";
    result.style.marginBottom = "10px";
    
    this.radio = this.createRadio();
    var subCnr = document.createElement("div");
    subCnr.marginTop = "10px";
    subCnr.style.flex = "0 auto";
    subCnr.appendChild(this.radio);
    result.appendChild(subCnr);
    
    this.label = this.createLabel();    
    subCnr = document.createElement("div");
    subCnr.style.flex = "1";
    subCnr.appendChild(this.label);
    result.appendChild(subCnr);
    
    this.expCol = this.createExpandCollapse();
    subCnr = document.createElement("div");
    subCnr.style.flex = "0 auto";
    subCnr.appendChild(this.expCol);
    result.appendChild(subCnr);
    
    return result;
    
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
MemberOverviewEntry.prototype.createLabel = function() {

    var result = document.createElement("span");
    result.style.paddingLeft = "10px";
    result.style.fontWeight ="600";
    var self = this;
    var fromXML = function(val) {
	var vname = self.model.getValue(self.memberXPath + "/vname");
	var zname = self.model.getValue(self.memberXPath + "/zname");
	return vname + " " + zname;
    }
    this.model.createAttributeBinding(result, "textContent", self.memberXPath, null, null, fromXML);
    return result;    
    return result;
}

/*
 * 
 * 
 */
MemberOverviewEntry.prototype.createExpandCollapse = function() {

    var result = document.createElement("input");
    result.type = "checkbox";
    result.className = "expand-button";

    return result;
}

/*
 * 
 * 
 */
MemberOverviewEntry.prototype.createNameRow = function() {

    var row = document.createElement("div");
    row.className = "grid-row-0 hidden";

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
    row.className = "grid-row-0 hidden";

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
    row.className = "grid-row-0 hidden";

    row.appendChild(this.makeField(this.memberXPath + "/email", "grid-col-2", "mandatory", "Email"));

    return row;
}

/*
 * Erstelle ein SubField. Wenn für den Entry die Eigenschafft "editable" gesetzt
 * ist, dann wird ein InputField generiert, anderenfalls ein span.
 * 
 */
MemberOverviewEntry.prototype.makeField = function(xpath, gridClasses, editClasses, title) {

    var result = document.createElement("input");
    result.title = result.placeholder = title;
    this.model.createValueBinding(result, xpath, "input");
    UIUtils.addClass(result, gridClasses);
    if(this.isEditable) {
	UIUtils.addClass(result, editClasses);	
    }
    else {
	result.disabled = true;
    }
    return result;
}

/*
 * 
 */
MemberOverviewEntry.prototype.select = function() {

    this.radio.click();
    this.radio.focus();
}
