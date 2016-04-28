# gae-firebase-channels
Example project that illustrates how to emulate App Engine Channels with Firebase.

Requires deferred enabled. (Inside of app.yaml)
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
