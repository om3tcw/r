var worthy = false,
    sync_timeout,
    secret_states = {
        pp: false,
        paindora: false,
        pomunium: false,
        millie: false,
    },
    pomu_mouse_down = false,
    held_keys = [],
    volume = 0.5,
    waiting_pomus = 0,
    buffered_pomus = [],
    pomus = [
        'pomu00.mp3',
        'pomu01.mp3',
        'pomu02.mp3',
        'pomu03.mp3',
        'pomu04.mp3',
        'pomu05.mp3',
        'pomu06.mp3',
        'pomu07.mp3',
        'pomu08.mp3',
        'pomu09.mp3',
        'pomu10.mp3',
        'pomu11.mp3',
        'pomu12.mp3',
    ],
    buffered_pomuras = [],
    pomuras = [
        'pomura0.mp3',
        'pomura1.mp3',
        'pomura4.mp3',
        'pomura5.mp3',
    ],
    sussies = [
        'sussy0.mp3',
        'sussy1.mp3',
    ],
    buffered_audio = {},
    ctx = new AudioContext(),
    step_anims = {
        bromu: {
            step: 120,
            steps: 16,
        },
    },
    active_step_anims = [],
    do_corruption = false,
    corruption = 10000,
    secrets = {
        'pomu': {
            action: () => {
                alert( `Aren't YOU a clever Pomu~` );
            },
            state: false,
        },
        'sheesh': {
            action: () => {
                playAudio( 'sheesh.mp3' );
            },
            state: false,
        },
        'worm': {
            action: () => {
                playAudio( 'worm.mp3' );
            },
            state: false,
        },
        'screm': {
            action: () => {
                playAudio( 'screm.mp3' );
            },
            state: false,
        },
        'pomusuke': {
            action: () => {
                playAudio( 'pomusuke.mp3' );
            },
            state: false,
        },
        'hornypls': {
            action: () => {
                playAudio( 'horny-pls.mp3' );
            },
            state: false,
        },
        'nut': {
            action: () => {
                playAudio( 'eli-nut.mp3', 0.5 );
            },
            state: false,
        },
        'sonna': {
            action: () => {
                playAudio( 'eli-banana.mp3' );
            },
            state: false,
        },
        'pp': {
            action: () => {
                togglePersistentPomu();
            },
            state: false,
        },
        'paindora': {
            action: () => {
                togglePaindora();
            },
            state: false,
        },
        'bromu': {
            action: () => {
                toggleAnim( 'bromu' );
            },
            state: false,
        },
    },
    local_vars = [
        'corruption',
    ];

window.requestAnimFrame = ( function() {
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame   ||
    window.mozRequestAnimationFrame      ||
    window.oRequestAnimationFrame        ||
    window.msRequestAnimationFrame       ||
    function( callback ) {
        window.setTimeout( callback, 1000 / 60 );
    };
} )();

function htmlToElement( html ) {
    let template = document.createElement( 'template' );
    template.innerHTML = html;
    return template.content.firstElementChild;
}

function getRandomIntInRange( min, max ) {
    min = Math.ceil( min );
    max = Math.floor( max + 1 );
    return Math.floor( Math.random() * ( max - min ) + min );
}

function addCommas( n ) {
    return n.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
}

async function fetchPostJson( url, data ) {
    const response = await fetch( url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( data )
    } );
    return response.json();
}

async function playAudio( file ) {
    if ( typeof( buffered_audio[ file ] ) == 'undefined' ) {
        bufferAudio( file )
            .then( ( response ) => {
                playAudio( file );
            } );
        return;
    }
    var source = ctx.createBufferSource(),
        gainNode = ctx.createGain();
    source.buffer = buffered_audio[ file ];
    gainNode.gain.value = volume;
    gainNode.connect( ctx.destination );
    source.connect( gainNode );
    source.onended = function() {
        if ( this.stop ) {
            this.stop();
        }
        if ( this.disconnect ) {
            this.disconnect();
        }
    };
    source.start( 0 );
}

async function bufferAudio( file ) {
    return fetch( `/assets/audio/${file}` )
        .then( response => response.arrayBuffer() )
        .then( ( response ) => {
            return ctx.decodeAudioData(
                response,
                function( buffer ) {
                    buffered_audio[ file ] = buffer;
                },
                function( e ) {
                    console.warn( e );
                }
            );
        } );
}

function pomuMouseDown() {
    pomu_mouse_down = true;
    if ( secret_states.paindora ) {
        paindoraPush();
    }
}
function pomuMouseUp() {
    if ( pomu_mouse_down ) {
        if ( secret_states.paindora ) {
            paindoraRelease();
        }
    }
    pomu_mouse_down = false;
}

function stepAnimations() {
    active_step_anims.forEach( stepAnimation );
}

function stepAnimation( anim ) {
    let element = document.getElementById( anim ),
        bg_pos = element.style.backgroundPosition;
    if ( bg_pos === '' ) {
        bg_pos = '0px';
    }
    bg_pos = px_to_int( bg_pos );
    if ( bg_pos < ( step_anims[ anim ].step * step_anims[ anim ].steps ) ) {
        bg_pos += step_anims[ anim ].step;
        element.style.backgroundPosition = `-${bg_pos.toString()}px`;
    }
    else {
        element.style.backgroundPosition = `0px`;
    }
}

function toggleAbout() {
    document.body.classList.toggle( 'about' );
}

function addPomu() {
    waiting_pomus++;
    setGlobalPomu( parseInt( document.getElementById( 'global-pomu' ).innerHTML.replace( /[^0-9]/g, '' ) ) + 1 );
    localStorage.setItem( 'pomus', parseInt( localStorage.getItem( 'pomus' ).replace( /[^0-9]/g, '' ) ) + 1 );
    updateLocalPomu();
}

async function updatePomu() {
    let data = await fetchPostJson( '/get' );
    if ( data.success && !isNaN( data.pomus ) ) {
        setGlobalPomu( data.pomus );
    }
}

function setLocalVariable( name, value ) {
    localStorage.setItem( name, value );
}

function getLocalVariable( name ) {
    return localStorage.getItem( name );
}

function loadLocalVariables() {
    local_vars.forEach( ( name ) => {
        let value = localStorage.getItem( name );
        if ( value !== null ) {
            
        }
    } );
}

function updateLocalPomu() {
    let local_pomu = localStorage.getItem( 'pomus' );
    if ( local_pomu === null ) {
        localStorage.setItem( 'pomus', 0 );
        local_pomu = 0;
        worthy = false;
    }
    else {
        if ( !worthy && isWorthy( local_pomu ) ) {
            worthy = true;
            rewardTheWorthy();
        }
    }
    setLocalPomu( local_pomu );
}

function setLocalPomu( pomu ) {
    document.getElementById( 'local-pomu' ).innerHTML = addCommas( pomu );
}

function setGlobalPomu( pomu ) {
    document.getElementById( 'global-pomu' ).innerHTML = addCommas( pomu );
}

function playPomu( sussy ) {
    if ( sussy ) {
        playAudio( `sussy/sussy1.mp3` );
        return;
    }
    var pomu_buffer = choosePomu(),
        source = ctx.createBufferSource(),
        gainNode = ctx.createGain();
    source.buffer = pomu_buffer;
    gainNode.gain.value = volume;
    gainNode.connect( ctx.destination );
    source.connect(gainNode);
    source.onended = function() {
        if ( this.stop ) {
            this.stop();
        }
        if ( this.disconnect ) {
            this.disconnect();
        }
    };
    source.start( 0 );
}

function playPomura( sussy ) {
    if ( sussy ) {
        playAudio( `sussy/sussy0.mp3` );
        return;
    }
    var pomura_buffer = choosePomura(),
        source = ctx.createBufferSource(),
        gainNode = ctx.createGain();
    source.buffer = pomura_buffer;
    gainNode.gain.value = volume;
    gainNode.connect( ctx.destination );
    source.connect(gainNode);
    source.onended = function() {
        if ( this.stop ) {
            this.stop();
        }
        if ( this.disconnect ) {
            this.disconnect();
        }
    };
    source.start( 0 );
}

function summonPomu( sussy ) {
    let suffix = secret_states.millie ? 'lie' : '',
        pomu = htmlToElement( `<div class="pomu"><img alt="She's Pomu!" src="/assets/images/pomu${suffix}.webp" height="690" width="486"/></div>` ),
        scale = getRandomIntInRange( 4, 10 ) / 10,
        height = Math.floor( parseInt( pomu.firstElementChild.height ) * scale ),
        width = Math.floor( parseInt( pomu.firstElementChild.width ) * scale ),
        deg = getRandomIntInRange( 0, 3 ) * 90;
    pomu.style.transform = `scale(${scale}) rotate(${deg}deg)`;
    pomu.style.top = `calc( ${getRandomIntInRange( 50, 90 )}vh - ${height}px )`;
    pomu.style.left = `calc( ${getRandomIntInRange( 10, 90 )}vw - ${width}px )`;
    document.body.insertAdjacentElement( 'beforeend', pomu );
    if ( !secret_states.pp ) {
        setTimeout( () => {
            pomu.remove();
        }, 1000 );
    }
}

function summonPomura() {
    let pomura = htmlToElement( `<div class="pomu"><img alt="She's Pomura!" src="/assets/images/pomura.webp" height="690" width="486"/></div>` ),
        scale = getRandomIntInRange( 4, 10 ) / 10,
        height = Math.floor( parseInt( pomura.firstElementChild.height ) * scale ),
        width = Math.floor( parseInt( pomura.firstElementChild.width ) * scale ),
        deg = getRandomIntInRange( 0, 3 ) * 90;
    pomura.style.transform = `scale(${scale}) rotate(${deg}deg)`;
    pomura.style.top = `calc( ${getRandomIntInRange( 50, 90 )}vh - ${height}px )`;
    pomura.style.left = `calc( ${getRandomIntInRange( 10, 90 )}vw - ${width}px )`;
    document.body.insertAdjacentElement( 'beforeend', pomura );
    if ( !secret_states.pp ) {
        setTimeout( () => {
            pomura.remove();
        }, 1000 );
    }
}

function imPomura() {
    playPomura( false );
    summonPomura();
    stepAnimations();
}

function imPomu() {
    if ( do_corruption ) {
        let pomura;
        if ( corruption === 0 ) {
            setControl( 'contested' );
            return;
        }
        else if ( corruption < 50 ) {
            pomura = ( corruption % 2 === 0 );
        }
        else if ( corruption <= 100 ) {
            pomura = ( corruption % 3 === 0 );
        }
        else if ( corruption <= 200 ) {
            pomura = ( corruption % 4 === 0 );
        }
        else if ( corruption <= 500 ) {
            pomura = ( corruption % 8 === 0 );
        }
        else if ( corruption <= 1000 ) {
            pomura = ( corruption % 10 === 0 );
        }
        else if ( corruption <= 5000 ) {
            pomura = ( corruption % 50 === 0 );
        }
        else if ( corruption <= 15000 ) {
            pomura = ( corruption % 100 === 0 );
        }
        else if ( corruption <= 25000 ) {
            pomura = ( corruption % 600 === 0 );
        }
        else if ( corruption <= 50000 ) {
            pomura = ( corruption % 2000 === 0 );
        }
        else {
            pomura = ( corruption % 5000 === 0 );
        }
        corruption--;
        if ( pomura ) {
            setControl( 'pomura' );
            imPomura();
            return;
        }
    }
    setControl( 'pomu' );
    let sussy = ( getRandomIntInRange( 0, 49 ) === 0 );//( getRandomIntInRange( 0, 9999 ) === 7668 );
    playPomu( sussy );
    summonPomu( sussy );
    stepAnimations();
    addPomu();
}

function choosePomu() {
    return buffered_pomus[ getRandomIntInRange( 0, ( buffered_pomus.length - 1 ) ) ];
}

function choosePomura() {
    return buffered_pomuras[ getRandomIntInRange( 0, ( buffered_pomuras.length - 1 ) ) ];
}

function clearPomus() {
    document.querySelectorAll( '.pomu' ).forEach( ( pomu ) => {
        pomu.remove();
    } );
}

function togglePersistentPomu() {
    if ( secret_states.pp ) {
        clearPomus();
        secret_states.pp = false;
    }
    else {
        secret_states.pp = true;
    }
}

function togglePaindora() {
    if ( secret_states.paindora ) {
        document.getElementById( 'paindora' ).remove();
        secret_states.paindora = false;
    }
    else {
        document.getElementById( 'content' ).insertAdjacentHTML( 'beforeend', '<div id="paindora" style="background-position: 0px"></div>' );
        secret_states.paindora = true;
    }
}

function toggleAnim( anim ) {
    if ( secret_states[ anim ] ) {
        document.getElementById( anim ).remove();
        secret_states[ anim ] = false;
        let i = active_step_anims.indexOf( anim );
        if ( i > -1 ) {
            active_step_anims.splice( i, 1 );
        }
    }
    else {
        document.body.insertAdjacentHTML( 'beforeend', `<div id="${anim}" style="background-position: 0px"></div>` );
        secret_states[ anim ] = true;
        active_step_anims.push( anim );
    }
}

function paindoraPush() {
    let paindora = document.getElementById( 'paindora' ),
        bg_pos = paindora.style.backgroundPosition;
    if ( bg_pos === '' ) {
        bg_pos = '0px';
    }
    bg_pos = px_to_int( bg_pos );
    if ( bg_pos < 450 ) {
        bg_pos += 150;
        paindora.style.backgroundPosition = `-${bg_pos.toString()}px`;
        window.requestAnimFrame( paindoraPush )
    };
}

function paindoraRelease() {
    let paindora = document.getElementById( 'paindora' ),
        bg_pos = paindora.style.backgroundPosition;
    if ( bg_pos === '' ) {
        bg_pos = '0px';
    }
    bg_pos = px_to_int( bg_pos );
    if ( bg_pos < 1050 ) {
        bg_pos += 150;
        paindora.style.backgroundPosition = `-${bg_pos.toString()}px`;
        window.requestAnimFrame( paindoraRelease )
    }
    else {
        paindora.style.backgroundPosition = `0px`;
    }
}

function px_to_int( px ) {
    return parseInt( px.replace( /[^0-9]/g, '' ) );
}

function togglePomunium() {
    if ( secret_states.pomunium ) {
        document.getElementById( 'pomunium' ).remove();
        secret_states.pomunium = false;
    }
    else {
        document.body.insertAdjacentHTML( 'beforeend', '<div id="pomunium"><img alt="Pomunium" src="/assets/images/pomunium.webp" height="150" width="183"/></div>' );
        secret_states.pomunium = true;
    }
}

function isWorthy( pomus ) {
    return ( pomus > 99 );
}

function rewardTheWorthy() {
    let lp = document.getElementById( 'local-pomu' ),
        form = htmlToElement( `<form id="secret-form" class="hidden" data-lpignore="true"><input id="secret" type="text" placeholder="????????????" data-lpignore="true" aria-label=="????????????"/></form>` );
    form.onsubmit = validateSecret;
    lp.insertAdjacentElement( 'afterend', form );
    lp.replaceWith( htmlToElement( `<button id="local-pomu" type="button" onclick="revealInput();" class="worthy">${lp.innerHTML}</button>` ) );
}

function revealInput() {
    let form = document.getElementById( 'secret-form' );
    form.classList.toggle( 'hidden' );
    if ( !form.classList.contains( 'hidden' ) ) {
        document.getElementById( 'secret' ).focus();
    }
}

function validateSecret( event ) {
    event.preventDefault();
    let secret = document.getElementById( 'secret' );
    switch ( secret.value.toLowerCase() ) {
        case 'pomu':
            alert( `Aren't YOU a clever Pomu~` );
            break;
        case 'sheesh':
            playAudio( 'sheesh.mp3');
            break;
        case 'worm':
            playAudio( 'worm.mp3' );
            break;
        case 'screm':
            playAudio( 'eli-screm.mp3' );
            break;
        case 'pomusuke':
            playAudio( 'pomusuke.mp3' );
            break;
        case 'hornypls':
            playAudio( 'hornypls.mp3' );
            break;
        case 'nut':
            playAudio( 'eli-nut.mp3' );
            break;
        case 'sonna':
            playAudio( 'eli-banana.mp3' );
            break;
        case 'mikz':
            playAudio( 'mikz.mp3' );
            break;
        case 'pp':
            togglePersistentPomu();
            break;
        case 'paindora':
            togglePaindora();
            break;
        case 'bromu':
            toggleAnim( 'bromu' );
            break;
        case 'millie':
            secret_states.millie = !secret_states.millie;
            break;
        default:
            secret.classList.add( 'shake' );
            setTimeout( () => { secret.classList.remove( 'shake' ); }, 100 );
    }
    secret.select();
}

function validateSecret2( event ) {
    event.preventDefault();
    let secret = document.getElementById( 'secret' ),
        value = secret.value.toLowerCase();
    if ( secrets[ value ] ) {
        
    }
}

async function bufferPomus() {
    var buffering = [];
    pomus.forEach( ( pomu, index ) => {
        buffering.push(
            fetch( `/assets/audio/pomus/${pomu}` )
                .then( response => response.arrayBuffer() )
                .then( ( response ) => {
                    ctx.decodeAudioData(
                        response,
                        function( buffer ) {
                            buffered_pomus.push( buffer );
                        },
                        function( e ) {
                            console.warn( e );
                        }
                    );
                } )
        );
    } );
    pomuras.forEach( ( pomura, index ) => {
        buffering.push(
            fetch( `/assets/audio/pomuras/${pomura}` )
                .then( response => response.arrayBuffer() )
                .then( ( response ) => {
                    ctx.decodeAudioData(
                        response,
                        function( buffer ) {
                            buffered_pomuras.push( buffer );
                        },
                        function( e ) {
                            console.warn( e );
                        }
                    );
                } )
        );
    } );
    Promise.all( buffering ).then( ( values ) => {
        document.getElementById( 'im-pomu' ).style = null;
    } );
}

function syncPomus( queue=true ) {
    let count = waiting_pomus;
    waiting_pomus = 0;
    fetch( '/sync', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( {
            pomus: count
        } )
    } )
    .then( response => response.json() )
    .then( ( data ) => {
        if ( data.success && !isNaN( data.pomus ) ) {
            setGlobalPomu( data.pomus );
        }
        if ( queue ) {
            queueSync();
        }
    } )
    .catch( ( err ) => {
        console.error( err );
        waiting_pomus = waiting_pomus + count;
        if ( queue ) {
            queueSync();
        }
    } );
}

function queueSync() {
    clearTimeout( sync_timeout );
    sync_timeout = setTimeout( function() {
        syncPomus();
    }, 10000 );
}

function setControl( name ) {
    document.body.setAttribute( 'data-control', name );
    switch ( name ) {
        case 'contested':
            document.title = 'I\'m ????';
            break;
        default:
            document.title = `I'm ${capitalizeFirstLetter( name )}!`;
    }
}

function capitalizeFirstLetter( str ) {
    return `${str.charAt( 0 ).toUpperCase()}${str.slice(1)}`; 
}

document.addEventListener( 'keyup', ( e ) => {
    let key = e.key.toLowerCase();
    if ( key == 'escape' ) {
        document.body.classList.remove( 'about' );
        return;
    }
    if ( e.target.matches( '#im-pomu' ) ) {
        if ( held_keys.includes( key ) ) {
            if ( key == 'enter' ) {
                if ( secret_states.paindora ) {
                    paindoraRelease();
                }
            }
        }
    }
    let i = held_keys.indexOf( key );
    if ( i > -1 ) {
        held_keys.splice( i, 1 );
    }
} );

document.addEventListener( 'mouseup', ( e ) => {
    if ( e.button === 0 ) {
        pomu_mouse_down = false;
    }
} );

document.addEventListener( 'keydown', ( e ) => {
    if ( e.target.matches( '#im-pomu' ) ) {
        let key = e.key.toLowerCase();
        if ( held_keys.includes( key ) ) {
            return;
        }
        held_keys.push( key );
        if ( key == 'enter' ) {
            if ( secret_states.paindora ) {
                paindoraPush();
            }
        }
    }
} );

document.addEventListener( 'visibilitychange', () => {
    if ( document.visibilityState === 'hidden' ) {
        clearTimeout( sync_timeout );
        if ( waiting_pomus > 0 ) {
            syncPomus( false );
        }
    }
    else {
        syncPomus();
    }
} );
//alert( `I'm working directly on the live site, so things might be broken right now. Screw you! I'm a GOOD DEV!` );
console.info( `NOTE: Chrome currently limits the number of webmediaplayer instances. This will generate errors if you reach this threshold.` );
bufferPomus();
updateLocalPomu();
//loadLocalVariables();

let params = ( new URL( document.location ) ).searchParams;
if ( params.has( 'corruption-beta' ) ) {
    document.body.insertAdjacentHTML( 'beforeend', `<div id="announcement">FLASHING COLORS WARNING! If you do not want to see flashing colors, please remove "?corruption-beta" from the url.</div>` );
    do_corruption = true;
    corruption = 100;
}

if ( document.visibilityState == 'visible' ) {
    queueSync();
}
