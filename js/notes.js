addLayer("n", {
    name: "n", // 这是可选的，仅在少数地方使用，如果省略则使用层 ID。
    symbol: "♪", // 这显示在层的节点上。默认是 ID 首字母大写
    position: 0, // 行内的水平位置。默认使用层 ID 并按字母顺序排序
    startData() { return {
        unlocked: true,
		points: new Decimal(0),

        whole: new Decimal(0),
        half: new Decimal(0),
        quarter: new Decimal(0),
        eighth: new Decimal(0),

        wholeGain: new Decimal(0),
        halfGain: new Decimal(0),
        quarterGain: new Decimal(0),
        eighthGain: new Decimal(0),

        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e1000"),
        softcap2: new Decimal(0.1),
        softcap2Start: new Decimal("1e20000"),
    }},
    color: "#EEEEEE",
    requires: new Decimal(10), // 可以是一个考虑需求增加的函数
    resource: "音符", // 声望货币名称
    baseResource: "音乐精华", // 声望所基于的资源名称
    baseAmount() {return player.points}, // 获取 baseResource 的当前数量
    type: "normal", // normal: 获得货币的成本取决于获得的量。static: 成本取决于你已经拥有的量
    exponent: 0.5, // 声望货币指数
    gainMult() { // 从加成计算主货币的乘数
        let layer;
        let mult = new Decimal(1)
        //add
        if (hasAchievement("a", 16)) mult = mult.add(100)

        layer = "n"
        if (hasUpgrade(layer, 41)) mult = mult.add(3)

        layer = "s"
        if (hasUpgrade(layer, 14)) mult = mult.add(15)
        //mul
        if (hasAchievement("a", 16)) mult = mult.mul(100)

        layer = "n"
        if (hasUpgrade(layer, 13)) mult = mult.mul(3)
        if (hasUpgrade(layer, 14)) mult = mult.mul(4)
        if (hasUpgrade(layer, 22)) mult = mult.mul(upgradeEffect(this.layer, 22))
        if (hasUpgrade(layer, 31)) mult = mult.mul(10)
        if (hasUpgrade(layer, 33)) mult = mult.mul(upgradeEffect(this.layer, 33))
        if (hasUpgrade(layer, 34)) mult = mult.mul(4)
        if (hasUpgrade(layer, 103)) mult = mult.mul(5)
        if (hasUpgrade(layer, 104)) mult = mult.mul(25)
        if (hasUpgrade(layer, 41)) mult = mult.mul(25)
        if (hasUpgrade(layer, 302)) mult = mult.mul(upgradeEffect(layer, 302))

        mult = mult.mul(buyableEffect(this.layer, 11))

        layer = "s"
        if (hasMilestone(layer, 3)) mult = mult.mul(500)
        if (hasUpgrade(layer, 23)) mult = mult.mul(125)
        if (hasMilestone(layer, 8)) mult = mult.mul("1e10")
        if (hasUpgrade(layer, 33)) mult = mult.mul("1e21")
        if (hasChallenge(layer, 12)) mult = mult.mul("1e15")

        layer = "ddr"
        if (hasUpgrade(layer, 11)) mult = mult.mul(upgradeEffect(layer, 11))
        if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)

        mult = mult.mul(player.ddrm.gEffect)

        if (player.ddrfc.points.gte(2)) mult = mult.mul("1e10")
        if (player.ddrfc.points.gte(3)) mult = mult.mul("1e10")
        if (player.ddrfc.points.gte(4)) mult = mult.mul("1e100")

        //exp 
        layer = "n"
        if (hasUpgrade(this.layer, 201)) mult = mult.pow(1.05)

        layer = "s"

        layer = "ddr"
        if (hasMilestone(layer, 2)) mult = mult.pow(1.1)
        //other hypers
        //time dilations/chals
        layer = "s"
        if (inChallenge(layer, 12)) mult = mult.pow(0.01)
        
        layer = "ddr"
        if (inChallenge(layer, 11)) mult = mult.pow(0.75)
        if (inChallenge(layer, 22)) mult = mult.pow(0.1)
        mult = mult.pow(player.ddr.voltage)
        //softcaps
        //final
        return mult
    }, //在 gainMult() 内完成所有操作
    getResetGain() {
        let layer = "n"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let mult = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (mult.gte(player[layer].softcap1Start)) mult = mult.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))
            
        if (inChallenge("ddr", 32)) mult = mult.add(1).log("1e10")
        mult = mult.mul(buyableEffect("ddr", 33))
    
        if (mult.gte(player[layer].softcap2Start)) mult = mult.pow(player[layer].softcap2).mul(new Decimal(player[layer].softcap2Start).pow(decimalOne.sub(player[layer].softcap2)))

		return mult.floor().max(0);
    },
    row: 0, // 层在树中的行（0 是第一行）
    hotkeys: [
        {key: "N", description: "SHIFT+N: 重置音符", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.n.unlocked},
    passiveGeneration() {if (hasUpgrade("s", 14)) return 1
        else return 0
    },
    doReset(resettingLayer) {
        // 阶段 1，几乎总是需要，使重置此层不会删除你的进度
        if (layers[resettingLayer].row <= this.row) return;

        // 阶段 2，跟踪你想保留的具体子功能，例如升级 11、挑战 32、可购买 12
        let keptUpgrades = []
        if (hasMilestone("s", 2)) keptUpgrades.push(11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34)
        if (hasMilestone("s", 3)) keptUpgrades.push(101, 102, 103, 104, 201, 202, 203, 204)

        if (hasUpgrade("n", 301)) keptUpgrades.push(301)
        if (hasUpgrade("n", 302)) keptUpgrades.push(302)
        if (hasUpgrade("n", 303)) keptUpgrades.push(303)
        if (hasUpgrade("n", 304)) keptUpgrades.push(304)

        if (hasUpgrade("ddr", 42)) keptUpgrades.push(41, 42, 43, 44, 111, 112, 113, 114)

        if (hasUpgrade("n", 214)) keptUpgrades.push(211, 212, 213, 214)

        if (hasUpgrade("n", 311)) keptUpgrades.push(311)
        if (hasUpgrade("n", 312)) keptUpgrades.push(312)
        if (hasUpgrade("n", 313)) keptUpgrades.push(313)
        if (hasUpgrade("n", 314)) keptUpgrades.push(314)
            
        if (resettingLayer == "bs") keptUpgrades = []

        let keptBuyables = []

        // 阶段 3，跟踪你想保留的主要功能 - 所有升级、总点数、特定开关等。
        let keep = [];

        // 阶段 4，执行实际的数据重置
        layerDataReset(this.layer, keep);

        // 阶段 5，添加回你之前保存的具体子功能
        player[this.layer].upgrades.push(...keptUpgrades)
    }, //感谢 TMT 服务器的逃逸者

    tabFormat: {
        "n": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.points)} 音乐精华。`}],
                "blank",
                ["upgrades", [1, 2, 3, 4]],
                ["blank", "25px"],
                ["display-text", function(){if (hasUpgrade("n", 34) || hasUpgrade("ddr", 14)) return `你有 <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.whole)}</h2> 全音符 <br> (${format(player.n.wholeGain)}/秒)`; else return}],
                ["display-text", function(){if (hasUpgrade("n", 34) || hasUpgrade("ddr", 14)) return `<span style="color:#BBBBBB">在 1e12 音符时开始获得全音符！`; else return}],
                ["display-text", function(){if (player.n.whole.gte("1e500")) return `<span style="color:#AAAAAA">全音符获得在 1e500 后被 ^0.25 软上限！`; else return}],
                "blank",
                ["upgrades", [10, 11]],
                ["blank", function() {if (hasUpgrade("s", 12) || hasUpgrade("ddr", 14)) return ["1px", "30px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (hasUpgrade("s", 12) || hasUpgrade("ddr", 14)) return `你有 <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.half)}</h2> 二分音符 <br> (${format(player.n.halfGain)}/秒)`; else return}],
                ["display-text", function(){if (hasUpgrade("s", 12) || hasUpgrade("ddr", 14)) return `<span style="color:#BBBBBB">在 1e18 音符时开始获得二分音符！`; else return}],
                ["display-text", function(){if (player.n.half.gte("1e500")) return `<span style="color:#AAAAAA">二分音符获得在 1e500 后被 ^0.25 软上限！`; else return}],
                "blank",
                ["upgrades", [20, 21]],
                ["blank", function() {if (hasUpgrade("ddr", 32)) return ["1px", "30px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (hasUpgrade("ddr", 32)) return `你有 <h2 style="color: #EEEEEE; text-shadow: 0px 0px 10px #EEEEEE">${format(player.n.quarter)}</h2> 四分音符 <br> (${format(player.n.quarterGain)}/秒)`; else return}],
                ["display-text", function(){
                    let et = ""
                    if (hasMilestone("ddr", 6)) et = "不再"
                    if (hasUpgrade("ddr", 32)) return `<span style="color:#BBBBBB">在 1e450 音符时开始获得四分音符 - 获得${et}对数。`; else return
                }],
                "blank",
                ["upgrades", [30, 31]],
            ],
        },
        "n": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.points)} 音乐精华。`}],
                "blank",
                "buyables",
            ],
            unlocked() {return hasUpgrade("s", 21) || hasUpgrade("ddr", 13)},
        },
    },

    upgrades: {
        11: {
            title: "简单攀登",
            description: "x3 音乐精华。",
            cost: new Decimal("1"),
            unlocked() {return true},
        },
        12: {
            title: "感受节奏",
            effect() {
                let base = player.n.points.add(1)
                base = base.pow(0.25)
                if (hasUpgrade(this.layer, 24)) base = base.mul(3)
                if (hasUpgrade(this.layer, 24)) base = base.pow(1.25)

                let softcap = new Decimal(0.25)
                let softcapStart = new Decimal("1e25")
                if (hasMilestone("s", 6)) softcapStart = softcapStart.mul("1e25")
                if (hasUpgrade(this.layer, 213)) softcapStart = softcapStart.mul(upgradeEffect(this.layer, 213))

                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap
                return base
            },
            effectDisplay() {
                let text =  "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐精华"
                return text
            },
            description: "音符提升音乐精华。",
            cost: new Decimal("3"),
            unlocked() {return true},
        },
        13: {
            title: "反馈循环",
            description: "x3 音符。",
            cost: new Decimal("5"),
            unlocked() {return true},
        },
        14: {
            title: "4K 设置",
            description: "x4 音符和音乐精华。",
            cost: new Decimal("20"),
            unlocked() {return true},
        },

        21: {
            title: "第 2 行！",
            description: "x3！音乐精华。",
            cost: new Decimal("300"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14)},
        },
        22: {
            title: "更多动态加成",
            effect() {
                let base = player.points.add(1)
                base = base.pow(0.15)
                if (hasUpgrade(this.layer, 24)) base = base.mul(2)
                if (hasUpgrade(this.layer, 32)) base = base.mul(15)

                if (hasUpgrade(this.layer, 24)) base = base.pow(1.25)
                if (hasUpgrade("ddr", 14)) base = base.pow(1.5).mul("1e10")

                let softcap = new Decimal(0.25)
                let softcapStart = new Decimal("1e100")
                if (base.gte(softcapStart)) base = base.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

                return base
            },
            effectDisplay() {
                let text = "x" + format(upgradeEffect(this.layer, this.id)) + " 音符"
                return text
            },
            description: "音乐精华提升音符。",
            cost: new Decimal("1000"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14)},
        },
        23: {
            title: "基础操控",
            description: "+6 音乐精华基础。",
            cost: new Decimal("4000"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14)},
        },
        24: {
            title: "改进",
            description: "改进\"感受节奏\"和\"更多动态加成\"。",
            cost: new Decimal("15000"),
            unlocked() {return hasUpgrade(this.layer, 14) || hasUpgrade("ddr", 14)},
        },

        31: {
            title: "高级音高训练",
            description: "x10 音符。哇！",
            cost: new Decimal("1e5"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14)},
        },
        32: {
            title: "音阶精通",
            description: "x15 到\"更多动态加成\"效果。",
            cost: new Decimal("3e6"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14)},
        },
        33: {
            title: "乐谱发现",
            effect() {
                let base = player.n.points.add(1)
                let lb = new Decimal(1.4)
                if (hasUpgrade(this.layer, 103)) lb = new Decimal(1.05)

                base = base.log(lb).add(2).div(2)

                if (hasUpgrade("ddr", 33)) base = base.pow(upgradeEffect("ddr", 33))
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音符"},
            description: "音符提升自身。",
            cost: new Decimal("2e8"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14)},
        },
        34: {
            title: "4 拍",
            description: "解锁全音符和 x4 音乐精华和音符。",
            cost: new Decimal("1e10"),
            unlocked() {return hasUpgrade(this.layer, 24) || hasUpgrade("ddr", 14)},
        },

        41: {
            title: "DAW 琶音器",
            description: "x25 音符、全音符和二分音符",
            cost: new Decimal("1e40"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14)},
        },
        42: {
            title: "节奏专家",
            description: "x1000 音乐精华和 x1.25 歌曲！",
            cost: new Decimal("1e48"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14)},
        },
        43: {
            title: "没那么好",
            effect() {
                let base = player.n.half.add(1)
                let lb = new Decimal(1.75)
                base = base.log(lb).pow(1.5).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐精华"},
            description: "二分音符提升音乐精华。",
            cost: new Decimal("1e60"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14)},
        },
        44: {
            title: "完整方形时间墙",
            description: "相信我，等待是值得的！x2500 音乐精华和 x500 全音符。",
            cost: new Decimal("1e80"),
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 14)},
        },



        101: {
            title: "稳扎稳打",
            description: "+3 音乐精华和音符。",
            cost: new Decimal("5"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14)},
        },
        102: {
            title: "整体 > 部分",
            effect() {
                let base = player.n.whole.add(1)
                base = base.pow(0.5)
                if (hasUpgrade(this.layer, 304)) base = base.mul("1e25").pow(1.005)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐精华"},
            description: "全音符提升音乐精华。",
            cost: new Decimal("60"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14)},
        },
        103: {
            title: "三重效果",
            description: "改进\"乐谱发现\"，+10 音乐精华，和 x5 音符！",
            cost: new Decimal("250"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14)},
        },
        104: {
            title: "大乘数",
            description: "x25 音符！下一层在 1e20 音符。",
            cost: new Decimal("1e4"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasUpgrade(this.layer, 34) || hasUpgrade("ddr", 14)},
        },
        111: {
            title: "Googol 的可购买",
            effect() {
                let base = player.n.whole.add(1)
                base = base.pow(0.05).mul(1.5)
                if (hasUpgrade("s", 24)) base = base.mul(4).pow(1.1)
                
                return base
            },
            effectDisplay() {return `<span style="font-size:10px">÷${format(upgradeEffect(this.layer, this.id))} 到成本</span>`},
            description: `<span style="font-size:10px">全音符降低第一个音符可购买的成本。</span>`,
            cost: new Decimal("1e100"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14)},
        },
        112: {
            title: "更大的乘数",
            description: "x20,000 音乐精华和 x1.1 歌曲。",
            cost: new Decimal("1e110"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14)},
        },
        113: {
            title: "音乐精通",
            description: "改进\"作曲\"和\"音乐体验\"。",
            cost: new Decimal("1e120"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14)},
        },
        114: {
            title: "奇特节奏",
            effect() {
                let base = player.points.add(1)
                base = base.log(1.25).add(1)
    
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 全音符和二分音符"},
            description: "音乐精华提升全音符和二分音符。",
            cost: new Decimal("1e130"),
            currencyDisplayName: "全音符",
            currencyInternalName: "whole",
            currencyLayer: "n",
            unlocked() {return hasMilestone("s", 4) || hasUpgrade("ddr", 14)},
        },

        201: {
            title: "指数时间！",
            description: "^1.05 音乐精华和音符。",
            cost: new Decimal("1000"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14)},
        },
        202: {
            title: "音乐多重",
            description: "x500 音乐精华。",
            cost: new Decimal("5e6"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14)},
        },
        203: {
            title: "全音符扩展",
            effect() {
                let base = player.n.whole.add(1)
                base = base.pow(0.01)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 二分音符"},
            description: "全音符提升二分音符。",
            cost: new Decimal("1e10"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14)},
        },
        204: {
            title: "高效工作区",
            description: "x1.5 歌曲。",
            cost: new Decimal("1e18"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("s", 12) || hasUpgrade("ddr", 14)},
        },
        211: {
            title: "合作！",
            description: "x1.2 歌曲。",
            cost: new Decimal("1e512"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21)},
        },
        212: {
            title: "音乐锁定",
            description: "最高连击的效果得到改进。",
            cost: new Decimal("1e540"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21)},
        },
        213: {
            title: "延迟减少",
            effect() {
                let base = player.n.half.add(1)
                base = base.pow(0.05)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 到软上限开始"},
            description: "二分音符延迟\"感受节奏\"的软上限。",
            cost: new Decimal("1e570"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 21)},
        },
        214: {
            title: "舞蹈硬核",
            description: "解锁\"专家\"并保留此行。",
            cost: new Decimal("1e590"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 21)},
        },
    
        301: {
            title: "你能数到 4 吗？",
            description: "x4 所有箭头获得和连击获得。",
            cost: new Decimal("75"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32)},
        },
        302: {
            title: "4/4 拍号",
            effect() {
                let base = player.n.quarter.add(1)
                base = base.log(1.001).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐精华和音符"},
            description: "四分音符提升音乐精华和音符。",
            cost: new Decimal("1250"),
            currencyDisplayName: "二分音符",
            currencyInternalName: "half",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32)},
        },
        303: {
            title: "三重货币加成",
            description: "x10 四分音符、连击获得和箭头。保持\"停电\"完成。",
            cost: new Decimal("5000"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32)},
        },
        304: {
            title: "简单的欢乐颂",
            description: "旋律时尚！改进\"整体 > 部分\"和 ^1.15 音乐精华。",
            cost: new Decimal("250000"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasUpgrade("ddr", 32)},
        },
        311: {
            title: "律动能量",
            description: "将律动能量的阈值降低到 1e300。",
            cost: new Decimal("1e7"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31)},
        },
        312: {
            title: "DDR 街机折扣",
            description: "改进\"⇧ ÷ → ♪ 💵\"。",
            cost: new Decimal("75e6"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31)},
        },
        313: {
            title: "更快的生产",
            effect() {
                let base = player.n.quarter.add(1)
                base = base.pow(0.01)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id)) + " 歌曲"},
            description: "四分音符提升歌曲。",
            cost: new Decimal("1e10"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31)},
        },
        314: {
            title: "攻击！！完美全连！",
            description: "解锁\"全连\"。",
            cost: new Decimal("1e13"),
            currencyDisplayName: "四分音符",
            currencyInternalName: "quarter",
            currencyLayer: "n",
            unlocked() {return hasChallenge("ddr", 31)},
        },
    },

    buyables: {
        11: {
            base() {return new Decimal("1e20")},
            exponentialBase() {
                let init = new Decimal("200")
                if (hasMilestone("s", 5)) init = init.sub(75)
                if (inChallenge("s", 11)) init = new Decimal("1e10")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                if (hasUpgrade(this.layer, 111)) final = final.div(upgradeEffect(this.layer, 111))
                if (hasUpgrade("ddr", 23)) final = final.div(upgradeEffect("ddr", 23))
                if (hasChallenge("ddr", 22)) final = final.div("1e25")
                final = final.div(buyableEffect("ddr", 31))
                return final //如果你在成本公式中添加任何内容，请确保更新 buymax()！
            },
            title: "持续生产",
            display() {
                let base = new Decimal(2)
                if (hasMilestone("s", 9)) base = base.add(1)
                return "每次购买将音符乘以 " + base + "。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (hasUpgrade("ddr", 13)){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effect(x) {
                let base = new Decimal(2)
                if (hasMilestone("s", 9)) base = base.add(1)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("s", 2) || hasUpgrade("ddr", 13)},
            buyMax() {
                let timesBought = player.n.points
                timesBought = timesBought.mul(upgradeEffect(this.layer, 111))
                timesBought = timesBought.mul(upgradeEffect("ddr", 23))
                if (hasChallenge("ddr", 22)) timesBought = timesBought.mul("1e25")
                timesBought = timesBought.mul(buyableEffect("ddr", 31))

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(new Decimal.pow("10", "20"))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = new Decimal.pow("10", "20")
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                totalCost = totalCost.div(upgradeEffect(this.layer, 111))
                totalCost = totalCost.div(upgradeEffect("ddr", 23))
                if (hasChallenge("ddr", 22)) totalCost = totalCost.div("1e25")
                totalCost = totalCost.div(buyableEffect("ddr", 31))

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },

        12: {
            base() {return new Decimal("1e500")},
            exponentialBase() {
                let init = new Decimal("1e50")
                if (hasMilestone("ddr", 11)) init = new Decimal("1e20")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新 buymax()！
            },
            title: "连击乘数",
            display() {
                return "每次购买 x1.5 连击获得。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (hasUpgrade("s", 42)){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            effect(x) {
                let base = new Decimal(1.5)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("ddr", 1)},
            buyMax() {
                let timesBought = player.n.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(new Decimal.pow("10", "500"))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = new Decimal.pow("10", "500")
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
    },

    update(diff){
        //全音符
        if ((hasUpgrade("n", 34) || hasUpgrade("ddr", 14)) && player.n.points.gte("1e12")){
            let mult = player.n.points.div("1e12")
            if (hasMilestone("s", 1)) mult = mult.mul(3)
            if (hasUpgrade(this.layer, 41)) mult = mult.mul(25)
            if (hasUpgrade(this.layer, 44)) mult = mult.mul(500)
            if (hasUpgrade("s", 24)) mult = mult.mul(1000)
            if (hasUpgrade(this.layer, 114)) mult = mult.mul(upgradeEffect(this.layer, 114))

            if (hasMilestone("s", 4)) mult = mult.pow(1.1)
                
            if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.wholeGain = mult
            player.n.whole = player.n.whole.add(player.n.wholeGain.mul(diff))
        }

        //二分音符
        if ((hasUpgrade("s", 12) || hasUpgrade("ddr", 14)) && player.n.points.gte("1e18")){
            let mult = player.n.points.div("1e18")
            if (hasUpgrade(this.layer, 203)) mult = mult.mul(upgradeEffect(this.layer, 203))
            if (hasMilestone("s", 1)) mult = mult.mul(5)
            if (hasUpgrade("s", 13)) mult = mult.mul(15)
            if (hasUpgrade(this.layer, 41)) mult = mult.mul(25)
            if (hasUpgrade("s", 22)) mult = mult.mul(upgradeEffect("s", 22))
            if (hasUpgrade(this.layer, 114)) mult = mult.mul(upgradeEffect(this.layer, 114))
            if (hasUpgrade("ddr", 42)) mult = mult.mul("1e10")

            if (hasMilestone("s", 4)) mult = mult.pow(1.01)
                
            if (player.ddr.groovePower) mult = mult.mul(player.ddr.gpe)

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.halfGain = mult
            player.n.half = player.n.half.add(player.n.halfGain.mul(diff))
        }

        //1/4 音符
        if ((hasUpgrade("ddr", 32)) && player.n.points.gte("1e450")){
            let mult = player.n.points.div("1e450")
            let qnlb = new Decimal(10)
            if (hasChallenge("ddr", 31)) qnlb = qnlb.sub(8)

            if (hasMilestone("ddr", 6)) mult = mult.pow(0.01)
            else mult = mult.add(1).log(qnlb).add(1)

            if (hasUpgrade("n", 303)) mult = mult.mul(10)
            if (hasChallenge("ddr", 22)) mult = mult.mul(5)
            if (hasMilestone("ddr", 4)) mult = mult.mul(15)
  
            if (hasMilestone("ddr", 2)) mult = mult.pow(1.25)

            let softcap = new Decimal(0.25)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap))) //softcap

            player.n.quarterGain = mult
            player.n.quarter = player.n.quarter.add(player.n.quarterGain.mul(diff))
        }
    },

    glowColor() {
        let layer = "n"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [11, 12]) {
            if (canBuyBuyable(layer, id) && tmp[layer].buyables[id].unlocked) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "n"
        for (const id of [11, 12]) {
            if (canBuyBuyable(layer, id) && hasUpgrade("s", 21) && tmp[layer].buyables[id].unlocked) {
                return true
            }
        }
        return false
    },
    automate() {
        let layer = "n"
        if (canBuyBuyable(layer, 11) && hasChallenge("ddr", 21) && tmp[layer].buyables[11].unlocked) tmp[layer].buyables[11].buy()
        if (canBuyBuyable(layer, 12) && hasMilestone("ddr", 12) && tmp[layer].buyables[12].unlocked) tmp[layer].buyables[12].buy()
    },

    branches: [["s", 1]],
    tooltip() {
        let text = format(player.n.points) + " 音符 (+" + format(getResetGain("n")) + " 重置时音符)"
        if (player.n.points.gte(player.n.softcap2Start)) text += "<br>[第二软上限 - 1e20000]"
        else if (player.n.points.gte(player.n.softcap1Start)) text += "<br>[第一软上限 - 1e1000]"
        return text
    },
})