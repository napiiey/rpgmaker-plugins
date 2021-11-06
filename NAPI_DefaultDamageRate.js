//=============================================================================
// NAPI_DefaultDamageRate.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 0.1.1 2021/11/07 不要なログが出てしまっていたのを修正
// 0.1.0 2021/10/31 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 共通ダメージ倍率プラグイン
 * @author なぴぃ
 * 
 * @help 全てのスキルに適応する共通ダメージ倍率を設定します。
 * Javascript計算式が使える為、HP最大時にダメージアップ等特定条件で発動する効果も
 * 全てのスキルに対して追加する事ができます。
 * また、特定のスキルだけこの倍率の適応を除外する事もできます。
 * 
 * 
 * ●使い方
 * プラグインパラメーターの共通ダメージ倍率にdefaultRate=の形でダメージ計算式を
 * 記入します。
 * 
 * 例1) 全てのダメージを2倍にする
 * defaultRate=2;
 * 
 * 例2) 属性影響度を利用し全与ダメージ増加効果を作る
 * （属性の10番に全与ダメージ倍率を作成した場合）
 * defaultRate=a.elementRate(10)
 * 
 * 例3) 例2に加えHP最大時にダメージアップを追加
 * （属性11番にHP最大時倍率を設定した場合）
 * defaultRate=a.elementRate(10);
 * if(a.elementRate(11)!==1&&a.hp===a.mhp){
 *  defaultRate=defaultRate*a.elementRate(11)
 * };
 * 
 * 
 * ●特定のスキルを除外する
 * 共通ダメージ倍率を適応したくないスキルのダメージ計算式の最後に
 * ;bypass=true
 * を付け加えます
 * 
 * 例)
 * a.atk*2 - b.def ;bypass=true
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * @param DefaultDamageRate
 * @text 共通ダメージ倍率
 * @desc 共通のダメージ倍率計算式を記入します。defaultRate=の後にスキルのダメージ計算式と同じ書き方で記入します。
 * ;で区切り複数の式が書ける他if分岐等全てのJavascript計算式が使えます。
 * @default "defaultRate=1"
 * @type note
 * 
 */

(() => {
'use strict';

const param = PluginManager.parameters('NAPI_DefaultDamageRate');
const paramDefaultRate = eval(param['DefaultDamageRate']); 

const _Game_Action_prototype_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
Game_Action.prototype.evalDamageFormula = function(target) {
    var item = this.item();
    var a = this.subject();
    var b = target;
    var v = $gameVariables._data;
    let bypass=false;
    let result=_Game_Action_prototype_evalDamageFormula.call(this, target);
    let defaultRate=1;
    paramDefaultRate;

    //●ダメージ倍率計算式記入部分 ここから--------------------------------
    defaultRate=defaultRate*1;

    //●ダメージ倍率計算式記入部分 ここまで--------------------------------

    if(!bypass){result=result*defaultRate;}
    return result;
};

})();



