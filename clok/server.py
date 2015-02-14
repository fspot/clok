#!/usr/bin/env python
# -*- coding:utf-8 -*-

"""Clok

Usage:
  clok [-a ADDRESS -p PORT --database FILE --debug]
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
  --debug               Debug mode, do not use.

"""

from __future__ import unicode_literals, absolute_import

from os.path import dirname, abspath, join
from functools import wraps

from bottle import Bottle, view, request, redirect, TEMPLATE_PATH
from docopt import docopt
from tinydb import TinyDB, where

from . import __version__ as VERSION
from .radio import Radio
from .cron import CronService
from .log import Logger
from .models import (
    setup_db, Alarm, NoAlarms, AlarmEvent, Webradio, AttributeRequired
)

app = Bottle()


# ~~~ UTILS ~~~

def update_cron_after(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        ret = func(*args, **kwargs)
        app.cron.update()
        return ret
    return wrapper


# ~~~ VIEWS ~~~

@app.route('/')
@view('index')
def index():
    return {'url': app.radio.url, 'playing': app.radio.is_playing}


@app.get('/play/')
@app.get('/play/<url:path>')
@view('play')
def play_get(url=None):
    app.radio.play(url)
    return {'url': app.radio.url}


@app.post('/play/')
@view('play')
def play_post():
    app.radio.play(request.forms.get('url'))
    return {'url': app.radio.url}


@app.route('/stop/')
def stop():
    app.radio.stop()
    redirect("/")


# ~~~ API ~~~

def APIResponse(status, **kwargs):
    dico = kwargs
    dico["status"] = status
    return dico


@app.get('/api/play/')
@app.get('/api/play/<url:path>')
def api_play(url=None):
    app.radio.play(url)
    return APIResponse('success')


@app.get('/api/stop/')
def api_stop():
    app.radio.stop()
    return APIResponse('success')


@app.get('/api/togglepause/')
def api_togglepause():
    app.radio.togglepause()
    return APIResponse('success')


@app.get('/api/infos/')
def api_infos():
    infos = {
        'url': app.radio.url,
        'playing': app.radio.is_playing,
    }
    return APIResponse('success', infos=infos)


@app.get('/api/update/')
@update_cron_after
def api_update():
    return APIResponse('success')


# Webradios

@app.get('/api/webradios/')
def api_list_webradios():
    return APIResponse('success', webradios=Webradio.all(to_dict=True))


@app.get('/api/webradios/<uuid>')
def api_get_webradio(uuid):
    found = Webradio.get(uuid=uuid)
    if found is None:
        return APIResponse('notfound')
    return APIResponse('success', webradio=found.to_dict())


@app.post('/api/webradios/')
def api_add_webradio():
    try:
        r = Webradio(**request.json).save()
    except AttributeRequired:
        return APIResponse('attributerequired', details=Webradio.required_fields())
    return APIResponse('success', webradio=r.to_dict())


@app.delete('/api/webradios/<uuid>')
@update_cron_after
def api_remove_webradio(uuid):
    Webradio.remove(where('uuid') == uuid)
    Alarm.remove(where('webradio') == uuid)
    return APIResponse('success')


@app.put('/api/webradios/<uuid>')
@update_cron_after
def api_edit_webradio(uuid):
    in_db = Webradio.get(uuid=uuid)
    if in_db is None:
        return APIResponse('notfound')

    for k, v in request.json.items():
        setattr(in_db, k, v)
    in_db.save()
    return APIResponse('success', webradio=in_db.to_dict())


# Alarms

@app.get('/api/alarms/')
def api_list_alarms():
    return APIResponse('success', alarms=Alarm.all(to_dict=True))


@app.get('/api/alarms/<uuid>')
def api_get_alarm(uuid):
    found = Alarm.get(uuid=uuid)
    if found is None:
        return APIResponse('notfound')
    return APIResponse('success', alarm=found.to_dict())


@app.post('/api/alarms/')
@update_cron_after
def api_add_alarm():
    try:
        r = Alarm(**request.json).save()
    except AttributeRequired:
        return APIResponse('attributerequired', details=Alarm.required_fields())
    return APIResponse('success', alarm=r.to_dict())


@app.delete('/api/alarms/<uuid>')
@update_cron_after
def api_remove_alarm(uuid):
    Alarm.remove(where('uuid') == uuid)
    return APIResponse('success')


@app.put('/api/alarms/<uuid>')
@update_cron_after
def api_edit_alarm(uuid):
    in_db = Alarm.get(uuid=uuid)
    if in_db is None:
        return APIResponse('notfound')

    for k, v in request.json.items():
        setattr(in_db, k, v)
    in_db.save()
    return APIResponse('success', alarm=in_db.to_dict())


@app.get('/api/next_event/')
def api_next_event():
    try:
        event = Alarm.next_event_overall()
    except NoAlarms:
        return APIResponse('success')
    event = {
        'time': event.time.isoformat(),
        'alarm': event.alarm.to_dict(),
        'type': event.type,
    }
    return APIResponse('success', event=event)


# ~~~ MAIN ~~~

def main():
    args = docopt(__doc__, version='clok ' + VERSION)

    HOST = args['--address']
    PORT = int(args['--port'])
    DBFILE = args['--database']
    DEBUG = args['--debug'] or False
    TEMPLATE_PATH.append(join(abspath(dirname(__file__)), 'views'))

    app.logger = Logger('clok')
    app.logger.setup()  # TODO : setup according to args['--log']
    app.radio = Radio()
    db = TinyDB(DBFILE)
    setup_db(db)  # setup database for this process (main process)
    app.cron = CronService()
    app.cron.update()
    try:
        app.run(host=HOST, port=PORT, debug=DEBUG, server='waitress')
    except KeyboardInterrupt:
        app.radio.kill()


if __name__ == '__main__':
    main()
