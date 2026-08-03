addLayer("s", {
    name: "s", // 这是可选的，只在少数地方使用，如果省略则使用层ID
    symbol: "🎧", // 这显示在层的节点上。默认是ID首字母大写
    position: 0, // 行内的水平位置。默认使用层ID并按字母顺序排序
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),

        resetting: true,
    }},
    color: "#80FFB0",
    requires() {
        if (inChallenge("ddr", 12)) return new Decimal("10").tetrate("1e100")
        return new Decimal("1e20")
    }, // 可以是一个考虑需求增长的函数
    resource: "歌曲", // 声望货币名称
    baseResource: "音符", // 声望基于的资源名称
    baseAmount() {return player.n.points}, // 获取当前基础资源的数量
    type: "static", // normal: 获得货币的成本取决于已获得的数量。static: 成本取决于你已有的数量
    exponent: 2, // 声望货币指数
    base: 10,
    directMult() { // 计算来自加成的主货币倍率
        let layer;
        let mult = new Decimal(1)
        //加
        layer = "n"
        layer = "s"
        if (hasMilestone(layer, 5)) mult = mult.add(1)
        if (hasChallenge(layer, 12)) mult = mult.add(0.5)
        //乘
        layer = "n"
        if (hasUpgrade(layer, 204)) mult = mult.mul(1.5)
        if (hasUpgrade(layer, 211)) mult = mult.mul(1.2)
        if (hasUpgrade(layer, 42)) mult = mult.mul(1.25)
        if (hasUpgrade(layer, 112)) mult = mult.mul(1.1)
        if (hasUpgrade(layer, 313)) mult = mult.mul(upgradeEffect(layer, 313))

        layer = "ddr"
        if (hasChallenge(layer, 11)) mult = mult.mul(1.25)
        if (hasMilestone(layer, 1)) mult = mult.mul(1.05)

        mult = mult.mul(player.ddrm.aEffect)
        mult = mult.mul(buyableEffect(layer, 13))

        if (player.ddrfc.points.gte(2)) mult = mult.mul(1.5)
        if (player.ddrfc.points.gte(3)) mult = mult.mul(1.25)
        if (player.ddrfc.points.gte(4)) mult = mult.mul(2.5)
        //指数
        //其他超空间
        //时间膨胀/挑战
        //最终
        return mult
    }, //在directMult()中完成所有操作
    row: 1, // 层在树中的行（0是第一行）
    hotkeys: [
        {key: "S", description: "SHIFT+S: 重置以获得歌曲", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (player.n.points.gte("1e20")) player.s.unlocked = true
        return player.n.points.gte("1e20") || player.s.unlocked
    },
    resetsNothing() {return hasUpgrade("ddr", 43) && !player.s.resetting},
    autoPrestige() {return hasUpgrade("ddr", 44)},
    resetDescription: "创作 ",
    canBuyMax() {return hasMilestone(this.layer, 1) || hasUpgrade("ddr", 12) || hasUpgrade(layer, 11)},
    doReset(resettingLayer) {
        // 阶段1，几乎总是需要的，使重置此层不会删除你的进度
        if (layers[resettingLayer].row <= this.row) return;

        // 阶段2，跟踪你想保留的特定子功能，例如升级11、挑战32、可购买12
        let keptUpgrades = []
        if (hasUpgrade("ddr", 22)) keptUpgrades.push(11, 12, 13, 14, 21, 22, 23, 24)
        
        if (hasUpgrade("s", 31)) keptUpgrades.push(31)
        if (hasUpgrade("s", 32)) keptUpgrades.push(32)
        if (hasUpgrade("s", 33)) keptUpgrades.push(33)
        if (hasUpgrade("s", 34)) keptUpgrades.push(34)

        if (hasUpgrade("s", 41)) keptUpgrades.push(41)
        if (hasUpgrade("s", 42)) keptUpgrades.push(42)
        if (hasUpgrade("s", 43)) keptUpgrades.push(43)
        if (hasUpgrade("s", 44)) keptUpgrades.push(44)

        if (resettingLayer == "bs") keptUpgrades = []

        let keptMilestones = []
        if (hasUpgrade("ddr", 22)) keptMilestones.push("1", "2", "3", "4")
        if (hasChallenge("ddr", 22)) keptMilestones.push("5", "6", "7", "8", "9", "10")
            
        if (resettingLayer == "bs") keptMilestones = []

        let keptChallenges = []
        if (hasUpgrade("n", 303)) keptChallenges.push(11)
        if (hasChallenge("s", 12)) keptChallenges.push(12)

        if (resettingLayer == "bs") keptChallenges = []

        // 阶段3，跟踪你想保留的主要功能 - 所有升级、总点数、特定开关等
        let keep = [];
        if (hasUpgrade("ddr", 23)) keep.push("total")

        let iR = player.s.resetting

        // 阶段4，执行实际的数据重置
        layerDataReset(this.layer, keep);

        // 阶段5，添加回你之前保存的特定子功能
        player.s.resetting = iR
        player.s.upgrades.push(...keptUpgrades)
        player.s.milestones.push(...keptMilestones)
        keptChallenges.forEach(element => player[this.layer].challenges[element] = 1)
    }, //感谢来自TMT服务器的ESCAPEE

    tabFormat: {
        "s": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.n.points)} 个音符。`}],
                "blank",
                ["display-text", function(){return `你总共创作了 ${format(player.s.total)} 首歌曲。`}],
                "blank",
                "upgrades",
                "blank",
                "clickables",
                "blank",
                "challenges",
            ]
        },
        "s": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.n.points)} 个音符。`}],
                "blank",
                ["display-text", function(){return `你总共创作了 ${format(player.s.total)} 首歌曲。`}],
                "blank",
                "milestones",
            ],
            unlocked() {return player.s.points.gte(3) || hasMilestone("s", 1)}
        },
    },

    upgrades: {
        11: {
            title: "作曲",
            effect() {
                let base = player.s.total.add(1).mul(5)
                base = base.pow(0.75).mul(25)
                if (hasUpgrade("n", 113)) base = base.mul(100).pow(1.5)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐能量"},
            description: "总歌曲创作数提升音乐能量。",
            cost: new Decimal("1"),
        },
        12: {
            title: "节奏变化",
            description: "解锁半音符（在音符层中）。",
            cost: new Decimal("2"),
        },
        13: {
            title: "音乐体验",
            effect() {
                let base = player.s.points.add(1)
                base = base.pow(1.25).mul(75)
                if (hasUpgrade(this.layer, 21)) base = base.pow(1.5)
                if (hasUpgrade("n", 113)) base = base.mul(50).pow(1.15)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐能量"},
            description: "歌曲提升音乐能量，以及x15半音符。",
            cost: new Decimal("4"),
        },
        14: {
            title: "自动辅助（并非100%人工智能）",
            description: "每秒生成100%的待处理音符，以及+15音符。",
            cost: new Decimal("6"),
        },

        21: {
            title: "重复辅助",
            description: "解锁一个音符可购买项并改进\"音乐体验\"。",
            cost: new Decimal("8"),
            unlocked() {return hasUpgrade(this.layer, 14)}
        },
        22: {
            title: "专辑发布",
            effect() {
                let base = player.s.points.add(1)
                base = new Decimal(1.5).pow(base)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐能量"},
            description: "总歌曲创作数提升半音符。",
            cost: new Decimal("12"),
            unlocked() {return hasUpgrade(this.layer, 14)}
        },
        23: {
            title: "小而强大的提升",
            description: "x125音乐能量和音符。相信我！",
            cost: new Decimal("16"),
            unlocked() {return hasUpgrade(this.layer, 14)}
        },
        24: {
            title: "纯粹整体",
            description: "x1000全音符。顺便改进第5个全音符升级。",
            cost: new Decimal("18"),
            unlocked() {return hasUpgrade(this.layer, 14)}
        },

        31: {
            title: "小游戏提升",
            description: "x15连击和几乎箭头获取，且几乎箭头的效果乘以箭头。",
            cost: new Decimal("210"),
            unlocked() {return hasUpgrade("ddr", 44)}
        },
        32: {
            title: "律动",
            description: "x1e10律动能量获取。",
            cost: new Decimal("215"),
            unlocked() {return hasUpgrade("ddr", 44)}
        },
        33: {
            title: "x1e21（JST参考？？？）",
            description: "x1e21音乐能量和音符。",
            cost: new Decimal("228"),
            unlocked() {return hasUpgrade("ddr", 44)}
        },
        34: {
            title: "难中之难",
            description: "解锁\"挑战\"。",
            cost: new Decimal("238"),
            unlocked() {return hasUpgrade("ddr", 44)}
        },

        41: {
            title: "巨型箭头",
            description: "x1e15箭头。",
            cost: new Decimal("1.75e9"),
            unlocked() {return hasMilestone("ddr", 12)}
        },
        42: {
            title: "巨型可购买项",
            description: "你可以批量购买第二个音符可购买项。",
            cost: new Decimal("1e13"),
            unlocked() {return hasMilestone("ddr", 12)}
        },
        43: {
            title: "巨型自动化",
            description: "自动购买DDR可购买项。",
            cost: new Decimal("2e17"),
            unlocked() {return hasMilestone("ddr", 12)}
        },
        44: {
            title: "巨型解锁",
            description: "解锁<b>节奏光剑</b>。",
            cost: new Decimal("1e20"),
            unlocked() {return hasMilestone("ddr", 12)}
        },
    },

    milestones: {
        1: {
            requirementDescription: "1: 3首歌曲",
            effectDescription: "你开始稍微更享受音乐了。x3全音符和x5半音符，并且你可以批量创作歌曲。",
            done() { return player.s.points.gte(3) },
        },
        2: {
            requirementDescription: "2: 7首歌曲",
            effectDescription: "你为你最喜欢的曲目创建了一个播放列表。重置时保留前12个音符升级，并解锁另一行音符升级。",
            done() { return player.s.points.gte(7) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        3: {
            requirementDescription: "3: 14首歌曲",
            effectDescription: "在歌曲中加入更多声音。重置时保留前4个全音符和半音符升级，以及x500音符。",
            done() { return player.s.points.gte(14) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        4: {
            requirementDescription: "4: 17首歌曲",
            effectDescription: "和Camellia的\"Chimera Dragons\"一样多的歌曲！解锁4个更多全音符升级，^1.1全音符，以及^1.01半音符。",
            done() { return player.s.points.gte(17) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        5: {
            requirementDescription: "5: 22首歌曲",
            effectDescription: "你似乎越来越精通音乐了。+1歌曲，音符可购买项1的缩放为125。",
            done() { return player.s.points.gte(22) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        6: {
            requirementDescription: "6: 44首歌曲",
            effectDescription: "这足够3张完整专辑了！\"感受节奏\"的软上限现在从1e50开始。",
            done() { return player.s.points.gte(44) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        7: {
            requirementDescription: "7: 50首歌曲",
            effectDescription: "你感受到了音乐制作的流动状态。解锁\"停电\"。",
            done() { return player.s.points.gte(50) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        8: {
            requirementDescription: "8: 101首歌曲",
            effectDescription: "去了当地街机厅后，你有了新的灵感。x1e10音符。",
            done() { return player.s.points.gte(101) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        9: {
            requirementDescription: "9: 130首歌曲",
            effectDescription: "你学到了一些非常实用的DAW快捷键。音符可购买项1的效果现在乘以3。",
            done() { return player.s.points.gte(130) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
        10: {
            requirementDescription: "10: 200首歌曲",
            effectDescription: "DDR层的最后一个歌曲里程碑！不过整个层还有很多扩展空间。^1.1箭头，且几乎箭头的效果现在乘以连击获取。",
            done() { return player.s.points.gte(130) },
            unlocked() { return hasMilestone(this.layer, this.id - 1) },
        },
    },

    clickables: {
        11: {
            title: "创作会重置吗？（强制DDR重置）",
            canClick() {return true},
            onClick() {
                doReset("ddr", true)
                player.s.resetting = !player.s.resetting
            },
            unlocked() {return hasUpgrade("ddr", 43)},
        },
    },

    challenges: {
        11: {
            name: "停电",
            challengeDescription: "<i>\"你的笔记本电脑一直运行顺畅，直到电源被切断。幸好你有电池百分比，但它<b>很低。</b>\"</i> <br><br> ^0.5音乐能量。第一个音符可购买项的缩放为x1e10。",
            goalDescription: "拥有1e36个音符。",
            rewardDescription: "解锁劲舞革命。",
            canComplete: function() {return player.n.points.gte("1e36")},
            unlocked() {return hasMilestone("s", 7)},
            style() { return {
                "width": "400px",
                "height": "250px",
            } }
        },
        12: {
            name: "一周停电",
            challengeDescription: "<i>\"笔记本电脑不可避免地死机了。幸好你在它死机前保存了进度……但你要从哪里获得电力呢？\"</i> <br><br> ^0.01音乐能量和音符。歌曲必须重置，且流和电压值必须达到最大值。",
            goalDescription: "拥有1,000个音符。",
            rewardDescription: "x1e15律动能量、音乐能量和音符。+0.5歌曲。",
            canComplete: function() {return player.n.points.gte("1000") && player.s.resetting && player.ddr.voltage.log(1.2).div(-10).gte(1) && player.ddr.stream.log(player.ddr.streamImpact).div(10).gte(1)},
            unlocked() {return hasMilestone("s", 7)},
            style() { return {
                "width": "400px",
                "height": "250px",
            } }
        },
    },

    branches: [["ddr", 1], ["ddrfc", 1]],
    tooltip() {
        if (canReset(this.layer)) return format(player.s.points) + " 首歌曲（重置时+" + format(getResetGain("s")) + "首歌曲）"
        return format(player.s.points) + " 首歌曲（无法重置）"
    },
})