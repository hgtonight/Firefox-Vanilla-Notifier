attachClickEvents(document.getElementsByTagName("a"));

self.port.on("send-list", function(listHtml) {
    document.getElementById("notificationList").innerHTML = listHtml;
    attachClickEvents(document.getElementById("notificationList").getElementsByTagName('a'));
});

self.port.on("send-storage", function(forumRoot, forumName) {
    document.getElementById("forumName").textContent = forumName;
    document.getElementById("forumEntry").href = forumRoot + "/entry/signin";
    document.getElementById("forumRoot").value = forumRoot;
    document.getElementById("throbber").className = "Hidden";
});

/* hide the notification list if logged out */
self.port.on("loggedOut", function() {
    document.getElementById("notificationList").className = "Hidden";
    document.getElementById("infoBox").className = "";
});

/* hide the settings if logged in */
self.port.on("loggedIn", function() {
    document.getElementById("infoBox").className = "Hidden";
    document.getElementById("notificationList").className = "";
});

/* show an error message if an invalid url is entered */
self.port.on("invalidVanillaForum", function() {
   document.getElementById("errorMessage").className = ""; 
   document.getElementById("throbber").className = "Hidden";
});

/* Update the stored webroot when changed */
document.getElementById("forumRoot").addEventListener("change", function(e) {
    self.port.emit("updatedForumRoot", this.value);
    document.getElementById("errorMessage").className = "Hidden";
    document.getElementById("throbber").className = "";
});

function attachClickEvents(anchors) {
   for(var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener("click", function(e) {
         e.preventDefault();
         self.port.emit("click", this.getAttribute("href"));
      });
   }
}