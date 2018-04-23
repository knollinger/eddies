WorkSpace = (function() {

    // Keine ContextMenus!
    // document.body.addEventListener("contextmenu", function(evt){
    //
    // evt.preventDefault();
    // }, true);

    return {

	clearAll : function() {
	    UIUtils.clearChilds(document.getElementById("workspace"));
	    UIUtils.clearChilds(document.getElementById("dialogs"));
	}

    }
})();

/**
 * 
 */
var WorkSpaceFrame = function() {

    this.frame = document.createElement("div");
    this.frame.className = "workspace-frame";

    this.header = this.makeHeader();
    this.frame.appendChild(this.header);

    this.toolbox = this.makeToolBox();
    this.frame.appendChild(this.toolbox);

    this.content = document.createElement("div");
    this.content.className = "workspace-frame-body";
    this.frame.appendChild(this.content);

    this.naviBox = this.makeNaviBox();
    this.frame.appendChild(this.naviBox);

    UIUtils.getElement("workspace").appendChild(this.frame);
}

/**
 * 
 * @param url
 * @param onload
 */
WorkSpaceFrame.prototype.load = function(url, onload) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.content.innerHTML = req.responseText;

		// ist der Content annotiert?
		var annotations = self.content.getElementsByClassName("workspace-frame-content")[0];
		if (annotations) {

		    self.setTitle(annotations.dataset.frameTitle || "");
		    self.enableBackButton((annotations.dataset.hasBackbutton == "yes"));
		    self.enableSaveButton((annotations.dataset.hasSavebutton == "yes"));
		}

		if (onload) {
		    onload(self);
		}
	    }
	}
    }
    req.send();
}

/**
 * 
 */
WorkSpaceFrame.prototype.close = function() {

    this.frame.parentElement.removeChild(this.frame);
}

/**
 * 
 * @param value
 */
WorkSpaceFrame.prototype.enableBackButton = function(value) {

    if (value) {
	UIUtils.removeClass(this.backButton, "hidden");
    } else {
	UIUtils.addClass(this.backButton, "hidden");
    }
}

/**
 * 
 * @param value
 */
WorkSpaceFrame.prototype.enableSaveButton = function(value) {

    if (value) {
	UIUtils.removeClass(this.saveButton, "hidden");
    } else {
	UIUtils.addClass(this.saveButton, "hidden");
    }
}

/**
 * 
 * @param value
 */
WorkSpaceFrame.prototype.enableHomeButton = function(value) {

    if (value) {
	UIUtils.removeClass(this.homeBtn, "hidden");
    } else {
	UIUtils.addClass(this.homeBtn, "hidden");
    }
}

/**
 * 
 * @param text
 */
WorkSpaceFrame.prototype.setTitle = function(text) {

    this.title.innerHTML = text;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeHeader = function() {

    this.header = document.createElement("div");
    this.header.className = "workspace-frame-header";

    // Title
    this.title = document.createElement("span");
    this.title.className = "workspace-frame-header-title";
    this.header.appendChild(this.title);

    // home
    this.homeBtn = document.createElement("img");
    this.homeBtn.className = "workspace-frame-header-home";
    this.homeBtn.title = "Zum Haupt-Menü";
    this.homeBtn.src = "gui/images/home.svg";
    this.homeBtn.addEventListener("click", function() {
	MainNavigation.showHomeScreen();
    })
    this.header.appendChild(this.homeBtn);

    this.header.appendChild(UIUtils.createClearFix());
    return this.header;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeNaviBox = function() {

    var naviBox = document.createElement("div");
    naviBox.className = "workspace-frame-navigationbox";

    var self = this;

    // Back-Button
    this.backButton = this.makeActionBtn("gui/images/go-previous.svg", "Zurück", function(evt) {
	evt.stopPropagation();
	if (self.onBack) {
	    self.onBack();
	}
	self.close();
    });
    naviBox.appendChild(this.backButton);

    // save button
    this.saveButton = this.makeActionBtn("gui/images/document-save.svg", "Speichern", function(evt) {

	evt.stopPropagation();
	if (!self.onSave) {
	    self.close();
	} else {
	    if (self.validate()) {
		self.onSave();
		self.close();
	    }
	}
    });
    UIUtils.addClass(this.saveButton, "hidden");
    naviBox.appendChild(this.saveButton);

    naviBox.appendChild(UIUtils.createClearFix());

    return naviBox;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeToolBox = function() {

    var toolbox = document.createElement("div");
    toolbox.className = "workspace-frame-toolbox";
    return toolbox;
}

/**
 * 
 * @param action
 * @param text
 * @param onClick
 */
WorkSpaceFrame.prototype.addAction = function(action) {

    var div = this.makeActionBtn(action.img, action.text, action.onClick);
    action.btn = div;
    this.toolbox.appendChild(div);
    return div;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeActionBtn = function(imgUrl, title, onclick) {

    var image = document.createElement("img");
    image.addEventListener("click", onclick);
    image.ondragstart = function() {
	return false;
    };
    image.src = imgUrl;

    var btn = document.createElement("div");
    btn.className = "workspace-frame-action";
    btn.title = title;
    btn.appendChild(image);
    return btn;
}

/**
 * actions für den WorkSpaceFrame
 */
var WorkSpaceFrameAction = function(img, text, onClick) {

    this.btn = null;
    this.img = img;
    this.text = text;
    this.onClick = onClick;

    var self = this;
    this.show = function() {
	self.btn.style.display = "inline-block";
    }

    this.hide = function() {
	self.btn.style.display = "none";
    }

    this.isVisible = function() {
	return self.btn.style.display != "none";
    }
}

/**
 * 
 */
WorkSpaceFrame.prototype.validate = function() {

    return new Validator().validate(this.content);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var WorkSpaceTabBinder = function(tabbedPane, radio, contentPane) {

    this.tabbedPane = tabbedPane;
    this.radio = radio;
    this.contentPane = contentPane;
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.associateTabPane = function(subFrame) {

    var self = this;
    this.subFrame = subFrame;
    this.radio.addEventListener("click", function() {

	self.tabbedPane.handleActivation(subFrame);
    });
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.select = function() {
    this.radio.click();
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.validate = function() {

    this.select();
    return new Validator().validate(this.contentPane);
}

/*---------------------------------------------------------------------------*/
/**
 * WorkSpaceTabbedFrames werden verwendet, um einen Accordeon/TabDialog zu
 * konstruieren. Jedem TabbedFrame ist ein eindeutiger GruppenNamen zu zuweisen.
 * Dieser wird im Rahmen des üblichen RadioButtonHacks zur Addressierung
 * verwendet.
 */
var WorkSpaceTabbedFrame = function(groupName) {

    WorkSpaceFrame.call(this);
    UIUtils.addClass(this.frame, "accordeon-cnr");
    this.groupName = groupName;
    this.currentSelection = null;
    this.tabs = [];
}
WorkSpaceTabbedFrame.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 * @param imgUrl
 * @param text
 */
WorkSpaceTabbedFrame.prototype.addTab = function(imgUrl, text) {

    var self = this;
    var id = UUID.create("workspace_tab");

    var radio = document.createElement("input");
    radio.className = "accordeon-btn";
    radio.type = "radio";
    radio.name = this.groupName;
    radio.id = id;
    this.content.appendChild(radio);
    var label = document.createElement("label");
    label.setAttribute("for", id);

    var img = document.createElement("img");
    img.src = imgUrl;
    label.appendChild(img);
    label.appendChild(document.createTextNode(text));

    this.content.appendChild(label);

    var content = document.createElement("div");
    content.className = "accordeon-content";
    this.content.appendChild(content);

    var tabBinder = new WorkSpaceTabBinder(this, radio, content);
    this.tabs.push(tabBinder);
    return tabBinder;
}

/**
 * 
 */
WorkSpaceTabbedFrame.prototype.handleActivation = function(currentSubFrame) {

    if (this.currentSelection) {
	this.currentSelection.deactivate();
    }
    this.currentSelection = currentSubFrame;
    this.currentSelection.activate();
}

/**
 * 
 */
WorkSpaceTabbedFrame.prototype.validate = function() {

    var result = true;

    for (var i = 0; result && i < this.tabs.length; i++) {

	result = this.tabs[i].validate();
    }
    return result;
}

/*---------------------------------------------------------------------------*/
/**
 * WorkSpaceTabPanes werden im Content von Accordeons/Tabs angezeigt. Die
 * wichtigsten Methoden sind activate und deactivate. Hier müssen die SubFrames
 * alle dem aktuellen Zustand enstprechenden Actions anzeigen bzw. alle mit
 * ihnen verbandelten Actions verstecken.
 */

/**
 * @param parentFrame
 * @param targetContainer
 */
var WorkSpaceTabPane = function(parentFrame, targetContainer) {

    this.parentFrame = parentFrame;
    this.targetCnr = UIUtils.getElement(targetContainer);
    this.actions = [];
}

/**
 * Der Methodenrumpf ist nur zur dokumentation vorhanden.
 */
WorkSpaceTabPane.prototype.activate = function() {

}

/**
 * Verstecke alle Actions, welche mit dem SubFrame assoziiert sind
 */
WorkSpaceTabPane.prototype.deactivate = function() {

    for (var i = 0; i < this.actions.length; i++) {
	this.actions[i].hide();
    }
}

/**
 * @param htmlSrc
 *                die url mit der htmlSourse für den SubFrame
 * @param onload
 *                callback, welcher beim erfolgreichen laden gerufen wird. der
 *                Callback erhält das SubFrameObject als Parameter übergeben
 */
WorkSpaceTabPane.prototype.load = function(htmlSrc, onload) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", htmlSrc, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.targetCnr.innerHTML = req.responseText;

		if (onload) {
		    onload(self);
		}
	    }
	}
    }
    req.send();
}

/**
 * Füge eine Action hinzu
 */
WorkSpaceTabPane.prototype.addAction = function(action) {

    this.actions.push(action);
    this.parentFrame.addAction(action);
}

/**
 * abgeleitete Klassen lten diese Methode überschreiben und die InputValidierung
 * vor nehmen.
 */
// WorkSpaceTabPane.prototype.validate = function() {
//    
// return new Validator().validate(this.targetCnr);
//
// }
/*---------------------------------------------------------------------------*/
/**
 * 
 */
var WorkSpaceDialog = function() {

    this.frame = document.createElement("div");
    this.frame.className = "workspace-dialog";

    this.title = document.createElement("div");
    this.title.className = "workspace-dialog-title";
    this.frame.appendChild(this.title);

    this.actionBar = document.createElement("div");
    this.actionBar.className = "workspace-dialog-actionbar";
    this.frame.appendChild(this.actionBar);

    this.content = document.createElement("div");
    this.content.className = "workspace-dialog-body";
    this.frame.appendChild(this.content);

    this.footer = this.makeFooter();
    this.frame.appendChild(this.footer);

    UIUtils.getElement("dialogs").appendChild(this.frame);
}

/**
 * 
 */
WorkSpaceDialog.prototype.makeFooter = function() {

    var footer = document.createElement("div");
    footer.className = "workspace-dialog-footer";

    var self = this;
    this.okBtn = this.createActionButton("gui/images/dialog-ok.svg", "Ok", function() {

	if (!self.onOk || self.onOk()) {
	    self.close();
	}
    });
    this.enableOkButton(false);
    footer.appendChild(this.okBtn);

    this.cancelBtn = this.createActionButton("gui/images/dialog-cancel.svg", "Abbrechen", function() {

	if (self.onCancel) {
	    self.onCancel();
	}
	self.close();
    });
    footer.appendChild(this.cancelBtn);

    return footer;
}

/**
 * @param val
 *                wenn true, wird der ok button angezeigt. sonst wird er
 *                versteckt
 */
WorkSpaceDialog.prototype.enableOkButton = function(val) {

    if(val) {
	UIUtils.removeClass(this.okBtn, "hidden");
    }
    else {
	UIUtils.addClass(this.okBtn, "hidden");
	
    }
    
}

/**
 * 
 */
WorkSpaceDialog.prototype.close = function() {

    this.frame.parentElement.removeChild(this.frame);
}

/**
 * 
 */
WorkSpaceDialog.prototype.addAction = function(action) {

    var div = this.createActionButton(action.img, action.text, action.onClick);
    action.btn = div;
    this.actionBar.appendChild(div);
    return div;

}
/**
 * 
 */
WorkSpaceDialog.prototype.createActionButton = function(imgUrl, text, onClick) {

    var img = document.createElement("img");
    img.src = imgUrl;

    var action = document.createElement("div");
    action.className = "workspace-frame-action";
    action.appendChild(img);

    action.addEventListener("click", function() {
	onClick();
    });

    action.title = text;
    return action;
}

/**
 * 
 */
WorkSpaceDialog.prototype.load = function(url, onload) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.content.innerHTML = req.responseText;

		// ist der Content annotiert?
		var annotations = self.content.getElementsByClassName("workspace-frame-content")[0];
		if (annotations) {

		    self.setTitle(annotations.dataset.frameTitle || "");
		}

		if (onload) {
		    onload(self);
		}
	    }
	}
    }
    req.send();
}

/**
 * 
 */
WorkSpaceDialog.prototype.setTitle = function(title) {

    this.title.textContent = title;
}

/**
 * 
 */
var Navigation = function() {

    WorkSpaceFrame.call(this);
    
    this.navFrame = document.createElement("div");
    UIUtils.addClass(this.navFrame, "navigation-frame");
    this.content.appendChild(this.navFrame);
    this.content.style.padding = "0";

//    UIUtils.addClass(this.content, "navigation-frame");
}

/**
 * 
 */
Navigation.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 * @param img
 * @param text
 * @param onclick
 */
Navigation.prototype.addNavigationButton = function(img, text, onclick) {

    var btn = document.createElement("div");
    btn.className = "navigation-button";
    
    var icon = document.createElement("img");
    icon.src = img;
    btn.appendChild(icon);
    
    var span = document.createElement("span");
    span.textContent = text;
    btn.appendChild(span);
    
    btn.addEventListener("click", function() {
       onclick(); 
    });
    
    this.navFrame.appendChild(btn);
    return btn;
}