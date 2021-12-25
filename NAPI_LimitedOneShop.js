//=============================================================================
// NAPI_LimitedOneShop.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/12/17 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 一点物ショッププラグイン
 * @author なぴぃ
 * 
 * @help 在庫数1個のショップを作ります。
 * 在庫数表示等がない代わりに設定が簡単で他のプラグインと競合しにくい作りになっています。
 * 
 * 
 * ●使い方
 * [ショップの処理]の前にプラグインコマンドで以下のコマンドを入力します。
 * 　　限定ショップ オープン
 * 
 * これだけで次のショップの処理が一点物ショップになります。
 * 
 * 在庫を復活させたい場合は以下のコマンドを入力します。
 * 　　限定ショップ 全リセット
 * 
 * 
 * ●ショップ毎に在庫リセット
 * ショップ前のプラグインコマンドで以下のコマンドを入力しショップ名を設定します。
 * 　　限定ショップ オープン ショップ名:"設定するショップ名"
 * 
 * 　　例) 限定ショップ オープン ショップ名:shop1
 * 
 * 設定した名前を用いて以下のプラグインコマンドでリセットします。
 * 　　限定ショップ リセット:"リセットするショップ名"
 * 
 * 　　例) 限定ショップ リセット:shop1
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * 
 */

var NAPI = NAPI||{};

(() => {
'use strict';


NAPI.lsReady=false;
NAPI.lsMax=1;
NAPI.lsStockList={};

let mapId=0;
let eventId=0;
let shopName="";


const _Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_prototype_pluginCommand.apply(this,arguments);
    if(command==="LimitedShop"||command==="限定ショップ"){
        mapId=this._mapId;
        eventId=this._eventId;
        NAPI.LimitedShop(args);
    }
};

NAPI.LimitedShop=function(argsArray){
    shopName="shop"+(mapId*1000+eventId);
    let rawArgs=argsArray;
    const pluginArgs=rawArgs.map(e=>e.split(":"));
    pluginArgs.forEach(e=>{
        if(e[0].toLowerCase()==="max"||e[0]==="最大"){NAPI.lsMax=Number(e[1]);};
        if(e[0].toLowerCase()==="shopName"||e[0]==="ショップ名"){mode=e[1];};
        if(e[0].toLowerCase()==="open"||e[0]==="オープン"){NAPI.lsReady=true;};
        if(e[0].toLowerCase()==="reset"||e[0]==="リセット"){
            const shop=e[1];
            NAPI.lsStockList[shop]=NAPI.lsStockList[shop].map(e=>1);
        };
        if(e[0].toLowerCase()==="allreset"||e[0]==="全リセット"){
            for(let key in NAPI.lsStockList){
                NAPI.lsStockList[key]=NAPI.lsStockList[key].map(e=>1);
            };
        };
    });
};


Window_ShopBuy.prototype.isCurrentItemEnabled = function() {
    return this.isEnabled(this._data[this.index()],this.index());
};

const _Window_ShopBuy_prototype_isEnabled=Window_ShopBuy.prototype.isEnabled;
Window_ShopBuy.prototype.isEnabled = function(item,index) {
    let result=_Window_ShopBuy_prototype_isEnabled.apply(this,arguments);
    if(NAPI.lsStockList[shopName][index]<=0){result=false};
    return result;
};

const _Window_ShopBuy_prototype_drawItem=Window_ShopBuy.prototype.drawItem;
Window_ShopBuy.prototype.drawItem = function(index) {
    if(NAPI.lsReady){
        if(!NAPI.lsStockList[shopName]){
            NAPI.lsStockList[shopName]=this._shopGoods.map(e=>NAPI.lsMax);
        };
        var item = this._data[index];
        var rect = this.itemRect(index);
        var priceWidth = 96;
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(item,index)&&NAPI.lsStockList[shopName][index]>=1);
        this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
        if(NAPI.lsStockList[shopName][index]>=1){
            this.drawText(this.price(item), rect.x + rect.width - priceWidth,
                        rect.y, priceWidth, 'right');
        }else{
            this.drawText("売切れ", rect.x + rect.width - priceWidth,
                        rect.y, priceWidth, 'right');
        }
        this.changePaintOpacity(true);
    }else{
        _Window_ShopBuy_prototype_drawItem.apply(this,arguments);
    };
};

const _Scene_Shop_prototype_doBuy=Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
    _Scene_Shop_prototype_doBuy.apply(this,arguments);
    const index=this._buyWindow.index();
    NAPI.lsStockList[shopName][index]=NAPI.lsStockList[shopName][index]-number;
};

const _Scene_Shop_prototype_maxBuy=Scene_Shop.prototype.maxBuy;
Scene_Shop.prototype.maxBuy = function() {
    const result=_Scene_Shop_prototype_maxBuy.apply(this,arguments);
    let max=result;
    if(NAPI.lsReady){
        max=Math.min(result,NAPI.lsMax);
    };
    return max;
};

const _Scene_Shop_prototype_popScene=Scene_Shop.prototype.popScene;
Scene_Shop.prototype.popScene = function() {
    NAPI.lsReady=false;
    _Scene_Shop_prototype_popScene.apply(this,arguments);
};


})();


