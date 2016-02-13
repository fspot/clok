Clok
====

[![https://badge.fury.io/py/clok](https://badge.fury.io/py/clok.png)](https://badge.fury.io/py/clok)
[![Build Status](https://travis-ci.org/fspot/clok.svg)](https://travis-ci.org/fspot/clok)
[![Coverage Status](https://coveralls.io/repos/fspot/clok/badge.png)](https://coveralls.io/r/fspot/clok)
[![License](https://pypip.in/license/clok/badge.svg)](https://pypi.python.org/pypi/clok/)

Listen to radio and set up alarms from your computer, and control it from a web UI. Relies on `mplayer`.

![Screenshot](https://framapic.org/FASezG3yXdaR/1n2hthSsAA9e.png)

#### Features :

- easy to install (pure python dependencies: just `pip install clok`)
- easy to use (just type `clok`)
- list / add / remove / edit radios and alarms
- can play online streams (webradios), but also local tracks or playlists
- player controls: play / pause / volume up / volume down / mute / go backward / go forward
- extra player controls for playlists : previous track / next track / shuffle
- alarms settings allow to chose trigger time, duration, days of week
- can be controlled via web ui or via REST API (python client inside)
- web ui translated in french and english (according to system language)

Installation
------------

```
$ sudo apt-get install mplayer
$ sudo pip install clok
```


Usage
-----

```
Clok

Usage:
  clok [-a ADDRESS -p PORT --database FILE --log LOG]
  clok -h | --help
  clok -v | --version

Options:
  -h --help             Show this screen.
  -v --version          Show version.
  -d --database FILE    Specify the database filename (JSON storage).
                        [default: ./db.json]
  -a --address ADDRESS  Specify on which address to listen.
                        [default: 0.0.0.0]
  -p --port PORT        Specify on which port to listen.
                        [default: 8000]
  --log LOG             Specify where to log messages, and which level to set.
                        Can be "stderr", "syslog", or a filename, followed by the level.
                        [default: stderr:INFO]
  ```

Example
-------

```
$ clok -d /home/fred/clokdb.json -p 8080
```

This command will run `clok` on port 8080 and store radios and alarms settings in JSON file `/home/fred/clokdb.json`.


Launch at startup
-----------------

Clok is easy to launch at startup. For example with `supervisord` :

```
[program:clok]
command=/usr/local/bin/clok -d /home/fred/clokdb.json
user=fred
directory=/home/fred
stopsignal=INT
```


Python client
-------------

```python
>>> from clok.client import ClokClient
>>> cc = ClokClient()
>>> cc.list_alarms().json()
{u'alarms': [{u'shuffle': False, u'uuid': u'52f5f8e0-7d09-4d40-b0bd-0acab3220383', u'days': [0, 1, 2, 3, 4], u'disabled': False, u'start': 27000, u'webradio': u'7baec513-0fe8-48f0-9411-69f8b40bc580', u'duration': 1800}], u'status': u'success'}
>>> cc.pause().json()
{u'status': u'success'}
```
