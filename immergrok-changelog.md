# immergrok's Overhaul Changelog

## [UPCOMING, FUTURE, NOT HERE YET]

### Working on

- Emote overhaul
  - Meta tags and Soundposts inside the emotes themselves.
  - A method to filter and search by meta tags and soundpost status
  - A way to add meta tags and soundposts directly from the bote
  - alt emotes that show up on rotation
- Image on link hover that isn't obtrusive (impossible)
- Holopeek v2

### Not even started

- bees?!
- Better ctrl+a
- ctrl + e
- re-adding NND mode before christmasTM
  - not legally binding
    - specially if I land this job i'm in wait for

## 0.1.0 [30Aug2025 - "Laying out the groundwork"] (WIP)

### Temporary

- [#_] Due to the change in the chat message intercept code, "boo" now only triggers with "/boo", this will be reverted sometime soon, unless people like it.

### WIP Wiki with Module information

<https://github.com/immergrok/r/wiki/Modules>

### Crackerjack's CDN

With the help of Crackerjack we've setup two domains, one for development and one for live that will have a backup of our github. This is still in its infancy and testing phase so if it breaks we can just revert back.

#### CI/CD Pipeline

Whenever you update the github repo, the CDN backup will receive the updated file within the minute.

### Complete refactors and modularization

- No more github417.js, it is now main.js, hopefully will never have a number again.
- Standardized most of the plain JavaScript to JQuery. Now we pester tomboysweat to update to JQuery 3

#### Complete Holopeek rewrite

I put my grubby hands all over holopeek. Adding any functionality or touching any line of code made it crumble into dust, so I rewrote it almost in its entirety. Some important changes as follow:

- (Reverted) changed the name internally to holopeek, fuck you Luxes.
- NEW: Clicking outside of holopeek will close it. Technology!!!
- NEW: Ability to change the image, this is a quick temporary addition that will be changed in the future.
- NEW: The range sliders will now update their style live, instead of when you refresh the checkbox.
- NEW: Reset button now comes with an alert so you don't reset on accident.
- It now works with localStorage instead of cookies.
- [#_] The image leaves if you leave the cursor, it's minor so I'm not going to fix it right now.

#### Offtopic mode rewrite

- Changed the name from "Offtopic mode" to "Mahjong Mode", subject to change.
- It works now.

#### Module load logic

> Code jargon explained, you can skip if uninterested, no real functionality added here.

Modules are now tidily kept within their folder, if you want to find for all the code relevant to a specific functionality, you shouldn't spend more time than reading the folder structure and then the file name.

Modules are now orchestrated by `ModuleLoader.js`. The exact inner functionality shouldn't really matter if I've done my job correctly.

JavaScript is a bitch, and we handle legacy code and libraries, so I exposed two ways in which we can make sure that a certain module and functionality are loaded.

The first one is the global promise `window.allModulesReady` which is probably, ironically, less reliable than the option to wait for a specific module loaded.

The other global promise `window.waitForFunc(functionalityWanted)` actually waits and loops for this functionality within the module imported to be globally available, which turns out is not the same as being loaded.

So, when we want a functionality from a module (e.g: Adding an item to holopeek), first export the functionality, then wait for it.

"Name" is exactly the name given to the module in `const ModulePaths`, where functionalityWanted is just the exposed/exported function or variable, which is generally accessible via `window.functionName`

```js
//holoPeek.js
export function addToHoloPeek() {};
//mahjongMode.js
await window.waitForFunc("addToHoloPeek")
```

This Should All Work TM.

### Cookies removed in favor of localStorage

Why were we even using cookies? Who was Kusa selling our information to?

### Miscellaneous

- `soundNotifications.js` had to be hacked together at the last minute to fix some idiocy. That file is the worst coded piece of shit I've seen in my life, if it breaks I'll fix it, expect it to.
- WIP Standardized CSS Injection Format
- Rewrote most of `moreLayoutOptions.js`, it might even be readable now.
- There's a new file called emotetest.js that has the new format for the next big change, I just wanted to get these things out of my way for now.
- Removed the line that made ctrl+a not work, this was intentionally put there by someone, I'm blaming Luxes
- Renamed github1.css to custom-migobote.css and cleaned it up of a bunch of filth
- Removed a shit ton of JavaScript/CSS backups we had for no reason. For the love of fuck- we use git, we already have those backups by default.

#### Improved emote click and keyboard shortcuts

- Clicking an emote in chat will now write that emote where your cursor last was, instead of at the end of the textbox.
- Ctrl+R and Ctrl+S have better, more consistent code logic when wrapping text (You can select a piece of text, then press Ctrl+R/S, that was undocumented to my knowledge)

### I *haven't* touched

Most of the original XaeModules-modules are intact, completely. Even I'm scared of them for now. So: BetterPms, BetterPlaylist, customSettingsModal, customUserlist, ~~moreLayoutOptions~~ and ~~soundNotifications~~.

I'll fix them if they break, but they're really, really scary.

---

## 0.0.1 [3Aug2025 - "My bandwidth is saved"]

- Fixed a bunch of Layoutoptions.js code
  - Remove video will stop playing the video, even if a new one starts playing, it won't consume bandwidth
  - Chat only is now restorable by pressing on a new button (Restore Header and Video)
  - [#14]: Under rare circumstances, the video won't update and has to be restored by refreshing the page

---

## 0.0.0 \[A while ago - ":jorb: \[r]:jorb:[\/r]"]

- Added reverse tag in its first version, you can use it wrapping emotes and text under \[r][/r] or pressing Ctrl+R
  - Due to how /runescape code works, it doesn't work with /runescape.
