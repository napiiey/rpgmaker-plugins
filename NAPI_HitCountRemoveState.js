//=============================================================================
// NAPI_HitCountRemoveState.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/10/24 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 一定回数ダメージを受けると消えるステート for MV
 * @author なぴぃ
 * 
 * @help 一定回数ダメージを受けると消えるステートを作ります。
 * 攻撃を受けた回数になるため連撃スキルは1回のカウントになります。
 * 
 * 
 * ●使い方
 * 指定回数ダメージで解除したいステートのメモ欄に
 * 
 * <指定回数ダメージ解除>
 * もしくは
 * <HitCountRemove>
 * 
 * と記入。
 * 
 * 自動解除のタイミングをターン終了時にして「継続ターン数」にステートの耐久値（何回
 * ダメージを受けると消えるか）を入力します。
 * 
 * 「ダメージで解除」にチェックを入れ100パーセントにして下さい。
 * （ここを100％以外に設定した場合はその割合で耐久値が減ります。）
 * 
 * ターン数のカウントをステートの耐久値として利用する為、ステートの残りターン
 * を表示するプラグインと併用する事で耐久値を表示できます。
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


Game_BattlerBase.prototype.updateStateTurns = function() {
    this._states.forEach(function(stateId) {
        const notes=$dataStates[stateId].meta;
        if (this._stateTurns[stateId] > 0 && !(notes.指定回数ダメージ解除==true || notes.HitCountRemove==true)) {
            this._stateTurns[stateId]--;
        };
    }, this);
};

Game_Battler.prototype.removeStatesByDamage = function() {
    this.states().forEach(function(state) {
        if (state.removeByDamage && Math.randomInt(100) < state.chanceByDamage) {
            const notes=$dataStates[state.id].meta;
            console.log(notes);
            if(notes.指定回数ダメージ解除==true || notes.HitCountRemove==true){
                this._stateTurns[state.id]--;
                if(this._stateTurns[state.id]<=0){
                    this.removeState(state.id);
                };
            }else{this.removeState(state.id);
            };
        };
    }, this);
};


})();



