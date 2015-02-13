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

from bottle import Bottle, view, request, redirect, TEMPLATE_PATH
from docopt import docopt
from tinydb import TinyDB

from . import __version__ as VERSION
from .radio import Radio
from .cron import CronService
from .log import Logger
from .models import setup_db

app = Bottle()


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

@app.get('/api/play/')
@app.get('/api/play/<url:path>')
def api_play(url=None):
    app.radio.play(url)
    return {'status': 'success'}


@app.get('/api/stop/')
def api_stop():
    app.radio.stop()
    return {'status': 'success'}


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
    app.cron = CronService(db)
    app.cron.update()
    try:
        app.run(host=HOST, port=PORT, debug=DEBUG)
    except KeyboardInterrupt:
        app.radio.kill()


if __name__ == '__main__':
    main()
