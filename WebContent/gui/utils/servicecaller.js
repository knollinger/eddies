/**
 * Der ServiceCaller abstrahiert den XHR-Zugriff
 */
function ServiceCaller() {

    /**
     * der Callback, welcher bei Erfolg aufgerufen wird. Die Funktion muss als
     * ersten Parameter das ResponseXML-Dokument erwarten. Optional wird als
     * zweiter Parameter das originale Request-Objekt uebergeben
     */
    this.onSuccess = null;

    /**
     * der Callback, welcher bei einem HTTP-Responsecode != 200 aufgerufen wird.
     * Die Funktion muss als ersten Parameter das XMLDocument des Requests
     * erwarten, als zweiter Parameter wird der HTTP-ResponseCode uebergeben
     */
    this.onError = null;

    /**
     * Ruft den ServiceProvider. Bei Erfolg wird der Callback onSuccess gerufen
     * (sofern definiert), bei einem HTTPStatus != 200 wird der Callback onError
     * aufgerufen (sofern definiert)
     * 
     * @param request
     *                das XMLDocument, welches den Request beschreibt
     */
    this.invokeService = function(request) {

	BusyIndicator.show();

	var self = this;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "xmlservice", true);
	xhr.onreadystatechange = function(evt) {

	    if (xhr.readyState == XMLHttpRequest.prototype.DONE) {

		BusyIndicator.hide();

		switch (xhr.status) {
		case 0:
		    var title = MessageCatalog.getMessage("SVCCALLER_TITLE_ERROR");
		    var msg = MessageCatalog.getMessage("SVCCALLER_MSG_CONNECTION_LOST");
		    new MessageBox(MessageBox.ERROR, title, msg);
		    break;

		case 200:

		    var response = xhr.responseXML;
		    if (response != null && response.documentElement.nodeName == "session-lost-response") {

			var title = MessageCatalog.getMessage("SVCCALLER_TITLE_ERROR");
			var msg = MessageCatalog.getMessage("SVCCALLER_MSG_SESSION_LOST");
			new MessageBox(MessageBox.ERROR, title, msg, function() {
			    new LoginView();
			});
		    } else {
			if (self.onSuccess != null) {
			    self.onSuccess(response);
			}
		    }
		    break;

		default:
		    if (self.onError != null) {
			self.onError(request, xhr.status);
		    }
		}
	    }
	}

	xhr.onerror = function(evt) {
	    // var title = Messages.getMessage("SVCCALLER_TITLE_ERROR");
	    // var msg = Messages.getMessage("SVCCALLER_MSG_TECH_ERROR");
	    // MessageBox.showWarningMsg(title, msg);
	    BusyIndicator.hide();
	}
	xhr.send(XmlUtils.stringify(request));
    }
}