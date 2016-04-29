import json
import urllib

from google.appengine.api import urlfetch

import firebase_token_generator as fb_token_generator

secrets = {}
with open('./secrets.json') as secrets_data:
    secrets = json.load(secrets_data)

auth_payload = {"uid": "gae-instance", "provider": "gae"}
gae_auth_token = fb_token_generator.create_token(
    secrets["firebaseSecret"], auth_payload)
print secrets["firebaseSecret"], gae_auth_token

FIREBASE_URL = "https://fb-channel.firebaseio.com"

def create_token(auth_payload, options=None):
  return fb_token_generator.create_token(
    secrets["firebaseSecret"], auth_payload, options)

def fb_get(path, params=None):
    _params = {"auth": gae_auth_token}
    if params is not None:
        _params.update(params)

    url = FIREBASE_URL + path + ".json"
    _params = urllib.urlencode(_params)
    print url + "?" + _params
    response = urlfetch.fetch(url + "?" + _params, method=urlfetch.GET)
    if response.content != "null":
        return json.loads(response.content)
    else:
        return None

def fb_post(path, value):
  url = FIREBASE_URL + path + ".json"
  params = urllib.urlencode({"auth": gae_auth_token})
  response = urlfetch.fetch(url + "?" + params,
                            payload=json.dumps(value),
                            method=urlfetch.POST)
  print response.content
  print url + "?" + params
  if response.content != "null":
    return json.loads(response.content)
  else:
    return None
