function HandleSubmit() {
  GetChannelTokenAsync(document.forms["myform"]["client_id"].value,
                       document.forms["myform"]["duration"].value,
                       function(token) {
                         var channel = new Channel(token);
                         channel.open({
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