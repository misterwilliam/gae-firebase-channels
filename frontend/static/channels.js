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
      this.onerror(error);
    } else {
      // Configure presence events
      const presenceRef = fbRef.child("channel_client_status")
                               .child(authData.auth.channel_id);
      presenceRef.set("connected");
      presenceRef.onDisconnect().set("disconnected");
      // Subscribe to channel status events
      this.channelStatusRef = fbRef.child("channels")
                                   .child(authData.auth.channel_id)
                                   .child("_meta/status");
      this.valueEventHandler = function(snapshot, prevChildKey) {
        if (snapshot.exists()) {
          if (snapshot.val() == "open") {
            this.onopen();
          } else if (snapshot.val() == "closed") {
            console.log("cleaned up");
            this.onclose();
            this._disconnect();
          }
        }
      }.bind(this);
      this.channelStatusRef.on('value', this.valueEventHandler);
      // Subscribe to messages
      this.messagesRef = fbRef.child("channels")
                              .child(authData.auth.channel_id)
                              .child("messages");
      this.childEventHandler = function(snapshot, prevChildKey) {
        if (snapshot.exists()) {
          this.onmessage(snapshot.val());
        }
      }.bind(this);
      this.messagesRef.on('child_added', this.childEventHandler);
    }
  }.bind(this));

  this.authEventHandler = function(authData) {
    if (authData == null) {
      var didDisconnect = this._disconnect();
      if (didDisconnect) {
        this.onclose();
        fbRef.offAuth(this.authEventHandler);
      }
    }
  }.bind(this);
  fbRef.onAuth(this.authEventHandler);
}

Socket.prototype._disconnect = function() {
  var didDisconnect = false;
  if (this.channelStatusRef != null && this.valueEventHandler != null) {
    this.channelStatusRef.off('value', this.valueEventHandler);
    this.channelStatusRef = null;
    this.valueEventHandler = null;
    didDisconnect = true;
  }
  if (this.messagesRef != null && this.childEventHandler != null) {
    this.messagesRef.off('child_added', this.childEventHandler);
    this.messagesRef = null;
    this.childEventHandler = null;
    didDisconnect = true;
  }
  return didDisconnect;
}
