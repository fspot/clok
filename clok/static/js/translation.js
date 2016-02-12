var locales = {
  // ENGLISH (default)
  en: {
    menu: {
      radios: 'radios',
      alarms: 'alarms',
    },
    player: {
      title: 'Radios & musics',
      subtitle: 'Pick a radio below',
    },
    action: {
      edit: 'edit',
      add: 'add',
      save: 'save',
      cancel: 'cancel',
      search: 'search',
    },
    radioadd: {
      aradio: 'a radio',
      subtitle: 'Add a track, a playlist, or an audio stream, online or local.',
      name: 'Name',
      streamurl: 'Stream path or URL',
    },
    alarmadd: {
      analarm: 'an alarm',
      radio: 'Radio',
      trigger: 'Triggering time',
      hour: 'Hour',
      minutes: 'Minutes',
      duration: 'Duration (minutes)',
      disabled: 'Disabled',
      shuffle: 'Shuffle (playlists only)',
    },
    day: {
      monday: 'mon.',
      tuesday: 'tue.',
      wednesday: 'wed.',
      thursday: 'thu.',
      friday: 'fri.',
      saturday: 'sat.',
      sunday: 'sun.',
    },
    alarmview: {
      subtitle: 'Set up periodic alarms at desired times.',
    },
    confirm: {
      deleteRadio: 'Do you really want to delete this radio ?',
      deleteAlarm: 'Do you really want to delete this alarm ?',
    },
  },

  // FRENCH
  fr: {
    menu: {
      radios: 'radios',
      alarms: 'alarmes',
    },
    player: {
      title: 'Radios & musiques',
      subtitle: 'Choisissez une radio ci-dessous',
    },
    action: {
      edit: 'modifier',
      add: 'ajouter',
      save: 'enregistrer',
      cancel: 'annuler',
      search: 'rechercher',
    },
    radioadd: {
      aradio: 'une radio',
      subtitle: 'Ajoutez un morceau, une playlist, ou un flux audio, en ligne ou local.',
      name: 'Nom',
      streamurl: 'URL ou chemin du flux',
    },
    alarmadd: {
      analarm: 'une alarme',
      radio: 'Radio',
      trigger: 'Heure de déclenchement',
      hour: 'Heure',
      minutes: 'Minutes',
      duration: 'Durée (minutes)',
      disabled: 'Désactivé',
      shuffle: 'Shuffle (playlists uniquement)',
    },
    day: {
      monday: 'lun.',
      tuesday: 'mar.',
      wednesday: 'mer.',
      thursday: 'jeu.',
      friday: 'ven.',
      saturday: 'sam.',
      sunday: 'dim.',
    },
    alarmview: {
      subtitle: 'Programmez des alarmes périodiques aux moments désirés.',
    },
    confirm: {
      deleteRadio: 'Voulez vous vraiment supprimer cette radio ?',
      deleteAlarm: 'Voulez vous vraiment supprimer cette alarme ?',
    },
  },
};

var lang = (function() {
  if (!navigator.language) {
    return 'en';
  }
  var lang = navigator.language.split('-')[0];
  if (!locales[lang]) {
    return 'en';
  }
  return lang;
})();

Vue.use(VueI18n, {
  lang: lang,
  locales: locales
})
