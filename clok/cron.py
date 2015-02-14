#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from datetime import datetime
from multiprocessing import Process
from time import sleep

from .client import ClokClient
from .log import Logger
from .models import Alarm, AlarmEvent, NoAlarms


def event_process(event):
    """ Sleeps some time, then hits a url. """
    logger = Logger('cron')
    logger.setup()
    sleeptime = (event.time - datetime.now()).total_seconds()
    logger.info('will sleep for %d seconds', sleeptime)
    sleep(sleeptime)
    logger.info('will hit a url ! [%s]', "START" if AlarmEvent.START else "STOP")
    clokc = ClokClient()
    if event.type == AlarmEvent.START:
        clokc.play(event.alarm.url)
    elif event.type == AlarmEvent.STOP:
        clokc.stop()
    else:
        raise NotImplementedError


class CronService(object):
    def __init__(self):
        self._process = None  # event_process
        self.logger = Logger('clok')

    def setup_alarm(self):
        """ Find the next alarm in db, launch its process. """
        try:
            self.next_event = Alarm.next_event_overall()
        except NoAlarms:
            self.logger.warn("no alarms !")
        else:
            self._process = Process(target=event_process, args=[self.next_event])
            self._process.daemon = True
            self._process.start()

    def cancel_alarm(self):
        if self._process is not None:
            self._process.terminate()
            self._process = None

    def update(self):
        """ Force CronService to update its config (reread database). """
        self.logger.info('update CronService')
        self.cancel_alarm()
        self.setup_alarm()

    def remaining_time(self):
        if self._process is not None:
            return self.next_event.time - datetime.now()
