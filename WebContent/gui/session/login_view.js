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

	self.frame.addEventListener("keyup", function(evt) {
	    if (evt.keyCode == 13) {
		self.submitBtn.click();
	    }
	});
    });
}
LoginView.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
LoginView.prototype.getTitle = function() {

    return "Eddy CrashPaddy - Login";
}

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
	    var title = MessageCatalog.getMessage("LOGIN_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOGIN_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    self.close();
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOGIN_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOGIN_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
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
	case "changepwd-ok-response":
	    self.close();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("PWDCHANGE_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("PWDCHANGE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    self.close();
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("PWDCHANGE_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("PWDCHANGE_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);	
	self.close();
    }

    var req = XmlUtils.createDocument("changepwd-request");
    XmlUtils.setNode(req, "old-passwd", this.oldPwdEntry.value);
    XmlUtils.setNode(req, "new-passwd", this.newPwdEntry.value);
    caller.invokeService(req);
}
