#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from .base import Base


class Webradio(Base):
    tablename = 'webradio'
    fields = ['name', 'url']

    def __init__(self, **kwargs):
        super(Webradio, self).__init__(**kwargs)

    def __repr__(self):
        return '<Webradio name:%s url:%s>' % (self.name, self.url)
