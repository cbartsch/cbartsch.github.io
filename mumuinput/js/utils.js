"use strict";define(["constants"],function(e){var t={};return t.requestFullscreen=function(e){e.requestFullscreen?e.requestFullscreen():e.msRequestFullscreen?e.msRequestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen&&e.webkitRequestFullscreen()},t.clamp=function(e,t,n){return Math.max(Math.min(e,n),t)},t.setCookie=function(t,n,i){r||(i=e.DEFAULT_COOKIE_EXPIRATION);var r=new Date;r.setTime(r.getTime()+24*i*60*60*1e3);var o="expires="+r.toUTCString();document.cookie=t+"="+n+"; "+o},t.getCookie=function(e,t){for(var n=e+"=",i=document.cookie.split(";"),r=0;r<i.length;r++){for(var o=i[r];" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(n))return o.substring(n.length,o.length)}return t},t.addClass=function(e,t){var n=e.getAttribute("class");n.indexOf(t)<0&&e.setAttribute("class",n+t)},t.removeClass=function(e,t){var n=e.getAttribute("class");n.indexOf(t)>=0&&e.setAttribute("class",n.replace(t,""))},t.eachElement=function(e,t){for(var n=0;n<e.length;n++)t(e.item(n))},t.lockLandscapeOrientation=function(){var e=window.orientation;window.addEventListener("resize",function(){var t=Math.max(window.outerWidth,window.outerHeight),n=Math.min(window.outerWidth,window.outerHeight),i="";e!==window.orientation&&(i="transform: rotate("+e+"deg)",e=window.orientation),document.body.setAttribute("style","width:"+t+"px; height:"+n+"px;"+i)})},t});