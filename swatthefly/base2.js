if (navigator.userAgent.match(/iPhone/i) != null) {

Array.prototype.removeElement = function (element) {
	for(var i = 0, len = this.length; i < len; i++ ) { 
		if(this[i]==element)
			this.splice(i,1); 
	}
	return this.length;
}

window.Error = function(msg) {
	this.msg = msg;
	AR.logger.error(msg);
	this.toString = function() {
		return this.msg;
	}
};

/* JavaScript
////////////////////////////////////////////////

		H U N T      T H E     F L Y 

////////////////////////////////////////////////
*/

window.wikitude = window.wikitude || {};
wikitude.flyhunt = wikitude.flyhunt || {};
// var AR = AR || {};
// AR.logger = AR.logger || {};
// AR.logger.debug = AR.logger.debug || (function (msg) { alert (msg) });

(function () {

	var DEBUG = false;
	var f = window.wikitude.flyhunt;

	f.DESMO = false;
	//////////////////////////////////////////////////////////////////
	// Desktop Mode
	//////////////////////////////////////////////////////////////////
	f.desktopMode = function (varName) {
		window[varName] = f;
		f.DESMO = true;
		f.fireEvent("loadingFinished");
	};
	
	
	//////////////////////////////////////////////////////////////////
	// Public Init Function
	//////////////////////////////////////////////////////////////////
	var flyhunt_initialized = false;
	f.init = 
	function flyhunt_init (func) {
		if (typeof func == "function") {
			if (flyhunt_initialized) {
				func();
			} else {
				window.addEventListener("load", func);
			}
		}
	};
	
	//////////////////////////////////////////////////////////////////
	// CONSTANTS
	//////////////////////////////////////////////////////////////////
	
	/**
	* Define a constant in FlyHunt
	*
	* @param name	the name for the constant value
	* @param value	the value for the constant
	*/
	f.defineConstant = 
	function flyhunt_defineConstant (name, value) {
		f.__defineGetter__(name, function() { return value; });
		f.__defineSetter__(name, function() {
			throw new Error(name + " is a constant");
		});
	};
	
	/**
	* Define Constants
	*/
	f.defineConstant("VERSION", "1");
	f.defineConstant("MAIN_LOOP_TIMEOUT", 1000.0/15);
	f.defineConstant("PORTRAIT", "portrait");
	f.defineConstant("LANDSCAPE", "landscape");
	f.defineConstant("CLASS_BASE", "flyhunt");
	
	f.toString = function flyhunt_toString () {
		result = "Hunt The Fly " + f.VERSION + "\nARchitect Showcase";	
		return result;
	};
	

	//////////////////////////////////////////////////////////////////
	// Events
	//////////////////////////////////////////////////////////////////
				
	/**
	* Event array of events with listeners
	*/
	var event = new Array();
	
	var eventBuffer = new Array();
	var eventBufferLength = 0;
	f.running = false;
	
	/**
	* Add a callback to an specific array
	*/
	f.addEventType = 
	function flyhunt_addEventType (eventName) {
		if (typeof event[eventName] === "undefined") {
			event.push(eventName);
			event[eventName] = new Array();
			event[eventName + "_len"] = 0;
		} else {
			throw new Error("Event " + eventName + " already added");
		}
	};
	
	// Create Event Types
	(function flyhunt_createEvents() {
	
		f.addEventType('initialize');
		f.addEventType('terminate');
		
		f.addEventType('update');
		f.addEventType('draw');
		
		
		// Resources
		f.addEventType('loadingStarted');
		f.addEventType('loadingStateChanged');
		f.addEventType('loadingFinished');
		
		// Game Specific
		f.addEventType('flyEnterFOV');
		f.addEventType('flyExitFOV');
		f.addEventType('flyKilled');
		
		
		f.addEventType('triggerEnterFOV');
		f.addEventType('triggerExitFOV');
		
		f.addEventType('gameStarted');
		f.addEventType('gameFinished');
		
		f.addEventType('screenResize');
		f.addEventType('orientationChanged');
		
	})();
	
	/**
	* Add Eventlistener to FlyHunt Events
	*/
	f.addEventListener = 
	function flyhunt_addEventListener (eventName, obj, prepend) {
		if (typeof prepend === "undefined") {
			prepend = false;
		}
		if (typeof obj == "function") {
			var temp = {};
			temp[eventName] = obj;
			obj = temp;
		}
		if (typeof event[eventName] == "object") {
			if (prepend) {
				event[eventName + "_len"] =
					event[eventName].push(obj);
			} else {
				event[eventName + "_len"] =
					event[eventName].unshift(obj);
			}
		}
	};
	
	f.removeEventListener =
	function flyhunt_removeEventListener(event_obj, obj) {
		if (typeof event_obj === "undefined") {
			return false;
		}
		if (typeof event_obj == "string") {
			if (typeof obj === "undefined") {
				return false;
			} else {
				event[event_obj + "_len"] =
					event[event_obj].removeElement(obj);
				return true;
			}
		} else {
			flyhunt_deactivate(event_obj);
		}
	};
	
	/**
	* Fire all events in buffer
	*/
	function flyhunt_fireEventBuffer() {
		if (eventBufferLength == 0) return;
		var be; // Buffered Event
		var eventListeners;
		var ell;
		for (var i = eventBufferLength-1; i >= 0; i--) {
			be = eventBuffer[i];
			// Get Event Listeners
			eventListeners = event[be.name];
			ell = event[be.name + "_len"] - 1;
			// Fire Event
			for (ell; ell >= 0; ell--) {
				eventListeners[ell][be.name](be.object);
			}
		}
		eventBufferLength = 0;
		eventBuffer = new Array();
	};
	
	/**
	* Fires in the next update call the events
	*/
	f.fireEvent =
	function flyhunt_fireEvent (eventName, evtobj) {
		eventBufferLength = eventBuffer.unshift({name:eventName, object: evtobj});
	}
	
	/**
	* Fires directly this event to all listeners
	*/
	f.fireEventDirectly = 
	function flyhunt_fireEventDirectly (eventName, evtobj) {
		var i = event[eventName + "_len"] - 1;
		var e = event[eventName];
		for (i; i >= 0; i--) {
			e[i][eventName](evtobj);
		}
	};
	
	//////////////////////////////////////////////////////////////////
	// Visual
	//////////////////////////////////////////////////////////////////
	f.canvas = null;
	f.context = null;
	f.screenWidth = 0;
	f.screenHeight = 0;
	f.scaleFactor = 1;
	f.orientation = "";
	var body = document.getElementsByTagName("html")[0];
	
	function createCanvas() {
		//var w = wikitude.flyhunt.getStyle(body, "width");
		//var h = wikitude.flyhunt.getStyle(body, "height");
		//var jaz = $jaz("<canvas id='flyhunt-canvas'></canvas>");
		//$jaz("body").prepend(jaz);
		//f.canvas = jaz.get(0);
		//f.context = f.canvas.getContext("2d");
		
		function resizeCanvas () {
			AR.logger.debug("resize Canvas:");
			f.screenWidth = window.innerWidth;
			f.screenHeight = window.innerHeight;
			f.fireEvent("screenResize");
			return
			f.canvas.width = f.screenWidth;
			f.canvas.height = f.screenHeight;
			
			// Check orientation
			AR.logger.debug("Window width: " + f.screenWidth + " height: " + f.screenHeight);
			var or;
			if (f.screenWidth > f.screenHeight) {
				f.scaleFactor = f.screenWidth / f.screenHeight;
				or = f.LANDSCAPE;
			} else {
				f.scaleFactor = f.screenHeight / f.screenWidth;
				or = f.PORTRAIT;
			}
			if (f.orientation != or) {
				f.orientation = or;
				f.fireEventDirectly("orientationChanged", f.orientation);
			}
			
			AR.logger.debug("Window orientation " + or);
		};
		
		// Resize Canvas Once to initialize
		resizeCanvas();
		
		// change canvas size when ever the screen size changes
		window.addEventListener("resize", resizeCanvas);
	}
	
	
	//////////////////////////////////////////////////////////////////
	// Update Loop
	//////////////////////////////////////////////////////////////////
	
	f.mainLoopId 	= 0;
	f.time 			= (new Date()).getTime();
	f.deltaTime 	= 0;
	var lastTime 	= 0;
	
	var updateListener = event.update;
	var drawListener = event.draw;
	
	/**
	* update main loop of Hunt The Fly
	*/
	
	
	f.update = 
	function flyhunt_update () {
		// Delta Time
		var time = (new Date()).getTime();
		f.time = time;
		f.deltaTime = (time - lastTime) * 0.001;
		if (f.deltaTime > 1) {
			f.deltaTime = 1; 
		}
		// Change Time
		lastTime = time;
		
		
		
		// Fire Events
		flyhunt_fireEventBuffer();
		
		// Update Listener
		for (var listener = event.update_len - 1; 
			listener >= 0; listener--) 
		{
			updateListener[listener].update();
		}
					
		// Drawing Listener
		//f.context.clearRect(0, 0, f.screenWidth, f.screenHeight);
		
		
		/*
		for (var listener = event.draw_len - 1; 
			listener >= 0; listener--) 
		{
			try{
				drawListener[listener].draw(f.context);
			} catch(error){ // TYPE_MISMATCH_ERR - bei Swatter, INDEX_SIZE_ERR - bei Glass
				AR.logger.warning("Error (f.update-draw-loop) " + drawListener[listener] + " - " + 
				error);
			}
		}
		*/
		
	};

	f.startloop = 
	function flyhunt_startLoop () {
		lastTime = (new Date()).getTime();
		f.mainLoopId = window.setInterval(f.update, f.MAIN_LOOP_TIMEOUT);
		f.running = true;
	};

	f.stoploop = 
	function flyhunt_stopLoop () {
		f.mainLoopId = window.clearInterval(f.mainLoopId);
		f.running = false;
	};
	
	
	//////////////////////////////////////////////////////////////////
	// Modules
	//////////////////////////////////////////////////////////////////
	f.activate = 
	function flyhunt_activate (obj, prepend) {
		if (typeof obj === "undefined") return;
		if (typeof obj == "object") {
			// Prepend boolean check
			if (typeof prepend === "undefined") var prepend = false;
			// Initialize
			if (typeof obj.activate == "function") {
				obj.activate();
			}
			// Activate Events
			var eventName = "";
			for (var i = event.length-1; i >= 0; --i) {
				eventName = event[i];
				if (typeof obj[eventName] == "function") {
					f.addEventListener(eventName, obj, prepend);
				}
			}
		}
	};
	
	f.deactivate = 
	function flyhunt_deactivate (obj) {
		if (typeof obj === "undefined") return;
		if (typeof obj == "object") {
			// Initialize
			if (typeof obj.deactivate == "function") {
				obj.deactivate();
			}
			// Activate Events
			var eventName = "";
			for (var i = event.length-1; i >= 0; --i) {
				eventName = event[i];
				if (typeof obj[eventName] == "function") {
					f.removeEventListener(eventName, obj);
				}
			}
		}
	};
	
	f.activateUDI = function (obj, prepend) {
		throw new Error("Function activateUDI is deprecated");
	};
	
	f.deactivateUDI = function (obj) {
		throw new Error("Function deactivateUDI is deprecated");
	};
	
	f.activateUD = 
	function flyhunt_activateUD (obj, prepend) {
		throw new Error("Function activateUD is deprecated");
	};
	
	f.deactivateUD = 
	function flyhunt_deactivateUD (obj) {
		throw new Error("Function deactivateUD is deprecated");
	};
	
	//////////////////////////////////////////////////////////////////
	// Initialize Hunt The Fly
	//////////////////////////////////////////////////////////////////
	f.init(function() {
		flyhunt_initialized = true;
		if (DEBUG) {
			AR.logger.activateDebugMode();
		}
		// Create drawing canvas object
		createCanvas();
	});
	
	// STYLE FUNCS	
	f.getStyle = function (el, styleName) {
		if(!document.getElementById) return null;

		function toCamelCase( sInput ) {
			var oStringList = sInput.split('-');
			if(oStringList.length == 1) return oStringList[0];
			
			var ret = sInput.indexOf("-") == 0 
				? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1) 
				: oStringList[0];
			for(var i = 1, len = oStringList.length; i < len; i++){
				var s = oStringList[i];
				ret += s.charAt(0).toUpperCase() + s.substring(1)
			}
			return ret;
		}
		
		var value = el.style[toCamelCase(styleName)];
		// If no inline style is set
		if(!value) {
			if(document.defaultView) {
				value = document.defaultView.getComputedStyle(el, "").getPropertyValue(styleName);
			} else if(el.currentStyle) {
				value = el.currentStyle[toCamelCase(styleName)];
			}
		}
		return value;
	};
	
})();

(function createFlyHuntObjects (f) {


	f.defineConstant("DEAD_FLY_DEFAULT_LIVE_TIME", 2);
	f.defineConstant("DEAD_FLY_DEFAULT_FADE_OUT_TIME", 2);
	
	////////////////////////////////////////////////////////
	
	//		  D E A D     F L Y 
	
	////////////////////////////////////////////////////////
	flyhunt_deadfly_update = function() {
		if(this.liveTime > 0) { // opacity = 1
			this.liveTime -= this.base.deltaTime;
		} else if(this.fadeOutTimeCounter > 0) { // fading out
			this.fadeOutTimeCounter -= this.base.deltaTime;
			this.opacity = this.fadeOutTimeCounter / this.fadeOutTime;
			if (this.opacity < 0) this.opacity = 0;
			this.html.style.opacity = this.opacity;
		} else {
			this.base.deactivate(this);
			this.html.style.display = "none";
			this.base.glass.addFly();
		}
	};
	flyhunt_deadfly_draw = function (ctx) {
		ctx.save();
		ctx.globalAlpha = this.opacity;
		AR.logger.debug("X: " +this.x);
		AR.logger.debug("Y: " +this.y);
		AR.logger.debug("WIDTH: " + this.img.width);
		AR.logger.debug("HEIGHT: " + this.img.height);
		AR.logger.debug("SCREEN W: " + window.innerWidth);
		ctx.drawImage(this.img, this.x - this.img.width/2, this.y - this.img.height/2, this.img.width, this.img.height);
		ctx.restore();
	};
	/**
	* liveTime ... how long the img of the dead fly will be shown with full opacity
	* fadeOutTime ... how long the img will fade out, till it is not visible anymore
	*/
	f.DeadFly = function(liveTime, fadeOutTime) {
		this.base = f;
		var f1 = document.getElementById("dead_fly_1");
		var f2 = document.getElementById("dead_fly_2");
		var f3 = document.getElementById("dead_fly_3");
		var f4 = document.getElementById("dead_fly_4");
		if (f1.style.display == "none") {
			this.html = f1;
		} else if (f2.style.display == "none") {
			this.html = f2;
		} else if (f3.style.display == "none") {
			this.html = f3;
		} else if (f4.style.display == "none") {
			this.html = f4;
		} else {
			return;
		}
		var style = this.html.style;
		style.display = "block";
		style.opacity = 1;
		if (typeof liveTime != "number") {
			liveTime = f.DEAD_FLY_DEFAULT_LIVE_TIME;
		}
		if (typeof fadeOutTime != "number") {
			fadeOutTime = f.DEAD_FLY_DEFAULT_FADE_OUT_TIME;
		}
		this.liveTime = liveTime;
		this.fadeOutTime = fadeOutTime;
		this.fadeOutTimeCounter = fadeOutTime;
		

		this.update = flyhunt_deadfly_update;
		//this.draw = flyhunt_deadfly_draw;
		
		this.opacity = 1;
		
		this.img = f.resources.get["fly_dead"];
		if (typeof this.img === "undefined") {
			AR.logger.error("DEAD FLY IMG MISSING");
		}		
		AR.logger.debug(this.img);
		this.x = window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6;
		this.y = window.innerHeight * 0.2 + Math.random() * window.innerHeight * 0.45;
		style.left = this.x + "px";
		style.top = this.y + "px";
		this.base.activate(this);
	};	

	////////////////////////////////////////////////////////
	
	// 			S W A T T E R
	
	////////////////////////////////////////////////////////
	{
	/////////////////////
	// static vars
	/////////////////////
	f.defineConstant("SWATTER_STATUS_LOADING", 			0);
	f.defineConstant("SWATTER_STATUS_CLAP", 			1);
	f.defineConstant("SWATTER_STATUS_CLAP_FINISHED", 	2);
	f.defineConstant("SWATTER_STATUS_RESTORE", 			3);
	f.defineConstant("SWATTER_STATUS_READY", 			4);
	f.defineConstant("SWATTER_STATUS_LOADING_FAILED",	5);
	
	// how long it takes the swatter to load
	//f.defineConstant("SWATTER_LOADING_SPEED", 10);
	f.defineConstant("SWATTER_LOADING_FAILED_SPEED", 50);
	
	// how long the swatter claps
	f.defineConstant("SWATTER_CLAP_SPEED", 300); // was: 500
	
	// how long you the swatter remains still on the cam when it killed a fly
	f.defineConstant("SWATTER_CLAP_FINISHED_TIME", 1000);
	
	// how long the swatter needs to be restored again (remove from cam to start position)
	f.defineConstant("SWATTER_RESTORE_SPEED", 200);
	
	/**
	* status ready: 		angle_ready
	* status loading: 		angle_ready 	to angle_loaded
	* status clap: 			angle_loaded 	to angle_clapped
	* status clap_finished:	angle_clapped
	* status restore: 		angle_clapped	to angle_ready
	*/
	f.defineConstant("SWATTER_ANGLE_READY", 5);
	f.defineConstant("SWATTER_ANGLE_LOADED", 15);
	f.defineConstant("SWATTER_ANGLE_CLAPPED", 90);
	
	f.swatterLoadingSpeed = 10;
	
	
	
	/////////////////////
	// functions
	/////////////////////
	
	// changing the difficulty
	
	/**
	* variables for the difficulty - the changing of the swatter loading speed
	* at first, there is function 1 till the breaktpoint is reaached, then
	* the function 2 defines the raising of the speed
	* 
	* @param numOfKilledFlies ... the number of flies which has already been killed yet
	*/
	
	f.loadingSpeed_breakPoint = 10; // killed flies
	
	flyhunt_swatter_change_loadingSpeed = function(numOfKilledFlies) {
		//f.swatterLoadingSpeed += 1;
		if(numOfKilledFlies < f.loadingSpeed_breakPoint) {
			// function 1
			//f.swatterLoadingSpeed = - Math.log(numOfKilledFlies * 10 + 1) + 10;
			f.swatterLoadingSpeed = 10 - numOfKilledFlies * 0.5;
		} else {
			// do not change anything
			/*
			if(f.swatterLoadingSpeed > 0.8) { // minimal value = 0.1
				f.swatterLoadingSpeed -= 0.7;
			}
			*/
			// function 2
			//f.swatterLoadingSpeed -= 0.5;
		}
		AR.logger.warning("Swatterdifficutly changed to " + f.swatterLoadingSpeed);
		
	};
	
	flyhunt_swatter_toString = function() {
		var s = "Swatter: " ;
			// + "status: " + this.status + ", "
			// + "angle: " + this.angle + ", "
			// + "timeWhenStatusBegan: " + this.timeWhenStatusBegan;
		
		return String(s);
	}
	
	flyhunt_swatter_changeStatus = function(newStatus) {
		this.status = newStatus;
		this.timeWhenStatusBegan = f.time;
		
		if(newStatus === f.SWATTER_STATUS_CLAP_FINISHED) {
			f.killFlies();
		}
	};
	
	
	var counter = 0;
	function flyhunt_swatter_draw (ctx) {
		var _width = 0;
		var _dist = 0;
		var ih = this.img.height;
		var _sh = this.think;
		var _dh = this._STEP_SCALE;
		
		for(var i=0; i<ih; i+=this.think) {
			if (i + this.think > ih) {
				_sh = ih - i;
				_dh = _sh * this._imgScale;
			}
			_dist = this._radius-i;
			_width = (this.img.width + this._prepz*_dist) * this._imgScale;
			
			ctx.save();
			if(this._degree < 90 || this._degree > 270){
				ctx.scale(-1, 1);
			}
			
			if(this.img.tagName == "IMG") { // to avoid an TYPE_MISMATCH_ERR
				/*
				if (counter > 0) {
					AR.logger.error("W: " + this.img.width + " H: " + this.img.height);
					AR.logger.warning("SRC: " + 0 + " | " + i + " | " + this.img.width + " | " + _sh);
					AR.logger.warning("DAR: " + (this._NEG_W_H-(_width*0.5)) + " | " + (this._prepx*_dist+this._offsetY) + " | " + _width + " | " + this._STEP_SCALE);
					counter--;
				}
				*/
				ctx.drawImage(this.img, 
							0, i, // src xy
							this.img.width,	_sh, // src width height
							this._NEG_W_H-(_width*0.5), // destination x
							this._prepx*_dist+this._offsetY, // destination y
							_width, _dh); // destination width height
			} else {
				AR.logger.warning("swatDraw: " + this.img.tagName);
			}
			ctx.restore(); // pop matrix
		}
	};

	flyhunt_swatter_update = function() {
		var nextAngle = 0;
		var nextStatus = 0;
		var nextSpeed = 0;
		var run = false;
		switch(this.status) {
			case f.SWATTER_STATUS_READY: 
				this.angle = f.SWATTER_ANGLE_READY;
				if(f.numberOfSeenFlies > 0) {
					this.changeStatus(f.SWATTER_STATUS_LOADING);
					this.screenResize();
				}
			break;
			case f.SWATTER_STATUS_LOADING_FAILED: 
				nextAngle = f.SWATTER_ANGLE_READY;
				nextStatus = f.SWATTER_STATUS_READY;
				nextSpeed = f.SWATTER_LOADING_FAILED_SPEED;
				run = true;
			break;
			case f.SWATTER_STATUS_LOADING :
				if(f.numberOfSeenFlies == 0) {
					this.changeStatus(f.SWATTER_STATUS_LOADING_FAILED);
					this.screenResize();
				} else {
					nextAngle = f.SWATTER_ANGLE_LOADED;
					nextStatus = f.SWATTER_STATUS_CLAP;
					nextSpeed = f.swatterLoadingSpeed;
					run = true;
				}
			break;
			case f.SWATTER_STATUS_CLAP :
				nextAngle = f.SWATTER_ANGLE_CLAPPED;
				nextStatus = f.SWATTER_STATUS_CLAP_FINISHED;
				nextSpeed = f.SWATTER_CLAP_SPEED;
				run = true;
			break;
			case f.SWATTER_STATUS_CLAP_FINISHED :
				// to do
				this.angle = f.SWATTER_ANGLE_CLAPPED;
				if(f.time - this.timeWhenStatusBegan >= f.SWATTER_CLAP_FINISHED_TIME) {
					// begin removing the clapper from the screen
					this.changeStatus(f.SWATTER_STATUS_RESTORE);
				}
			break;
			case f.SWATTER_STATUS_RESTORE :
				nextAngle = f.SWATTER_ANGLE_READY;
				nextStatus = f.SWATTER_STATUS_READY;
				nextSpeed = f.SWATTER_RESTORE_SPEED;
				run = true;
			break;
		}
		
		if (run) {
			if (this.angle > nextAngle) {
				this.angle -= f.deltaTime * nextSpeed;
				if (this.angle < nextAngle) {
					this.angle = nextAngle;
					this.changeStatus(nextStatus);
				}
			} else {
				this.angle += f.deltaTime * nextSpeed;
				if (this.angle > nextAngle) {
					this.angle = nextAngle;
					this.changeStatus(nextStatus);
				}
			}
		}
		this.setAngle(this.angle);
	};
	
	f.Swatter = function() {
		this.numOfKilledFlies = 0;
		
		this.status = null;
		this.timeWhenStatusBegan = null;
		this.angle = f.SWATTER_ANGLE_READY;
	
		this.changeStatus = flyhunt_swatter_changeStatus;
		this.changeStatus(f.SWATTER_STATUS_READY);
		
		this.update = flyhunt_swatter_update;
		//this.draw = flyhunt_swatter_draw;
		this.toString = flyhunt_swatter_toString;
		
		// VISUAL
		this.img = f.resources.get["swatter"];
		
		var RAD = Math.PI/180;
		this.think = 10;
		
		this._radius = this.img.height/2;
		this._offsetY = 0;
		this._imgScale = 1;
		this._offsetY_A = 1;
		this._offsetY_B = 1/90;
		this._degree = 90;
		this._degreeRAD = 0;
		this._prepx = 0;
		this._prepz = 0;
		this._NEG_W_H = (-f.screenWidth/2);
		this._STEP_SCALE = 1;
		this.angle = 0;
		
		this.html = null;
		
		this.setAngle = function (angle) {
			
			if (this.html == null) {
				this.html = document.getElementById("swatter");
			} else {
				this.html.style.height = angle + "%";
			}
			
			return;
			this.angle = angle;
			var newAngle = (-angle) - 90;
			if (this._degree == newAngle) return;
			this._degree = newAngle;
			this._degreeRAD = this._degree*RAD;
			this._offsetY = this._offsetY_A * this.angle + f.screenHeight * (1-this._offsetY_B*this.angle);
			this._prepx = Math.cos(this._degreeRAD) * this._imgScale;
			this._prepz = Math.sin(this._degreeRAD) * 0.5;
		}
		
		this.setAngle(45);
		
		this.screenResize = function () {
			return;
			this._imgScale = 1/this.img.width*f.screenWidth;
			this._prepx = Math.cos(this._degreeRAD) * this._imgScale;
			this._offsetY = this._offsetY_A * this.angle + f.screenHeight * (1-this._offsetY_B*this.angle);
			this._STEP_SCALE = this.think * this._imgScale;
			this._NEG_W_H = (-f.screenWidth/2);
			this._offsetY_A = (this.img.height*this._imgScale*0.5) * this._offsetY_B;
		};
		
		f.screenWidth = window.innerWidth;
		f.screenHeight = window.innerHeight;
		this.screenResize();
		this.setAngle(45);
		
		
		
		// if this is not outcommented, there will be created tonns of flies!!
		this.changeDifficulty = flyhunt_swatter_change_loadingSpeed;
		this.flyKilled = function(numOfFlies) {
			if(numOfFlies > 0) {
				this.numOfKilledFlies += numOfFlies;
				this.changeDifficulty(this.numOfKilledFlies);
			}
		};
		
		
		
		this.activate = function() {
			this.numOfKilledFlies = 0;
		};
		
		
		
		
		
		
		//f.addEventListener("flyKilled", 		this.changeDifficulty);
	};
} // END SWATTER
	
	
	
})(wikitude.flyhunt);

//////////////////////////////////////////////////////
// ProgressImage
//////////////////////////////////////////////////////
window.xis = window.xis || {}; xis.html = xis.html || {};
xis.html.ProgressImage = function (id, text, shiftX, shiftY) {

	var progJaz = $jaz("<span id='" + id + "'>"+ text +"</span>");
	
	var _visible = true;

	this.sx = shiftX;
	this.sy = shiftY;
	
	this.show = function() {
		progJaz.show();
	};
	this.hide = function() {
		progJaz.hide();
	};
	this.visible = function(vis) {
		if (typeof vis === "undefined") {
			return _visible;
		} else {
			_visible = vis;
		}
	};
	
	/**
	* Set the state of the progress
	* 
	* state	the state of progress in ]0, 100[
	*/
	this.setState = function(state) {
		if (state < 0) state = 0;
		if (state > 100) state = 100;
		if (state >= 0 && state <= 100) {
			state /= 10;
			state = Math.round(state);
			alert(state);
			progJaz.css("backgroundPosition", (-this.sx * state) + "px " + (-this.sy * state) + "px");
		} else {
			throw new Error("Invalid state! ]0, 100[ given: " + state);
		}
	};
	
	this.setState(0);
	
	this.addClass = function (className) {
		progJaz.addClass(className);
	};
	this.removeClass = function(className) {
		progJaz.removeClass(className);
	};
	
	this.setId = function (id) {
		progJaz.attr("id", id);
	};
	this.getId = function () {
		return progJaz.attr("id");
	};
	
	this.appendTo = function (parent) {
		$jaz(parent).append(progJaz);
	};
	this.prependTo = function (parent) {
		$jaz(parent).prepend(progJaz);
	};
	this.getElement = function() {
		return progJaz.get(0);
	};
};

//////////////////////////////////////////////////////
// Progressbar
//////////////////////////////////////////////////////

xis.html.ProgressBar = function (className) {
	
	var progJaz = $jaz("<div></div>");
	var sliderJaz = $jaz("<div style='width: 0%; height: 100%'></div>");
	var _visible = true;
	
	if (typeof className !== "undefined") {
		progJaz.addClass(className);
	}
	
	progJaz.append(sliderJaz);
	
	this.show = function() {
		progJaz.css("display", "inline-block");
	};
	this.hide = function() {
		progJaz.css("display", "none");
	};
	this.visible = function(vis) {
		if (typeof vis === "undefined") {
			return _visible;
		} else {
			_visible = vis;
		}
	};
	
	/**
	* Set the state of the progress
	* 
	* state	the state of progress in ]0, 100[
	*/
	this.setState = function(state) {
		if (state >= 0 && state <= 100) {
			sliderJaz.css("width", state + "%");
		} else {
			throw new Error("Invalid state! ]0, 100[ given: " + state);
		}
	};
	
	this.addClass = function (className) {
		progJaz.addClass(className);
	};
	this.removeClass = function(className) {
		progJaz.removeClass(className);
	};
	
	this.setId = function (id) {
		progJaz.attr("id", id);
	};
	this.getId = function () {
		return progJaz.attr("id");
	};
	
	this.appendTo = function (parent) {
		$jaz(parent).append(progJaz);
	};
	this.prependTo = function (parent) {
		$jaz(parent).prepend(progJaz);
	};
	this.getElement = function() {
		return progJaz.get(0);
	};
};

}