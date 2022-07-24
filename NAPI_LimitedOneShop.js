//=============================================================================
// NAPI_LimitedOneShop.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.1.1 2022/07/24 ショップ在庫がセーブデータに反映されていなかった不具合を修正
// 1.1.0 2022/07/17 MZに対応・その他バグを修正
// 1.0.1 2022/01/08 通常ショップを開いた時にエラーが起きる場合がある不具合を修正
// 1.0.0 2021/12/17 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @target MV MZ
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
 * MZの場合はプラグインコマンドの説明に従ってください。
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
 * @command mzLimitedShopOpen
 * @text 限定ショップ オープン
 * @desc [ショップの処理]の前にこのコマンドを入れる事で[ショップの処理]が在庫数1個のショップになります。
 *
 * @arg shopName
 * @text ショップ名
 * @desc 個別リセット用のショップ名を設定します。個別リセットを使わない場合は空欄で構いません。
 * @type string
 * @default 
 * 
 * @command mzLimitedShopAllReset
 * @text 限定ショップ 全リセット
 * @desc 全てのショップの在庫を復活させます。
 * 
 * @command mzLimitedShopReset
 * @text 限定ショップ リセット
 * @desc 特定のショップの在庫を復活させます。
 *
 * @arg shopName
 * @text ショップ名
 * @desc リセットするショップ名を設定します。
 * @type string
 * @default 
 */

var NAPI = NAPI||{};

(() => {
'use strict';


NAPI.lsReady=false;
NAPI.lsMax=1;

let mapId=0;
let eventId=0;
let shopName="";
const pluginName = "NAPI_LimitedOneShop";

const _Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_prototype_pluginCommand.apply(this,arguments);
    if(command==="LimitedShop"||command==="限定ショップ"){
        mapId=this._mapId;
        eventId=this._eventId;
        if(!$gameSystem._napiLsStockList){$gameSystem._napiLsStockList = {};};
        NAPI.LimitedShop(args);
    }
};

if(Utils.RPGMAKER_NAME==="MZ"){
    PluginManager.registerCommand(pluginName, "mzLimitedShopOpen", args => {
        mapId=this._mapId;
        eventId=this._eventId;
        if(!$gameSystem._napiLsStockList){$gameSystem._napiLsStockList = {};};
        shopName = "shop"+(mapId*1000+eventId);
        if(args.shopName){
            shopName = args.shopName;
        }
        NAPI.lsReady=true;
    });
    PluginManager.registerCommand(pluginName, "mzLimitedShopAllReset", args => {
        allReset();
    });
    PluginManager.registerCommand(pluginName, "mzLimitedShopReset", args => {
        reset(args.shopName);
    });
};

NAPI.LimitedShop=function(argsArray){
    let rawArgs=argsArray;
    const pluginArgs=rawArgs.map(e=>e.split(":"));
    pluginArgs.forEach(e=>{
        if(e[0].toLowerCase()==="max"||e[0]==="最大"){NAPI.lsMax=Number(e[1]);};
        if(e[0].toLowerCase()==="open"||e[0]==="オープン"){
            shopName="shop"+(mapId*1000+eventId);
            NAPI.lsReady=true;
        };
        if(e[0].toLowerCase()==="shopname"||e[0]==="ショップ名"){shopName=e[1];};
        if(e[0].toLowerCase()==="reset"||e[0]==="リセット"){reset(e[1]);};
        if(e[0].toLowerCase()==="allreset"||e[0]==="全リセット"){allReset();};
    });
};

const reset = function(shop){
    if(!$gameSystem._napiLsStockList.hasOwnProperty(shop)){return;};
    $gameSystem._napiLsStockList[shop] = $gameSystem._napiLsStockList[shop].map(e2=>1);
};

const allReset = function(){
    for(let key in $gameSystem._napiLsStockList){
        $gameSystem._napiLsStockList[key]=$gameSystem._napiLsStockList[key].map(e2=>1);
    };
};

Window_ShopBuy.prototype.isCurrentItemEnabled = function() {
    return this.isEnabled(this._data[this.index()],this.index());
};

const _Window_ShopBuy_prototype_isEnabled=Window_ShopBuy.prototype.isEnabled;
Window_ShopBuy.prototype.isEnabled = function(item,index) {
    let result=_Window_ShopBuy_prototype_isEnabled.apply(this,arguments);
    if(shopName!==""&&$gameSystem._napiLsStockList[shopName][index]<=0){result=false};
    return result;
};

const _Window_ShopBuy_prototype_drawItem=Window_ShopBuy.prototype.drawItem;
Window_ShopBuy.prototype.drawItem = function(index) {
    if(NAPI.lsReady){
        if(!$gameSystem._napiLsStockList[shopName]){
            $gameSystem._napiLsStockList[shopName]=this._shopGoods.map(e=>NAPI.lsMax);
        };
        let item,price,rect,priceWidth,priceX,nameWidth;
        if(Utils.RPGMAKER_NAME==="MV"){
            item = this._data[index];
            rect = this.itemRect(index);
            priceWidth = 96;
            rect.width -= this.textPadding();
            this.changePaintOpacity(this.isEnabled(item,index)&&$gameSystem._napiLsStockList[shopName][index]>=1);
            this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
            if($gameSystem._napiLsStockList[shopName][index]>=1){
                this.drawText(this.price(item), rect.x + rect.width - priceWidth,
                            rect.y, priceWidth, 'right');
            }else{
                this.drawText("売切れ", rect.x + rect.width - priceWidth,
                            rect.y, priceWidth, 'right');
            }
            this.changePaintOpacity(true);
        }
        if(Utils.RPGMAKER_NAME==="MZ"){
            item = this.itemAt(index);
            price = this.price(item);
            rect = this.itemLineRect(index);
            priceWidth = this.priceWidth();
            priceX = rect.x + rect.width - priceWidth;
            nameWidth = rect.width - priceWidth;
            this.changePaintOpacity(this.isEnabled(item,index)&&$gameSystem._napiLsStockList[shopName][index]>=1);
            this.drawItemName(item, rect.x, rect.y, nameWidth);
            if($gameSystem._napiLsStockList[shopName][index]>=1){
                this.drawText(price, priceX, rect.y, priceWidth, 'right');
            }else{
                this.drawText("売切れ", priceX, rect.y, priceWidth, 'right');
            }
            this.changePaintOpacity(true);
        }
    }else{
        _Window_ShopBuy_prototype_drawItem.apply(this,arguments);
    };
};

const _Scene_Shop_prototype_doBuy=Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
    _Scene_Shop_prototype_doBuy.apply(this,arguments);
    if(NAPI.lsReady){
        const index=this._buyWindow.index();
        $gameSystem._napiLsStockList[shopName][index]=$gameSystem._napiLsStockList[shopName][index]-number;
    }
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



