"use strict";requirejs(["controller","utils"],function(e,n){function t(e){document.getElementById("status").setAttribute("class",e)}function o(){var e=document.getElementById("portrait-warning");l.isInputDisabled()?n.addClass(e,a):n.removeClass(e,a)}var c="userId",d="hostName",i="ws://10.29.18.58:12543/MuMu",s=1e3/30,a="input-disabled",r="hidden",l=new e(n.getCookie(c));l.onConnect=function(){t("connected")},l.onDisconnect=function(){t("disconnected")},l.onMessage=function(e){console.log("Message received:",e)},l.onError=function(e){console.error("Error during connection:",e),t("error")},document.getElementById("method").innerHTML=l.getAxisMethod(),document.getElementById("connect").addEventListener("click",function(){n.requestFullscreen(document.body),l.disconnect(),l.connect(n.getCookie(d,i))}),document.getElementById("settings").addEventListener("click",function(){n.removeClass(document.getElementById("settings-dialog"),r)}),l.addAction(document.getElementById("thrust")),l.addAction(document.getElementById("break")),n.eachElement(document.getElementsByClassName("dialog-container"),function(e){e.addEventListener("click",function(t){t.target===e&&n.addClass(this,r)}),n.eachElement(e.getElementsByClassName("close"),function(t){t.addEventListener("click",function(){n.addClass(e,r)})})});var u=document.getElementById("host-name");u.value=n.getCookie(d,i),u.addEventListener("blur",function(){n.setCookie(d,u.value,365)}),window.setInterval(l.sendInput,s),window.addEventListener("orientationchange",o),n.lockLandscapeOrientation()});