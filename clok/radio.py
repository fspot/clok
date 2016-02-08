#!/usr/bin/env python
# -*- coding:utf-8 -*-

from __future__ import unicode_literals, absolute_import

from multiprocessing import Process, Queue

from pyradio.log import Log
from pyradio.player import MpPlayer

from . import PY3
input = input if PY3 else raw_input


class CustomMpPlayer(MpPlayer):
    def __init__(self, *args, **kwargs):
        self.should_i_shuffle = False
        super(CustomMpPlayer, self).__init__(*args, **kwargs)

    def play(self, *args, **kwargs):
        if 'shuffle' in kwargs:
            self.should_i_shuffle = kwargs.pop('shuffle') or False
        try:
            super(CustomMpPlayer, self).play(*args, **kwargs)
        except:
            raise
        finally:
            self.should_i_shuffle = False  # reset this flag afterwards

    def _buildStartOpts(self, *args, **kwargs):
        # opts is like [PLAYER_CMD, "arg1", "arg2", ..., "argN", streamUrl]
        opts = super(CustomMpPlayer, self)._buildStartOpts(*args, **kwargs)
        opts.insert(1, '-loop')
        opts.insert(2, '0')
        if self.should_i_shuffle is True:
            opts.append('-shuffle')
        return opts

    def go_backward(self): self._sendCommand("\x1B[D")  # "\x1B[D" = left arrow (<-)

    def go_forward(self): self._sendCommand("\x1B[C")  # "\x1B[C" = right arrow (->)

    def previous_track(self): self._sendCommand("<")

    def next_track(self): self._sendCommand(">")


class RadioWrapped(object):

    def __init__(self, url=None):
        self.url = url
        self._log = Log()
        self._player = CustomMpPlayer(self._log)

    def play(self, url=None, shuffle=False):
        self.url = url or self.url
        if self.url is not None:
            self._player.play(self.url, shuffle=shuffle)

    def stop(self):
        if self.is_playing():
            self._player.close()

    def mute(self): self._player.mute()

    def previous_track(self): self._player.previous_track()

    def next_track(self): self._player.next_track()

    def volume_up(self): self._player.volumeUp()

    def volume_down(self): self._player.volumeDown()

    def go_backward(self): self._player.go_backward()

    def go_forward(self): self._player.go_forward()

    def is_playing(self): return self._player.isPlaying()

    def toggle_pause(self): self._player.pause()

    def pause(self):
        if self.is_playing():
            self._player.pause()

    def unpause(self):
        if not self.is_playing():
            self._player.pause()

    def get_url(self):
        return self.url


class Radio(object):

    @staticmethod
    def radio_process():
        def _radio_process(cmd_queue, answer_queue):
            radio = RadioWrapped()
            while True:
                try:
                    msg = cmd_queue.get()
                except KeyboardInterrupt:
                    return
                if msg['type'] == 'play':
                    url, shuffle = msg.get('url'), msg.get('shuffle', False)
                    radio.play(url, shuffle=shuffle)
                elif msg['type'] == 'stop':
                    radio.stop()
                elif msg['type'] == 'pause':
                    radio.pause()
                elif msg['type'] == 'unpause':
                    radio.unpause()
                elif msg['type'] == 'toggle_pause':
                    radio.toggle_pause()
                elif msg['type'] == 'volume_up':
                    radio.volume_up()
                elif msg['type'] == 'volume_down':
                    radio.volume_down()
                elif msg['type'] == 'go_backward':
                    radio.go_backward()
                elif msg['type'] == 'go_forward':
                    radio.go_forward()
                elif msg['type'] == 'mute':
                    radio.mute()
                elif msg['type'] == 'previous_track':
                    radio.previous_track()
                elif msg['type'] == 'next_track':
                    radio.next_track()
                elif msg['type'] == 'is_playing':
                    answer_queue.put(radio.is_playing())
                elif msg['type'] == 'get_url':
                    answer_queue.put(radio.get_url())
                elif msg['type'] == 'EXIT':
                    return
        cmd_queue, answer_queue = Queue(), Queue()
        process = Process(target=_radio_process, args=[cmd_queue, answer_queue])
        process.daemon = True
        process.start()
        return process, cmd_queue, answer_queue

    def __init__(self):
        self.process, self.cmd_queue, self.answer_queue = Radio.radio_process()

    def play(self, url=None, shuffle=False):
        self.cmd_queue.put({
            'type': 'play',
            'url': url,
            'shuffle': shuffle,
        })

    def stop(self): self.cmd_queue.put({'type': 'stop'})

    def pause(self): self.cmd_queue.put({'type': 'pause'})

    def unpause(self): self.cmd_queue.put({'type': 'unpause'})

    def toggle_pause(self): self.cmd_queue.put({'type': 'toggle_pause'})

    def volume_up(self): self.cmd_queue.put({'type': 'volume_up'})

    def volume_down(self): self.cmd_queue.put({'type': 'volume_down'})

    def go_backward(self): self.cmd_queue.put({'type': 'go_backward'})

    def go_forward(self): self.cmd_queue.put({'type': 'go_forward'})

    def mute(self): self.cmd_queue.put({'type': 'mute'})

    def previous_track(self): self.cmd_queue.put({'type': 'previous_track'})

    def next_track(self): self.cmd_queue.put({'type': 'next_track'})

    def get_is_playing(self):
        self.cmd_queue.put({'type': 'is_playing'})
        return self.answer_queue.get()

    @property
    def is_playing(self): return self.get_is_playing()

    def get_url(self):
        self.cmd_queue.put({'type': 'get_url'})
        return self.answer_queue.get()

    @property
    def url(self): return self.get_url()

    def kill(self):
        self.cmd_queue.put({'type': 'EXIT'})
        self.process.join()
