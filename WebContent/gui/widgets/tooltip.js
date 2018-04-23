/**
 * @param anchor
 *                entweder die id des anchor-Elements oder die referenz auf
 *                dieses
 * @param icon
 *                eine uri, welche auf das zu verwendende Icon zeigt.
 *                Vordefiniert sind ToolTip.infoIcon, ToolTip.warningIcon und
 *                ToolTip.errorIcon. Es kann jedoch jedes andere Icon
 *                referenziert werden.
 * @param msg
 *                die anzuzeigende Meldung, kann auch eine Konstante aus den
 *                MessageCatalog sein
 * @param timeout
 *                der Timeout. Wenn nicht angegeben, so werden 5000 ms
 *                verwendet. Wenn der Wert ToolTip.INFINITE angegeben wird, so
 *                wird der ToolTip nicht automatisch terminiert
 */
var ToolTip = function(anchor, iconUrl, msg, timeout) {

    this.uiElem = this.createUIElement(iconUrl, msg);
    this.uiElem.focus();

    var self = this;

    // nach timeout schließen wir den Tooltip
    if (timeout != ToolTip.INFINITE) {
	timeout = timeout || 5000;
	this.timer = window.setTimeout(function() {
	    self.close();
	}, timeout);
    }

    // Bei Focus-Verlust schliessen wir den Tooltip
    this.uiElem.addEventListener("blur", function() {
	self.close();
    });

    // Beim click schliessen wir den Tooltip
    this.uiElem.addEventListener("click", function() {
	self.close();
    });

    // bei ESC schließen wir den Tooltip
    this.uiElem.addEventListener("keydown", function(evt) {
	if (evt.keyCode == 27) {
	    evt.stopPropagation();
	    self.close();
	}
    });

    // an das anchor-Element kleben
    anchor = UIUtils.getElement(anchor);
    this.adjustToAnchor(anchor);
}

/**
 * Das predefinierte Info-Icon
 */
ToolTip.infoIcon = "gui/images/tooltip-info.svg";

/**
 * Das predefinierte Warning-Icon
 */
ToolTip.warningIcon = "gui/images/tooltip-warning.svg";

/**
 * Das predefinierte ErrorIcon
 */
ToolTip.errorIcon = "gui/images/tooltip-error.svg";

/**
 * 
 */
ToolTip.INFINITE = -1;

/**
 * Erzeuge den ToolTip, füge diesen in das Dokument ein und liefere ihnzurück.
 * 
 * @param iconUrl
 * @param msg
 */
ToolTip.prototype.createUIElement = function(iconUrl, msg) {

    var content = document.createElement("div");

    if (iconUrl) {
	var img = document.createElement("img");
	img.src = iconUrl;
	content.appendChild(img);
    }
    var span = document.createElement("p");
    span.className = "tooltip-body";
    span.innerHTML = MessageCatalog.getMessage(msg);
    content.appendChild(span);

    var tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.appendChild(content);

    document.body.appendChild(tooltip);
    tooltip.setAttribute('tabindex', '0');
    tooltip.focus();
    return tooltip;
}

/**
 * Schliesse den Tooltip
 */
ToolTip.prototype.close = function() {

    window.clearTimeout(this.timer);
    var parent = this.uiElem.parentElement;
    if (parent) {
	parent.removeChild(this.uiElem);
    }
}

/**
 * 
 * @param anchor
 */
ToolTip.prototype.adjustToAnchor = function(anchor) {

    var rect = anchor.getBoundingClientRect();
    var top = 5 + rect.top + rect.height;
    var left = (anchor.offsetWidth - this.uiElem.offsetWidth) / 2;
    if (left < 0) {
	left = 10;
    }
    left = 0;
    this.uiElem.style.left = window.scrollX + rect.left + left + "px";
    this.uiElem.style.top = window.scrollY + top + "px";
    this.uiElem.style.position = "fixed";
}