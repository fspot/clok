var container = document.getElementById('everything');

function ajaxget(url, onSuccess, onError) {
  return reqwest({
    url: url,
    type: 'json',
    method: 'get',
    error: onError || function() {},
    success: onSuccess || function() {}
  });
}

function ajaxdelete(url, onSuccess, onError) {
  return reqwest({
    url: url,
    type: 'json',
    method: 'delete',
    error: onError || function() {},
    success: onSuccess || function() {}
  });
}

function ajaxpost(url, data, onSuccess, onError) {
  return reqwest({
    url: url,
    type: 'json',
    method: 'post',
    data: data,
    error: onError || function() {},
    success: onSuccess || function() {}
  });
}

function ajaxput(url, data, onSuccess, onError) {
  return reqwest({
    url: url,
    type: 'json',
    method: 'put',
    data: data,
    error: onError || function() {},
    success: onSuccess || function() {}
  });
}

var State = {
  webradios: [],
  alarms: [],

  whatsPlaying: null,
  isPlaying: null,

  fetchWebradios: function() {
    var that = this;
    return ajaxget('api/webradios/', function(resp) {
      that.webradios = resp.webradios;
    });
  },
  deleteWebradio: function(uuid) {
    var that = this;
    return ajaxdelete('api/webradios/' + uuid, function() {
      _.remove(that.webradios, {'uuid': uuid});;
    });
  },
  addWebradio: function(data) {
    var that = this;
    return ajaxpost('api/webradios/', data, function() {
      that.webradios = that.webradios.concat([data]);
    });
  },
  editWebradio: function(data) {
    var that = this;
    return ajaxput('api/webradios/' + data.uuid, data, function() {
      var radio = _.find(State.webradios, {'uuid': data.uuid});
      _.merge(radio, data);
    });
  },

  fetchInfos: function() {
    var that = this;
    return ajaxget('api/infos/', function(resp) {
      var radio = _.find(State.webradios, {'url': resp.infos.url});
      that.whatsPlaying = radio.name || resp.infos.url;
      that.isPlaying = resp.infos.playing;
    });
  },
  playWebradio: function(uuid) {
    var radio = _.find(State.webradios, {'uuid': uuid});
    return ajaxget('api/play/' + radio.url);
  },
  playerHandler: function() {
    var that = this;
    if (this.isPlaying) {
      return ajaxget('api/stop/', function() {
        that.isPlaying = false;
      });
    } else {
      return ajaxget('api/play/', function() {
        that.isPlaying = true;
      });
    }
  },

  fetchAlarms: function() {},
}


// <COMPONENTS>

var NavBar = React.createClass({displayName: "NavBar",
  render: function() {
    return (
      React.createElement("div", {id: "nav"}, 
        React.createElement("a", {href: "#/alarms"}, "/alarms"), 
        React.createElement("a", {href: "#/webradios"}, "/webradios")
      )
    );
  }
});

var PlayerBar = React.createClass({displayName: "PlayerBar",
  getDefaultProps: function() {
    return {};
  },
  render: function() {
    var action = (this.props.isPlaying) ? "STOP" : "PLAY";
    var buttonClasses = "submit-button " + ((this.props.isPlaying) ? "red" : "blue") + "-button";
    if (this.props.name) {
      return (
        React.createElement("div", {id: "player"}, 
          React.createElement("span", {className: "submit-button not-a-button no-right-border"}, this.props.name), 
          React.createElement("button", {onClick: this.props.playerHandler, className: buttonClasses}, action)
        )
      );
    } else {
      return (React.createElement("div", {id: "player"}, React.createElement("span", {className: "submit-button not-a-button"}, " … ")));
    }
  }
});

var WebradioItem = React.createClass({displayName: "WebradioItem",
  playHandler: function(e) {
    e.preventDefault();
    this.props.playWebradio(this.props.webradio.uuid);
  },
  deleteWebradioHandler: function(e) {
    e.preventDefault();
    if (confirm("Do you really want to delete radio [" + this.props.webradio.name + "] ?")) {
      this.props.deleteWebradio(this.props.webradio.uuid);
    }
  },
  render: function() {
    var href = "#/webradios/edit/" + this.props.webradio.uuid;
    return (
      React.createElement("li", null, this.props.webradio.name, " − ", ' ', 
        React.createElement("a", {className: "play-link", onClick: this.playHandler, href: "#/"}, "[>]"), " | ", ' ', 
        React.createElement("a", {className: "edit-link", href: href}, "[?]"), " | ", ' ', 
        React.createElement("a", {className: "del-link", onClick: this.deleteWebradioHandler, href: "#/"}, "[X]")
      )
    );
  }
});

var WebradioList = React.createClass({displayName: "WebradioList",
  render: function() {
    var that = this;
    var liNodes = this.props.data.map(function(webradio) {
      return (
        React.createElement(WebradioItem, {webradio: webradio, deleteWebradio: that.props.deleteWebradio, playWebradio: that.props.playWebradio})
      );
    });
    return (
      React.createElement("div", {id: "main"}, 
        React.createElement("h1", null, " > WEBRADIO LIST"), 
        React.createElement("ul", null, 
          liNodes
        ), 
        React.createElement("a", {className: "add-button", href: "#/webradios/new"}, "[+ add]")
      )
    );
  }
});

var WebradioForm = React.createClass({displayName: "WebradioForm",
  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.refs.name.getDOMNode().value.trim();
    var url = this.refs.url.getDOMNode().value.trim();
    if (!name || !url) {
      return;
    }
    if (this.props.radio.uuid) { // EDIT
      var radio = _.assign(this.props.radio, {'name': name, 'url': url});
      this.props.editWebradio(radio);
    } else {
      this.props.addWebradio({'name': name, 'url': url});
    }
    window.location.hash = '#/webradios';
  },
  getDefaultProps: function() {
    return {radio: {}};
  },
  render: function() {
    var submitString = (this.props.radio.uuid) ? "EDIT" : "ADD";
    return (
      React.createElement("form", {className: "webradio-form pure-form", onSubmit: this.handleSubmit}, 
        React.createElement("input", {className: "pure-input-1 my-input-1", type: "text", ref: "name", placeholder: "Name", defaultValue: this.props.radio.name}), React.createElement("br", null), React.createElement("br", null), 
        React.createElement("input", {className: "pure-input-1 my-input-1", type: "url", ref: "url", placeholder: "Stream URL", defaultValue: this.props.radio.url}), React.createElement("br", null), React.createElement("br", null), 
        React.createElement("input", {className: "submit-button", type: "submit", value: submitString})
      )
    );
  }
});

var App = React.createClass({displayName: "App",
  getInitialState: function() {
    return State;
  },

  fetchWebradios: function() {
    var that = this;
    State.fetchWebradios().then(function() {
      that.setState(State);
    });
  },
  deleteWebradio: function(uuid) {
    var that = this;
    State.deleteWebradio(uuid).then(function() {
      that.setState(State);
    });
  },
  addWebradio: function(data) {
    var that = this;
    State.addWebradio(data).then(function() {
      that.setState(State);
      that.fetchWebradios();
    });
  },
  editWebradio: function(data) {
    var that = this;
    State.editWebradio(data).then(function() {
      that.setState(State);
    });
  },
  playWebradio: function(uuid) {
    var that = this;
    State.playWebradio(uuid).then(function() {
      that.setState(State);
      that.fetchInfos();
    });
  },

  fetchInfos: function() {
    var that = this;
    State.fetchInfos().then(function() {
      that.setState(State);
    });
  },
  playerHandler: function() {
    var that = this;
    State.playerHandler().then(function() {
      that.setState(State);
    });
  },

  componentDidMount: function() {
    this.fetchWebradios();
    this.fetchInfos();
    State.webradiosInterval = setInterval(this.fetchWebradios, 10000);
    State.infosInterval = setInterval(this.fetchInfos, 5000);
  },
  componentWillUnmount: function() {
    clearInterval(State.webradiosInterval);
    clearInterval(State.infosInterval);
  },

  render: function() {
    if (this.props.page === 'webradios') {
      return (React.createElement("div", null, React.createElement(NavBar, null), React.createElement(PlayerBar, {playerHandler: this.playerHandler, name: this.state.whatsPlaying, isPlaying: this.state.isPlaying}), React.createElement(WebradioList, {data: this.state.webradios, deleteWebradio: this.deleteWebradio, playWebradio: this.playWebradio})));
    } else if (this.props.page === 'webradio-add') {
      return (React.createElement("div", null, React.createElement(NavBar, null), React.createElement(PlayerBar, {playerHandler: this.playerHandler, name: this.state.whatsPlaying, isPlaying: this.state.isPlaying}), React.createElement(WebradioForm, {addWebradio: this.addWebradio})));
    } else if (this.props.page === 'webradio-edit') {
      var radio = _.find(State.webradios, {'uuid': this.props.uuid});
      return (React.createElement("div", null, React.createElement(NavBar, null), React.createElement(PlayerBar, {playerHandler: this.playerHandler, name: this.state.whatsPlaying, isPlaying: this.state.isPlaying}), React.createElement(WebradioForm, {radio: radio, editWebradio: this.editWebradio})));
    } else {
      return (React.createElement("div", null, React.createElement(NavBar, null), React.createElement(PlayerBar, {playerHandler: this.playerHandler, name: this.state.whatsPlaying, isPlaying: this.state.isPlaying}), React.createElement("p", null, "Woops !")));
    }
  }
});


// <VIEWS>

function webradioView() {
  React.render(React.createElement(App, {page: "webradios"}), container);
}

function webradioAddView() {
  React.render(React.createElement(App, {page: "webradio-add"}), container);
}

function webradioEditView(uuid) {
  React.render(React.createElement(App, {page: "webradio-edit", uuid: uuid}), container);
}

function wildcardView() {
  React.render(React.createElement(App, {page: "none"}), container);
}


// <ROUTES>

var routes = {
  // '/author': author,
  // '/books': [books, function() {console.log("An inline route handler."); }],
  // '/books/view/:bookId': viewBook
  '/webradios': webradioView,
  '/webradios/new': webradioAddView,
  '/webradios/edit/:uuid': webradioEditView,
  '/*': wildcardView
};

var router = Router(routes);

router.init();
webradioView();
