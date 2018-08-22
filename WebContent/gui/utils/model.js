/**
 * 
 */
var Model = function(xmlDocument) {

    this.xmlDocument = xmlDocument;
    if (window.ActiveXObject) {
	this.xmlDocument.setProperty("SelectionLanguage", "XPath");
    }
    this.hasChanged = false;

    var self = this;
    this.addChangeListener("/", function() {
	self.hasChanged = true;
    });
}

/**
 * 
 * @returns
 */
Model.prototype.getDocument = function() {

    return this.xmlDocument;
}

/**
 * Convinience-Methode, um ein AttributeBinding mit dem Value eines HtmlTags zu
 * erzeugen
 * 
 * @param htmlTag
 * @param xPath
 * @param eventName
 *                optional, wenn nicht angegeben wird ein defaultEventName
 *                verwendet. Siehe getHtmlEventType *
 * @param toXml
 *                optional. Wenn angegeben wird die FUnktion mit dem inhalt des
 *                html aufgerufen und das ergebniss in die xmlNode gestellt.
 *                Anderenfalls wird der html-value direkt in das xml gestellt
 * @param fromXml
 *                optional. analog toXml, nur in der gegenrichting
 * 
 */
Model.prototype.createValueBinding = function(htmlTag, xPath, eventName, toXml, fromXml) {

    this.createAttributeBinding(htmlTag, "value", xPath, eventName, toXml, fromXml);
}

/**
 * Convinience-Methode, um ein ValueBinding mit dem Value eines
 * Currency-HtmlTags zu erzeugen
 * 
 * @param htmlTag
 * @param xPath
 * @param eventName
 *                optional, wenn nicht angegeben wird ein defaultEventName
 *                verwendet. Siehe getHtmlEventType *
 */
Model.prototype.createCurrencyValueBinding = function(htmlTag, xPath, eventName) {

    this.createCurrencyAttributeBinding(htmlTag, "value", xPath, eventName);
}

/**
 * Convinience-Methode, um ein ValueBinding mit dem Value eines
 * Currency-HtmlTags zu erzeugen
 * 
 * @param htmlTag
 * @param xPath
 * @param eventName
 *                optional, wenn nicht angegeben wird ein defaultEventName
 *                verwendet. Siehe getHtmlEventType *
 */
Model.prototype.createCurrencyAttributeBinding = function(htmlTag, attr, xPath, eventName) {

    var toXml = function(val) {
	return CurrencyUtils.parseCurrency(val);
    }
    var fromXml = function(val) {
	return CurrencyUtils.formatCurrency(val);
    }

    this.createAttributeBinding(htmlTag, attr, xPath, eventName, toXml, fromXml);
}

/**
 * Erzeugt ein Bindung zwischen dem textContent eines XMLNodes im Model und dem
 * angegebenen Attribute eines HTML-Objektes. Beim erstellen des Bindings wird
 * der aktuelle textContent aus der xmlNode als attributeValue in das
 * Html-Objekt gesetzt.
 * 
 * Sollte sich das Attribute ändern, so wird der XmlNode geändert. In diesem
 * Fall feuert die XmlNode ein Change-Event.
 * 
 * Ändert sich der XmlValue, so wird das Attribute des HtmlTags geändert
 * 
 * @param htmlTag
 * @attribute das zu bindende Attribute
 * @param xPath
 * @param eventName
 *                optional, wenn nicht angegeben wird ein defaultEventName
 *                verwendet. Siehe getHtmlEventType
 * @param toXml
 *                optional. Wenn angegeben wird die FUnktion mit dem inhalt des
 *                html aufgerufen und das ergebniss in die xmlNode gestellt.
 *                Anderenfalls wird der html-value direkt in das xml gestellt
 * @param fromXml
 *                optional. analog toXml, nur in der gegenrichting
 */

Model.prototype.createAttributeBinding = function(htmlTag, attribute, xPath, eventName, toXml, fromXml) {

    var self = this;
    var xml = XmlUtils.evaluateXPath(this.xmlDocument, xPath);
    if (xml.length == 0) {
	console.log("xpath '" + xPath + "' not found. binding will not work.");
    } else {

	xml = xml[0];
	var html = UIUtils.getElement(htmlTag);
	if (!html) {
	    console.log("html tag '" + html + "' not found. binding will not work.");
	} else {

	    html[attribute] = (fromXml) ? fromXml(xml.textContent) : xml.textContent;
	    var evtName = eventName || this.getHtmlEventType(html);
	    if (evtName) {

		html.addEventListener(evtName, function() {

		    var newVal = (toXml) ? toXml(html[attribute]) : html[attribute];
		    if (xml.textContent != newVal) {
			xml.textContent = newVal;
			xml.removeAttribute("xsi:nil");
			self.fireXmlEvent(xml);
		    }
		});
	    }
	}

	xml.addEventListener("change", function() {

	    var newVal = (fromXml) ? fromXml(xml.textContent) : xml.textContent;
	    if (html[attribute] != newVal) {
		html[attribute] = newVal;
	    }
	});
    }
}

/**
 * Erzeugt ein Binding zwischen dem TableBody-Content und allen durch den
 * gegebenen XPath referenzierten XMLElementen. Für jedes gefundene XMLElement
 * wird eine tr im body der Tabelle angelegt.
 * 
 * @param table
 * @param fields
 * @param xPath
 * @param onclick
 *                optional. Wenn angegeben, dann wird beim Klick auf die
 *                Tabellenzeile diese Funktion aufgerufen. Als Parameter werden
 *                die tr und das xmlElement übergeben.
 * @param filter
 *                optional. Wenn angegeben wird der filter als Function mit dem
 *                aktuellen xmlElement aufgerufen. Liefert die Funktion true, so
 *                wird eine Tabellenzeile für das Element generiert
 */
Model.prototype.createTableBinding = function(table, fields, xPath, onclick, filter) {

    var tab = UIUtils.getElement(table);
    var xml = XmlUtils.evaluateXPath(this.xmlDocument, xPath);
    if (tab && xml) {

	tab = tab.getElementsByTagName("tbody")[0] || table;
	if (tab) {

	    UIUtils.clearChilds(tab);
	    for (var i = 0; i < xml.length; i++) {

		if (!filter || filter(xml[i])) {
		    var row = this.createTableRow(xml[i], fields, onclick);
		    tab.appendChild(row);
		}
	    }
	}
    }
}

/**
 * Erzeugt eine einzelne Tabellenzeile.
 * 
 * Die Columns für die Row werden aus dem jeweiligen Element in der durch das
 * Array fields definierten Order ausgewählt. In diesem Array können einfach
 * ElementNamen bzgl des RowElements stehen oder auch Funktionen. Sollte ein
 * ArrayMember eine Funktion sein, so wird diese mit dem XMLElement als Argument
 * aufgerufen. Ihr Rückgabewert wird dann in die Zelle gestellt.
 * 
 * Sollte der optionale Parameter onclick gesetzt sein, so wird ein
 * EventListener auf die Row gesetzt. Dieser ruft beim Click auf die TR die
 * onclick-Funktion auf.
 * 
 * Auf das XMLElement wird ein CHangeListener gesetzt. Sollte dieser aufgerufen
 * werden, so wird die TR neu generiert. Dies ist besonders beim Aufruf von
 * Editoren im onClick interessant, welche den Content der TR latent verändern
 * können.
 * 
 * @param xmlNode
 *                die referenz auf das aktuelle xmlElement
 * @param fields
 *                das Array der zu visualisierenden Spalten der TR
 * @param onclick
 *                optional - wenn gesetzt, wird die Funktion mit der TR und der
 *                aktuellen XMLNode als Argumente aufgerufen
 */
Model.prototype.createTableRow = function(xmlNode, fields, onclick) {

    var row = document.createElement("tr");
    row.tabIndex = "-1";
    for (var i = 0; i < fields.length; i++) {

	var cell = document.createElement("td");
	var field = fields[i];
	var value = this.getNodeValue(xmlNode, fields[i], cell);

	this.fillTableCell(cell, value);
	row.appendChild(cell);
    }

    if (onclick) {

	var self = this;
	row.addEventListener("click", function(evt) {

	    var target = evt.target;
	    if (target.tagName != "INPUT" && target.type != "radio" && target.type != "checkbox") {
		self.handleRadioInputs(row);
	    }
	    onclick(row, xmlNode);
	});
    }
    return row;
}

/**
 * 
 */
Model.prototype.handleRadioInputs = function(row) {

    var allInputs = row.querySelectorAll("input");
    for (var i = 0; i < allInputs.length; i++) {
	switch (allInputs[i].type) {
	case "radio":
	    allInputs[i].checked = true;
	    break;

	case "checkbox":
	    allInputs[i].checked = !allInputs[i].checked;
	    break;
	}
    }
}

/**
 * fill a cell
 */
Model.prototype.fillTableCell = function(cell, value) {

    value = value || "";
    if (typeof value == "string") {
	cell.textContent = value;
    } else {
	if (!Array.isArray(value)) {
	    cell.appendChild(value);
	} else {
	    for (var i = 0; i < value.length; i++) {
		this.fillTableCell(cell, value[i]);
	    }
	}
    }
}

/**
 * 
 * @param xPath
 */
Model.prototype.evaluateXPath = function(xPath) {

    return XmlUtils.evaluateXPath(this.xmlDocument, xPath);
}

/**
 * 
 * @param node
 * @param field
 */
Model.prototype.getNodeValue = function(xmlNode, field, cell) {

    if (typeof field == 'function') {
	return field(cell, xmlNode);
    }

    var elem = xmlNode.getElementsByTagName(field)[0];
    return (elem) ? elem.textContent : "";
}

/**
 * 
 * @param xPath
 * @returns
 */
Model.prototype.getValue = function(xPath) {

    var cnr = this.evaluateXPath(xPath)[0];
    if (cnr) {
	return cnr.textContent;
    }
    return null;
}

/**
 * 
 * @param xPath
 * @param value
 */
Model.prototype.setValue = function(xPath, value) {

    var cnr = this.evaluateXPath(xPath)[0];
    if (cnr) {
	cnr.textContent = value;
	this.fireXmlEvent(cnr);
    }
}

/**
 * 
 * @param xPath
 * @elemName
 * @param value
 */
Model.prototype.addValue = function(xPath, elemName, value) {

    var cnr = this.evaluateXPath(xPath)[0];
    if (cnr) {

	var node = this.xmlDocument.createElement(elemName);
	node.textContent = value;
	cnr.appendChild(node);
	this.fireXmlEvent(cnr);
    }
}

/**
 * Erzeuge eine neue Node, füge sie aber noch nicht zum Model hinzu
 * 
 * @param name
 *                der NodeName
 * @param textContent
 *                optional, wenn angegeben, wird dieser als der TextContent der
 *                Node gesetzt
 */
Model.prototype.createElement = function(name, textContent) {

    var result = this.xmlDocument.createElement(name);
    if (textContent) {
	result.textContent = textContent;
    }
    return result;
}

/**
 * 
 */
Model.prototype.addElement = function(xPath, node) {

    var cnr = this.evaluateXPath(xPath)[0];
    if (cnr) {
	var elem = XmlUtils.copyNode(node, cnr, true);
	this.fireXmlEvent(cnr);
	return XmlUtils.getXPathTo(elem);
    }
    return null;
}

/**
 * 
 */
Model.prototype.addElements = function(xPath, nodes) {

    var result = [];
    var cnr = this.evaluateXPath(xPath)[0];
    if (cnr) {

	for (var i = 0; i < nodes.length; i++) {
	    var elem = XmlUtils.copyNode(nodes[i], cnr, true);
	    result.push(XmlUtils.getXPathTo(elem));
	}
	this.fireXmlEvent(cnr);
	return result;
    }
    return result;
}

/**
 * 
 */
Model.prototype.removeElement = function(xPath) {

    var target = this.evaluateXPath(xPath)[0];
    if (target) {

	var parent = target.parentElement;
	parent.removeChild(target);
	this.fireXmlEvent(parent);
    }
}

/**
 * 
 */
Model.prototype.removeChilds = function(xPath) {

    var target = this.evaluateXPath(xPath)[0];
    if (target) {
	while (target.firstChild) {
	    target.removeChild(target.firstChild);
	}
	this.fireXmlEvent(target);
    }
}

/**
 * 
 */
Model.prototype.containsElement = function(xPath) {

    return this.evaluateXPath(xPath)[0];
}

/**
 * 
 */
Model.prototype.removeChilds = function(xPath) {

    var target = this.evaluateXPath(xPath)[0];
    if (target) {

	while (target.firstChild) {
	    target.removeChild(target.firstChild);
	}
	this.fireXmlEvent(target);
    }
}

/**
 * evaluiert den xpath und ruft für jedes gefundene Element den callback auf.
 * Der callback erhält einzigen Parameter das gefundene DOMElement übergeben
 */
Model.prototype.forEach = function(xpath, callback) {

    var all = this.evaluateXPath(xpath);
    for (var i = 0; i < all.length; i++) {

	callback(all[i]);
    }
}

/**
 * 
 * @param htmlTag
 * @returns {String}
 */
Model.prototype.getHtmlEventType = function(htmlTag) {

    var evtName;

    var dispatchType = (htmlTag.tagName + "#" + htmlTag.type).toLowerCase();
    switch (dispatchType) {
    case "select#select-one":
    case "select#select-multiple":
	evtName = "change";
	break;

    case "textarea#textarea":
    case "input#text":
    case "input#password":
	evtName = "input";
	break;

    case "input#radio":
    case "input#checkbox":
	evtName = "click";
	break;

    default:
	evtName = "change";
	break;
    }
    return evtName;
}

/**
 * 
 */
Model.prototype.addChangeListener = function(xPath, onChange) {

    var node = (typeof xPath == "string") ? XmlUtils.evaluateXPath(this.xmlDocument, xPath)[0] : xPath;
    if (node) {
	node.addEventListener("change", onChange);
    }
}

/**
 * 
 * @param eventName
 * @param htmlNode
 */
Model.prototype.fireXmlEvent = function(node) {

    var event = document.createEvent("Event");
    event.initEvent("change", true, true);
    event.target = node;
    node.dispatchEvent(event);
}

/*---------------------------------------------------------------------------*/
/**
 * WorkingCopies dienen dazu, den SubEditoren eine "Sandbox" bereit zu stellen.
 * Es handelt sich dabei um ein vollwertigen Model, welches aber nur den durch
 * den xPath definierten Ausschnitt enthält.
 * 
 * Der SubEditor kann auf diesem Model wüten, Modelbindings registrieren,
 * einfach tun und lassen was er will. Das eigentliche Model bleibt davon
 * unberührt, bis der SubEditor "commit()" aufruft.
 * 
 * Auf diese weise sind "Throw changes away"-Fähigkeiten der SubEditoren
 * gegeben.
 */
var ModelWorkingCopy = function(model, xPath) {

    this.orgNode = model.evaluateXPath(xPath)[0];
    this.workingCopy = XmlUtils.createDocument(this.orgNode.nodeName);
    Model.call(this, this.workingCopy);

    if (this.orgNode) {

	var element = this.orgNode.firstChild;
	while (element) {

	    XmlUtils.copyNode(element, this.workingCopy.documentElement, true);
	    element = element.nextSibling;
	}
    }
}
ModelWorkingCopy.prototype = Object.create(Model.prototype);

/**
 * Roll back anything!
 * 
 */
ModelWorkingCopy.prototype.commit = function() {

    XmlUtils.clearChilds(this.orgNode);
    var element = this.workingCopy.documentElement.firstChild;
    while (element) {

	XmlUtils.copyNode(element, this.orgNode, true);
	element = element.nextSibling;
    }
    this.fireXmlEvent(this.orgNode);
}
