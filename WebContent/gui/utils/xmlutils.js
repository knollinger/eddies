/**
 * Die XML-Helperfacility
 */
var XmlUtils = (function() {

    return {

	/**
	 * Erzeuge ein neues XML-Dokument, welches den angegebenen TagName als
	 * Root-Element verwendet
	 * 
	 * @param rootElement
	 *                der Name des root-Elements
	 */
	createDocument : function(rootElemName) {
	    return document.implementation.createDocument(null, rootElemName, null);
	},

	/**
	 * Füge einen member hinzu. Sollte der Pfad oder Teile des Pfades nicht
	 * im Dokument existieren, so werden sie angelegt. Alle Pfad-Angaben
	 * erfolgen relativ zum Root-Element
	 * 
	 * @param xmlDoc
	 * @param path
	 * @param value
	 */
	setNode : function(xmlDoc, path, value) {

	    var currNode = xmlDoc.documentElement;
	    var pathMembers = path.split("/");
	    var currNode = this.createPath(xmlDoc, pathMembers);

	    if (value && value != "") {
		var newNode = xmlDoc.createTextNode(value);
		currNode.appendChild(newNode);
	    }
	    return currNode;
	},

	/**
	 * Füge einen member hinzu. Sollte der Pfad oder Teile des Pfades nicht
	 * im Dokument existieren, so werden sie angelegt. Alle Pfad-Angaben
	 * erfolgen relativ zum Root-Element
	 * 
	 * @param xmlDoc
	 * @param path
	 * @param value
	 */
	copyNode : function(srcNode, dstCnr, deepCopy) {

	    var newNode = srcNode.cloneNode(deepCopy);
	    dstCnr.ownerDocument.adoptNode(newNode);
	    dstCnr.appendChild(newNode);
	    return newNode;
	},

	/**
	 * 
	 */
	createPath : function(xmlDoc, pathMembers) {

	    var currNode = xmlDoc.documentElement;
	    for (var i = 0; i < pathMembers.length; ++i) {

		var childNodeName = pathMembers[i];
		var childNode = currNode.getElementsByTagName(childNodeName)[0];
		if (childNode == null) {
		    childNode = xmlDoc.createElement(childNodeName);
		    currNode.appendChild(childNode);
		}
		currNode = childNode;
	    }
	    return currNode;
	},

	/**
	 * Evaluiere den XPath gegen das gegebene Document.
	 * 
	 * @param xmlDocument
	 *                das xmlDocument
	 * 
	 * @param xPath
	 *                der XPath
	 * 
	 * @returns Das Array aller XML-Nodes, welche durch den XPath
	 *          referenziert wurden. Niemals null/undefined, gegebenenfalls
	 *          jedoch ein leeres Array
	 * 
	 */
	evaluateXPath : function(xmlDocument, xPath) {

	    var result = [];

	    var doc = xmlDocument.ownerDocument || xmlDocument;
	    if (doc.evaluate) {
		var iterator = doc.evaluate(xPath, doc, null, XPathResult.ANY_TYPE, null);
		var node = iterator.iterateNext();
		while (node) {
		    result.push(node);
		    node = iterator.iterateNext();
		}
	    } else {
		if (doc.selectNodes) {
		    result = doc.selectNodes(path);
		}
	    }
	    return result;
	},

	/**
	 * Liefere den XPath für eine gegebene Node.
	 * 
	 * Der erzeugte XPath ist sicher nicht optimal, liefert aber garantiert
	 * den Pfad zum gegebenen XMLElement
	 */
	getXPathTo : function(element) {

	    if (element === element.ownerDocument.documentElement) {
		return "/" + element.nodeName;
	    } else {
		var sibs = element.parentElement.children;

		var idx = 1;
		for (var i = 0; i < sibs.length; i++) {
		    if (sibs[i] == element) {
			var currPath = XmlUtils.getXPathTo(element.parentElement) + "/" + element.nodeName + "[" + idx + "]";
			return currPath;
		    } else {
			if (sibs[i].nodeName == element.nodeName) {
			    idx++;
			}
		    }
		}
	    }
	},

	/**
	 * lösche alle Kinder einer Node
	 */
	clearChilds : function(element) {
	    
	    while(element.firstChild) {
		element.removeChild(element.firstChild);
	    }
	},
	
	/**
	 * 
	 * @param xmlDoc
	 */
	stringify : function(xmlDoc) {

	    var serializer = new XMLSerializer();
	    return serializer.serializeToString(xmlDoc);
	},

	/**
	 * 
	 */
	parse : function(text) {

	    xml = null;
	    if (window.DOMParser) {
		xml = new DOMParser().parseFromString(text, "text/xml");
	    } else {
		xml = new ActiveXObject("Microsoft.XMLDOM");
		xml.async = false;
		xml.loadXML(text);
	    }
	    return xml;
	}
    }
})();
