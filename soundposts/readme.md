## Soundposts
When uploading your soundpost, remember to normalize the audio to -6 db.

You can do this using ffmpeg-normalize using the following function in powershell or command prompt:
ffmpeg-normalize ".\%%~nxx" -nt peak -t -6 -c:a libvorbis -ext ogg -of .\output

Or use Audacity:
To normalize audio in Audacity, select your track, navigate to Effect > Volume and Compression > Normalize. 
Set the maximum amplitude to -1.0 dB or -3 dB to increase loudness without clipping, 
Listen to the result if the volume is still too peak decrease the "Peak amplitude". Once done export as .ogg 

(Or use this site if you're lazy https://www.audio2edit.com/normalize-audio)

## Rare soundposts
Raresoundposts work based on the chance you set in "chance": its percent based. 
"chance": 50 is 50 out of 100 etc. 

Setting **isLong** to true will make the soundpost play 3s longer for each subsequent emote posted. Only use for long sounds.

## If you can't do it yourself add the emote and sound below here and ping someone
