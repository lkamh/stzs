"ui";

importClass(java.net.HttpURLConnection);
importClass(java.net.URL);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
importClass(android.graphics.Color);

var color = "#009688";

ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" bg="#009688" title="刷题助手" />
                <tabs id="tabs" bg="#009688" />
            </appbar>
            <viewpager id="viewpager">
                <frame >
                    <vertical>
                        <horizontal gravity="center_vertical" padding="5 20" >
                            <View bg="#3399ff" h="*" w="8"  ></View>
                            <horizontal gravity="center">
                                <Switch id="autoService" text="  无障碍服务" checked="{{auto.service != null}}" gravity="left" textSize="17sp" />
                                <Switch id="consoleshow" text="    悬浮窗权限" checked="{{floaty.checkPermission()}}" gravity="right" textSize="17sp" />
                            </horizontal>
                        </horizontal>
                        <vertical gravity="center">
                            <card gravity="center" marginTop="10xp" w="100" h="30" cardCornerRadius="10" >
                                <vertical gravity="center" bg="#03A6EF">
                                    <text text="脚本选择" textColor="#FFFFFF" gravity="center" />
                                </vertical>
                            </card>
                            <card w="*" cardCornerRadius="10" gravity="center" marginTop="10">
                                <vertical>
                                    <horizontal padding="16">
                                        <radiogroup id="radiogroup" checkedButton="@+id/radio1">
                                            <radio id="radio1" text="挑战答题" />
                                            <radio id="radio2" text="四人赛" />
                                        </radiogroup>
                                    </horizontal>
                                </vertical>
                            </card>
                        </vertical>
                        <vertical gravity="bottom" padding="5 20">
                            <button id="start" text="开 始 学 习" textSize="20sp" color="#ffffff" bg="#3399ff" foreground="?selectableItemBackground" />
                        </vertical>
                    </vertical>
                </frame>
                <ScrollView>
                    <frame>
                        <vertical id="x x z s_pro" gravity="center">
                            <horizontal gravity="center_vertical" padding="5 5" >
                                <View bg="#3399ff" h="*" w="10"  ></View>
                                <vertical padding="10 8" h="auto" w="0" layout_weight="1">
                                    <text w="auto" textColor="#222222" textSize="15sp" text="每轮间隔延时" />
                                </vertical>
                                <input id="stzs_cycle_wait_time" marginLeft="4" marginRight="6" text="2" textSize="13sp" inputType="number" />
                            </horizontal>
                            <horizontal gravity="center_vertical" padding="5 5" >
                                <View bg="#3399ff" h="*" w="10"  ></View>
                                <vertical padding="10 8" h="auto" w="0" layout_weight="1">
                                    <text w="auto" textColor="#222222" textSize="15sp" text="image控件无法识别重置次数" />
                                </vertical>
                                <input id="stzs_chongzhi_cishu" marginLeft="4" marginRight="6" text="2" textSize="13sp" inputType="number" />
                            </horizontal>
                            <horizontal>
                                <button style="Widget.AppCompat.Button.Colored" id="stzs_save" text="保存配置" padding="12dp" w="*" />
                            </horizontal>
                        </vertical>
                    </frame>
                </ScrollView>
            </viewpager>
        </vertical>
    </drawer>
);

activity.setSupportActionBar(ui.toolbar);
// 设置滑动页面的标题
ui.viewpager.setTitles(["首页", "脚本配置"]);
// 让滑动页面和标签栏联动
ui.tabs.setupWithViewPager(ui.viewpager);

//运行前配置
var STZS_CONFIG = storages.create("STZS_CONFIG");
Initialize();
http.__okhttp__.setTimeout(10000);


var idx_dict = {
    "8": 0,
    "11": 1
};
// 下载并运行所选脚本
ui.start.click(function () {
    // threads.shutDownAll();
    // if (thread != null && thread.isAlive()) {
    //     alert("注意", "脚本正在运行，请结束之前进程");
    //     return;
    // }
    console.log("选择ID" + ui.radiogroup.getCheckedRadioButtonId())
    threads.start(function () {
        execution = engines.execScript("刷题助手", getScript(idx_dict[ui.radiogroup.getCheckedRadioButtonId()]));//直接下载0.js
        toastLog('脚本加载完成')
    });
});


// 悬浮窗权限
ui.consoleshow.on("check", function (checked) {
    if (checked && !floaty.checkPermission()) {
        app.startActivity({
            packageName: "com.android.settings",
            className: "com.android.settings.Settings$AppDrawOverlaySettingsActivity",
            data: "package:" + context.getPackageName(),
        });
    }
});
// 创建选项菜单(右上角)
ui.emitter.on("create_options_menu", menu => {
    menu.add("日志");
    menu.add("关于");
});

// 监听选项菜单点击
ui.emitter.on("options_item_selected", (e, item) => {
    switch (item.getTitle()) {
        case "日志":
            app.startActivity("console");
            break;
        case "关于":
            alert("关于", "学习助手辅助刷题工具");
            break;
    }
    e.consumed = true;
});
// 读取脚本设置
function Initialize() {
    ui.stzs_cycle_wait_time.setText(STZS_CONFIG.get("cycle_wait_time", "1100"));
    ui.stzs_chongzhi_cishu.setText(STZS_CONFIG.get("chongzhi_cishu", "10"));
}
// 保存刷题助手脚本设置
ui.stzs_save.click(function () {
    STZS_CONFIG.put("cycle_wait_time", ui.stzs_cycle_wait_time.getText() + "");
    STZS_CONFIG.put("chongzhi_cishu", ui.stzs_chongzhi_cishu.getText() + "");
    toastLog("配置保存成功！");
})

function getScript(choice) {
    let url_prefix = [
        'https://gh.xlong1060.top/https://raw.githubusercontent.com/lkamh/stzs/main/',
        'https://mirror.ghproxy.com/https://raw.githubusercontent.com/lkamh/stzs/main/'
    ];
    for (var i = 0; i < url_prefix.length; i++) {
        try {
            let res = http.get(url_prefix[i] + choice + ".js");
            console.log(i, ":" + res.statusCode);
            if (res.statusCode == 200) {
                var UI = res.body.string();
                if (UI.indexOf('auto.waitFor();') == 0) break;
            } else {
                toastLog('学习脚本:地址' + i + '下载失败');
            }
        } catch (error) {
            console.log(error);
        }
    }
    return UI;
}

// function strToArr(str) {
//     if (!str) {
//         return [];
//     }
//     //防止保活时,连环回调放入空字符,去掉末尾没用的字符串
//     return str.replace(/:$/, "").split(":");
// }
// try {
//     importClass(android.os.Handler);
//     importClass(android.database.ContentObserver);
//     let curPackage = auto.service ? currentPackage() : "com.lkamh.stzs"

//     //保活白名单数组,也可以时其他应用的服务名,这里是autojspro的
//     const whiteList = [curPackage + "/com.stardust.xxzs.AccessibilityService"];
//     const contentResolver = context.getContentResolver();
//     let lastArr = strToArr(Settings.Secure.getString(contentResolver, "enabled_accessibility_services"));
//     let contentObserver = JavaAdapter(
//         ContentObserver, {
//         onChange(b) {
//             let service = "";
//             let str = Settings.Secure.getString(contentResolver, "enabled_accessibility_services");
//             let newArr = strToArr(str);
//             if (newArr.length > lastArr.length) {
//                 newArr.some(item => {
//                     service = item;
//                     return !lastArr.includes(item);
//                 });
//                 console.log("开启了----", service);
//             } else if (newArr.length < lastArr.length) {
//                 lastArr.some(item => {
//                     service = item;
//                     return !newArr.includes(item);
//                 });
//                 //这里可以做一些保活处理
//                 if (service && whiteList.includes(service)) {
//                     try {
//                         newArr.push(service);
//                         let success = Settings.Secure.putString(contentResolver, "enabled_accessibility_services", newArr.join(":"));
//                         console.log(`${success ? "保活成功" : "保活失败"}----${service}`);
//                     } catch (error) {
//                         console.log("没有权限----", error);
//                     }
//                 } else {
//                     console.log("关闭了----", service);
//                 }
//             }
//             lastArr = newArr;
//         },
//     },
//         new Handler()
//     );
//     contentResolver.registerContentObserver(Settings.Secure.getUriFor("enabled_accessibility_services"), true, contentObserver);
//     events.on("exit", () => {
//         contentResolver.unregisterContentObserver(contentObserver);
//     });
// } catch (e) {
//     console.error(e);
// }
//保持脚本运行
setInterval(() => { }, 1000);