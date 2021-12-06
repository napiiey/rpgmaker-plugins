//=============================================================================
// NAPI_AccelerateSelectableWindow.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/12/06 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc ウィンドウ操作途中加速プラグイン
 * @author なぴぃ
 * 
 * @help ウィンドウ操作やショップの個数選択中、長押し操作で段階的に加速します。
 * タッチやマウス操作でのスクロール操作（長押ししながらウィンドウ外にスワイプ）
 * も途中加速します。
 * 
 * 
 * ●使い方
 * プラグインフォルダに導入するだけで動作します。
 * プラグインパラメーターで加速開始までの時間や速度等も調整できます。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * @param StartTime
 * @text 加速開始までの時間
 * @desc 加速が始まるまでの時間をフレーム数で設定します。（60で1秒）
 * @default 140
 * @type number
 * 
 * @param DefaultSpeed
 * @text 非加速時の速度
 * @desc 加速時の速度を設定します。（10が最速、初期値5）
 * @default 5
 * @type number
 * @min 1
 * @max 10
 * 
 * @param AccelSpeed
 * @text 加速時の速度
 * @desc 加速時の速度を設定します。（10が最速）
 * @default 9
 * @type number
 * @min 1
 * @max 10
 * 
 * @param DefaultTouchScrollSpeed
 * @text defaultTouchScrollSpeed
 * @desc 非加速時のタッチスクロール速度を設定します。（10が最速、プラグイン未導入時は1）。
 * @default 4
 * @type number
 * @min 1
 * @max 10
 * 
 * @param AccelTouchScrollSpeed
 * @text 加速時の速度
 * @desc 加速時のタッチスクロール速度を設定します。（10が最速）
 * @default 9
 * @type number
 * @min 1
 * @max 10
 * 
 */



(() => {
'use strict';

const param = PluginManager.parameters('NAPI_NumberAndCursorAccel');
const pStartTime=Number(param['StartTime']);
const pDefaultSpeed=Number(param['DefaultSpeed']);
const pAccelSpeed=Number(param['AccelSpeed']);
const pDefaultTouchScrollSpeed=Number(param['DefaultTouchScrollSpeed']);
const pAccelTouchScrollSpeed=Number(param['AccelTouchScrollSpeed']);
 
let startTime=pStartTime;
let defaultSpeed=11-pDefaultSpeed;
let accelSpeed=11-pAccelSpeed;
let defaultTouchScrollSpeed=11-pDefaultTouchScrollSpeed;
let accelTouchScrollSpeed=11-pAccelTouchScrollSpeed;


Input.isRepeated = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isRepeated('escape')) {
        return true;
    } else if(this._pressedTime>=startTime){
		return (this._latestButton === keyName &&
			(this._pressedTime === 0 ||
				(this._pressedTime >= this.keyRepeatWait &&
				this._pressedTime % accelSpeed === 0)));
	} else {
        return (this._latestButton === keyName &&
			(this._pressedTime === 0 ||
				(this._pressedTime >= this.keyRepeatWait &&
				this._pressedTime % defaultSpeed === 0)));
    }
};

const _TouchInput__onRelease = TouchInput._onRelease;
TouchInput._onRelease = function(x, y) {
    _TouchInput__onRelease.apply(this,arguments)
    this._windowTouchRelease=true;
};

const _Window_Selectable_prototype_initialize = Window_Selectable.prototype.initialize;
Window_Selectable.prototype.initialize = function(x, y, width, height) {
    _Window_Selectable_prototype_initialize.apply(this,arguments);
    this._startAccelCount=0;
};

const _Window_Selectable_prototype_update = Window_Selectable.prototype.update;
Window_Selectable.prototype.update = function() {
    _Window_Selectable_prototype_update.apply(this,arguments);
    this._startAccelCount++
    if(TouchInput._windowTouchRelease){
        this._startAccelCount=0;
        TouchInput._windowTouchRelease=false;
    }
};

Window_Selectable.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest(x, y);
    if (hitIndex >= 0) {
        if (hitIndex === this.index()) {
            if (triggered && this.isTouchOkEnabled()) {
                this.processOk();
            }
        } else if (this.isCursorMovable()) {
            this.select(hitIndex);
        }
        this._startAccelCount=0;
    } else if (this._stayCount >= defaultTouchScrollSpeed&&this._startAccelCount<=startTime) {
        if (y < this.padding) {
            this.cursorUp();
        } else if (y >= this.height - this.padding) {
            this.cursorDown();
        };
	} else if (this._stayCount >= accelTouchScrollSpeed&&this._startAccelCount>startTime) {
        if (y < this.padding) {
            this.cursorUp();
        } else if (y >= this.height - this.padding) {
            this.cursorDown();
        }
    }
    if (this.index() !== lastIndex) {
        SoundManager.playCursor();
    }
};



})();



