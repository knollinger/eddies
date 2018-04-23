/**
 * Der Logon-Dialog
 */
var LogonDialog = function() {

    WorkSpaceFrame.call(this);
    this.setTitle("Anmeldung");
    this.enableBackButton(false);

    this.loadAccounts();
}

/**
 * Wir erben von WorkSpaceFrame
 */
LogonDialog.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
LogonDialog.prototype.loadAccounts = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	self.renderAccounts(rsp);
    }
    caller.onError = function(req, status) {
	// TODO
    }

    var req = XmlUtils.createDocument("get-login-accounts-request");
    caller.invokeService(req);
}

/**
 * @param rsp
 */
LogonDialog.prototype.renderAccounts = function(rsp) {

    var cnr = document.createElement("div");
    cnr.className = "login-account-cnr";
    this.content.appendChild(cnr);

    var accounts = rsp.getElementsByTagName("account");
    for (var i = 0; i < accounts.length; i++) {

	var id = accounts[i].getElementsByTagName("id")[0].textContent;
	var name = accounts[i].getElementsByTagName("name")[0].textContent;
	var account = this.renderOneAccount(id, name);
	cnr.appendChild(account);
    }
}

/**
 * @param id
 * @param name
 */
LogonDialog.prototype.renderOneAccount = function(id, name) {

    var self = this;
    var label = document.createElement("label");
    label.className = "login-account-button";

    var img = document.createElement("img");
    img.src = "getDocument/memberImage?id=" + id + "&domain=THUMBNAIL";
    label.appendChild(img);

    var text = document.createElement("span");
    text.textContent = name;
    label.appendChild(text);

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "accounts";
    radio.value = name;
    label.appendChild(radio);

    var pwd = document.createElement("input");
    pwd.type = "password";
    pwd.placeholder = "Kennwort";
    new InputFieldDecorator(pwd, "input-with-enter-action", function() {
	self.logon(name, pwd.value, pwd);
    });
    label.appendChild(pwd);

    this.registerEventListeners(name, label, pwd);
    return label;
}

/**
 * registriere alle EventListener für ein AccountLabel
 */
LogonDialog.prototype.registerEventListeners = function(name, label, pwdField) {
    
    var self = this;

    // onEnter
    pwdField.addEventListener("keyup", function(evt) {
	if (evt.keyCode == 13) {
	    self.logon(name, pwdField.value, pwdField);
	}
    });

    pwdField.addEventListener("focus", function(evt) {
	pwdField.select();
    });

    // label-klick
    label.addEventListener("click", function() {
	pwdField.value = "",
	pwdField.focus();
    });
}

/**
 * 
 * @param userId
 * @param passwd
 */
LogonDialog.prototype.logon = function(userId, passwd, inputField) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case 'login-user-ok-response':
	    MainNavigation.showHomeScreen();
	    break;

	case 'error-response':
	    var msg = rsp.getElementsByTagName("msg")[0].textContent;
	    new ToolTip(inputField, ToolTip.warningIcon, msg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var msg = MessageCatalog.getMessage("LOGIN_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, "", msg);
    }

    var req = XmlUtils.createDocument("login-user-request");
    XmlUtils.setNode(req, "uid", userId);
    XmlUtils.setNode(req, "passwd", passwd);
    caller.invokeService(req);

}