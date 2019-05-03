/*--------------------------------------------------------------
>>> BACKGROUND:
----------------------------------------------------------------
1.0 Google Analytics
2.0 ImprovedTube in toolbar
3.0 Uninstall URL
4.0 Languages
--------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Google Analytics
-----------------------------------------------------------------------------*/

if (chrome.runtime.getManifest().version == chrome.runtime.getManifest().version_name) {
  var _gaq = _gaq || [];

  _gaq.push(['_setAccount', 'UA-88354155-1']);
  _gaq.push(['_setSessionCookieTimeout', 14400000]);

  (function() {
    let ga = document.createElement('script'),
      s = document.getElementsByTagName('script')[0];

    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    s.parentNode.insertBefore(ga, s);
  })();
}


/*-----------------------------------------------------------------------------
2.0 ImprovedTube in toolbar
-----------------------------------------------------------------------------*/

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
  id: '1111',
  title: '❤ Donate',
  contexts: ['browser_action']
});

chrome.contextMenus.create({
  id: '1112',
  title: '★ Rate me',
  contexts: ['browser_action']
});

chrome.contextMenus.create({
  id: '1113',
  title: '◦ GitHub',
  contexts: ['browser_action']
});

chrome.contextMenus.onClicked.addListener(function(event) {
  if (event.menuItemId == '1111') {
    window.open('http://www.improvedtube.com/donate');
  } else if (event.menuItemId == '1112') {
    window.open('https://chrome.google.com/webstore/detail/improvedtube-for-youtube/bnomihfieiccainjcjblhegjgglakjdd');
  } else if (event.menuItemId == '1113') {
    window.open('https://github.com/ImprovedTube/ImprovedTube');
  }
});

chrome.storage.local.get(function(data) {
  if (data.improvedtube_browser_icon == 'always') {
    chrome.browserAction.setIcon({
      path: 'extension/img/32.png'
    });
  } else {
    chrome.browserAction.setIcon({
      path: 'extension/img/32g.png'
    });
  }

  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (sender && sender.tab && sender.tab.id) {
      if (request && request.enabled == true)
        chrome.browserAction.setIcon({
          path: 'extension/img/32.png',
          tabId: sender.tab.id
        });
    }

    let version = chrome.runtime.getManifest().version;

    if (chrome.runtime.getManifest().version == chrome.runtime.getManifest().version_name)
      _gaq.push(['_trackPageview', '/background-' + version, 'page-loaded']);
  });
});


chrome.runtime.onMessage.addListener(function(request) {
  let name = request;

  chrome.storage.local.get(function(data) {
    if (name && name.export) {
      chrome.permissions.request({
        permissions: ['downloads'],
        origins: ['https://www.youtube.com/*']
      }, function (granted) {
        if (granted) {
          let blob = new Blob([JSON.stringify(data)], {
              type: 'application/octet-stream'
            }),
            date = new Date();

          chrome.downloads.download({
            url: URL.createObjectURL(blob),
            filename: 'improvedtube_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getFullYear() + '.json',
            saveAs: true
          });
        }
      });

      return false;
    }

    if (data.improvedtube_browser_icon != 'youtube') {
      chrome.browserAction.setIcon({
        path: 'extension/img/32.png'
      });
    } else {
      chrome.browserAction.setIcon({
        path: 'extension/img/32g.png'
      });
    }
  });

  if (chrome && chrome.tabs)
    chrome.tabs.query({}, function (tabs) {
      for (let i = 0, l = tabs.length; i < l; i++)
        if (tabs[i].hasOwnProperty('url')) {
          chrome.tabs.sendMessage(tabs[i].id, name);
        }
    });
});


/*-----------------------------------------------------------------------------
3.0 Uninstall URL
URL to be opened after the extension is uninstalled
-----------------------------------------------------------------------------*/

chrome.runtime.setUninstallURL('https://improvedtube.com/uninstalled');


/*-----------------------------------------------------------------------------
4.0 Languages
-----------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.hasOwnProperty('path')) {
    let xhr = new XMLHttpRequest(),
        self = this;

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200)
        sendResponse({locale: this.responseText});
    };

    xhr.open('post', request.path, true);
    xhr.send();
  }
});

(function () {
  chrome.storage.local.get(function(data) {
    let xhr = new XMLHttpRequest(),
        self = this,
        language = data.hasOwnProperty('improvedtube_language') ? data.improvedtube_language : 'en',
        locale = '';
        
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        locale = this.responseText;

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
          if (request && request.hasOwnProperty('path')) {
            sendResponse({locale: locale});
          }
        });
      }
    };

    xhr.open('post', '../_locales/' + language + '/messages.json', true);
    xhr.send();
  });
})();
