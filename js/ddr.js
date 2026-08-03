addLayer("ddr", {
    name: "ddr", // 可选，仅在少数地方使用，如果省略则使用层ID
    symbol: "⇅", // 显示在层节点上。默认为ID首字母大写
    position: 0, // 行内水平位置。默认按层ID字母顺序排序
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        
        groovePower: new Decimal(0),
        gpg: new Decimal(1),
        gpe: new Decimal(1),

        stream: new Decimal(1),
        voltage: new Decimal(1),
        air: new Decimal(1),
        freeze: new Decimal(1),
        chaos: new Decimal(1),

        streamImpact: new Decimal(20),
        gpThreshold: new Decimal("1e350"),
        
        softcap1: new Decimal(0.25),
        softcap1Start: new Decimal("1e300"), //普通层的默认值
    }},
	color: "#2280C2",

	nodeStyle() {
		const style = {};
		style.background = "linear-gradient( #C70078, #2280C2)";
		return style;
	},
    requires: new Decimal(50), // 可以是考虑需求增长的函数
    resource: "箭头", // 声望货币名称
    baseResource: "歌曲", // 声望所基于的资源名称
    baseAmount() {return player.s.points}, // 获取基础资源的当前数量
    type: "normal", // normal: 获得货币的成本取决于已获得数量。static: 成本取决于你已拥有的数量
    exponent: 5, // 声望货币指数
    gainMult() { // 计算主要货币的加成倍数
        let layer;
        let mult = new Decimal(1)
        //add
        //mul
        layer = "n"
        if (hasUpgrade(layer, 303)) mult = mult.mul(10)

        layer = "s"
        if (hasUpgrade(layer, 31)) mult = mult.mul(player.ddrm.aEffect)
        if (hasUpgrade(layer, 41)) mult = mult.mul("1e15")

        layer = "ddr"
        if (hasUpgrade(layer, 22)) mult = mult.mul(2)
        if (hasChallenge(layer, 12)) mult = mult.mul(5)
        if (hasUpgrade(layer, 31)) mult = mult.mul(5)
        if (hasMilestone(layer, 9)) mult = mult.mul("1e6")
        if (hasMilestone(layer, 13)) mult = mult.mul("1e10")

        mult = mult.mul(buyableEffect(layer, 11))

        layer = "bs"
        if (hasUpgrade(layer, 11)) mult = mult.mul(100)
        //exp
        layer = "s"
        if (hasMilestone(layer, 10)) mult = mult.pow(1.25)
        //其他超层
        //时间膨胀/挑战
        //最终
        return mult
    }, //在gainMult()内完成所有操作
    getResetGain() {
        let layer = "ddr"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let mult = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)

        if (mult.gte(player[layer].softcap1Start)) mult = mult.pow(player[layer].softcap1).mul(new Decimal(player[layer].softcap1Start).pow(decimalOne.sub(player[layer].softcap1)))

		return mult.floor().max(0);
    },
    row: 2, // 层在树中的行（0是第一行）
    hotkeys: [
        {key: "A", description: "SHIFT+A: 重置以获得箭头", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasChallenge("s", 11)) player.ddr.unlocked = true
        return player.ddr.unlocked
    },
    canReset(){return hasChallenge("s", 11)},
    
    passiveGeneration() {return false},
    doReset(resettingLayer) {
        // 阶段1，几乎总是需要，使重置此层不会删除你的进度
        if (layers[resettingLayer].row <= this.row) return;

        // 阶段2，跟踪你想保留的特定子功能，例如升级11、挑战32、可购买12
        let keptUpgrades = []

        let keptBuyables = []

        // 阶段3，跟踪你想保留的主要功能 - 所有升级、总点数、特定开关等。
        let keep = [];

        // 阶段4，执行实际的数据重置
        layerDataReset(this.layer, keep);

        // 阶段5，添加回你之前保存的特定子功能
    }, //感谢TMT服务器的逃逸者
    upgrades: {
        11: {
            title: "⇧ x → ♪ & 🎧",
            effect() {
                let base = player.ddr.total.add(2)
                base = base.log(1.01).add(1).mul(base.pow(1.5)).pow(1.25)
                return base
            },
            effectDisplay() {
                let text =  "x" + format(upgradeEffect(this.layer, this.id)) + " 音乐精华和音符"
                return text
            },
            description: "总箭头数提升音乐精华和音符。",
            cost: new Decimal("1"),
        },
        12: {
            title: "多重判定",
            description: "x2 完美和几乎箭头，并且你总是可以批量创作歌曲。",
            cost: new Decimal("2"),
        },
        13: {
            title: "更多力量 = 提升技能",
            description: "你可以购买第一个音符可购买项的最大数量并保持解锁。x1,000,000 音乐精华！",
            cost: new Decimal("5"),
        },
        14: {
            title: "更多舞蹈时间",
            description: "x25,000 音乐精华和音符，并保持所有音符、白音符和半音符升级到此点解锁。改进\"更多动态加成\"。",
            cost: new Decimal("10"),
        },
        21: {
            title: "舞步等级介绍",
            description: "解锁\"入门\"。",
            cost: new Decimal("25"),
            unlocked() {return hasUpgrade(this.layer, 14)},
        },
        22: {
            title: "不可阻挡的舞蹈",
            description: "保留前8个歌曲升级和前4个歌曲里程碑。x2 箭头。",
            cost: new Decimal("100"),
            unlocked() {return hasUpgrade(this.layer, 14)},
        },
        23: {
            title: "⇧ ÷ → ♪ 💵",
            effect() {
                let base = player.ddr.points.add(1)
                base = base.pow(5)
                if (hasUpgrade("n", 312)) base = base.pow(base.log("1e6"))
                return base
            },
            effectDisplay() {
                let text = "÷" + format(upgradeEffect(this.layer, this.id)) + " 到成本"
                return text
            },
            description: "箭头除以音符可购买项1的成本，保留总歌曲数，并x1e15 音乐精华。",
            cost: new Decimal("300"),
            unlocked() {return hasUpgrade(this.layer, 14)},
        },
        24: {
            title: "谱面挑战",
            description: "解锁\"基础\"。",
            cost: new Decimal("750"),
            unlocked() {return hasUpgrade(this.layer, 14)},
        },
        31: {
            title: "更好的机器",
            description: "漏掉一个音符现在减少连击50（保持在零以上），几乎箭头现在增加连击，完美箭头增加x3倍。x5 箭头。",
            cost: new Decimal("3000"),
            unlocked() {return hasUpgrade(this.layer, 24)},
        },
        32: {
            title: "1 2 3 4",
            description: "解锁四分音符（在音符页签中）。",
            cost: new Decimal("15000"),
            unlocked() {return hasUpgrade(this.layer, 24)},
        },
        33: {
            title: "⇧ x → 🎼 💪",
            effect() {
                let base = player.ddr.points.add(1)
                base = base.log(1.5).div(35).add(1)
                return base
            },
            effectDisplay() {
                let text = "^" + format(upgradeEffect(this.layer, this.id)) + " 到效果"
                return text
            },
            description: "\"乐谱发现\"的效果以降低的速率提升到箭头。",
            cost: new Decimal("40000"),
            unlocked() {return hasUpgrade(this.layer, 14)},
        },
        34: {
            title: "需要练习",
            description: "解锁\"困难\"。",
            cost: new Decimal("250000"),
            unlocked() {return hasUpgrade(this.layer, 24)},
        },
        41: {
            title: "玩法多样性介绍",
            description: "解锁律动雷达。",
            cost: new Decimal("8e5"),
            unlocked() {return hasUpgrade(this.layer, 34)},
        },
        42: {
            title: "小质量改进",
            description: "保留第4行音符升级和第2行白音符升级，x1e10 半音符",
            cost: new Decimal("3.5e6"),
            unlocked() {return hasUpgrade(this.layer, 34)},
        },
        43: {
            title: "保留生产",
            description: "创作歌曲不再重置任何内容。x1e20 音乐精华。",
            cost: new Decimal("12.5e6"),
            unlocked() {return hasUpgrade(this.layer, 34)},
        },
        44: {
            title: "自动生产",
            description: "你可以自动创作歌曲。解锁第三行歌曲升级。",
            cost: new Decimal("30e6"),
            unlocked() {return hasUpgrade(this.layer, 34)},
        },
    },

    milestones: {
        1: {
            requirementDescription: "1: 1e25 律动能量",
            effectDescription: "其他人对你的舞技印象深刻。x1.05 歌曲并解锁另一个音符可购买项。",
            done() { return player.ddr.groovePower.gte("1e25") },
        },
        2: {
            requirementDescription: "2: 1e28 律动能量",
            effectDescription: "有些人出于尊重而捐款。流的效果降低为每级÷10，并改进律动能量的效果。^1.1 音乐精华和音符，以及^1.25 四分音符。",
            done() { return player.ddr.groovePower.gte("1e28") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        3: {
            requirementDescription: "3: 1e35 律动能量",
            effectDescription: "一场严重的雷暴破坏了当地的变压器。解锁\"一周停电\"（在歌曲层）。",
            done() { return player.ddr.groovePower.gte("1e35") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        4: {
            requirementDescription: "4: 1e50 律动能量",
            effectDescription: "一周后，电力恢复正常。解锁一个DDR可购买项，并且你被动生成从DDR小游戏中获得的完美箭头的1%。",
            done() { return player.ddr.groovePower.gte("1e50") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        5: {
            requirementDescription: "5: 1e63 律动能量",
            effectDescription: "你开始喜欢DDR。x15 优秀箭头和四分音符。",
            done() { return player.ddr.groovePower.gte("1e63") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        6: {
            requirementDescription: "6: 1e68 律动能量",
            effectDescription: "你从DDR中获得更多音乐灵感！四分音符的公式现在使用指数而不是对数。",
            done() { return player.ddr.groovePower.gte("1e68") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        7: {
            requirementDescription: "7: 1e77 律动能量",
            effectDescription: "你在舞池上挑战一些朋友。轻松的战斗。最高连击的效果得到改进，并生成从小游戏中获得的优秀箭头的1%。",
            done() { return player.ddr.groovePower.gte("1e77") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        8: {
            requirementDescription: "8: 1e82 律动能量",
            effectDescription: "现在你想通过使用两个游戏区域来向朋友炫耀。生成你获得的几乎箭头的1%并解锁\"双人\"。",
            done() { return player.ddr.groovePower.gte("1e82") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        9: {
            requirementDescription: "9: 1e95 律动能量",
            effectDescription: "你在DDR上变得<i>有点太好了</i>。x1,000,000 箭头。",
            done() { return player.ddr.groovePower.gte("1e95") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        10: {
            requirementDescription: "10: 1e150 律动能量",
            effectDescription: "你已经完全满级了你的律动雷达。大幅改进HC和M箭头的效果。",
            done() { return player.ddr.groovePower.gte("1e150") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        11: {
            requirementDescription: "11: 1e160 律动能量",
            effectDescription: "你开始在挑战地图上获得完美全连。音符可购买项2的缩放现在是x1e20和x1e100 音符。改进几乎箭头的效果。",
            done() { return player.ddr.groovePower.gte("1e160") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        12: {
            requirementDescription: "12: 1e290 律动能量",
            effectDescription: "DDR世界 100% 速通。自动购买第二个音符可购买项并解锁第4行歌曲升级。",
            done() { return player.ddr.groovePower.gte("1e290") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
        13: {
            requirementDescription: "12: 1e500 律动能量",
            effectDescription: "x1e10 箭头。几乎箭头的效果再次改进。",
            done() { return player.ddr.groovePower.gte("1e500") },
            unlocked() { return hasMilestone(this.layer, this.id - 1)},
        },
    },

    buyables: {
        11: {
            base() {return new Decimal("1e6")},
            exponentialBase() {
                let init = new Decimal("5")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "热舞革命",
            display() {
                return "1998年的原版！这个版本发布时我还没出生。每次购买x2 箭头。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("ddr", 4)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        12: {
            base() {return new Decimal("1e10")},
            exponentialBase() {
                let init = new Decimal("8")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR MAX",
            display() {
                return "冻结箭头的引入。我对这些箭头既不能说好也不能说坏。每次购买x125 律动能量。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal(125)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 11).gte(10)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        13: {
            base() {return new Decimal("1e6")},
            exponentialBase() {
                let init = new Decimal("10")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR EXTREME",
            display() {
                return "欢迎来到\"完美\"判定时代。我个人喜欢比\"完美\"更好的东西的想法。每次购买x1.05 歌曲。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal(1.05)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 12).gte(4)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        21: {
            base() {return new Decimal("1e10")},
            exponentialBase() {
                let init = new Decimal("20")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR SuperNOVA",
            display() {
                return "你现在可以使用e-AMUSEMENT！我不用这个功能，因为我是一个休闲玩家。每次购买x1e10 音乐精华。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal("1e10")
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 13).gte(10)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        22: {
            base() {return new Decimal("1e55")},
            exponentialBase() {
                let init = new Decimal("1e5")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "机器增强器",
            display() {
                return "每次购买为所有DDR可购买项（不包括此项）+5免费等级！" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "/" + tmp[this.layer].buyables[this.id].purchaseLimit + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: +" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
                    let cost = tmp[this.layer].buyables[this.id].buyMax()[0]
                    let amount = tmp[this.layer].buyables[this.id].buyMax()[1]
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
                } else {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }

                addBuyables(this.layer, 11, new Decimal(5))
                addBuyables(this.layer, 12, new Decimal(5))
                addBuyables(this.layer, 13, new Decimal(5))
                addBuyables(this.layer, 21, new Decimal(5))
                addBuyables(this.layer, 23, new Decimal(5))
                addBuyables(this.layer, 31, new Decimal(5))
                addBuyables(this.layer, 32, new Decimal(5))
                addBuyables(this.layer, 33, new Decimal(5))
            },
            effect(x) {
                let base = new Decimal(5)
                let effect = base.mul(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 33).gte(5)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
            purchaseLimit() {return new Decimal(10)}
        },
        23: {
            base() {return new Decimal("1e12")},
            exponentialBase() {
                let init = new Decimal("50")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR X",
            display() {
                return "难度等级已从10扩展到20。不过我一直卡在7-8左右。每次购买^1.05 到律动能量和最高连击效果。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: ^" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal(1.05)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 11).gte(20)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        31: {
            base() {return new Decimal("1e40")},
            exponentialBase() {
                let init = new Decimal("100")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR 2013",
            display() {
                return "这个机台的设计更吸引人。我喜欢这个设计。每次购买÷1e250 到第一个音符可购买项的成本。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: ÷" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal("1e250")
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 23).gte(20)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        32: {
            base() {return new Decimal("1e35")},
            exponentialBase() {
                let init = new Decimal("250")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR A",
            display() {
                return "我们有了修订的评分和等级制度，太棒了——这是我街机厅的机台。每次购买x50 连击增益。" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal("50")
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 31).gte(5)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
                totalCost = totalCost.mul(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))

                //在此插入成本效果

                let polynomial = new Decimal(tmp[this.layer].buyables[this.id].exponentialBase)
                polynomial = polynomial.pow(timesBought).sub(1)
                polynomial = polynomial.div(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                totalCost = totalCost.mul(polynomial)
                return [totalCost, timesBought]
            },
        },
        33: {
            base() {return new Decimal("1e45")},
            exponentialBase() {
                let init = new Decimal("1000")
                return init
            },
            cost(x) {
                let base = tmp[this.layer].buyables[this.id].base
                let expbase = tmp[this.layer].buyables[this.id].exponentialBase
                let multi = new Decimal(expbase).pow(x)

                let final = base.mul(multi)
                return final //如果你在成本公式中添加任何内容，请确保更新buymax()！
            },
            title: "DDR WORLD",
            display() {
                return "律动雷达安息吧 :( 我们会怀念你的。这是我从未体验过的当前版本！每次购买在软上限后x1e50 音符！" + "\n" + "已购买: " + getBuyableAmount(this.layer, this.id) + "\n" + "成本: " + format(this.cost()) + "\n" + "效果: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (player.ddrfc.points.gte(5)){
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
                let base = new Decimal("1e50")
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return getBuyableAmount("ddr", 32).gte(10)},
            buyMax() {
                let timesBought = player.ddr.points
                //在此插入成本效果

                timesBought = timesBought.mul(tmp[this.layer].buyables[this.id].exponentialBase.sub(1))
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].base)
                timesBought = timesBought.div(tmp[this.layer].buyables[this.id].exponentialBase.pow(getBuyableAmount(this.layer, this.id)))
                timesBought = timesBought.add(1).log(tmp[this.layer].buyables[this.id].exponentialBase)
                timesBought = timesBought.floor()

                let totalCost = tmp[this.layer].buyables[this.id].base
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

    challenges: { //\"感受节奏\"和\"更多动态加成\"的软上限从1,000,000开始。
        11: {
            name: "入门",
            challengeDescription: "<i>\"此难度面向<b>新手。</b>这是舞池上的完美首次测试。\"</i> <br><br> ^0.75 音乐精华和音符。音乐精华乘以连击增益。此挑战在进入和退出时重置你的连击。",
            goalDescription: "拥有至少20的连击。",
            rewardDescription: "x3 完美和优秀箭头，x1.25 歌曲，x2.5 连击增益，以及x1e10 音乐精华！",
            canComplete: function() {return player.ddrm.combo.gte(20)},
            unlocked() {return hasUpgrade(this.layer, 21)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#21C1CC",
                }
            },
            onEnter() {player.ddrm.combo = new Decimal(0)},
            onExit() {player.ddrm.combo = new Decimal(0)},
        },
        12: {
            name: "基础",
            challengeDescription: "<i>\"此难度面向<b>更熟悉</b>的玩家。让我们把难度提高一点。\"</i> <br><br> 歌曲的成本<i>略微提高</i>。音乐精华更强烈地乘以连击增益。此挑战在进入和退出时重置你的连击。",
            goalDescription: "拥有至少35的连击。",
            rewardDescription: "改进完美、优秀和几乎箭头效果，以及x5 到它们的所有增益和箭头。",
            canComplete: function() {return player.ddrm.combo.gte(35)},
            unlocked() {return hasUpgrade(this.layer, 24)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#FFBA00",
                }
            },
            onEnter() {player.ddrm.combo = new Decimal(0)},
            onExit() {player.ddrm.combo = new Decimal(0)},
        },
        21: {
            name: "困难",
            challengeDescription: "<i>\"此难度面向<b>中级玩家。</b>希望你的节奏感很好。\"</i> <br><br> 连击乘以连击增益。连击加成无效。此挑战在进入和退出时重置你的连击。",
            goalDescription: "拥有至少40的连击。",
            rewardDescription: "自动购买音符可购买项1，并解锁另一行半音符升级。x5 四分音符。",
            canComplete: function() {return player.ddrm.combo.gte(40)},
            unlocked() {return hasUpgrade(this.layer, 34)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#FF3333",
                }
            },
            onEnter() {player.ddrm.combo = new Decimal(0)},
            onExit() {player.ddrm.combo = new Decimal(0)},
        },
        22: {
            name: "专家",
            challengeDescription: "<i>\"此难度面向<b>经验丰富的玩家。</b>对狂热者来说是一个绝佳的挑战。\"</i> <br><br> 音乐精华乘以连击增益，音乐精华和音符被提升到^0.1，几乎箭头重置你的连击。此挑战在进入和退出时重置你的连击。",
            goalDescription: "拥有至少75的连击。",
            rewardDescription: "保留歌曲里程碑5-10和x5 四分音符。÷1e25 到音符可购买项1的成本。",
            canComplete: function() {return player.ddrm.combo.gte(75)},
            unlocked() {return hasUpgrade("n", 214)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#00E700",
                }
            },
            onEnter() {player.ddrm.combo = new Decimal(0)},
            onExit() {player.ddrm.combo = new Decimal(0)},
        },
        31: {
            name: "挑战",
            challengeDescription: "<i>\"此难度面向<b>非常有经验的玩家。</b>不要在家里尝试！\"</i> <br><br> 几乎和优秀箭头重置你的连击。连击加成无效。此挑战在进入和退出时重置你的连击。",
            goalDescription: "拥有至少65k的连击。",
            rewardDescription: "解锁另一行四分音符升级。四分音符现在使用底数为2的对数。",
            canComplete: function() {return player.ddrm.combo.gte(65000)},
            unlocked() {return hasUpgrade("s", 34)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#CB0BCD",
                }
            },
            onEnter() {player.ddrm.combo = new Decimal(0)},
            onExit() {player.ddrm.combo = new Decimal(0)},
        },
        32: {
            name: "双人",
            challengeDescription: "<i>\"<b>单人模式对你来说还不够。</b>\"</i> <br><br> 音符增益在其第一个软上限后为log(1e10)。几乎和完美箭头重置你的连击。优秀箭头有2.5%的几率也重置你的连击。此挑战在进入和退出时重置你的连击。",
            goalDescription: "拥有至少50k的连击。",
            rewardDescription: "为DDR到DDR X添加5个等级！",
            canComplete: function() {return player.ddrm.combo.gte("5e4")},
            onComplete() {
                addBuyables("ddr", 11, new Decimal(5))
                addBuyables("ddr", 12, new Decimal(5))
                addBuyables("ddr", 13, new Decimal(5))
                addBuyables("ddr", 21, new Decimal(5))
                addBuyables("ddr", 23, new Decimal(5))
            },
            unlocked() {return hasMilestone("ddr", 8)},
            style() {
                if (!hasChallenge(this.layer, this.id)) return {
                    "width": "400px",
                    "height": "275px",
                }
                return {
                    "width": "400px",
                    "height": "275px",
                    "background": "#461281",
                }
            },
            onEnter() {player.ddrm.combo = new Decimal(0)},
            onExit() {player.ddrm.combo = new Decimal(0)},
        },
    },

    tabFormat: {
        "ddr": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.s.points)} 首歌曲。`}],
                ["blank", function() {if (!hasChallenge("s", 11)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (!hasChallenge("s", 11)) return "你需要先完成\"停电\"！"}],
                "blank",
                ["display-text", function(){return `你总共制作了 ${format(player.ddr.total)} 个箭头。`}],
                "blank",
                "upgrades",
                "blank",
                "buyables",
            ]
        },
        "ddr": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.s.points)} 首歌曲。`}],
                ["blank", function() {if (!hasChallenge("s", 11)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (!hasChallenge("s", 11)) return "你需要先完成\"停电\"！"}],
                "blank",
                ["display-text", function(){return `你总共制作了 ${format(player.ddr.total)} 个箭头。`}],
                "blank",
                "challenges",
            ],
            unlocked() {return hasUpgrade("ddr", 21)}
        },
        "ddr": {
            content: [
                "main-display",
                "prestige-button",
                ["blank", "4px"],
                ["display-text", function(){return `你有 ${format(player.s.points)} 首歌曲。`}],
                ["blank", function() {if (!hasChallenge("s", 11)) return ["8px", "17px"]; else return ["0px", "0px"]}],
                ["display-text", function(){if (!hasChallenge("s", 11)) return "你需要先完成\"停电\"！"}],
                "blank",
                ["display-text", function(){return `你总共制作了 ${format(player.ddr.total)} 个箭头。`}],
                "blank",
                ["infobox", "grooveRadar"],
                "blank",
                ["display-text", function(){return `你有 <h2 style="color: #379be2; text-shadow: 0px 0px 10px #379be2">${format(player.ddr.groovePower)}</h2> 律动能量，它将音乐精华、音符、白音符和半音符乘以 x${format(player.ddr.gpe)} <br> (${format(player.ddr.gpg)}/秒)`}],
                ["display-text", function(){return `<span style="color:#BBBBBB">在1e350音符时开始获得律动能量！`}],
                "blank",
                ["bar", "stream"],
                ["blank", "8px"],
                ["clickables", [1]],
                "blank",
                ["bar", "voltage"],
                ["blank", "8px"],
                ["clickables", [2]],
                "blank",
                "milestones",
            ],
            unlocked() {return hasUpgrade("ddr", 41)}
        },
    },

    infoboxes: {
        grooveRadar: {
            title: "律动雷达机制",
            body() { return "各位，我的律动雷达出了点问题——抱歉，我就是喜欢传送门2。 " +
                "总之，律动雷达（GR）的功能与图巴树2的能量非常相似。通俗地说， " +
                "\"律动雷达填充越多，游戏难度越大。\" 五个值各自影响游戏的不同 " +
                "方面。到目前为止，你只解锁了两个：流和电压。根据你的律动雷达值 " +
                "有多强大，你可以生成律动能量（GP）。律动能量影响 " +
                "货币和其他东西。 <i>更改任何律动雷达值将导致层重置， " +
                "取决于该值是从哪里解锁的。</i>"
            },
            unlocked() {return true},
        },
    },

    bars: {
        stream: {
            direction: RIGHT,
            width: 727,
            height: 75,
            display() {
                let text = `流: M、G和A箭头效果除以 ÷${format(player.ddr.stream)}。每值加成: x10`
                return text
            },
            progress() {
                let prog = new Decimal(0)
                prog = player.ddr.stream.log(player.ddr.streamImpact).div(10)
                
                return prog
            },
            fillStyle() { return {"background-color": "#2280C2",} },
        },

        voltage: {
            direction: RIGHT,
            width: 727,
            height: 75,
            display() {
                let text = `电压: 音乐精华和音符被提升到 ^${format(player.ddr.voltage)}。每值加成: x1000`
                return text
            },
            progress() {
                let prog = new Decimal(0)
                prog = player.ddr.voltage.log(1.2).div(-10)
                
                return prog
            },
            fillStyle() { return {"background-color": "#2280C2",} },
        },
    },

    clickables: {
        11: {
            title: "增加流等级 +1",
            canClick() {return true},
            onClick() {
                if (player.ddr.stream.gte(player.ddr.streamImpact.pow(10))) return;
                player.ddr.stream = player.ddr.stream.mul(player.ddr.streamImpact)
                doReset("ddr", true)
            },
        },
        12: {
            title: "减少流等级 -1",
            canClick() {return true},
            onClick() {
                if (player.ddr.stream.lte(1)) return;
                player.ddr.stream = player.ddr.stream.div(player.ddr.streamImpact)
                doReset("ddr", true)
            },
        },
        13: {
            title: "最大化流等级",
            canClick() {return true},
            onClick() {
                player.ddr.stream = player.ddr.streamImpact.pow(10)
                doReset("ddr", true)
            },
        },
        14: {
            title: "最小化流等级",
            canClick() {return true},
            onClick() {
                player.ddr.stream = new Decimal(1)
                doReset("ddr", true)
            },
        },

        21: {
            title: "增加电压等级 +1",
            canClick() {return true},
            onClick() {
                if (player.ddr.voltage.lte(0.17)) return;
                player.ddr.voltage = player.ddr.voltage.div(1.2)
                doReset("ddr", true)
            },
        },
        22: {
            title: "减少电压等级 -1",
            canClick() {return true},
            onClick() {
                if (player.ddr.voltage.gte(1)) return;
                player.ddr.voltage = player.ddr.voltage.mul(1.2)
                doReset("ddr", true)
            },
        },
        23: {
            title: "最大化电压等级",
            canClick() {return true},
            onClick() {
                player.ddr.voltage = new Decimal(1).div(new Decimal(1.2).pow(10))
                doReset("ddr", true)
            },
        },
        24: {
            title: "最小化电压等级",
            canClick() {return true},
            onClick() {
                player.ddr.voltage = new Decimal(1)
                doReset("ddr", true)
            },
        },
    },

    update(diff){
        //流影响
        player.ddr.streamImpact = new Decimal("1e10")
        if (hasMilestone(this.layer, 2)) player.ddr.streamImpact = player.ddr.streamImpact.div("1e9")

        //律动能量阈值
        player.ddr.gpThreshold = new Decimal("1e350")
        if (hasUpgrade("n", 311)) player.ddr.gpThreshold = player.ddr.gpThreshold.div("1e50")

        //律动能量
        let mult = new Decimal(0)
        if (player.points.gte(player.ddr.gpThreshold) && (player.ddr.stream.neq(1) || player.ddr.voltage.neq(1))) mult = mult.add(1)
        mult = mult.mul(player.points.add(1).log(10).div(5))

        mult = mult.mul(new Decimal(10).pow(player.ddr.stream.log(player.ddr.streamImpact)))
        mult = mult.mul(new Decimal(1000).pow(player.ddr.voltage.log(1.2).div(-1)))

        //律动能量加成
        if (hasUpgrade("s", 32)) mult = mult.mul("1e10")
        if (hasChallenge("s", 12)) mult = mult.mul("1e15")
        mult = mult.mul(buyableEffect("ddr", 12))

        player.ddr.gpg = mult

        player.ddr.groovePower = player.ddr.groovePower.add(player.ddr.gpg.mul(diff))

        mult = player.ddr.groovePower.add(1).log(player.ddr.streamImpact).mul(100).pow(10).add(1)
        //律动能量效果加成
        
        mult = mult.pow(buyableEffect("ddr", 23))
        player.ddr.gpe = mult
        
    },

    glowColor() {
        let layer = "ddr"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
            if (canBuyBuyable(layer, id) && tmp[layer].buyables[id].unlocked) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "ddr"
        for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
            if (canBuyBuyable(layer, id) && hasUpgrade("s", 21) && tmp[layer].buyables[id].unlocked) {
                return true
            }
        }
        return false
    },
    automate() {
        let layer = "ddr"
        for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
            if (canBuyBuyable(layer, id) && hasUpgrade("s", 43) && tmp[layer].buyables[id].unlocked) {
                tmp[layer].buyables[id].buy()
            }
        }
    },

    branches: [["ddrfc", 1], ["bs", 1]],
    tooltip() {
        if (!canReset(this.layer)) return format(player.ddr.points) + " 箭头 (需要\"停电\"才能重置)"
        return format(player.ddr.points) + " 箭头 (重置时 +" + format(getResetGain("ddr")) + " 箭头)"
    },
})