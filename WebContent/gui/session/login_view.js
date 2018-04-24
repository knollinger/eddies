var LoginView = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/session/login.html", function() {

	self.emailEntry = document.getElementById("login-email");
	self.emailEntry.addEventListener("input", function() {
	    self.adjustSubmitBtn();
	});

	self.passwdEntry = document.getElementById("login-passwd");
	self.passwdEntry.addEventListener("input", function() {
	    self.adjustSubmitBtn();
	});

	self.submitBtn = document.getElementById("login-submit");
	self.submitBtn.addEventListener("click", function() {
	    self.login();
	});

	self.cancelBtn = document.getElementById("login-cancel");
	self.cancelBtn.addEventListener("click", function() {
	    self.close();
	});
    });
}
LoginView.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
LoginView.prototype.adjustSubmitBtn = function() {

    this.submitBtn.disabled = this.emailEntry.value == "" || this.passwdEntry.value == "";
}

/**
 * 
 */
LoginView.prototype.login = function() {

}
