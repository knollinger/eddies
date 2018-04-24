/**
 * 
 */var WorkSpace = (function() {

    var wsBody = document.getElementById("workspace-body");
    var menuIcon = document.getElementById("main-view-menu-icon");
    menuIcon.addEventListener("click", function() {
	MainMenu.show();
    });

    return {

	addFrame : function(frame) {

	    wsBody.appendChild(frame.content);
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

		self.content = document.createElement("div");
		self.content.className = "workspace-frame";
		self.content.innerHTML = req.responseText;
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
WorkSpaceFrame.prototype.close = function() {

    UIUtils.removeElement(this.content);
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
    });

    goAdmin.addEventListener("click", function() {
	MainMenu.hide();
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
