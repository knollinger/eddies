var MonthCalendar = function(date) {
    
    WorkSpaceFrame.call(this);
    
    this.currentDate = date || new Date();
    this.setupUI();
    this.update();
}
MonthCalendar.prototype = Object.create(WorkSpaceFrame.prototype);


/**
 * 
 */
MonthCalendar.prototype.setupUI = function() {

    var self = this;
    UIUtils.getElement("calendar-go-back").addEventListener("click", function(evt) {
	self.currentDate.setDate(self.currentDate.getDate() - 7);
	self.update();
    });
    UIUtils.getElement("calendar-go-fore").addEventListener("click", function(evt) {
	self.currentDate.setDate(self.currentDate.getDate() + 7);
	self.update();
    });
}
