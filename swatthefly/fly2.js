	///////////////////////////////////////////////////////////////////////////////
	//
	//	FLYHUNT - WORLD
	//
	///////////////////////////////////////////////////////////////////////////////
	
	// angi: http://db.tt/imtTLaNX
	// http://goo.gl/oA0un

	alert = AR.logger.info;
	
	window.wikitude = window.wikitude || {};
	wikitude.flyhunt = wikitude.flyhunt || {};
	
	(function createUtil (base) {
		base.util = {};
		var u = base.util;
		
		u.convertToLatLon = function(lat, lon, x, y) {
			var retVal = {};
			
			var ll = new LatLng(lat, lon);
			var utm = ll.toUTMRef();
			
			alert("convertFromLatLon: " + lat + " " + lon);
			alert("in UTM: " + utm.easting + " " + utm.northing);
		
			utm.easting += x;
			utm.northing += y;

			ll = utm.toLatLng();

			retVal.latitude = ll.lat;
			retVal.longitude = ll.lng;
			return retVal;
		};
	
		/**
		* Get a random number between min and max
		*
		* @param min	the minimum of number you can get randomly
		* @param max	the maximum of number you can get randomly
		*/
		u.getRandom = function(min, max) {
			if(min == max) {
				return min;
			}
			return min + Math.random() * (max-min);
		};
	
		/**
		* get the shortest randiant distance on an circle beteween two positions
		*
		* @return the shortest distance in radiant
		*
		* @param a	an angle in radiant
		* @param b	an angle in radiant
		*/
		u.getRadiantDistance = function (a, b) {
			var p2 = Math.PI * 2;
			var d = 0;
			
			// back to 2 PI
			while ( a >= p2 ) {
				a -= p2;
			};
			while ( b >= p2 ) {
				b -= p2;
			};
			
			// check Size
			if (a > b) {
				d = a - b;
			} else if (b > a) {
				d = b - a;
			}
			
			// check shortest
			if (d > Math.PI) {
				d = p2 - d;
			}
			
			return Math.abs(d);
		};
		
		/**
		* get the distance required positive (righthand) and negative (lefthand)
		*
		* @return the shortest distance required negative and positive values
		*
		* @param a	an angle in radiant
		* @param b	an angle in radiant
		*/
		u.getRadiantDifference = function (a, b) {
			var p2 = Math.PI * 2;
			var d = 0;
			
			// back to 2 PI
			while ( a >= p2 ) {
				a -= p2;
			};
			while ( b >= p2 ) {
				b -= p2;
			};
			
			// check Size
			var a_greate = false;
			if (a > b) {
				d = a - b;
				a_greate = true;
			} else if (b > a) {
				d = b - a;
				a_greate = false;
			}
			
			// check shortest
			if (d > Math.PI) {
				d = p2 - d;
			}
			
			return (a_greate?d:-d);
		};
		
		u.getDegreeDistance = function (a, b) {
			var p2 = 360;
			var d = 0;
			// back to 2 PI
			while ( a >= p2 ) {
				a -= p2;
			};
			while ( b >= p2 ) {
				b -= p2;
			};
			// check Size
			if (a > b) {
				d = a - b;
			} else if (b > a) {
				d = b - a;
			}
			
			// check shortest
			if (d > 180) {
				d = 360 - d;
			}
			
			return Math.abs(d);
		};
		
	})(wikitude);
	
	(function createDeviceSize (base) {
		base.deviceSize = {};
		var ds = base.deviceSize;
		
		/**
		* Device Size
		*/
		var deviceSizes = new Array();
		var activeDeviceSize = null;
		var activeDeviceSizeS = null;
		function calculateDeviceSize () {
			// Sort
			deviceSizes.sort(function (a, b) {
				return b.size - a.size;
			});
			// active size
			var wh = window.innerHeight;
			var ww = window.innerWidth;
			var ws = (wh > ww)?wh:ww;
			var wl = (wh < ww)?wh:ww;
			var len = deviceSizes.length;
			activeDeviceSize = null;
			for (var i = 0; i < len; i++) {
				alert(deviceSizes[i].name + " " + deviceSizes[i].size);
				if (deviceSizes[i].size >= ws) {
					activeDeviceSize = deviceSizes[i];
				}
				if (deviceSizes[i].size >= wl) {
					activeDeviceSizeS = deviceSizes[i];
				}
			}
			if (activeDeviceSize == null) {
				activeDeviceSize = deviceSizes[0];
			}
		}
		
		ds.define = function(name, size) {
			deviceSizes.push({name: name, size: size});
			calculateDeviceSize();
		};
		
		ds.getName = function(small) {
			if (typeof small === "undefined") small = false;
			if (small && activeDeviceSizeS) {
				return activeDeviceSizeS.name;
			} else if (!small && activeDeviceSize) {
				return activeDeviceSize.name;
			} else {
				throw new Error("No device size defined!");
			}
		};
		
		ds.is = function (dsName, small) {
			if (typeof small === "undefined") small = false;
			if (small && activeDeviceSizeS) {
				return activeDeviceSizeS.name == dsName;
			} else if (!small && activeDeviceSize) {
				return activeDeviceSize.name == dsName;
			} else {
				throw new Error("No device size defined!");
			}
		}
		
		ds.isNot = function (dsName, small) {
			return !ds.is(dsName, small);
		}
		
		ds.getSize = function(small) {
			if (typeof small === "undefined") small = false;
			if (small && activeDeviceSizeS) {
				return activeDeviceSizeS.size;
			} else if (!small && activeDeviceSize) {
				return activeDeviceSize.size;
			} else {
				throw new Error("No device size defined!");
			}
		}
		
	})(wikitude.util);
	
	(function initializeFlyHunt() {
		var f = wikitude.flyhunt;
		var ds = wikitude.util.deviceSize;
		var util = wikitude.util;
		
		///////////////////////////////////////////////////////////////////////////////
		//
		// variables
		//
		///////////////////////////////////////////////////////////////////////////////
		f.defineConstant("rootpath", "resources/");
		
		// messages
		f.msg_intro = "Hi, this is the game 'hunt the fly'.";
		f.msg_killedFly = "Great, you've killed a fly!";
		f.msg_loading = "loading....";
		f.msg_restart = "Restart game";
		f.msg_info = "Look around to find the fly, when you've found it watch it \
			till the swatter kills it.";
		
		// html elements
		f.id_msg = "message";
		f.id_progressbar = "progressbar";		
		
		///////////////////////
		// game variables
		//////////////////////
		
		//----------------
		// L O C A T I O N
		//----------------
		// current points
		//f.points = 0.2;						
		
		f.currentLocation = null; //new AR.GeoLocation(0.0,0.,0.);
		//f.currentLocation.lat = 47.772843;
		//f.currentLocation.lon =  13.081243;
		
		// ---- game specific ---------

		//----------------
		// F L Y
		//----------------
		
		f.numberOfSeenFlies = 0;
		f.defineConstant("FLY_CIRCLE_RADIUS", 2000);
		f.defineConstant("FLY_SIZE", 3);
		f.defineConstant("FLY_INVALID_ANGLE_RANGE", Math.PI / 2);
		f.flyIDCounter = 0;
		f.lastAngleOfKilledFly = 0;
		
		// FLY Animation
		//----------------
		f.defineConstant("FLY_ANIMATION_SPEED", 10);
		// store each image of the animation in this array
		f.animatedImages = new Array(); 		
		f.numberOfAnimatedImages = 0;
	
		////////////////////////////////////////////////////////
		
		// 			F L Y
		
		////////////////////////////////////////////////////////
		
		// lastangle can be undefined
		// returns a random position, when angle not set
		// returns a value, which is not near angle (not in range +/- f.FLY_INVALID_ANGLE_RANGE)
		f.getNewRandomFlyLocation = function(lastAngle) {
			alert("MY last ANGLE: " + lastAngle);
			var xRnd = util.getRandom(0, 2 * Math.PI);
			
			// change the xRnd (angle) in a greater range than +/- f.FLY_INVALID_ANGLE_RANGE)
			if(typeof lastAngle == "number") {
				if (util.getRadiantDistance(xRnd, lastAngle) <= f.FLY_INVALID_ANGLE_RANGE/2) {
					xRnd = Math.PI + xRnd;
					if (xRnd > 2*Math.PI) {
						xRnd = xRnd - 2*Math.PI;
					}
				}
			}
			
			AR.logger.debug("lastAngle: " +  String((lastAngle * 180/Math.PI)) + 
				" - new Angle: " + (xRnd * 180/Math.PI) );
			
			var x = Math.cos(xRnd) * f.FLY_CIRCLE_RADIUS;
			var y = Math.sin(xRnd) * f.FLY_CIRCLE_RADIUS;
			alert("x: " + x + " y: " + y);
			var newLocation = util.convertToLatLon(f.currentLocation.latitude, f.currentLocation.longitude, x, y);
			alert("New Lat: " + newLocation.latitude + " lon: " + newLocation.longitude);
			return {newLoc: newLocation, angle: xRnd};
		};
		
		
		/**
		* converts the angle into a valid fly location value, like the getNewRandlomFlyLocation-function does
		* make sure that newRadAngle is a valid angle value (between 0 and 2* Math.PI - radiant)
		*/
		f.getFlyLocationFromAngle = function (newRadAngle) {
			
			var x = Math.cos(newRadAngle) * f.FLY_CIRCLE_RADIUS;
			var y = Math.sin(newRadAngle) * f.FLY_CIRCLE_RADIUS;
			alert("x: " + x + " y: " + y);
			var newLocation = util.convertToLatLon(f.currentLocation.latitude, f.currentLocation.longitude, x, y);
			alert("New Lat: " + newLocation.latitude + " lon: " + newLocation.longitude);
			return {newLoc: newLocation, angle: newRadAngle};
		};
		
		function flyhunt_fly_deactivate () {
			this.geoObject.enabled = false;
			
			this.imageDrawable.destroy();
			this.imageDrawable = null;

			this.geoLocation.destroy();
			this.geoLocation = null;
			
			this.geoObject.destroy(); 
			this.geoObject = null;
		};
		
		function flyhunt_fly_toString () {
			
			var s = "Fly : " 
				+ "isSeen: " + this.isSeen + ", "
				+ "time till i change pos: " + String(f.time - this.nextTimeToChangePos) + ", " 
				// + "location: " + 
				;
			
			return s;
		};
		
		function flyhunt_fly_changePosition () {
			if (!this.geoLocation) return;
			
			var newLocationObject = f.getNewRandomFlyLocation();
			
			var newLocation = newLocationObject.newLoc;
			//AR.logger.warning("Check if fly got new angle Loc: " + newLocationObject.angle);
			this.lastAngle = newLocationObject.angle;
			//AR.logger.warning("Check if fly got new angle Fly: " + this.lastAngle);
			
			var timeToFlyToNewPosition = util.getRandom(2000, 5000);
			this.nextTimeToChangePos = f.time + util.getRandom(2000, 6000);
			
			var latAnimation = new AR.PropertyAnimation(
				this.geoLocation, //the object geoLocation holds the animated property
				"latitude", //the property latitude will be animated
				null, //the start value of the animation (the current value)
				newLocation.latitude, //the resulting value of the animation
				timeToFlyToNewPosition, //the duration of the animation
				new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD) //easing curve
			);
		
			var lngAnimation = new AR.PropertyAnimation(
				this.geoLocation, //the object geoLocation holds the animated property
				"longitude", //the property longitude will be animated
				null, //the start value of the animation (the current value)
				newLocation.longitude, //the resulting value of the animation
				timeToFlyToNewPosition, //the duration of the animation
				new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD) //easing curve
			);
		
			latAnimation.start();
			lngAnimation.start();
				
		};
		
				/**
		* @param newPositionAngle ... location in angle where the fly shall fly to
		* @param flyDuration ... time how long it takes the fly to fly to the specified location
		* @param timeToStayAtNewPosition ... how long the fly will stay at this position until it
		* begins to change its position as usual
		
		*/
		function flyhunt_fly_flyNowToNewPosition(newPositionAngle, flyDuration, timeToStayAtNewPosition) {
			var newLocationObject = f.getFlyLocationFromAngle(newPositionAngle);
				
			var newLocation = newLocationObject.newLoc;
			//AR.logger.warning("Check if fly got new angle Loc: " + newLocationObject.angle);
			this.lastAngle = newPositionAngle; // newLocationObject.angle;
			//AR.logger.warning("Check if fly got new angle Fly: " + this.lastAngle);
			
			
			var timeToFlyToNewPosition = flyDuration;
			this.nextTimeToChangePos = f.time + flyDuration + timeToStayAtNewPosition; 
			// == now + how long fly needs to fly there + timetoStaythere
			
			var latAnimation = new AR.PropertyAnimation(
				this.geoLocation, //the object geoLocation holds the animated property
				"latitude", //the property latitude will be animated
				null, //the start value of the animation (the current value)
				newLocation.latitude, //the resulting value of the animation
				timeToFlyToNewPosition, //the duration of the animation
				new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD) //easing curve
			);
		
			var lngAnimation = new AR.PropertyAnimation(
				this.geoLocation, //the object geoLocation holds the animated property
				"longitude", //the property longitude will be animated
				null, //the start value of the animation (the current value)
				newLocation.longitude, //the resulting value of the animation
				timeToFlyToNewPosition, //the duration of the animation
				new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD) //easing curve
			);
		
			latAnimation.start();
			lngAnimation.start();
		};
		
		function flyhunt_fly_update () {
			// AR.logger.debug(f.time + " " + this.nextTimeToChangePos);
			// problem: this.nextTimeToChangePos is undefined!
			
			// to do;
		
			this.animateImagesCounter += f.deltaTime;
			var help = (this.animateImagesCounter * f.FLY_ANIMATION_SPEED);
			help = help.toFixed(0); // (help - (help % 1))
			
			var newImgNr =  help % f.numberOfAnimatedImages;
			
			if(this.currentImg != newImgNr) {
				this.imageDrawable.imageResource = f.animatedImages[newImgNr];
				this.currentImg = newImgNr;
			}
			
			//AR.logger.debug("fly: imgNr: " + this.currentImg);
		
			// to do: change this (remove return):
			//return;
			if(f.time >= this.nextTimeToChangePos) {
				this.changePosition();
				//AR.logger.debug("fly change pos");
			}
			//AR.logger.debug("updated fly");
		};
		
		
		f.Fly = function(lastAngle) {
		
			// Set Variables
			this.id = f.flyIDCounter++;
			this.currentImg = 0;
			this.isSeen = false;
			
			// Animation
			this.animateImagesCounter = 0;
			
			this.nextTimeToChangePos = 20;
			if(f.time) {
				this.nextTimeToChangePos = f.time + 5000;
			} 
			
			// POSITION
			var locationInfoObject = f.getNewRandomFlyLocation(lastAngle);
			//alert("Fly: new geoLocation: " + locationInfoObject.newLoc.lat + " " + locationInfoObject.newLoc.lon + " " + f.currentLocation.alt);
			this.geoLocation = new AR.GeoLocation(locationInfoObject.newLoc.latitude, 
				locationInfoObject.newLoc.longitude, f.currentLocation.altitude);
			this.lastAngle = locationInfoObject.angle;
			//AR.logger.debug("Fly: 2" + lastAngle + " " + this.geoLocation.latitude + " " + this.geoLocation.longitude);
			
			var imgRes = f.resources.get["fly2"];
			
			this.imageDrawable = new AR.ImageDrawable(imgRes, f.FLY_SIZE, {enabled: true});
			
			//AR.logger.debug("Fly: 3");
			this.geoObject = new AR.GeoObject(this.geoLocation, {
			
				triggers: {
					onEnterFieldOfVision: function() { f.fireEvent("flyEnterFOV", this.flyId);},
					onExitFieldOfVision: function() { f.fireEvent("flyExitFOV", this.flyId);},
				},
				
				drawables : {
								cam : [this.imageDrawable]
							}
			}); // to do! - set drawables right
			this.geoObject.triggers.flyId = this.id;
			this.geoObject.flyId = this.id;
			
			//AR.logger.debug("Fly: 4");
			
			// FUNCTIONS
			this.update 		= flyhunt_fly_update;
			this.changePosition	= flyhunt_fly_changePosition;
			this.toString 		= flyhunt_fly_toString;
			this.deactivate 	= flyhunt_fly_deactivate;
		
			
			// new:
			this.changeNowPosition = flyhunt_fly_flyNowToNewPosition;
		
		
			// add me to update
			f.activate(this);
			//AR.logger.debug("Fly Created: " + this.id );
		};
		
				
		////////////////////////////////////////////////////////
		
		// 			TRIGGER OBJECT
		
		////////////////////////////////////////////////////////
		
		/**
		* a trigger object is a static geoobject positioned in a special angle to the user
		* it is necessary to find out in which direction the user looks, which is needed
		* for showing the user in which direction the user shall look to find the fly
		*/
		
		f.triggerManager = null;
		
		// attention, this method does not return a geolocation, but an object with the needed values
		function flyhunt_getGeoLocationValues(angle) {
			var xRnd = angle;
			var x = Math.cos(xRnd) * f.FLY_CIRCLE_RADIUS;
			var y = Math.sin(xRnd) * f.FLY_CIRCLE_RADIUS;
			//AR.logger.debug("x: " + x + " y: " + y);
			var newLocation = util.convertToLatLon(f.currentLocation.latitude, f.currentLocation.longitude, x, y);
			//AR.logger.debug("getGeoLocVal: Lat: " + newLocation.latitude + " lon: " + newLocation.longitude);
			return newLocation;
		};
		
		// angle in radiant
		f.Trigger = function(angle) {
			var newLoc = flyhunt_getGeoLocationValues(angle);
			var geoLocation = new AR.GeoLocation(newLoc.latitude, 
				newLoc.longitude, f.currentLocation.altitude);
			
			var drawable = new AR.Circle(0.1, {opacity: 0.1, style: { fillColor: '#FFC10000'}});
			/*
			var label = new AR.Label(String(angle) / Math.PI * 180, 2, {
			  offsetY : 1,
			  verticalAnchor : AR.CONST.VERTICAL_ANCHOR.TOP,
			  opacity : 1
			});
			*/
			
			
			var geoObject = new AR.GeoObject(geoLocation, {
				triggers: {
					onEnterFieldOfVision: (function (x) { 
							return function() { f.fireEvent("triggerEnterFOV", x); }; 
						})(angle)
					,
					// img.onload = (function (x) { return function() { r.loaded(x); } })(res.name);		
					onExitFieldOfVision: 
						(function (x) { 
							return function() { f.fireEvent("triggerExitFOV", x); }; 
						})(angle),
				},
				
				drawables : {
								cam : [drawable]
							}
			});
			geoObject.fly_angle = angle;
			// VARIABLES
			this.geoObject = geoObject;
			this.angle = angle;
		
		};
		
		function flyhunt_triggerManager_createTriggers () {
			
			this.triggers.push(new f.Trigger(0));
			this.triggers.push(new f.Trigger(Math.PI/2));
			this.triggers.push(new f.Trigger(Math.PI));
			this.triggers.push(new f.Trigger(Math.PI * 1.5));
			
			this.triggers.push(new f.Trigger(Math.PI / 4));
			this.triggers.push(new f.Trigger(Math.PI * 3/4));
			this.triggers.push(new f.Trigger(Math.PI * 5/4));
			this.triggers.push(new f.Trigger(Math.PI * 7/4));
		};
		
		

		function flyhunt_triggerManager_checkFlyVisibility() {
			//AR.logger.debug("checkFlyVisibility begins");
			//try {
			if(this.hidden) {return; }
			
				
				// if i see a fly, i don't want to see any help
				if(f.numberOfSeenFlies > 0) {
					AR.logger.debug("--- checkFlyVisibility: you see a fly");
					this.lookLeft.style.display = "none";
					this.lookRight.style.display = "none";
					
					
				} else {
				
					var angle = 0;
					if(f.flies.length != 0) { 
						var nearestFly = f.flies[0]; // to do, when there are more than one fly
						angle = wikitude.util.getRadiantDifference( this.seenTriggerAngle, nearestFly.lastAngle);
					}
					
					if(angle > 0) { // positive -> look right
						
						this.lookLeft.style.display = "none";
						this.lookRight.style.display = "block";
						
						
					} else if(angle < 0) {
						
						this.lookLeft.style.display = "block";
						this.lookRight.style.display = "none";
						
					
					} else {
						
					};
				}
				//AR.logger.debug("checkFlyVisibility ready");
			//	} catch(e) { AR.logger.error("checkFlyVisibility: " + e);}
		};
		
		function flyhunt_triggerManager_triggerEnterFOV(triggerAngle) {
			this.seenTriggerAngle = triggerAngle;
			
		};
		
		function flyhunt_triggerManager_flyEnterExitFOV() {
			this.checkFlyVisibility();
		};
		
		function flyhunt_triggerManager_hide() {
			this.hidden = true;
			this.lookLeft.style.display = "none";
			this.lookRight.style.display = "none";
			AR.logger.warning("triggerManager: hidden: " +this.hidden);
			
			// just for debugging:
			//document.getElementById("lookRight").style.display = "block";
		};
		
		f.TriggerManager = function() {
			AR.logger.debug("i will create the triggerManager");
			this.lookLeft = document.getElementById("flyhunt-left");
			this.lookRight = document.getElementById("flyhunt-right");
			
			this.hidden = false;
			
			// METHODS
			this.checkFlyVisibility = flyhunt_triggerManager_checkFlyVisibility;

			this.triggerEnterFOV = flyhunt_triggerManager_triggerEnterFOV;
			
			this.flyEnterFOV = this.checkFlyVisibility; // flyhunt_triggerManager_flyEnterExitFOV;
			this.flyExitFOV = this.checkFlyVisibility; // flyhunt_triggerManager_flyEnterExitFOV;
			
			this.createTriggers = flyhunt_triggerManager_createTriggers;
			//this.getAngle = flyhunt_triggerManager_getAngleInfo;
		
			this.hide = flyhunt_triggerManager_hide;
			this.show = function() {
				this.hidden = false;
				flyhunt_triggerManager_checkFlyVisibility();
				AR.logger.warning("triggerManager: hidden: " + this.hidden);
			};
			

			// VARIABLES
			this.triggers = new Array(); // the createTriggers-Method will add the triggers to this array
			this.seenTriggerAngle = 0;
			
			// INIT
			this.createTriggers();
			
			f.addEventListener("triggerEnterFOV", this, true);
		
			f.addEventListener("flyEnterFOV",	this);
			f.addEventListener("flyExitFOV",	this);

			AR.logger.debug("i have created the triggerManager");
		};
		
		
		
		
		////////////////////////////////////////////////////////
		
		// 		G A M E
		
		////////////////////////////////////////////////////////
		f.startGame = null;
		f.stopGame = null;
		f.resetGame = null;
		
		f.initializeGameMode = function (gameObj) {
			if (typeof gameObj.start == "function") {
				f.startGame = gameObj.start;
			} else {
				throw new Error("FlyHunt Game required 'start' function");
			}
			if (typeof gameObj.stop == "function") {
				f.stopGame = gameObj.stop;
			} else {
				throw new Error("FlyHunt Game required 'stop' function");
			}
			if (typeof gameObj.reset == "function") {
				f.resetGame = gameObj.reset;
			} else {
				throw new Error("FlyHunt Game required 'reset' function");
			}
			alert("init game mode: " + gameObj);
			f.activate(gameObj);
		};
		
		f.startClassic = function() {
			try {
				f.resetGame();
				f.startGame();
				$jaz("#tutimg").hide();
				f.endcount.hide();
				document.getElementById("but_newGame").style["display"] = "none";
			} catch (error) {
				AR.logger.error("c.startClassic: " + error);
			}
		};
		
		////////////////////////////////////////////////////////
		
		// 		F L I E S
		
		////////////////////////////////////////////////////////
		f.flies = new Array();
		
		// new from angi
		f.deactivateAllFlies = function() {
			//if(typeof f.flies === "Array") {
		
				for(var num = f.flies.length - 1; num >= 0; --num) {
					// flyhunt_fly_deactivate(
					//f.flies[num].deactivate();
					f.deactivate(f.flies[num]);
				}
			//}
			
			f.triggerManager.checkFlyVisibility();
		};
		
		f.getFlyByID = function(flyID) {
			for(var num = f.flies.length - 1; num >= 0; --num) {
				if(f.flies[num].id == flyID) {
					return f.flies[num];
				}
			}
			return null;
		};
		/**
		* lastAngle can be undefined, that is no problem!
		*/
		f.createNewFly = function() {
			AR.logger.debug("will create fly")
			var fly = new f.Fly(f.lastAngleOfKilledFly);
			AR.logger.debug("created fly");
			f.flies.push(fly);
			f.triggerManager.checkFlyVisibility();
			return fly;
		};
		
		// new
		/*
		This function lets the fly fly in front of the camera at the beginning of the game
		to make sure that the user understands what to do
		*/
		
		f.setFlyInFrontOfCameraObject = function() {
			this.triggerEnterFOV = function() {
			
				// now i don't want the fly to circle anymore,
				// needed, if the flyRound-function is also used
				f.stillFlyAround = false;  
			
				AR.logger.warning("> sFiFoC: triggerEnterFOV");
				AR.logger.warning("> sFiFoC: first time: triggerEnterFOV - setFlyInFrontOfCamera");
				if(f.triggerManager && f.flies && f.flies[0]) { 
					// if i do already see the fly, this functionality is not necessary
					if(f.numberOfSeenFlies <= 0) {
						AR.logger.warning("> sFiFoC: seenTriggerAngle: " 
							+ (f.triggerManager.seenTriggerAngle * 180 / Math.PI)
							+ " ( " + f.triggerManager.seenTriggerAngle + " rad)");
						f.flies[0].changeNowPosition(f.triggerManager.seenTriggerAngle, 2000, 1000);
					} else {
						AR.logger.warning("> sFiFoC: You do already see a fly.");
					}
				} 	else {
					AR.logger.warning("something went wrong");
				}
				// i only want this functionality to work once (at the beginning)
				f.removeEventListener("triggerEnterFOV", this);
			};
		};
		
		f.setFlyInFrontOfCamera = function() {
			AR.logger.warning("setFlyInFrontOfCamera (sFiFoC) was activated");	
			// the object is needed, because i can only remove an eventlistenter Object
			// and not an eventlistener function from event listening
			f.addEventListener("triggerEnterFOV", new f.setFlyInFrontOfCameraObject()); 
		};
		
		
		
		/** 
		* this function lets the fly fly in a circle around the device to make sure
		* that the user has already seen the fly and knows how to look for the fly
		* @param angle ... the angle of the last trigger, where the fly was
		* @param flyID (optional)... the id of the fly, which shall fly a round, if not 
		* defined the fly f.flies[0] will be used, to avoid that the second fly finishes 
		* flying the circle
		*/
		
		f.stillFlyAround = true;
		
		// unused function, used setFlyInFrontOfCamera instead
		f.flyARound = function(angle, flyID) {
			if(f.triggerManager && f.flies && f.flies[0] && f.stillFlyAround) {
				if(typeof flyID == "undefined") { 
					flyID = f.flies[0].id;
				}
			
				// if the first fly has already died, i don't want
				// the second fly to fly around like that
				if(flyID == f.flies[0].id) { // still the first fly 
					var newAngle = angle + Math.PI/2.0;
					
					if(newAngle <= Math.PI * 2.0) {
						f.flies[0].changeNowPosition(newAngle, 1000, 8530);
						//AR.logger.debug("flyARound: " + newAngle / (Math.PI) * 180);
						setTimeout(function() { f.flyARound(newAngle, flyID); }, 1500 );
					}
				}
			}
		};
		
		f.flyEnterFOV = function(flyID) {
			if (f.numberOfSeenFlies < f.flies.length) {
				f.resources.get.buzz.play();
			}
			f.numberOfSeenFlies++;
			var fly = f.getFlyByID(flyID);
			if (fly) {
				fly.isSeen = true;
			} else {
				AR.logger.error("flyEnterFOV: Fly not found with id: " + flyID);
			}
			//f.triggerManager.checkFlyVisibility();
		};
		
		f.flyExitFOV = function(flyID) {
			f.numberOfSeenFlies--;
			var fly = f.getFlyByID(flyID);
			if (fly) {
				fly.isSeen = false;
			} else {
				AR.logger.error("flyExitFOV: Fly not found with id: " + flyID);
			}

			if (f.numberOfSeenFlies == 0) {
				f.resources.get.buzz.stop();
			}
			//f.triggerManager.checkFlyVisibility();
		};
		
		f.addEventListener("flyEnterFOV", 	f.flyEnterFOV);
		f.addEventListener("flyExitFOV", 	f.flyExitFOV);	
		
		/**
		* Callback when swatter want to kill flies
		*/
		f.killFlies = function() {
			var fliesToDel 			 = new Array();
			var fly 				 = null;
		
			AR.logger.debug("will kill flies");
			var numberOfkilled = 0;
			// Get throw all living flies
			AR.logger.debug("KillFlies: numOfFlies: " + f.flies.length);
			
			for(var num = f.flies.length - 1; num >= 0; --num) {
				fly = f.flies[num];
				if(fly.isSeen) {
					numberOfkilled += 1;
					
					// Last angle to prevent to set the next
					// fly in field of view
					f.lastAngleOfKilledFly = fly.lastAngle;
					
					// Deactivate the fly
					f.deactivate(fly);
					f.numberOfSeenFlies--;
					fliesToDel.push(fly);
					
					// show DeadFly Visual
					AR.logger.debug("Killed FLY!");
					new f.DeadFly(3, 1);
				}
			}
			
			if (numberOfkilled > 0) {
				f.resources.get.smash.play();
			} else {
				f.resources.get.failed.play();
			}
			f.resources.get.buzz.stop();
			
			AR.logger.warning("before kill: " + f.flies.length);
			// Delete killed flies from flies array
			for(var i = fliesToDel.length - 1; i >= 0; --i ) {
				f.flies.removeElement(fliesToDel[i]);
			}
			AR.logger.warning("after kill: " + f.flies.length);
			
			// Fire Killed event
			AR.logger.debug("killed " + numberOfkilled + " flies");
			f.fireEvent("flyKilled", numberOfkilled);
			AR.logger.debug("killFlies: fired killed event");
		};
	
		
		////////////////////////////////////////////////////////
		
		// Game : CLASSIC
		
		////////////////////////////////////////////////////////
		(function createClassicGame() {
		
			f.game = f.game || {};
			f.game.classic = {};
			
			var g = f.game;
			var c = f.game.classic;
			
			
			// Flies
			var killedFlies = 0;
			
			// to do: change this to 60!
			var lengthOfGame = 60; // in seconds			
			var timeCountDown = lengthOfGame; // length of game
			c.isGameRunning = false;
			
			var htmlTimer = null;
			var htmlCounter = null;
			
			c.swatter = null;
			
			c.toString = function() {return "Classic Game"};
			
			c.name = "Classic";
			
			/**
			* Start the Game
			*/
			c.start = function() {
				
				// TriggerManager	
				try {
					if(!f.triggerManager) {
						f.triggerManager = new f.TriggerManager();	
					}				
				} catch (e) { AR.logger.error("initialize: " + e); } 
				f.triggerManager.show();
				
				f.numberOfSeenFlies = 0;
				f.flyIDCounter = 0;
				// Activate Swatter
				AR.logger.debug("start classic game");
				if(!c.swatter) {
					AR.logger.debug("created new swatter");
					c.swatter = new f.Swatter();
				}
				c.swatter.screenResize();
				
				htmlCounter = document.getElementById("counter");
				htmlTimer = document.getElementById("timer");
				
				f.activate(f.glass);
				f.glass.clear();
				f.activate(c.swatter);
				f.flies = new Array();
				//AR.logger.debug("created new fly");
				f.createNewFly();
				
				
				
				// new:
				f.setFlyInFrontOfCamera();
				//f.flyARound(0);
				
				killedFlies = 0;
				timeCountDown = lengthOfGame;
				c.isGameRunning = true;
				f.triggerManager.show();
				f.highscore.hide();
				
				AR.logger.warning("start: triggerManager: hidden: " + f.triggerManager.hidden);
			};
			
			/**
			* Stop the Game
			*/
			
			c.stop = function() {
				if(!c.isGameRunning) {return; }
				AR.logger.debug("----- END OF GAME -----");
				
				try {
				
					htmlTimer.innerHTML = "";
					htmlCounter.innerHTML = "";
				
					f.triggerManager.hide();
					f.highscore.add(killedFlies);
					f.highscore.show();
					
					c.isGameRunning = false;
					f.deactivate(c.swatter);
					f.deactivateAllFlies();
					f.flies = new Array();
					
					f.endcount.show(killedFlies);
					// show score
					// show new game button
					$jaz("#but_newGame").css("display", "inline-block");
				} catch (error) {
					AR.logger.error("c.stop: " + error);
				}
				AR.logger.warning("stop: triggerManager: hidden: " + f.triggerManager.hidden);
			};
			
			/**
			* Reset the Game
			*/
			c.reset = function() {
				
				try {
					if(!f.triggerManager) {
						f.triggerManager = new f.TriggerManager();
					}
				} catch (e) { AR.logger.error("initialize: " + e); } 
	
			
				c.isGameRunning = false;
				// to do
				if(c.swatter) {
					f.deactivate(c.swatter);
				}
				
				f.deactivateAllFlies();
				
				f.flies = new Array();
				timeCountDown = lengthOfGame;
				killedFlies = 0;
				
				f.numberOfSeenFlies = 0;
				f.flyIDCounter = 0;
				f.glass.clear();
			};
			
			
			c.update = function() {
				// to do: if time <= 0 -> end game
				if(c.isGameRunning) {
					timeCountDown -= f.deltaTime;
					if(timeCountDown <= 0) {
						c.stop();
					}
				}
				
				if (htmlTimer) {
					if(timeCountDown <= 10) {
						htmlTimer.style.color = "red";
					} else {
						htmlTimer.style.color = "black";
					}
					htmlTimer.innerHTML = Math.round(timeCountDown);
					htmlCounter.innerHTML = killedFlies;
				}
			};
			
			// new from angi (screen: 480px width, 800px height)
			
			var distanceFromTopTimer = 65;
			var distanceFromTopFlyCounter = 50;
			/*
			var FromTopTimer = 65;
			var distanceFromTopFlyCounter = 50;
			
			var distanceFromLeftCorner = 20;
			var distanceFromRightCorner = 39;
			*/
			
			// in % for screen: 320 * 533
			// var distanceFromTopTimer_p = 0.122;
			// var distanceFromTopFlyCounter_p = 0.0938;
			var distanceFromTopTimer_p = 0.0522;
			var distanceFromTopFlyCounter_p = 0.0438;
			
			var distanceFromLeftCorner_p = 0.02419; //0.04;
			var distanceFromRightCorner_p = 0.1200;
			
			/*
			c.draw = function(ctx) {
				if(c.isGameRunning) {
					
					// Time countdown --------
					
					if(timeCountDown > 10) {
						ctx.fillStyle = "rgba(0,0,0,0.7)";//"#000000";
					} else {
						//ctx.fillStyle = "#ff0000";
						if(timeCountDown < 6) {
							ctx.fillStyle = "rgba(254,0,0,1)";
						} else {
							ctx.fillStyle = "rgba(254,0,0,0.7)";
						}
					}
					
					ctx.font = "normal 700 70px Arial ";
					ctx.textAlign = "left";
					ctx.fillText(Math.round(timeCountDown), 
						f.screenWidth * distanceFromLeftCorner_p, // was: 10,
						distanceFromTopTimer); // f.screenHeight * distanceFromTopTimer_p + 35 35 = half of the font-size
					
					// Fly counter ----------
					if(killedFlies > 0) { 
						ctx.font = "normal 700 55px Arial ";
						ctx.fillStyle = "rgba(0,255,6,0.72)";
						ctx.textAlign = "center";
						ctx.fillText(killedFlies, 
							f.screenWidth * (1-distanceFromRightCorner_p), 
							distanceFromTopFlyCounter); // f.screenHeight * distanceFromTopFlyCounter_p + 27.5); // 27.5 = half of the font-size	
					}					
				}
			};
			*/
			
			////////////////////////////////////////////////////////
			// game functions
			////////////////////////////////////////////////////////
			c.flyKilled = function(number) {
				alert("classic: flyKilled");
				if(number > 1) {
					AR.logger.error("More than one fly killed in c.flyKilled");
				}
				
				killedFlies += number;
				
				alert("all killed flies = " + killedFlies);
				if (number > 0) {
					alert("new Fly");
					f.createNewFly();
				}
			};
		
			c.toString = function() {
				return "Hunt The Fly\n" + c.name + " Game";
			};
		})();

		/////////////////////////////////////////////////////////
		
		//	   R e s o u r c e      M a n a g e r
		
		/////////////////////////////////////////////////////////
		f.defineConstant("AR_IMAGE", 	"arImg");
		f.defineConstant("HTML_IMAGE", 	"htmlImg");
		f.defineConstant("AR_SOUND", 	"arSound");
		
		ds.define("R250", 250);
		ds.define("R480", 480);
		ds.define("R800", 800);
		ds.define("R1024", 1024);
		ds.define("R2048", 2048);
		
		(function createResourceManager (b) {
			b.resources = {};
			var r = b.resources;
			var geoLocationLoaded = false;
			
			r.numOfAllLoadingSteps = 0;
			r.toLoad = new Array();
			r.loadingSteps = 0;
			
			r.get = function(name) {
				return r.get[name];
			}
			
			/**
			* Add new resource to load on init
			*
			* @param n	name of resource
			* @param p	path of resource
			* @param t 	type of resource
			* @param desi	the deviceSize this resources is for
			* @param info an object for informations
			*/
			r.add  = function(n, p, t, desi, info) {
				if (typeof desi !== "undefined") {
					if (ds.isNot(desi)) {
						return;
					}
				}
				r.toLoad.push( { name: n, path: p, type: t, info: info} );
				if (t != f.AR_SOUND) {
					r.loadingSteps++;
				}
			};
			
			r.finished = function() {
				AR.logger.info("All resources loaded.");
				f.fireEventDirectly("loadingFinished");
			};
			
			/**
			* will be called by a resource when it is loaded, updates the var, which
			* describes how many resources still have to be loaded
			* sends an event after finishing loading all the resources
			*/
			r.loaded = function(resName, type) {
				if (resName == "geoLocation") {
					
				}
				if (type != f.AR_SOUND) {
					r.loadingSteps -= 1;
					b.fireEventDirectly("loadingStateChanged", (100 - ((100/ r.allLoadingSteps) * r.loadingSteps)));
				}
				AR.logger.info("Resource '" + resName + "' loaded successful. Still to load: " + r.loadingSteps);
				if(r.loadingSteps == 0) {
					r.finished();
				}
			};
			
			r.error = function(resName, resType) {
				m.show("Loading failed.", "Please reload this world!");
				AR.logger.error("Loading of " + resType + " resource '" + resName + "' failed!");
				if (resType != f.AR_SOUND) {
					r.loadingSteps -= 1;
				}
			};
			
			/**
			* loads all resources in the resourcesToLoad-Array
			*/
			var debNr = 0;
			
			r.load = function() {
				r.allLoadingSteps = r.loadingSteps;
				var res = null;
				for(var num = r.toLoad.length - 1; num >= 0; --num) {
					res = r.toLoad[num];
					if(res.type == f.AR_IMAGE) {
						var img =  
							new AR.ImageResource(res.path,
								{	
									onLoaded : function() { r.loaded(this.resName, this.resType); }, 
									onError  : function() { r.error(this.resName, this.resType); }
								}
							);
						img.resName = res.name;
						img.resType = res.type;
						
						r.get[res.name] = img;
					} else if(res.type == f.AR_SOUND) {
						var sound = new AR.Sound(res.path,
							{
								onLoaded 	: function() { r.loaded(this.resName); },
								onError		: function() { r.error(this.resName, this.resType);}
							});
						sound.resName = res.name;
						sound.resType = res.type;
						sound.load();
						sound.toString = function() {
							return "AR_SOUND: " + res.name;
						};
						
						r.get[res.name] = sound;
					} else if (res.type == f.HTML_IMAGE) {
						var img = new Image();
						img.src = res.path;
						r.get[res.name] = img;
						img.onload = (function (x) { return function() { r.loaded(x); } })(res.name);						
					} else if (res.type == "screenSize") {
						f.screenWidth = window.innerWidth;
						f.screenHeight = window.innerHeight;
						f.fireEvent("screenResize");
						r.loaded("screen");
					}
				}  
			};
			
			r.locationChanged = function(latitude, longitude, altitude, acc) {
					if (b.currentLocation == null) {
						b.currentLocation = new AR.GeoLocation(latitude,longitude,altitude);
						b.currentLocation.acc = acc;
						r.loaded("geoLocation");
					} else {
						b.currentLocation.latitude = latitude;
						b.currentLocation.longitude = longitude;
						b.currentLocation.altitude = altitude;
						b.currentLocation.acc = acc;
					}
			};
			
			r.activateLocationChanged = function() {
				AR.context.onLocationChanged = r.locationChanged;
				r.loadingSteps++;
				alert("Activate LoctionChanged: " + r.loadingSteps);
			};
			
			
			// loading html-image-resources
			
			var htmlImageResourceCounter = -1; // do not change this value
			
			
			r.loadedHTMLImageResource = function() {
				AR.logger.warning("html img resource loaded");
				if(htmlImageResourceCounter == -1) { // init the counter
					htmlImageResourceCounter = document.getElementsByTagName("img").length;
					AR.logger.warning("html imgs to load: " + htmlImageResourceCounter);
				}
				
				--htmlImageResourceCounter;
				
				if(htmlImageResourceCounter <= 0) {
					r.loaded("all html image resources");
					// all html image resources were loaded
				}
			};
			
			
			
			
			
		})(wikitude.flyhunt);
		
		f.loadingFinished = function() {
			//alert("Hello?");
			f.progress.hide();
			$jaz("#progressBody").hide();
			f.fireEvent("screenResize");
			$jaz("#tutimg").show();
			// Initialize the animation images array
			f.initAnimatedImagesArray();
			
			// Set Game Mode
			f.initializeGameMode(f.game.classic);
			
			// START
			f.startloop();
			//f.startGame();
			
			// show start button
			$jaz("#but_startGame").css("display", "inline-block");
		};
		f.loadingStateChanged = function(state) {
			AR.logger.debug("state changed to " + state);
			f.progress.setState(state);
		};
		
		f.addEventListener("loadingFinished", 		f.loadingFinished);
		f.addEventListener("loadingStateChanged", 	f.loadingStateChanged);
		
		/**
		* creates the content in the resourcesToLoad-Array
		*/
		f.initLoadingResourcesArray = function() {
			// AR IMAGE
			f.resources.add("fly1", f.rootpath + ds.getSize() + "/fly1.png" + cacheHack(), f.AR_IMAGE);
			f.resources.add("fly2", f.rootpath + ds.getSize() + "/fly2.png" + cacheHack(), f.AR_IMAGE);
			f.resources.add("fly3", f.rootpath + ds.getSize() + "/fly3.png" + cacheHack(), f.AR_IMAGE);
			f.resources.add("fly4", f.rootpath + ds.getSize() + "/fly4.png" + cacheHack(), f.AR_IMAGE);
			f.resources.add("fly5", f.rootpath + ds.getSize() + "/fly5.png" + cacheHack(), f.AR_IMAGE);
			
			// AR SOUND
			f.resources.add("buzz", 	f.rootpath + "audio/buzz.mp3" + cacheHack(), f.AR_SOUND);
			f.resources.add("buzz_low", f.rootpath + "audio/buzz_lower.mp3" + cacheHack(), f.AR_SOUND);
			f.resources.add("smash", 	f.rootpath + "audio/smashthefly.mp3" + cacheHack(), f.AR_SOUND);
			f.resources.add("failed", 	f.rootpath + "audio/failed.wav" + cacheHack(), f.AR_SOUND);
			
			// HTML IMG
			AR.logger.debug("PATH: " + f.rootpath + ds.getSize() + "/swatter.png" + cacheHack());
			f.resources.add("swatter", f.rootpath + ds.getSize() + "/swatter.png" + cacheHack(), f.HTML_IMAGE);
			f.resources.add("fly_dead", f.rootpath + ds.getSize() + "/fly_dead.png" + cacheHack(), f.HTML_IMAGE);
			f.resources.add("fly_glass", f.rootpath + ds.getSize() + "/fly_glass.png" + cacheHack(), f.HTML_IMAGE);
			f.resources.add("fly_count", f.rootpath + ds.getSize() + "/fly_count.png" + cacheHack(), f.HTML_IMAGE);
			f.resources.add("greeny", f.rootpath + ds.getSize() + "/greeny.png", f.HTML_IMAGE);
			
			// SCREEN SIZE
			f.resources.add(null, null, "screenSize");
			
			// Wait for GEOLOCATION
			f.resources.activateLocationChanged(f.locationChanged);
		};

		f.initAnimatedImagesArray = function() {
			f.animatedImages = new Array();
			
			f.animatedImages.push(f.resources.get["fly1"]);
			f.animatedImages.push(f.resources.get["fly2"]);
			f.animatedImages.push(f.resources.get["fly3"]);
			
			f.animatedImages.push(f.resources.get["fly4"]);
			f.animatedImages.push(f.resources.get["fly5"]);
			AR.logger.debug(f.animatedImages.join("|"));
			
			f.numberOfAnimatedImages = f.animatedImages.length;
		};
		
	})();
	
	
	
	
	
///////////////////////////////////////////////////////////////////////////

//		I N I T I A L I Z E    G A M E

///////////////////////////////////////////////////////////////////////////
wikitude.flyhunt.init(function(){
	var f = wikitude.flyhunt;
	var ds = wikitude.util.deviceSize;
	
	////////////////////
	// overlay
	////////////////////
	f.overlay = {};
	f.overlay.activate = function() {
		f.overlay.element = $jaz("#overlay");
	};
	f.overlay.loadingFinished = function() {
		setTimeout(function() { f.messager.hide(); }, 1000);
		//f.messager.show("", "Look for flies!", 3);
	
		//setTimeout(function() { window.wikitude.flyhunt.overlay.element.removeClass("flyhunt-background"); }, 1000);
	};
	f.overlay.orientationChanged = function(or) {
	}
	f.activate(f.overlay);

	////////////////////
	// ProgressBar
	////////////////////
	//f.progress = new xis.html.ProgressBar("flyhunt-progressbar");
	var progOffset = 0;
	var progId = "";
	if (ds.is("R480", true)) {
		progOffset = 34;
		progId = "250";
	} else if (ds.is("R800", true)) {
		progOffset = 68;
		progId = "480";
	} else if (ds.is("R1024", true)) {
		progOffset = 102;
		progId = "800";
	} else if (ds.is("R2048", true)) {
		progOffset = 137;
		progId = "1024";
	} else if (ds.is("R2048", true)) {
		progOffset = 137;
		progId = "2048";
	} else {
		progOffset = 34;
		progId = "250";
	}
	var progBody = $jaz('#progressBody');
	progBody.addClass("prog" + progId);
	f.progress = new xis.html.ProgressImage("nextProgress" + progId, "", 0, progOffset);
	f.progress.appendTo(progBody);
	
	f.content = $jaz("#content");
	
	
	
	
	////////////////////
	// Messager
	////////////////////
	(function createMessager () {
		f.messager = {};
		var m = f.messager;
	
		m.FADE_OUT_SPEED = 2;
		m.box = $jaz("<section id='messager'></section>");
		m.title = $jaz("<h1></h1>");
		m.msg = $jaz("<p></p>");
		m.list = $jaz("<ul></ul>");
		m.box.append(m.title);
		m.box.append(m.msg);
		m.box.hide();
		
		m.waitTimeOut = false;
		m.timeout = -1;
		m.opacity = 1;
		
		m.show = function(title, msg, timeout) {
			m.box.show();
			m.title.clear();
			m.title.text(title);
			m.msg.clear();
			m.msg.text(msg);
			
			if (typeof timeout == "number") {
				m.waitTimeOut = true;
				m.timeout = (new Date()).getTime() +( timeout*1000);
			} else {
				m.waitTimeOut = false;
			}
			m.opacity = 1;
			m.box.css("opacity", m.opacity);
		};
		m.hide = function () {
			m.waitTimeOut = true;
			m.timeout = -1;
		}
		m.update = function() {
			if (m.waitTimeOut) {
				if (f.time == 0) return;
				if (m.timeout <= f.time) {
					if (m.opacity > 0) {
						m.opacity -= f.deltaTime * m.FADE_OUT_SPEED;
						if (m.opacity < 0) {
							m.opacity = 0;
							m.box.hide();
						}
					}
				}
				m.box.css("opacity", m.opacity);
			}
		}
	
		f.activate(m);
		f.content.append(m.box);
		
		//m.show("", "Loading");
		
	})(); // END Messager

	////////////////////
	// Load Resources
	////////////////////
	try {
		f.initLoadingResourcesArray();
		f.resources.load();
	} catch (error) {
		AR.logger.error("INIT: " + error);
	}
	
	////////////////////
	// END COUNT
	////////////////////
	  (function createEndCount() {
	   f.endcount = {};
	   
	   const SHOW_SPEED = 1;
	   
	   var e = f.endcount;
	   
	   var opacity = 0;
	   var body = $jaz("#flyhunt-endcount");
	   var count = $jaz("#flyhunt-count");
	   body.css("opacity", opacity);
	   
	   const SHOW = 1;
	   const HIDE = 2;
	   var state = 0;
	   
	   e.update = function() {
		if (state == SHOW) {
	  if (opacity < 1) {
	   opacity += f.deltaTime * SHOW_SPEED;
	   if (opacity > 1) {
		state = 0;
		opacity = 1;
	   }
	  }
	  body.css("opacity", opacity);
		} else if (state == HIDE) {
	  if (opacity > 0) {
	   opacity -= f.deltaTime * SHOW_SPEED;
	   if (opacity < 0) {
		state = 0;
		opacity = 0;
		body.hide();
	   }
	  }
	  body.css("opacity", opacity);
		}
	   };
	   
	   e.show = function(number) {
		body.show();
		if (number == 0) {
			
			//count.text("Game Over");
			count.text("");
			body.addClass("game-over");
		} else {
			count.text(number + "x");
			body.removeClass("game-over");
		}
		state = SHOW;
	   };
	   
	   e.hide = function() {
		state = HIDE;
	   };
	  
	   f.activate(e);
	  })();
	
	////////////////////	
	// HighScore
	////////////////////
	
	
	(function createHighScore() {
		f.highscore = {};
		var h = f.highscore;
		
		var highScore_htmlElement = document.getElementById("highScore");
		var highScore = new Array();
		
		const NUM_OF_HIGHSCORE_ENTRIES = 3;
		
		h.save = function() {
				localStorage.setItem('wikitude_flyhunt_highScore', highScore.join("$"));
		};
		
		h.load = function() {
			
				var hsString = localStorage.getItem('wikitude_flyhunt_highScore'); 
				if(hsString) {
					highScore = hsString.split("$");
				}
		};
			
		h.arraySortMethod = function(a, b) {
			/*@return 0, wenn beide Argumente gleich sind
			*  	Zahl > 0, wenn b größer als a ist
			*  	Zahl < 0, sonst
			*/
			var aN = parseInt(a);
			var bN = parseInt(b);
			return bN - aN;
		};
			
		h.add = function(points) {
				AR.logger.warning("add: points: " + points);
				if(points > 0) {
					highScore.push(points);
					highScore.sort(h.arraySortMethod);
					//highScore.reverse();
					while(highScore.length > NUM_OF_HIGHSCORE_ENTRIES) {
						highScore.pop();
					}
					
					h.save();
					
				}
			
		};
		
		h.write = function() {
			try {
				var htmlHSString = "<span id='highScore_header'> HighScore </span></br>";
				htmlHSString += "<ul>";
				var numOfScores = highScore.length;
				var num = NUM_OF_HIGHSCORE_ENTRIES < numOfScores ? NUM_OF_HIGHSCORE_ENTRIES : numOfScores;
				var x = "";
				for(var i = 0; i < NUM_OF_HIGHSCORE_ENTRIES; ++i) {
					if(highScore[i]) {
						x = highScore[i] > 9 ? "" : " "; // to 'format' the values
						htmlHSString += "<li>" + (i+1) + ". ... " + x + highScore[i] + "</li>";
					} else {
						htmlHSString += "<li>" + (i+1) + ". ... " + 0 + "</li>"; // write an empty line
					}
				}
				
				
				htmlHSString += "</ul>";
				
				highScore_htmlElement.innerHTML = htmlHSString;
			} catch (e) {
					AR.logger.error("write: " + e);
				}
		};
		
		h.show = function() {
			h.write();
			//highScore_htmlElement.style.display = "block";
			$jaz(highScore_htmlElement).addClass("highScoreDisplay");
		};
		
		h.hide = function() {
			
			//highScore_htmlElement.style.display = "none";
			//highScore_htmlElement.class = "highScoreDisplay";
			//highScore_htmlElement.setAttribute("class", "highScoreClass");
			$jaz(highScore_htmlElement).removeClass("highScoreDisplay");
		};
		
		h.clear = function() {
			highScore = new Array();
			h.save();
		};
		
		// init: 
		highScore_htmlElement.style.display = "";
		highScore_htmlElement.style.opacity = "1";
		h.load();

		
	})();
	
	
	
	////////////////////	
	// Glass
	////////////////////
	(function createGlass() {
		f.glass = {};
		var g = f.glass;

		// constants in percent of screen width and height
		const GLASS_WIDTH 			= 0.18;
		const GLASS_LEFT 			= 0.79;
		const GLASS_TOP_POS 		= 0.12;
		const GLASS_BOTTOM_POS 		= 0.9;
		const FLY_WIDTH 			= 0.8;
		
		// constants for the fly
		const MAX_ROTATION 			= 1.3;
		const MAX_SPEED 			= 300;
		const CALC_ROTATION_ONCE 	= true;
		
		// source images
		var greenyImg 	= f.resources.get["greeny"];
		var flyImg 		= f.resources.get["fly_glass"];
		
		if (typeof greenyImg === "undefined") {
			AR.logger.error("NO GREENY IMAGE");
		}
		
		if (typeof flyImg === "undefined") {
			AR.logger.error("NO FLY IMAGE");
		}
		
		// Size of the glass
		var left = 0;	// left X position of glass
		var height = 0; // Height of glass
		var width = 0;	// Width of glass
		
		
		// Vector Draw Information
		var topRound		 = {x: 100, y: 100, r: 20, lw: 5, s: 0.3, color: "#000"};
		var leftLine		 = {x1: 80, y1: 100, x2: 80, y2: 200, lw: 3, color: "#000"};
		var rightLine		 = {x1: 120, y1: 100, x2: 120, y2: 200, lw: 3, color: "#000"};
		var bottomRound		 = {x: 100, y: 200, r: 20, lw: 3, fill: "rgba(0, 255, 6, 0.72)", stroke: "#000"};
		var lightLine		 = {x1: 113, y1: 108, x2: 113, y2: 200, lw: 3, color: "rgba(255, 255, 255, 0.5)"};
		var lightBall		 = {x: 110, y: 205, r: 4, color: "rgba(255, 255, 255, 0.5)"};
		
		// Image Draw Information
		var greenyRect  	 = {x: 0, y: 0, w: 150, h:  42, show: false}; 
		var greenyFilledRect = {x: 0, y: 0, w: 150, h: 0};
		var flyRect 		 = {x: 0, y: 0, w: 108, h: 59};
		
		// Dead flies to draw
		var flies 			 = new Array();

		// Dynamic variables
		var speed = MAX_SPEED;
		var numOfFlies = 0;
		var filledTarget = 0;
		var filled = 0;
		
		// true to remove the flies from the glass
		var clearing = false;

		// calculate the glass size once at activation
		g.activate = function() {
			g.screenResize();
		};
		
		// Calculate the greeny filled size and the fly positions
		g.update = function() {
			calculateFlyPositions(false);
			if (filled < filledTarget) {
				filled += (filledTarget - filled)  * f.deltaTime;
				if (filled > filledTarget) {
					filled = filledTarget;
				}
			} else if (filled > filledTarget) {
				filled += (filledTarget - filled)  * f.deltaTime;
				if (filled < filledTarget) {
					filled = filledTarget;
				}
			}
		}

		g.toString = function() {return "Glass";};
		
		g.draw = function(ctx) {
			// draw flies			
			// TOP 1
			ctx.save();
			ctx.translate(topRound.x, topRound.y);
			ctx.scale(1, topRound.s);
			ctx.beginPath();
			ctx.arc(0, 0, topRound.r, Math.PI, 2* Math.PI, false);
			ctx.lineWidth = topRound.lw;
			ctx.strokeStyle = topRound.color;
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
			
			// FLIES			
			var fly = null;
			try {
			for(var i = 0; i < numOfFlies; i++) {
				fly = flies[i];
				ctx.save();
				ctx.translate(fly.x1, fly.y1);
				ctx.rotate(fly.r);
				ctx.translate(fly.x2, fly.y2);
				ctx.drawImage(flyImg,0,0,flyImg.width,flyImg.height, 0, 0, flyRect.w, flyRect.h);
				ctx.restore();
			}
			} catch (error) {}
			
			// GREENY
			if (greenyRect.show) {
				//try{
					ctx.drawImage(greenyImg,0,0,greenyImg.width,greenyImg.height,   
						greenyRect.x,greenyRect.y,greenyRect.w,greenyRect.h);
				//} catch(error) {
				//	AR.logger.warning(
				//	"glassDraw: " + error + greenyImg
				//	+ " > x: " + greenyRect.x 
				//	+ ", y: " + greenyRect.y 
				//	+ ", w: " + greenyRect.w 
				//	+ ", h: " + greenyRect.h);
				//}
				ctx.fillStyle = "rgba(0, 255, 6, 0.72)";
				ctx.fillRect(greenyFilledRect.x, greenyFilledRect.y, greenyFilledRect.w, greenyFilledRect.h);	
			}
			
			// LEFT LINE
			ctx.beginPath();
			ctx.moveTo(leftLine.x1, leftLine.y1);
			ctx.lineTo(leftLine.x2, leftLine.y2);
			ctx.strokeStyle = leftLine.color;
			ctx.lineWidth = leftLine.lw;
			ctx.stroke();
			ctx.closePath();

			// RIGHT LINE
			ctx.beginPath();
			ctx.moveTo(rightLine.x1, rightLine.y1);
			ctx.lineTo(rightLine.x2, rightLine.y2);
			ctx.strokeStyle = rightLine.color;
			ctx.lineWidth = rightLine.lw;
			ctx.stroke();
			ctx.closePath();

			// LIGHT LINE
			ctx.beginPath();
			ctx.moveTo(lightLine.x1, lightLine.y1);
			ctx.lineTo(lightLine.x2, lightLine.y2);
			ctx.strokeStyle = lightLine.color;
			ctx.lineWidth = lightLine.lw;
			ctx.stroke();
			ctx.closePath();

			// TOP 2
			ctx.save();
			ctx.translate(topRound.x, topRound.y);
			ctx.scale(1, topRound.s);
			ctx.beginPath();
			ctx.arc(0, 0, topRound.r, 0, Math.PI, false);
			ctx.lineWidth = topRound.lw;
			ctx.strokeStyle = topRound.color;
			ctx.stroke();
			ctx.closePath();
			ctx.restore();

			// BOTTOM
			ctx.beginPath();
			ctx.arc(bottomRound.x, bottomRound.y, bottomRound.r, 0, Math.PI, false);
			ctx.lineWidth = bottomRound.lw;
			ctx.strokeStyle = bottomRound.stroke;
			ctx.fillStyle = bottomRound.fill;
			if (greenyRect.show) ctx.fill();
			ctx.stroke();
			ctx.closePath();

			// LIGHT BALL
			ctx.save();
			ctx.translate(lightBall.x, lightBall.y);
			var cosA = Math.cos(Math.PI/ 10);
			var sinA = Math.sin(Math.PI/ 10);
			ctx.scale(-1, 1);
			ctx.transform( cosA , sinA* 3, 	-sinA, cosA *5, 0,0);
			ctx.scale(1, 0.4);
			ctx.beginPath();
			ctx.arc(0, 0, lightBall.r, 0, Math.PI * 2, false);
			ctx.lineWidth = lightBall.lw;
			ctx.fillStyle = lightBall.color;
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		};

		function calculateFlyPositions(resized) {

			var fly 	 = null;
			var max 	 = (height/numOfFlies*0.95);
			var min 	 = (flyRect.h/1.5);
			var y 		 = (max<min)?max:min;
			var x1 		 = flyRect.x+flyRect.w/2;
			var x2 		 = -flyRect.w/2;
			var y1_1 	 = flyRect.y-flyRect.h;
			var y1_2 	 = flyRect.h/2;
			var y2 		 = -flyRect.h/2;
			var flyGreen = null;
			var removed  = 0;
			
			for(var i = 0; i < numOfFlies; i++) {
				fly = flies[i];
				
				// set x center positions
				fly.x1 = x1;
				fly.x2 = x2;
				
				// calculate y position
				var ny = y1_1 - y*i + y1_2;
				
				// if clearing remove the flies from glass
				if (clearing) {
					if (fly.y1 > -flyImg.height) {
						fly.y1 -= Math.max(Math.abs((bottomRound.y - (fly.y1 - (-flyImg.height))) * 0.5), 20);
						flyGreen = fly
					} else {
						// to check if all flies are away
						removed++;
					}
					
				// the fly is still falling in glass
				} else if (fly.drop) {
					if (fly.y1 < ny) {
						fly.y1 += fly.speed * f.deltaTime;
						fly.r = fly.r1 * fly.rd + fly.r2 * (1-fly.rd);
						if (fly.rd < 1) {
							fly.rd += 0.1;
						}
						if (fly.y1+flyRect.h/4 >= ny) {
							flyGreen = fly;
							fly.speed = MAX_SPEED/6;
						} else if (fly.y1+flyRect.h/2 >= ny) {
							flyGreen = fly;
							fly.speed = MAX_SPEED/4;
						}
						if (fly.y1 > ny) {
							fly.drop = false;
							fly.y1 = ny;
						}
					} else {
						flyGreen = fly;
					}
					
				// the fly is lying in the glass
				} else {
					fly.y1 = ny;
					flyGreen = fly;
				}
				
				fly.y2 = y2;
				
				// Angle
				if (!CALC_ROTATION_ONCE) {
					fly.r = Math.random() * MAX_ROTATION - MAX_ROTATION/2;
				}
				
			}
			
			// if clearing the glass and all flies are removed
			if (clearing && removed == numOfFlies) {
				flies = new Array();
				numOfFlies = 0;
				clearing = false;
			// if there is a fly available fill the greeny up to them
			} else if (flyGreen) {
				// if clearing clear the greeny
				if (clearing) {
					filledTarget = bottomRound.y + bottomRound.y * 0.03;
				} else {
					filledTarget = flyGreen.y1;
					if (filledTarget > bottomRound.y) {
						filledTarget = bottomRound.y;
					}
					if (resized) {
						filled = filledTarget;
					}
				}
				greenyRect.show = true;
			// glass is empty
			} else {
				filledTarget = bottomRound.y + bottomRound.y * 0.01;
				filled = filledTarget;
				greenyRect.show = false;
			}
			calculateGreenySize();
		};

		// call this to clear the glass from flies
		g.clear = function() {
			clearing = true;
		};

		// add a fly to the glass
		g.addFly = function () {
			numOfFlies = flies.push({speed: MAX_SPEED, y1: 0, drop: true, rd: 0, r1: Math.random() * MAX_ROTATION - MAX_ROTATION/2, r2: Math.random() * MAX_ROTATION - MAX_ROTATION/2});
			calculateFlyPositions(false);
		};

		// calculate the dimenstions of the glass to draw
		function calculateGlassSize() {
			width 	= f.screenWidth * GLASS_WIDTH;
			height 	= f.screenHeight * GLASS_BOTTOM_POS - f.screenHeight * GLASS_TOP_POS;
			left 	= f.screenWidth * GLASS_LEFT;
	
			// calculate the greeny image rect
			greenyRect.x 	= left;
			greenyRect.w 	= width;
			greenyRect.h 	= greenyImg.height / greenyImg.width * greenyRect.w;
					
			// New Glass
			leftLine.x1 		= left;
			rightLine.x1		= left + width;
			leftLine.x2 		= left;
			rightLine.x2		= left + width;
			bottomRound.x	= left + width / 2;
			topRound.x		= left + width / 2;
			
			lightLine.x1 = left + (width * 0.85);
			lightLine.x2 = lightLine.x1;
			
			// SIZE
			bottomRound.r 	= width / 2;
			topRound.r 		= width / 2;
			
			// LINE WIDTH
			topRound.lw		= width * 0.03;
			leftLine.lw		= width * 0.03;
			rightLine.lw	= width * 0.03;
			lightLine.lw	= width * 0.045;
			bottomRound.lw	= width * 0.03;
				
			// TOP
			topRound.y			= f.screenHeight * GLASS_TOP_POS;
			leftLine.y1			= topRound.y;
			rightLine.y1		= topRound.y;
			lightLine.y1		= topRound.y + height * 0.05;
			
			// BOTTOM
			bottomRound.y	= f.screenHeight * GLASS_BOTTOM_POS - bottomRound.r;
			leftLine.y2		= bottomRound.y;
			rightLine.y2	= bottomRound.y;
			lightLine.y2	= topRound.y + height * 0.8;

			// Light Ball
			lightBall.x 	= bottomRound.x + width * 0.25;
			lightBall.y		= bottomRound.y	+ width * 0.15;
			lightBall.r		= width * 0.12;
			
			// Fly
			flyRect.x	= leftLine.x1 + width * (1-FLY_WIDTH)/2;
			flyRect.y 	= bottomRound.y + bottomRound.r * 0.8;
			flyRect.w	= width * FLY_WIDTH;
			flyRect.h	= flyImg.height / flyImg.width * flyRect.w;
		}

		function calculateGreenySize() {
			// Greeny
			greenyFilledRect.x	= leftLine.x1;
			greenyFilledRect.y	= filled;
			greenyFilledRect.w	= rightLine.x1 - leftLine.x1;
			greenyFilledRect.h	= bottomRound.y - greenyFilledRect.y;	
			
			// Greeny Top
			greenyRect.y = greenyFilledRect.y - greenyRect.h;
		}

		g.screenResize = function () {
			filled = filledTarget;
			calculateGlassSize();
			calculateFlyPositions(true);
		};
		
		
	})();
}); // END INITIALIZE

