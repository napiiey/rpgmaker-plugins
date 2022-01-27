//=============================================================================
// NAPI_MapCharacterOffset.js
//=============================================================================
// Copyright (c) 2022 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2022/01/27 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @target MV
 * @plugindesc マップキャラクターオフセット
 * @author なぴぃ
 * 
 * @help 
 * マップイベントの見た目とアニメーションが発生する足元座標を独立して設定します。
 * 設定はマップイベントのメモ欄の他ファイル名で設定する事もできます。
 * マップイベント本体の位置をそのままに、見た目のみずらしたり、
 * アニメーションの起点や同プライオリティのイベントの上下が入れ替わるポイントとなる
 * 足元座標をそれぞれ独立して設定できます。
 * 
 * 
 * ●使い方
 * イベントのメモ欄に以下のように記入します。
 * <mcoオフセット:項目>
 * 
 * 項目として設定できる内容
 * vx値　:　見た目のx座標を値のピクセル分右にずらします。
 * vy値　:　見た目のy座標を値のピクセル分下にずらします。
 * fx値　:　アニメーションの起点となる足元座標を値のピクセル分右にずらします。
 * fy値　:　アニメーションの起点となる足元座標を値のピクセル分右にずらします。
 * 
 * 例) 見た目のy座標を下に48ピクセルずらす。
 * 　<mcoオフセット:vy48>
 * 
 * 項目はカンマで区切り複数同時に設定できます。
 * 
 * 例) 見た目を右に48ピクセル、上に96ピクセル動かし、足元座標を左に48ピクセルずらす。
 * 　<mcoオフセット:vx48,vy-96,fx-48>
 * 
 * 
 * ●ファイル名から設定
 * ファイル名から設定する場合はファイル名に以下のように追記します。
 * ファイル名{mco_項目_項目_項目_項目}.png
 * 項目として設定できる内容はメモ欄と同様ですが、マイナス（ハイフン）の代わりにmを使います。
 * また、カンマではなくアンダーバーで区切ります。
 * 
 * 例) Actor1.pngの見た目を右に48ピクセル、上に96ピクセル動かし、足元座標を左に48ピクセルずらす。
 * 　Actor1{mco_vx48_vym96_fxm48}.png
 * 
 * メモ欄とファイル名両方で設定した場合メモ欄が優先され、ファイル名で全項目指定・
 * メモ欄でfyのみ指定とした場合fyのみメモ欄のものになり他はファイル名で指定したものになります。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 */


(() => {
    'use strict';

    const _Game_CharacterBase_prototype_setImage = Game_CharacterBase.prototype.setImage;
    Game_CharacterBase.prototype.setImage = function (characterName, characterIndex) {
        _Game_CharacterBase_prototype_setImage.apply(this, arguments);
        let vx = 0;
        let vy = 0;
        let fx = 0;
        let fy = 0;
        const match = characterName.match(/\{mco_([vfxym\d_]{3,27})\}/);
        if (match) {
            // this.offsetShiftY = 0 - Number(match[1]);
            const split = match[1].toLowerCase().split('_');
            split.forEach(e => {
                let minus = 1;
                const eMatch = e.match(/([vf][xy])(m?)(\d{1,4})/);
                if (eMatch[2] === 'm') { minus = -1 };
                const number = Number(eMatch[3]) * minus;
                if (eMatch[1] === 'vx') {
                    vx = number;
                } else if (eMatch[1] === 'vy') {
                    vy = number;
                } else if (eMatch[1] === 'fx') {
                    fx = number;
                } else if (eMatch[1] === 'fy') {
                    fy = number;
                };
            });
            this.mcoOffset = { vx: vx - fx, vy: vy - fy, fx: fx, fy: fy };
        };
        if (this._eventId) {
            const event = $dataMap.events[this._eventId];
            const meta = event.meta.mcoオフセット;
            if (meta) {
                const split = meta.toLowerCase().split(',');
                split.forEach(e => {
                    let minus = 1;
                    const eMatch = e.match(/([vf][xy])(-?)(\d{1,4})/);
                    if (eMatch[2] === '-') { minus = -1 };
                    const number = Number(eMatch[3]) * minus;
                    if (eMatch[1] === 'vx') {
                        vx = number;
                    } else if (eMatch[1] === 'vy') {
                        vy = number;
                    } else if (eMatch[1] === 'fx') {
                        fx = number;
                    } else if (eMatch[1] === 'fy') {
                        fy = number;
                    };
                });
                this.mcoOffset = { vx: vx - fx, vy: vy - fy, fx: fx, fy: fy };
                console.log(this.mcoOffset)
            };
        };
    };

    const _Sprite_Character_prototype_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
    Sprite_Character.prototype.updateCharacterFrame = function () {
        _Sprite_Character_prototype_updateCharacterFrame.apply(this, arguments);
        if (this._character.mcoOffset) {
            this._anchor._x = 0.5 - this._character.mcoOffset.vx / this.patternWidth();
            this._anchor._y = 1 - this._character.mcoOffset.vy / this.patternHeight();
        };
    };

    const _Game_CharacterBase_prototype_screenX = Game_CharacterBase.prototype.screenX;
    Game_CharacterBase.prototype.screenX = function () {
        let result = _Game_CharacterBase_prototype_screenX.apply(this, arguments);
        if (this.mcoOffset) {
            result = result + this.mcoOffset.fx;
        };
        return result;
    };

    const _Game_CharacterBase_prototype_screenY = Game_CharacterBase.prototype.screenY;
    Game_CharacterBase.prototype.screenY = function () {
        let result = _Game_CharacterBase_prototype_screenY.apply(this, arguments);
        if (this.mcoOffset) {
            result = result + this.mcoOffset.fy;
        };
        return result;
    };

})();



