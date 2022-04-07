import ChargeConfig from "./game/core/ChargeConfig";
import GameUtil from "./game/core/GameUtil";
import Launch from "./game/core/Launch";
import NpcConfigMgr from "./game/core/NpcConfigMgr";
import HttpGame from "./game/network/http/HttpGame";
import SKLogger from "./game/gear/SKLogger";
import DBForm from "./game/utils/DBForm";
import ServerConf from "./conf/ServerConf";
import GameConf from "./conf/GameConf";
import Command from "./game/common/Command";
import Currency from "./game/activity/Currency";

/**
 * 未知异常捕获
 */
process.on('uncaughtException', function (err: any) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
})

function complete() {
    SKLogger.info('启动游戏模块...');
    Launch.shared.start();
}

let mod_list: any = {};

function init(mod: any) {
    mod_list[mod] = 0;
    return () => {
        mod_list[mod] = 1;
        let allcomplete = true;
        for (const mkey in mod_list) {
            if (mod_list.hasOwnProperty(mkey)) {
                const value = mod_list[mkey];
                if (value == 0) {
                    allcomplete = false;
                    break;
                }
            }
        }
        if (allcomplete) {
            complete();
        }
    }
}

function main() {
    GameUtil.localIP = GameUtil.getIPAdress();
    /**
     * 加载配置表
     */
    let conf: ServerConf = GameConf.game_5;
    GameUtil.serverType = conf.server_type;
    GameUtil.serverName = conf.server_name;
    GameUtil.serverId = conf.server_id;
    GameUtil.serverConf = conf;
    GameUtil.launch();
    // Currency.shared.init();
    // SKLogger.info('现金提取模块启动完毕');
    SKLogger.info(``);
    SKLogger.info(`${GameUtil.serverName}V${GameConf.version} 启动...`);
    SKLogger.info("1.系统配置表加载完毕");
    DBForm.shared.launch();
    SKLogger.info('2.数据库模块启动完毕');
    /**
     * 启动命令行管理
     */
    Command.shared.launch();
    SKLogger.info('3.命令行模块启动完毕');
    /**
     * 启动监控系统
     */
    let cli = require("./game/common/cli");
    cli.start(conf.cli_port, init('cli'));

    /**
     * NPC配置初始化
     */
    NpcConfigMgr.shared.launch();
    //充值配置模块启动完毕
    ChargeConfig.shared.launch();
    SKLogger.info(`4.充值配置模块启动完毕`);
    //启动http模块
    HttpGame.shared.start(conf.http_port);
    SKLogger.info(`5.HTTP模块启动完毕，开始监听${GameConf.local_ip}:${conf.http_port}`);
    

}

main();