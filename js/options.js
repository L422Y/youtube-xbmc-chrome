// Saves options to localStorage.

var _xby_fields = {
    "xbmc_hosts":"label|username:password@localhost:8080",
    "xbmc_youtube_path":"plugin.video.youtube",
    "xbmc_hooks":".yt-pl-thumb|playlist\n#watch7-player|player\n.ux-thumb-wrap|thumb\niframe[src*='youtube.com\/embed']|iframe\n#player-api|player"
};

function save_options() {
    // iterate fields, updating each localstorage store with form data
    $.each(_xby_fields, function (id, val) {
        window.localStorage[id] = document.getElementById(id).value;
    });
    $('#status').html("Saved.").show().delay(1500).fadeOut();
}

function restore_options() {
    // iterate fields, updating each form field with localstorage data OR defaults (from field object)
    $.each(_xby_fields, function (id, val) {
        if (window.localStorage[id]) {
            document.getElementById(id).value = window.localStorage[id];
        } else {
            set_defaults(id, true);
        }
    });
}

function set_defaults(id, force) {
    if (!force) if (!confirm("Set defaults for '" + id + "'?")) return;
    document.getElementById(id).value = _xby_fields[id];
}

// do restore, bind to events
restore_options();
$('#savebtn').click(save_options);
$('button.defaults').click(function (ev) {
    var parent = $(this).attr('for');
    set_defaults(parent);
    ev.preventDefault();
});

