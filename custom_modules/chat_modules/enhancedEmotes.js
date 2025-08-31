//** Hijack the cs-emotes-export backend element
$('#cs-emotes-export').off('click')
$("#cs-emotes-export").on('click', () => {
    let emoteObject = CHANNEL.emotes.map( (emote) => {
    return {
        name: emote.name,
        image: emote.image,
        ...(emote.meta && { meta: emote.meta }),
        ...(emote.soundpost && { soundpost: emote.soundpost })
    }
});
    $("#cs-emotes-exporttext").val(JSON.stringify(emoteObject));
});

//** Click on emote code
let currentChatboxCaret = 0;

$(chatline).on('click.caretUpdate keydown.caretUpdate', (event) => {
    requestAnimationFrame(() => {
        currentChatboxCaret = event.target.selectionStart;
    });
})

$(messagebuffer).on('click', (event) => {
    let target = event.target;
    if (event.button != 0) { 
        return;
    }
    if (target.className == 'channel-emote') {
        let curChatVal = $(chatline).val();
        let emoteName = event.target.title;
        let firstHalf = curChatVal.substring(0, currentChatboxCaret);
        let secondHalf = curChatVal.substring(currentChatboxCaret);
        let newChatVal = firstHalf + emoteName + " ";
        currentChatboxCaret = newChatVal.length;
        newChatVal = newChatVal + secondHalf;
        $(chatline).val(newChatVal).focus()[0].setSelectionRange(currentChatboxCaret, currentChatboxCaret);
    }
});
