/**
 * Die Eierlegende-Wollmilchsau der Touchgesture-Überwachung.
 * 
 * Im wesentlichen schaut der Monitor darauf, ob TouchEvents auf dem Target
 * eintreffen. Sollte dies der falls sein, so versucht er, SwipeEvents (toLeft,
 * toRight, up, down) zu erkennen und diese den Callbacks des Targets zu zu
 * stellen.
 * 
 * Das Target muss dazu wenigstens einen der folgenden Callbacks definieren:
 * <ul>
 * <li>swipeToLeft - wird bei einer Touchbewegung rechts nach links gerufen</li>
 * <li>swipeToRight - wird bei einer Touchbewegung links nach rechts gerufen</li>
 * <li>swipeUp - wird bei einer Touchbewegung unten nach oben gerufen</li>
 * <li>swipeDown - wird bei einer Touchbewegung oben nach unten gerufen</li>
 * </ul>
 * 
 * Sollte das Target keine der Callbacks definieren, so passiert gar nix. Sollte
 * das Target wenigstens einen der Callbacks implementieren, so wird das damit
 * assoizierte TouchEnd-Event "verschluckt" und der Callback wird gerufen.
 */
var TouchGesturesObserver = function(evtSource, evtTarget) {

    var source = UIUtils.getElement(evtSource);
    this.target = evtTarget;
    touchStartPoint = null;

    if (this.hasTouchSupport()) {

	var self = this;

	// instantiate the touchStart-listener
	source.addEventListener("touchstart", function(evt) {
	    self.onTouchStart(evt);
	}, false);

	// instantiate the touchStart-listener
	source.addEventListener("touchmove", function(evt) {
	    self.onTouchMove(evt);
	}, false);

	// instantiate the touchEnd listener
	source.addEventListener("touchend", function(evt) {
	    self.onTouchEnd(evt);
	}, false);

	// instantiate the touchCancel listener
	source.addEventListener("touchcancel", function(evt) {
	    self.onTouchCancel();
	}, false);
    }
}

/**
 * TouchEvents passieren bei Mobilen Geräten auch beim "klicken". Eine
 * Swipe-Gesture wird also erst nur dann ausgelöst, wenn zwischen touch-start
 * und touch-end ein gewisser Schwellwert an Bewegung erkannt wurde.
 */
TouchGesturesObserver.SWIPE_TRESHOLD = 50;

/**
 * Hier geht es nicht darum, ob das aktuelle Device TouchSupport hat. Eher
 * darum, ob das aktuelle Target diesen verarbeiten kann.
 */
TouchGesturesObserver.prototype.hasTouchSupport = function() {

    return this.target.swipeToLeft || this.target.swipeToRight || this.target.swipeUp || this.target.swipeDown
}

/**
 * Callback beim TouchStart
 */
TouchGesturesObserver.prototype.onTouchStart = function(evt) {

    this.touchStartPoint = {
	x : evt.changedTouches[0].pageX,
	y : evt.changedTouches[0].pageY
    };
}

/**
 * Callback beim TouchCancel
 */
TouchGesturesObserver.prototype.onTouchCancel = function(evt) {

    self.touchStartPoint = null;
}

/**
 * Callback beim TouchCancel
 */
TouchGesturesObserver.prototype.onTouchMove = function(evt) {

    if (touchStartPoint) {
	evt.preventDefault;
    }
}

/**
 * Callback beim TouchMove
 */
TouchGesturesObserver.prototype.onTouchEnd = function(evt) {

    var handler = null;
    var value = null;
    var self = this;

    // in strong circumstances, touchmove occures whithout/after some touchStart
    if (self.touchStartPoint != null) {

	var deltaX = evt.changedTouches[0].pageX - self.touchStartPoint.x;
	var deltaY = evt.changedTouches[0].pageY - self.touchStartPoint.y;
	self.touchStartPoint = null;

	// really a swipe gesture?
	if (Math.abs(deltaX) > TouchGesturesObserver.SWIPE_TRESHOLD || Math.abs(deltaY) > TouchGesturesObserver.SWIPE_TRESHOLD) {

	    // is the complete move more a vertical one or a horizontal one?
	    if (Math.abs(deltaX) >= Math.abs(deltaY)) {

		// its's more horizontal
		handler = self.handleHorizontalMove(deltaX);
		value = deltaX;

	    } else {

		// its's more vertical
		handler = self.handleVerticalMove(deltaY);
		value = deltaY;
	    }

	    // we got a handler?
	    if (handler) {
		evt.preventDefault();
		evt.stopPropagation();
		handler();
	    }
	}
    }
    return handler;
}

/**
 * Behandle das Ende einer eher horizontalen bewegung
 * 
 * @return den swipeToLeft/swipeToRight Handler oder null wenn nicht definiert
 */
TouchGesturesObserver.prototype.handleHorizontalMove = function(deltaX) {

    var self = this;
    if (deltaX < 0) {

	// von rechts nach links
	return function() {
	    self.target.swipeToLeft();
	}
    }
    // anderenfalls links nach rechts
    return function() {
	self.target.swipeToRight();
    };
}

/**
 * Behandle das Ende einer eher vertikalen bewegung
 * 
 * @return den swipeUp/swipeDown Handler oder null wenn nicht definiert
 */
TouchGesturesObserver.prototype.handleVerticalMove = function(deltaY) {

    var self = this;
    if (deltaY < 0) {

	// von unten nach oben
	return function() {
	    self.target.swipeUp();
	}
    }
    // anderenfalls oben nach unten
    return function() {
	self.target.swipeDown();
    }
}
