//=============================================================================
// NAPI_SwitchOnAtMessage.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/12/26 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @target MV MZ
 * @plugindesc 文章の表示並列コモンスイッチプラグイン
 * @author なぴぃ
 * 
 * @help 文章を表示した時と閉じた時にスイッチをオンにします。
 * これにより並列コモンイベントを操作し好きな演出を加えられます。
 * 
 * 
 * ●使い方
 * プラグインパラメーターで並列コモンイベントを操作する為のスイッチを設定します。
 * スイッチを利用して並列コモンイベントを起動します。
 * 並列コモンイベントの最後でそのスイッチをオフにする事を忘れずに行ってください。
 * 
 * 
 * ●コモンイベントに文章の表示の情報を利用する（上級者向け）
 * 以下の情報が利用できます。スクリプトで使用して下さい。
 * 
 * NAPI.soamFaceImage　顔画像のファイル名
 * NAPI.soamFaceIndex　顔画像のインデックス
 * NAPI.soamBackground　ウィンドウ背景（0.ウィンドウ 1.暗くする 2.透明）
 * NAPI.soamPositionType　ウィンドウの位置（0.上 1.中 2.下）
 * NAPI.soamSpeakerName　名前
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * 
 * @param SwitchAtShowText
 * @text 文章表示時ONになるスイッチ
 * @desc 文章が表示される時ここで設定したスイッチがONになります。並列コモンイベントの起動等に利用できます。0で機能OFF。
 * @default 0
 * @type switch
 * 
 * @param SwitchAtCloseText
 * @text 文章クローズ時ONになるスイッチ
 * @desc 表示された文章が消えた時ここで設定したスイッチがONになります。並列コモンイベントの起動等に利用できます。0で機能OFF。
 * @default 0
 * @type switch
 * 
 * @param DisableFaceGraphic
 * @text 顔画像強制非表示
 * @desc 顔画像を全て非表示にします。（並列コモンイベント等で代わりにピクチャを表示する時用）
 * @default false
 * @type boolean
 * 
 */

if(!window.NAPI){window.NAPI={}}

(() => {
'use strict';

const param = PluginManager.parameters('NAPI_SwitchOnAtMessage');
const pSwitchAtShowText = Number(param['SwitchAtShowText']); //switch(number
const pSwitchAtCloseText = Number(param['SwitchAtCloseText']); //switch(number
const pDisableFaceGraphic = param['DisableFaceGraphic']; //boolean(string


const _Game_Interpreter=Game_Interpreter.prototype.command101;
Game_Interpreter.prototype.command101=function(params) {
	if(!$gameMessage.isBusy()){
        if(Utils.RPGMAKER_NAME==="MZ"){
            NAPI.soamFaceImage=params[0];
            NAPI.soamFaceIndex=params[1];
            NAPI.soamBackground=params[2];
            NAPI.soamPositionType=params[3];
            NAPI.soamSpeakerName=params[4];
        }else if(Utils.RPGMAKER_NAME==="MV"){
            NAPI.soamFaceImage=this._params[0];
            NAPI.soamFaceIndex=this._params[1];
            NAPI.soamBackground=this._params[2];
            NAPI.soamPositionType=this._params[3];
            NAPI.soamSpeakerName="";
        };
		const result=_Game_Interpreter.apply(this, arguments);
        if(pSwitchAtShowText){$gameSwitches.setValue(pSwitchAtShowText,true);};
		return result;
	}else{
		return false;
	};
};

const _Window_Message_prototype_terminateMessage=Window_Message.prototype.terminateMessage;
Window_Message.prototype.terminateMessage = function() {
    _Window_Message_prototype_terminateMessage.apply(this,arguments);
    if(pSwitchAtCloseText){$gameSwitches.setValue(pSwitchAtCloseText,true);};
};

const _Game_Message_prototype_setFaceImage=Game_Message.prototype.setFaceImage;
Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
    _Game_Message_prototype_setFaceImage.apply(this,arguments);
    if(pDisableFaceGraphic==="true"){
        this._faceName="";
        this._faceIndex=0;
    };
};



})();



