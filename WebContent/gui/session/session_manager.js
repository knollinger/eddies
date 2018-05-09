/**
 * 
 */
var SessionManager = (function() {

    var model = null;

    return {

	/**
	 * 
	 */
	logout : function() {

	    model = null;
	    new ServiceCaller().invokeService(XmlUtils.createDocument("logout-request"));
	    window.location = "index.html";
	},

	/**
	 * 
	 */
	checkSessionState : function(onLoggedIn, onLoggedOut) {

	    var self = this;
	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		switch (rsp.documentElement.nodeName) {
		case 'get-session-state-loggedin-response':
		    model = new Model(rsp);
		    if (onLoggedIn) {
			onLoggedIn();
		    }
		    break;

		case 'get-session-state-loggedout-response':
		    model = null;
		    if (onLoggedOut) {
			onLoggedOut();
		    }
		    break;
		}
	    }

	    var req = XmlUtils.createDocument("get-session-state-request");
	    caller.invokeService(req);
	},

	/**
	 * 
	 */
	hasSession : function() {
	    return model != null;
	},

	/**
	 * @return true, wenn der aktuell angemeldete Benutzer
	 *         Administrations-Berechtigungen hat
	 */
	isAdmin : function() {
	    return model.getValue("//get-session-state-loggedin-response/role") === "ADMIN";
	},

	/**
	 * @return true, wenn die übergebene memberId meiner eigenen entspricht.
	 */
	isMee : function(memberId) {
	    return model.getValue("//get-session-state-loggedin-response/id") == memberId;
	}
    }
})();