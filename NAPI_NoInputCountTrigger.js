//=============================================================================
// NAPI_NoInputCountTrigger.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/12/02 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 一定時間入力無し検知プラグイン (MV)
 * @author なぴぃ
 * 
 * @help 一定時間入力が無い事を検知してスイッチやコモンイベントを操作します。
 * 再度いずれかの操作が行われた時に終了処理を行う為の全入力検知もできます。
 * 
 * 使用例1）しばらく入力がなかった時に休憩モーションを入れて回復を行う。
 * 使用例2）操作をやめて少しするとメニューUIが表示される。
 * 
 * 
 * ●使い方
 * プラグインパラメーターでスイッチやコモンイベントの番号を設定します。
 * 一定時間入力がなかった時その番号のスイッチやコモンイベントが起動します。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * @param NoInputCountTime
 * @text 入力なし判定時間
 * @desc 入力なしと判定されるまでの字間をフレーム数で指定します。（60で1秒）
 * @default 60
 * @type number
 * 
 * @param NoInputCountSwitch
 * @text 入力無しスイッチ
 * @desc 一定時間操作がなかった時ここで設定したスイッチがONになります。（0でオフ）
 * @default 0
 * @type switch
 * 
 * @param NoInputCountCommon
 * @text 入力無しコモンイベント
 * @desc 一定時間操作がなかった時ここで設定したコモンイベントが作動します。（0でオフ）
 * @default 0
 * @type common_event
 * 
 * @param AnyInputSwitch
 * @text 入力ありスイッチ
 * @desc 再度いずれかの操作が行われた時ここで設定したスイッチがONになります。（0でオフ）
 * @default 0
 * @type switch
 * 
 * @param AnyInputCommon
 * @text 入力ありコモンイベント
 * @desc 再度いずれか操作が行われた時ここで設定したスイッチがONになります。（0でオフ）
 * @default 0
 * @type common_event
 * 
 * @param DisableSwitch
 * @text 機能OFFスイッチ
 * @desc このスイッチがONになっている間このプラグインの機能を一時的に無効化します。
 * @default 0
 * @type switch
 * 
 */



(() => {
'use strict';

const param = PluginManager.parameters('NAPI_NoInputCountTrigger');
const pNoInputCountTime = Number(param['NoInputCountTime']); //number
const pNoInputCountSwitch = Number(param['NoInputCountSwitch']); //switch(number
const pNoInputCountCommon = Number(param['NoInputCountCommon']); //common(number
const pAnyInputSwitch = Number(param['AnyInputSwitch']); //switch(number
const pAnyInputCommon = Number(param['AnyInputCommon']); //common(number
const pDisableSwitch = Number(param['DisableSwitch']); //switch(number


Input.NoInputCounter=0;
Input.NoInputCounterDisable=false;
Input.NoInputCountSwitch=false;

const _Input_update = Input.update;
Input.update = function() {
	_Input_update.apply(this,arguments);
	if(!pDisableSwitch||$gameSwitches&&pDisableSwitch&&!$gameSwitches._data[pDisableSwitch]){
		if(Input.NoInputCounterDisable){
			Input.NoInputCounter=0;
			Input.NoInputCounterDisable=false;
		};
		if (this._currentState[this._latestButton]||TouchInput.isTriggered()) {
			if(pNoInputCountTime<Input.NoInputCounter&&pAnyInputSwitch){
				$gameSwitches._data[pAnyInputSwitch]=true;
			};
			if(pNoInputCountTime<Input.NoInputCounter&&pAnyInputCommon){
				$gameTemp.reserveCommonEvent(pAnyInputCommon)
			};
			Input.NoInputCounter=0;
		};
		Input.NoInputCounter=Input.NoInputCounter+1;
		if(Input.NoInputCounter===pNoInputCountTime){
			if(pNoInputCountSwitch){
				$gameSwitches._data[pNoInputCountSwitch]=true;
			};
			if(pNoInputCountCommon){
				$gameTemp.reserveCommonEvent(pNoInputCountCommon)
			};
		};
	}else{
		Input.NoInputCounterDisable=true;
	}
};


})();



