(function rratButton() {
    $('#plcontrol').append('<input type="button" class="btn btn-sm btn-default" value="🐀" id="replacebutton">');
    $('#plcontrol').append('<input type="button" class="btn btn-sm btn-default" value="🔃" id="refreshbutton">');

    $('#replacebutton').click(function () {
        let newId = window.prompt("Replace the current playing stream\nRefresh to undo\n\nSwitching back to YouTube from Twitch is broken, so reloading the player is necessary in that case\n\nYoutube URL/ID:", "");
        let newSource = "YT";

        if (newId == null) {
            newId = "";
        } else if (newId.includes("https://youtube.com/watch?v=")) {
            newId = newId.replace('https://youtube.com/watch?v=', '').substring(0, 11);
        } else if (newId.includes("https://www.youtube.com/watch?v=")) {
            newId = newId.replace('https://www.youtube.com/watch?v=', '').substring(0, 11);
        } else if (newId.includes("https://youtu.be/")) {
            newId = newId.replace('https://youtu.be/', '').substring(0, 11);
        } else if (newId.includes("https://www.twitch.tv/")) {
            newId = newId.replace('https://www.twitch.tv/', '');
            newSource = "TTV";
        } else if (newId.includes("https://twitch.tv/")) {
            newId = newId.replace('https://twitch.tv/', '');
            newSource = "TTV";
        } else if (newId === "om3tcw") {
            newId = "cJtkxZrUicI";
        } else if (newId === "ogey" || newId === "rrat" || newId === "ogey rrat") {
            newId = "JacN1MzyeKo";
        } else if (newId.length !== 11) {
            alert("Invalid input.\nExample input: https://www.youtube.com/watch?v=X9zw0QF12Kc, https://youtu.be/X9zw0QF12Kc, X9zw0QF12Kc, https://www.twitch.tv/holofightz, https://twitch.tv/holofightz");
            newId = "";
        }

        document.body.classList.add('chatOnly');
        socket.emit("removeVideo");
        CLIENT.videoRemoved = true;

        if (newId !== "") {
            const playerSrc = newSource === "YT"
                ? `https://www.youtube.com/embed/${newId}?autohide=1&autoplay=1&controls=1&iv_load_policy=3&rel=0&wmode=opaque&enablejsapi=1&origin=https%3A%2F%2Fom3tcw.com&widgetid=2`
                : `https://player.twitch.tv?channel=${newId}&parent=om3tcw.com&referrer=location.host`;
            $("#ytapiplayer")[0].src = playerSrc;
        }
    });

    $('#refreshbutton').click(function () {
        document.body.classList.remove('chatOnly');
        $("mediarefresh").click();
        socket.emit("restoreVideo");
        CLIENT.videoRemoved = false;
    });
})();