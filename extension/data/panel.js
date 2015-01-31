var baseNode = document.getElementsByTagName("base");
var forumName = document.getElementById("forumName");
var rootInput = document.getElementById("forumRoot");
var forumEntryAnchor = document.getElementById("forumEntry");
var notificationList = document.getElementById("notificationList");
var infoBox = document.getElementById("infoBox");
var throbber = document.getElementById("throbber");
var errorMessage = document.getElementById("errorMessage");

attachClickEvents(document.getElementsByTagName("a"));

self.port.on("send-list", function(listHtml) {
    notificationList.innerHTML = listHtml;
    attachClickEvents(notificationList.getElementsByTagName('a'));
});

self.port.on("send-storage", function(urlRoot, siteName) {
    baseNode.href = urlRoot;
    rootInput.value = urlRoot;
    forumName.textContent = siteName;
    forumEntryAnchor.href = urlRoot + "/entry/signin";
    throbber.className = "Hidden";
});

/* hide the notification list if logged out */
self.port.on("loggedOut", function() {
    notificationList.className = "Hidden";
    infoBox.className = "";
});

/* hide the settings if logged in */
self.port.on("loggedIn", function() {
    infoBox.className = "Hidden";
    notificationList.className = "";
});

/* show an error message if an invalid url is entered */
self.port.on("invalidVanillaForum", function(msg) {
   errorMessage.className = ""; 
   errorMessage.innerHTML = msg;
   throbber.className = "Hidden";
});

/* Update the stored webroot when changed */
rootInput.addEventListener("change", function(e) {
    self.port.emit("updatedForumRoot", this.value);
    errorMessage.className = "Hidden";
    throbber.className = "";
});

function attachClickEvents(anchors) {
   for(var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener("click", function(e) {
         e.preventDefault();
         self.port.emit("click", this.getAttribute("href"));
      });
   }
}