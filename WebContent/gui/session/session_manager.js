/**
 * 
 */
var SessionManager = (function() {

    var uid = -1;
    zname = null;
    vname = null;

    /**
     * 
     */
    var handleLoggedOutResponse = function(rsp, onLoggedOutCallback) {
	uid = -1;
	zname = null;
	vname = null;
	if (onLoggedOutCallback) {
	    onLoggedOutCallback();
	}
    }

    /**
     * 
     */
    var handleLoggedOnResponse = function(rsp, onLoggedOnCallback) {
	uid = -1;
	zname = null;
	vname = null;
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
	}
    }
})();