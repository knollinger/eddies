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
 */
Model.prototype.createValueBinding = function(htmlTag, xPath) {

    this.createAttributeBinding(htmlTag, "value", xPath);
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
 * Ändert sich der XmlValue, so wird
 * das Attribute des HtmlTags geändert
 * 
 * @param htmlTag
 * @param xPath
 */

Model.prototype.createAttributeBinding = function(htmlTag, attribute, xPath) {

    var self = this;
    var xml = XmlUtils.evaluateXPath(this.xmlDocument, xPath);
    if (xml.length != 0) {

	xml = xml[0];
	var html = UIUtils.getElement(htmlTag);
	if (html) {

	    html[attribute] = xml.textContent;
	    var evtName = this.getHtmlEventType(html);
	    if (evtName) {

		html.addEventListener(evtName, function() {

		    if (xml.textContent != html[attribute]) {
			xml.textContent = html[attribute];
			self.fireXmlEvent(xml);
		    }
		});
	    }
	}

	xml.addEventListener("change", function() {

	    if (html[attribute] != xml.textContent) {
		html[attribute] = xml.textContent;
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
		    this.createTableRow(tab, xml[i], fields, onclick);
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
 * @param tbody
 *                die Referenz auf den tbody
 * @param xmlNode
 *                die referenz auf das aktuelle xmlElement
 * @param fields
 *                das Array der zu visualisierenden Spalten der TR
 * @param onclick
 *                optional - wenn gesetzt, wird die Funktion mit der TR und der
 *                aktuellen XMLNode als Argumente aufgerufen
 */
Model.prototype.createTableRow = function(tbody, xmlNode, fields, onclick) {

    var row = document.createElement("tr");
    this.reloadTableRow(row, xmlNode, fields);
    tbody.appendChild(row);

    if (onclick) {
	row.addEventListener("click", function() {
	    onclick(row, xmlNode);
	});
    }

    var self = this;
    xmlNode.addEventListener("change", function(evt) {
	self.reloadTableRow(row, xmlNode, fields);
    });
}

/**
 * 
 * @param row
 * @param xmlNode
 */
Model.prototype.reloadTableRow = function(row, xmlNode, fields) {

    UIUtils.clearChilds(row);
    for (var i = 0; i < fields.length; i++) {

	var cell = document.createElement("td");
	var field = fields[i];
	var value = this.getNodeValue(xmlNode, fields[i]);

	if (typeof value == "string") {
	    cell.textContent = value;
	} else {
	    cell.appendChild(value);
	}
	row.appendChild(cell);
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
Model.prototype.getNodeValue = function(xmlNode, field) {

    if (typeof field == 'function') {
	return field(xmlNode);
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
Model.prototype.setValueSilent = function(xPath, value) {

    var cnr = this.evaluateXPath(xPath)[0];
    if (cnr) {
	cnr.textContent = value;
    }
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
	while(target.firstChild) {
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

    console.log("make a working copy of '" + xPath + "'");
    if (this.orgNode) {

	var element = this.orgNode.firstChild;
	while (element) {

	    XmlUtils.copyNode(element, this.workingCopy.documentElement, true);
	    element = element.nextSibling;
	}
    }
    console.log("New working copy: " + XmlUtils.stringify(this.workingCopy));
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
