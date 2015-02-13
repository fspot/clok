#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from tinydb import where

from uuid import uuid4


class Base(object):
    db = None  # must be overwritten
    tablename = None  # must be overwritten
    fields = None  # must be overwritten

    @classmethod
    def get_table(cls):
        return cls.db.table(cls.tablename)

    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

    @classmethod
    def from_dict(cls, obj, instance=None):
        instance = instance or cls()
        for k, v in obj.items():
            setattr(instance, k, v)
        setattr(instance, 'eid', obj.eid)
        return instance

    def save(self):
        fields = self.fields
        if not hasattr(self, 'eid'):
            doc = {f: getattr(self, f) for f in fields if getattr(self, f) is not None}
            doc['uuid'] = str(uuid4())
            self.eid = self.get_table().insert(doc)
            self.uuid = doc['uuid']
        else:
            old = self.get_table().get(eid=self.eid)
            dirty_fields = {
                f: getattr(self, f)
                for f in fields
                if getattr(self, f) != old.get(f)
            }
            self.get_table().update(dirty_fields, where("uuid") == self.uuid)
        return self

    def refresh(self):
        old = self.get_table().get(eid=self.eid)
        return self.from_dict(old, self)

    @classmethod
    def get(cls, eid=None, uuid=None):
        if uuid is None:
            return cls.from_dict(cls.get_table().get(eid=eid))
        found = cls.filter(where('uuid') == uuid)
        if found != []:
            return cls.from_dict(found[0])

    @classmethod
    def all(cls):
        return [cls.from_dict(o) for o in cls.get_table().all()]

    @classmethod
    def filter(cls, query):
        return [cls.from_dict(o) for o in cls.get_table().search(query)]

    @classmethod
    def remove(cls, query):
        cls.get_table().remove(query)

    @classmethod
    def update(cls, affectations, query):
        cls.get_table().update(affectations, query)


class Webradio(Base):
    tablename = 'webradio'
    fields = ['name', 'url']

    def __init__(self, **kwargs):
        super(Webradio, self).__init__(**kwargs)

    def __repr__(self):
        return '<Webradio name:%s url:%s>' % (self.name, self.url)


class Alarm(Base):
    tablename = 'alarm'
    fields = ['start', 'message']

    def __init__(self, **kwargs):
        super(Alarm, self).__init__(**kwargs)

    def __repr__(self):
        return '<Alarm start:%f>' % self.start


def setup_db(db):
    Base.db = db
