var SessionManager = (function() {

    return {

	logout : function() {

	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		SessionManager.checkSessionState();
	    }
	    caller.invokeService(XmlUtils.createDocument("logout-request"));
	},
	
	checkSessionState : function() {
	    
	    var self = this;
	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		switch (rsp.documentElement.nodeName) {
		case 'get-session-state-loggedin-response':
		    self.onLoggedIn(rsp);
		    break;

		case 'get-session-state-loggedout-response':
		    self.onLoggedOut();
		    break;
		}
	    }

	    var req = XmlUtils.createDocument("get-session-state-request");
	    caller.invokeService(req);
	},
	
	onLoggedIn : function(rsp) {
	    
	    MainNavigation.showHomeScreen();
	},
	
	onLoggedOut : function() {
	    new LogonDialog();
	}
    }
})();