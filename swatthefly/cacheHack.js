/* JavaScript iOS Cache Hack for Wikitude 7.0 */
function cacheHack () {
	return cacheHack.random;
};
if (navigator.userAgent.match(/Android/i) == null) {
	cacheHack.random = "?ios=" + Math.floor(Math.random()*99999);
} else  {
	cacheHack.random = "";
}