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
            </appbar>
            <frame >
                <vertical>
                    <horizontal gravity="center_vertical" padding="5 20" >
                        <View bg="#3399ff" h="*" w="8"  ></View>
                        <horizontal gravity="center">
                            <Switch id="autoService" text="  无障碍服务" checked="{{auto.service != null}}" gravity="left" textSize="18sp" />
                            <Switch id="consoleshow" text="    悬浮窗权限" checked="{{(new android.provider.Settings).canDrawOverlays(context) != false}}" gravity="right" textSize="18sp" />
                        </horizontal>
                    </horizontal>
                    <vertical gravity="center">
                        <card gravity="center" marginTop="10xp" w="100" h="30" cardCornerRadius="10" >
                            <vertical gravity="center" bg="#03A6EF">
                                <text text="脚本选择" gravity="center" />
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
        </vertical>
        <vertical layout_gravity="left" bg="#ffffff" w="280">
            <img w="280" h="200" scaleType="fitXY" src="http://images.shejidaren.com/wp-content/uploads/2014/10/023746fki.jpg" />
            <list id="menu">
                <horizontal bg="?selectableItemBackground" w="*">
                    <img w="50" h="50" padding="16" src="{{this.icon}}" tint="{{color}}" />
                    <text textColor="black" textSize="15sp" text="{{this.title}}" layout_gravity="center" />
                </horizontal>
            </list>
        </vertical>
    </drawer>
);

http.__okhttp__.setTimeout(10000);

var idx_dict = {
      "46": 0,
      "49": 1
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
        execution = engines.execScript("学习助手", getScript(idx_dict[ui.radiogroup.getCheckedRadioButtonId()]));//直接下载0.js
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
activity.setSupportActionBar(ui.toolbar);

// //两次才能返回
// threads.start(function () {
//     var isCanFinish = false;
//     var isCanFinishTimeout;
//     ui.emitter.on("back_pressed", e => {
//         if (!isCanFinish) {
//             isCanFinish = true;
//             isCanFinishTimeout = setTimeout(() => {
//                 toastLog("再返回一次就失去我了哟！");
//                 isCanFinish = false;
//             }, 500);
//             e.consumed = true;
//         } else {
//             clearTimeout(isCanFinishTimeout);
//             e.consumed = false;
//         };
//     });
//     setInterval(() => { }, 1000)
// });

function getScript(choice) {
    let url_prefix = [
        'https://mirror.ghproxy.com/https://raw.githubusercontent.com/lkamh/waxx/main/',
        'https://raw.fastgit.org/lkamh/waxx/main/',
        'https://gh-proxy.com/https://raw.githubusercontent.com/lkamh/waxx/main/',
        'https://gh.api.99988866.xyz/https://raw.githubusercontent.com/lkamh/waxx/main/'
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

function strToArr(str) {
    if (!str) {
        return [];
    }
    //防止保活时,连环回调放入空字符,去掉末尾没用的字符串
    return str.replace(/:$/, "").split(":");
}
try {
    importClass(android.os.Handler);
    importClass(android.database.ContentObserver);
    let curPackage = auto.service ? currentPackage() : "com.lkamh.stzs"

    //保活白名单数组,也可以时其他应用的服务名,这里是autojspro的
    const whiteList = [curPackage + "/com.stardust.xxzs.AccessibilityService"];
    const contentResolver = context.getContentResolver();
    let lastArr = strToArr(Settings.Secure.getString(contentResolver, "enabled_accessibility_services"));
    let contentObserver = JavaAdapter(
        ContentObserver, {
            onChange(b) {
                let service = "";
                let str = Settings.Secure.getString(contentResolver, "enabled_accessibility_services");
                let newArr = strToArr(str);
                if (newArr.length > lastArr.length) {
                    newArr.some(item => {
                        service = item;
                        return !lastArr.includes(item);
                    });
                    console.log("开启了----", service);
                } else if (newArr.length < lastArr.length) {
                    lastArr.some(item => {
                        service = item;
                        return !newArr.includes(item);
                    });
                    //这里可以做一些保活处理
                    if (service && whiteList.includes(service)) {
                        try {
                            newArr.push(service);
                            let success = Settings.Secure.putString(contentResolver, "enabled_accessibility_services", newArr.join(":"));
                            console.log(`${success ? "保活成功" : "保活失败"}----${service}`);
                        } catch (error) {
                            console.log("没有权限----", error);
                        }
                    } else {
                        console.log("关闭了----", service);
                    }
                }
                lastArr = newArr;
            },
        },
        new Handler()
    );
    contentResolver.registerContentObserver(Settings.Secure.getUriFor("enabled_accessibility_services"), true, contentObserver);
    events.on("exit", () => {
        contentResolver.unregisterContentObserver(contentObserver);
    });
} catch (e) {
    console.error(e);
}
//保持脚本运行
setInterval(() => {}, 1000);