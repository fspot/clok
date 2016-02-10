var container = document.getElementById('everything');
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
    if (options && options.shuffle) {
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
  this.isStopped = null;
  this.isPaused = null;
  this.isMuted = null;
  this.isPlaylist = null;

  this.view = null;

  this.fetchInfos = function() {
    return that.clokc.get_infos(function(xhr, resp) {
      var radio = _.find(that.webradios, {'url': resp.infos.url});
      that.whatsPlaying = (radio && radio.name) || resp.infos.url;
      that.isStopped = resp.infos.stopped;
      that.isPaused = resp.infos.paused;
      that.isMuted = resp.infos.muted;
      that.isPlaylist = resp.infos.muted;
    });
  };
  this.playWebradio = function(uuid) {
    var radio = _.find(this.webradios, {'uuid': uuid});
    return this.clokc.play(radio.url, null, that.fetchInfos);
  };
  this.playerHandler = function() {
    if (this.isPlaying) {
      return this.clokc.stop(function() {
        that.isPlaying = false;
      });
    } else {
      return this.clokc.play('', function() {
        that.isPlaying = true;
      });
    }
  };
  this.go_backward = function() { return this.clokc.go_backward(); };
  this.go_forward = function() { return this.clokc.go_forward(); };
  this.previous_track = function() { return this.clokc.previous_track(); };
  this.next_track = function() { return this.clokc.next_track(); };
  this.volume_down = function() { return this.clokc.volume_down(); };
  this.volume_up = function() { return this.clokc.volume_up(); };
  this.mute = function() { this.clokc.mute(that.fetchInfos); };
  this.pause = function() { return this.clokc.pause(); };

  // ALARMS

  this.fetchAlarms = function() {
    return that.clokc.list_alarms(function(xhr, resp) {
      that.alarms = resp.alarms;
    });
  };
  this.deleteAlarm = function(uuid) {
    return this.clokc.remove_alarm(uuid, function() {
      _.remove(that.alarms, {'uuid': uuid});
    });
  };
  this.addAlarm = function(data) {
    return this.clokc.add_alarm(data, function(xhr, resp) {
      that.alarms = that.alarms.concat([resp.alarm]);
    });
  };
  this.editAlarm = function(data) {
    return this.clokc.edit_alarm(data.uuid, data, function() {
      var alarm = _.find(that.alarms, {'uuid': data.uuid});
      _.merge(alarm, data);
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
      _.remove(that.webradios, {'uuid': uuid});
      _.remove(that.alarms, {'webradio': uuid});
    });
  };
  this.addWebradio = function(data) {
    return this.clokc.add_webradio(data, function() {
      that.webradios = that.webradios.concat([data]);
    });
  };
  this.editWebradio = function(data) {
    return this.clokc.edit_webradio(data.uuid, data, function() {
      var radio = _.find(that.webradios, {'uuid': data.uuid});
      _.merge(radio, data);
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
  props: ['radio'],
  methods: {
    radioClick: function() {
      state.playWebradio(this.radio.uuid);
    }
  }
});

Vue.component('menu', {
  template: '#menu-template',
  methods: {
    menuClick: function() {
      var layout   = document.getElementById('layout'),
          menu     = document.getElementById('menu'),
          menuLink = document.getElementById('menuLink');

      function toggleClass(element, className) {
          var classes = element.className.split(/\s+/),
              length = classes.length,
              i = 0;

          for(; i < length; i++) {
            if (classes[i] === className) {
              classes.splice(i, 1);
              break;
            }
          }
          // The className is not found
          if (length === classes.length) {
              classes.push(className);
          }

          element.className = classes.join(' ');
      }

      var active = 'active';
      toggleClass(layout, active);
      toggleClass(menu, active);
      toggleClass(menuLink, active);
    }
  }
});

Vue.component('webradio-view', {
  template: '#webradioview-template',
  props: ['state'],
});

Vue.component('alarm-view', {
  template: '#alarmview-template',
  props: ['state'],
});

var vm = new Vue({
  el: '#everything',
  data: state,
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

function alarmView() {
  state.view = 'alarmView';
};

function webradioView() {
  state.view = 'webradioView';
};

var routes = {
  '/webradios': webradioView,
  // '/webradios/new': webradioAddView,
  // '/webradios/edit/:uuid': webradioEditView,

  '/alarms': alarmView,
  // '/alarms/new': alarmAddView,
  // '/alarms/edit/:uuid': alarmEditView,

  '/*': webradioView
};

var router = Router(routes);
router.init();

// if (window.location.hash.indexOf('/alarms') > -1)
//   alarmView();
// else
//   webradioView();
