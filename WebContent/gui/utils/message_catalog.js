var MessageCatalog = (function() {

    var catalog = {

	LOAD_MEMBEROVERVIEW_ERROR_TITLE : "Fehler beim laden der Team-Übersicht",
	LOAD_MEMBEROVERVIEW_ERROR : "Beim laden der Team-Übersicht ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	LOAD_MEMBEROVERVIEW_TECH_ERROR : "Beim laden der Team-Übersicht ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

	SAVE_MEMBER_ERROR_TITLE : "Fehler beim speichern des Team-Mitglieds",
	SAVE_MEMBER_ERROR : "Beim speichern des Team-Mitglieds ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	SAVE_MEMBER_TECH_ERROR : "Beim speichern des Team-Mitglieds ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

    }

    return {

	getMessage : function(msgId) {

	    var fmt = catalog[msgId];
	    if (typeof (fmt) == "undefined") {
		fmt = msgId;
	    }

	    var args = arguments;
	    return fmt.replace(/{(\d+)}/g, function(match, number) {
		return typeof args[number] != 'undefined' ? args[number] : "(nicht definiert)";
	    });
	}
    }
})();