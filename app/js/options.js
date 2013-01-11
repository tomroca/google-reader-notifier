(function () {

  var optionsObj = {
    updateInterval: 5,
    doAnimation: true,
    colorUnread: '#980010',
    colorNoUnread: '#686868'
  };

  var areas = {
    sync: 'sync',
    local: 'local'
  };

  var isSyncEnabled = function () {
    return localStorage.optionsArea === areas.sync;
  };
  
  chrome.storage.onChanged.addListener(function (changes, changedArea) {
    if (changedArea === areas.sync && isSyncEnabled()) {
      // do sync
      var newValues = {};
      for (var property in changes) {
        newValues[property] = changes[property].newValue;
      }
      chrome.storage.local.set(newValues);
    }
  });

  var options = {

    enableSync: function (enableSync) {
      if (enableSync !== isSyncEnabled()) {        
        localStorage.optionsArea = enableSync ? areas.sync : areas.local;
        if (enableSync) {
          // do sync
          chrome.storage.sync.get(optionsObj, function(values) {
            chrome.storage.local.set(values);
          });
        }
      }
    },
    
    isSyncEnabled: isSyncEnabled,
    
    onChange: function (onChange) {
      chrome.storage.onChanged.addListener(function (changes, changedArea) {
        if (changedArea === areas.local && onChange instanceof Function) {
          onChange(changes, changedArea);
        }
      });
    },
    
    get: function (callback) {
      chrome.storage.local.get(optionsObj, callback);
    },
    
    set: function (values, callback) {
      if (isSyncEnabled()) {
        chrome.storage.sync.set(values);
      } else {
        chrome.storage.local.set(values, callback);        
      }
    }
  
  };
  
  window.options = options;

}());