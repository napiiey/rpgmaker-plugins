//=============================================================================
// NAPI_ConsecutiveStates.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/10/26 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 連続ステートプラグイン for MV
 * @author なぴぃ
 * 
 * @help 連続して違う効果の現れるステートを作ります。
 * 例えばバフ効果が1ターン現れそれが切れた時に行動不能が1ターン付与される
 * ステート等が作れます。
 * 空のステートを利用する事で遅延して効果の現れるステート等も作れます。
 * 
 * 
 * ●使い方
 * 連続で発動するステートをそれ専用に必要な数作ります。
 * 先に効果の現れるステートのメモ欄に続くステートを指定します。
 * 
 * <連続ステート:次に効果のあらわれるステートのID>
 * もしくは
 * <ConsecutiveStates:次に効果のあらわれるステートのID>
 * 
 * と記入します。
 * 
 * 例) ※最初のステートのIDが10、次のステートが11、最後のステートが12の場合
 * 最初のステートのメモ欄: <連続ステート:11>
 * 次のステートのメモ欄: <連続ステート:12>
 * これで最初のステートを付与するとステートが消えた時に次のステートが付与されるようになります。
 * 
 * 「ダメージで解除」にチェックを入れた場合はダメージでステートが解除されても次のステートが付与されます。
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


Game_Battler.prototype.removeState = function(stateId) {
    const notes=$dataStates[stateId].meta;
    let nextStateId=0;
    if(notes.連続ステート){nextStateId=Number(notes.連続ステート);};
    if(notes.ConsecutiveStates){nextStateId=Number(notes.ConsecutiveStates)};
    if (this.isStateAffected(stateId)) {
        if (stateId === this.deathStateId()) {
            this.revive();
        }
        this.eraseState(stateId);
        if(nextStateId!==0){this.addState(nextStateId)};
        this.refresh();
        this._result.pushRemovedState(stateId);
    };
};


})();



