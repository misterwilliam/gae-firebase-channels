var FIREBASE_URL = "https://fb-channel.firebaseio.com/";

function Channel(token) {
  this.token = token;
}

Channel.prototype.open = function(optional_handler) {
  return new Socket(this.token, optional_handler);
}

function Socket(token, optional_handler) {
  this.token = token;
  if (optional_handler != null) {
    this.onopen = optional_handler.onopen != null ? optional_handler.onopen : function(){};
    this.onmessage = optional_handler.onmessage != null ? optional_handler.onmessage : function(){};
    this.onerror = optional_handler.onerror != null ? optional_handler.onerror : function(){};
    this.onclose = optional_handler.onclose != null ? optional_handler.onclose : function(){};
  }
  this._connect();
}

Socket.prototype._connect = function() {
  const fbRef = new Firebase(FIREBASE_URL);
  fbRef.authWithCustomToken(this.token, function(error, authData) {
    if (error != null) {
      // TODO: Handle auth error
    } else {
      // Configure presence events
      const presenceRef = fbRef.child("channel_client_status")
                               .child(authData.auth.channel_id);
      presenceRef.set("connected");
      presenceRef.onDisconnect().set("disconnected");
      // Subscribe to channel status events
      fbRef.child("channels")
           .child(authData.auth.channel_id)
           .child("_meta/status")
           .on('value',
                function(snapshot, prevChildKey) {
                  if (snapshot.exists()) {
                    if (snapshot.val() == "open") {
                      this.onopen();
                    } else if (snapshot.val() == "closed") {
                      this.onclose();
                    }
                  }
                }.bind(this));
      // Subscribe to messages
      fbRef.child("channels")
           .child(authData.auth.channel_id)
           .child("messages")
           .on('child_added',
            function(snapshot, prevChildKey) {
               if (snapshot.exists()) {
                 this.onmessage(snapshot.val());
               }
            }.bind(this));
    }
  }.bind(this))
}
