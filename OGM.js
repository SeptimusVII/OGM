// ==UserScript==
// @name         OGManager

// @author       Septimus
// @grant		   GM_getValue
// @grant		   GM_setValue
// @grant		   GM_deleteValue
// @grant		   GM_getResourceURL
// @grant		   GM_xmlhttpRequest
// @updateURL      https://raw.githubusercontent.com/SeptimusVII/OGM/main/OGM.js
// @downloadURL    https://raw.githubusercontent.com/SeptimusVII/OGM/main/OGM.js
// @version        0.1.5

// @include        *.ogame*gameforge.com/game/index.php?page=*
// @exclude        *.ogame*gameforge.com/game/index.php?page=displayMessageNewPage*
// ==/UserScript==

(function() {
    'use strict';
    var delaySendFleet = 500;
    var planets = {};
    var addToLogs = function(str){
        $('.ogm__logs').append('<br>'+str);
    }
    var clearLogs = function(){
        $('.ogm__logs').html('');
    }
    var getData = function(name){
        var data = localStorage.getItem('ogm__'+name);
        return data;
    }
    var setData = function(name,value){
        localStorage.setItem('ogm__'+name,value);
        addToLogs('Changed '+name+' value to '+value);
    }
    var initDom = function(){
        $('<div class="ogm__logs"></div>').appendTo('body');
        addToLogs('# initDom');
        $(`
            <div class="ogm__modal config">
                <div class="ogm__modal__wrapper">
                    <p style="font-size:3em; margin-bottom: 0.5em;">Config</p>
                    <div class="tabs">
                        <div class="tabs__nav">
                            <span class="button explo active">Exploration</span>
                        </div>
                        <div class="tabs__wrapper">
                            <div class="tab explo active">
                                <p style="font-size:1.5em; margin-bottom: 0.25em;">Max. vaisseaux</p>
                                <i>Indiquez le nombre de vaisseaux maximum a envoyer par expédition</i>
                                <br>    
                                <br>    
                                <div class="input--group">
                                    <label for="ogm__input--transporterLarge">Grand transporteur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('transporterLarge')||0}" id="ogm__input--transporterLarge" name="transporterLarge" type="number"></div>
                                    <label for="ogm__input--transporterSmall">Petit transporteur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('transporterSmall')||0}" id="ogm__input--transporterSmall" name="transporterSmall" type="number"></div>
                                    <label for="ogm__input--explorer">Eclaireur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('explorer')||0}" id="ogm__input--explorer" name="explorer" type="number"></div>
                                    <label for="ogm__input--espionageProbe">Sonde d'espionnage</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('espionageProbe')||0}" id="ogm__input--espionageProbe" name="espionageProbe" type="number"></div>
                                </div><br>
                                <div class="input--group">
                                    <label for="ogm__input--fighterLight">Chasseur léger</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('fighterLight')||0}" id="ogm__input--fighterLight" name="fighterLight" type="number"></div>
                                    <label for="ogm__input--fighterHeavy">Chasseur lourd</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('fighterHeavy')||0}" id="ogm__input--fighterHeavy" name="fighterHeavy" type="number"></div>
                                    <label for="ogm__input--cruiser">Croiseur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('cruiser')||0}" id="ogm__input--cruiser" name="cruiser" type="number"></div>
                                    <label for="ogm__input--battleship">Vaisseau de bataille</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('battleship')||0}" id="ogm__input--battleship" name="battleship" type="number"></div>
                                    <label for="ogm__input--interceptor">Traqueur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('interceptor')||0}" id="ogm__input--interceptor" name="interceptor" type="number"></div>
                                    <label for="ogm__input--bomber">Bombardier</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('bomber')||0}" id="ogm__input--bomber" name="bomber" type="number"></div>
                                    <label for="ogm__input--destroyer">Destructeur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('destroyer')||0}" id="ogm__input--destroyer" name="destroyer" type="number"></div>
                                    <label for="ogm__input--reaper">Faucheur</label>
                                    <div><input min=0 class="saveOnChange" value="${getData('reaper')||0}" id="ogm__input--reaper" name="reaper" type="number"></div>
                                </div>
                                <br>    
                                <p style="font-size:1.5em; margin-bottom: 0.5em;">Mode</p>
                                <input type="radio" name="exploMode" class="saveOnChange" value="spread" id="ogm__input--exploMode--spread" ${getData('exploMode') == 'spread'?'checked':''}>
                                <label for="ogm__input--exploMode--spread">Dispersé</label>
                                <br>
                                <i>Réparti les expéditions dans les systèmes voisins. Plus lent, mais préserve les systèmes de l'épuisement.</i>
                                <br>
                                <br>
                                <input type="radio" name="exploMode" class="saveOnChange" value="local" id="ogm__input--exploMode--local" ${getData('exploMode') == 'local'?'checked':''}>
                                <label for="ogm__input--exploMode--local">Localisé</label>
                                <br>
                                <i>Envoi toutes les expéditions dans le système courant. Plus rapide, mais épuise le système plus rapidement.</i>
                                <br>
                                <br>
                                <p style="font-size:1.5em; margin-bottom: 0.5em;">Nombre d'heures</p>
                                <div class="input--group">
                                    <div><input min=1 class="saveOnChange" value="${getData('nbHours')||0}" id="ogm__input--nbHours" name="nbHours" type="number"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).appendTo('body');

        var $selectPlanet = $(`<select name="rallyPoint" class="selectPlanet saveOnChange" style="visibility: visible;"></select>`)
        for(var planet in planets){
            if (!planets[planet].isMoon)
                $selectPlanet.append(`<option ${getData('rallyPoint') == planet ? 'selected':''} value="${planet}">${planets[planet].name} [${planets[planet].coords.join(':')}]</option>`);
            else
                $selectPlanet.append(`<option ${getData('rallyPoint') == planet ? 'selected':''} value="${planet}"> --- ${planets[planet].name}</option>`);
        }
        // $selectPlanet.appendTo('.ogm__modal.config .tab.rally .selectContainer');


        $('.tabs .tabs__nav .button').each(function(index,button){
            button = $(button);
            var tabs = button.closest('.tabs');
            button.on('click',function(event){
              tabs.find('.tabs__nav .button').removeClass('active');
              tabs.find('.tabs__wrapper .tab').removeClass('active');
              button.addClass('active');
              tabs.find('.tabs__wrapper .tab').eq(index).addClass('active');
            });
        });
        $('body').on('change','.saveOnChange',function(){
            console.log(this.name, this.value);
            setData(this.name, this.value);
        });


        var modalMouseDown;
        var modalMouseUp;
        $('body').on('mousedown','.ogm__modal',function(e){modalMouseDown = e.target;});
        $('body').on('mouseup','.ogm__modal',function(e){modalMouseUp = e.target;});
        $('body').on('click','.ogm__modal',function(e){
            if ($(e.target).hasClass('ogm__modal') && modalMouseDown == modalMouseUp) {
              $(this).removeClass('active');
            } else if($(e.target).hasClass('ogm__modal__close')){
              $(this).closest('.ogm__modal').removeClass('active');
            }
        });
        $('body').on('click','[data-ogmaction]',function(e){
            setData('action', $(this).attr('data-ogmaction'));
            dispatch();
        })

        var $feature = $('<div class="ogm__feature"></div>');
        var $btnGoHome      = $('<button data-ogmaction="goHome" class="ogm__btn-icon station" title="Rapatrier les ressources de cette planète"></button>');
        var $btnRally       = $('<button data-ogmaction="rally" class="ogm__btn-icon rally" title="Rapatrier les ressources de toutes les planètes"></button>');
        var $btnExplo       = $('<button data-ogmaction="explo" class="ogm__btn-icon expe" title="Lancer une exploration"></button>');
        var $btnExploAll    = $('<button data-ogmaction="exploAll" class="ogm__btn-icon expeAll" title="Lancer toutes les explorations"></button>');
        var $btnConfig      = $('<p class="ogm__btn-link" style="text-align: right;">Options</p>').on('click',function(){
            openConfig();
        });

        $('#links')
            .append($feature.clone().append('<p class="title">Rapatriement</p>').append($selectPlanet).append('<br>').append($btnGoHome).append($btnRally))
            .append($feature.clone().append('<p class="title">Exploration</p>').append($btnExplo).append($btnExploAll).append($btnConfig));
        writeStyle();
        addToLogs('Dom init end');
    }
    var openConfig = function(){
        addToLogs('# openConfig');
        $('.ogm__modal.config').addClass('active');
    }
    var explo = function(){
        addToLogs('# explo');
        var ships = {
             'transporterLarge' : getData('transporterLarge')
            ,'transporterSmall' : getData('transporterSmall')
            ,'explorer'         : getData('explorer')
            ,'fighterLight'     : getData('fighterLight')
            ,'fighterHeavy'     : getData('fighterHeavy')
            ,'cruiser'          : getData('cruiser')
            ,'battleship'       : getData('battleship')
            ,'interceptor'      : getData('interceptor')
            ,'bomber'           : getData('bomber')
            ,'destroyer'        : getData('destroyer')
            ,'reaper'           : getData('reaper')
            ,'espionageProbe'   : getData('espionageProbe')
        };
        var nbHours     = getData('nbHours');
        var currentExp  = parseInt($('#slots>div').eq(1).text().match(/\d+\/+\d/)[0].split('/')[0]);
        var nbExp       = parseInt($('#slots>div').eq(1).text().match(/\d+\/+\d/)[0].split('/')[1]);
        var system      = planets[currentPlanet].coords[1];
        if (getData('exploMode') == 'spread') {
            console.log(system,Math.ceil(nbExp/2), currentExp);
            system = system - (Math.ceil(nbExp/2) -  currentExp);
            if (system == planets[currentPlanet].coords[1])
                system = system + Math.floor(nbExp/2);
        }
        addToLogs('target system: '+system)

        if (currentExp == 0) {
            for(var ship in ships){
                var nbMax = ships[ship];
                var nbAvailable = parseInt($('li.'+ship+' .amount').text().replace(/\./g,''));
                if ((nbMax * nbExp) > nbAvailable)
                    setData('explo_nb_'+ship,Math.ceil(nbAvailable/nbExp));
                else
                    setData('explo_nb_'+ship,nbMax);
            }
        }

        for(var ship in ships)
            $('input[name='+ship+']').val(getData('explo_nb_'+ship)).trigger('keyup');
        $('#continueToFleet2').trigger('click');
        $('input#system').val(system).trigger('keyup');
        $('input#position').val(16).trigger('keyup');
        $('#continueToFleet3').trigger('click');
        $('#missionButton15').trigger('click');
        $('#expeditiontime').val(nbHours).trigger('change');
        sendFleet()
        if (getData('action') == 'explo')
            setData('action', 'idle');
        if (getData('action') == 'exploAll' && currentExp == nbExp-1)
            setData('action', 'idle');
    }

    var goHome = function goHome(){
        addToLogs('# goHome');
        var home = planets[getData('rallyPoint')]; // hircine
        var fret =  48750;
        var ressources = parseInt($('#resources_metal').text().replace(/\./g, '')) + parseInt($('#resources_crystal').text().replace(/\./g, '')) + parseInt($('#resources_deuterium').text().replace(/\./g, ''));
        var nbGT = Math.ceil(ressources/fret);
        addToLogs('rally point: '+home.name);
        addToLogs('ressources :'+ressources);
        addToLogs('fret :'+fret);
        addToLogs('nbGT :'+nbGT);

        $('input[name=transporterLarge]').val(nbGT).trigger('keyup');
        $('#continueToFleet2').trigger('click');
        $('input#galaxy').val(home.coords[0]).trigger('keyup');
        $('input#system').val(home.coords[1]).trigger('keyup');
        $('input#position').val(home.coords[2]).trigger('keyup');
        if (home.isMoon)
            $('#mbutton').trigger('click');
        $('#continueToFleet3').trigger('click');
        $('#missionButton3').trigger('click');
        $('#allresources').trigger('click');
        if (getData('action') == 'goHome')
            setData('action', 'idle');
        if (getData('action') == 'rally' && getData('arrPlanetTodo') == '')
            setData('action', 'idle');
        sendFleet()
    }

    var timerReady;
    var sendFleet = function(){
        addToLogs('waiting to send fleet...')
        clearTimeout(timerReady);
        if ($('#fleet3').length) {
            timerReady = setTimeout(function(){
                if ($('#fleet3').css('display') == 'none') 
                    sendFleet();
                else {
                    addToLogs('fleet sent')
                    $('#sendFleet').trigger('click');
                }
            },300);
        }
    }


    var writeStyle = function(data){
        addToLogs('# writeStyle')
        // addToLogs('writing styles...');
        var style = document.createElement('style');
        style.innerHTML = '';
        style.innerHTML += '#toolbarcomponent,#links{max-width: 100%;}';
        style.innerHTML += '.ogm__logs{position: fixed; bottom:30px; left:10px; font-size:0.6rem; color: white; font-family: monospace; }';
        style.innerHTML += '.ogm__btn{cursor: pointer}';
        style.innerHTML += '.ogm__btn-icon{background: url("//gf2.geo.gfsrv.net/cdn14/f45a18b5e55d2d38e7bdc3151b1fee.jpg") no-repeat; display: inline-block; width: 54px; height: 54px; font-size: 9px; text-align: center; color: #848484; cursor:pointer; }';
        style.innerHTML += '.ogm__btn-icon.expe         {background-position: 0 0px;}';
        style.innerHTML += '.ogm__btn-icon.expeAll       {background-position: 0 -54px;}';
        style.innerHTML += '.ogm__btn-icon.rally        {background-position: -54px 0px;}';
        style.innerHTML += '.ogm__btn-icon.colo         {background-position: -108px 0px;}';
        style.innerHTML += '.ogm__btn-icon.station      {background-position: -162px 0px;}';
        style.innerHTML += '.ogm__btn-icon.recycle      {background-position: -216px 0px;}';
        style.innerHTML += '.ogm__btn-icon.transport    {background-position: -270px 0px;}';
        style.innerHTML += '.ogm__btn-icon.spy          {background-position: -324px 0px;}';
        style.innerHTML += '.ogm__btn-icon.fist         {background-position: -378px 0px;}';
        style.innerHTML += '.ogm__btn-icon.attack       {background-position: -432px 0px;}';
        style.innerHTML += '.ogm__btn-icon.attackGroup  {background-position: -486px 0px;}';
        style.innerHTML += '.ogm__btn-icon.destroy      {background-position: -540px 0px;}';
        style.innerHTML += '.ogm__btn-link              {font-style: italic; text-decoration: underline; opacity: 0.4; cursor: pointer;}';
        style.innerHTML += '.ogm__btn-link:hover        {text-decoration: none; opacity: 1;}';
        
        style.innerHTML += '.ogm__modal          {position: fixed; top: 0; left: 0; height: 100vh; width: 100vw; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items:center; opacity:0; display: none; pointer-events: none; z-index: 1000; }';
        style.innerHTML += '.ogm__modal.active   {opacity: 1; pointer-events: all; display: flex; }';
        style.innerHTML += '.ogm__modal__wrapper {background: #242424; padding: 2rem; min-height: 40vh;}';
        style.innerHTML += '.ogm__modal i        {opacity: 0.3; font-size: 0.9em; line-height: 1.8;}';
        
        style.innerHTML += '.ogm__feature        {margin-top: 0.5em; padding: 0.5em 0.65em; border: 1px solid #242424; border-radius: 4px; background: #090909;}';
        style.innerHTML += '.ogm__feature .title {font-size: 1.25em; margin-bottom: 0.5em; font-style: italic; opacity: 0.4;}';
        style.innerHTML += '.ogm__feature .ogm__btn-icon+.ogm__btn-icon {margin-left: 0.5em;}';

        style.innerHTML += '.tabs{}';
        style.innerHTML += '.tabs__nav{margin-bottom: 1em; padding-bottom: 1em; border-bottom: 1px solid grey;}';
        style.innerHTML += '.tabs__nav .button{font-size: 1.5em; text-transform: uppercase; opacity: 0.4; cursor: pointer;}';
        style.innerHTML += '.tabs__nav .button.active,.tabs__nav .button:hover{opacity: 1;}';
        style.innerHTML += '.tabs__wrapper{}';
        style.innerHTML += '.tabs__wrapper .tab{opacity: 0; pointer-events: none; height: 0; overflow: hidden;}';
        style.innerHTML += '.tabs__wrapper .tab.active{opacity: 1; pointer-events: all; height: auto;}';

        style.innerHTML += '.input--group {display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 0.5em; margin-bottom: 1em; width: fit-content; align-items: center;}';
        style.innerHTML += '.input--group input:not([type=radio]):not([type=checkbox]){font-size: 1.25em; padding: 0.25em;}';
        style.innerHTML += '.input--group input[type=number]{width: 100px; float: right;}';
        style.innerHTML += '.selectPlanet {font-size: 1.25em; padding: 0.5em; margin-bottom: 0.5em; max-width: 100%;}';
        style.innerHTML += '.selectPlanet option {font-size: 1em}';
        
        document.head.appendChild(style);
        // addToLogs('styles OK');
    }

    var dispatch = function(){
        // setData('action', 'idle');
        var action = getData('action') || 'idle';
        var params = {};
        for( var param of window.location.search.replace('?','').split('&') )
            params[param.split('=')[0]] = param.split('=')[1];
        addToLogs('# dispatch action: '+action);
        switch(action){
            case 'exploAll': 
            case 'explo': 
                if (params.component && params.component == 'fleetdispatch')
                    explo();
                else{
                    setData('action', action);
                    window.location.href = window.location.href.split('?')[0] + `?page=ingame&component=fleetdispatch&cp=${planets[currentPlanet].id}`;
                }
            break;
            case 'rally': 
                addToLogs('arrPlanetTodo: ', getData('arrPlanetTodo'));
                if (getData('arrPlanetTodo') == '' || !getData('arrPlanetTodo')) {
                    var arrPlanetTodo = [];
                    for(var p in planets)
                        if (!planets[p].isMoon)
                            arrPlanetTodo.push(p);
                    setData('arrPlanetTodo', arrPlanetTodo.join(','));
                    dispatch();
                } else {
                    var arrPlanetTodo = getData('arrPlanetTodo').split(',');
                    if (params.component && params.component == 'fleetdispatch' && currentPlanet == arrPlanetTodo[0]){
                        setData('arrPlanetTodo', arrPlanetTodo.slice(1).join(','));
                        setTimeout(function(){
                            goHome();
                        },1000)
                    }
                    else{
                        setData('action', action);
                        window.location.href = window.location.href.split('?')[0] + `?page=ingame&component=fleetdispatch&cp=${planets[arrPlanetTodo[0]].id}`;
                    }
                }
            break;
            case 'goHome': 
                if (params.component && params.component == 'fleetdispatch')
                    goHome();
                else{
                    setData('action', action);
                    window.location.href = window.location.href.split('?')[0] + `?page=ingame&component=fleetdispatch&cp=${planets[currentPlanet].id}`;
                }
            break;
            case 'idle': 
                localStorage.setItem('ogm__arrPlanetTodo','');
            break;
        }
    }

    var currentPlanet = 0;
    var i = 0;
    $('#planetList .smallplanet').each(function(){
        var planetName = $(this).find('.planet-name').text();
        planets[i] = {
            name: planetName,
            coords: $(this).find('.planet-koords').text().replace('[','').replace(']','').split(':'),
            link: $(this).find('.planetlink'),
            id: $(this).attr('id').split('-')[1],
            isMoon: false,
        }
        if ($(this).find('.planetlink').hasClass('active'))
            currentPlanet = i;
        i++;
        if ($(this).find('.moonlink').length){
            var moonName = $(this).find('.moonlink img.icon-moon').attr('alt');
            planets[i] = {
                name: moonName,
                coords: $(this).find('.planet-koords').text().replace('[','').replace(']','').split(':'),
                link: $(this).find('.moonlink'),
                id: $(this).find('.moonlink').attr('href').split('cp=')[1],
                isMoon: true,
            }
            if ($(this).find('.moonlink').hasClass('active'))
                currentPlanet = i;
            i++;
        }
    });
    console.log(planets);
    initDom();
    addToLogs('Active planet/moon: '+planets[currentPlanet].name);
    dispatch();
    
})();


