let modInfo = {
	name: "节奏游戏树",
	author: "Justcubing97",
	pointsName: "音乐精华",
	modFiles: ["a.js", "notes.js", "songs.js", "ddr.js", "ddrfc.js", "bs.js", "tree.js", "ddrm.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // 用于硬重置和新玩家
	offlineLimit: 1,  // 单位：小时
}

// 在 num 和 name 中设置你的版本
let VERSION = {
	num: "3.0",
	name: "节奏光剑介绍",
}

let changelog = `<h1>更新日志：</h1><br>
	<h2>v3.0</h2><br>
		- 完成了 DDR 层！ <br>
        - 节奏光剑层介绍！ <br><br>
	<h2>v2.3</h2><br>
		- 正确标注了 Camellia 的贡献。我的错！ <br>
        - 大量新内容！ <br><br>
	<h2>v2.2</h2><br>
		- 在 DDR 小游戏中实现了连击功能。 <br>
        - 更多 DDR 内容！ <br>
        - 音乐！22 首由 Camellia 和我精选的曲目 - 契合节奏游戏主题。 <br>
        - 更多成就。 <br><br>
	<h2>v2.1</h2><br>
		- 添加了 DDR 小游戏的效果。 <br>
        - 修复了音符层进度 - 不再在 1e10 音符处卡关！ <br>
        - 更多箭头升级。 <br><br>
	<h2>v2.0</h2><br>
		- 修复了升级的 CSS。 <br>
        - 新的 DDR 小游戏！ <br>
        - 实现了一个箭头升级。 <br><br>
	<h3>v1.1</h3><br>
		- 修复了元素的 CSS。 <br><br>
	<h2>v1.0</h2><br>
		- 三个层：音符、歌曲和 DDR！ <br>
		- 7 个成就。`

let winText = `恭喜！你已经到达终点并在 ${VERSION.num} 版本中通关了这个游戏！如果版本号低于 7，还有更多内容！`

// 如果你在某个层中添加了任何新函数，并且这些函数在调用时有效果，请将它们添加到这里。
// （这里的是示例，所有官方函数都已经处理好了）
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "arrowClicking_DDRM", "findMults_DDRM"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// 决定是否显示每秒点数
function canGenPoints(){
	return true
}

// 计算每秒点数！
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

    let layer;
	let mult = new Decimal(1)
    //加
    layer = "n"
    if (hasUpgrade(layer, 23)) mult = mult.add(6)
    if (hasUpgrade(layer, 101)) mult = mult.add(3)
    if (hasUpgrade(layer, 103)) mult = mult.add(10)
    //乘
    if (hasAchievement("a", 26)) mult = mult.mul("1e100")

    layer = "n"
    if (hasUpgrade(layer, 11)) mult = mult.mul(3)
    if (hasUpgrade(layer, 12)) mult = mult.mul(upgradeEffect(layer, 12))
    if (hasUpgrade(layer, 14)) mult = mult.mul(4)
    if (hasUpgrade(layer, 21)) mult = mult.mul(6)
    if (hasUpgrade(layer, 34)) mult = mult.mul(4)
    if (hasUpgrade(layer, 102)) mult = mult.mul(upgradeEffect(layer, 102))
    if (hasUpgrade(layer, 202)) mult = mult.mul(500)
    if (hasUpgrade(layer, 42)) mult = mult.mul(1000)
    if (hasUpgrade(layer, 43)) mult = mult.mul(upgradeEffect(layer, 43))
    if (hasUpgrade(layer, 44)) mult = mult.mul(2500)
    if (hasUpgrade(layer, 112)) mult = mult.mul("2e4")
    if (hasUpgrade(layer, 302)) mult = mult.mul(upgradeEffect(layer, 302))

    layer = "s"
    if (hasUpgrade(layer, 11)) mult = mult.mul(upgradeEffect(layer, 11))
    if (hasUpgrade(layer, 13)) mult = mult.mul(upgradeEffect(layer, 13))
    if (hasUpgrade(layer, 23)) mult = mult.mul(125)
    if (hasUpgrade(layer, 33)) mult = mult.mul("1e21")
    if (hasChallenge(layer, 12)) mult = mult.mul("1e15")

    layer = "ddr"
    if (hasUpgrade(layer, 11)) mult = mult.mul(upgradeEffect(layer, 11))
    if (hasUpgrade(layer, 13)) mult = mult.mul("1e6")
    if (hasChallenge(layer, 11)) mult = mult.mul("1e10")
    if (hasUpgrade(layer, 23)) mult = mult.mul("1e15")
    if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)
    if (hasUpgrade(layer, 43)) mult = mult.mul("1e20")
        
    mult = mult.mul(player.ddrm.mEffect)
    mult = mult.mul(buyableEffect(layer, 21))

    if (player.ddrfc.points.gte(1)) mult = mult.mul("1e25")
    if (player.ddrfc.points.gte(2)) mult = mult.mul("1e25")
    if (player.ddrfc.points.gte(3)) mult = mult.mul("1e25")
    if (player.ddrfc.points.gte(4)) mult = mult.mul("1e250")

    layer = "bs"
    if (hasUpgrade(layer, 11)) mult = mult.mul("1e1000")
    //指数
    layer = "n"
    if (hasUpgrade(layer, 201)) mult = mult.pow(1.05)
    if (hasUpgrade(layer, 304)) mult = mult.pow(1.15)

    layer = "ddr"
    if (hasMilestone(layer, 2)) mult = mult.pow(1.1)
    //超
    layer = "n"
    //时间膨胀/挑战
    layer = "n"
    layer = "s"
    if (inChallenge(layer, 11)) mult = mult.pow(0.5)
    if (inChallenge(layer, 12)) mult = mult.pow(0.01)

    layer = "ddr"
    if (inChallenge(layer, 11)) mult = mult.pow(0.75)
    if (inChallenge(layer, 22)) mult = mult.pow(0.1)
    mult = mult.pow(player.ddr.voltage)
    //=====
    //软上限相关
    let softcap1 = new Decimal(0.25)
    let softcap1Start = new Decimal("1e2000")
    if (mult.gte(softcap1Start)) mult = mult.pow(softcap1).mul(new Decimal(softcap1Start).pow(decimalOne.sub(softcap)))

    //以下与音乐精华获取无关！
    //DDR 挑战的音乐精华连击削弱
    if (inChallenge("ddr", 11)) player.MEComboNerf = player.points.add(2).log(10).div(350)
    if (inChallenge("ddr", 12)) player.MEComboNerf = player.points.add(2).log(25).div(500)
    if (inChallenge("ddr", 21)) player.MEComboNerf = new Decimal(0.98).pow(player.ddrm.combo)
    if (inChallenge("ddr", 22)) player.MEComboNerf = player.points.add(2).log(100).div(1000)

	return mult
}

// 你可以在这里添加与层无关的变量，这些变量应该存入 "player" 并保存，以及默认值
function addedPlayerData() { return {
    MEComboNerf: new Decimal(1),
}}

// 在页面顶部显示额外内容
var displayThings = [
    "当前终局：总共 40 个音符升级。",
    "节奏游戏树由 Justcubing97 制作",
    function() {
		if (inChallenge("ddr", 11) ||
        inChallenge("ddr", 12) ||
        inChallenge("ddr", 22)) return `<br><b>音乐精华正在将连击获取乘以 x${format(player.MEComboNerf, 4)}！</b>`
		if (inChallenge("ddr", 21)) return `<br><b>连击正在将连击获取乘以 x${format(player.MEComboNerf, 4)}！</b>`
		else return ""
	},
    function() {
		if (player.points.gte("1e2000")) return "<b>第一个软上限：1e2000</b>"
	},
]

// 决定游戏何时"结束"
function isEndgame() {
	return hasUpgrade("bs", 11)
}



// 从这里开始是不太重要的内容！

// 背景样式，可以是函数
var backgroundStyle = {
}

// 如果你有可能会被长时间 tick 破坏的内容，可以修改这个
function maxTickLength() {
	return(3600) // 默认是 1 小时，这已经足够大了
}

// 如果你需要修复旧版本的通胀问题，可以使用这个。如果版本早于修复问题的版本，
// 你可以用这个来限制他们的当前资源。
function fixOldSave(oldVersion){
}

/*

addLayer("LAYERHERE", {
    name: "LAYERHERE", // 这是可选的，只在少数地方使用，如果省略则使用层 ID。
    symbol: "SYMBOLHERE", // 这显示在层的节点上。默认是首字母大写的 ID
    position: POSITIONHERE, // 在一行内的水平位置。默认使用层 ID 并按字母顺序排序
    startData() { return {
        unlocked: false,
		points: new Decimal(0),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"), //普通层的默认值
    }},
    color: "COLORHERE",
	nodeStyle() {
		const style = {};
		style.background = "linear-gradient( SECCOLORHERE, PRIMCOLORHERE)";
		return style;
	},
    requires: new Decimal(NUMBERHERE), // 可以是一个考虑需求增长的函数
    resource: "CURRENCYHERE", // 声望货币的名称
    baseResource: "CURRENCYHERE", // 声望基于的资源名称
    baseAmount() {return player.LAYERHERE.points}, // 获取当前基础资源数量
    type: "normal", // normal: 获取货币的成本取决于获取量。static: 成本取决于你已有的数量
    exponent: NUMBERHERE, // 声望货币指数
    gainMult() { // 计算主要货币的加成倍数
        let layer;
        let mult = new Decimal(1)
        //加
        //乘
        //指数 
        //其他超
        //时间膨胀/挑战
        //最终
        return mult
    }, //主要倍数
    getResetGain() {
        let layer = "LAYERHERE"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (gain.gte(player[layer].softcap1Start)) gain = gain.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
        //在此行之后放置第一个软上限相关的内容
            
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
    },
    row: ROWHERE, // 层在树中的行（0 是第一行）
    hotkeys: [ //货币使用 shift，小游戏使用普通键
        {key: "KEYHERE", description: "KEYDESCHERE：重置以获取 CURRENCYHERE", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (BOOLHERE) player.LAYERHERE.unlocked = true
        return player.LAYERHERE.unlocked
    },
    passiveGeneration() {BOOLHERE}, //如果是静态的，使用 autoPrestige()！
    doReset(resettingLayer) {
        // 阶段 1，几乎总是需要，使重置此层不会删除你的进度
        if (layers[resettingLayer].row <= this.row) return;

        // 阶段 2，记录你想保留的特定子功能，例如升级 11、挑战 32、可购买 12
        let keptUpgrades = []

        let keptBuyables = []

        // 阶段 3，记录你想保留的主要功能 - 所有升级、总点数、特定开关等。
        let keep = [];

        // 阶段 4，执行实际的数据重置
        layerDataReset(this.layer, keep);

        // 阶段 5，重新添加你之前保存的特定子功能
    }, //感谢 TMT 服务器的逃脱者
    upgrades: {
        11: {
            title: "占位符",
            description: "???",
            cost: new Decimal("1e234987234987234"),
        },
    },
    tooltip() {return format(player.LAYERHERE.points) + " CURRENCYHERE (+" + format(getResetGain("LAYERHERE")) + " CURRENCYHERE 重置时)"},
})

*/