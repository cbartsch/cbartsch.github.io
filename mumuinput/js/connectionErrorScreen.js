"use strict";define(["utils","constants"],function(e,n){var t={};return t.getScreenElement=function(){return document.getElementById("connection-error-screen")},t.init=function(){var c=document.getElementById("host-name");c.value=e.getCookie(n.HOST_NAME_COOKIE,n.DEFAULT_HOST),c.addEventListener("blur",function(){e.setCookie(n.HOST_NAME_COOKIE,c.value)}),document.getElementById("error-reconnect").addEventListener("click",function(){t.success()})},t.success=function(){},t.fail=function(){},t});