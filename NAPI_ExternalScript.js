//=============================================================================
// NAPI_ExternalScript.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2022/01/22 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @target MV MZ
 * @plugindesc スクリプトJSファイル化プラグイン
 * @author なぴぃ
 * 
 * @help スクリプトの先頭にタグを埋め込む事でスクリプトを.jsファイル化し
 * 外部ファイルから実行できるようにします。
 * .jsファイルを外部エディターで編集するとテストプレイ時に自動でマップデータに
 * ミラーリングされる為、外部エディター・ツクールのエディター双方から同じ内容を
 * 参照・編集できるようになります。
 * 
 * 
 * ●使い方
 * スクリプトの先頭に以下のように記述して下さい。
 * "script:関数名";
 * これでexscriptフォルダ内のexscript.js内の指定の関数と同期されるようになります。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * @param SyncMode
 * @text 同期モード
 * @desc 双方向同期の場合更新のあったファイルを古いファイルに上書きします。それ以外の場合は一方的にしか上書きを行いません。
 * @option 双方向同期
 * @option jsファイルをゲームデータに上書き
 * @option ゲームデータをjsファイルに上書き
 * @default 双方向同期
 * @type select
 * 
 * @param AutoChangeScriptToJs
 * @text 全スクリプト自動.js化
 * @desc タグ付けが行われていないスクリプトのタグ付けを自動で行いマップ毎に.jsファイルを作成します。
 * @default true
 * @type boolean
 * 
 * @param AutoDeleteFunction
 * @text 未使用関数自動削除
 * @desc ONにするとイベントから参照されてない.jsファイル内の関数を自動で削除します。
 * @option OFF
 * @option ON(名付きスクリプトを残す)
 * @option ON(名付きスクリプトも削除)
 * @default OFF
 * @type select
 * 
 * @param SortOrderNewScript
 * @text スクリプト追加時並び順
 * @desc 新しいスクリプトを追加する時のjsファイル内スクリプトの並び順を設定します。
 * @option 名前付きスクリプト以外自動並べ替え
 * @option 全て自動並べ替え
 * @option 並べ替えを行わず1番下に追加
 * @default 名前付きスクリプト以外自動並べ替え
 * @type select
 * 
 * @param RunFromDatabese
 * @text データベースから実行
 * @desc ONにすると従来通りデータベースからスクリプトを実行します。jsファイルを利用せず編集機能のみ利用する場合はONにします。
 * @default false
 * @type boolean
 * 
 */

if (!window.NAPI) { window.NAPI = {} };
Game_Interpreter.prototype.script = {};
$script = Game_Interpreter.prototype.script;

(() => {
    'use strict';
    const toBoolean = (string) => string === 'true';

    const param = PluginManager.parameters('NAPI_ExternalScript');
    const pSyncMode = param['SyncMode']; //select (string)
    const pAutoChangeScriptToJs = toBoolean(param['AutoChangeScriptToJs']); //boolean
    const pAutoDeleteFunction = param['AutoDeleteFunction']; //select (string)
    const pSortOrderNewScript = param['SortOrderNewScript']; //select (string)
    const pRunFromDatabese = toBoolean(param['RunFromDatabese']); //boolean

    // let scriptName = "";
    let folderPath = './js/plugins/exscript';
    let mapId = 0, eventId = 0, page = 0;
    let maxIdList = {};
    let reserveOverwriteMap = false;
    let jsText = {};
    let jsTextSplit = {};
    let reserveOverwriteNamedJs = false;
    let reserveOverwriteMapJs = false;
    let oldMtimeList = {};
    let oldMtimeListJs = {};
    const mtimeList = {};
    const mtimeListJs = {};
    const executionList = {};
    const executionListJs = {};
    const propList = new Map();
    let deleteType1 = false, deleteType2 = false, deleteType3 = false;
    let autoDeleteMode = 0;
    if (pAutoDeleteFunction === 'ON(名付きスクリプトを残す)') {
        autoDeleteMode = 1;
    } else if (pAutoDeleteFunction === 'ON(名付きスクリプトも削除)') {
        autoDeleteMode = 2;
    };

    //JavaScript 実行速度簡易計測用関数
    let markPoint = 1;
    const marker = function () {
        if (markPoint % 2 !== 0) {
            console.time("●marker" + markPoint + "-" + (markPoint + 1));
        } else { console.timeEnd("●marker" + (markPoint - 1) + "-" + markPoint) };
        markPoint++;
    };

    //init

    const fs = require('fs');

    try {
        fs.statSync(folderPath);
    } catch (e) { fs.mkdirSync(folderPath, { recursive: true }) };

    try {
        const dataJson = fs.readFileSync(folderPath + '/systemData.json', 'utf8');
        const data = JSON.parse(dataJson);
        console.log("data", data);
        oldMtimeList = data.mtimeList;
        oldMtimeListJs = data.mtimeListJs;
    } catch (e) { console.log(e); fs.closeSync(fs.openSync(folderPath + '/systemData.json', 'a')); };


    const getJsData = function (fileName) {
        const filePath = folderPath + '/' + fileName + '.js'
        try {
            mtimeListJs[fileName] = fs.statSync(filePath).mtimeMs;
            loadJsFile(filePath);
            loadJsTextFile(fileName);
        } catch (e) {
            fs.closeSync(fs.openSync(filePath, 'a'));
        };
    };

    const loadJsFile = function (filePath) {
        var url = filePath;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = false;
        script._url = url;
        document.body.appendChild(script);
    };

    const loadJsTextFile = function (fileName) {
        fs.readFile(folderPath + '/' + fileName + '.js', "utf-8", (err, data) => {
            if (err) throw err;
            jsText[fileName] = data;
        });
    };

    const getAllMapJs = function () {
        const fileList = fs.readdirSync(folderPath);
        fileList.forEach(e => {
            const fileName = e.match(/^(ScriptMap\d{3})\.js/);
            if (fileName && Utils.isOptionValid('test')) {
                getJsData(fileName[1]);
            } else if (fileName) {
                loadJsFile(folderPath + '/' + fileName[1] + '.js');
            };
        });

        // $dataMapInfos.forEach((e, index) => {
        //     if (e === null) { return };
        //     const num = String(e.id).padStart(3, 0);
        //     const fileName = 'ScriptMap' + num;
        //     if (Utils.isOptionValid('test')) {
        //         const filePath = folderPath + '/' + fileName + '.js'
        //         try {
        //             mtimeListJs[fileName] = fs.statSync(filePath).mtimeMs;
        //             loadJsFile(filePath);
        //             loadJsTextFile(fileName);
        //         } catch (e) { };
        //     } else {
        //         loadJsFile(fileName);
        //     };
        // });
    };

    const getAllMapModified = function () {
        $dataMapInfos.forEach(e => {
            if (e === null) { return };
            mapId = e.id;
            const num = String(e.id).padStart(3, 0);
            const fileName = 'Map' + num;
            const filePath = 'data/Map' + num + '.json';
            mtimeList[fileName] = fs.statSync(filePath).mtimeMs;
        });
        mtimeList.CommonEvents = fs.statSync('data/CommonEvents.json').mtimeMs;
    };

    const makeExecutionList = function () {
        const jsToData = function () {
            for (let key in mtimeListJs) {
                if (typeof oldMtimeListJs[key] === 'undefined' || mtimeListJs[key] > oldMtimeListJs[key]) {
                    executionListJs[key] = 1;
                };
            };
        };
        const dataToJs = function () {
            for (let key in mtimeList) {
                if (typeof oldMtimeList[key] === 'undefined' || mtimeList[key] > oldMtimeList[key]) {
                    executionList[key] = 1;
                };
            };
        };
        if (pSyncMode === '双方向同期') {
            jsToData();
            dataToJs();
        } else if (pSyncMode === 'jsファイルをゲームデータに上書き') {
            jsToData();
        } else if (pSyncMode === 'ゲームデータをjsファイルに上書き') {
            dataToJs();
        };
        console.log("executionList", executionList);
        console.log("executionListJs", executionListJs);
    };












    //start
    if (Utils.isOptionValid('test')) {
        getJsData('NamedScripts');
        getJsData('ScriptCommon');
    } else {
        loadJsFile(folderPath + '/NamedScripts.js');
        loadJsFile(folderPath + '/ScriptCommon.js');
    };
    getAllMapJs();

    const _Scene_Boot_prototype_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        if (Utils.isOptionValid('test')) {
            getAllMapModified();
            makeExecutionList();
            processCommonEvent(0, processScript);
            processAllMap(0, processScript);

            saveModifiedList();
            console.log("mtimeList", mtimeList, oldMtimeList);
            console.log("mtimeListJs", mtimeListJs, oldMtimeListJs);
            console.log("jsText", jsText);
            console.log("jsTextSprit", jsTextSplit);
            console.log("propList", propList);
            // loadOldModifiedList();
            // checkModified();
            // syncData();
            // setTimeout(test,1)
            // test()
            // saveMap(3)
        };
        _Scene_Boot_prototype_start.apply(this, arguments);

    };

    const processCommonEvent = function (mode, func) {
        if (autoDeleteMode !== 2 && mode === 0 && !executionListJs['ScriptCommon']
            && !executionList['CommonEvents'] && !executionListJs['NamedScripts']
            || autoDeleteMode === 2 && mode === 0 && !Object.keys(executionList).length
        ) { return };
        mapId = 0;
        $dataCommonEvents.forEach(e => {
            if (e === null) { return };
            eventId = e.id;
            e.list.forEach((command, index) => {
                if (command.code === 355) {
                    analyseScript(command, index, e.list);
                    func(command, index, e.list);
                };
            });
        });
        if (reserveOverwriteMap) {
            saveCommonEvents();
            reserveOverwriteMap = false;
        };
        if (reserveOverwriteMapJs || autoDeleteMode && executionList['CommonEvents']) {
            const mapJsName = 'ScriptCommon';
            const mapJsPath = folderPath + '/' + mapJsName + '.js';
            if (!jsTextSplit[mapJsName]) { splitJsText(mapJsName) };
            margeJsTextSplit(mapJsName);
            // jsText[mapJsName]=jsTextSplit[mapJsName].join('');
            fs.writeFileSync(mapJsPath, jsText[mapJsName]);
            mtimeListJs[mapJsName] = fs.statSync(mapJsPath).mtimeMs;
            reserveOverwriteMapJs = false;
        };
    };

    const processAllMap = function (mode, func) {
        NAPI.allMap = [];
        $dataMapInfos.forEach((e, index) => {
            if (e === null) { return };
            mapId = e.id;
            const num = String(e.id).padStart(3, 0);
            if (autoDeleteMode !== 2 && mode === 0 && !executionListJs['ScriptMap' + num]
                && !executionList['Map' + num] && !executionListJs['NamedScripts']
                || autoDeleteMode === 2 && mode === 0 && !Object.keys(executionList).length
            ) { return };
            const filePath = 'data/Map' + num + '.json';
            let thisMap = fs.readFileSync(filePath, 'utf8');
            thisMap = JSON.parse(thisMap);
            NAPI.allMap[index] = thisMap;
            processEventList(thisMap.events, analyseScript);
            processEventList(thisMap.events, func);
            if (reserveOverwriteMap) {
                saveMap(e.id);
                reserveOverwriteMap = false;
                console.log('CommonJs正常に書き込みが完了しました');
            };
            if (reserveOverwriteMapJs || autoDeleteMode && executionList['Map' + num]) {
                const mapJsName = 'ScriptMap' + String(e.id).padStart(3, 0);
                const mapJsPath = folderPath + '/' + mapJsName + '.js'
                // fs.writeFile(mapJsPath, jsText[mapJsName], (err) => {
                //     if (err) throw err;
                //     console.log('正常に書き込みが完了しました');
                // });
                if (!jsTextSplit[mapJsName]) { splitJsText(mapJsName) };
                margeJsTextSplit(mapJsName);
                // jsText[mapJsName]=jsTextSplit[mapJsName].join('')
                fs.writeFileSync(mapJsPath, jsText[mapJsName]);
                mtimeListJs[mapJsName] = fs.statSync(mapJsPath).mtimeMs;
                reserveOverwriteMapJs = false;
                console.log('MapJs正常に書き込みが完了しました');
            };
        });
        if (reserveOverwriteNamedJs || autoDeleteMode === 2 && Object.keys(executionList).length) {
            const namedJsPath = folderPath + '/NamedScripts.js';
            console.log('jsText', jsText['NamedScripts']);
            if (!jsTextSplit['NamedScripts']) { splitJsText('NamedScripts') };
            console.log('jsTextSplit', jsTextSplit['NamedScripts']);
            margeJsTextSplit('NamedScripts');

            // jsText['NamedScripts']=jsTextSplit['NamedScripts'].join('')
            fs.writeFileSync(namedJsPath, jsText['NamedScripts']);
            mtimeListJs['NamedScripts'] = fs.statSync(namedJsPath).mtimeMs;
            reserveOverwriteNamedJs = false;
            console.log('NamedJs書き込みが完了しました');
        };
    };

    const saveModifiedList = function () {
        const data = { mtimeList, mtimeListJs };
        fs.writeFileSync(folderPath + '/systemData.json', JSON.stringify(data));
    };

    const loadOldModifiedList = function () {
    };

    const checkModified = function () { };

    const syncData = function () { };

    const processEventList = function (list, func) {
        list.forEach(eEvent => {
            if (eEvent === null) { return };
            eventId = eEvent.id;
            eEvent.pages.forEach((ePage, index) => {
                page = index;
                ePage.list.forEach((command, index) => {
                    if (command.code === 355) {
                        func(command, index, ePage.list);
                    };
                });
            });
        });
    };

    const analyseScript = function (command, index, list) {
        const headerMatch = command.parameters[0].match(/^"\$script\.(\w*)";\s?/);
        if (!headerMatch) { return };

        command.exsScriptProperty = createProperty(headerMatch[1], headerMatch[0], command);
        // console.log('command.exsScript',command.exsScriptProperty)
        const prop = command.exsScriptProperty;
        propList.set(prop.name, command.exsScriptProperty);
    };

    const createProperty = function (scriptName, match, command) {
        const mapIdMatch = scriptName.match(/^(m(\d{1,3})_(\d{1,3})_(\d{1,2}))_(\d{1,7})/);
        const commonIdMatch = scriptName.match(/^(common(\d{1,4}))_(\d{1,7})/);
        let result = {};
        let headerMatch = match || '';
        if (mapIdMatch) {
            result = {
                type: 1,
                name: mapIdMatch[0],
                address: mapIdMatch[1],
                map: Number(mapIdMatch[2]),
                event: Number(mapIdMatch[3]),
                page: Number(mapIdMatch[4]),
                id: Number(mapIdMatch[5]),
                hLength: headerMatch.length,
                file: 'ScriptMap' + mapIdMatch[2].padStart(3, 0)
            };
            if (!maxIdList[mapIdMatch[1]] || result.id > maxIdList[mapIdMatch[1]]) {
                maxIdList[mapIdMatch[1]] = result.id;
            };
        } else if (commonIdMatch) {
            result = {
                type: 2,
                name: commonIdMatch[0],
                address: commonIdMatch[1],
                event: Number(commonIdMatch[2]),
                id: Number(commonIdMatch[3]),
                hLength: headerMatch.length,
                file: 'ScriptCommon'
            };
            if (!maxIdList[commonIdMatch[1]] || result.id > maxIdList[commonIdMatch[1]]) {
                maxIdList[commonIdMatch[1]] = result.id;
            };
        } else {
            result = {
                type: 3,
                name: scriptName,
                hLength: headerMatch.length,
                file: 'NamedScripts'
            };
        };
        return result;
    };

    const processScript = function (command, index, list) {
        //headerMatch=>command.exsScriptProperty
        // const headerMatch = command.parameters[0].match(/^"\$script\.(\w*)";\s?/);
        if (!command.exsScriptProperty) {
            if (!pAutoChangeScriptToJs) {
                return;
            };
            if (mapId === 0) {
                console.log("コモンタグ自動生成" + eventId);
                let newId = 1;
                const scriptAddress = 'common' + eventId;
                getJsMaxId();
                if (maxIdList[scriptAddress]) {
                    maxIdList[scriptAddress]++;
                    newId = maxIdList[scriptAddress];
                    console.log(scriptAddress, "newId", newId);
                } else { maxIdList[scriptAddress] = 1; };
                const scriptName = scriptAddress + '_' + newId;
                // headerMatch[1] = scriptName;
                command.exsScriptProperty = {
                    type: 2,
                    name: scriptName,
                    address: scriptAddress,
                    event: eventId,
                    id: newId,
                    hLength: 12 + scriptName.length,
                    file: 'ScriptCommon'
                };
                command.parameters[0] = '"$script.' + scriptName + '"; ' + command.parameters[0];
                reserveOverwriteMap = true;

            } else {
                console.log("マップイベントタグ自動生成" + mapId + '_' + eventId + '_' + (page + 1));
                let newId = 1;
                const scriptAddress = 'm' + mapId + '_' + eventId + '_' + (page + 1);
                getJsMaxId();
                if (maxIdList[scriptAddress]) {
                    maxIdList[scriptAddress]++;
                    newId = maxIdList[scriptAddress];
                    console.log("newId", newId);
                } else { maxIdList[scriptAddress] = 1; };
                const scriptName = scriptAddress + '_' + newId;
                command.exsScriptProperty = {
                    type: 1,
                    name: scriptName,
                    address: scriptAddress,
                    map: mapId,
                    event: eventId,
                    page: page + 1,
                    id: newId,
                    hLength: 12 + scriptName.length,
                    file: 'ScriptMap' + String(mapId).padStart(3, 0)
                };
                command.parameters[0] = '"$script.' + scriptName + '"; ' + command.parameters[0];
                reserveOverwriteMap = true;
            };
        };
        const prop = command.exsScriptProperty;
        propList.set(prop.name, prop);

        if (Game_Interpreter.prototype.script[prop.name]) { //その名前の関数が存在する時
            let count = 1;
            while (list[index + count].code === 655) {
                count++;
            };
            // if (prop.type===1&&oldMtimeListJs['ScriptMap'+String(prop.map).padStart(3, 0)] 
            // >= mtimeListJs['ScriptMap'+String(prop.map).padStart(3, 0)]
            // ||prop.type===2&&oldMtimeListJs['ScriptCommon'] >= mtimeListJs['ScriptCommon']
            // ||prop.type===3&&oldMtimeListJs['NamedScripts'] >= mtimeListJs['NamedScripts']) {
            //     console.log("変更なし");
            //     return
            // };
            if (prop.type === 1 && executionListJs['ScriptMap' + String(prop.map).padStart(3, 0)]
                || prop.type === 2 && executionListJs['ScriptCommon']
                || prop.type === 3 && executionListJs['NamedScripts']) {
                console.log("js変更あり マップ書き換え", prop.name);
                rewriteCommands(command, index, list, prop.name, count);
            } else if (prop.type === 1 && executionList['Map' + String(prop.map).padStart(3, 0)]
                || prop.type === 2 && executionList['CommonEvents']
                || prop.type === 3 && executionList['CommonEvents']) {
                console.log("マップ変更ありjs書き換え", prop.name);
                rewriteJs(command, index, list);
            };

        } else { //その名前の関数が存在しない時
            console.log(prop.name, "がメソッドにありません", Game_Interpreter.prototype.script[prop.name]);
            let newScript = combineScriptLine(command, index, list) + '\n';
            // let count = 1;
            // let script = command.parameters[0];
            // script = script.slice(prop.hLength, script.length);
            // while (list[index + count].code === 655) {
            //     script = script + '\n' + list[index + count].parameters[0];
            //     count++;
            // };

            // const defaultFormat = '$script.';
            // let newScript = defaultFormat + prop.name + ' = function() {\n' + script + '\n};\n';

            if (jsText[prop.file]) {
                if (!jsTextSplit[prop.file]) { splitJsText(prop.file) };
                jsTextSplit[prop.file].push(prop.name);
                jsTextSplit[prop.file].push(newScript);
            } else {
                jsText[prop.file] = newScript;
                jsTextSplit[prop.file] = ['', prop.name, newScript];
            };
            reserveOverwriteJs(prop);
            // if (prop.type===1) { //ScriptMapに保存予約
            //     console.log("ScriptMap.jsに保存予約")
            //     const fileName='ScriptMap'+String(prop.map).padStart(3, 0);
            //     if (jsText[fileName]) { 
            //         jsText[fileName] = jsText[fileName] + '\n' + newScript;
            //     }else{
            //         jsText[fileName]=newScript;
            //     }; 
            //     reserveOverwriteMapJs = true;

            // } else if (prop.type===2) { //ScriptCommonに保存予約
            //     console.log("ScriptCommon.jsに保存予約")
            //     const fileName='ScriptCommon';
            //     if (jsText[fileName]) { 
            //         jsText[fileName] = jsText[fileName] + '\n' + newScript;
            //     }else{
            //         jsText[fileName]=newScript;
            //     }; 
            //     reserveOverwriteMapJs = true;

            // } else { //NamedScriptsに保存予約
            //     if (jsText['NamedScripts']) { 
            //         jsText['NamedScripts'] = jsText['NamedScripts'] + '\n' + newScript;
            //     }else{
            //         jsText['NamedScripts']=newScript;
            //     };
            //     reserveOverwriteNamedJs = true;
            // };
        };
    };

    const getJsMaxId = function () {
        let match = '';
        const scriptNameArray = Object.keys(Game_Interpreter.prototype.script);
        console.log(scriptNameArray)
        scriptNameArray.forEach(e => {
            match = e.match(/^(m\d{1,3}_\d{1,3}_\d{1,2})_(\d{1,7})/);
            if (match && !maxIdList[match[1]] || match && Number(match[2]) > maxIdList[match[1]]) {
                maxIdList[match[1]] = Number(match[2]);
            } else {
                match = e.match(/^(common\d{1,4})_(\d{1,7})/);
                if (match && !maxIdList[match[1]] || match && Number(match[2]) > maxIdList[match[1]]) {
                    maxIdList[match[1]] = Number(match[2]);
                };
            };
        });
    };


    const rewriteCommands = function (command, index, list, scriptName, count) {
        const splitScript = String(Game_Interpreter.prototype.script[scriptName]).split('\n');
        splitScript[0] = splitScript[0].replace(/function\s?\(\)\s?{\s?/, "");
        if (splitScript[0] === '') { splitScript.shift() };
        splitScript[0] = '"$script.' + scriptName + '"; ' + splitScript[0];
        splitScript[splitScript.length - 1] = splitScript[splitScript.length - 1].replace(/}$/, "");
        if (!splitScript[splitScript.length - 1]) { splitScript.pop() };

        command.parameters[0] = splitScript.shift();
        const splitObj = splitScript.map(e => {
            const obj655 = { code: 655, indent: 0, parameters: [] };
            obj655.parameters[0] = e;
            return obj655;
        });
        list.splice(index + 1, count - 1, ...splitObj);
        reserveOverwriteMap = true;
    };

    const rewriteJs = function (command, index, list) {
        const prop = command.exsScriptProperty;
        if (!jsTextSplit[prop.file]) { splitJsText(prop.file) };
        jsTextSplit[prop.file].forEach((e, index2, array) => {
            if (e === prop.name) {
                array[index2 + 1] = combineScriptLine(command, index, list) + '\n';
                // console.log("combine",combineScriptLine(command, index, list))
            };
        });
        reserveOverwriteJs(prop);
    };

    const splitJsText = function (fileName) {
        const separator = /\n(?=\$script\.([^\=\s]{1,30})\s?\=\s?function\s?\(\)\s?\{)/;
        const text = '\n' + jsText[fileName];
        jsTextSplit[fileName] = text.split(separator);
        // console.log("spritJs", jsTextSplit[fileName]);
    };

    const combineScriptLine = function (command, index, list) {
        const prop = command.exsScriptProperty;
        let count = 1;
        let script = command.parameters[0];
        script = script.slice(prop.hLength, script.length);
        while (list[index + count].code === 655) {
            script = script + '\n' + list[index + count].parameters[0];
            count++;
        };

        const defaultFormat = '$script.';
        let newScript = defaultFormat + prop.name + ' = function() {\n' + script + '\n};\n';
        return newScript;
    };

    const reserveOverwriteJs = function (prop) {
        if (prop.type === 1) { //ScriptMapに保存予約
            console.log("ScriptMap.jsに保存予約")
            reserveOverwriteMapJs = true;
        } else if (prop.type === 2) { //ScriptCommonに保存予約
            console.log("ScriptCommon.jsに保存予約")
            reserveOverwriteMapJs = true;
        } else { //NamedScriptsに保存予約
            reserveOverwriteNamedJs = true;
        };
    };

    const margeJsTextSplit = function (fileName) {
        if (autoDeleteMode) {
            deleteUnusedFunction(fileName)
        };
        if (pSortOrderNewScript === '全て自動並べ替え'
            || pSortOrderNewScript === '名前付きスクリプト以外自動並べ替え'
            && fileName !== 'NamedScripts') {
            sortMargeJsTextSplit(fileName);
        } else { margeOnlyJsTextSplit(fileName); };
    };

    const deleteUnusedFunction = function (fileName) {
        jsTextSplit[fileName] = jsTextSplit[fileName].filter((e, index, array) => {
            if (index % 2 !== 0 && propList.has(e)) {
                return true;
            } else if (index % 2 === 0 && index !== 0 && propList.has(array[index - 1])) {
                return true;
            } else if (index === 0) {
                return true;
            } else { return false; }
        });
        // console.log("使ってないjs削除",test)
    };

    const margeOnlyJsTextSplit = function (fileName) {
        let result = '';
        jsTextSplit[fileName].forEach((e, index) => {
            if (index % 2 === 0) {
                result = result + e;
            };
        });
        jsText[fileName] = result;
    };

    const sortMargeJsTextSplit = function (fileName) {
        const convertArray = [];
        jsTextSplit[fileName].forEach((e, index, array) => {
            if (index % 2 !== 0) {
                convertArray.push([e, array[index + 1]]);
            };
        });
        convertArray.sort((a, b) => {
            let propA = {}, propB = {};
            if (propList.has(a[0])) {
                propA = propList.get(a[0]);
            } else { propA = createProperty(a[0]); };
            if (propList.has(b[0])) {
                propB = propList.get(b[0]);
            } else { propB = createProperty(b[0]); };

            if (propA.type === 1) {
                if (propA.event > propB.event) {
                    return 1;
                } else if (propA.event < propB.event) {
                    return -1;
                } else if (propA.event === propB.event) {
                    if (propA.list > propB.list) {
                        return 1;
                    } else if (propA.list < propB.list) {
                        return -1;
                    } else if (propA.list === propB.list) {
                        if (propA.id > propB.id) {
                            return 1;
                        } else if (propA.id < propB.id) {
                            return -1;
                        } else if (propA.id === propB.id) {
                            return 0;
                        };
                    };
                };
            } else if (propA.type === 2) {
                if (propA.event > propB.event) {
                    return 1;
                } else if (propA.event < propB.event) {
                    return -1;
                } else if (propA.event === propB.event) {
                    if (propA.id > propB.id) {
                        return 1;
                    } else if (propA.id < propB.id) {
                        return -1;
                    } else if (propA.id === propB.id) {
                        return 0;
                    };
                };
            } else {
                const lowerA = a[0].toLowerCase();
                const lowerB = b[0].toLowerCase();
                if (lowerA > lowerB) {
                    return 1;
                } else if (lowerA < lowerB) {
                    return -1;
                } else if (lowerA === lowerB) {
                    return 0;
                };
            };
        });
        let result = jsTextSplit[fileName][0];
        convertArray.forEach(e => {
            result = result + e[1];
        });
        jsText[fileName] = result;
    };

    const saveMap = function (mapId) {
        const num = String(mapId).padStart(3, 0);
        const fileName = 'Map' + num;
        const filePath = './data/' + fileName + '.json';
        const dataJson = JSON.stringify(NAPI.allMap[mapId].data);
        let eventsJson = '"events":[';
        NAPI.allMap[mapId].events.forEach(e => eventsJson = eventsJson + "\n" + JSON.stringify(e) + ",");
        eventsJson = eventsJson.slice(0, eventsJson.length - 1);
        const rep = function (key, value) {
            if (key === "data" || key === "events") { return undefined };
            return value;
        };
        let shavedMap = JSON.stringify(NAPI.allMap[mapId], rep);
        shavedMap = shavedMap.slice(1, shavedMap.length - 1);
        shavedMap = "{\n" + shavedMap + ',\n"data":' + dataJson + ",\n" + eventsJson + "\n]\n}";
        fs.writeFileSync(filePath, shavedMap);
        mtimeList[fileName] = fs.statSync(filePath).mtimeMs;
    };

    const saveCommonEvents = function () {
        const fileName = 'CommonEvents';
        let eventsJson = '[';
        const repProp = function (key, value) {
            if (key === "exsScriptProperty") { return undefined };
            return value;
        };
        $dataCommonEvents.forEach(e => eventsJson = eventsJson + "\n" + JSON.stringify(e, repProp) + ",");
        eventsJson = eventsJson.slice(0, eventsJson.length - 1);
        const data = eventsJson + '\n]';
        fs.writeFileSync('./data/CommonEvents.json', data);
        mtimeList[fileName] = fs.statSync('./data/CommonEvents.json').mtimeMs;
    };

    NAPI.exsDeleteTags = function (input) {
        console.log(input);
        let fileMatch = '';
        if (input) {
            fileMatch = input.match(/^ScriptMap\d{3}/);
        };

        if (input === undefined) { //自動入力された連番タグを全て除去します。
            deleteType1 = deleteType2 = true;
        } else if (input === 'AllScripts') {
            deleteType1 = deleteType2 = deleteType3 = true;
        } else if (input === 'NamedScripts') {
            deleteType3 = true;
        } else if (input === 'ScriptCommon') {
            deleteType2 = true;
        } else if (fileMatch) {
            deleteType1 = true;
        } else if (input === 'ScriptMap') {
            deleteType1 = true;
        };
        processCommonEvent(1, processDeleteTags);
        processAllMap(1, processDeleteTags);
        deleteType1 = deleteType2 = deleteType3 = false;
    };

    const processDeleteTags = function (command, index, list) {
        if (!command.exsScriptProperty
            || command.exsScriptProperty.type === 1 && !deleteType1
            || command.exsScriptProperty.type === 2 && !deleteType2
            || command.exsScriptProperty.type === 3 && !deleteType3
        ) { return };
        const prop = command.exsScriptProperty;
        let script = command.parameters[0];
        command.parameters[0] = script.slice(prop.hLength, script.length);
        console.log('delete', prop.name);

        if (jsText[prop.file] && !jsTextSplit[prop.file]) {
            splitJsText(prop.file);
            reserveOverwriteJs(prop);
        };
        propList.delete(prop.name);
        delete command.exsScriptProperty;
        reserveOverwriteMap = true;
    };









    const _Game_Interpreter_prototype_command355 = Game_Interpreter.prototype.command355;
    Game_Interpreter.prototype.command355 = function () {
        const headerMatch = this.currentCommand().parameters[0].match(/^"\$script\.(\w*)"/);
        if (headerMatch) {
            if (this.script[headerMatch[1]]) {
                if (pRunFromDatabese) {
                    console.log("通常eval");
                    _Game_Interpreter_prototype_command355.apply(this, arguments);
                } else {
                    while (this.nextEventCode() === 655) {
                        this._index++;
                    };
                    console.log(".js関数" + headerMatch[1] + "を実行");
                    this.script[headerMatch[1]].apply(this, arguments);
                };
            } else {
                console.log(headerMatch[1], "がメソッドにありません");
            };
            return true;
        } else {
            console.log("通常eval");
            return _Game_Interpreter_prototype_command355.apply(this, arguments);
        };
    };

    const _Game_Interpreter_prototype_command105 = Game_Interpreter.prototype.command105;
    Game_Interpreter.prototype.command105 = function () {
        const headerMatch = this._list[this._index + 1].parameters[0].match(/^"\$script\.(\w*)"/);
        if (headerMatch) {
            if (this.script[headerMatch[1]]) {
                while (this.nextEventCode() === 405) {
                    this._index++;
                };
                console.log(".js関数" + headerMatch[1] + "を実行");
                this.script[headerMatch[1]].apply(this, arguments);
            } else {
                console.log(headerMatch[1], "がメソッドにありません");
            };
            return true;
        } else {
            _Game_Interpreter_prototype_command105.apply(this, arguments);
        };
    };














































    // const loadAllMap = function() {
    //     NAPI.allMap=[];
    //     $dataMapInfos.forEach((e,index)=>{
    //         if(e===null){return};
    //         NAPI.allMap.push(null);
    //         const xhr = new XMLHttpRequest();
    //         const num = String(e.id).padZero(3);
    //         const url = 'data/' + 'Map'+num+'.json';
    //         let thisMap={};
    //         xhr.open('GET', url);
    //         xhr.overrideMimeType('application/json');
    //         xhr.onload = function() {
    //             if (xhr.status < 400) {
    //                 thisMap = JSON.parse(xhr.responseText);
    //                 // DataManager.onLoad(thisMap);
    //                 NAPI.allMap[index]=thisMap;
    //                 processEventList(thisMap.events);
    //             }
    //         };
    //         xhr.send();
    //     });
    // };


    const testXHR = function () {
        const xhr = new XMLHttpRequest();
        const num = String(3).padZero(3);
        const url = 'data/' + 'Map' + num + '.json';
        let thisMap = {};
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload = function () {
            // if (xhr.status < 400) {
            //     thisMap = JSON.parse(xhr.responseText);
            //     // DataManager.onLoad(thisMap);
            //     NAPI.allMapTest=thisMap;
            // }
        };
        xhr.send();
    };

    const testReadFile = function () {
        const num = String(3).padStart(3, 0);
        const filePath = 'data/Map' + num + '.json';
        let thisMap = fs.readFileSync(filePath, 'utf8');
        // thisMap=JSON.parse(thisMap);
        // NAPI.allMapTest=thisMap;
    };

    const testStatFile = function () {
        let thisMap = fs.statSync(filePath, 'utf8');
    };

    NAPI.allMapTest = {};

    const tester = function () {
        marker();
        for (let i = 0; i < 10000; i++) {
            try {
                fs.openSync(folderPath + '/systemData.js', 'a')
            } catch (err) {
            };
        };
        marker();

    };

    // tester();

    const test = function () { saveMap(3) }

    // NAPI.testObj={testA:1,testB:2};
    // let {testA,testB}=NAPI.testObj;
    // testA=3;
    // NAPI.testObj.testB=7;
    // console.log(NAPI.testObj.testA,NAPI.testObj.testB)
    // console.log(testA,testB)


})();



