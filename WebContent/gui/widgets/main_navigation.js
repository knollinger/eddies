/**
 * 
 */
var MainNavigation = function() {
    
    Navigation.call(this);
    
    var self = this;
    this.addNavigationButton("gui/images/person.svg", "Team bearbeiten", function() {
        new MemberOverview();
    });

    this.addNavigationButton("gui/images/calendar.svg", "Öffnungszeiten planen", function() {
        new CourseMainNavigation();
    });
    
    this.addNavigationButton("gui/images/calendar.svg", "Putz-Plan erstellen", function() {
        alert("not done");
    });

    this.setTitle("Eddie Crashpaddy");
    this.enableBackButton(false);
    this.enableHomeButton(false);
}


/**
 * 
 */
MainNavigation.prototype = Object.create(Navigation.prototype);

/**
 * 
 */
MainNavigation.showHomeScreen = function() {

    WorkSpace.clearAll();
    new MainNavigation();    
}
