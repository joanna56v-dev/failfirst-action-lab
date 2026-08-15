export const lifeAdventures = [
  {
    id: "life-01",
    title: "未打开的旅行箱",
    description: "旅行箱已经收好，地图已经打开，但出发日期一直没有确定。",
    choices: [
      { text: "🧳 买票出发｜路上的问题路上解决", effect: { ready: 3 } },
      { text: "📚 下载旅行攻略｜先收集更多信息", effect: { collect: 2 } },
      { text: "🗺 规划完美路线｜设计一次满分旅程", effect: { perfect: 2 } },
      { text: "⏰ 等一个好时机｜条件都合适再走", effect: { wait: 2 } },
    ],
  },
  {
    id: "life-02",
    title: "陌生城市",
    description: "你来到陌生城市：没有朋友，也没有熟悉路线。",
    choices: [
      { text: "🧭 探索地图｜先走出去看看", effect: { ready: 2 } },
      { text: "🏠 回到安全区域｜这里超出舒适区", effect: { wait: 2 } },
      { text: "📱 搜索通关攻略｜先了解所有可能", effect: { think: 2 } },
      { text: "📸 重做旅行计划｜让体验更完美", effect: { perfect: 1 } },
    ],
  },
  {
    id: "life-03",
    title: "语言森林",
    description: "你遇到当地人，需要开口交流，但可能会说错。",
    choices: [
      { text: "🎤 勇敢开口｜错误也是经验", effect: { ready: 3 } },
      { text: "📖 再学 100 句｜准备更多表达", effect: { collect: 2 } },
      { text: "🧠 模拟所有对话｜预测每种情况", effect: { think: 2 } },
      { text: "🙈 明天再试｜今天状态不太好", effect: { tomorrow: 2 } },
    ],
  },
  {
    id: "life-04",
    title: "独处夜晚",
    description: "夜晚降临。第一次，只有你自己面对未知。",
    choices: [
      { text: "🌱 接受未知｜这也是冒险的一部分", effect: { ready: 2 } },
      { text: "🔍 分析原因｜先弄清哪里不舒服", effect: { think: 1 } },
      { text: "📱 查找经验｜看看别人如何通关", effect: { collect: 1 } },
      { text: "🏠 返回熟悉地方｜那里更安全", effect: { wait: 2 } },
    ],
  },
  {
    id: "life-05",
    title: "远方灯塔",
    description: "你终于来到灯塔。回头看，曾经害怕的地方没有想象中可怕。",
    choices: [
      { text: "🌅 点亮灯塔｜记录这次冒险", effect: { ready: 3 } },
      { text: "📝 写下攻略｜收藏全部经验", effect: { collect: 1 } },
      { text: "🔄 规划下一次｜设计完美冒险", effect: { perfect: 1 } },
      { text: "⏳ 等下一次机会｜以后还有时间", effect: { tomorrow: 2 } },
    ],
  },
] as const;
