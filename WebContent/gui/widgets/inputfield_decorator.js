var InputFieldDecorator = function(input, clazz, onIconClick) {
    
    var self = this;
    this.input = UIUtils.getElement(input);
    UIUtils.addClass(this.input, clazz);

    // Click auf dem Icon ?
    this.input.addEventListener("click", function(evt) {

	var iconArea = self.getIconAreaWidth();
	if (evt.offsetX >= (self.input.offsetWidth - iconArea)) {
	    onIconClick(self.input);
	}
    });

    // mouseMove auf dem Icon ?
    this.input.addEventListener("mousemove", function(evt) {

	var iconArea = self.getIconAreaWidth();
	if (evt.offsetX >= (self.input.offsetWidth - iconArea)) {
	    UIUtils.addClass(self.input, "clickable");
	} else {
	    UIUtils.removeClass(self.input, "clickable");
	}
    });
}

/*
 * liefere die Breite des BackgroundIcons.
 */
InputFieldDecorator.prototype.getIconAreaWidth = function() {

    var result = window.getComputedStyle(this.input, null)['padding-right'];
    return parseInt(result);
}
