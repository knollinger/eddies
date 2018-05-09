/*---------------------------------------------------------------------------*/
/**
 * Die Login-Seite
 */
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
	    window.location = "index.html";
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

/*---------------------------------------------------------------------------*/
/**
 * Die Kennwortwechsel-Seite
 */
var ChangePasswordView = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/session/changepwd.html", function() {

	self.oldPwdEntry = document.getElementById("changepwd-oldpasswd");
	self.oldPwdEntry.addEventListener("input", function() {
	    self.adjustSubmitBtn();
	});
	self.oldPwdEntry.focus();

	self.newPwdEntry = document.getElementById("changepwd-newpasswd");
	self.newPwdEntry.addEventListener("input", function() {
	    self.adjustSubmitBtn();
	});

	self.newPwd1Entry = document.getElementById("changepwd-newpasswd1");
	self.newPwd1Entry.addEventListener("input", function() {
	    self.adjustSubmitBtn();
	});

	self.submitBtn = document.getElementById("changepwd-submit");
	self.submitBtn.addEventListener("click", function() {
	    self.changePasswd();
	});
	self.adjustSubmitBtn();
    });
}
ChangePasswordView.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
ChangePasswordView.prototype.adjustSubmitBtn = function() {

    this.submitBtn.disabled = this.oldPwdEntry.value == "" || this.newPwdEntry.value == "" || this.newPwd1Entry.value == "";
}

/**
 * 
 */
ChangePasswordView.prototype.changePasswd = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "changepwd-response":
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

    var req = XmlUtils.createDocument("changepwd-request");
    XmlUtils.setNode(req, "old-passwd", this.oldPwdEntry.value);
    XmlUtils.setNode(req, "new-passwd", this.newPwdEntry.value);
    XmlUtils.setNode(req, "new-passwd1", this.newPwd1Entry.value);
    caller.invokeService(req);
}
