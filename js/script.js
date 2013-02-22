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
        watch: { template: 'watch.html', finder: "location", inserter: "after_player" },
        player: { template: 'watch.html', finder: "location", inserter: "after_player" },
        thumb: { template: 'thumb.html', finder: "thumb", inserter: "into_thumb" },
        playlist: { template: 'playlist.html', finder: "playlist", inserter: "into_playlist" }
    },
    hook_templates: {},
    hook_items: {
        ".yt-pl-thumb": { type: 'playlist' },
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
            var _r = $(element).closest('[href]').attr('href').split('v=')[1];
            if (_r && _r.indexOf('&') > -1) _r = _r.split('&')[0];
            return _r;

        },
        playlist: function (element, hook, hook_type) {
            var _r = $(element).closest('[href]').attr('href').split('list=')[1].split("&")[0];
            if (_r && _r.indexOf('&') > -1) _r = _r.split('&')[0];
            return _r;
        }

    },

    /** INSERTION FUNCTIONS **/
    inserters: {
        after_player: function (element, hook, hook_type, item_id) {
            var tpl = _xby.hook_templates[hook_type.template] + "";
            tpl = tpl.replace(/##id##/g, item_id);
            tpl = tpl.replace(/##type##/g, "video");
            $(tpl).insertAfter(element);
        },
        into_thumb: function (element, hook, hook_type, item_id) {
            var tpl = _xby.hook_templates[hook_type.template] + "";
            tpl = tpl.replace(/##id##/g, item_id);
            tpl = tpl.replace(/##type##/g, "video");
            $(tpl).appendTo(element);
        },
        into_playlist: function (element, hook, hook_type, item_id) {
            var tpl = _xby.hook_templates[hook_type.template] + "";
            tpl = tpl.replace(/##id##/g, item_id);
            tpl = tpl.replace(/##type##/g, "playlist");
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
        _xby.player_ready();
    },
    player: null,
    player_check: null,
    player_paused: false,
    player_ready: function (id) {
        _xby.player_bind();
        _xby.log('player ready...');
    },
    player_bind: function () {
        if ((_xby.player = document.getElementById('movie_player')) != null) {
            _xby.log('bound to player');
        }
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
    handleClick: function (ev) {

        var host = $(this).data('host');
        var item_id = $(this).data('itemid');
        var item_type = $(this).data('itemtype');
        _xby.log("handleclick:" + item_id + ":" + item_type)
        if (item_id != null) {
            if (item_type === "video") _xby.commands.play_video(host, item_id);
            if (item_type === "playlist") _xby.commands.play_playlist(host, item_id);
            ev.preventDefault();
        }
    },
    rpc: function (host, method, params, id) {
        if (_xby.hosts.length == 0) {
            if (typeof(chrome) != "undefined") {
                chrome.tabs.create({'url': chrome.extension.getURL("options.html")}, function () {
                });
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
            url: 'http://' + host + '/jsonrpc',
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
        play_video: function (host, id) {
            _xby.rpc(host, "Player.Open", { item: { file: "/?path=/root/video&action=play_video&videoid=" + id } })
        },
        play_list: function (host, id) {
            _xby.rpc(host, "Player.Open", { item: { file: "/?action=play_all&video_list=" + id } })
        },
        play_playlist: function (host, id) {
            _xby.rpc(host, "Player.Open", { item: { file: "/?path=/root/playlists&action=play_all&playlist=" + id } });
        }
    },
    run: function () {
        for (var item_selector in _xby.hook_items) {
            var hook = _xby.hook_items[item_selector];
            var hook_type = _xby.hook_types[hook.type];
            var hook_items = $(item_selector);

            var item_count = hook_items.length;
            if (item_count > 0) {
                _xby.log('found ' + item_count + ' "' + item_selector + '" items');
                _xby.log(hook);
                _xby.log(hook_type);
                var finder_func = _xby.finders[hook_type.finder];
                var insert_func = _xby.inserters[hook_type.inserter];
                hook_items.each(function () {
                    var id = finder_func(this, hook, hook_type);
                    _xby.log(id);
                    var result = insert_func(this, hook, hook_type, id);
                    $(this).addClass('xbmc_host');
                });

            }
        }
        $('[data-itemid]').click(_xby.handleClick);
    }
};


xbmc_youtube.initialize();


