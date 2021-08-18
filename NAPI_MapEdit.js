//=============================================================================
// NAPI_MapEdit.js
//=============================================================================
// Copyright (c) 2021 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 0.1.0 2021/08/17 ベータ版
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @plugindesc マップ編集プラグイン
 * @author なぴぃ
 *
 * @help マップ上のタイル等をゲーム内でレイヤー毎に編集できます。
 * 各層毎のタイル・影・リージョンを一括で置き換えする事ができます。
 * 
 * ●キー操作
 * Cキー: コピー(Copy)             プレイヤーの位置のタイルをコピーします。
 * Vキー: 貼り付け(Paste)          プレイヤーの位置にコピーしたタイルを貼り付けます。
 * Bキー: 一括貼り付け(PasteSame)  プレイヤーの位置のタイルと同じタイル全てに
 *                                 コピーしたタイルを貼り付けます。
 * Nキー: 元に戻す(Undo)           1つ前に行った操作を元に戻します。
 * Mキー: モード変更(ModeChange)   常時すり抜けモードを変更します。
 * ,キー: レイヤー変更↓(LayerDown)1段下のレイヤーを選択します。
 * .キー: レイヤー変更↑(LayerUp)  1段上のレイヤーを選択します。
 * Fキー: 保存(FileSave)           データを保存します。上書きはされません。
 *                                 バックアップを取り手動で置き換えて下さい。
 * 
 * 
 * ●使い方
 * 上記の追加キーで編集を行います。
 * キーマッピング系プラグイン（Mano_InputFix等）と併用するとキー設定を変更できます。
 * 
 * 編集直後は変更が反映されませんが、移動する等して画面が
 * スクロールすると反映されます。
 * 元データではなく一時的なキャッシュを編集している為、
 * 場所移動やメニュー等のシーン変更を行うと全て元に戻ります。
 * 
 * 一通り編集が終わったらFキーで編集後のデータを保存します。
 * ブラウザ機能で保存される為、バックアップの後
 * dataフォルダの中の map〇〇〇.json と置き換えて下さい。
 * エディターの表示はエディターを再起動すると反映されます。
 * 
 * 
 * ●レイヤー
 * 0.下層レイヤー1 タイルセットA1~A5の多くのタイルがここに属します。
 * 1.下層レイヤー2 タイルセットA1~A5の重ね合わせ用タイル等がここに属します。
 * 2.上層レイヤー1 タイルセットB~Eのタイルが重なった場合下のタイルがここに移動します。
 * 3.上層レイヤー2 タイルセットB~Eのタイルは通常ここに属します。
 * 4.影レイヤー    影のレイヤーです。
 * 5.リージョンレイヤー リージョンのレイヤーです。
 * 
 * 
 * 編集内容はマップ名の表示を利用して表示されます。
 * タイルIDは ルートタイルID:形状ID の形式で表示され、
 * この2つを足したものがタイルIDになります。 
 * F8キーで出せるコンソール画面に詳細が表示されます。
 * tileTypeはタイルの種別を表し、異なるタイプのタイルに
 * 貼り付ける場合は形状IDが破棄され0になります。
 * 
 * ●タイルタイプ
 * 0.通常タイル
 * 1.床オートタイル
 * 2.壁オートタイル
 * 3.滝オートタイル
 * 
 * 
 * ※このプラグインはベータ版です。重大なバグを含んでいる可能性が大いにある為
 * 必ずバックアップを取って作業して下さい。
 * このプラグインにより発生したいかなる問題にもプラグイン制作者は責任を負いかねます。
 * 
 * マップの変更状態を保存するプラグインの性質上、イベントや他のプラグインによって
 * マップの状態が変化している場合はそれらの変化も一緒に保存してしまう場合があります。
 * 
 * 制作補助のみを想定したプラグインですので配布時はこのプラグインを含めないよう
 * 注意してください。
 * 
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * 
 * 
 * @param DefaultLayer
 * @text 初期レイヤー
 * @desc 開始時のレイヤーを選択します。
 * @default 0
 * @type select
 * @option 0: 下層レイヤー1
 * @value 0_UnderLayer1
 * @option 1: 下層レイヤー2
 * @value 1_UnderLayer2
 * @option 2: 上層レイヤー1
 * @value 2_UpperLayer1
 * @option 3: 上層レイヤー2
 * @value 3_UpperLayer2
 * @option 4: 影レイヤー
 * @value 4_ShadeLayer
 * @option 5: リージョンレイヤー
 * @value 5_RegionLayer
 * 
 * @param AlwaysThrough
 * @text 常時すり抜けモード
 * @desc 常に壁やイベント等をすり抜けるモードで開始します。(ON/OFF)
 * @default true
 * @type boolean
 * 
 * @param UndoHistoryLimit
 * @text Undo履歴保存数
 * @desc Undoで元に戻せる回数を設定します。
 * @default 10
 * @type number
 * 
 * @param Language
 * @text 言語設定
 * @desc 内部表示の言語を設定します。
 * @default Japanese
 * @type select
 * @option 日本語
 * @value Japanese
 * @option English
 * @value English
 * 
 * 
 */

(() => {
'use strict';

const param = PluginManager.parameters('NAPI_MapEdit');
const pDefaultLayer = Number((param['DefaultLayer']).slice(0,1)); //string
const pAlwaysThrough = param['AlwaysThrough']; //boolean
const pUndoLimit = param['UndoHistoryLimit']; //number
const pLanguage = param['Language']; //string


//キー入力の定義=========================
Input.keyMapper[67]='ME_Copy'; //c
Input.keyMapper[86]='ME_Paste'; //v
Input.keyMapper[66]='ME_PasteSame'; //b
Input.keyMapper[78]='ME_Undo'; //n
Input.keyMapper[77]='ME_Mode'; //m
Input.keyMapper[188]='ME_LayerDown'; //,
Input.keyMapper[190]='ME_LayerUp'; //.
Input.keyMapper[70]='ME_Save'; //f

//=====================
let width=1;
let height=1;
let mapNameBackup;

let x=0,y=0,z=pDefaultLayer;
let tileId=0;
let lootTileId=0;
let formId=0;
let tileType=0;

let tileId2=0;
let lootTileId2=0;
let formId2=0;
let tileType2=0;

let i=0;
let iTileId=0;
let iLootTileId=0;
let iFormId=0;
let iTileType=0;

let alwaysThrough=pAlwaysThrough;
const history=[];
function infoDisplay(infoMessage){
  mapNameBackup=$dataMap.displayName;
  $dataMap.displayName=String(infoMessage);
  SceneManager._scene._mapNameWindow.open();
  $dataMap.displayName=mapNameBackup;
};
function layerDisplay(){
  switch (z){
    case 0:
      pLanguage==="Japanese" ? infoDisplay('0 下層レイヤー1'):infoDisplay('0 UnderLayer1');
      break;
    case 1:
      pLanguage==="Japanese" ? infoDisplay('1 下層レイヤー2'):infoDisplay('1 UnderLayer2');
      break;
    case 2:
      pLanguage==="Japanese" ? infoDisplay('2 上層レイヤー1'):infoDisplay('2 UpperLayer1');
      break;
    case 3:
      pLanguage==="Japanese" ? infoDisplay('3 上層レイヤー2'):infoDisplay('3 UpperLayer2');
      break;
    case 4:
      pLanguage==="Japanese" ? infoDisplay('4 影レイヤー'):infoDisplay('4 ShadeLayer');
      break;
    case 5:
      pLanguage==="Japanese" ? infoDisplay('5 リージョンレイヤー'):infoDisplay('5 RegionLayer');
      break;
    default:
      pLanguage==="Japanese" ? infoDisplay('不明なレイヤー'):infoDisplay('Unknown');
  };
};
function location(){
  SoundManager.playOk();
  width=$dataMap.width;
  height=$dataMap.height;
  x=$gameMap._interpreter.character(-1).x;
  y=$gameMap._interpreter.character(-1).y;
};
function lootConvert(cLoot){
  if(2048<=cLoot){
    return 2000+(Math.floor((cLoot-2000)/48))*48;
  }else{
    return cLoot;
  }
};
function tileTypeConvert(cTileId){
  const waterfallTypeId=[2288,2384,2480,2576,2672,2768];
  if(2048<=cTileId){
    if( //壁オートタイル
      4352<=cTileId && cTileId<5888 ||
      6272<=cTileId && cTileId<6656 ||
      7040<=cTileId && cTileId<7424 ||
      7808<=cTileId && cTileId<8145
      ){ 
      return 2;
    }else if( //滝オートタイル
      2288<=cTileId && cTileId<2336 ||
      2384<=cTileId && cTileId<2432 ||
      2480<=cTileId && cTileId<2528 ||
      2576<=cTileId && cTileId<2624 ||
      2672<=cTileId && cTileId<2720 ||
      2768<=cTileId && cTileId<2816
      ){
      return 3;
    }else{ //床オートタイル
      return 1;
    };
  }else{ //通常タイル
    return 0;
  };
};
function undoLimit(){
  if(pUndoLimit<history.length){
    history.splice(0,history.length-pUndoLimit);
  };
};


const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
  _Scene_Map_update.apply(this, arguments);

  //常時すり抜けモード切り替え
  if(Input.isTriggered('ME_Mode')){
    SoundManager.playCursor();
    alwaysThrough=!alwaysThrough;
  };
  if(alwaysThrough && $gameMap._interpreter.character(-1)._through===false){
    $gameMap._interpreter.character(-1)._through=true;
    pLanguage==="Japanese" ? infoDisplay("常時すり抜けモードON"):infoDisplay("Through Mode ON");
  };
  if(!alwaysThrough && $gameMap._interpreter.character(-1)._through===true){
    $gameMap._interpreter.character(-1)._through=false;
    pLanguage==="Japanese" ? infoDisplay("常時すり抜けモードOFF"):infoDisplay("Through Mode OFF");
  };
  

  //下層～上層レイヤー選択（Select）=====================
  if(Input.isTriggered('ME_LayerDown')){
    SoundManager.playCursor();
    z-=1;
    if(z<0){z=5};
    layerDisplay();
  };
  if(Input.isTriggered('ME_LayerUp')){
    SoundManager.playCursor();
    z+=1;
    if(5<z){z=0}
    layerDisplay();
  };

  //現在地のタイル取得（Copy）=====================
  if(Input.isTriggered('ME_Copy')){
    location();
    tileId=$dataMap.data[(z*height+y)*width+x]||0;
    lootTileId=lootConvert(tileId);
    formId=tileId-lootTileId;
    tileType=tileTypeConvert(tileId);
    console.log("Copy x:"+x+" y:"+y+" layer:"+z+" tileId:"+tileId+"("+lootTileId+":"+formId+") tileType:"+tileType);
    pLanguage==="Japanese" ? infoDisplay("コピー "+lootTileId+":"+formId):infoDisplay("Copy "+lootTileId+":"+formId);
  };


  //現在地のタイルを置き換え（Paste）==============
  if(Input.isTriggered('ME_Paste')){
    location();
    let location2=(z*height+y)*width+x;
    history.push({command:'Paste',location:location2,data:$dataMap.data[location2],layer:z});
    undoLimit()
    tileId2=$dataMap.data[location2]||0;
    lootTileId2=lootConvert(tileId2);
    formId2=tileId2-lootTileId2;
    tileType2=tileTypeConvert(tileId2);
    if(tileType2===tileType){
      $dataMap.data[location2]=lootTileId+formId2;
    }else{
      $dataMap.data[location2]=tileId;
    };
    console.log("Paste x:"+x+" y:"+y+" layer:"+z+" lootTileId:"+lootTileId2+" >> "+lootTileId);
    pLanguage==="Japanese" ? infoDisplay("貼り付け "+lootTileId2+":"+formId2+" >> "+lootTileId+":"+formId2):infoDisplay("Paste "+lootTileId2+":"+formId2+" >> "+lootTileId+":"+formId2);
  };
  
  //現在地のタイルと同じタイルを一括置き換え(PasteSame)===========
  if(Input.isTriggered('ME_PasteSame')){
    location();
    history.push({command:'PasteSame',location:'all',data:$dataMap.data.concat(),layer:z});
    undoLimit()
    tileId2=$dataMap.data[(z*height+y)*width+x]||0;
    lootTileId2=lootConvert(tileId2);
    formId2=tileId2-lootTileId2;
    tileType2=tileTypeConvert(tileId2);

    for(i=width*height*z; i<=width*height*(z+1)-1; i++){
      iTileId=$dataMap.data[i];
      iLootTileId=lootConvert(iTileId);
      iFormId=iTileId-iLootTileId;
      iTileType=tileTypeConvert(iTileId);
      if(iLootTileId===lootTileId2){
        if(iTileType===tileType){
          $dataMap.data[i]=lootTileId+iFormId;
        }else{
          $dataMap.data[i]=tileId;
        };
      }
    };
    console.log("PasteSame x:"+x+" y:"+y+" layer:"+z+" lootTileId:"+lootTileId2+" >> "+lootTileId);
    pLanguage==="Japanese" ? infoDisplay("一括貼り付け "+lootTileId2+" >> "+lootTileId):infoDisplay("PasteSame "+lootTileId2+" >> "+lootTileId);
  };
  
  //元に戻す (Undo)
  if(Input.isTriggered('ME_Undo')){
    if(typeof history[history.length-1] === "undefined"){
      console.log("No Undo History.");
      infoDisplay("No Undo History.");
    }else{
      location();
      const lastCommand=history[history.length-1].command;
      const lastLocation=history[history.length-1].location;
      const newData=$dataMap.data[lastLocation];
      const lastData=history[history.length-1].data;
      const lastX=lastLocation%width;
      const lastY=Math.ceil(lastLocation/width)-1;
      const lastZ=history[history.length-1].layer;
      if(lastLocation==='all'){
        for(i=width*height*lastZ; i<=width*height*(lastZ+1)-1; i++){
          $dataMap.data[i]=lastData[i];
        };
        history.pop();
        console.log('Undo PasteSame');
        pLanguage==="Japanese" ? infoDisplay('元に戻す 一括貼り付け'):infoDisplay('Undo PasteSame');
      }
      else{
        $dataMap.data[lastLocation]=lastData;
        history.pop();
        console.log('Undo '+lastCommand+' x='+lastX+' y='+lastY+' '+newData+'>>'+lastData);
        pLanguage==="Japanese" ? infoDisplay('元に戻す'+lastCommand+$dataMap.data[lastLocation]+'>>'+lastData):infoDisplay('Undo '+lastCommand+$dataMap.data[lastLocation]+'>>'+lastData);
      };
    };
  };

  //保存(FileSave)
  if(Input.isTriggered('ME_Save')){
    SoundManager.playCursor();
    let blob = new Blob([JSON.stringify($dataMap,null,'  ')],{type:"application/json"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Map'+('000'+$gameMap.mapId()).slice(-3)+'.json';
    link.click();
    console.log('Save Completed');
    pLanguage==="Japanese" ? infoDisplay('保存'):infoDisplay('Save Completed');
  };







};




})();



