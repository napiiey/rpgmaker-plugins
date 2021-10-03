//=============================================================================
// NAPI_OriginalTextEscape.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 0.1.0 2021/10/03 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 独自用語制御文字追加プラグイン
 * @author なぴぃ
 * 
 * @help 後から変更できる独自用語を制御文字で入力できるようにします。
 * 
 * ●使い方
 * \OT[独自用語] の形式で文章の表示やヘルプ等の文章内に記述します。
 * 
 * 例) この武器の\OT[攻撃力]は30。
 * 
 * このままだと「この武器の攻撃力は30。」と表示されます。
 * 後で変更の必要が出てきたものだけプラグインパラメーターに
 * 変更前:変更後 の形式で記述します。
 * 
 * 例)攻撃力:ATK
 * 
 * これで「この武器のATKは30。」という表示に変わります。
 * 
 * 
 * ●他の方法と比べたメリット
 * ・自由な名前で書けるため変数を用語辞典として利用するのと比べて可読性が高い。
 * ・他の場所に用語集を事前準備する必要がなく、変更の必要が出たものだけ
 * 後から置き換えられる。
 * ・セーブデータ容量を圧迫しない。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * @param TextReplace
 * @text 用語置き換え
 * @desc 置き換える用語を 置き換え元:置き換え後 の形式で指定します。改行を挟み複数入力できます。(:は半角)
 * 
 * @default "攻撃力:ATK\n防御力:DEF\n"
 * @type note
 * 
 * 
 */


(() => {
'use strict';

const param = PluginManager.parameters('NAPI_OriginalTextEscape');
const pTextReplace = param['TextReplace']; //note

let rep = pTextReplace
rep = rep.slice(1,rep.length-1);
rep = rep.split(/\\n/g);
rep = rep.filter(function(value){return value.match(":")});
rep = rep.map(function(value){return value.split(":")});

function otReplace(text){
    let success=false;
    let repResult;
    rep.map(function(value){
        if (value[0]===text){success=true; repResult=value[1]};
    });
    if(success===true){
        return repResult;
    }else{
        return text;
    };
};

const _Window_Base_prototype_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
    text = _Window_Base_prototype_convertEscapeCharacters.call(this, text);
    text = text.replace(/\x1bOT\[([^\[\]\n]+)\]/gi, function() {
        return otReplace(arguments[1]);
    }.bind(this));
    return text;
  };
 

})();



