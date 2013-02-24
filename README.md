## Chrome extension for sending YouTube videos to XBMC via RPC

  This heavily modified version of the extension in the XBMC wiki is updated to Chrome's extension manifest v2.0, and supports the new YouTube, Frodo, multiple XBMC hosts, and templates for easier implementation of modifications down the road.

  Please see http://wiki.xbmc.org/index.php?title=Add-on:YouTube for more information on the XBMC YouTube plugin.

## How to install

    git clone git://github.com/lawrencealan/youtube-xbmc-chrome.git youtube-xbmc-chrome

1. Clone
2. Open Chrome, go to chrome://extensions
3. Enable "Developer mode"
4. Click on "Load unpacked extension"
5. Point to above cloned folder.


## Settings

Make sure you have XBMC's web UI running, and the port setup correctly.

### XBMC Hosts
List of XBMC Host(s) URIs in label|username:password@host:port format, one per line:

    lil|xbmc:@openelec.local:8080
    media|xbmc:@media-pc.local:8080


### XBMC plugin path
Path to the XBMC youtube plugin

    plugin.video.youtube

### Insertion Selectors
These are where the extension looks to insert the links for sending the items to your XBMC hosts.
One per line, Valid "types" are: "player", "thumb", "iframe" and "playlist"

    .yt-pl-thumb|playlist
    #watch7-player|player
    .ux-thumb-wrap|thumb
    iframe[src*='youtube.com\/embed']|iframe

