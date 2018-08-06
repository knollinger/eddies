
var MessageBox = function(type, title, message, onOk, onCancel) {

    this.glass = document.createElement("div");
    this.glass.className = "mbox-glass";

    var frame = document.createElement("div");
    frame.className = "mbox-frame";
    this.glass.appendChild(frame);

    var header = document.createElement("div");
    header.className = "mbox-title";
    header.innerHTML = title;

    frame.appendChild(header);
    frame.appendChild(this.createContent(type, message));
    frame.appendChild(this.createButtonArea(type, onOk, onCancel));

    document.body.appendChild(this.glass);
    this.defBtn.focus();
}

MessageBox.INFO = 1;
MessageBox.QUERY = 2;
MessageBox.WARNING = 3;
MessageBox.ERROR = 4;

MessageBox.icons = [];
MessageBox.icons[MessageBox.INFO] = "gui/images/messagebox-info-icon.svg";
MessageBox.icons[MessageBox.QUERY] = "gui/images/messagebox-query-icon.svg";
MessageBox.icons[MessageBox.WARNING] = "gui/images/messagebox-warning-icon.svg";
MessageBox.icons[MessageBox.ERROR] = "gui/images/messagebox-error-icon.svg";

MessageBox.prototype.close = function() {
    UIUtils.removeElement(this.glass);
}

MessageBox.prototype.createContent = function(type, message) {

    var content = document.createElement("div");
    content.className = "mbox-content";

    var icon = document.createElement("img");
    icon.className = "mbox-icon";
    icon.src = MessageBox.icons[type];
    content.appendChild(icon);

    var text = document.createElement("div");
    text.className = "mbox-text";
    text.innerHTML = message;
    content.appendChild(text);
    return content;
}

MessageBox.prototype.createButtonArea = function(type, onOk, onCancel) {

    var footer = document.createElement("div");
    footer.className = "mbox-footer";

    switch (type) {
    case MessageBox.INFO:
    case MessageBox.WARNING:
    case MessageBox.ERROR:
	this.defBtn = this.createButton("Ok", onOk);
	footer.appendChild(this.defBtn);
	break;

    case MessageBox.QUERY:
	this.defBtn = this.createButton("Ja", onOk);
	footer.appendChild(this.defBtn);
	footer.appendChild(this.createButton("Nein", onCancel));
    }

    return footer;
}

MessageBox.prototype.createButton = function(text, onClick) {

    var self = this;
    var btn = document.createElement("button");
    btn.className = "mbox-button";
    btn.textContent = text;
    btn.addEventListener("click", function() {
	self.close();
	if (onClick) {
	    onClick();
	}
    });
    return btn;
}