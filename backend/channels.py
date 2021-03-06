import datetime

from google.appengine.ext import deferred

from backend.firebase import create_token, fb_delete, fb_get, fb_post, fb_put

DEFAULT_DURATION_MINUTES = 120

# Firebase Channel Schema
# /channels
#   - /<channel id>
#       - /_meta
#           - /status: Status of the channel. Either "open" or "closed".
#       - /messages
#           - /<message id>: A message
# /clients
#   - /channel_ids
#       - /<client id>: Channel id for client.
# /channel_client_status
#   - /<channel id>: Connection status. Either "connected" or "disconnected".

def clear_all_channels():
    """
    Clear all channel related data on Firebase.

    Called at server init to clear up any state that maybe left over from an
    improper server shutdown.
    """
    print "deleting"
    fb_delete("/channels")
    fb_delete("/clients")
    fb_delete("/channel_client_status")

def create_channel(client_id, duration_minutes=None):
    """
    Creates channel
    If called multiple times with same client_id, just returns a new token.
    """
    # TODO: Check what the Channel API does when called multiple times before
    # the token has expired. (Does it close the channel?)
    if duration_minutes is None:
        duration_minutes = DEFAULT_DURATION_MINUTES
    # Initialize /channels/<channel ID>, use Firebase push key as channel ID
    result = fb_post("/channels/", {
      "_meta": {
        "status": "open"
      }
    })
    if "error" in result:
        print "Error in creating channel: %s" % result["error"]
        return
    channel_id = result["name"]

    # Save client channel id
    fb_put("/clients/channel_ids/%s" % client_id, channel_id)

    # Create token
    auth_payload = {
        "uid": "unused",
        "channel_id": channel_id,
        "provider": "gae"
    }
    expiration = datetime.datetime.now() + \
                     datetime.timedelta(minutes=duration_minutes)
    client_token = create_token(auth_payload, {"expires": expiration})

    # Clean up channels after it expires
    duration_secs = int(duration_minutes * 60)
    deferred.defer(close_channel, channel_id, _countdown=duration_secs)
    return client_token

def send_message(client_id, message):
    # Retrieve channel id
    channel_id = fb_get("/clients/channel_ids/%s" % client_id)
    if channel_id is not None:
        fb_post("/channels/%s/messages" % channel_id, message)

def close_channel(channel_id):
    # Sets /channels/<channel_id>/_meta/status to "closed", and schedules a
    # deferred task to remove_channel.
    result = fb_put("/channels/" + channel_id + "/_meta/status",
                    "closed");
    deferred.defer(remove_channel, channel_id, _countdown=30)

def remove_channel(channel_id):
    # Deletes all the data associated with channel_id from Firebase.
    fb_delete("/channels/%s" % channel_id)
    fb_delete("/channel_client_status/%s" % channel_id)

    # Get client_id that matches channel_id from /clients/channel_ids/<client_id>/<channel_id>
    data = fb_get("/clients/channel_ids", {
      "orderBy": '"$value"',
      "equalTo": '"%s"' % channel_id
    })
    if len(data.keys()) == 0:
        # No client_id with that channel_id exists. Could be an old channel.
        return
    client_id = data.keys()[0]

    fb_delete("/clients/channel_ids/%s" % client_id)
