var _settings = {
    path: "plugin.video.youtube",
    hosts: false,
    autoplay: false,
    hooks: false,
    templates: {}
};


chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.type == "Player.Open") {
        callJSONRpc(request.type, { item: { file: "plugin://" + _settings.path + request.path } })
    } else if (request.type == "Files.GetDirectory") {
        callJSONRpc(request.type, { directory: "plugin://" + _settings.path + request.path })
    } else if (request.type == "configure") {
        chrome.tabs.create({'url': chrome.extension.getURL("options.html")}, function () {});
    } else if (request.type == "_settings") {


        if (window.localStorage["xbmc_hosts"]) {
            var hostlines = window.localStorage["xbmc_hosts"].trim().split("\n");
            _settings.hosts = {};
            for (var idx in hostlines) {
                var hostline = hostlines[idx].split('|');
                _settings.hosts[hostline[0]] = hostline[1];
            }
        }
        if (window.localStorage["xbmc_hooks"]) {
            var hooklines = window.localStorage["xbmc_hooks"].trim().split("\n");
            _settings.hooks = {};
            for (var idx in hooklines) {
                var hookline = hooklines[idx].split('|');
                _settings.hooks[hookline[0]] = { type: hookline[1] };
            }
        }

        if (window.localStorage["xbmc_youtube_path"]) {
            _settings.path = window.localStorage["xbmc_youtube_path"];
        }

        var _hosts_insert = "";
        $.ajax({
            url: '/templates/hosts.html',
            async: false,
            success: function (data) {
                _settings.templates['hosts'] = data;

                $.each(_settings.hosts, function (label, host) {
                    _hosts_insert +=
                        data
                            .replace("##host##", host)
                            .replace("##label##", label)
                    ;
                });
            }
        });
        _settings.templates['hosts'] = _hosts_insert;

        $(['watch.html','thumb.html']).each(function (index,value) {
            $.ajax({
                async: false,
                url: '/templates/' + value,
                success: function (data) {
                    _settings.templates[value] = data.replace('##hosts##',_hosts_insert);
                }
            });
        });



        sendResponse(JSON.stringify(_settings));

    }
    else if (request.type == "httpRequest") {
        GM_xmlhttpRequest(request.details)
    } else {
        sendResponse("ERROR");
    }

    function GM_xmlhttpRequest(details) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            var responseState = {
                responseXML: (xmlhttp.readyState == 4 ? xmlhttp.responseXML : ''),
                responseText: (xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
                readyState: xmlhttp.readyState,
                responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
                status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
                statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
            }
            if (details["onreadystatechange"]) {
                details["onreadystatechange"](responseState);
            }
            if (xmlhttp.readyState == 4) {
                if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
                    details["onload"](responseState);
                }
                if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
                    details["onerror"](responseState);
                }
            }
        }
        try {
            xmlhttp.open(details.method, details.url);
        } catch (e) {
            if (details["onerror"]) {
                details["onerror"]({responseXML: '', responseText: '', readyState: 4, responseHeaders: '', status: 403, statusText: 'Forbidden'});
            }
            return;
        }
        if (details.headers) {
            for (var prop in details.headers) {
                xmlhttp.setRequestHeader(prop, details.headers[prop]);
            }
        }
        xmlhttp.send((typeof(details.data) != 'undefined') ? details.data : null);
    }
})
;