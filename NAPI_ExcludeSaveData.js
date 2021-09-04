//=============================================================================
// NAPI_ExcludeSaveData.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 0.1.0 2021/09/04 ベータ版公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc セーブデータ内容取捨選択プラグイン （MV）
 * @author なぴぃ
 * 
 * @help セーブデータに含める内容を取捨選択しセーブデータを軽量化します。
 * 
 * ツクールの一部の機能しか使っていないミニゲームや独自システムのゲーム、
 * 例えば変数だけ保存されれば後は初期化されていい等といった場合に有効です。
 * ツクールの機能をフルに使ったRPG等では他の軽量化プラグインを使う事をお勧めします。
 * 
 * $gameSystemと$gameMap以外のゲームデータに紐づけられたプラグインのデータも
 * 紐づけられたデータと共にセーブされなくなります。
 * 
 * プレイヤーの位置情報をセーブしなかった場合等はロード時の開始位置を設定する事もできます。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * 
 * 
 * @param $gameScreen
 * @text 画面表示データ除外
 * @desc ピクチャ等の画面に表示されているデータ（$gameScreen）をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param $gameTimer
 * @text タイマーデータ除外
 * @desc 現在のタイマーの状態（$gameTimer）をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param $gameSwitches
 * @text スイッチデータ除外
 * @desc 現在のスイッチの状態（$gameSwitches）をセーブデータから除外します。(ON/OFF)
 * @default false
 * @type boolean
 * 
 * @param $gameVariables
 * @text 変数データ除外
 * @desc 現在の変数の状態（$gameVariables）をセーブデータから除外します。(ON/OFF)
 * @default false
 * @type boolean
 * 
 * @param $gameSelfSwitches
 * @text セルフスイッチデータ除外
 * @desc 現在のセルフスイッチの状態（$gameSelfSwitches）をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param $gameActors
 * @text アクターデータ除外
 * @desc アクターの現在のステータスや状態（$gameActors）をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param $gameParty
 * @text パーティー・所持アイテム等除外
 * @desc 常に壁やイベント等をすり抜けるモードで開始します。(ON/OFF)をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param $gameMap
 * @text マップデータ除外
 * @desc 現在のマップのイベントデータ情報（$gameMap）をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param $gamePlayer
 * @text プレイヤーデータ除外
 * @desc プレイヤーの位置や向き（$gamePlayer）をセーブデータから除外します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param LoadStartMap
 * @text ロード時の開始マップID指定
 * @desc ロード時の開始マップIDを強制的にこのマップに変更します。0で機能オフ。最初にVを付けると変数で指定できます。（例：V2で変数2番）
 * @default 0
 * @type string
 * 
 * @param LoadStartX
 * @text ロード時の開始X座標指定
 * @desc ロード時の開始X座標を強制的にこの座標に変更します。0で機能オフ。最初にVを付けると変数で指定できます。（例：V2で変数2番）
 * @default 0
 * @type string
 * 
 * @param LoadStartY
 * @text ロード時の開始Y座標指定
 * @desc ロード時の開始Y座標を強制的にこの座標に変更します。0で機能オフ。最初にVを付けると変数で指定できます。（例：V2で変数2番）
 * @default 0
 * @type string
 * 
 */


(() => {
'use strict';

//型変換
function toBoolean(param){
    return param.toLowerCase()==='true';
};

const param = PluginManager.parameters('NAPI_ExcludeSaveData');
const excludeSystem       = false;
const excludeScreen       = toBoolean(param['$gameScreen']); //string => boolean
const excludeTimer        = toBoolean(param['$gameTimer']); //string => boolean
const excludeSwitches     = toBoolean(param['$gameSwitches']); //string => boolean
const excludeVariables    = toBoolean(param['$gameVariables']); //string => boolean
const excludeSelfSwitches = toBoolean(param['$gameSelfSwitches']); //string => boolean
const excludeActors       = toBoolean(param['$gameActors']); //string => boolean
const excludeParty        = toBoolean(param['$gameParty']); //string => boolean
const excludeMap          = toBoolean(param['$gameMap']); //string => boolean
const excludePlayer       = toBoolean(param['$gamePlayer']); //string => boolean
const LoadStartMap        = param['LoadStartMap']; //string
const LoadStartX          = param['LoadStartX']; //string
const LoadStartY          = param['LoadStartY']; //string


let keepGameMap={};

DataManager.makeSaveContents = function() {
    const contents = {};
    if(!excludeSystem      ){contents.system      =$gameSystem      ;}else{contents.system      =undefined};
    if(!excludeScreen      ){contents.screen      =$gameScreen      ;}else{contents.screen      =undefined};
    if(!excludeTimer       ){contents.timer       =$gameTimer       ;}else{contents.timer       =undefined};
    if(!excludeSwitches    ){contents.switches    =$gameSwitches    ;}else{contents.switches    =undefined};
    if(!excludeVariables   ){contents.variables   =$gameVariables   ;}else{contents.variables   =undefined};
    if(!excludeSelfSwitches){contents.selfSwitches=$gameSelfSwitches;}else{contents.selfSwitches=undefined};
    if(!excludeActors      ){contents.actors      =$gameActors      ;}else{contents.actors      =undefined};
    if(!excludeParty       ){contents.party       =$gameParty       ;}else{contents.party       =undefined};
    if(!excludeMap         ){contents.map         =$gameMap         ;}else{
        contents.map=$gameMap;
        keepGameMap._events=$gameMap._events;
        keepGameMap._commonEvents=$gameMap._commonEvents;
        // keepGameMap._vehicles=$gameMap._vehicles;
        contents.map._events=[];
        contents.map._commonEvents=[];
        // contents.map._vehicles=[];
    }
    if(!excludePlayer      ){contents.player      =$gamePlayer      ;}else{contents.player      =undefined};
    return contents;
};

const _Scene_Save_onSavefileOk = Scene_Save.prototype.onSavefileOk;
Scene_Save.prototype.onSavefileOk = function() {
    _Scene_Save_onSavefileOk.apply(this,arguments);
    $gameMap._events=keepGameMap._events;
    $gameMap._commonEvents=keepGameMap._commonEvents;
    // $gameMap._vehicles=keepGameMap._vehicles;
};

DataManager.extractSaveContents = function(contents) {
    if(contents.system      !==undefined){$gameSystem       = contents.system      ;};
    if(contents.screen      !==undefined){$gameScreen       = contents.screen      ;};
    if(contents.timer       !==undefined){$gameTimer        = contents.timer       ;};
    if(contents.switches    !==undefined){$gameSwitches     = contents.switches    ;};
    if(contents.variables   !==undefined){$gameVariables    = contents.variables   ;};
    if(contents.selfSwitches!==undefined){$gameSelfSwitches = contents.selfSwitches;};
    if(contents.actors      !==undefined){$gameActors       = contents.actors      ;};
    if(contents.party       !==undefined){$gameParty        = contents.party       ;};
    if(contents.map         !==undefined){$gameMap          = contents.map         ;};
    if(contents.player      !==undefined){$gamePlayer       = contents.player      ;};
};

const _Scene_Load_prototype_onSavefileOk = Scene_Load.prototype.onSavefileOk;
Scene_Load.prototype.onSavefileOk = function() {
    _Scene_Load_prototype_onSavefileOk.apply(this,arguments);

    $gameMap._events=keepGameMap._events;
    $gameMap._commonEvents=keepGameMap._commonEvents;
    // $gameMap._vehicles=keepGameMap._vehicles;
};

function variableDivide(param){
    if(param.slice(0,1)==="V"){
        const value=$gameVariables.value(Number(param.slice(1)));
        return Number(value);
    }else{
        return Number(param);
    }
};

const _Scene_Load_prototype_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
    _Scene_Load_prototype_onLoadSuccess.apply(this,arguments);

    if(excludePlayer){
        $gameParty.setupStartingMembers();
    };
    const startMap=variableDivide(LoadStartMap);
    const startX=variableDivide(LoadStartX);
    const startY=variableDivide(LoadStartY);
    let transferFlag=false;
    let mapId=0;
    let mapX=0;
    let mapY=0;
    if(startMap===0){mapId=$gameMap._mapId;}else{mapId=startMap;transferFlag=true;};
    if(startX===0){mapX=$gamePlayer.x;}else{mapX=startX;transferFlag=true;};
    if(startY===0){mapY=$gamePlayer.y;}else{mapY=startY;transferFlag=true;};
    if(excludeMap){transferFlag=true;};
    if(transferFlag=true){
        $gamePlayer.reserveTransfer(mapId,mapX,mapY);
        $gamePlayer.requestMapReload();
    };
};


})();



