#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from multiprocessing import Process
from time import sleep, time

import requests

from .models import Alarm


def alarm_process(timer, url):
    """ Sleeps <timer> seconds, then hits <url>. """
    sleep(timer)
    print ">>>>>>>>>>>>>>", url
    # requests.get(url)


class CronService(object):
    def __init__(self, db):
        self._alarm = None  # alarm_process
        self.update()

    def setup_alarm(self):
        """ Find the next alarm in db, launch its process. """
        alarms = sorted(Alarm.all(), key=lambda e: e.start)
        first = (a for a in alarms if a.start > time()).next()
        self._alarm = Process(
            target=alarm_process,
            args=[first.start - time(), first.message]
        )
        self._alarm.daemon = True
        self._alarm.start()
        self.next_alarm_time = first.start
        print ">>> ALARM programmed in", first.start - time()

    def cancel_alarm(self):
        if self._alarm is not None:
            self._alarm.terminate()

    def update(self):
        """ Force CronService to update its config (reread database). """
        self.cancel_alarm()
        self.setup_alarm()

    def remaining_time(self):
        if self._alarm is not None:
            return self.next_alarm_time - time()
