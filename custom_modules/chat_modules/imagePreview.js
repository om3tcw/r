function doesMessageContainALink($messageElement) {
  //Unfinished :D
  return $messageElement.children().last().attr('href')
}

function createHoverImage($messageElement, 
                          imgUrl = null, 
                          xOffset = 20, 
                          yOffset = 20) {
  let $parentElement = $messageElement.parent();
  $parentElement.on("mouseenter", (event) => {
    if ($parentElement.data('imageInstance')) {
      return;
    }
    let newImg = new Image();
    newImg.style.display = "block";
    newImg.referrerPolicy = "no-referrer";
    if (!imgUrl) {
      imgUrl = $messageElement.children().last().attr('href');
    }
    newImg.src = imgUrl;
    $parentElement.data('imageInstance', newImg)
    $(newImg).css({
      'position': 'absolute',
      'z-index': '9999',
      'display': 'block',
      'top': event.pageY + yOffset,
      'left': event.pageX + xOffset
    });
    $('body').append(newImg);
  })

  $parentElement.on("mousemove", (event) => {
    const imageElement = $parentElement.data('imageInstance');
    if (imageElement) {
      $(imageElement).css({
        'top': event.pageY + yOffset,
        'left': event.pageX + xOffset
      });
    }
  });

  $parentElement.on("mouseleave", () => {
    const imageElement = $parentElement.data('imageInstance');
    if (imageElement) { 
      $(imageElement).fadeOut(200, () => {
        $parentElement.removeData('imageInstance')
        imageElement.remove();
      });
    }
  })
}
//Refer to Socket.on additions in technical documentation
const linkRegex = /href="(.*?)"/;
socket.on("chatMsg", async (msgObject)=> {
  const match = linkRegex.test(msgObject.msg)
  if (match) {
    createHoverImage(fetchLastChatElement())
  }
})