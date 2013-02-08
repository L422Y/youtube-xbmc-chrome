// initially based on the chrome extension here: http://wiki.xbmc.org/index.php?title=Add-on:YouTube
// Based on:
// http://greasefire.userscripts.org/scripts/review/101305 (by Frz)
// http://userscripts.org/scripts/show/92945 (by deepseth)
// http://userscripts.org/scripts/show/62064 (by Wolph)

var _xby = null;
var xbmc_youtube = {
    path: "plugin.video.youtube",
    hosts: {},
    hook_types: {
        player: { template: 'watch.html', finder: "location", inserter: "after_player" },
        thumb: { template: 'thumb.html', finder: "thumb", inserter: "into_thumb" }
    },
    hook_templates: {},
    hook_items: {
        "#watch7-player": { type: 'player' },
        ".ux-thumb-wrap": { type: 'thumb' }
    },
    autoplay: false,
    /** ID FINDER FUNCTIONS **/
    finders: {
        location: function (element, hook, hook_type) {
            var url = window.location.href;
            var matches = url.match(/(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/);
            return matches[5];

        },
        thumb: function (element, hook, hook_type) {
            return $(element).closest('[href]').attr('href').split('v=')[1];
        }
    },

    /** INSERTION FUNCTIONS **/
    inserters: {
        after_player: function (element, hook, hook_type, video_id) {
            var tpl = _xby.hook_templates[hook_type.template] + "";
            tpl = tpl.replace("##id##", video_id);
            $(tpl).insertAfter(element);
        },
        into_thumb: function (element, hook, hook_type, video_id) {
            var tpl = _xby.hook_templates[hook_type.template] + "";
            tpl = tpl.replace("##id##", video_id);
            $(tpl).appendTo(element);
        }
    },
    log: function (msg) {
        if (typeof(msg) === "string") {
            console.log('[xbmcyoutube] ', msg)
        } else {
            console.log(msg);
        }
    },
    initialize: function () {
        _xby = xbmc_youtube;
        _xby.log('initializing...');
        _xby.load(_xby.run);
    },
    load: function (_callback) {
        chrome.extension.sendRequest({ type: "_settings" },
            function (response) {
                response = JSON.parse(response);
                _xby.hosts = response.hosts;
                _xby.hook_items = response.hooks;
                _xby.hook_templates = response.templates;
                _xby.path = response.path;
                if (typeof(_callback) === 'function') _callback();
            });

    },
    handleClick:function(ev){
        var host = $(this).data('host');
        var videoid = $(this).data('videoid');
        if(videoid!=null){
            _xby.commands.play_video(host,videoid);
            ev.preventDefault();
        }
    },
    rpc: function (host,method, params, id) {
        if (_xby.hosts.length == 0) {
            if (typeof(chrome) != "undefined") {
                chrome.tabs.create({'url': chrome.extension.getURL("options.html")}, function () {});
                return false;
            }
        }

        var mid = id | 1;
        var data = { jsonrpc: "2.0", method: method, id: mid };

        if (params) {
            params.item.file = "plugin://" + _xby.path + params.item.file;
            data.params = params;
        }
        var strData = JSON.stringify(data);
        console.log("Calling " + host + " with " + strData);
        var details = {
            method: 'POST',
            url: 'http://'+host+'/jsonrpc',
            headers: { 'Content-type': 'application/json' },
            data: strData,
            onload: function (r) {
                console.log("onload:" + JSON.stringify(r));
            }
        };
        chrome.extension.sendRequest({ type: "httpRequest", "details": details});
        return true;
    },
    commands: {
        play_video: function (host,id) {
            _xby.rpc(host, "Player.Open", { item: { file: "/?path=/root/video&action=play_video&videoid=" + id } })
        },
        play_list: function (host,list) {
            _xby.rpc(host, "Player.Open", { item: { file: "/?action=play_all&video_list=" + list } })
        },
        play_playlist: function (host,playlist) {
            file = "/?path=/root/playlists&action=play_all&playlist=" + list;
            _xby.rpc(host, "Player.Open", { item: { file: file } });
        }
    },
    run: function () {
        for (var item_selector in _xby.hook_items) {
            var hook = _xby.hook_items[item_selector];
            var hook_type = _xby.hook_types[hook.type];
            var hook_items = $(item_selector);
            var item_count = hook_items.length;
            if (item_count > 0) {
                _xby.log('found ' + item_count + ' "' + item_selector + '" items...');
                var finder_func = _xby.finders[hook_type.finder];
                var insert_func = _xby.inserters[hook_type.inserter];
                hook_items.each(function () {
                    var id = finder_func(this, hook, hook_type);
                    var result = insert_func(this, hook, hook_type, id);
                    $(this).addClass('xbmc_host');
                });

            }
        }
        $('[data-videoid]').click(_xby.handleClick);
    }
};


xbmc_youtube.initialize();

