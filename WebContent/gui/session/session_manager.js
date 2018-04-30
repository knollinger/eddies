/**
 * 
 */
var SessionManager = (function() {

    var model = null;

    /**
     * 
     */
    var handleLoggedOutResponse = function(rsp, onLoggedOutCallback) {
	model = null;
	if (onLoggedOutCallback) {
	    onLoggedOutCallback();
	}
    }

    /**
     * 
     */
    var handleLoggedOnResponse = function(rsp, onLoggedOnCallback) {
	
	model = new Model(rsp);
	if (onLoggedOnCallback) {
	    onLoggedOnCallback();
	}
    }

    return {

	/**
	 * 
	 */
	logout : function() {

	    var caller = new ServiceCaller();
	    caller.invokeService(XmlUtils.createDocument("logout-request"));
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
		    handleLoggedOnResponse(rsp, onLoggedIn);
		    break;

		case 'get-session-state-loggedout-response':
		    handleLoggedOutResponse(rsp, onLoggedOut);
		    break;
		}
	    }

	    var req = XmlUtils.createDocument("get-session-state-request");
	    caller.invokeService(req);
	},
	
	getSessionModel : function() {
	    return model;
	}
    }
})();