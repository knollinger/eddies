/**
 * 
 */
var Validator = function() {

}

/**
 * 
 * @param parent
 * @returns {Boolean}
 */
Validator.prototype.validate = function(parent) {

    var result = true;
    parent = UIUtils.getElement(parent);
    if (parent) {

	var allChilds = this.getAllInputFields(parent);
	for (var i = 0; result && i < allChilds.length; i++) {

	    var currElem = allChilds[i];
	    if (UIUtils.hasClass(currElem, "mandatory")) {
		result = this.assertNotEmpty(currElem);
	    }

	    if (result) {
		var expectedType = currElem.dataset.type;
		if (expectedType && expectedType != "") {
		    result = this.testExpectedType(currElem, expectedType);
		}
	    }
	}
    }
    return result;
}

/**
 * 
 * @param parent
 * @returns {Array}
 */
Validator.prototype.getAllInputFields = function(parent) {

    var result = [];

    var tags = [ "input", "textarea", "select" ];
    for (var i = 0; i < tags.length; i++) {

	var childs = parent.getElementsByTagName(tags[i]);
	for (var j = 0; j < childs.length; j++) {
	    result.push(childs[j]);
	}
    }
    
    var childs = parent.getElementsByClassName("multsel-cnr");
    for (var j = 0; j < childs.length; j++) {
	    result.push(childs[j]);
    }
    return result;
}

/**
 * 
 * @param elem
 */
Validator.prototype.assertNotEmpty = function(elem) {
    
    var empty = false;
    
    var val = elem.value;
    if(Array.isArray(val) ) {
	empty = val.length == 0;
    }
    else {
	empty = elem.value == "";
    }
    
    if (empty) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld darf nicht leer sein.")
    }
    return !empty;
}

/**
 * 
 * @param elem
 * @param expectedType
 */
Validator.prototype.testExpectedType = function(elem, expectedType) {

    var result = true;
    var val = elem.value;
    if (val != "") {

	switch (expectedType.toLowerCase()) {
	case 'number':
	    result = this.assertIsNumber(elem);
	    break;

	case 'time':
	    result = this.assertIsTime(elem);
	    break;

	case 'date':
	    result = this.assertIsDate(elem);
	    break;

	case 'zipcode':
	    result = this.assertIsZipCode(elem);
	    break;
	}
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsNumber = function(elem) {

    var result = parseInt(elem.value) != NaN;
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss eine Zahl beinhalten.")
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsTime = function(elem) {

    var result = DateTimeUtils.isTime(elem.value);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss eine Uhrzeit beinhalten.");
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsDate = function(elem) {

    var result = DateTimeUtils.isDate(elem.value);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss ein Datum beinhalten.");
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsZipCode = function(elem) {

    var n = parseInt(elem.value);
    var result = (n != NaN && n > 0 && n < 100000);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss eine Postleitzahl beinhalten.");
    }
    return result;
}
