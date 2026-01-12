When uploading your soundpost, remember to normalize the audio to -6 db.
You can do this using ffmpeg-normalize using the following function in powershell or command prompt:
ffmpeg-normalize ".\%%~nxx" -nt peak -t -6 -c:a libvorbis -ext ogg -of .\output
Raresoundposts work based on the chance you set in "chance": its percent based. 
"chance": 50 is 50 out of 100 etc. 
Setting isLong to true will make the soundpost play 3s longer for each subseqint emote posted. Only use for long sounds.
~~~~~ Otherwise add the emote and link below this line and ping me ~~~~~
