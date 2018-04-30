var MemberOverview = function() {

    var self = this;
    WorkSpaceFrame.call(this, "gui/member/member_overview.html", function() {
    });
}
MemberOverview.prototype = Object.create(WorkSpaceFrame.prototype);