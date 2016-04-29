function HandleSubmit() {
  GetChannelTokenAsync(document.forms["myform"]["client_id"].value,
                       function(token) {
                         console.log(token)
                       });
}

function GetChannelTokenAsync(channelId, callback) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", function(event) {
    callback(event.target.responseText);
  });
  req.open("GET", "/api/channels/" + channelId);
  req.send();
}
