/**
 * Der FilePicker dient dazu, einem beliebigen DOM-Element die Möglichkeit zur
 * Datei-Auswahl hinzu zu fügen.
 * 
 * Wenn nach der Instanzierung auf das DOM-Element geklickt wird, so wird der
 * Datei-AUswahl-Dialog der aktuellen Plattform angezeigt. Sofern dort eine
 * Datei ausgewählt wurde und der onSelect-Callback im Konstruktor definiert
 * ist, so wird der Callback mit folgenden Argumenten aufgerufen:
 * 
 * <ul>
 * <li>dateiname</li>
 * <li>mime-type</li>
 * <li>der base64-encodierte Datei-Inhalt</li>
 * </ul>
 */
var FilePicker = function(anchor, onSelect) {

    this.anchor = UIUtils.getElement(anchor);
    this.onSelect = onSelect;

    var picker = document.createElement("input");
    picker.type = "file";
    UIUtils.addClass(picker, "hidden");
    this.anchor.appendChild(picker);
    this.anchor.addEventListener("click", function() {
	picker.click();
    });

    var self = this;
    picker.addEventListener("change", function(evt) {

	self.handleSelection(picker);
    });
}

/**
 * Die maximale Datei-Größe die wir akzeptieren. 16MB
 */
FilePicker.maxFileSize = 16;

/**
 * Callback für die Auswahl einer Datei
 */
FilePicker.prototype.handleSelection = function(picker) {

    var file = picker.files[0];
    var name = file.name;
    var type = file.type;
    var size = parseInt(file.size / (1024 * 1024));
    if (size > FilePicker.maxFileSize) {

	var title = MessageCatalog.getMessage("UPLOD_TOO_BIG_TITLE");
	var messg = MessageCatalog.getMessage("UPLOD_TOO_BIG", name, size, FilePicker.maxFileSize);
	new MessageBox(MessageBox.ERROR, title, messg);
    } else {

	var self = this;
	var reader = new FileReader();
	reader.onloadstart = function() {
	    BusyIndicator.show();
	}
	reader.onload = function(evt) {

	    BusyIndicator.hide();
	    if (self.onSelect) {
		// var data = btoa(evt.target.result);
		// self.onSelect(name, type, data);

		var binary = "";
		var bytes = new Uint8Array(reader.result);
		var length = bytes.byteLength;
		for (var i = 0; i < length; i++) {
		    binary += String.fromCharCode(bytes[i]);
		}
		var data = btoa(binary);
		self.onSelect(name, type, data);
	    }
	};
	// reader.readAsBinaryString(file);
	reader.readAsArrayBuffer(file);
    }
}