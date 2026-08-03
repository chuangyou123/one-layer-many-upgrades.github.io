addLayer("ddrfc", {
    name: "ddrfc", // 可选，仅在少数地方使用，如果省略则使用层ID
    symbol: "FC", // 显示在层节点上，默认是ID首字母大写
    position: 1, // 行内水平位置，默认按ID字母顺序排序
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        resetting: true,
    }},
    color: "#63b0e7",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient( #dd389b, #63b0e7)";
		return style;
	},
    resource: "全连击等级", // 声望货币名称
    baseResource: "箭头", // 声望所基于的资源名称
    baseAmount() {return player.ddr.points}, // 获取当前基础资源数量
    requires() {return new Decimal("1e15")},
    type: "static", // normal: 获取货币的成本取决于已获取数量。static: 成本取决于已有数量
    exponent: 3, // 声望货币指数
    base: 100,
    directMult() { // 计算主货币的加成倍数
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //time dilations/chals
        //final
        return mult
    }, //在directMult()内完成所有操作
    row: 2, // 层在树中的行位置（0是第一行）
    hotkeys: [
        {key: "F", description: "SHIFT+F: 重置以获得全连击等级", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("n", 314)) player.ddrfc.unlocked = true
        return player.ddrfc.unlocked
    },
    resetsNothing() {return false},
    autoPrestige() {return false},
    canBuyMax() {return false},
    doReset(resettingLayer) {
        // 阶段1，几乎总是需要，重置此层不会删除你的进度
        if (layers[resettingLayer].row <= this.row) return;

        // 阶段2，记录你想保留的特定子功能，例如升级11、挑战32、可购买12
        let keptUpgrades = []

        // 阶段3，记录你想保留的主要功能 - 所有升级、总点数、特定开关等
        let keep = [];

        // 阶段4，执行实际的数据重置
        layerDataReset(this.layer, keep);

        // 阶段5，添加回之前保存的特定子功能
    }, //感谢TMT服务器的逃逸者

    tabFormat: {
        "ddrfc": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.ddr.points)} 个箭头。`}],
                "blank",
                ["display-text", function(){return `你当前处于全连击等级 <h2 style="color: #63b0e7; text-shadow: 0px 0px 10px #63b0e7">${format(player.ddrfc.points)}</h2>，提供...`}],
                "blank",
                ["display-text", function(){
                    let text = ""
                    if (player.ddrfc.points.gte(1)) text = "<h3>x1e25 百万能量</h3>"
                    if (player.ddrfc.points.gte(2)) text = "<h3>x1e50 百万能量<br>x1e10 音符<br>x1.5 歌曲</h3>"
                    if (player.ddrfc.points.gte(3)) text = "<h3>x1e75 百万能量<br>x1e20 音符<br>x1.875 歌曲<br>x25 百万、十亿和万亿箭头</h3>"
                    if (player.ddrfc.points.gte(4)) text = "<h3>x1e325 百万能量<br>x1e120 音符<br>x4.6875 歌曲<br>x25 百万、十亿和万亿箭头<br>x1e10 连击增益</h3>"
                    if (player.ddrfc.points.gte(5)) text = "<h3>x1e325 百万能量<br>x1e120 音符<br>x4.6875 歌曲<br>x25 百万、十亿和万亿箭头<br>x1e10 连击增益<br><br>生活质量：批量购买DDR可购买项。</h3>"
                    if (player.ddrfc.points.gte(6)) text = "<h3>x1e325 百万能量<br>x1e120 音符<br>x4.6875 歌曲<br>x25 百万、十亿和万亿箭头<br>x1e10 连击增益<br><br>生活质量：批量购买DDR可购买项。<br>生活质量：被动生成来自完美箭头的连击的1%。</h3>"
                    return text
                }],
                ["blank", "24px"],
                ["display-text", function(){return `全连击等级 <h2 style="color: #63b0e7; text-shadow: 0px 0px 10px #63b0e7">${format(player.ddrfc.points.add(1))}</h2> 将额外提供...`}],
                "blank",
                ["display-text", function(){
                    let text = ""
                    if (player.ddrfc.points.gte(1)) text = "<h3>x1e25 百万能量<br>1e10 音符<br>x1.5 歌曲</h3>"
                    if (player.ddrfc.points.gte(2)) text = "<h3>x1e25 百万能量<br>x1e10 音符<br>x1.25 歌曲<br>x25 百万、十亿和万亿箭头</h3>"
                    if (player.ddrfc.points.gte(3)) text = "<h3>x1e250 百万能量<br>x1e100 音符<br>x2.5 歌曲<br>x1e10 连击增益</h3>"
                    if (player.ddrfc.points.gte(4)) text = "<h3>生活质量：批量购买DDR可购买项。</h3>"
                    if (player.ddrfc.points.gte(5)) text = "<h3>生活质量：被动生成来自完美箭头的连击的1%。</h3>"
                    if (player.ddrfc.points.gte(6)) text = "<h3>???</h3>"
                    return text
                }],
            ]
        },
    },

    branches: [["bs", 1]],
    tooltip() {
        if (canReset(this.layer)) return format(player.ddrfc.points) + " 全连击等级（重置时+" + format(getResetGain("ddrfc")) + " 全连击等级）"
        return format(player.ddrfc.points) + " 全连击等级（无法重置）"
    },
})