/**
 * 
 */
var WorkSpace = (function() {

    // Keine ContextMenus!
//    document.body.addEventListener("contextmenu", function(evt) {
//	evt.preventDefault();
//	evt.stopPropagation();
//    }, false);

    // prevent touchmove!
    document.body.addEventListener("touchmove", function(evt) {

	evt.preventDefault();
	evt.stopPropagation();
    }, false);

    menuIcon = document.getElementById("main-view-menu-icon");
    menuIcon.addEventListener("click", function() {
	MainMenu.show();
    });

    var frames = [];

    return {

	/**
	 * 
	 */
	setTitle : function(text) {
	    document.getElementById("workspace-title-text").textContent = text;
	},

	/**
	 * 
	 */
	addFrame : function(frame) {

	    frames.push(frame);
	    var wsBody = document.getElementById("workspace-body");
	    wsBody.appendChild(frame.frame);
	    frame.activate();
	},

	/**
	 * 
	 */
	removeFrame : function(frame) {

	    var idx = frames.indexOf(frame);
	    if (idx != -1) {
		frames.splice(idx, 1);
	    }
	    if (frames.length) {
		frames[frames.length - 1].activate();
	    }
	    UIUtils.removeElement(frame.frame);
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

		self.footer = self.createActionBar();
		self.frame.insertBefore(self.footer, self.body);

		self.frame.addEventListener("keyup", function(evt) {
		    if (evt.keyCode == 27) {
			self.close();
		    }
		});

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
WorkSpaceFrame.prototype.createActionBar = function() {

    var header = document.createElement("div");
    header.className = "workspace-frame-actionbar";

    var self = this;
    if (this.hasCloseButton()) {
	this.closeButton = new WorkSpaceActionButton("gui/images/go-back.svg", "Zurück", function() {
	    self.close();
	});
	header.appendChild(this.closeButton.ui);
    }

    if (this.hasSaveButton()) {
	this.saveButton = new WorkSpaceActionButton("gui/images/save.svg", "Speichern", function() {
	    self.save();
	});
	header.appendChild(this.saveButton.ui);
    }

    this.toolBox = this.createToolBox();
    header.appendChild(this.toolBox);
    return header;
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
WorkSpaceFrame.prototype.createToolButton = function(imgUrl, title, onclick) {

    var btn = new WorkSpaceActionButton(imgUrl, title, onclick);
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
    WorkSpace.removeFrame(this);
}

/**
 * 
 */
WorkSpaceFrame.prototype.save = function() {

    if (this.validate()) {
	if (this.onSave) {
	    this.onSave();
	}
	UIUtils.removeElement(this.frame);
    }
}

/**
 * 
 */
WorkSpaceFrame.prototype.validate = function() {

    var val = new Validator();
    return val.validate(this.body);
}

/**
 * 
 */
WorkSpaceFrame.prototype.activate = function() {

    if (this.onActivate) {
	this.onActivate();
    }

    var title = (this.getTitle) ? this.getTitle() : "getTitle nicht implementiert!";
    WorkSpace.setTitle(title);

    var annotations = this.getAnnotations();
    MainMenu.enableLogin(annotations.disableLogin != "yes");
    MainMenu.enablePwdChange(annotations.disablePwdChange != "yes");
    MainMenu.enableAdmin(annotations.disableAdmin != "yes");
}

/*---------------------------------------------------------------------------*/
var WorkSpaceActionButton = function(imgUrl, title, onclick) {

    this.ui = document.createElement("div");
    this.ui.className = "workspace-frame-action";
    this.ui.title = title;

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
 * 
 */
WorkSpaceActionButton.prototype.click = function(val) {

    this.ui.click();
}

/**
 * 
 */
var NavigationButton = function(text, iconURL, onclick) {

    var img = document.createElement("img");
    img.src = iconURL;

    var label = document.createElement("div");
    label.textContent = text;

    var btn = document.createElement("div");
    btn.className = "navigation-button";
    btn.appendChild(img);
    btn.appendChild(label);

    btn.addEventListener("click", function() {
	onclick();
    });
    return btn;
}

/**
 * Das MainMenu
 */
var MainMenu = (function() {

    UIUtils.getElement("main-menu-content").addEventListener("blur", function() {
	UIUtils.addClass("main-menu-content", "hidden");
    });

    var loginEnabled = false;
    var chgPwdEnabled = false;
    var adminEnabled = false;

    /**
     * 
     */
    var createMenuEntry = function(text, onclick) {

	var entry = document.createElement("div");
	entry.className = "main-menu-item";
	entry.textContent = text;
	entry.addEventListener("click", function() {
	    MainMenu.hide();
	    onclick();
	});
	return entry;
    }

    /**
     * 
     */
    var showLoggedIn = function() {

	var content = UIUtils.getElement("main-menu-content");

	if (loginEnabled) {
	    content.appendChild(createMenuEntry("Abmelden", function() {
		SessionManager.logout();
	    }));
	}

	if (chgPwdEnabled) {
	    content.appendChild(createMenuEntry("Kennwort ändern", function() {
		new ChangePasswordView();
	    }));
	}

	if (adminEnabled) {
	    content.appendChild(document.createElement("hr"));
	    content.appendChild(createMenuEntry("Administration", function() {
		new AdminView();
	    }));
	}
//
//	content.appendChild(document.createElement("hr"));
//	content.appendChild(createMenuEntry("Dokumentation", function() {
//	    window.open("user_manual.pdf");
//	}));

	UIUtils.removeClass(content, "hidden");
	content.focus();
    }

    /**
     * 
     */
    var showLoggedOut = function() {

	var content = UIUtils.getElement("main-menu-content");
	if (loginEnabled) {

	    content.appendChild(createMenuEntry("Anmelden", function() {
		new LoginView();
	    }));
	}

//	content.appendChild(document.createElement("hr"));
//	content.appendChild(createMenuEntry("Dokumentation", function() {
//	    window.open("user_manual.pdf");
//	}));

	UIUtils.removeClass(content, "hidden");
	content.focus();
    }

    return {

	/**
	 * 
	 */
	enableLogin : function(val) {
	    loginEnabled = val;
	},

	/**
	 * 
	 */
	enablePwdChange : function(val) {
	    chgPwdEnabled = val;
	},

	/**
	 * 
	 */
	enableAdmin : function(val) {
	    adminEnabled = val;
	},

	/**
	 * 
	 */
	show : function() {
	    UIUtils.clearChilds("main-menu-content");
	    SessionManager.checkSessionState(showLoggedIn, showLoggedOut);
	},

	/**
	 * 
	 */
	hide : function() {
	    var content = UIUtils.getElement("main-menu-content");
	    UIUtils.addClass(content, "hidden");
	}
    }
})();
