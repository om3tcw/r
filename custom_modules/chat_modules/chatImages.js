function createDefaultImage() {
  const img = new Image();
  img.referrerPolicy = 'no-referrer';

  return img;
}
function createChatPopupImage(img, chatPopupImageClass) {
  img.classList.add(chatPopupImageClass);
  img.classList.add('hidden');

  return img;
}
function createChatInlineImage(img, chatInlineImageClass) {
  img.classList.add(chatInlineImageClass);
  img.classList.add('pointer');

  return img;
}
function createChatPlayerImage(img, chatPlayerImageClass) {
  img.classList.add(chatPlayerImageClass);
  img.classList.add('pointer');

  return img;
}
function createPreviewImage(img, chatPreviewImageClass) {
  img.classList.add(chatPreviewImageClass);

  return img;
}

function isListed(list, item) {
  return list.filter(listItem => item.includes(listItem)).length > 0;
}

async function checkLinkContentType(link, contentType) {
  const method = 'HEAD';
  const header = 'Content-Type';

  try {
    const response = await fetch(link, { method });
    const contentTypeHeader = response.headers.get(header);
    const hasContentType = typeof contentTypeHeader === 'string';
    if (!hasContentType) {
      return false;
    }

    const isImageContent = contentTypeHeader.startsWith(contentType);

    return isImageContent;
  } catch (_) {
    return false;
  }
}

function createImageLinkMetadataValidator(
  metadataWhitelist,
  metadataBlacklist,
) {
  const imageContentType = 'image/';

  return link => {
    const useBlacklist = metadataBlacklist.length > 0;
    if (useBlacklist) {
      const isBlacklisted = isListed(metadataBlacklist, link);

      if (isBlacklisted) {
        return Promise.resolve(false);
      }
    }

    const useWhitelist = metadataWhitelist.length > 0;
    if (useWhitelist) {
      const isWhitelisted = isListed(metadataWhitelist, link);

      if (!isWhitelisted) {
        return Promise.resolve(false);
      }
    }

    return checkLinkContentType(link, imageContentType);
  };
}

function createImageLinkRegExpValidator(imgFileExts) {
  const imgFileExtsStr = imgFileExts.join('|');
  const imageLinkRegExp = new RegExp(
    `https?:\/\/.+?\.(?:${imgFileExtsStr})(?:[?#][\w=#]*)?`,
    'i',
  );

  return link => imageLinkRegExp.test(link);
}

async function validateItem(item, validators) {
  for (const validator of validators) {
    const isValidItem = await validator(item);

    if (isValidItem) {
      return true;
    }
  }

  return false;
}

function createDdgConverter(ddgProxyPrefix, ddgWhitelist, ddgBlacklist) {
  return link => {
    const useBlacklist = ddgBlacklist.length > 0;
    if (useBlacklist) {
      const isBlacklisted = isListed(ddgBlacklist, link);

      if (isBlacklisted) {
        return link;
      }
    }

    const useWhitelist = ddgWhitelist.length > 0;
    if (useWhitelist) {
      const isWhitelisted = isListed(ddgWhitelist, link);

      if (!isWhitelisted) {
        return link;
      }
    }

    return ddgProxyPrefix + link;
  };
}

function convertItem(item, converters) {
  return converters.reduce((acc, converter) => converter(acc), item);
}
function convertStrToArr(str) {
  return str.split('\n');
}
function convertArrToStr(arr) {
  return arr.join('\n');
}

function cleanupString(str) {
  return str.replace(/^\s*\n/gm, '').trim();
}
function cleanupStringArray(arr) {
  return arr.map(str => cleanupString(str)).filter(str => str !== '');
}

function inlineChatImageLinkHandler({
  linkNode,
  linkValidator,
  linkConverter,

  imgContainerClass,
  imgLinkErrorClass,
  imgLinkLoadingClass,
  imgLinkLoadedClass,

  chatInlineImageClass,

  previewImage,
  previewContainer,

  nsfwToggleValue,
  nsfwImageClass,
}) {
  if (linkNode.classList.contains(imgContainerClass)) {
    return;
  }

  const link = linkConverter(linkNode.href);

  linkValidator(link)
    .then(isValidLink => {
      if (!isValidLink) {
        return;
      }

      linkNode.classList.remove(imgLinkErrorClass, imgLinkLoadedClass);
      linkNode.classList.add(imgContainerClass);
      linkNode.classList.add(imgLinkLoadingClass);

      const inlineImage = createChatInlineImage(
        createDefaultImage(),
        chatInlineImageClass,
      );

      inlineImage.src = link;
      inlineImage.alt = link;
      inlineImage.title = link;

      if (nsfwToggleValue) {
        inlineImage.classList.add(nsfwImageClass);
      }

      linkNode.addEventListener('click', event => event.preventDefault());
      inlineImage.addEventListener('click', () => {
        previewImage.src = link;
        previewContainer.showModal();
      });
      inlineImage.addEventListener('load', () => {
        linkNode.classList.remove(imgLinkLoadingClass, imgLinkErrorClass);
        linkNode.classList.add(imgLinkLoadedClass);

        linkNode.text = '';
        linkNode.appendChild(inlineImage);
      });
      inlineImage.addEventListener('error', () => {
        inlineImage.remove();

        linkNode.classList.add(imgLinkErrorClass);
      });
    })
    .catch(() => {});
}

function popupChatImageLinkHandler({
  linkNode,
  linkValidator,
  linkConverter,

  popupImage,

  imgLinkHoverClass,
  imgLinkClass,
  imgLinkErrorClass,
  imgLinkLoadingClass,
  imgLinkLoadedClass,

  offsetX,
  offsetY,

  maxWidth,
  maxHeight,

  nsfwToggleValue,
  nsfwImageClass,
}) {
  if (linkNode.classList.contains(imgLinkHoverClass)) {
    return;
  }

  const link = linkConverter(linkNode.href);

  linkValidator(link)
    .then(isValidLink => {
      if (!isValidLink) {
        return;
      }

      linkNode.classList.remove(
        imgLinkErrorClass,
        imgLinkLoadingClass,
        imgLinkLoadedClass,
      );
      linkNode.classList.add(imgLinkHoverClass);

      function showErrorLink() {
        linkNode.classList.remove(
          imgLinkClass,
          imgLinkLoadingClass,
          imgLinkLoadedClass,
        );
        linkNode.classList.add(imgLinkErrorClass);
      }
      function colorLinkImage() {
        linkNode.classList.remove(imgLinkLoadingClass, imgLinkLoadedClass);
        linkNode.classList.add(imgLinkClass);
      }
      function colorLinkLoading() {
        linkNode.classList.remove(imgLinkClass, imgLinkLoadedClass);
        linkNode.classList.add(imgLinkLoadingClass);
      }
      function colorLinkLoaded() {
        if (popupImage.src !== link) {
          return;
        }

        linkNode.classList.remove(imgLinkClass, imgLinkLoadingClass);
        linkNode.classList.add(imgLinkLoadedClass);
      }

      function hideImage() {
        popupImage.classList.add('hidden');
      }
      function showImage() {
        if (popupImage.src === link) {
          popupImage.classList.remove('hidden');

          if (!nsfwToggleValue) {
            return;
          }

          popupImage.classList.add(nsfwImageClass);
          setTimeout(() => popupImage.classList.remove(nsfwImageClass), 2500);
        }
      }
      function moveImage({ clientX, clientY }) {
        const { width: imgWidth, height: imgHeight } = popupImage;
        const { innerWidth: viewportWidth, innerHeight: viewportHeight } =
          window;

        const isWidthMax = imgWidth > maxWidth;
        const isHeightMax = imgHeight > maxHeight;
        const isMax = isWidthMax || isHeightMax;

        const posLeft = clientX - offsetX;
        const posRight = clientX + offsetX;
        const posTop = clientY - offsetY;
        const posBottom = clientY + offsetY;

        const imgLeftLimit = posLeft - imgWidth;
        const imgRightLimit = posRight + imgWidth;
        const imgTopLimit = posTop - imgHeight;
        const imgBottomLimit = posBottom + imgHeight;

        const isLeftOut = imgLeftLimit < 0;
        const isRightOut = imgRightLimit > viewportWidth;
        const isTopOut = imgTopLimit < 0;
        const isBottomOut = imgBottomLimit > viewportHeight;

        const isHorizontalOut = isLeftOut && isRightOut;
        const isVerticalOut = isTopOut && isBottomOut;
        const isOut = isHorizontalOut || isVerticalOut;

        const xClientCenter = clientX - imgWidth * 0.5;

        const useDefault = isMax || isOut;

        const x = useDefault
          ? xClientCenter
          : isRightOut
          ? imgLeftLimit
          : isLeftOut
          ? posRight
          : xClientCenter;
        const y = useDefault ? imgTopLimit : isTopOut ? posBottom : imgTopLimit;

        const left = x + 'px';
        const top = y + 'px';
        Object.assign(popupImage.style, { left, top });
      }
      function setImage() {
        popupImage.src = link;
      }
      function listenImage() {
        popupImage.addEventListener('load', showImage);
        popupImage.addEventListener('load', colorLinkLoaded);
        popupImage.addEventListener('error', showErrorLink);
      }
      function updateImage(event) {
        colorLinkLoading();

        const hasLoadedClass = linkNode.classList.contains(imgLinkLoadedClass);
        const isMe = popupImage.src === link;
        const isLoaded = hasLoadedClass && isMe;
        if (isLoaded) {
          showImage();
          colorLinkLoaded();

          return;
        }

        setImage();
        listenImage();
        moveImage(event);
      }

      function cleanupImage() {
        popupImage.removeEventListener('load', showImage);
        popupImage.removeEventListener('load', colorLinkLoaded);
        popupImage.removeEventListener('error', showErrorLink);

        hideImage();
        colorLinkImage();
      }

      linkNode.addEventListener('pointerenter', updateImage);
      linkNode.addEventListener('pointermove', moveImage);
      linkNode.addEventListener('pointerleave', cleanupImage);

      colorLinkImage();
    })
    .catch(() => {});
}

function playerChatImageLinkHandler({
  linkNode,
  linkValidator,
  linkConverter,

  playerImage,
  playerContainer,

  imgLinkHoverClass,
  imgLinkClass,
  imgLinkErrorClass,
  imgLinkLoadingClass,
  imgLinkLoadedClass,

  nsfwToggleValue,
  nsfwImageClass,
}) {
  if (linkNode.classList.contains(imgLinkHoverClass)) {
    return;
  }

  const link = linkConverter(linkNode.href);

  linkValidator(link)
    .then(isValidLink => {
      if (!isValidLink) {
        return;
      }

      linkNode.classList.remove(
        imgLinkErrorClass,
        imgLinkLoadingClass,
        imgLinkLoadedClass,
      );
      linkNode.classList.add(imgLinkHoverClass);

      const showErrorLink = () => {
        linkNode.classList.remove(
          imgLinkClass,
          imgLinkLoadingClass,
          imgLinkLoadedClass,
        );
        linkNode.classList.add(imgLinkErrorClass);
      };
      const colorLinkImage = () => {
        linkNode.classList.remove(imgLinkLoadingClass, imgLinkLoadedClass);
        linkNode.classList.add(imgLinkClass);
      };
      const colorLinkLoading = () => {
        linkNode.classList.remove(imgLinkClass, imgLinkLoadedClass);
        linkNode.classList.add(imgLinkLoadingClass);
      };
      const colorLinkLoaded = () => {
        if (playerImage.src !== link) {
          return;
        }

        linkNode.classList.remove(imgLinkClass, imgLinkLoadingClass);
        linkNode.classList.add(imgLinkLoadedClass);
      };

      const hideContainer = () => {
        playerContainer.classList.add('hidden');
      };
      const showContainer = () => {
        if (playerImage.src === link) {
          playerContainer.classList.remove('hidden');
        }

        if (!nsfwToggleValue) {
          return;
        }

        playerContainer.classList.add(nsfwImageClass);
        setTimeout(
          () => playerContainer.classList.remove(nsfwImageClass),
          2500,
        );
      };

      const setImage = () => {
        playerImage.src = link;
      };
      const listenImage = () => {
        playerImage.addEventListener('load', showContainer);
        playerImage.addEventListener('load', colorLinkLoaded);
        playerImage.addEventListener('error', showErrorLink);
      };
      const updateImage = () => {
        colorLinkLoading();

        const isMe = playerImage.src === link;
        const hasLoadedClass = linkNode.classList.contains(imgLinkLoadedClass);
        const isLoaded = isMe && hasLoadedClass;
        if (isLoaded) {
          showContainer();
          colorLinkLoaded();

          return;
        }

        setImage();
        listenImage();
      };

      const cleanupImage = () => {
        playerImage.removeEventListener('load', showContainer);
        playerImage.removeEventListener('load', colorLinkLoaded);
        playerImage.removeEventListener('error', showErrorLink);

        hideContainer();
        colorLinkImage();
      };

      linkNode.addEventListener('pointerenter', updateImage);
      linkNode.addEventListener('pointerleave', cleanupImage);

      colorLinkImage();
    })
    .catch(() => {});
}

function handleChatMessageLinkNode(
  linkNode,
  chatLinkParsedClass,
  linkNodeHandler,
) {
  if (linkNode.classList.contains(chatLinkParsedClass)) {
    return;
  }

  linkNode.classList.add(chatLinkParsedClass);
  linkNodeHandler(linkNode);
}

function restoreChatMessageImageLink({
  linkNode,

  chatLinkParsedClass,

  imgLinkClass,
  imgLinkErrorClass,
  imgLinkLoadingClass,
  imgLinkLoadedClass,
  imgContainerClass,
  imgLinkHoverClass,
}) {
  if (!linkNode.classList.contains(chatLinkParsedClass)) {
    return;
  }

  const isImageContainer = linkNode.classList.contains(imgContainerClass);
  const isHoverLink = linkNode.classList.contains(imgLinkHoverClass);

  linkNode.classList.remove(
    chatLinkParsedClass,
    imgLinkClass,
    imgLinkErrorClass,
    imgLinkLoadingClass,
    imgLinkLoadedClass,
    imgContainerClass,
    imgLinkHoverClass,
  );

  if (isImageContainer) {
    linkNode.text = linkNode.href;
  }

  if (isHoverLink) {
    linkNode.replaceWith(linkNode.cloneNode(true));
  }
}

function handleChatMessage(msgNode, linkNodeHandler) {
  const contentNode = msgNode.lastElementChild;
  if (!contentNode) {
    return;
  }

  const linkNodes = contentNode.querySelectorAll('a[href]');
  for (const linkNode of linkNodes) {
    linkNodeHandler(linkNode);
  }
}

function handleChatBuffer(msgBuf, linkNodeHandler) {
  for (const msgNode of msgBuf.children) {
    handleChatMessage(msgNode, linkNodeHandler);
  }
}

function saveLocalValue(key, newValue) {
  localStorage.setItem(key, newValue);
}
function saveLocalBool(key, newBool) {
  saveLocalValue(key, String(newBool));
}
function saveLocalObject(key, newObject) {
  saveLocalValue(key, JSON.stringify(newObject));
}

function loadLocalString(key, fallbackStr) {
  const localStr = localStorage.getItem(key);

  const hasLocalValue = typeof localStr === 'string';
  if (!hasLocalValue) {
    saveLocalValue(key, fallbackStr);

    return fallbackStr;
  }

  const isLocalValueEmpty = localStr === '';
  if (isLocalValueEmpty) {
    saveLocalValue(key, fallbackStr);

    return fallbackStr;
  }

  return localStr;
}
function loadLocalBool(key, fallbackBool) {
  const localStr = loadLocalString(key, fallbackBool);

  if (localStr === 'true') {
    return true;
  }

  if (localStr === 'false') {
    return false;
  }

  saveLocalValue(key, fallbackBool);

  return fallbackBool;
}
function loadLocalObject(key, fallbackObject) {
  try {
    const fallbackObjectStr = JSON.stringify(fallbackObject);

    const localObjectStr = loadLocalString(key, fallbackObjectStr);

    const localObject = JSON.parse(localObjectStr);

    return localObject;
  } catch (error) {
    return fallbackObject;
  }
}

function resolveState(newState, handleLoad, handleSave) {
  const toLoad =
    newState === null || newState === undefined || newState === 'undefined';
  if (toLoad) {
    return handleLoad();
  }

  handleSave();

  return newState;
}

function buildPlayerContainer(playerContainerClass) {
  const playerContainer = document.createElement('div');

  playerContainer.classList.add(playerContainerClass);
  playerContainer.classList.add('hidden');

  return playerContainer;
}

function buildPreviewContainer(previewContainerClass) {
  const dialog = document.createElement('dialog');

  dialog.classList.add(previewContainerClass);
  dialog.addEventListener('click', ({ target }) => {
    if (target === dialog) {
      dialog.close();
    }
  });

  return dialog;
}

function buildChatImagesHoloPeekItem({
  itemId,
  itemLabel,
  itemDescription,

  holoPeekItemBodyClass,
  holoPeekItemSelectClass,
  holoPeekItemTextAreaClass,

  modes,
  initialMode,
  modeHandler,

  nsfwInitialToggleValue,
  nsfwToggleHandler,

  ddgToggleLabel,
  ddgToggleDescription,
  ddgInitialToggleValue,
  ddgToggleHandler,
  ddgWhitelistLabel,
  ddgWhitelistDescription,
  ddgInitialWhitelist,
  ddgWhitelistHandler,
  ddgBlacklistLabel,
  ddgBlacklistDescription,
  ddgInitialBlacklist,
  ddgBlacklistHandler,

  metadataToggleLabel,
  metadataToggleDescription,
  metadataInitialToggleValue,
  metadataToggleHandler,
  metadataWhitelistLabel,
  metadataWhitelistDescription,
  metadataInitialWhitelist,
  metadataWhitelistHandler,
  metadataBlacklistLabel,
  metadataBlacklistDescription,
  metadataInitialBlacklist,
  metadataBlacklistHandler,
}) {
  const rootNode = document.createElement('div');
  rootNode.id = itemId;

  // Header
  const headerId = `${itemId}-${crypto.randomUUID()}`;
  const labelNode = document.createElement('label');
  labelNode.htmlFor = headerId;
  labelNode.title = itemDescription;
  labelNode.textContent = itemLabel;
  labelNode.classList.add('pointer');
  rootNode.appendChild(labelNode);

  // Modes
  const selectNode = document.createElement('select');
  selectNode.id = headerId;
  selectNode.classList.add(holoPeekItemSelectClass);
  selectNode.addEventListener('change', modeHandler);
  rootNode.appendChild(selectNode);

  for (const [modeName, modeDescription] of modes) {
    const optionNode = document.createElement('option');

    optionNode.value = modeName;
    optionNode.text = modeName;
    optionNode.title = modeDescription;

    if (modeName === initialMode) {
      optionNode.selected = true;
    }

    selectNode.appendChild(optionNode);
  }

  // Additional settings
  const bodyNode = document.createElement('div');
  bodyNode.classList.add('hidden');
  bodyNode.classList.add(holoPeekItemBodyClass);
  rootNode.appendChild(bodyNode);

  const bodyToggle = document.createElement('span');
  bodyToggle.textContent = ' ';
  bodyToggle.title = 'Additional settings';
  bodyToggle.classList.add(
    'glyphicon',
    'glyphicon-chevron-right',
    'pull-left',
    'pointer',
  );
  bodyToggle.addEventListener('click', () => {
    bodyToggle.classList.toggle('glyphicon-chevron-right');
    bodyToggle.classList.toggle('glyphicon-chevron-down');

    bodyNode.classList.toggle('hidden');
  });
  rootNode.prepend(bodyToggle);

  labelNode.addEventListener('click', () => {
    bodyToggle.click();
  });

  // NSFW
  const nsfwId = `${itemId}-${crypto.randomUUID()}`;
  const nsfwHeader = document.createElement('div');
  bodyNode.appendChild(nsfwHeader);

  const nsfwToggle = document.createElement('input');
  nsfwToggle.id = nsfwId;
  nsfwToggle.type = 'checkbox';
  nsfwToggle.checked = nsfwInitialToggleValue;
  nsfwToggle.classList.add('pointer');
  nsfwToggle.addEventListener('change', nsfwToggleHandler);
  nsfwHeader.appendChild(nsfwToggle);

  const nsfwLabel = document.createElement('label');
  nsfwLabel.htmlFor = nsfwId;
  nsfwLabel.title = 'Use NSFW image filter';
  nsfwLabel.textContent = 'NSFW filter';
  nsfwLabel.classList.add('pointer');
  nsfwHeader.appendChild(nsfwLabel);

  // DDG
  const ddgId = `${itemId}-${crypto.randomUUID()}`;
  const ddgHeader = document.createElement('div');
  bodyNode.appendChild(ddgHeader);

  const ddgToggle = document.createElement('input');
  ddgToggle.id = ddgId;
  ddgToggle.type = 'checkbox';
  ddgToggle.checked = ddgInitialToggleValue;
  ddgToggle.classList.add('pointer');
  ddgHeader.appendChild(ddgToggle);

  const ddgLabel = document.createElement('label');
  ddgLabel.htmlFor = ddgId;
  ddgLabel.title = ddgToggleDescription;
  ddgLabel.textContent = ddgToggleLabel;
  ddgLabel.classList.add('pointer');
  ddgHeader.appendChild(ddgLabel);

  const ddgWhitelistHeader = document.createElement('label');
  ddgWhitelistHeader.title = ddgWhitelistDescription;
  ddgWhitelistHeader.textContent = ddgWhitelistLabel;
  bodyNode.appendChild(ddgWhitelistHeader);

  const ddgWhitelist = document.createElement('textarea');
  ddgWhitelist.title = ddgWhitelistDescription;
  ddgWhitelist.value = ddgInitialWhitelist;
  ddgWhitelist.placeholder = 'Allow all domains';
  ddgWhitelist.classList.add(holoPeekItemTextAreaClass);
  ddgWhitelist.addEventListener('change', ddgWhitelistHandler);
  ddgWhitelist.addEventListener('change', e => {
    ddgWhitelist.value = cleanupString(e.target.value);
  });
  bodyNode.appendChild(ddgWhitelist);

  const ddgBlacklistHeader = document.createElement('label');
  ddgBlacklistHeader.title = ddgBlacklistDescription;
  ddgBlacklistHeader.textContent = ddgBlacklistLabel;
  bodyNode.appendChild(ddgBlacklistHeader);

  const ddgBlacklist = document.createElement('textarea');
  ddgBlacklist.title = ddgBlacklistDescription;
  ddgBlacklist.value = ddgInitialBlacklist;
  ddgBlacklist.placeholder = 'No domains blocked';
  ddgBlacklist.classList.add(holoPeekItemTextAreaClass);
  ddgBlacklist.addEventListener('change', ddgBlacklistHandler);
  ddgBlacklist.addEventListener('change', e => {
    ddgBlacklist.value = cleanupString(e.target.value);
  });
  bodyNode.appendChild(ddgBlacklist);

  ddgToggle.addEventListener('change', event => {
    ddgToggleHandler(event);

    ddgWhitelistHeader.classList.toggle('hidden');
    ddgBlacklistHeader.classList.toggle('hidden');

    ddgWhitelist.classList.toggle('hidden');
    ddgBlacklist.classList.toggle('hidden');
  });

  if (!ddgInitialToggleValue) {
    ddgWhitelistHeader.classList.add('hidden');
    ddgBlacklistHeader.classList.add('hidden');

    ddgWhitelist.classList.add('hidden');
    ddgBlacklist.classList.add('hidden');
  }

  // Metadata
  const metadataId = `${itemId}-${crypto.randomUUID()}`;
  const metadataHeader = document.createElement('div');
  bodyNode.appendChild(metadataHeader);

  const metadataToggle = document.createElement('input');
  metadataToggle.id = metadataId;
  metadataToggle.type = 'checkbox';
  metadataToggle.checked = metadataInitialToggleValue;
  metadataToggle.classList.add('pointer');
  metadataHeader.appendChild(metadataToggle);

  const metadataLabel = document.createElement('label');
  metadataLabel.htmlFor = metadataId;
  metadataLabel.title = metadataToggleDescription;
  metadataLabel.textContent = metadataToggleLabel;
  metadataLabel.classList.add('pointer');
  metadataHeader.appendChild(metadataLabel);

  const metadataWhitelistHeader = document.createElement('label');
  metadataWhitelistHeader.title = metadataWhitelistDescription;
  metadataWhitelistHeader.textContent = metadataWhitelistLabel;
  bodyNode.appendChild(metadataWhitelistHeader);

  const metadataWhitelist = document.createElement('textarea');
  metadataWhitelist.title = metadataWhitelistDescription;
  metadataWhitelist.value = metadataInitialWhitelist;
  metadataWhitelist.placeholder = 'Allow all domains';
  metadataWhitelist.classList.add(holoPeekItemTextAreaClass);
  metadataWhitelist.addEventListener('change', metadataWhitelistHandler);
  metadataWhitelist.addEventListener('change', e => {
    metadataWhitelist.value = cleanupString(e.target.value);
  });
  bodyNode.appendChild(metadataWhitelist);

  const metadataBlacklistHeader = document.createElement('label');
  metadataBlacklistHeader.title = metadataBlacklistDescription;
  metadataBlacklistHeader.textContent = metadataBlacklistLabel;
  bodyNode.appendChild(metadataBlacklistHeader);

  const metadataBlacklist = document.createElement('textarea');
  metadataBlacklist.title = metadataBlacklistDescription;
  metadataBlacklist.value = metadataInitialBlacklist;
  metadataBlacklist.placeholder = 'No domains blocked';
  metadataBlacklist.classList.add(holoPeekItemTextAreaClass);
  metadataBlacklist.addEventListener('change', metadataBlacklistHandler);
  metadataBlacklist.addEventListener('change', e => {
    metadataBlacklist.value = cleanupString(e.target.value);
  });
  bodyNode.appendChild(metadataBlacklist);

  metadataToggle.addEventListener('change', event => {
    metadataToggleHandler(event);

    metadataWhitelistHeader.classList.toggle('hidden');
    metadataBlacklistHeader.classList.toggle('hidden');

    metadataWhitelist.classList.toggle('hidden');
    metadataBlacklist.classList.toggle('hidden');
  });

  if (!metadataInitialToggleValue) {
    metadataWhitelistHeader.classList.add('hidden');
    metadataBlacklistHeader.classList.add('hidden');

    metadataWhitelist.classList.add('hidden');
    metadataBlacklist.classList.add('hidden');
  }

  return rootNode;
}

function buildChatImagesStyles({
  chatImagesStylesId,
  chatLinkParsedClass,

  nsfwImageClass,
  nsfwBlurPxSize,

  imgLinkColor,
  imgLinkErrorClass,
  imgLinkLoadingColor,
  imgLinkLoadedColor,
  imgLinkClass,
  imgLinkErrorColor,
  imgLinkLoadingClass,
  imgLinkLoadedClass,

  imgPopupPxMaxWidth,
  imgPopupPxMaxHeight,

  chatPopupImageClass,
  chatInlineImageClass,
  chatPlayerImageClass,
  chatPreviewImageClass,

  playerContainerClass,
  previewContainerClass,

  holoPeekItemBodyClass,
  holoPeekItemSelectClass,
  holoPeekItemTextAreaClass,
}) {
  const styles = document.createElement('style');
  styles.id = chatImagesStylesId;

  styles.innerHTML = `
    #messagebuffer a.${chatLinkParsedClass} {
      transition: color 0.25s ease-out;
    }
    #messagebuffer a.${chatLinkParsedClass}.${imgLinkErrorClass} {
      color: ${imgLinkErrorColor};
      text-decoration: line-through;
    }
    #messagebuffer a.${chatLinkParsedClass}.${imgLinkClass} {
      color: ${imgLinkColor};
    }
    #messagebuffer a.${chatLinkParsedClass}.${imgLinkLoadingClass} {
      color: ${imgLinkLoadingColor};
      cursor: wait;
    }
    #messagebuffer a.${chatLinkParsedClass}.${imgLinkLoadedClass} {
      color: ${imgLinkLoadedColor};
    }

    .${chatPopupImageClass} {
      max-width: ${imgPopupPxMaxWidth}px;
      max-height: ${imgPopupPxMaxHeight}px;
      z-index: 691488;
      position: fixed;

      top: 0;
      left: 0;
      transition: top 0.1s ease-out,  left 0.1s ease-out;
    }
    .${chatInlineImageClass} {
      max-width: 300px;
      max-height: 100px;
      position: relative;
      cursor: zoom-in;
    }

    .${holoPeekItemBodyClass} {
      display: flex;
      align-items: start;
      flex-direction: column;

      background-color: #ffebcd;
      padding: 16px;
    }
    
    .${holoPeekItemSelectClass} {
      color: #888;
    }
    
    .${holoPeekItemTextAreaClass} {
      width: 95%;
      overflow: auto;
      resize: vertical;
      min-height: 64px;
      max-height: 128px;
    }
    
    .${chatPlayerImageClass} {
      width: 100%;
      height: 100%;
      position: absolute;
      object-fit: contain;
    }

    .${playerContainerClass} {
      background-color: transparent;
      position: relative;
      padding-bottom: 56.25%;
    }

    .${chatPreviewImageClass} {
      max-height: 80vh;
      max-width: 80vw;
      cursor: zoom-out;
    }
    
    .${previewContainerClass} {
      border: none;
      outline-width: 0;
      background-color: transparent;
    }

    .${previewContainerClass}::backdrop {
      background-color: rgba(0, 0, 0, 0.75);
      cursor: zoom-out;
    }

    .${nsfwImageClass} {
      filter: blur(${nsfwBlurPxSize}px);

      transition: filter 0.15s ease-out;
    }

    .${nsfwImageClass}:focus, .${nsfwImageClass}:hover {
      filter: blur(0px);
    }
  `;

  return styles;
}

function createNewNodeObserver(newNodeHandler) {
  return new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        newNodeHandler(addedNode);
      }
    }
  });
}

function startChatImages(abortSignal) {
  const id = 'chatImages';
  const label = '🖼️ Chat Images:';
  const description = 'Display chat images';
  const chatImagesStylesId = id + '-styles';
  const imgFileExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const imgPopupPxOffsetX = 32;
  const imgPopupPxOffsetY = 32;
  const imgPopupPxMaxWidth = 320;
  const imgPopupPxMaxHeight = 180;
  const nsfwBlurPxSize = 8;
  const imgLinkColor = '#ffe4c4';
  const imgLinkErrorColor = '#ffb6c1';
  const imgLinkLoadingColor = '#8fbc8f';
  const imgLinkLoadedColor = '#98fb98';
  const nsfwImageClass = 'nsfwImageClass';
  const imgLinkClass = 'imgLinkClass';
  const imgLinkErrorClass = 'imgLinkErrorClass';
  const imgLinkLoadingClass = 'imgLinkLoadingClass';
  const imgLinkLoadedClass = 'imgLinkLoadedClass';
  const imgLinkHoverClass = 'imgLinkHoverClass';
  const imgContainerClass = 'imgContainerClass';
  const chatLinkParsedClass = 'chatLinkParsedClass';
  const chatPopupImageClass = 'chatPopupImageClass';
  const chatInlineImageClass = 'chatInlineImageClass';
  const chatPlayerImageClass = 'chatPlayerImageClass';
  const chatPreviewImageClass = 'chatPreviewImageClass';
  const playerContainerClass = 'playerContainerClass';
  const previewContainerClass = 'previewContainerClass';
  const holoPeekItemBodyClass = 'holoPeekItemBodyClass';
  const holoPeekItemSelectClass = 'holoPeekItemSelectClass';
  const holoPeekItemTextAreaClass = 'holoPeekItemTextAreaClass';
  const holoPeekId = 'holopeek';
  const holoPeekContainerId = 'holoPeekItemsContainer';
  const modeId = id + '-mode';
  const noneMode = 'none';
  const inlineMode = 'inline';
  const popupMode = 'popup';
  const playerMode = 'player';
  const defaultMode = noneMode;
  const modes = new Map([
    [noneMode, 'Disable chat images'],
    [inlineMode, 'Auto load image links and replace them with inline images'],
    [popupMode, 'Load image link on hover with a popup image preview'],
    [
      playerMode,
      'Load image link on hover and display it above the video player',
    ],
  ]);
  const initialMode = loadLocalString(modeId, defaultMode);
  const nsfwToggleValueId = id + '-nsfw-toggle-value';
  const nsfwDefaultToggleValue = false;
  const nsfwInitialToggleValue = loadLocalBool(
    nsfwToggleValueId,
    nsfwDefaultToggleValue,
  );
  const ddgProxyPrefix = 'https://proxy.duckduckgo.com/iu/?u=';
  const ddgToggleValueId = id + '-ddg-toggle-value';
  const ddgDefaultToggleValue = false;
  const ddgInitialToggleValue = loadLocalBool(
    ddgToggleValueId,
    ddgDefaultToggleValue,
  );
  const ddgToggleLabel = 'Duckduckgo proxy 🦆';
  const ddgToggleDescription = 'Use Duckduckgo image proxy';
  const ddgWhitelistId = id + '-ddg-whitelist';
  const ddgDefaultWhitelist = [];
  const ddgInitialWhitelist = loadLocalObject(
    ddgWhitelistId,
    ddgDefaultWhitelist,
  );
  const ddgWhitelistLabel = 'Duckduckgo Whitelist 📗';
  const ddgWhitelistDescription =
    'Duckduckgo image proxy Whitelist (one item per line)';
  const ddgBlacklistId = id + '-ddg-blacklist';
  const ddgDefaultBlacklist = [
    'https://cdn.discordapp.com/attachments', // 404 error
    'https://snipboard.io/', // 404 error
    'https://gachi.gay', // CORS error
  ];
  const ddgInitialBlacklist = loadLocalObject(
    ddgBlacklistId,
    ddgDefaultBlacklist,
  );
  const ddgBlacklistLabel = 'Duckduckgo Blacklist 📕';
  const ddgBlacklistDescription =
    'Duckduckgo image proxy Blacklist (one item per line)';
  const metadataToggleValueId = id + '-metadata-toggle-value';
  const metadataDefaultToggleValue = false;
  const metadataInitialToggleValue = loadLocalBool(
    metadataToggleValueId,
    metadataDefaultToggleValue,
  );
  const metadataToggleLabel = 'Fetch metadata 🌐';
  const metadataToggleDescription =
    'Fetch link metadata if link has no file extension';
  const metadataWhitelistId = id + '-metadata-whitelist';
  const metadataDefaultWhitelist = [
    'https://pbs.twimg.com/media', // No file extension
    'https://gachi.gay', // No file extension
    'https://x0.at/', // No file extension
  ];
  const metadataInitialWhitelist = loadLocalObject(
    metadataWhitelistId,
    metadataDefaultWhitelist,
  );
  const metadataWhitelistLabel = 'Metadata Whitelist 📗';
  const metadataWhitelistDescription =
    'Metadata fetch Whitelist (one item per line)';
  const metadataBlacklistId = id + '-metadata-blacklist';
  const metadataDefaultBlacklist = [];
  const metadataInitialBlacklist = loadLocalObject(
    metadataBlacklistId,
    metadataDefaultBlacklist,
  );
  const metadataBlacklistLabel = 'Metadata Blacklist 📕';
  const metadataBlacklistDescription =
    'Metadata fetch Blacklist (one item per line)';

  const cleanupTasks = [];
  const defaultLinkConverters = [];
  const defaultLinkValidators = [createImageLinkRegExpValidator(imgFileExts)];
  const previewContainer = buildPreviewContainer(previewContainerClass);
  const previewImage = createPreviewImage(
    createDefaultImage(),
    chatPreviewImageClass,
  );
  const playerContainer = buildPlayerContainer(playerContainerClass);
  const playerImage = createChatPlayerImage(
    createDefaultImage(),
    chatPlayerImageClass,
  );
  const popupImage = createChatPopupImage(
    createDefaultImage(),
    chatPopupImageClass,
  );

  function cleanupItem() {
    while (cleanupTasks.length > 0) {
      const cleanupTask = cleanupTasks.pop();

      cleanupTask();
    }
  }

  function stopItem(msgBufObs) {
    msgBufObs.disconnect();

    const msgBuf = document.getElementById('messagebuffer');
    if (!msgBuf) {
      return;
    }

    handleChatBuffer(msgBuf, linkNode =>
      restoreChatMessageImageLink({
        linkNode,

        chatLinkParsedClass,

        imgLinkClass,
        imgLinkErrorClass,
        imgLinkLoadingClass,
        imgLinkLoadedClass,
        imgContainerClass,
        imgLinkHoverClass,
      }),
    );
  }

  function startItem(linkNodeHandler) {
    cleanupItem();

    const msgBuf = document.getElementById('messagebuffer');
    if (!msgBuf) {
      return;
    }

    handleChatBuffer(msgBuf, linkNode =>
      handleChatMessageLinkNode(linkNode, chatLinkParsedClass, linkNodeHandler),
    );

    const msgBufObs = createNewNodeObserver(newMsgNode => {
      handleChatMessage(newMsgNode, linkNode =>
        handleChatMessageLinkNode(
          linkNode,
          chatLinkParsedClass,
          linkNodeHandler,
        ),
      );
    });

    msgBufObs.observe(msgBuf, { childList: true });

    const cleanupTask = () => stopItem(msgBufObs);

    cleanupTasks.push(cleanupTask);
  }

  function handleNewState({
    newMode = null,
    newNsfwToggleValue = null,
    newDdgToggleValue = null,
    newDdgWhitelist = null,
    newDdgBlacklist = null,
    newMetadataToggleValue = null,
    newMetadataWhitelist = null,
    newMetadataBlacklist = null,
  }) {
    const mode = resolveState(
      newMode,
      () => loadLocalString(modeId, defaultMode),
      () => saveLocalValue(modeId, newMode),
    );
    const nsfwToggleValue = resolveState(
      newNsfwToggleValue,
      () => loadLocalBool(nsfwToggleValueId, nsfwDefaultToggleValue),
      () => saveLocalBool(nsfwToggleValueId, newNsfwToggleValue),
    );
    const ddgToggleValue = resolveState(
      newDdgToggleValue,
      () => loadLocalBool(ddgToggleValueId, ddgDefaultToggleValue),
      () => saveLocalBool(ddgToggleValueId, newDdgToggleValue),
    );
    const ddgWhitelist = resolveState(
      newDdgWhitelist,
      () => loadLocalObject(ddgWhitelistId, ddgDefaultWhitelist),
      () => saveLocalObject(ddgWhitelistId, newDdgWhitelist),
    );
    const ddgBlacklist = resolveState(
      newDdgBlacklist,
      () => loadLocalObject(ddgBlacklistId, ddgDefaultBlacklist),
      () => saveLocalObject(ddgBlacklistId, newDdgBlacklist),
    );
    const metadataToggleValue = resolveState(
      newMetadataToggleValue,
      () => loadLocalBool(metadataToggleValueId, metadataDefaultToggleValue),
      () => saveLocalBool(metadataToggleValueId, newMetadataToggleValue),
    );
    const metadataWhitelist = resolveState(
      newMetadataWhitelist,
      () => loadLocalObject(metadataWhitelistId, metadataDefaultWhitelist),
      () => saveLocalObject(metadataWhitelistId, newMetadataWhitelist),
    );
    const metadataBlacklist = resolveState(
      newMetadataBlacklist,
      () => loadLocalObject(metadataBlacklistId, metadataDefaultBlacklist),
      () => saveLocalObject(metadataBlacklistId, newMetadataBlacklist),
    );

    const linkConverters = [...defaultLinkConverters];
    if (ddgToggleValue) {
      linkConverters.push(
        createDdgConverter(ddgProxyPrefix, ddgWhitelist, ddgBlacklist),
      );
    }

    const linkValidators = [...defaultLinkValidators];
    if (metadataToggleValue) {
      linkValidators.push(
        createImageLinkMetadataValidator(metadataWhitelist, metadataBlacklist),
      );
    }

    switch (mode) {
      case noneMode:
        cleanupItem();
        break;
      case inlineMode:
        startItem(linkNode =>
          inlineChatImageLinkHandler({
            linkNode,
            linkValidator: link => validateItem(link, linkValidators),
            linkConverter: link => convertItem(link, linkConverters),

            imgContainerClass,
            imgLinkErrorClass,
            imgLinkLoadingClass,
            imgLinkLoadedClass,

            chatInlineImageClass,

            previewImage,
            previewContainer,

            nsfwToggleValue,
            nsfwImageClass,
          }),
        );
        break;
      case popupMode:
        startItem(linkNode =>
          popupChatImageLinkHandler({
            linkNode,
            linkValidator: link => validateItem(link, linkValidators),
            linkConverter: link => convertItem(link, linkConverters),

            popupImage,

            imgLinkHoverClass,
            imgLinkClass,
            imgLinkErrorClass,
            imgLinkLoadingClass,
            imgLinkLoadedClass,

            offsetX: imgPopupPxOffsetX,
            offsetY: imgPopupPxOffsetY,

            maxWidth: imgPopupPxMaxWidth,
            maxHeight: imgPopupPxMaxHeight,

            nsfwToggleValue,
            nsfwImageClass,
          }),
        );
        break;
      case playerMode:
        startItem(linkNode =>
          playerChatImageLinkHandler({
            linkNode,
            linkValidator: link => validateItem(link, linkValidators),
            linkConverter: link => convertItem(link, linkConverters),

            playerImage,
            playerContainer,

            imgLinkHoverClass,
            imgLinkClass,
            imgLinkErrorClass,
            imgLinkLoadingClass,
            imgLinkLoadedClass,

            nsfwToggleValue,
            nsfwImageClass,
          }),
        );
        break;
    }

    popupImage.src = '';
    popupImage.alt = '';
    popupImage.title = '';
  }

  function addItem(container) {
    const holoPeekItem = buildChatImagesHoloPeekItem({
      itemId: id,
      itemLabel: label,
      itemDescription: description,

      holoPeekItemBodyClass,
      holoPeekItemSelectClass,
      holoPeekItemTextAreaClass,

      modes,
      initialMode,
      modeHandler: event => handleNewState({ newMode: event.target.value }),

      nsfwInitialToggleValue,
      nsfwToggleHandler: event =>
        handleNewState({ newNsfwToggleValue: event.target.checked }),

      ddgToggleLabel,
      ddgToggleDescription,
      ddgInitialToggleValue,
      ddgToggleHandler: event =>
        handleNewState({ newDdgToggleValue: event.target.checked }),
      ddgWhitelistLabel,
      ddgWhitelistDescription,
      ddgInitialWhitelist: convertArrToStr(
        cleanupStringArray(ddgInitialWhitelist),
      ),
      ddgWhitelistHandler: event =>
        handleNewState({
          newDdgWhitelist: cleanupStringArray(
            convertStrToArr(event.target.value),
          ),
        }),
      ddgBlacklistLabel,
      ddgBlacklistDescription,
      ddgInitialBlacklist: convertArrToStr(
        cleanupStringArray(ddgInitialBlacklist),
      ),
      ddgBlacklistHandler: event =>
        handleNewState({
          newDdgBlacklist: cleanupStringArray(
            convertStrToArr(event.target.value),
          ),
        }),

      metadataToggleLabel,
      metadataToggleDescription,
      metadataInitialToggleValue,
      metadataToggleHandler: event =>
        handleNewState({ newMetadataToggleValue: event.target.checked }),
      metadataWhitelistLabel,
      metadataWhitelistDescription,
      metadataInitialWhitelist: convertArrToStr(
        cleanupStringArray(metadataInitialWhitelist),
      ),
      metadataWhitelistHandler: event =>
        handleNewState({
          newMetadataWhitelist: cleanupStringArray(
            convertStrToArr(event.target.value),
          ),
        }),
      metadataBlacklistLabel,
      metadataBlacklistDescription,
      metadataInitialBlacklist: convertArrToStr(
        cleanupStringArray(metadataInitialBlacklist),
      ),
      metadataBlacklistHandler: event =>
        handleNewState({
          newMetadataBlacklist: cleanupStringArray(
            convertStrToArr(event.target.value),
          ),
        }),
    });

    const styles = buildChatImagesStyles({
      chatImagesStylesId,
      chatLinkParsedClass,

      nsfwImageClass,
      nsfwBlurPxSize,

      imgLinkColor,
      imgLinkErrorClass,
      imgLinkLoadingColor,
      imgLinkLoadedColor,
      imgLinkClass,
      imgLinkErrorColor,
      imgLinkLoadingClass,
      imgLinkLoadedClass,

      imgPopupPxMaxWidth,
      imgPopupPxMaxHeight,

      chatPopupImageClass,
      chatInlineImageClass,
      chatPlayerImageClass,
      chatPreviewImageClass,

      playerContainerClass,
      previewContainerClass,

      holoPeekItemBodyClass,
      holoPeekItemSelectClass,
      holoPeekItemTextAreaClass,
    });

    container.prepend(holoPeekItem);
    document.head.appendChild(styles);
    document.body.appendChild(popupImage);
    document.body.appendChild(previewContainer);
    previewContainer.appendChild(previewImage);

    previewImage.addEventListener('click', () => previewContainer.close());

    const videowrap = document.getElementById('videowrap');
    if (!videowrap) {
      return;
    }

    playerContainer.appendChild(playerImage);
    videowrap.prepend(playerContainer);
  }

  function destroyItem() {
    cleanupItem();

    const holoPeekItem = document.getElementById(id);
    if (holoPeekItem) {
      holoPeekItem.remove();
    }

    const styles = document.getElementById(chatImagesStylesId);
    if (styles) {
      styles.remove();
    }

    popupImage.remove();
    playerImage.remove();
    previewImage.remove();
    previewContainer.remove();
    playerContainer.remove();
  }

  function initItem(container) {
    addItem(container);

    handleNewState({ newMode: initialMode });

    handleNewState({ newNsfwToggleValue: nsfwInitialToggleValue });

    handleNewState({ newDdgToggleValue: ddgInitialToggleValue });
    handleNewState({ newDdgWhitelist: ddgInitialWhitelist });
    handleNewState({ newDdgBlacklist: ddgInitialBlacklist });

    handleNewState({ newMetadataToggleValue: metadataInitialToggleValue });
    handleNewState({ newMetadataWhitelist: metadataInitialWhitelist });
    handleNewState({ newMetadataBlacklist: metadataInitialBlacklist });

    if (!abortSignal) {
      return;
    }

    abortSignal.addEventListener('abort', destroyItem);
  }

  function tryInitItem(holoPeekContainerId) {
    const holoPeekContainer = document.getElementById(holoPeekContainerId);
    if (holoPeekContainer) {
      initItem(holoPeekContainer);

      return true;
    }

    return false;
  }

  const hasInitialized = tryInitItem(holoPeekContainerId);
  if (hasInitialized) {
    return destroyItem;
  }

  const bodyObs = createNewNodeObserver(newNode => {
    if (newNode.id !== holoPeekId) {
      return;
    }

    const hasInitialized = tryInitItem(holoPeekContainerId, initialMode);
    if (!hasInitialized) {
      return;
    }

    bodyObs.disconnect();
  });

  bodyObs.observe(document.body, { childList: true });

  return destroyItem;
}

// Entrypoint
startChatImages();
// OR
// const controller = new AbortController();
// startChatImages(controller);
// controller.abort()
// OR
// const stopChatImages = startChatImages();
// stopChatImages();
