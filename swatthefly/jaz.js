//JavaScript Document
/*
######################################################################
	  #
     ###     #   ##   #####
    #        #  #  #     #
     ##      #  ####    #
       #     #  #  #   #
    ###   ###   #  #  #####
     #
######################################################################

	author:
		Angelika Bugl
		Christoph Lipphart
		
*/

function $jaz_debugTree(msg) {
	//alert(msg);
}

function $jaz_debugAttr(msg) {
	//alert(msg);
}

String.prototype.$jaz_ltrim = function (clist) {
  if (clist) return this.replace(new RegExp('^[' + clist + ']+'), '');
  return this.replace(/^\s+/, '');
};
String.prototype.$jaz_rtrim = function (clist) {
  if (clist) return this.replace(new RegExp('[' + clist + ']+$'), '');
  return this.replace(/\s+$/, '');
};
String.prototype.$jaz_trim = function (clist) {
  if (clist) return this.$jaz_ltrim(clist).$jaz_rtrim(clist);
  return this.$jaz_ltrim().$jaz_rtrim();
};

function $jaz_getElementsByClass(searchClass, node, tag) {

	var classElements = new Array();

	if ( node == null )	node = document;
	if ( tag == null ) tag = '*';

	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");

	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}

	return classElements;
}

/**
* Constructor for $jaz object instance
* is a representation for a HTML element or
* a array of elements
*
* @return a new Instance of a $jaz object
* @param data	- HTML Object
*				  this object is stored in this.element
* 				- Array of HTML Objects
*				  this array is stored in this.elements
*				- String
*				  the string will be checked by starting with:
*					# 	: search for the element by id. ID name is followed by the # character
*					.	: search for all elements by class. The class name is followed by the . character
*					<	: creates a whole node tree by string 
*						  like "<div><h1 style="color: red">Hello World!</h1></div>"
* @param rec	is used by $jaz itselfe an should'nt be used.
*/
function $jaz(data, rec) {

	this.elements = null;
	this.element = null;
	
	// Is $jaz
	if (data instanceof $jaz) {
		return data;
	}
	// Looses new parameter
	if (typeof rec === "undefined") {
		return new $jaz(data, false);
	}
	
	if (typeof data == "object") {
		if (data instanceof Array) {
			this.elements = data;
		} else if (data instanceof Object) {
			this.element = data;
		}
	} else if (typeof data == "string") {
		data = data.$jaz_trim();
		if (data.length > 0) {
			// Search for id element
			if (data.charAt(0) == "#") {
				var data = data.substring(1, data.length);
				this.element = document.getElementById(data);
				
			// Search for class elements
			} else if (data.charAt(0) == ".") {
				var arr = $jaz_getElementsByClass(data.substring(1, data.length));
				if (arr.length == 1) {
					this.element = arr[0];
				} else {
					this.elements = arr;
				}
			} else if (data.charAt(0) == "<") {
				var els = data.split('<');
				var elsLen = els.length;
				var currentElement = null;
				$jaz_debugTree("all parts: \n" + els.join("\n"));
				for (i = 0; i < elsLen; i++) {

					var e = els[i];
					
					
					e.$jaz_trim();
					
					$jaz_debugTree("Work on: " + e);
					strl = e.length;
					if (strl > 0) {
						// Close Element	
						if (e.charAt(0) == "/") {
							if (currentElement) {
								$jaz_debugTree("Close A: " + currentElement);
								$jaz_debugTree("Back to: " + currentElement.parentNode);
								if (currentElement.parentNode) {
									currentElement = currentElement.parentNode;
								}
							}
							// Text Check
							if (strl > 1) {
								$jaz_debugTree("Stoped text check");
								var txt = "";
								for (ca = 1; ca < strl; ca++) {
									if (e.charAt(ca) == ">") {
										// Skipp
										txt = "";
									} else {
										txt = txt + e.charAt(ca);
									}
								}
								txt.$jaz_trim();
								$jaz_debugTree("Text: " + txt);
								if (txt.length > 0) {
									if (currentElement) {
										currentElement.appendChild(document.createTextNode(txt));
									}
								}
							}
						} else {
							$jaz_debugTree("Start new Tag Check: " + e);
							var tagName = "";
							for (ca = 0; ca < strl; ca++) {
								if (e.charAt(ca) == " " || e.charAt(ca) == "/" || e.charAt(ca) == ">") {
									break;
								} else {
									tagName = tagName + e.charAt(ca);
								}
							}
							// Create Element
							var newElement = null;
							if (tagName.length > 0) {
								$jaz_debugTree("Create TagName: " + tagName);
								newElement = document.createElement(tagName);
								if (currentElement) {
									currentElement.appendChild(newElement);
								}
								currentElement = newElement;
							}
							// Close Element or handle Attributes
							if (ca < strl) {
								$jaz_debugTree("Stoped at: " + ca + " = " + e.charAt(ca));
								// Close Element
								if (e.charAt(ca) == "/") {
									if (currentElement) {
										$jaz_debugTree("Close B: " + currentElement);
										$jaz_debugTree("Back to: " + currentElement.parentNode);
										if (currentElement.parentNode) {
											currentElement = currentElement.parentNode;
										}
									}
								} else if (e.charAt(ca) == " ") {
									// Attributes ?
									var attrName = "";
									var attrValue = "";
									var checkName = false;
									var checkValue = false;
									var searchValue = false;
									var openedValue = "'";
									for (ca = ca + 1; ca < strl; ca++) {
										if (checkValue) {
											if (e.charAt(ca) == openedValue) {
												attrName.$jaz_trim();
												// Create Attribute
												if (attrName.length > 0) {
													if (currentElement) {
														$jaz_debugAttr("Set Attribute " + attrName + " = '" + attrValue + "'");
														currentElement.setAttribute(attrName, attrValue);
													}
													attrName = "";
													attrValue = "";
												}
												checkValue = false;
											} else {
												attrValue = attrValue + e.charAt(ca);
											}
										// Break
										} else if (e.charAt(ca) == ">") {
											break;
										// Close Element	
										} else if (e.charAt(ca) == "/") {
											if (currentElement) {
												$jaz_debugAttr("Close C: " + currentElement);
												$jaz_debugAttr("Back to: " + currentElement.parentNode);
												if (currentElement.parentNode) {
													currentElement = currentElement.parentNode;
												}
											}
										// Create Name
										} else if (checkName) {
											
											if (e.charAt(ca) == " ") {
												checkName = false;
											} else if (e.charAt(ca) == "=") {
												checkName = false;
												searchValue = true;
											} else {
												attrName = attrName + e.charAt(ca);
											}
											
										} else if (searchValue) {
											if (e.charAt(ca) == "'") {
												openedValue = "'";
												checkValue = true;
												searchValue = false;
											} else if (e.charAt(ca) == '"') {
												openedValue = '"';
												checkValue = true;
												searchValue = false;
											}
										
										} else if (e.charAt(ca) == " ") {
											// Skipp
										} else {
											if (e.charAt(ca) == "=") {
												if (attrName.length > 0) {
													searchValue = true;
												}
											} else if (searchValue) {
												if (e.charAt(ca) == "'" || e.charAt(ca) == '"') {
													checkValue = true;
												}
											} else {
												attrName.$jaz_trim();
												if (attrName.length > 0) {
													if (currentElement) {
														$jaz_debugAttr("Set alone Attribute '" + attrName + "'");
														currentElement.setAttribute(attrName, null);
													}
													attrName = "";
												}
												attrName = e.charAt(ca);
												checkName = true;
											}
										}
									}
								}
							}
							// Check Text
							if (ca < strl) {
								$jaz_debugTree("Stoped text check at: " + ca + " = " + e.charAt(ca));
								var txt = "";
								for (ca = ca + 1; ca < strl; ca++) {
									if (e.charAt(ca) == ">") {
										break;
									// Close Element
									} else if (e.charAt(ca) == "/") {
										if (currentElement) {
											$jaz_debugTree("Close E: " + currentElement);
											$jaz_debugTree("Back to: " + currentElement.parentNode);
											if (currentElement.parentNode) {
												currentElement = currentElement.parentNode;
											}
										}
									} else {
										txt = txt + e.charAt(ca);
									}
								}
								$jaz_debugTree("Text: " + txt);
								if (txt.length > 0) {
									if (currentElement) {
										currentElement.appendChild(document.createTextNode(txt));
									}
								}
							}
							
						}
					}
				}
				if (currentElement) {
					$jaz_debugTree("New Element: " + currentElement);
					this.element = currentElement;
				}
				
			// TAG NAME
			} else {
				var arr = document.getElementsByTagName(data);
				if (arr.length > 1) {
					this.elements = arr;
				} else if (arr.length == 1) {
					this.element = arr[0];
				}
			}
		}
	} else {
		//alert("Invalid Argument for $jaz");
		//throw new Error("$jaz with undefined argument not implemented yet!");
	}
	
	
	////////////////////////////////////////////
	// Parameters
	////////////////////////////////////////////
	// LENGTH
	var len = 0;
	if (this.element) {
		len = 1;
	} else if (this.elements) {
		len = this.elements.length;
	}
	this.__defineGetter__("length", function() { 
		return len;
	});
	this.__defineSetter__("length", function() {
		throw new Error("length is a constant");
    });
	
	////////////////////////////////////////////
	// forEach
	////////////////////////////////////////////
	this.each = function(cb, reverse) {
		if (this.element) {
			cb(this.element, 0);
		} else if (this.elements) {
			var len = this.elements.length;
			var rev = reverse || false;
			if (rev) {
				for (var i = len-1; i >= 0; i--) {
					cb(this.elements[i], i, this);
				}
			} else {
				for (var i = 0; i < len; i++) {
					cb(this.elements[i], i, this);
				}
			}
		}
	};
	
	////////////////////////////////////////////
	// get
	////////////////////////////////////////////
	this.get = function (index) {
		if (this.element) {
			return this.element;
		} else {
			return this.elements[index];
		}
	}
	
	////////////////////////////////////////////
	// Init Elements
	////////////////////////////////////////////
	this.each( function(el, index, j) {
		el.$jaz = el.$jaz || {};
		el.$jaz.animation = el.$jaz.animation || (new Array());
	});
	
		
	this.toString = function() {
		if (this.element) {
			return "$jaz : " + this.element;
		} else if (this.elements) {
			return "$jaz : Array.length = " + this.length;
		}
		
	}
	
	
	
	this.show = function() {
		this.css("display", "inline-block");
	};
	this.hide = function() {
		this.css("display", "none");
	};
	
};

/**
* Define a constant in a object
*
* @param obj	The obj to add a constant
* @param name	the name for the constant value
* @param value	the value for the constant
*/
$jaz.defineConstant = function(obj, name, value) {
	obj.__defineGetter__(name, function() { return value; });
	obj.__defineSetter__(name, function() {
		throw new Error(name + " is a constant");
    });
};

/**
* $jaz Version
*/
$jaz.defineConstant($jaz, "VERSION", 1.0);


/**
* Get a namespace in the $jaz object
* creates a namespace if it doesn't exists
*
* @param namespaceString	namespaces with dots separated (config.animation)
*/
$jaz.namespace = function (namespaceString) {
	var parts = namespaceString.split('.'),
		parent = $jaz,
		currentPart = '';
	
	for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }
	
	return parent;
};

/**
* Static Function for analyzing if the given argument is a object
*
* @return TRUE if the given argument is a instanceof object
* @param obj	The object to analye
*/
$jaz.isObject = function (obj) {
	if (typeof obj === "undefined") return false;
	if (obj instanceof Object) return true;
	return false;
};

$jaz.prototype.clear = function() {
	this.each( function (el, i, jaz) {
		while(el.firstChild) {
			el.removeChild(el.firstChild);
		}
	});
};

/**
* DEVELOP MODE not for use!
*/
$jaz.prototype.text = function (data) {
	// SET
	if (typeof data == "string" || typeof data == "number") {
		this.clear();
		this.each( function (el, i, jaz) {
			el.appendChild(document.createTextNode(data));
		} );
		return this;
	// GET
	} else {
		return "Not implemented yet!";
	}
};

/**
* Copy the HTML element or elements in side and 
*
* @return a new $jaz Instance 
*/
$jaz.prototype.copy = function () {
	if (this.element) {
		return $jaz(this.element.cloneNode(true));
	} else if (this.elements) {
		var len = this.elements.length;
		var newElements = new Array();
		for (i = 0; i < len; i++) {
			newElements.push(this.elements[i].cloneNode(true));
		}
		return $jaz(newElements);
	}
}

/**
* Convert a given string into a JavaScript Statement
* for using it for Array ID Names
* f.e.: background-color convert to backgroundColor
*
* @return The converted string
* @param style	the style name as string to convert
*/
$jaz.convertToJStatement = function (style) {
	if (typeof style == "string") {
		var sp = style.split("-");
		var len = sp.length;
		var slen = 0;
		var temp = "";
		for (i = 1; i < len; i++) {
			slen = sp[i].length;
			temp = "";
			if (slen > 0) {
				temp = sp[i].substring(0, 1).toUpperCase();
			}
			if (slen > 1) {
				temp = temp + sp[i].substring(1, slen);
			}
			sp[i] = temp;
		}
		return sp.join("");
	} else {
		throw new Error("INVALID_ARGUMENT");
	}
}

/**
* Call this to handle a good animation
*/
$jaz.requestAnimationFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000.0 / 60.0);
    };
})();

// class name

/* http://de.selfhtml.org/javascript/objekte/node.htm */

/////////////////////////////////////////////////////////////////////
// functionaliy for Classes
/////////////////////////////////////////////////////////////////////

$jaz.prototype.addClass = function(className) {
	className.$jaz_trim();
	// do it for every array-object
	if(this.elements) {
		for(var i = 0, length = this.elements.length; i < length; ++i) {
			($jaz(this.elements[i])).addClass(className);
		}
	}

	if(!this.hasClass(className)) {
		var classNames = this.element.getAttribute("class");
		var newClassNames;
		if(classNames) {
			newClassNames =  classNames + " " + className;
		} else {
			newClassNames = className;
		}
		this.element.setAttribute("class", newClassNames);
	}
};
/**
* returns true if the html element of the $jaz - element has a
* class with the given name
*/
$jaz.prototype.hasClass = function(className) {
	className.$jaz_trim();
	
	if(this.elements) {
		error("hasClass is not implemented for jaz-array-objects yet.");
		return false;
	}

	var classString = this.element.getAttribute("class"); // returns null if it is not available
	if(classString && classString.length >= className.length) {
		var classes = classString.split(" ");
		if(classes.$jaz_contains(className)) {
			return true;
		}
	}
	return false;
};

$jaz.prototype.removeClass = function(className) {
	className.$jaz_trim();
	
	this.each( function ( el, index, jaz ) {
		var classString = el.getAttribute("class");
		if(classString) {
			var myClassNames = classString.split(" ");
			myClassNames.$jaz_removeElement(className);
			var myNewClassString = myClassNames.join(" ");
			el.setAttribute("class", myNewClassString);
		}
	
	} );
};

/////////////////////////////////////////////////////////////////////
// functionaliy for attributes and css
/////////////////////////////////////////////////////////////////////

//$jaz.prototype.attr = function(attributeName) {

$jaz.prototype.attr = function(attributeName, value) {
	attributeName.$jaz_trim();
	
	//alert(attributeName);
	if(this.elements) {
		error("attr: not implemented for jaz-array-object");
		return "undefined";
	}
	//alert("attr: value = " + value);
	if(typeof value === 'undefined') {
		
		//alert("attr(" +  attributeName + ") = " + 
		//	this.element.getAttribute(attributeName)) ;
		
		return this.element.getAttribute(attributeName);
	} else {
		value.$jaz_trim();
		//alert("setAttr: " + attributeName + " --> " + value);
		this.element.setAttribute(attributeName, value);
	}
	return this;
};

$jaz.prototype.css = function(cssName, value) {
	
	cssName.$jaz_trim();
	cssName = $jaz.convertToJStatement(cssName);
	if(typeof value === 'undefined' ) { // getter function
		var result = new Array();
		
		this.each(function(el, index, jaz) {
			result.push(el.style[cssName]);
		});
		
		if(result.length > 1) {
			return result;
		} else if(result.length == 1) {
			return result[0];
		} else {
			return null;
		}
	} else {
		this.each(function(el, index, jaz) {
			
			//value.$jaz_trim();
			if(typeof value == "string") {
				value.$jaz_trim();
			}
			
			
			if(typeof el.style === "undefined") {
				el.setAttributeNode(document.createAttribute("style"));
			}
			el["style"][cssName] = value;
		});
	}
	return this;
	
};

/////////////////////////////////////////////////////////////////////
// functionaliy for adding/ replacing/ getting nodes
/////////////////////////////////////////////////////////////////////

$jaz.prototype.append = function(childElement) {
	
	if(childElement instanceof $jaz) {
		var jazParent = this;
		// Append each Child To
		childElement.each( function (child, childIndex) {
			// each parent
			jazParent.each( function (parent, i) {
				// to first parent the original object
				if (i == 0) {
					parent.appendChild(child);
				// to each other a copy of it
				} else {
					parent.appendChild(child.cloneNode(true));
				}
			} );
		});
		// if(childElement.element) {
			// this.element.appendChild(childElement.element);
		// } else if(childElement.elements) {
			// var length = childElement.elements.length;
			// for(var i = 0; i < length; ++i) {
				// this.element.appendChild(childElement.elements[i]);
			// }
		// }
		return this;
	} else {
		return this.append($jaz(childElement));
	}
};

$jaz.prototype.prepend = function(childElement, reverse) {
	var rev = reverse || false;
	
	if(childElement instanceof $jaz) {
		var jazParent = this;
		// Append each Child To
		childElement.each( function (child, childIndex) {
			// each parent
			jazParent.each( function (parent, i) {
				// to first parent the original object
				if (i == 0) {
					parent.insertBefore(child, parent.firstChild);
				// to each other a copy of it
				} else {
					parent.insertBefore(child.cloneNode(true), parent.firstChild);
				}
			} );
		}, (!rev));
		return this;
	} else {
		return this.prepend($jaz(childElement), reverse);
	}
}

/* // does not work at the moment
$jaz.prototype.lastChild = function() {
	var el = this.element;
	if(this.elements) { // if it is an error
		el = this.elements[this.elements.length - 1];
	}
	//alert(el.lastChild); object text
	return $jaz(el.lastChild);
};
*/

$jaz.prototype.replace = function(newNode) {
	var el = newNode;
	if(newNode instanceof $jaz) {
		if(newNode.element) {
			el = newNode.element;
		} else { // newnode is jaz array object
			error("replace: the case that newNode is an jaz array object is not good handled yet");
			el = newNode.elements[0];
		}
	} 
	if(this.elements) {	// array handling
		// do it for every array-object
		for(var i = 0, length = this.elements.length; i < length; ++i) {
			($jaz(this.elements[i])).replace(newNode.copy());
		}
	} else {
		// alert("replace: replaced: " + this.element + ", replacer: " + el);
		this.element.parentNode.replaceChild(el, this.element);
	}
};

/* // old:

$jaz.prototype.replace = function(newNode) {
	var el = newNode;
	if(newNode instanceof $jaz) {
		
		
		if(newNode.element) {
			el = newNode.element;
		} else { // array handling
			// do it for every array-object
			for(var i = 0, length = this.elements.length; i < length; ++i) {
				($jaz(this.elements[i])).replace(newNode.copy());
			}
		}
	} 
	alert("replace: " + this.element);
	this.element.parentNode.replaceChild(el, this.element);
};

*/

$jaz.prototype.remove = function() {

	this.each ( function ( el ) {
		el.parentNode.removeChild(el);
	});

	return this;
};

/////////////////////////////////////////////////////////////////////
// functionaliy for ARRAY
/////////////////////////////////////////////////////////////////////
Array.prototype.$jaz_contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
};

//$jaz.contains = function(array, obj) { // ... };

/**
* removes every object from the array which is the same as obj
*/
Array.prototype.$jaz_removeElement = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			// remove this from the array
			this.splice(i, 1);
		}
	}
};

/*
$jaz.removeElement = function(array, obj) {
	var i = array.length;
	while (i--) {
		if (array[i] === obj) {
			// remove this from the array
			array.splice(i, 1);
		}
	}
};
*/

/**
*	append, insert, attr, :last, animation

appendChild:
Hängt einen zuvor neu erzeugten Knoten in die bestehende Knotenstruktur ein, 
und zwar so, dass er als letztes Kindelement eines anzugebenden Knotens eingefügt wird.
--> Kind wird in angegebenen Knoten eingehängt, als letztes unterelement

*/

var $jaz = $jaz || {};

/*
	the fluidity of the slide animation
	every fluidity milliseconds the slideLoop will be called, 
	the smaller the number, the more fluid is the animation
*/
$jaz.animation = $jaz.animation || {};

$jaz.animation.fluidity = 100; // was 30

$jaz.animation.debug = false;

$jaz.animation.NUM_OF_ANIMATIONS = "numOfAnimations";

//$jaz.defineConstant = function(obj, name, value) {

$jaz.animation.units = {
	"width" : "px",
	"height" : "px",
	
	"padding-left" : "px",
	"padding-right" : "px",
	"padding-bottom" : "px",
	"padding-top" : "px",
	
	"left" : "px",
	"top" : "px",
	"right" : "px",
	"bottom" : "px",

	"opacity" : "",
};

$jaz.prototype.animate = function(animObjs, finishedFunc) {
	
	var thisJaz = this;

	// to do : for each
	if(typeof animObjs == "object") {
		// if it is only one jsonObject --> convert it to an array
		if(!(animObjs instanceof Array)) { // only one json-object
			// convert to array
			var obj = animObjs;
			animObjs = new Array();
			animObjs.push(obj);
		} 
		// now it is an array	
	} else {
		error("animate: no obj");
		return;
	}
	
	//var htmlElement = this.element;
	
	this.each(function(htmlElement, index, jaz) {
	
		htmlElement.$jaz.animation = htmlElement.$jaz.animation || (new Array());
		htmlElement.$jaz.animation.items = htmlElement.$jaz.animation.items || (new Array());
		htmlElement.$jaz.animation.numOfAnimations = htmlElement.$jaz.animation.numOfAnimations || 0;
		// if(isNaN(htmlElement.$jaz.animation[$jaz.animation.NUM_OF_ANIMATIONS])) {
			// htmlElement.$jaz.animation[$jaz.animation.NUM_OF_ANIMATIONS] = 0;
		// }
		
		// an array of json-objects
		/////////////////////////////////////////////////////////
		// Change value function
		////////////////////////////////////////////////////////
		/*
		* this ist the heart function of the animation, it changes the value of a special 
		* style attribute (once)
		* input parameters: 
		*		element: an html element,
		*		beginTime: time when the animation began
		* 		endTime: time when the animation shall be finished
		*		sizeDifference: the value how much the style attribute shall change in the whole animation
		*		styleAttr: the name of the style attribute, which shall be animated/changed 
		*		(this can be for example width, height, top, padding, ...)
		*		slideToValue: the value which shall be reached by the animation
		* it returns
		*		true if the animation is ready (the slideToValue has been reached)
		*		false if the animation isn't ready yet (which means that this function has to
		*			be called at least once again)
		*/
		
		var changeValue = function (jsObj, htmlElement) {
			var newSize;
			var currentTime = new Date().getTime();

			if(currentTime >= jsObj.endTime) { // animation shall be finished
				htmlElement.style[jsObj.attribute] = jsObj.slideToValue + $jaz.animation.units[jsObj.attribute];
				return true; // this animation is ready
			} else {
				newSize = jsObj.beginSize + jsObj.sizeDifference * 
					(currentTime - jsObj.beginTime) / (jsObj.endTime - jsObj.beginTime);
				htmlElement.style[jsObj.attribute] = newSize + $jaz.animation.units[jsObj.attribute];
				return false; // this animation isn't ready yet
			}
		}; // end valueChange -----------------------------------
		
		/////////////////////////////////////////////////////////
		// Animation Loop
		////////////////////////////////////////////////////////
		/*
		* this function loops over all functions in the given array, the functions are strings
		* which will be evaluated
		* if an function is ready, it returns true, and will be deleted from the array, so it won't
		* be evaluated again
		*/

		var animationsLoop = function(htmlElement) {
			var animation = htmlElement.$jaz.animation;
			if(animation.numOfAnimations > 0) { // stop when there are no more functions in the array
				for(var jsObj in animation.items) {	
	
					if(changeValue(animation.items[jsObj], htmlElement)) {
						animation.numOfAnimations--;//[$jaz.animation.NUM_OF_ANIMATIONS]--;
						if (typeof animation.items[jsObj].callback == "function") {
							animation.items[jsObj].callback(jsObj, thisJaz);
						}					
						delete animation.items[jsObj];
					}
				}
				setTimeout(animationsLoop, $jaz.animation.fluidity, htmlElement); 
			} else {
				if (typeof finishedFunc == "function") {
					finishedFunc(thisJaz);
				}
			}
		}; // end animationsLoop ---------------------------------------------
		
		/////////////////////////////////////////////////////////
		// Begin working here
		////////////////////////////////////////////////////////
		
					//var functionsArray = new Array();
		var functionString = "";
		var currentTime = new Date().getTime(); 
		
		/*
		* Write for each animation part
		*  - beginTime	the current time in milliseconds
		*  - endTime	the current time + duration
		*  - beginSize	the among of size the attribute have at start
		*  - sizeDifference the difference between the end size and start size
		*/
		var animObjsLength = animObjs.length;
		for (var i = 0; i < animObjsLength; i++) {
			// adding all necessary attributes to the json-Object
			var obj = animObjs[i];
			var attrName = obj.attribute; //["attribute"];
			
			obj.beginTime = currentTime;
			obj.endTime = currentTime + parseFloat(obj["duration"]);
			
			var beginAttrValue = parseFloat(htmlElement.style[attrName]);

			obj.beginSize = beginAttrValue;
			obj.sizeDifference = parseFloat(obj.slideToValue) - beginAttrValue;
			// save json-animation-object in the html-element
			if (typeof htmlElement.$jaz.animation.items[attrName] === "undefined") {
				htmlElement.$jaz.animation.numOfAnimations++;//[$jaz.animation.NUM_OF_ANIMATIONS]++;
			} else {
				delete htmlElement.$jaz.animation.items[attrName];
			}
			htmlElement.$jaz.animation.items[attrName] = obj;
			// if there is currently no loop running, start a new one
			if(htmlElement.$jaz.animation.numOfAnimations == 1) {
				animationsLoop(htmlElement);
				
			} 	
		}
		
				
	});
	
};

function error(msg) {
	throw new Error("jJaz-error: " + msg);
}
