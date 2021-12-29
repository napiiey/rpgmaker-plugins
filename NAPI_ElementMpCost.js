//=============================================================================
// NAPI_ElementMpCost.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.1 2021/12/29 プラグインパラメーターの初期値のバグを修正
// 1.0.0 2021/12/29 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @target MV
 * @plugindesc 属性毎のMP消費率設定プラグイン
 * @author なぴぃ
 * 
 * @help キャラの特性や装備によって属性毎にMP消費率を変化させる事ができます。
 * 
 * 
 * ●使い方
 * 属性有効度をMP消費率として利用します。
 * エディターのデータベース＞タイプから属性の最大数を増やし各属性のMP消費率を追加して下さい。
 * プラグインパラメーターで属性と追加したMP消費率を紐づけます
 * 
 * 例）属性ID2が炎で属性ID12に炎MP消費率という項目を作った場合の例
 * 　2:12
 * 
 * これで属性ID12の属性有効度を装備等で変更すると属性ID2に設定されている
 * 炎のスキルの消費MPが変動するようになります。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * @param ElementAndMpCostPair
 * @text 対応する属性とMP消費率
 * @desc 属性と対になるMP消費率の属性番号を「属性：MP消費率」の形で指定します。
 * @default ["1:11","2:12","3:13","4:14","5:15","6:16","7:17","8:18","9:19"]
 * @type string[]
 *  
 */


(() => {
'use strict';

const param = PluginManager.parameters('NAPI_ElementMpCost');
const pElementAndMpCostPair = JSON.parse(param['ElementAndMpCostPair']); //string[]

const pairString=pElementAndMpCostPair.map(e=>e.split(":"))
const pair=pairString.map(e=>{
    return e.map(e2=>Number(e2));
});

const _Game_BattlerBase_prototype_skillMpCost=Game_BattlerBase.prototype.skillMpCost;
Game_BattlerBase.prototype.skillMpCost = function(skill) {
    const result=_Game_BattlerBase_prototype_skillMpCost.apply(this,arguments);
    const elementId=skill.damage.elementId;
    let mpCostRate=1;
    pair.forEach(e=>{
        if(e[0]===elementId){
            mpCostRate=this.elementRate(e[1]);
        };
    });
    return Math.floor(result*mpCostRate);
};

})();



