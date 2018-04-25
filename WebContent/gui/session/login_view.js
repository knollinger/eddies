var LoginView = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/session/login.html", function() {

	self.emailEntry = document.getElementById("login-email");
	self.emailEntry.addEventListener("input", function() {
	    self.adjustSubmitBtn();
	});
	self.emailEntry.focus();

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
	self.adjustSubmitBtn();
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

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "logon-response":
	    SessionManager.uid = rsp.getElementsByTagName("id")[0].textContent;
	    SessionManager.zname = rsp.getElementsByTagName("vname")[0].textContent;
	    SessionManager.vname = rsp.getElementsByTagName("zname")[0].textContent;
	    self.close();
	    break;

	case "error-response":
	    self.close();
	    break;
	}
    }
    caller.onError = function(req, status) {
	self.close();
    }

    var req = XmlUtils.createDocument("logon-request");
    XmlUtils.setNode(req, "email", this.emailEntry.value);
    XmlUtils.setNode(req, "password", this.passwdEntry.value);
    caller.invokeService(req);
}
