//=============================================================================
// NAPI_AutoFaceGraphic.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.0 2021/11/22 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc 顔グラ自動表示プラグイン (MV)
 * @author なぴぃ
 * 
 * @help 文章の表示で文章に含まれた名前に応じて自動で顔画像を表示します。
 * 表情キーを設定する事で表情も指定できます。
 * 
 * 
 * ●使い方
 * 顔画像リストで呼び出したい画像を設定します。
 * 文章の表示コマンドで
 * 
 * 　　名前「本文
 * 
 * の形式で入力します。
 * 
 * 　　例）
 * 　　ハロルド「自動で画像を表示するぞ！
 * 
 * すると名前に対応した画像が自動で表示されます。
 * 
 * 
 * ●表情の変更
 * 表情差分を含んだ画像を顔画像リストで登録します。
 * 表情キーリストで表情を呼び出すキーとなる文字を設定します。
 * 
 * 　　名前 表情キー「本文
 * 
 * の形式で入力します。
 * 
 * 　　例）
 * 　　ハロルド怒「自動で"怒"キーを設定したインデックスの画像を表示するぞ！
 * 
 * プレイ時には表情キーは表示されず以下のように表示されます。
 * 
 * 　　ハロルド「自動で"怒"キーを設定したインデックスの画像を表示するぞ！
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 * 
 * @param Delimiter
 * @text 名前と本文を区切る記号
 * @desc 文章の表示の文章入力時に名前と本文を区切る記号を指定します。
 * @default 「
 * @type string
 * 
 * @param FaceGraphicList
 * @text 顔画像リスト
 * @desc 顔グラを 名前:ファイル名:標準インデックス（左上から右に0-3、左下から右に4-7）
 * の形式で指定します。改行を挟み複数入力できます。(:は半角)
 * @default "ハロルド:Actor1:0\nテレーゼ:Actor1:7"
 * @type note
 * 
 * @param FacialExpressionKeyList
 * @text 表情キーリスト
 * @desc 表情を呼び出すキーとなる文字を設定します。行数がインデックスに対応しています。
 * （左上から右に0-3、左下から右に4-7）
 * @default "常\n喜\n怒\n哀\n楽\n苦\n攻\n驚\n"
 * @type note
 * 
 * @param HideFaceGraphicKey
 * @text 顔画像非表示キー
 * @desc 顔画像を非表示にする為のキーとなる文字を設定します。
 * @default 無
 * @type string
 * 
 */



(() => {
'use strict';

const param = PluginManager.parameters('NAPI_AutoFaceGraphic');
const pDelimiter = param['Delimiter']; //string
const pFaceGraphicList = param['FaceGraphicList']; //note
const pFacialExpressionKeyList = param['FacialExpressionKeyList']; //note
const pHideFaceGraphicKey = param['HideFaceGraphicKey']; //string

let faceList=pFaceGraphicList
faceList=faceList.slice(1,faceList.length-1);
faceList=faceList.split(/\\n/g);
faceList=faceList.map(function(value){return value.split(/:/g)});

let keyList=pFacialExpressionKeyList
keyList=keyList.slice(1,keyList.length-1);
keyList=keyList.split(/\\n/g);


const _Game_Interpreter=Game_Interpreter.prototype.command101;
Game_Interpreter.prototype.command101=function() {
	if(!$gameMessage.isBusy()){
        if(!this._params[0]){ //顔グラがない場合
            let firstLine=this._list[this._index+1].parameters[0];
            const reg=new RegExp('([^\\n]+)'+pDelimiter);
            let faceGraphic="";
            let facialExpression=0;
            firstLine=firstLine.replace(reg,function(){
                let nameAndIndex=arguments[1];
                let name=nameAndIndex;
                faceList.forEach(value=>{
                    if(nameAndIndex.indexOf(value[0])===0){
                        const thisIndex=nameAndIndex.replace(value[0],function(){
                            return "";
                        });
                        name=value[0];
                        faceGraphic=value[1];
                        facialExpression=Number(value[2]);
                        keyList.forEach((key,index)=>{
                            if(thisIndex===key){
                                facialExpression=index;
                            }
                        });
                        if(thisIndex===pHideFaceGraphicKey){
                            faceGraphic="";
                            facialExpression=0;
                        };
                    };
                });
                return name+pDelimiter;
            });
            this._params[0]=faceGraphic;
            this._params[1]=facialExpression;
            this._list[this._index+1].parameters[0]=firstLine;
        };
		const result=_Game_Interpreter.apply(this, arguments);
		return result;
	}else{
		return false;
	};
};


})();



