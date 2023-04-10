When uploading your soundpost, remember to normalize the audio to -6 db.
You can do this using ffmpeg-normalize using the following function in powershell or command prompt:
ffmpeg-normalize ".\%%~nxx" -nt peak -t -6 -c:a libvorbis -ext ogg -of .\output

~~~~~ Otherwise add the emote and link below this line and ping me ~~~~~
