"use strict";

const { ToggleButton } = require('sdk/ui/button/toggle');
const { data } = require("sdk/self");
const request = require("sdk/request").Request;
var panels = require("sdk/panel");
var timers = require("sdk/timers");
var ss = require("sdk/simple-storage");

var countNotifications = 0;
var loggedIn = false;

if(!ss.storage.forumRoot) {
    ss.storage.forumRoot = "http://vanillaforums.org";
}
if(!ss.storage.forumName) {
    ss.storage.forumName = "Vanilla Forums.org";
}

var updateInterval = 10; // update interval in minutes

var iconOn = {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    };
    
var iconOff = {
        "16": "./icon-16-off.png",
        "32": "./icon-32-off.png",
        "64": "./icon-64-off.png"
    };
    

var button = ToggleButton({
    id: "vanilla-notifier",
    label: "Vanilla Notifier",
    icon: iconOn,
    onChange: handleChange
});

var panel = panels.Panel({
    contentURL: data.url("panel.html"),
    contentScriptFile: data.url("panel.js"),
    onHide: handleHide
});

panel.port.on("click", function (url) {
    if(url.substr(0, ss.storage.forumRoot.length) !== ss.storage.forumRoot) {
        url = ss.storage.forumRoot + url;
    }
    require("sdk/tabs").open(url);
    panel.hide();
});

panel.port.on("updatedForumRoot", function(tempUrl) {
    request({
        url: tempUrl + "/utility.json/alive",
        onComplete: function (response) {
            var alive = response.json;
            if(alive && alive.Success) {
               getVanillaName(tempUrl);
            }
            else {
                panel.port.emit("invalidVanillaForum");
            }
        }}).get();
});

panel.port.emit("send-storage", ss.storage.forumRoot, ss.storage.forumName);

function getVanillaName(forumUrl) {
    request({
        url: forumUrl + "/utility/alive",
        onComplete: function (response) {
            var titles = response.text.match(/<title>(.*?)<\/title>/);
            updateStorage(forumUrl, titles[1]);
        }}).get();
}

function handleChange(state) {
    if (state.checked) {
        updatePanelContent();
        panel.show({
            position: button
        });
    }
}

function handleHide() {
    button.state('window', {checked: false});
}

function updateStorage(tempUrl, tempName) {
    ss.storage.forumRoot = tempUrl;
    ss.storage.forumName = tempName;
    panel.port.emit("send-storage", ss.storage.forumRoot, ss.storage.forumName);
}

function updatePanelContent() {
    updateNotificationCount();
    if(loggedIn) {
        request({
            url: ss.storage.forumRoot + "/profile/notificationspopin?DeliveryType=VIEW",
            onComplete: function (response) {
                var NotificationList = response.text;
                // check for permission and re-authenticate
                panel.port.emit("send-list", NotificationList);
            }}).get();
    }
}

function updateNotificationCount() {
    request({
        url: ss.storage.forumRoot + "/profile.json",
        onComplete: function (response) {
            var ProfileData = response.json;
            if (ProfileData.Code) {
                panel.port.emit('loggedOut');
                loggedIn = false;
                button.icon = iconOff;
            }
            else {
                panel.port.emit('loggedIn');
                loggedIn = true;
                button.icon = iconOn;
                countNotifications = parseInt(ProfileData.Profile.CountNotifications, 10) + parseInt(ProfileData.Profile.CountUnreadConversations, 10);
                if(countNotifications != '0') {
                    button.badge = countNotifications;
                    button.badgeColor =  "#AA0000";
                }
                else {
                    button.badge = null;
                    button.badgeColor = null;
                }
            }
        }}).get();
}

updateNotificationCount();
timers.setInterval(updateNotificationCount, updateInterval * 60 * 1000);