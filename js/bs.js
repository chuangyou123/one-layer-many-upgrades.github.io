addLayer("bs", {
    name: "bs", // 这是可选的，只在少数地方使用，如果省略则使用层 ID。
    symbol: "⚔️", // 这显示在层的节点上。默认是 ID 首字母大写
    position: 0, // 行内的水平位置。默认使用层 ID 并按字母顺序排序
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"), // 普通层的默认值
    }},
    color: "#E00000",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient(90deg, #E00000, #0000E0)";
		return style;
	},
    requires: new Decimal("1e300"), // 可以是一个考虑需求增长的函数
    resource: "方块", // 声望货币名称
    baseResource: "箭头", // 声望所基于的资源名称
    baseAmount() {return player.ddr.points}, // 获取当前基础资源数量
    type: "normal", // normal: 获得货币的成本取决于已获得数量。static: 成本取决于你已有的数量
    exponent: 0.1, // 声望货币指数
    gainMult() { // 从加成中计算主货币的倍率
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //time dilations/chals
        //final
        return mult
    }, //主要倍率
    getResetGain() {
        let layer = "bs"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (gain.gte(player[layer].softcap1Start)) gain = gain.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
        //在此行之后放置第一个软上限之后的内容
            
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
    },
    row: 3, // 层在树中的行（0 是第一行）
    hotkeys: [ //使用 shift 键用于货币，普通键用于小游戏
        {key: "C", description: "SHIFT+C: 重置以获得方块", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("s", 44)) player.bs.unlocked = true
        return player.bs.unlocked
    },
    passiveGeneration() {return false}, //如果是静态的，请使用 autoPrestige()！
    doReset(resettingLayer) {
        // 阶段 1，几乎总是需要，重置此层不会删除你的进度
        if (layers[resettingLayer].row <= this.row) return;

        // 阶段 2，跟踪你想保留的特定子功能，例如升级 11、挑战 32、可购买 12
        let keptUpgrades = []

        let keptBuyables = []

        // 阶段 3，跟踪你想保留的主要功能 - 所有升级、总点数、特定开关等。
        let keep = [];

        // 阶段 4，执行实际的数据重置
        layerDataReset(this.layer, keep);

        // 阶段 5，添加回你之前保存的特定子功能
    }, //感谢 TMT 服务器的逃逸者
    upgrades: {
        11: {
            title: "这里有一个巨大的恢复加成。",
            description: "x1e1000 机械能量，并且始终批量合成歌曲。x100 箭头。",
            cost: new Decimal("1"),
        },
    },
    tooltip() {return format(player.bs.points) + " 方块（重置时 +" + format(getResetGain("bs")) + " 方块）"},
})