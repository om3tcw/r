var SOUNDPOST_PREVIEW = {
    playing : {}
};

let originalLoadPage = null;

function addSoundpostButton(emote_img) {
    if (!window.SOUNDPOSTS[emote_img.title])
        return;

    var soundPreview = document.createElement("button");
    soundPreview.innerText = "▶"; //"⏸︎"
    soundPreview.title = emote_img.title;

    soundPreview.setAttribute("style", `
        position:absolute;
        background: rgba(50, 50, 50, 0.5);
        /*border-radius: 50%;*/
        border: transparent;
        color: rgb(240, 240, 240);
        width: 20px;
        height: 20px;
        font-size: 1.3rem;
    `);

    soundPreview.addEventListener("click", function() {
        if (SOUNDPOST_PREVIEW.playing[this.title] !== undefined) {
            SOUNDPOST_PREVIEW.playing[this.title].stop();
            SOUNDPOST_PREVIEW.playing[this.title] = undefined;
            this.innerText = "▶";
            return;
        }

        this.innerText = "..."; //"⏸︎"

        var myaudio = new Audio(window.SOUNDPOSTS[this.title].soundurl);
        myaudio.preload = "metadata";
        myaudio.title = this.title;

        var self = this;
        myaudio.addEventListener("canplaythrough", function() {
            self.innerText = "⏹";
        }, false);


        myaudio.addEventListener("timeupdate", () => {
            var prog = myaudio.currentTime / myaudio.duration * 100;
            if (prog == 100) {
                prog = 0;
                self.innerText = "▶";
                SOUNDPOST_PREVIEW.playing[myaudio.title] = undefined;
            }
            self.style.background = `conic-gradient(transparent ${prog}%, rgba(50, 50, 50, 0.5) 0)`;
        });

        myaudio.volume = 0.1;
        myaudio.play();
        SOUNDPOST_PREVIEW.playing[this.title] = myaudio;
    });

    return soundPreview;
}

function installButtons() {
    var previews = document.querySelectorAll(".emote-preview-container")

    previews.forEach(preview => {
        var emote_img = preview.querySelector("img");
        let audioButton = addSoundpostButton(emote_img);

        if (audioButton) {
            preview.insertBefore(audioButton, preview.firstChild);
        }
    });
}

function installSoundpostPreview() {
    originalLoadPage = EMOTELIST.loadPage;

    EMOTELIST.loadPage = function(page) {
        originalLoadPage.call(EMOTELIST, page);

        installButtons();
    }
    installButtons();
}

function installFilters() {
    var container = document.querySelector("#emotelist .modal-body div.pull-right");

    var newbox = document.createElement("div");
    newbox.classList.add("checkbox");
    newbox.innerHTML = '<label><input id="emotelist-soundposts" type="checkbox">Soundposts only</label>';
    newbox.querySelector("input").addEventListener("change", function(e) {
        EMOTELIST.filterSoundPosts = this.checked;
        EMOTELIST.handleChange();
        EMOTELIST.loadPage(0);
    });
    container.appendChild(newbox);

    EmoteList.prototype.handleChange = function () {
        this.emotes = CHANNEL.emotes.slice();
        if (this.sortAlphabetical) {
            this.emotes.sort(function (a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();

                if (x < y) {
                    return -1;
                } else if (x > y) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }

        if (this.filterSoundPosts) {
            this.emotes = this.emotes.filter(emote => window.SOUNDPOSTS[emote.name]);
        }

        if (this.filter) {
            this.emotes = this.emotes.filter(this.filter);
        }

        this.paginator = new NewPaginator(this.emotes.length, this.itemsPerPage,
                this.loadPage.bind(this));
        this.paginatorContainer.html("");
        this.paginatorContainer.append(this.paginator.elem);
        this.paginator.loadPage(this.page);
    };
}

(async () => {
    await window.waitForFunc("SOUNDPOSTS");
    installSoundpostPreview();
    installFilters();
})();
