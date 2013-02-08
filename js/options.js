// Saves options to localStorage.
function save_options() {
    window.localStorage["xbmc_hosts"] = document.getElementById("xbmc_hosts").value;
    window.localStorage["xbmc_youtube_path"] = document.getElementById("xbmc_youtube_path").value;
    window.localStorage["xbmc_hooks"] = document.getElementById("xbmc_hooks").value;

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Saved.";
    setTimeout(function () {status.innerHTML = "";}, 1500);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var defualts = "";
    if (window.localStorage["xbmc_hosts"]) {
        document.getElementById("xbmc_hosts").value = window.localStorage["xbmc_hosts"];
    } else {
        document.getElementById("xbmc_hosts").value = "label|username:password@localhost:8080";
    }

    if (window.localStorage["xbmc_youtube_path"]) {
        document.getElementById("xbmc_youtube_path").value = window.localStorage["xbmc_youtube_path"];
    } else {
        document.getElementById("xbmc_youtube_path").value = "plugin.video.youtube";
    }

    if (window.localStorage["xbmc_hooks"]) {
        document.getElementById("xbmc_hooks").value = window.localStorage["xbmc_hooks"];
    } else {
        defaults = "#watch7-player|watch\n.ux-thumb-wrap|thumb";
        document.getElementById("xbmc_hooks").value = defaults;
    }

}

// do restore, bind to events
restore_options();
document.getElementById('savebtn').onclick = save_options;

