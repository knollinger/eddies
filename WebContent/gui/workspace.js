/**
 * 
 */
var WorkSpace = (function() {

    wsBody = document.getElementById("workspace-body");
    menuIcon = document.getElementById("main-view-menu-icon");

    menuIcon.addEventListener("click", function() {
	MainMenu.show();
    });

    return {

	addFrame : function(frame) {

	    wsBody.appendChild(frame.frame);
	}
    }
})();

/**
 * 
 */
var WorkSpaceFrame = function(url, onload) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.frame = document.createElement("div");
		self.frame.className = "workspace-frame";

		self.body = document.createElement("div");
		self.body.className = "workspace-frame-body";
		self.body.innerHTML = req.responseText;
		self.frame.appendChild(self.body);

		if (self.hasFooter()) {

		    self.footer = self.createFooter();
		    self.frame.appendChild(self.footer);
		}

		WorkSpace.addFrame(self);
		if (onload) {
		    onload(self);
		}
	    }
	}
    }
    req.send();
}

/**
 * 
 */
WorkSpaceFrame.prototype.createFooter = function() {

    var footer = document.createElement("div");
    footer.className = "workspace-frame-footer";

    var self = this;
    if (this.hasCloseButton()) {
	this.closeButton = new WorkSpaceActionButton("gui/images/go-back.svg", function() {
	    self.close();
	});
	footer.appendChild(this.closeButton.ui);
    }
    
    if (this.hasSaveButton()) {
	this.saveButton = new WorkSpaceActionButton("gui/images/save.svg", function() {
	    self.save();
	});
	footer.appendChild(this.saveButton.ui);
    }
    
    this.toolBox = this.createToolBox();
    footer.appendChild(this.toolBox);
    return footer;
}

/**
 * 
 */
WorkSpaceFrame.prototype.hasFooter = function() {

    return this.hasCloseButton() || this.hasSaveButton();
}

/**
 * 
 */
WorkSpaceFrame.prototype.hasCloseButton = function() {

    return this.getAnnotations().hasBackButton === "yes";
}

/**
 * 
 */
WorkSpaceFrame.prototype.hasSaveButton = function() {

    return this.getAnnotations().hasSaveButton === "yes";
}

/**
 * 
 */
WorkSpaceFrame.prototype.enableSaveButton = function(val) {

    if (this.saveButton) {

	if (val === false) {
	    this.saveButton.hide();
	} else {
	    this.saveButton.show();
	}
    }
}

/**
 * 
 */
WorkSpaceFrame.prototype.createToolBox = function() {

    var result = document.createElement("div");
    result.className = "workspace-frame-toolbox";
    return result;
}

/**
 * 
 */
WorkSpaceFrame.prototype.createToolButton = function(imgUrl, onclick) {

    var btn = new WorkSpaceActionButton(imgUrl, onclick);
    this.toolBox.appendChild(btn.ui);
    return btn;
}

/**
 * 
 */
WorkSpaceFrame.prototype.getAnnotations = function() {

    var result = {};

    var annotations = this.body.getElementsByClassName("annotations")[0];
    if (annotations) {
	result = annotations.dataset;
    }
    return result;
}

/**
 * 
 */
WorkSpaceFrame.prototype.close = function() {

    if (this.onClose) {
	this.onClose();
    }
    UIUtils.removeElement(this.frame);
}

/**
 * 
 */
WorkSpaceFrame.prototype.save = function() {

    var val = new Validator();
    if (val.validate(this.body)) {
	if (this.onSave) {
	    this.onSave();
	}
	UIUtils.removeElement(this.frame);
    }
}

/*---------------------------------------------------------------------------*/
var WorkSpaceActionButton = function(imgUrl, onclick) {
    
    this.ui = document.createElement("div");
    this.ui.className = "workspace-frame-action";

    var img = document.createElement("img");
    img.src = imgUrl;
    this.ui.appendChild(img);

    this.ui.addEventListener("click", onclick);
}

/**
 * 
 */
WorkSpaceActionButton.prototype.show = function(val) {

    UIUtils.removeClass(this.ui, "hidden");
}

/**
 * 
 */
WorkSpaceActionButton.prototype.hide = function(val) {

    UIUtils.addClass(this.ui, "hidden");
}

/**
 * Das MainMenu
 */
var MainMenu = (function() {

    var content = document.getElementById("main-menu-content");
    var login = document.getElementById("main-menu-login");
    var logout = document.getElementById("main-menu-logout");
    var changePwd = document.getElementById("main-menu-change-pwd");
    var goAdmin = document.getElementById("main-menu-admin");

    content.addEventListener("blur", function() {
	MainMenu.hide();
    });

    content.addEventListener("keydown", function(evt) {
	if (evt.keyCode == 27) {
	    MainMenu.hide();
	}
    });

    login.addEventListener("click", function() {
	MainMenu.hide();
	new LoginView();
    });

    logout.addEventListener("click", function() {
	MainMenu.hide();
	SessionManager.logout();
    });

    changePwd.addEventListener("click", function() {
	MainMenu.hide();
	new ChangePasswordView();
    });

    goAdmin.addEventListener("click", function() {
	MainMenu.hide();
	new AdminView();
    });

    /**
     * 
     */
    var showLoggedIn = function() {
	UIUtils.addClass(login, "hidden");
	UIUtils.removeClass(logout, "hidden");
	UIUtils.removeClass(changePwd, "hidden");
	UIUtils.removeClass(goAdmin, "hidden");
	UIUtils.removeClass(content, "hidden");
	content.focus();
    }

    /**
     * 
     */
    var showLoggedOut = function() {
	UIUtils.removeClass(login, "hidden");
	UIUtils.addClass(logout, "hidden");
	UIUtils.addClass(changePwd, "hidden");
	UIUtils.addClass(goAdmin, "hidden");
	UIUtils.removeClass(content, "hidden");
	content.focus();
    }

    return {

	show : function() {
	    SessionManager.checkSessionState(showLoggedIn, showLoggedOut);
	},

	hide : function() {
	    UIUtils.addClass(content, "hidden");
	}
    }
})();
