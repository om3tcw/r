# misc

- MofuMofuRisu: <https://pastebin.com/pStfz18V> put this as the default shit in the polkapeek  [:ayamepray:]
- the options window stays up but polka disappears when not mousing over her
- "make the bees fly"
- Egao: make the mods able to turn of and on the change votes option
- "live reaction"
- ctrl + e opens up emotes
- [HIGH PRIO] dropdown for styles
- low-bandwidth mode (gifs unload or don't load)
- module priority when loading
- refresh after restore video

```js
if (!['[server]', '[voteskip]'].includes(username.toLowerCase()) && username !== "softbanneduser")
```

- this piece of code is repeated and should be exported to something readable and reusable
- CI/CD/a method to remove all cookies on live deployment
  - mostly because it's good resume CV fluff.
- handle errors when fetching a script that isn't found in the getscript part of xaemodules

- You can turn a discord external CDN image into the original source
- <https://images-ext-1.discordapp.net/external/1EaJOBLrzSlcPgd5UaEtPplZ6cZRIGCotFchDrYWFPE/%3Fformat%3Djpg%26name%3Dsmall/https/pbs.twimg.com/media/GyifgfgXsAA0iPx?format=webp&width=745&height=672> finding "https/pbs.twimg" turns it into <https://pbs.twimg.com/media/GyifgfgXsAA0iPx> which then when you add ?format=jpg&name=small turns into a visible image

## Navbar consistency

`moreLayoutOption.js`

```js
//On Document Load
$(function() {
    const $navBar = $(".nav.navbar-nav");
    $navBar.children().eq(4).attr("id", "layout-nav-toggle")
})
```

In this file I manually add an ID to the 4th navbar element, ideally this should be done to all of them inside `customDOMChanges.js` or something similar, so they're all selectable.

## low prio bugs

- `function removeVideo(event)` `PLAYER.pause` fails if no video is playing. Currently wrapped within a try catch.
- possible race conditions when appending DOM elements to jquery variables
