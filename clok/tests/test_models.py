#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from ..models import Alarm, setup_db


def test_alarm_humanize(mock, mocker):
    a = Alarm(
        days=[0, 1, 2, 3, 4],
        start=7*3600,
        duration=30*60,
        webradio=1,
        disabled=False,
    )

    webradio = mock.Mock()
    webradio.configure_mock(name="Lulz Radio")
    assert webradio.name == 'Lulz Radio'

    m_get_webradio = mocker.patch.object(a, 'get_webradio')
    m_get_webradio.return_value = webradio

    assert a.humanize() == '[Lulz Radio] : Lu-Ma-Me-Je-Ve (7:00 -> 7:30)'
    m_get_webradio.assert_called_with()


def test_alarm_save(test_db):
    setup_db(test_db)

    a = Alarm(days=[0, 2], start=7*3600, duration=30*60, webradio=1)
    a.save()

    assert a.eid == 1
    assert a.start == 7*3600
    assert a.disabled is False


def test_alarm_save2(test_db):
    setup_db(test_db)
    a = Alarm(days=[], start=0, webradio=1)
    a.save()
    assert a.eid == 1  # not affected by 'test_alarm_save'
