var DEFAULT_URL_PREFIX = "api/";

var AjaxService = function(url_prefix) {
  this.url_prefix = url_prefix || DEFAULT_URL_PREFIX;

  this.GET = function (url, onSuccess, onError) {
    return qwest.get(this.url_prefix + url).then(
      onSuccess || function() {}
    ).catch(
      onError || function() {}
    );
  };

  this.DELETE = function (url, onSuccess, onError) {
    return qwest.delete(this.url_prefix + url).then(
      onSuccess || function() {}
    ).catch(
      onError || function() {}
    );
  };

  this.POST = function (url, data, onSuccess, onError) {
    return qwest.post(this.url_prefix + url, data, {'dataType': 'json'}).then(
      onSuccess || function() {}
    ).catch(
      onError || function() {}
    );
  };

  this.PUT = function (url, data, onSuccess, onError) {
    return qwest.put(this.url_prefix + url, data, {'dataType': 'json'}).then(
      onSuccess || function() {}
    ).catch(
      onError || function() {}
    );
  };
};


var ClokClient = function() {
  this.ajax = new AjaxService();

  this.play = function(stream, options, onSuccess, onError) {
    stream = stream || '';
    options = options || {};
    if (options.shuffle) {
      stream += '?shuffle=y';
    }
    return this.ajax.GET('play/' + stream, onSuccess, onError);
  };

  this.stop = function(onSuccess, onError) {
    return this.ajax.GET('stop/', onSuccess, onError);
  };

  this.mute = function(onSuccess, onError) {
    return this.ajax.GET('mute/', onSuccess, onError);
  };

  this.go_backward = function(onSuccess, onError) {
    return this.ajax.GET('go_backward/', onSuccess, onError);
  };

  this.go_forward = function(onSuccess, onError) {
    return this.ajax.GET('go_forward/', onSuccess, onError);
  };

  this.previous_track = function(onSuccess, onError) {
    return this.ajax.GET('previous_track/', onSuccess, onError);
  };

  this.next_track = function(onSuccess, onError) {
    return this.ajax.GET('next_track/', onSuccess, onError);
  };

  this.volume_down = function(onSuccess, onError) {
    return this.ajax.GET('volume_down/', onSuccess, onError);
  };

  this.volume_up = function(onSuccess, onError) {
    return this.ajax.GET('volume_up/', onSuccess, onError);
  };

  this.pause = function(onSuccess, onError) {
    return this.ajax.GET('togglepause/', onSuccess, onError);
  };

  this.get_infos = function(onSuccess, onError) {
    return this.ajax.GET('infos/', onSuccess, onError);
  };

  this.get_next_event = function(onSuccess, onError) {
    return this.ajax.GET('next_event/', onSuccess, onError);
  };

  this.update = function(onSuccess, onError) {
    return this.ajax.GET('update/', onSuccess, onError);
  };

  // ALARMS

  this.list_alarms = function(onSuccess, onError) {
    return this.ajax.GET('alarms/', onSuccess, onError);
  };

  this.get_alarm = function(alarm_uuid, onSuccess, onError) {
    return this.ajax.GET('alarms/' + alarm_uuid, onSuccess, onError);
  };

  this.add_alarm = function(data, onSuccess, onError) {
    return this.ajax.POST('alarms/', data, onSuccess, onError);
  };

  this.remove_alarm = function(alarm_uuid, onSuccess, onError) {
    return this.ajax.DELETE('alarms/' + alarm_uuid, onSuccess, onError);
  };

  this.edit_alarm = function(alarm_uuid, data, onSuccess, onError) {
    return this.ajax.PUT('alarms/' + alarm_uuid, data, onSuccess, onError);
  };

  // WEBRADIOS

  this.list_webradios = function(onSuccess, onError) {
    return this.ajax.GET('webradios/', onSuccess, onError);
  };

  this.get_webradio = function(radio_uuid, onSuccess, onError) {
    return this.ajax.GET('webradios/' + radio_uuid, onSuccess, onError);
  };

  this.add_webradio = function(data, onSuccess, onError) {
    return this.ajax.POST('webradios/', data, onSuccess, onError);
  };

  this.remove_webradio = function(radio_uuid, onSuccess, onError) {
    return this.ajax.DELETE('webradios/' + radio_uuid, onSuccess, onError);
  };

  this.edit_webradio = function(radio_uuid, data, onSuccess, onError) {
    return this.ajax.PUT('webradios/' + radio_uuid, data, onSuccess, onError);
  };
};


var State = function () {
  var that = this;
  this.clokc = new ClokClient();

  this.webradios = [];
  this.alarms = [];

  this.whatsPlaying = null;
  this.whatsPlayingURL = null;
  this.isStopped = null;
  this.isPaused = null;
  this.isMuted = null;
  this.isPlaylist = null;

  this.view = null;
  this.viewData = null;

  this.fetchInfos = function() {
    return that.clokc.get_infos(function(xhr, resp) {
      var radio = _.find(that.webradios, {'url': resp.infos.url});
      that.whatsPlaying = (radio && radio.name) || resp.infos.url;
      that.whatsPlayingURL = resp.infos.url;
      that.isStopped = resp.infos.stopped;
      that.isPaused = resp.infos.paused;
      that.isMuted = resp.infos.muted;
      that.isPlaylist = resp.infos.playlist;
    });
  };
  this.playWebradio = function(uuid, shuffle) {
    var radio = _.find(this.webradios, {'uuid': uuid});
    var options = shuffle ? {'shuffle': 'y'} : null;
    return this.clokc.play(radio.url, options, that.fetchInfos);
  };
  this.shuffle = function() {
    var radio = _.find(this.webradios, {'url': this.whatsPlayingURL});
    this.playWebradio(radio.uuid, true);
  };
  this.stop = function() {
    return this.clokc.stop(function() {
      that.isStopped = true;
      that.fetchInfos();
    });
  };

  this.go_backward = function() { return this.clokc.go_backward(that.fetchInfos); };
  this.go_forward = function() { return this.clokc.go_forward(that.fetchInfos); };
  this.previous_track = function() { return this.clokc.previous_track(that.fetchInfos); };
  this.next_track = function() { return this.clokc.next_track(that.fetchInfos); };
  this.volume_down = function() { return this.clokc.volume_down(that.fetchInfos); };
  this.volume_up = function() { return this.clokc.volume_up(that.fetchInfos); };
  this.mute = function() { this.clokc.mute(that.fetchInfos); };
  this.pause = function() { return this.clokc.pause(that.fetchInfos); };

  // ALARMS

  this.fetchAlarms = function() {
    return that.clokc.list_alarms(function(xhr, resp) {
      that.alarms = resp.alarms;
    });
  };
  this.deleteAlarm = function(uuid) {
    return this.clokc.remove_alarm(uuid, function() {
      that.fetchAlarms();
    });
  };
  this.addAlarm = function(data) {
    return this.clokc.add_alarm(data, function(xhr, resp) {
      that.fetchAlarms();
    });
  };
  this.editAlarm = function(data) {
    return this.clokc.edit_alarm(data.uuid, data, function() {
      that.fetchAlarms();
    });
  };

  // WEBRADIOS

  this.fetchWebradios = function() {
    return that.clokc.list_webradios(function(xhr, resp) {
      that.webradios = resp.webradios;
    });
  };
  this.deleteWebradio = function(uuid) {
    return this.clokc.remove_webradio(uuid, function() {
      that.fetchWebradios();
    });
  };
  this.addWebradio = function(data) {
    return this.clokc.add_webradio(data, function() {
      that.fetchWebradios();
    });
  };
  this.editWebradio = function(data) {
    return this.clokc.edit_webradio(data.uuid, data, function() {
      that.fetchWebradios();
    });
  };
};

var state = new State();

// VUEJS

Vue.component('webradio-player', {
  template: '#webradioplayer-template',
  props: ['state'],
});

Vue.component('radio-item', {
  template: '#radioitem-template',
  props: ['radio', 'state', 'selected'],
  methods: {
    radioClick: function() {
      if (this.selected)
        this.state.stop();
      else
        this.state.playWebradio(this.radio.uuid);
    },
    deleteRadioClick: function() {
      if (confirm(this.$t('confirm.deleteRadio'))) {
        if (this.selected) {
          this.state.stop();
        }
        this.state.deleteWebradio(this.radio.uuid);
      }
    }
  }
});

Vue.component('menu', {
  template: '#menu-template',
  props: ['nbAlarms'],
  methods: {
    menuClick: function() {
      function toggleClass(element, className) {
          var classes = element.className.split(/\s+/);
          var found = classes.indexOf(className);
          if (found !== -1) {
            classes.splice(found, 1);
          } else {
            classes.push(className);
          }
          element.className = classes.join(' ');
      }

      toggleClass(document.getElementById('layout'), 'active');
      toggleClass(document.getElementById('menu'), 'active');
      toggleClass(document.getElementById('menuLink'), 'active');
    }
  }
});

Vue.component('webradio-view', {
  template: '#webradioview-template',
  props: ['state'],
});

Vue.component('webradio-edit-view', {
  template: '#webradioeditview-template',
  props: ['state', 'isEdit'],
  data: function() {
    if (!this.isEdit)
      return {'radio': {'name': '', 'url': ''}};
    var radio = _.find(this.state.webradios, {'uuid': this.state.viewData.uuid});
    if (!radio) {
      var tmp = window.location.hash;
      window.location.hash = '#/webradios';
      window.location.hash = tmp;
    }
    return {'radio': radio};
  },
  methods: {
    submit: function() {
      this.radio.name = this.radio.name.trim();
      this.radio.url = this.radio.url.trim();
      if (!this.radio.name || !this.radio.url) {
        return;
      }
      if (this.isEdit) {
        this.state.editWebradio(this.radio);
      } else {
        this.state.addWebradio(this.radio);
      }
      window.location.hash = '#/webradios';
    },
    cancel: function() {
      this.state.fetchWebradios();
      window.location.hash = '#/webradios';
    }
  }
});

Vue.component('alarm-item', {
  template: '#alarmitem-template',
  props: ['alarm', 'state'],
  computed: {
    radio: function() {
      var radio = _.find(this.state.webradios, {'uuid': this.alarm.webradio});
      return radio;
    },
    daysFormat: function() {
      var stringDays = [
        this.$t('day.monday'), this.$t('day.tuesday'), this.$t('day.wednesday'),
        this.$t('day.thursday'), this.$t('day.friday'),
        this.$t('day.saturday'), this.$t('day.sunday')
      ];
      var days = this.alarm.days.map(function(day) {
        return stringDays[day];
      });
      return days.join(', ')
    },
    limitsFormat: function() {
      var begin = this.alarm.start;
      var end = begin + this.alarm.duration;
      var beginHour   = "" + Math.floor(begin / 3600),
          beginMinute = "" + Math.floor(begin % 3600 / 60),
          endHour     = "" + Math.floor(end / 3600) % 24,
          endMinute   = "" + Math.floor(end % 3600 / 60);
      beginMinute = (beginMinute === '0') ? '00' : beginMinute;
      endMinute = (endMinute === '0') ? '00' : endMinute;
      var begin = "" + beginHour + ":" + beginMinute,
          end = "" + endHour + ":" + endMinute;
      return begin + ' − ' + end;
    }
  },
  methods: {
    deleteAlarmClick: function() {
      if (confirm(this.$t('confirm.deleteAlarm'))) {
        this.state.deleteAlarm(this.alarm.uuid);
      }
    }
  }
});

Vue.component('alarm-view', {
  template: '#alarmview-template',
  props: ['state'],
});

Vue.component('alarm-edit-view', {
  template: '#alarmeditview-template',
  props: ['state', 'isEdit'],
  data: function() {
    if (!this.isEdit)
      return {'alarm': {
        'start': 7 * 3600 + 30 * 60,
        'duration': 30 * 60,
        'days': [],
        'webradio': null,
        'disabled': false,
        'shuffle': false,
      }};
    var alarm = _.find(this.state.alarms, {'uuid': this.state.viewData.uuid});
    if (!alarm) {
      var tmp = window.location.hash;
      window.location.hash = '#/alarms';
      window.location.hash = tmp;
    }
    return {'alarm': alarm};
  },
  computed: {
    starthour: {
      get: function () {
        return Math.floor(this.alarm.start / 3600);
      },
      set: function (newValue) {
        this.alarm.start = newValue * 3600 + this.startminute * 60;
      }
    },
    startminute: {
      get: function() {
        return Math.floor(this.alarm.start % 3600 / 60);
      },
      set: function(newValue) {
        this.alarm.start = this.starthour * 3600 + newValue * 60;
      }
    },
    duration: {
      get: function() {
        return Math.floor(this.alarm.duration / 60);
      },
      set: function(newValue) {
        this.alarm.duration = newValue * 60;
      }
    }
  },
  methods: {
    submit: function() {
      if (!this.alarm.webradio || !this.alarm.days || this.alarm.days.length == 0) {
        return;
      }
      if (this.isEdit) {
        this.state.editAlarm(this.alarm);
      } else {
        this.state.addAlarm(this.alarm);
      }
      window.location.hash = '#/alarms';
    },
    cancel: function() {
      this.state.fetchAlarms();
      window.location.hash = '#/alarms';
    }
  }
});

var vm = new Vue({
  el: '#everything',
  data: state,
  computed: {
    nbAlarmsEnabled: function() {
      var alarmsEnabled = _.filter(this.alarms, {'disabled': false});
      return alarmsEnabled.length;
    }
  },
  created: function() {
    state.fetchWebradios();
    state.fetchAlarms();
    state.fetchInfos();
    state.webradiosInterval = setInterval(state.fetchWebradios, 10000);
    state.alarmsInterval = setInterval(state.fetchAlarms, 10000);
    state.infosInterval = setInterval(state.fetchInfos, 5000);
  },
  destroyed: function() {
    clearInterval(state.webradiosInterval);
    clearInterval(state.alarmsInterval);
    clearInterval(state.infosInterval);
  }
});


// <ROUTES>

function webradioView() { state.view = 'webradioView'; };
function webradioEditView(uuid) { state.view = 'webradioEditView'; state.viewData = {'uuid': uuid}; };
function webradioCreateView() { state.view = 'webradioCreateView'; };
function alarmView() { state.view = 'alarmView'; };
function alarmEditView(uuid) { state.view = 'alarmEditView'; state.viewData = {'uuid': uuid}; };
function alarmCreateView() { state.view = 'alarmCreateView'; };

var routes = {
  '/webradios': webradioView,
  '/webradios/new': webradioCreateView,
  '/webradios/edit/:uuid': webradioEditView,

  '/alarms': alarmView,
  '/alarms/new': alarmCreateView,
  '/alarms/edit/:uuid': alarmEditView,

  '/*': webradioView
};

var router = Router(routes);
router.init();

if (window.location.hash.indexOf('/alarms') === -1 &&
    window.location.hash.indexOf('/webradios') === -1) {
  window.location.hash = '#/webradios';
}
