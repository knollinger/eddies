var BusyIndicator = (function() {

    function createUI() {
    
        var glassPane = document.createElement("div");
        glassPane.className = "busy-indicator";
        
        var img = document.createElement("img");
        img.src = "gui/images/spin.gif";
        glassPane.appendChild(img);
        
        document.body.appendChild(glassPane);
        return glassPane;
    }
    
    return {

        glassPane : null,
        timer : null,

        show : function() {

            this.hide();

            var self = this;
            this.timer = setTimeout(function() {
                if (self.glassPane == null) {
                    self.glassPane = createUI();
                }
            }, 300);

        },

        hide : function() {

            clearTimeout(this.timer);
            if (this.glassPane) {
                this.glassPane.parentElement.removeChild(this.glassPane);
                this.glassPane = null;
            }
        }
    }
})();