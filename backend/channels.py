import datetime

from backend.firebase import create_token, fb_post, fb_get

DEFAULT_DURATION_MINUTES = 120

def create_channel(client_id, duration_minutes=None):
    """Creates channel
    If called multiple times with same client_id, just returns a new token.
    """
    # TODO: Check what the Channel API does when called multiple times before
    # the token has expired. (Does it close the channel?)
    if duration_minutes is None:
        duration_minutes = DEFAULT_DURATION_MINUTES
    result = fb_post("/channels/", {
      "_meta": {
        "status": "open"
      }
    })
    if "error" in result:
        print "Error in creating channel: %s" % result["error"]
        return
    channel_id = result["name"]
    auth_payload = {
        "uid": "unused",
        "channel_id": channel_id,
        "provider": "gae"
    }
    expiration = datetime.datetime.now() + \
                     datetime.timedelta(minutes=duration_minutes)
    client_token = create_token(auth_payload, {"expires": expiration})

    # save_client_channel_id(client_id, channel_id)
    # duration_secs = int(duration_minutes * 60)
    # deferred.defer(remove_channel, channel_id, _countdown=duration_secs)
    return client_token
