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

    UIUtils.getElement("admin-members-btn").addEventListener("click", function() {
	new MemberEditor();
    });
    UIUtils.getElement("admin-members-btn").focus();
}

/**
 * 
 */
AdminView.prototype.getTitle = function() {
    
    return "Administration";
}