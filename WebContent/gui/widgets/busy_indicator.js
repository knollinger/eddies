var BusyIndicator = (function() {

    return {

	glassPane : document.getElementById("busy-indicator"),
	timer : null,

	/**
	 * 
	 */
	show : function() {

	    this.hide();

	    var self = this;
	    this.timer = setTimeout(function() {
		UIUtils.removeClass(self.glassPane, "hidden");
	    }, 300);

	},

	/**
	 * 
	 */
	hide : function() {

	    clearTimeout(this.timer);
	    UIUtils.addClass(this.glassPane, "hidden");
	}
    }
})();