var MessageCatalog = (function() {

    var catalog = {

	LOGIN_ERROR_TITLE : "Fehler bei der Anmeldung",
	LOGIN_ERROR : "Bei der Anmeldung ist ein Fehler aufgetreten.<br><br>{1}",
	LOGIN_TECH_ERROR : "Bei der Anmeldung ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

	SVCCALLER_TITLE_ERROR : "Fehler bei der Server-Kommunikation",
	SVCCALLER_MSG_SESSION_LOST : "Deine Server-Sitzung ist abgelaufen, bitte melde Dich erneut an",
	SVCCALLER_MSG_CONNECTION_LOST : "Der Server ist nicht erreichbar.<br><br>Bitte prüfe Deine Internet-Verbindung",
	
	PWDCHANGE_ERROR_TITLE : "Fehler beim Kennwort-Wechsel",
	PWDCHANGE_ERROR : "Beim &Auml;ndern des Kennworts ist ein Fehler aufgetreten.<br><br>{1}",
	PWDCHANGE_TECH_ERROR : "Beim &Auml;ndern des Kennworts ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

	LOAD_MEMBEROVERVIEW_ERROR_TITLE : "Fehler beim laden der Team-Übersicht",
	LOAD_MEMBEROVERVIEW_ERROR : "Beim laden der Team-Übersicht ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	LOAD_MEMBEROVERVIEW_TECH_ERROR : "Beim laden der Team-Übersicht ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

	SAVE_MEMBEROVERVIEW_ERROR_TITLE : "Fehler beim speichern der Team-Übersicht",
	SAVE_MEMBEROVERVIEW_ERROR : "Beim speichern der Team-Übersicht ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	SAVE_MEMBEROVERVIEW_TECH_ERROR : "Beim speichern der Team-Übersicht ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

	REMOVE_MEMBER_TITLE : "Bist Du sicher?",
	REMOVE_MEMBER_QUERY : "M&ouml;chtest Du dieses Team-Mitglied <b>und alle seine Termine</b> wirklich l&ouml;schen?<br><br>Dieser Vorgang kann nicht r&uuml;ckg&auml;ngig gemacht werden!",

	GET_CALENDER_ERROR_TITLE : "Fehler beim laden des Kalenders",
	GET_CALENDER_ERROR : "Beim laden des Kalenders ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	GET_CALENDER_TECH_ERROR : "Beim laden des Kalenders ist ein technischer Fehler aufgetreten.. Der Server antwortete mit dem Status-Code {1}",

	REMOVE_KEEPER_TITLE : "Bist Du sicher?",
	REMOVE_KEEPER_QUERY : "M&ouml;chtest Du den Theki wirklich aus diesem Termin entfernen ?",

	LOAD_OPENING_HOURS_MODEL_ERROR_TITLE : "Fehler beim laden der Standart-&Ouml;ffnungszeiten",
	LOAD_OPENING_HOURS_MODEL_ERROR : "Beim laden der &Ouml;ffnungszeiten ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	LOAD_OPENING_HOURS_MODEL_TECH_ERROR : "Beim laden der &Ouml;ffnungszeiten ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

	SAVE_OPENING_HOURS_MODEL_ERROR_TITLE : "Fehler beim speichern der Standart-&Ouml;ffnungszeiten",
	SAVE_OPENING_HOURS_MODEL_ERROR : "Beim speichern der &Ouml;ffnungszeiten ist ein Fehler aufgetreten. Der Server antwortete mit:<br>{1}",
	SAVE_OPENING_HOURS_MODEL_TECH_ERROR : "Beim speichern der &Ouml;ffnungszeiten ist ein technischer Fehler aufgetreten. Der Server antwortete mit dem Status-Code {1}",

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