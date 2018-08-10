/**
 * Entferne alle Elemente mit dem gegebenen Wert aus dem Array
 * 
 * @param val
 */
Array.prototype.remove = function(val) {

    var i = this.length;
    while (i--) {
	if (this[i] == val) {
	    this.splice(i, 1);
	}
    }
}

/**
 * Füge ein Element hinzu, wenn es noch nicht enthalten ist
 * 
 * @param val
 * @return null, wenn kein solches Element enthalten war, sonst die Referenz auf
 *         das bereits enthaltene Element
 */
Array.prototype.pushIfAbsent = function(val) {

    var found = null;
    
    for(var i = 0; found = null && i < this.length; i++) {

	if(this[i] == val) {
	    found = this[i];
	}
    }
    
    if(!found) {
	this.push(val);
	found = val;
    }
    return found;
}

/**
 * Definiere Array.isArray, wenn noch nicht vorhanden
 */
if(!Array.prototype.isArray) {
    
    Array.prototype.isArray = function(x) {
	return x instanceof Array;
    }
}

if(!Array.prototype.includes) {
    
    Array.prototype.includes = function(x) {
	
	return this.indexOf(x) != -1;
    }
}