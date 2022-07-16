//=============================================================================
// NAPI_GameWindowPosition.js
//=============================================================================
// Copyright (c) 2022 napiiey
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//-----------------------------------------------------------------------------
// version
// 1.0.1 2022/07/17 コンソールログの消し忘れを修正
// 1.0.0 2022/07/03 公開
//-----------------------------------------------------------------------------
// Twitter: @napiiey
//-----------------------------------------------------------------------------

/*:
 * @target MV MZ
 * @plugindesc ゲームウィンドウ初期位置記憶プラグイン
 * @author なぴぃ
 * 
 * @help ゲーム画面の初期位置とウィンドウサイズを記憶し次回起動時に復元します。
 * デフォルト設定の場合ゲーム画面が中央に固定サイズで表示されますが、これを
 * 前回終了した時のウィンドウサイズ＆位置で開始できるようにします。
 * 
 * デスクトップ版とテストプレイのみ有効でブラウザ版の場合は無効となります。
 * 位置を記憶したデータはプラグインフォルダ直下に生成されます。
 * plugins/NAPI_GamewindowPositionConfig.json
 * 
 * ●使い方
 * プラグインフォルダに入れるだけで動作します。
 * 
 * ●ご利用について
 * 本プラグインはMITライセンスの下で公開しています。
 * MITライセンスの内容に従ってご利用下さい。
 * https://napiiey.github.io/plugins/license.html
 * 
 */


(() => {
    'use strict';

    const fs = require("fs");
    let data = {
        x: 20,
        y: 20,
        width: 816,
        height: 624,
    }
    let count = 0;

    try {
        const dataJson = fs.readFileSync("js/plugins/NAPI_GamewindowPositionConfig.json");
        data = {
            ...data,
            ...JSON.parse(dataJson)
        };
        window.moveTo(data.x, data.y);
        window.resizeTo(data.width, data.height);
    } catch (e) {
        data.width = window.outerWidth;
        data.height = window.outerHeight;
        data.x = window.screenX;
        data.y = window.screenY;
    }

    const bootUpdate = function() {
        count++;
        if (count > 100) {
            clearInterval(bootUpdateId);
            if (Utils.RPGMAKER_NAME === "MV") {
                setInterval(slowUpdate, 1000);
            }
        }
        if (data.width === window.outerWidth && data.height === window.outerHeight &&
            data.x === window.screenX && data.y === window.screenY) {
            return;
        }
        window.moveTo(data.x, data.y);
        window.resizeTo(data.width, data.height);
    }

    let bootUpdateId = setInterval(bootUpdate, 10);

    const slowUpdate = function() {
        if (data.width === window.outerWidth && data.height === window.outerHeight &&
            data.x === window.screenX && data.y === window.screenY) {
            return;
        }
        data.width = window.outerWidth;
        data.height = window.outerHeight;
        data.x = window.screenX;
        data.y = window.screenY;
        const dataJson = JSON.stringify(data);
        fs.writeFileSync("js/plugins/NAPI_GamewindowPositionConfig.json", dataJson);
    }

    window.addEventListener('beforeunload', function(event) {
        data.width = window.outerWidth;
        data.height = window.outerHeight;
        data.x = window.screenX;
        data.y = window.screenY;
        const dataJson = JSON.stringify(data);
        fs.writeFileSync("js/plugins/NAPI_GamewindowPositionConfig.json", dataJson);
    });

})();