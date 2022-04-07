import ChargeConfig from "./game/core/ChargeConfig";
import GameUtil from "./game/core/GameUtil";
import FrozenIPMgr from "./game/gate/FrozenIPMgr";
import FrozenMacMgr from "./game/gate/FrozenMacMgr";
import HttpGate from "./game/gate/HttpGate";
import ServerMgr from "./game/gate/ServerMgr";
import SKLogger from "./game/gear/SKLogger";
import DB from "./game/utils/DB";
import DBForm from "./game/utils/DBForm";
import GameConf from "./conf/GameConf";
import Command from "./game/common/Command";
import HttpGame from "./game/network/http/HttpGame";
// 未知异常捕获
process.on('uncaughtException', function (err: any) {
    SKLogger.error('An uncaught error occurred!');
    SKLogger.error(err.stack);
});

export default class Gate {
    mod_list: any = {};
    private complete() {
        SKLogger.info('网关服务器启动完毕，等待命令');
    }
    init(mod: any) {
        this.mod_list[mod] = 0;
        return () => {
            this.mod_list[mod] = 1;
            let allcomplete = true;
            for (const mkey in this.mod_list) {
                if (this.mod_list.hasOwnProperty(mkey)) {
                    const value = this.mod_list[mkey];
                    if (value == 0) {
                        allcomplete = false;
                        break;
                    }
                }
            }
            if (allcomplete) {
                this.complete();
            }
        }
    }

    lanuch() {
        // 加载配置
        GameUtil.serverType = 'gate';
        GameUtil.localIP = GameUtil.getIPAdress();
        GameUtil.serverId = GameConf.gate_id;
        GameUtil.serverName= GameConf.gate_name;
        GameUtil.launch();
        SKLogger.info(`${GameUtil.serverName}V${GameConf.version} 启动...`);
        // 启动命令行管理
        Command.shared.launch();
        SKLogger.info('1.命令行模块启动完毕');
        //启动http模块
        HttpGate.shared.start(GameConf.gate_port);
        SKLogger.info(`2.HTTP模块启动完毕，开始监听${GameConf.local_ip}:${GameConf.gate_port}`);
        DB.init();
        DBForm.shared.launch();
        SKLogger.info(`3.数据库管理模块启动完毕`);
        //启动服务器管理模块
        ServerMgr.shared.launch();
        SKLogger.info(`4.服务器管理模块启动完毕`);
        //充值配置模块启动完毕
        ChargeConfig.shared.launch();
        SKLogger.info(`5.充值配置模块启动完毕`);
		//启动封禁IP管理模块
		FrozenIPMgr.shared.launch();
		SKLogger.info(`6.封禁IP管理模块启动完毕`);
		//启动封禁设备管理模块
        FrozenMacMgr.shared.init();
		SKLogger.info(`7.封禁设备管理模块启动完毕`);
 
        
    }
}

new Gate().lanuch();