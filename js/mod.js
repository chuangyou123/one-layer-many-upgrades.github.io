let modInfo = {
	name: "1 层，众多升级",
	id: "1L1KUpgv3RD2",
	author: "randim82",
	pointsName: "能量",
	modFiles: ["tree.js", "layer.js"],

	discordName: "Discord",
	discordLink: "https://discord.com/invite/RRK9Dwzf6P",
	initialStartPoints: new Decimal(0), // 用于硬重置和新玩家
	offlineLimit: 0,
}

// 在此设置版本号和名称
let VERSION = {
	num: "3",
	name: "能量！",
}

let changelog = `<h1>更新日志：</h1><br> 暂无`
let winText = `恭喜！你已经到达终点并通关了这个游戏！如果你喜欢，可以加入我的 Discord 服务器以获取未来的抢先预览和更新通知。你也可以在 Discord 中留下评论或报告错误！目前就这些。~RD82`

// 如果你在层内任何地方添加了新函数，并且这些函数在被调用时有效果，请将它们添加到这里。
// （这里的只是示例，所有官方函数都已处理）
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// 决定是否显示每秒点数
function canGenPoints(){
	return true
}

// 计算每秒点数！
// 基础收益为 2 能量/秒，乘以每个已购买升级的效果。
// upgEffects[n] = prevBoost^exp，其中 exp 从 1.1 开始，每个升级 *1.02。
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(2)
	let totalUpgUnlocked = player.p.upgrades.length

	if (player.p && player.p.unlocked) {
		gain = gain.mul(totalUpgEffects[totalUpgUnlocked]);
	}
	if (totalUpgUnlocked < (50*(getBuyableAmount("p",13).toNumber()))) {
		gain = gain.mul(buyableEffect("p",13))
	}
    if (hasMilestone("p",5)) gain = gain.mul(2)
    if (hasMilestone("p",7)) gain = gain.mul(1.25)

	if (tmp.aura && tmp.aura.powerMult) {
		gain = gain.mul(tmp.aura.powerMult);
	}

	return gain
}

// 你可以在这里添加与层无关的变量，这些变量会存入 "player" 并保存，同时包含默认值
function addedPlayerData() { return {
}}

// 在页面顶部显示额外内容
var displayThings = [
	function() {
		display = ""
		return display
	},
]

// 决定游戏何时"结束"
function isEndgame() {
	return false
}


// 这里往下是不太重要的内容！

// 背景样式，可以是函数
var backgroundStyle = {

}

// 如果你有可能会被长时间 tick 影响的内容，可以修改此值
function maxTickLength() {
	return(3600) 
}

// 如果你需要修复旧版本的通胀问题，可以使用此函数。如果版本早于修复该问题的版本，
// 你可以用此函数限制他们当前的资源。
function fixOldSave(oldVersion){

}