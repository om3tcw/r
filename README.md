# /hlgg/'s Custom Code

*hacker voice* This is Immergrok, I've successfully infiltrated. With the help of Immerred I will take this place down from the inside.

## EMOTES

  Please keep emote names the same as they are on cytube
  If you rename an emote on the cytube, please rename the file here on the github as well
  for the filenames, emotes with "?" and "/" in the name have those characters changed, ? becomes - and / becomes _
  
  TO UPLOAD EMOTES:
    1. Click on the "emotes" folder
    2. Click "Add file" and on the dropdown click "Upload files"
    3. Add your emotes
    4. click "Commit changes"

## Soundposts

  Information pertaining to soundposts can be found in the soundpost folder

## Updating js/css

  After making changes on github the changes are sync'd to cloudflare. The bote then pulls the files from CF and serves them, the sync can take 1-2 minutes so wait before asking for a channel refresh.
  After updating CSS ask a purple to refresh the CSS from within the bote
  After updating JS go into "main.js" and update this function, incrementing the number by 1 will avoid any issues with stale cache files. Increase this by one: "?ver=X-XX-XX;" full function below
  "function makeLiveCDNLink(fileName) {
  return CURRENT_CDN + "/" + fileName + "?ver=1-13-29";
  }"

## Commands
  Commands below are mod+
  /setgold TARGET, /unsetgold TARGET
  /mikubeam TARGET
  /ninomode TARGET
  /uoh on, /uoh off
