if(!this[CHANNEL.name]){this[CHANNEL.name]={}}
 
if(!this[CHANNEL.name].favicon){this[CHANNEL.name].favicon=$("<link/>").prop("id","favicon").attr("rel","shortcut icon").attr("type","image/png").attr("sizes","64x64").attr("href","https://raw.githubusercontent.com/om3tcw/r/emotes/emotes/ogey.png").appendTo("head")}
/*!
**|   Xaekai's Sequenced Module Loader
**|
**@preserve 
*/
({options:{
playlist:{
collapse: false,
hidePlaylist: true,
inlineBlame: true,
moveReporting: false,
quickQuality: false,
recentMedia: true,
simpleLeader: true,
syncCheck: true,
thumbnails: true,
timeEstimates: true,
userlist:{autoHider:true},
smartScroll:false,maxMessages:120},
various:{notepad:true,emoteToggle:false}},
 
 
modules:{
settings:{active:1,rank:-1,url:"https://cdn.jsdelivr.net/gh/om3tcw/r/customsettingsmodal.js",done:true},
 
playlist:{active:1,rank:-1,url:"https://cdn.jsdelivr.net/gh/om3tcw/r/playlistenhancement.js",done:true},
privmsg:{active:1,rank:1,url:"https://cdn.jsdelivr.net/gh/om3tcw/r/pmenhancement.js",done:true},  
notifier:{active:1,rank:-1, url: "https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/notifier.js",done: true},
layout:{active:1,rank:-1,url:"https://cdn.jsdelivr.net/gh/om3tcw/r/layoutoptions.js",done:true},
userlist:{active:1,rank:-1,url:"https://cdn.jsdelivr.net/gh/om3tcw/r@emotes/userlist.js",done:true}
},getScript:function(url,success,cache=true){return jQuery.ajax({url:url,cache:cache,success:success,type:"GET",dataType:"script"})},initialize:function(){if(CLIENT.modules){return}else{CLIENT.modules=this}window[CHANNEL.name].modulesOptions=this.options;console.info("[XaeModule]","Begin Loading.");this.index=Object.keys(this.modules);this.sequencerLoader();this.cache=false},sequencerLoader:function(){if(this.state.prev){setTimeout(this.modules[this.state.prev].done,0);this.state.prev=""}if(this.state.pos>=this.index.length){return console.info("[XaeModule]","Loading Complete.")}var currKey=this.index[this.state.pos];if(this.state.pos<this.index.length){if(this.modules[currKey].active){if(this.modules[currKey].rank<=CLIENT.rank){console.info("[XaeModule]","Loading:",currKey);this.state.prev=currKey;this.state.pos++;let cache=typeof this.modules[currKey].cache=="undefined"?this.cache:this.modules[currKey].cache;this.getScript(this.modules[currKey].url,this.sequencerLoader.bind(this),cache)}else{if(this.modules[currKey].rank===0&&CLIENT.rank===-1){(function(module){socket.once("login",data=>{if(data.success){this.getScript(module.url,false,this.cache)}})})(this.modules[currKey])}this.state.pos++;this.sequencerLoader()}}else{this.state.pos++;this.sequencerLoader()}}},state:{prev:"",pos:0}}).initialize();
 
 
$(document).ready(function() {
    var watermark = 'om3tcw is cuter than usual';
    $('#chatwrap').attr('placeholder', watermark);
 
        $('#nav-collapsible ul:first-child').append("<li class='dropdown'><a target='_blank' href='https://holodex.net/home'>HoloDex</a></li>");
                $('#nav-collapsible ul:first-child').append("<li class='dropdown'><a target='_blank' href='https://aggie.io/k9z9w_8z47'>om3tcw Aggie</a></li>");
});
 
    /* Tabs */ {
        var tabContainer = $('<div id="MainTabContainer"></div>').appendTo('#videowrap');
        var tabList = $('<ul class="nav nav-tabs" role="tablist"></ul>').appendTo(tabContainer);
        var tabContent = $('<div class="tab-content"></div>').appendTo(tabContainer);
 
        //Playlist Tab
        $('<div role="tabpanel" class="tab-pane active" id="playlistTab"></div>').appendTo(tabContent).append($('#rightcontrols').detach()).append($('#playlistrow').detach().removeClass('row'));
        var playlistButton = $('<li class="active" role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#playlistTab">Playlist</a></li>').appendTo(tabList);
 
 
        if(getOrDefault(CHANNEL.name + "chinkspy", false)) {
            $('body').append('<span id="pnl_options" style="position:absolute;display:none;left:0;top:30px;padding-top:10px;width:100%;background:rgba(0,0,0,0.5);z-index:2;"></span>');
            $('<li><a id="btn_playList" class="pointer">Playlist</a></li>').insertAfter('#settingsMenu')
                .click(function(){
                    if ($('#pnl_options').css('display')=='none'){
                        $('#rightcontrols').detach().appendTo('#pnl_options');
                        $('#playlistrow').detach().appendTo('#pnl_options');
                        $('#pnl_options').slideDown();
                    } else {
                        $('#pnl_options').slideUp();
                    }
                });
            playlistButton.on('mousedown', function(){
                $('#rightcontrols').detach().appendTo('#playlistTab');
                $('#playlistrow').detach().appendTo('#playlistTab');
            });
        }
 
        //Polls Tab
$('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#pollsTab">Polls <span id="pollsbadge" class="badge" style="background-color:#FFF;color:#000;"></span></a></li>')
            .appendTo(tabList).click(function(){ $('#pollsbadge').text(''); });
        $('<div role="tabpanel" class="tab-pane" id="pollsTab"><div class="col-lg-12 col-md-12" id="pollhistory"></div></div>').appendTo(tabContent).prepend($('#newpollbtn').detach());
 
 
 
 
        //Slightly edit the poll functions to make the "active poll" element above the tabs
        var redoPollwrap = function(){
            $('#pollwrap').detach().insertBefore('#MainTabContainer');
            $('#pollwrap .well span.label.pull-right').detach().insertBefore('#pollwrap .well h3'); 
            $('#pollwrap button.close').off("click").click(function(){ 
                $('#pollwrap').detach().insertBefore('#pollhistory'); 
                if($('#pollsTab').hasClass('active') == false) {
                    var badgeTxt = $('#pollsbadge').text();
                    $('#pollsbadge').text((badgeTxt ? parseInt(badgeTxt) : 0) + 1);
                }
            });
        };
 
        base_newPoll = Callbacks.newPoll;
        Callbacks.newPoll = function(data){
            base_newPoll(data);
            if($('#pollsTab').hasClass('active') == false && $('#MainTabContainer #pollwrap').length === 0){
                var badgeTxt = $('#pollsbadge').text();
                var pollCnt = $('#pollwrap .well.muted').length + (badgeTxt ? parseInt(badgeTxt) : 0);
                $('#pollsbadge').text(pollCnt);
            }
 
            $('#pollwrap .well.muted').detach().prependTo('#pollhistory');
            redoPollwrap();
        };
        redoPollwrap();
 
 
 
        //Teamup
        $('<div role="tabpanel" class="tab-pane" id="calendarTab"><iframe width="100%" height="600" frameborder="0" scrolling="no"></iframe></div>').appendTo(tabContent);
        $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab">Teamup EN</a></li>').appendTo(tabList);
        var baseCalendarUrl = 'https://teamup.com/ksua2ar4zft49pdn7c?view=m&showLogo=0&showSearch=0&showProfileAndInfo=0&showSidepanel=1&disableSidepanel=0&showTitle=0&showViewSelector=1&showMenu=0&weekStartDay=mo&showAgendaHeader=1&showAgendaDetails=0&showYearViewHeader=1';
 
        $('<div role="tabpanel" class="tab-pane" id="calendarTab2"><iframe width="100%" height="600" frameborder="0" scrolling="no"></iframe></div>').appendTo(tabContent);
        $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab2">Teamup OM3TCW</a></li>').appendTo(tabList);
        var baseCalendarUrl2 = 'https://teamup.com/ks61mxw6fedx3qbke4?view=m&showHeader=0&showProfileAndInfo=0&showSidepanel=1&disableSidepanel=0&showTitle=1&showViewSelector=1&showMenu=0&weekStartDay=mo&showAgendaHeader=1&showAgendaDetails=0&showYearViewHeader=1';
 
        $('<div role="tabpanel" class="tab-pane" id="calendarTab3"><iframe width="100%" height="900" frameborder="0" scrolling="no"></iframe></div>').appendTo(tabContent);
        $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab3">Oshi Eyes</a></li>').appendTo(tabList);
        var baseCalendarUrl3 = 'https://docs.google.com/forms/d/1oqO8DIIyxuKVPvhXSAmxNCy5zCkS8XQAhEKi8a9BK1g/viewform?';
 
        var calendars = getOrDefault(CHANNEL.name + '_CALENDARS', null);
        if(!Array.isArray(calendars)) setOpt(CHANNEL.name + '_CALENDARS', calendars = [{ src:'d426h89oqa3krrq8cj00kbasgo%40group.calendar.google.com', color:'2952A3' } ]); //set the default calendar if not already
        AddCalendar = function(src, color){ setOpt(CHANNEL.name + '_CALENDARS', getOrDefault(CHANNEL.name + '_CALENDARS', []).concat([{src:src,color:color}])); }
        //command to add the comfy calendar: AddCalendar('d426h89oqa3krrq8cj00kbasgo%40group.calendar.google.com', 'AB8B00')
 
        $('#calendarTab iframe').attr('src', baseCalendarUrl+'&');
        $('#calendarTab2 iframe').attr('src', baseCalendarUrl2+'&');
        $('#calendarTab3 iframe').attr('src', baseCalendarUrl3+'&');
        $('#leftpane').remove();
    }
 
//  ===========================================  KEYBINDS  ========================================== //
var keyHeld = false;                    //control keypress rapidfire
$(window).bind('keyup', function(){keyHeld=false;}); 
$(window).bind('keydown', function(event) {
    var inputBox = document.getElementById("chatline");
    var inputVal = inputBox.value;
    if (event.ctrlKey && !event.shiftKey){  switch (String.fromCharCode(event.which).toLowerCase()) {
        case 'a':                               //Select input box
            event.preventDefault();
            if(!keyHeld){
                keyHeld=true;
                inputBox.focus();
                inputBox.setSelectionRange(0,inputVal.length);
                }
            break;
        case 's':                               //spoiler
                if (!keyHeld){
                    keyHeld=true;
                    event.preventDefault();
                    var selSt = inputBox.selectionStart;
                    var selEnd = inputBox.selectionEnd;
                if (inputBox === document.activeElement){
                    if(inputBox.selectionStart == inputBox.selectionEnd){
                        inputBox.value = inputVal.substring(0,selSt) +"[sp]"+ inputVal.substring(selSt,selEnd) +"[/sp]"+inputVal.substring(selEnd,inputVal.length);
                        inputBox.setSelectionRange(selSt +4,selSt +4);
                    } else if (inputBox.selectionStart < inputBox.selectionEnd){
                        inputBox.value = inputVal.substring(0,selSt) +"[sp]"+ inputVal.substring(selSt,selEnd) +"[/sp]"+inputVal.substring(selEnd,inputVal.length);
                        inputBox.setSelectionRange(selEnd+9,selEnd+9);
                    }
                }
                break;
            }
        }
    }
});
 
// ============================= REPLACE VIDEO =================================== //
(function() {
    $('#plcontrol').append('<input type="button" class="btn btn-sm btn-default" value="🐀" id="replacebutton">');
    $('#plcontrol').append('<input type="button" class="btn btn-sm btn-default" value="🔃" id="refreshbutton">');
    
    $('#replacebutton').hover
    $('#replacebutton').click(function(){
        //var currentPlayerSrc = document.getElementById("ytapiplayer").src;
        //var youtubeIdStart = currentPlayerSrc.indexOf(/embed/) + 7;
 
        var newId = window.prompt("Replace the current playing stream\nRefresh to undo\n\nSwitching back to YouTube from Twitch is broken, so reloading the player is necessary in that case\n\nYoutube URL/ID:","");
        var newSource = "YT";
 
        if (newId == null) {
            newId = "";
        } else if (newId.includes("https://youtube.com/watch?v=")) {
            newId = newId.replace('https://youtube.com/watch?v=','').substring(0, 11);
        } else if (newId.includes("https://www.youtube.com/watch?v=")) {
            newId = newId.replace('https://www.youtube.com/watch?v=','').substring(0, 11);
        } else if (newId.includes("https://youtu.be/")) {
            newId = newId.replace('https://youtu.be/','').substring(0, 11);
        } else if (newId.includes("https://www.twitch.tv/")) {
            newId = newId.replace('https://www.twitch.tv/','');
            newSource = "TTV";
        } else if (newId.includes("https://twitch.tv/")) {
            newId = newId.replace('https://twitch.tv/','');
            newSource = "TTV";
        } else if (newId.length == 11) {
            //no edit required
        } else if (newId=="om3tcw") {
            newId = "cJtkxZrUicI";
        } else if (newId=="ogey" || newId=="rrat" || newId=="ogey rrat") {
            newId = "JacN1MzyeKo";
        } else {
            alert("Invalid input. \nExample input: https://www.youtube.com/watch?v=X9zw0QF12Kc, https://youtu.be/X9zw0QF12Kc, X9zw0QF12Kc, https://www.twitch.tv/holofightz, https://twitch.tv/holofightz");
            newId = "";
        }
        document.body.classList.add('chatOnly'); // Prevent it from being changed by cytube
        socket.emit("removeVideo");
        CLIENT.videoRemoved = true;
        if (newId != "") {
            if (newSource == "YT") { 
                document.getElementById("ytapiplayer").src = " https://www.youtube.com/embed/" + newId + "?autohide=1&autoplay=1&controls=1&iv_load_policy=3&rel=0&wmode=opaque&enablejsapi=1&origin=https%3A%2F%2Fom3tcw.com&widgetid=2";
            } else {
                document.getElementById("ytapiplayer").src = "https://player.twitch.tv?channel=" + newId + "&parent=om3tcw.com&referrer=location.host";
            };
        };
    });
    $('#refreshbutton').click(function(){
        document.body.classList.remove('chatOnly');
        document.getElementById("mediarefresh").click();
        socket.emit("restoreVideo");
        CLIENT.videoRemoved = false;
    });
})();
 
   // ============================= IMAGE HOVER =================================== //
$("#messagebuffer").bind('DOMNodeInserted',function(event){
    $(event.target).find("a").parent().parent().each(function(){createHoverImage( $(this) )})
});
$("#messagebuffer a").parent().parent().each(function(){createHoverImage( $(this) )})
 
var ImageHoverEnable = false;
 
function createHoverImage (jqChatMessage){
    jqChatMessage.find("a").bind("mouseenter",function(){
        if (ImageHoverEnable) {
            var messageAfter = $(this).parent().next();
            if (!messageAfter.is("img")){
                var newImg = new Image();
                newImg.style.display = "none";
                newImg.onload = function(){
                    this.classList.add("imageHoverPreview","imageLoaded");
                }
                newImg.src = $(this).html();
                $(this).parent().after(newImg)
            }
            $("#messagebuffer div:hover .imageHoverPreview").stop(true,false).slideDown(100)
            $("#messagebuffer div:hover").bind("mouseout",function(event){
                $(this).children(".imageHoverPreview").stop(true,true).slideUp(100).delay(100).removeAttr("style");
                $(this).unbind(event);
 
            })
        }
    })
};
