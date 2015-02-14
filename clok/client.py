#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from . import PY3

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
        if not 'headers' not in kwargs:
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
        super(HttpClient, self).__init__(url_prefix=host)

    def play(self, stream=None):
        if stream:
            return self.get('/play/%s' % stream)
        return self.get('/play/')

    def stop(self):
        return self.get('/stop/')

    def get_status(self):
        raise NotImplementedError

    def get_next_event(self):
        raise NotImplementedError

    def pause(self):
        raise NotImplementedError

    # ALARMS

    def list_alarms(self):
        raise NotImplementedError

    def add_alarm(self, data):
        raise NotImplementedError

    def remove_alarm(self, alarm_id):
        raise NotImplementedError

    def edit_alarm(self, alarm):
        raise NotImplementedError

    # RADIOS

    def list_radios(self):
        raise NotImplementedError

    def add_radio(self, data):
        raise NotImplementedError

    def remove_radio(self, radio_id):
        raise NotImplementedError

    def edit_radio(self, radio):
        raise NotImplementedError
