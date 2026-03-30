const validOptionTypes = Object.freeze({
    TEXTAREA: 'textarea',
    RANGE: 'range', 
    TEXT: 'text', 
    DROPDOWN: 'dropdown'
});
let $holoPeekBubble;
let $holoPeekButton;
let $holoPeekImage;
let holoPeekItems = [];
const holoPeekGroups = {};
const $holoPeekItemsContainer = $('<div>').attr('id', 'holoPeekItemsContainer');
let holoPeekSizePx = 60;
let holoPeekImgUrl = 'https://mikobotecdn.win/emotes/baepeek.png';

function setupOnClickForHoloPeek($holoPeekButton, $holoPeekBubble) {
    $holoPeekButton.on('click.holoPeek', (event) => {
        if ($(event.target).is($holoPeekButton)) {
            $(this).toggleClass('holoAnim');
            $holoPeekBubble.toggle();
            $(document).off('click.holoPeekRemove');
        } 

        event.stopPropagation();

        $(document).one('click.holoPeekRemove', (event) => {
            if ($(event.target).not($holoPeekButton)) {
                $holoPeekBubble.hide();
            }
        })
    });
}

function loadStoredValueForHolopeek(holoPeekItem) {
    let localStorageValue = localStorage.getItem(holoPeekItem.id);
    if (localStorageValue !== null) {
        if (holoPeekItem.inputElement) {
            holoPeekItem.value = localStorageValue;
            holoPeekItem.inputElement.val(holoPeekItem.value);
        }

        if (holoPeekItem.alwaysEnabled) {
            holoPeekItem.checkbox.prop('checked', true);
            if (holoPeekItem.optionFunc) {
                holoPeekItem.optionFunc(holoPeekItem);
            }
            return;
        }

        holoPeekItem.checkbox.prop('checked', true);
        holoPeekItem.checkbox.triggerHandler('click');
        return;
    }

    if (holoPeekItem.alwaysEnabled) {
        holoPeekItem.checkbox.prop('checked', true);
        if (holoPeekItem.inputElement && holoPeekItem.value != null) {
            holoPeekItem.inputElement.val(holoPeekItem.value);
        }
        if (holoPeekItem.optionFunc) {
            holoPeekItem.optionFunc(holoPeekItem);
        }
    }
}

//Candidate for util.js
export function setupAnimationForHoloPeekImg($holoPeekImage, imageUrl) {
    const imgObj = new Image();
    imgObj.src = imageUrl;
    imgObj.decode().then(() => {
        let scaledHeight = scaledHeightForImageConstraint(holoPeekSizePx, imgObj.width, imgObj.height);
        //Jquery 1.14 doesn't have support for -- variables
        $holoPeekImage[0].style.setProperty('--holoPeek-img-y-offset', `${scaledHeight}px`);
    });  
}


function scaledHeightForImageConstraint(constraintSquareSize, imageWidth, imageHeight) {
    let imageRatio = imageWidth/imageHeight;
    let newHeight = constraintSquareSize/imageRatio;
    return newHeight;
}

function appendHoloPeekToDOM() {
    $holoPeekButton = $('<button>', {
        id: 'holopeek', 
        css: {
            "width": `${holoPeekSizePx}px`,
            "height": `${holoPeekSizePx}px`
        }
    });

    $holoPeekImage = $('<div>', {
        id: 'holopeek_img',
        css: {
            'background-image': `url(${holoPeekImgUrl})`,
        }
    });

    setupAnimationForHoloPeekImg($holoPeekImage, holoPeekImgUrl)

    $('body').append($holoPeekButton);
    $holoPeekButton.append($holoPeekImage);

    $holoPeekBubble = $('<div>', {
        id: "holoPeekBubble"
    })
    $holoPeekBubble.hide();
    $($holoPeekButton).append($holoPeekBubble);

    setupOnClickForHoloPeek($holoPeekButton, $holoPeekBubble);
}

function buildHoloPeekFrame() {
    const optionsLegendParagraph = $('<p>').html('Options').css('text-align', 'center');
    $holoPeekBubble.append(optionsLegendParagraph);

    $holoPeekBubble.append($holoPeekItemsContainer);

    const localStorageButtonsDiv = $('<div>', {
        id: 'localStorageButtonsDiv'
    }).appendTo($holoPeekBubble);

    $('<button>', {
        id: 'saveButton',
        html: 'Save<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbUlEQVQ4y2NgGLTAk+Exw38csB6bhkc4lePQAhLGDsIZfmPTAtGAaTZOLfg0gLRguAC/BgaqacANqKuBjaGd4RkQtgNZRGnogPuggzgNT+EantJIA8lOItnTRAUr/uQNgo+Iz0Ag+JjBY9BmfgAjpbf/V5agRgAAAABJRU5ErkJggg==">',
        click: () => {
            holoPeekItems.forEach(holoPeekItem => {
                const optionName = holoPeekItem.id;
                if (holoPeekItem.checkbox.prop('checked')) {
                    let value = 1;
                    if (holoPeekItem.value) {
                        value = holoPeekItem.value
                    }
                    localStorage.setItem(optionName, value)
                } else {
                    localStorage.removeItem(optionName)
                }
            });
        }
    }).appendTo(localStorageButtonsDiv);

    $('<button>', {
        id: 'resetButton',
        html: 'Reset<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPElEQVQ4y2NgGAJAgeE+w38ovA/k4QH/8UDqaCADkGw+WRqIERvVMNQ1PMKaMB7h1uDB8BhD+WOg6OAGADZZd6fzGEl6AAAAAElFTkSuQmCC">',
        click: () => {
            if (confirm("Are you sure you want to reset all the options to their defaults? THIS WILL RELOAD THE PAGE")) {
                holoPeekItems.forEach(holoPeekItem => {
                    const optionName = holoPeekItem.id;
                    localStorage.removeItem(optionName)
                    location.reload();
                });
            }
        }
    }).appendTo(localStorageButtonsDiv);

}

export function createHoloPeekItem({optionName,
                            optionDescription,
                            optionFunc = null,
                            type = null,
                            defaultValue = null,
                            options = null,
                            alwaysEnabled = false,
                            hideCheckbox = false,
                            cleanupFunc = null,
                            group = null}) {
    let holoPeekItem = {}
    holoPeekItem.id             = optionName;
    holoPeekItem.description    = optionDescription;
    holoPeekItem.optionFunc     = optionFunc;
    holoPeekItem.cleanupFunc    = cleanupFunc
    holoPeekItem.group          = group;
    holoPeekItem.options        = options;
    holoPeekItem.alwaysEnabled  = alwaysEnabled;
    holoPeekItem.hideCheckbox   = hideCheckbox || alwaysEnabled;
    holoPeekItem.checkbox       = createCheckboxForItem(holoPeekItem);
    holoPeekItem.label          = createLabelForItem(holoPeekItem);
    holoPeekItem.cssData        = null;
    holoPeekItem.value          = defaultValue;

    let $holoPeekInputElement;
    switch (type) {
        case validOptionTypes.TEXTAREA: {
            $holoPeekInputElement = createTextAreaElement(holoPeekItem);
            break;
        } 
        case validOptionTypes.RANGE: {
            $holoPeekInputElement = createRangeElement(holoPeekItem);
            break;
        }
        case validOptionTypes.TEXT: {
            $holoPeekInputElement = createShortTextElement(holoPeekItem);
            break;
        }
        case validOptionTypes.DROPDOWN: {
            $holoPeekInputElement = createDropdownElement(holoPeekItem);
            break;
        }
    }

    holoPeekItem.inputElement   = $holoPeekInputElement;

    return holoPeekItem;
}

function createStyleForItem(holoPeekItem) {
    return $('<style>', {
        id: `${holoPeekItem.id}_style`,
        text: holoPeekItem.cssData
    })
}

function createCheckboxForItem(holoPeekItem) {
    return $('<input>', {
        id: holoPeekItem.id,
        type: 'checkbox',
        checked: Boolean(holoPeekItem.alwaysEnabled),
        click: (() => holoPeekCheckboxTrigger(holoPeekItem))
    })
}

//Uncle Bob would be proud. I'm unsure if that's a good thing.
function removeDuplicateStyles(holoPeekItem) {
    if (holoPeekItem.style) {
        holoPeekItem.style.remove();
    }
}

function holoPeekCheckboxTrigger(holoPeekItem) {
    if (holoPeekItem.checkbox.prop('checked')) {
        if (holoPeekItem.optionFunc) {
            holoPeekItem.optionFunc(holoPeekItem);
        }
        if (holoPeekItem.cssData) {
            removeDuplicateStyles(holoPeekItem);
            holoPeekItem.style = createStyleForItem(holoPeekItem)
            holoPeekItem.style.appendTo('head');
        }
    } else {
        if (holoPeekItem.cleanupFunc) {
            holoPeekItem.cleanupFunc(holoPeekItem)
        }
        holoPeekItem.cssData = null;
        removeDuplicateStyles(holoPeekItem);
    }
}

function createLabelForItem(holoPeekItem) {
    return $('<label>', {
            id: `${holoPeekItem.id}_label`,
            text: holoPeekItem.description,
            title: holoPeekItem.id,
            //what the helly is this
            for: holoPeekItem.id
        })
}

function createShortTextElement(holoPeekItem) {
    return $('<input>', {
        id: `${holoPeekItem.id}_text`,
        type: 'text',
        val: holoPeekItem.value,
        on: {
            input: (event) => {
                holoPeekItem.checkbox.prop('checked', false);
                holoPeekItem.checkbox.triggerHandler('click');
                holoPeekItem.value = event.target.value;
            }
        }
    })
}

function createDropdownElement(holoPeekItem) {
    const $selectElement = $('<select>', {
        id: `${holoPeekItem.id}_dropdown`,
        on: {
            change: (event) => {
                holoPeekItem.value = event.target.value;
                if (holoPeekItem.alwaysEnabled) {
                    if (holoPeekItem.optionFunc) {
                        holoPeekItem.optionFunc(holoPeekItem);
                    }
                    return;
                }

                holoPeekItem.checkbox.prop('checked', false);
                holoPeekItem.checkbox.triggerHandler('click');
            }
        }
    });

    (holoPeekItem.options || []).forEach((optionConfig) => {
        $('<option>', {
            value: optionConfig.value,
            text: optionConfig.label
        }).appendTo($selectElement);
    });

    if (holoPeekItem.value != null) {
        $selectElement.val(holoPeekItem.value);
    }

    return $selectElement;
}

function createTextAreaElement(holoPeekItem) {
    return $('<textarea>', {
        id: `${holoPeekItem.id}_textarea`,
        val: holoPeekItem.value,
        on: {
            input: (event) => {
                holoPeekItem.checkbox.prop('checked', false);
                holoPeekItem.checkbox.triggerHandler('click');
                holoPeekItem.value = event.target.value;
            }
        }
    })
}

function createRangeElement(holoPeekItem) {
    return $('<input>', 
    {
        id: `${holoPeekItem.id}_range`,
        type: 'range',
        css: { display: 'inline-block' },
        on: {
            input: function(event) {
                holoPeekItem.value = event.currentTarget.value;
                holoPeekCheckboxTrigger(holoPeekItem);
                }
            }
    })
}

function fetchHoloPeekGroupContainer(groupName, prepend = false) {
    if (!groupName) {
        return $holoPeekItemsContainer;
    }

    if (!holoPeekGroups[groupName]) {
        const $groupItemsContainer = $('<div>', {
            class: 'holoPeekGroupItems'
        }).hide();

        const $groupToggle = $('<button>', {
            class: 'holoPeekGroupToggle',
            type: 'button',
            text: groupName,
            click: () => $groupItemsContainer.toggle()
        });

        const $groupContainer = $('<div>', {
            class: 'holoPeekGroup'
        });

        $groupToggle.appendTo($groupContainer);
        $groupItemsContainer.appendTo($groupContainer);

        if (prepend) {
            $groupContainer.prependTo($holoPeekItemsContainer);
        } else {
            $groupContainer.appendTo($holoPeekItemsContainer);
        }

        holoPeekGroups[groupName] = $groupItemsContainer;
    }

    return holoPeekGroups[groupName];
}

export function addToHoloPeekContainer(holoPeekItem, prepend = false) {

    if (holoPeekItems.includes(holoPeekItem)) {
        return;
    }

    holoPeekItems.push(holoPeekItem);

    const $div = $('<div>')
    const $targetContainer = fetchHoloPeekGroupContainer(holoPeekItem.group, prepend);
    if (prepend) {
        $div.prependTo($targetContainer);
    } else {
        $div.appendTo($targetContainer);
    }

    if (!holoPeekItem.hideCheckbox) {
        holoPeekItem.checkbox.appendTo($div);
    }

    holoPeekItem.label.appendTo($div);

    loadStoredValueForHolopeek(holoPeekItem);

    if (holoPeekItem.inputElement) {
        $div.after(holoPeekItem.inputElement)
    }
}

(async () => {
    appendHoloPeekToDOM();
    buildHoloPeekFrame();
    let defaultItemsURL = `${MODULES_FOLDER}holopeek/holoPeekItems.js`
    import(makeLiveCDNLink(defaultItemsURL)).then((data) => {
        for (const item of data.holoPeekObjects) {
            let newItem = createHoloPeekItem(item)
            addToHoloPeekContainer(newItem);
        }
    })
})();



