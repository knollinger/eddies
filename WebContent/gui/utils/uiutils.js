var UIUtils = (function() {

    return {

	/**
	 * liefere das gegebene Element. Wenn es sich dabei um einen String
	 * handelt, so wird versucht diesen als ElementId zu betrachten.
	 * anderenfalls wird der inut einfach zurück geliefert.
	 * 
	 * @param elem
	 *                entweder die id (als string) oder die referenz auf das
	 *                html-element
	 * 
	 * @returns die referenz auf das html-Element. Kann auch
	 *          <code>null>/code> sein, wenn kein solches element gefunden wurde
	 */
	getElement : function(elem) {

	    if (typeof elem === "string") {
		elem = document.getElementById(elem);
	    }
	    return elem;
	},

	/**
	 * Lösche alle childs des angegebenen parents.
	 * 
	 * @param parent
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. ANderenfalls wird parent als
	 *                Referenz auf die HTML-Node angesehen
	 */
	clearChilds : function(parent) {

	    parent = UIUtils.getElement(parent);
	    while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	    }
	},
	
	/**
	 * Lösche alle Childs, welche eine gegebene Klasse haben
	 * 
	 * @param parent
	 * @param className
	 */
	removeChildsWithClass : function(parent, className) {
	   
	    parent = UIUtils.getElement(parent);
	    var allChilds = parent.getElementsByClassName(className);
	    for(var i = 0; i < allChilds.length; i++) {
		parent.removeChild(allChilds[i]);
	    }
	},

	/**
	 * 
	 */
	getChildsAsArray : function(parent, tagName) {

	    var result = [];

	    parent = UIUtils.getElement(parent);
	    var childs = (tagName) ? parent.getElementsByTagName(tagName) : parent.children;

	    for (var i = 0; i < childs.length; ++i) {
		result.push(childs[i]);
	    }

	    return result;
	},

	/**
	 * Füge mehrere Childs in einen Container ein
	 * 
	 * @param parent
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. ANderenfalls wird parent als
	 *                Referenz auf die HTML-Node angesehen
	 * 
	 * @param childs
	 *                ein Array von Childs
	 */
	appendMultipleChilds : function(parent, childs) {

	    parent = UIUtils.getElement(parent);
	    for (var i = 0; i < childs.length; i++) {
		parent.appendChild(childs[i]);
	    }
	},

	/**
	 * Lösche alle folgenden Geschwister des angegebenen elements.
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 */
	removeSiblingsAfter : function(element) {

	    var from = UIUtils.getElement(element);
	    while (from.nextSibling) {
		element.parentNode.removeChild(from.nextSibling);
	    }
	},

	/**
	 * Lösche alle vorhergehenden Geschwister des angegebenen elements.
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 */
	removeSiblingsBefore : function(element) {

	    var until = UIUtils.getElement(element);
	    while (until.parentNode.firstChild != null && until.parentNode.firstChild != until) {
		until.parentNode.firstChild(until.parentNode.firstChild);
	    }
	},

	/**
	 * entferne ein Element aus dem DOM
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 */
	removeElement : function(element) {
	    var node = UIUtils.getElement(element);
	    if (node.parentNode) {
		node.parentNode.removeChild(node);
	    }
	},

	/**
	 * Liefere die CSS-Klassen eines Elements als Array
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 */
	getClasses : function(element) {

	    var result = [];
	    if (element) {
		var node = UIUtils.getElement(element);
		result = node.className.split(' ');
	    }
	    return result;
	},

	/**
	 * besitz das angegebene Element die CSS-Klasse?
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 * @param clazz
	 *                die CSS-Klasse
	 */
	hasClass : function(element, clazz) {

	    element = UIUtils.getElement(element);
	    var classes = UIUtils.getClasses(element);
	    return classes.includes(clazz);
	},

	/**
	 * Entferne die angegebene CSS-Klasse vom Element
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 * @param clazz
	 *                die CSS-Klasse
	 */
	removeClass : function(element, clazz) {

	    if (element) {

		var node = UIUtils.getElement(element);
		var classes = UIUtils.getClasses(node);
		var idx = classes.indexOf(clazz);
		if (idx != -1) {
		    classes.splice(idx, 1);
		    node.className = classes.join(' ');
		}
	    }
	},

	/**
	 * Füge die angegebene CSS-Klasse zum Element hinzu
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 * @param clazz
	 *                die CSS-Klasse
	 */
	addClass : function(element, clazz) {

	    if (element) {
		var node = UIUtils.getElement(element);
		var classes = UIUtils.getClasses(node);
		if (!classes.includes(clazz)) {
		    classes.push(clazz);
		    node.className = classes.join(' ');
		}
	    }
	},

	/**
	 * Wenn das Element die angegebene CSS-Klasse besitzt, so wird sie
	 * entfernt. Anderenfalls wird sie hinzu gefügt.
	 * 
	 * @param element
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 * @param clazz
	 *                die CSS-Klasse
	 */
	toggleClass : function(element, clazz) {

	    if (element) {

		if (UIUtils.hasClass(element, clazz)) {
		    UIUtils.removeClass(element, clazz);
		} else {
		    UIUtils.addClass(element, clazz);
		}
	    }
	},

	/**
	 * Liefere alle Child-Elemente des angegeben Parent, welche die
	 * angegebene CSS-Klasse besitzen
	 * 
	 * @param parent
	 *                wenn ein String angegeben ist, so wird dieser als
	 *                Element-ID betrachtet. Anderenfalls wird element als
	 *                Referenz auf die HTML-Node angesehen
	 * @param clazz
	 *                die CSS-Klasse
	 */
	getChildsByClass : function(parent, clazz) {

	    var result = [];

	    var elem = UIUtils.getElement(parent);

	    var childs = elem.getElementsByClassName(clazz);
	    for (var i = 0; i < childs.length; i++) {
		result.push(childs[i]);
	    }
	    return result;
	},

	/**
	 * Für alle Kinder des angegebenen Parents wird die angegebene Klasse
	 * entfernt bzw hinzu gefügt. Dabei gilt:
	 * <ul>
	 * <li> Wenn das Kind die Klasse bereits hat und <b>nicht</b> in der
	 * Liste der ChildIds enthalten ist, so wird die Klasse entfernt</li>
	 * <li>Wenn das Kind die Klasse bereits hat und in der Liste der
	 * ChildIds enthalten ist, so bleibt die Klasse bestehen</li>
	 * <li>Wenn das Kind die Klasse nicht hat und in der Liste der ChildIds
	 * enthalten ist, so wird die Klasse gesetzt</li>
	 * <li>Wenn das Kind die Klasse bereits hat und in der Liste der
	 * ChildIds enthalten ist, so bleibt die Klasse bestehen</li>
	 */
	adjustChildClass : function(parent, childIds, clazz) {

	    // welche felder haben die Klasse bereits?
	    var childsWithClass = UIUtils.getChildsByClass(parent, clazz);

	    // setze die Klasse auf alle Childs welche in childIds enthalten
	    // sind
	    for (var i = 0; i < childIds.length; i++) {
		UIUtils.addClass(childIds[i], clazz);
	    }

	    // entferne die Klasse bei allen anderen Childs
	    for (var i = 0; i < childsWithClass.length; i++) {

		if (!childIds.includes(childsWithClass[i].id)) {
		    UIUtils.removeClass(childsWithClass[i], clazz);
		}
	    }
	},

	/**
	 * Feuere ein Event, ausgehend vom angegebenen Element. Das Event kann
	 * bubblen und ist cancelable
	 * 
	 * @param name
	 *                der EventName
	 * @param elem
	 *                entweder die EVentId (wenn ein STring) oder die
	 *                Referenz auf das Element selbst
	 */
	fireEvent : function(name, elem) {

	    var elem = UIUtils.getElement(elem);
	    var event = document.createEvent("Event");
	    event.initEvent(name, true, true);
	    event.target = elem;
	    elem.dispatchEvent(event);
	},

	/**
	 * Erzeuge ein ClearFix-Element
	 */
	createClearFix : function() {

	    var result = document.createElement("div");
	    result.style.clear = "both";
	    return result;
	},

	/**
	 * Erzeuge eine Data-URL
	 */
	createDataUrl : function(mimeType, data) {
	    return "data:" + mimeType + ";base64," + data;
	},

	/**
	 * 
	 */
	getResolvedStyle : function(element, propName) {

	    return window.getComputedStyle(element, null).getPropertyValue(propName);
	}
    }
})();
