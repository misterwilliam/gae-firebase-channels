// Global
socket = null;

function HandleSubmitChannelForm() {
  GetChannelTokenAsync(document.forms["channel_form"]["client_id"].value,
                       document.forms["channel_form"]["duration"].value,
                       function(token) {
                         var channel = new Channel(token);
                         socket = channel.open({
                           onopen: function() {
                             console.log("Channel opened");
                           },
                           onmessage: function(message) {
                             console.log(message);
                           },
                           onclose: function() {
                             console.log("Channel closed");
                           },
                           onerror: function(error) {
                             console.log("Channel error", error);
                           }
                         })
                       });
}

function GetChannelTokenAsync(channelId, duration, callback) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", function(event) {
    callback(event.target.responseText);
  });
  req.open("GET", "/api/channels/" + channelId + "?duration=" + duration.toString());
  req.send();
}

function HandleSubmitMessageForm() {
  var channelId = document.forms["message_form"]["client_id"].value;
  var message = document.forms["message_form"]["message"].value;
  var req = new XMLHttpRequest();
  req.open("POST", "/api/channels/" + channelId + "/message");
  var formData = new FormData();
  formData.append("message", message);
  req.send(formData);
}

function HandleCloseChannel() {
  if (socket != null) {
    socket.close();
  }
}
