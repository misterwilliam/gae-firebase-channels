# gae-firebase-channels
Example project that illustrates how to emulate App Engine Channels with Firebase.
The project has three parts: (1) the frontend javascript that replaces the code
that runs in the browser (2) the backend code that replaces the backend Channels
API, and (3) Firebase security rules.

## Overview
*backend/channels.py*
Emulates the Channels server side API using Firebase.

*frontend/channels.js*
Emulates the Channels frontend API using Firebase.

*firebase/security-rules.json*
Security rules for the Firebase project.

## Configuration
Store your Firebase secret in secrets.json:
```
{
  "firebaseSecret": "<Your Firebase secret>"
}
```

Copy security rules in firebase/security-rules.json to "Security & rules" tab in
your Firebase project.

Requires deferred enabled. (Inside of backend/app.yaml)
```
builtins:
- deferred: on
```
Requires firebase-token-generator
```
pip install -t lib firebase-token-generator
```
If you are using a version of Python installed by Homebrew you will also have to
temporarily create a file ~/.pydistutils.cfg with following contents. (For more
details see)[https://github.com/Homebrew/brew/blob/master/share/doc/homebrew/Homebrew-and-Python.md#note-on-pip-install---user]
```
[install]
prefix=
```

You will also have to add lib to appengine_cfg.py
```
from google.appengine.ext import vendor

# Add any libraries installed in the "lib" folder.
vendor.add('lib')
```
