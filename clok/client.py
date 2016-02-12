#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from . import PY3

import json

if PY3:
    from urllib.parse import urljoin
else:
    from urlparse import urljoin

import requests


DEFAULT_HOST = "http://127.0.0.1:8000/api/"


class HttpClient(object):
    def __init__(self, url_prefix='', headers=None):
        self.url_prefix = url_prefix
        self.headers = headers or {}
        super(HttpClient, self).__init__()

    def req(self, method, url, *args, **kwargs):
        req_func = {
            'HEAD': requests.head,
            'GET': requests.get,
            'POST': requests.post,
            'PUT': requests.put,
            'DELETE': requests.delete,
        }[method]
        if not url.startswith('http'):
            url = urljoin(self.url_prefix, url)
        if 'verify' not in kwargs:
            kwargs['verify'] = False
        if 'stream' not in kwargs:
            kwargs['stream'] = False
        if 'headers' not in kwargs:
            kwargs['headers'] = dict(self.headers)
        return req_func(url, *args, **kwargs)

    def get(self, url, *args, **kwargs):
        return self.req('GET', url, *args, **kwargs)

    def head(self, url, *args, **kwargs):
        return self.req('HEAD', url, *args, **kwargs)

    def post(self, url, *args, **kwargs):
        return self.req('POST', url, *args, **kwargs)

    def put(self, url, *args, **kwargs):
        return self.req('PUT', url, *args, **kwargs)

    def delete(self, url, *args, **kwargs):
        return self.req('DELETE', url, *args, **kwargs)


class ClokClient(HttpClient):
    def __init__(self, host=DEFAULT_HOST):
        super(ClokClient, self).__init__(
            url_prefix=host,
            headers={'Connection': 'close'},
        )

    def play(self, stream=None, **kwargs):
        if stream:
            return self.get('play/%s' % stream, params=kwargs)
        return self.get('play/', params=kwargs)

    def stop(self): return self.get('stop/')

    def mute(self): return self.get('mute/')

    def go_backward(self): return self.get('go_backward/')

    def go_forward(self): return self.get('go_forward/')

    def previous_track(self): return self.get('previous_track/')

    def next_track(self): return self.get('next_track/')

    def volume_down(self): return self.get('volume_down/')

    def volume_up(self): return self.get('volume_up/')

    def pause(self): return self.get('togglepause/')

    def get_infos(self): return self.get('infos/')

    def get_next_event(self): return self.get('next_event/')

    def update(self): return self.get('update/')

    # ALARMS

    def list_alarms(self):
        return self.get('alarms/')

    def get_alarm(self, alarm_uuid):
        return self.get('alarms/%s' % alarm_uuid)

    def add_alarm(self, **kwargs):
        return self.post('alarms/', data={'__json_data': json.dumps(kwargs)})

    def remove_alarm(self, alarm_uuid):
        return self.delete('alarms/%s' % alarm_uuid)

    def edit_alarm(self, alarm_uuid, **kwargs):
        return self.put('alarms/%s' % alarm_uuid, data={'__json_data': json.dumps(kwargs)})

    # RADIOS

    def list_webradios(self):
        return self.get('webradios/')

    def get_webradio(self, radio_uuid):
        return self.get('webradios/%s' % radio_uuid)

    def add_webradio(self, **kwargs):
        return self.post('webradios/', data={'__json_data': json.dumps(kwargs)})

    def remove_webradio(self, radio_uuid):
        return self.delete('webradios/%s' % radio_uuid)

    def edit_webradio(self, radio_uuid, **kwargs):
        return self.put('webradios/%s' % radio_uuid, data={'__json_data': json.dumps(kwargs)})
