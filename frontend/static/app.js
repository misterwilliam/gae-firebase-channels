function HandleSubmit() {
  GetChannelTokenAsync('asdf', function(token) {console.log(token)})
}

function GetChannelTokenAsync(channelId, callback) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", function(event) {
    callback(event.target.responseText);
  });
  req.open("GET", "/api/channels/" + channelId);
  req.send();
}
