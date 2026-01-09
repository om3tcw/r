
async function renameLink(element) {
    const parent = element.parentElement;

    let request = "";
    let site = "";

    if (element.href.search(/youtube\.com|youtu\.be/i) > -1) {
        request = `https://www.youtube.com/oembed?url=${element.href}&format=json`;
        site = "YouTube";
    }
    if (element.href.search(/streamable\.com/i) > -1) {
        request = `https://api.streamable.com/oembed.json?url=${element.href}`;
        site = "Streamable"
    }
    if (element.href.search(/vimeo\.com/i) > -1) {
        request = `https://vimeo.com/api/oembed.json?url=${element.href}`;
        site = "Vimeo"
    }

    if (request) {
        const response = await fetch(request, {headers: {'Content-Type': 'text/json'}});
        if (!response.ok) {
            return;
        }

        const json = await response.json();
        // If the message was sent in a filter, the text is modified and the element
        // passed to us is no longer in the DOM. Find it again.
        const a = parent.querySelector(`span > a[href="${element.href}"]`);
        console.log(a, parent, parent.querySelectorAll(`a[href="${element.href}"]`));
        if (a) {
            a.classList.add("vid-title-preview");
            a.innerText = `[${site}] ${json.title} [${json.author_name}]`;
        }
    }
}

function messageHandler($message) {
    // tap passes the last element instead of the last span
    $message = $message.parent().find("> span").last();

    if ($message.parent().find(".vid-title-preview").length > 0) {
        return;
    }
    $message
        .find("> a")
        .each((k, v) => renameLink(v) )
}

// videoTitlePreview is taken!
window.previewVideoTitle = {
    toggle : function(on) {
        if (on) {
            MESSAGE_PROCESSOR.addTap(messageHandler);
        } else {
            MESSAGE_PROCESSOR.unsubscribe(messageHandler);
        }
    }
};
