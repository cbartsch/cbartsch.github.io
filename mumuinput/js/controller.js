"use strict";define(["utils","constants"],function(n,o){return function(t){function e(){v.orientation=i(window.orientation),l.isInputDisabled()||(window.DeviceMotionEvent?v.orientation===o.LANDSCAPE&&(v.axisScale=7.5*(window.orientation>0?1:-1)):window.DeviceOrientationEvent?v.axisScale=80*(window.orientation>0?1:-1):v.axisScale=1)}function i(n){return 0===n?o.PORTRAIT:o.LANDSCAPE}function c(o){return n.clamp(o,-1,1)}function a(){l.onInput(v.controller)}function r(){var n={type:o.MESSAGE_TYPE_HELLO,id:v.id,name:v.name};l.sendMessage(JSON.stringify(n)),l.onConnect()}function s(t){var e=JSON.parse(t.data);e&&(e.type===o.MESSAGE_TYPE_HELLO?(v.handshake=!0,v.id=e.id,n.setCookie(o.USER_ID_COOKIE,v.id)):l.onMessage(e))}function d(n){l.onError(n)}function u(){l.onDisconnect()}var l=this,v={id:n.getCookie(o.USER_ID_COOKIE),name:void 0,connection:void 0,handshake:!1,orientation:i(window.orientation),axisScale:1,actionCount:0,controller:{axis:0}};l.connect=function(n,o){v.connection||(v.connection=new WebSocket(n),v.name=o,v.connection.onopen=r,v.connection.onmessage=s,v.connection.onerror=d,v.connection.onclose=u)},l.sendInput=function(){v.connection&&!l.isInputDisabled()&&v.connection.readyState===WebSocket.OPEN&&v.connection.send(JSON.stringify(v.controller))},l.disconnect=function(){v.connection&&!l.isInputDisabled()&&v.connection.readyState===WebSocket.OPEN&&(v.connection.close(),v.connection=void 0,v.handshake=!1)},l.sendMessage=function(n){v.connection&&v.connection.readyState===WebSocket.OPEN&&v.connection.send(n)},l.getControllerData=function(){return v.controller},l.isInputDisabled=function(){return!v.handshake&&!(window.DeviceMotionEvent||v.orientation===o.LANDSCAPE)},l.getAxisMethod=function(){return window.DeviceMotionEvent?"DeviceMotion":window.DeviceOrientationEvent?"DeviceOrientationEvent":"MozOrientation/Nothing"},l.addAction=function(n){function o(n){l.isInputDisabled()||(v.controller[i]=!0,a())}function t(n){l.isInputDisabled()||(v.controller[i]=!1,a())}var e=v.actionCount+1;v.actionCount=e;var i="action"+(e>1?e:"");v.controller[i]=!1,n.addEventListener("touchstart",o),n.addEventListener("touchend",t),n.addEventListener("mousedown",o),n.addEventListener("mouseup",t)},this.onConnect=function(){},this.onMessage=function(n){},this.onError=function(n){},this.onDisconnect=function(){},this.onInput=function(n){},e(),window.DeviceMotionEvent?window.addEventListener("devicemotion",function(n){l.isInputDisabled()||(v.controller.axis=c(n.accelerationIncludingGravity.y/v.axisScale),a())}):window.DeviceOrientationEvent?window.addEventListener("deviceorientation",function(n){l.isInputDisabled()||(v.controller.axis=c(n.beta/v.axisScale),a())}):window.addEventListener("MozOrientation",function(n){l.isInputDisabled()||(v.controller.axis=n.x,a())}),window.addEventListener("orientationchange",e)}});