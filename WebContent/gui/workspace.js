/**
 * 
 */
var WorkSpace = (function() {

    var wsBody = document.getElementById("workspace-body");
    var menuIcon = document.getElementById("main-view-menu-icon");
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
	footer.appendChild(this.createFooterBtn("gui/images/go-back.svg", function() {
	    self.close();
	}));
    }
    if (this.hasSaveButton()) {
	footer.appendChild(this.createFooterBtn("gui/images/save.svg", function() {
	    self.save();
	}));
    }
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
WorkSpaceFrame.prototype.createFooterBtn = function(imgUrl, onclick) {

    var btn = document.createElement("div");
    btn.className = "workspace-frame-action";

    var img = document.createElement("img");
    img.src = imgUrl;
    btn.appendChild(img);

    btn.addEventListener("click", onclick);
    return btn;
}

/**
 * 
 */
WorkSpaceFrame.prototype.getAnnotations = function() {

    result = {};

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

    if(this.onClose) {
	this.onClose();
    }
    UIUtils.removeElement(this.frame);
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
