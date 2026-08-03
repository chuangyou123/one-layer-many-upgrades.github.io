const UPG_COUNT = 4000;
const automationReqs = [1e6, 100, 25, 15, 10, 6, 4, 3, 2.5, 2, 2]
const automationBuyablePrice = [1, 2, 4, 10, 50, 500, 5000, 100000, 2e6]

// 预计算每个升级的加成倍数: upgEffects[n] = Decimal
// upgEffects[1] = 2
// upgEffects[n] = upgEffects[n-1] * (1.5 + 0.05*n + 0.0025*n^2)
const upgEffects = new Array(UPG_COUNT + 1);
{
    upgEffects[1] = new Decimal(2);
    for (let n = 2; n <= UPG_COUNT; n++) {
        let factor = 1.5 + 0.05 * n + 0.0025 * n * n;
        upgEffects[n] = upgEffects[n - 1].mul(factor);
    }
}
const totalUpgEffects = new Array(UPG_COUNT + 1);
{
    totalUpgEffects[0] = new Decimal(1);
    for (let n = 1; n <= UPG_COUNT; n++) {
        totalUpgEffects[n] = totalUpgEffects[n - 1].mul(upgEffects[n]);
    }
}

const timewallDuration = new Array(UPG_COUNT + 1);
{
    for (let n = 1; n <= UPG_COUNT; n++) {
        timewallDuration[n] = n / (1.05 ** Math.floor(n / 50));
    }
}

// 构建一个预计算的 Decimal 成本数组，按 UpgNum 索引（从 1 开始）
// costs[N] = 升级 N 的成本（costs[0] 未使用）
const upgCosts = new Array(UPG_COUNT + 1);
{
    let runningPowerGen = new Decimal(1); // 任何升级前的电力生成
    for (let n = 1; n <= UPG_COUNT; n++) {
        // 成本 = n *（购买此升级前的当前电力生成）
        upgCosts[n] = new Decimal(timewallDuration[n]).mul(runningPowerGen);
        // 购买升级 n 后，电力生成乘以 upgEffects[n]
        runningPowerGen = runningPowerGen.mul(upgEffects[n]);
    }
}

// 返回 UpgNum n 对应的 TMT 升级 ID
function upgId(n) {
    return (Math.floor((n - 1) / 5) * 10 + ((n - 1) % 5 + 1)) + 10;
}

function getMaxUnlockedRow() {
    if (!player || !player.p) return 0;
    let maxRow = 0;
    let maxUnlockedRows = Math.floor((player.p.upsunlocked || 500) / 5);
    for (let r = 0; r < maxUnlockedRows; r++) {
        if (r === 0 || hasUpgrade("p", upgId(r * 5))) {
            maxRow = r;
        } else {
            break;
        }
    }
    return maxRow;
}

const upgDescriptions = new Array(UPG_COUNT + 1);

for (let n = 1; n <= UPG_COUNT; n++) {
    let added = "";
    if ((n % 50 == 0) && n < 1000) added = " [奖励加成 - 后续升级时间缩短 10%！]";

    upgDescriptions[n] =
        "将电力乘以 " + format(upgEffects[n], 2) + " 倍。" + added;
}

function buildUpgrades() {
    let upgs = {};
    for (let n = 1; n <= UPG_COUNT; n++) {
        let id = upgId(n);
        let cost = upgCosts[n];
        // 上一行的最后一个升级解锁此行
        let row = Math.floor((n - 1) / 5);
        let prevRowLastId = row > 0 ? upgId(row * 5) : null;
        let added = ""
        if ((n % 50 == 0) && n < 1000) added = " [奖励加成 - 后续升级时间缩短 10%！]"
        upgs[id] = {
            title: "升级 " + n,
            description: upgDescriptions[n],
            cost: cost,
            currencyInternalName: "points",
            currencyDisplayName: "电力",
            unlocked() {
                if (row >= Math.floor((player.p.upsunlocked) / 5)) return false;
                if (row >= Math.floor((UPG_COUNT) / 5)) return false;
                let visibleRows = Math.ceil(player.p.nextUpgToAuto / 5);

                if (row > (visibleRows-1)) return false;

                if (player.p.compactView) {
                    return row >= Math.max(0, player.p.maxUnlockedRow - 4);
                }
                return true;
            },
        };
    }
    return upgs;
}

addLayer("p", {
    name: "升级",
    symbol: "⚡",
    color: "#FFAA00",
    row: 0,

    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            upsunlocked: 100,
            autoMult: new Decimal(1e6),
            nextUpgToAuto: 1,
            timesincelast: new Decimal(0),
            compactView: true,
            totalPresMulti: new Decimal(1),
            maxUnlockedRow: 0,
            energy: new Decimal(0),
            holdCombo: 0,
        };
    },

    layerShown() { return true; },

    tabFormat: {
        "p": {
            content: [
                ["display-text", function() {
                    return "你拥有 <h2 style='color:#FFAA00;display:inline;'>" + notationChooser(player.points) + "</h2> 电力"
                        + "<br>电力/秒: " + notationChooser(tmp.pointGen);
                }],
                "blank",
                ["clickables", [1]],
                "blank",
                ["display-text",
                    function(){
                        let a = "在 5e4 电力时解锁新机制！"
                        if (player.points.lt("e50000")) return a
                    }
                ],
                "blank",
                "upgrades",
            ],
        },
        "p": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        let a = "你拥有 "
                        a = a + notationChooser(player.p.total)
                        return a + " 次总飞升。"
                    }
                ],
                "blank",
                ["display-text",
                    function(){
                        let a = "总飞升倍数 x"
                        a = a + formatWhole(player.p.totalPresMulti,2)
                        return a + "   [注意：每次飞升购买都是叠加的！！]"
                    }
                ],
                "blank",
                "blank",
                ["milestones", [1,2,3,4,5,6]],
                "blank",
                "blank",
                "blank",
                ["buyables", [1]],
            ],
        },
        "p": {
            content: [
                "main-display",
                "blank",
                ["display-text", function() {
                    return "你拥有 <h2 style='color:#FFAA00;display:inline;'>" + notationChooser(player.points) + "</h2> 电力"
                        + "<br>电力/秒: " + notationChooser(tmp.pointGen);
                }],
                "blank",
                ["display-text", function() {
                    mult = new Decimal(1)
                    if (hasMilestone("p",8)) mult = mult.mul(1.25)
                    if (hasMilestone("p",10)) mult = mult.mul(2)
                    if (hasMilestone("p",19)) mult = mult.mul(1.75)
                    if (hasMilestone("p",22)) mult = mult.mul(100)
                    if (hasMilestone("p",15) && (player.aura.totalRolls>4000)) mult = mult.mul(1.5)
                    if (hasMilestone("p",21) && (player.aura.totalRolls>20000)) mult = mult.mul(2)
                    if (hasMilestone("p",21) && (player.aura.totalRolls>75000)) mult = mult.mul(2)
                    if (hasMilestone("p",21) && (player.points.gte("e15e6"))) mult = mult.mul(2)
                    return "基础能量获取: <h2 style='color:#FFAA00;display:inline;'>" + notationChooser(player.points.add(1).log10().add(1).log(1.1).mul(player.p.points.add(1).log(1.1)).mul(mult).floor()) + "</h2>（受当前电力和飞升次数影响）"
                        + "<br>公式: log1.1(log10(电力))*log1.1(飞升次数)";
                }],
                "blank",
                ["display-text", function() {
                    let a = "能量: <h2 style='color:#FFAA00;display:inline;'>" + notationChooser(player.p.energy) + "</h2>。这会将飞升提升 " +notationChooser(new Decimal(1.2).pow(player.p.energy.div(1e5).add(1).log10()));
                    if (hasMilestone("p",17)) a = a + "，并将光环幸运提升 " + notationChooser(new Decimal(1.07).pow(player.p.energy.div(1e9).add(1).log10())) + "。"
                    return a
                }],
                "blank",
                ["display-text", function() {
                    return "连击: <h2 style='color:#FFAA00;display:inline;'>" + notationChooser(player.p.holdCombo) + "</h2>（直接提升能量获取）";
                }],
                "blank",
                "blank",
                ["clickables", [2]],
                "blank",
                "blank",
                "blank",
                ["milestones", [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]],
            ],
            unlocked() {return player.points.gte("e50000")}
        },
    },
    clickables: {
        11: {
            title() {
                return player.p.compactView ? "视图模式：最近 5 行（开）" : "视图模式：所有已解锁行（关）";
            },
            canClick() { return true; },
            onClick() {
                player.p.compactView = !player.p.compactView;
            },
            style() {
                return {
                    'min-width': '220px',
                    'padding': '6px 12px',
                    'font-size': '13px',
                    'font-weight': 'bold',
                };
            },
        },
        21: {
            title() {
                mult = new Decimal(1)
                if (hasMilestone("p",8)) mult = mult.mul(1.25)
                if (hasMilestone("p",10)) mult = mult.mul(2)
                if (hasMilestone("p",19)) mult = mult.mul(1.75)
                if (hasMilestone("p",22)) mult = mult.mul(100)
                if (hasMilestone("p",15) && (player.aura.totalRolls>4000)) mult = mult.mul(1.5)
                if (hasMilestone("p",21) && (player.aura.totalRolls>20000)) mult = mult.mul(2)
                if (hasMilestone("p",21) && (player.aura.totalRolls>75000)) mult = mult.mul(2)
                if (hasMilestone("p",21) && (player.points.gte("e15e6"))) mult = mult.mul(2)
                return "获得 "+ notationChooser(player.points.add(1).log10().add(1).log(1.1).mul(player.p.points.add(1).log(1.1)).mul(player.p.holdCombo+1).mul(mult)) +" 能量！（按住按钮，不要点击！）";
            },
            canClick() { return true; },
            canHold() { return true; },
            onHold() {
                player.p.energy = player.p.energy.add(player.points.add(1).log10().add(1).log(1.1).mul(player.p.points.add(1).log(1.1)).mul(player.p.holdCombo+1).mul(mult))
                player.p.holdCombo = player.p.holdCombo + 1
                player.p.timesincelast = new Decimal(0)
            },
            style() {
                return {
                    'width': '700px',
                    'font-size': '14px',
                    'font-weight': 'bold',
                };
            },
        },
    },
    automate() {
        // 仅当电力 > 升级成本 *（数值）时自动升级
        let startN = player.p.nextUpgToAuto || 1;
        
        while (startN <= player.p.upsunlocked && hasUpgrade("p", upgId(startN))) {
            startN++;
        }
        player.p.nextUpgToAuto = startN
        
        for (let n = startN; n <= UPG_COUNT; n++) {
            let id = upgId(n);
            if (hasUpgrade("p", id)) continue
            
            let row = Math.floor((n - 1) / 5)
            if (row >= Math.floor(player.p.upsunlocked / 5)) break
            if (row > 0 && !hasUpgrade("p", upgId(row * 5))) break
            
            let cost = upgCosts[n]
            if (player.points.gt(cost.mul(player.p.autoMult))) {
                buyUpgrade("p", id)

                if (hasUpgrade("p", id)) {
                    player.p.nextUpgToAuto = n + 1
                } else {
                    break
                }
            } else {
                break
            }
        }
    },
    tooltip() {
        if (player.points.lte(1e10)) return "你还有很长的路要走..."
        if (player.points.lte(1e200)) return "一个重置层正在逼近..."
        if (player.points.lte("1e1500")) return "飞升显现了！但你应该飞升吗..."
        if (player.points.lte("1e7500")) return "你进展不错！还有更多等着你..."
        if (player.points.lte("1e40000")) return "是不是觉得获得升级需要很长时间？"
        if (player.points.lte("1e150000")) return "这个加成真的很有帮助！"
        if (player.points.lte("1e400000")) return "你做得很好！"
        if (player.points.lte("1e1000000")) return "继续前进！"
        if (player.points.lte("1e3000000")) return "飞升，然后重复！"
        if (player.points.lte("1e7500000")) return "坚持不懈。"
        if (player.points.lte("1e15000000")) return "真正的大师！"
        if (player.points.gte("1e15000000")) return "绝对的大师！"
    },
    upgrades: buildUpgrades(),
    requires: new Decimal("e150"), // 可以是一个考虑需求增长的函数
    resource: "飞升次数", // 货币名称
    baseResource: "电力", // 飞升所基于的资源名称
    baseAmount() {return player.points}, // 获取当前基础资源数量
    type: "custom", // normal: 获得货币的成本取决于获得的量。static: 成本取决于你已有的量
    exponent: 1, 
    gainMult() { // 飞升倍数
        let mult = player.p.totalPresMulti
        return mult
    },
    gainExp() { // 计算主货币的指数加成
        let exp = new Decimal(1)
        return exp
    },
    canReset() {
        return tmp.p.baseAmount.gte(tmp.p.requires)
    },
    getResetGain() {
        if (player.points.lte(0)) return new Decimal(0)
        return (player.points.max(1).log(10).div(150)).mul(player.p.totalPresMulti).floor()
    },
    getNextAt() {
        let target = tmp.p.getResetGain.add(1)
        return Decimal.pow(10, target.mul(150).div(player.p.totalPresMulti))
    },
    onPrestige() {
        player.p.upgrades = []
        player.p.nextUpgToAuto = 1
    },
    milestones: {
        1: {
            requirementDescription: "10 次总飞升",
            effectDescription: "解锁飞升购买。同时将飞升获取提升 10%。",
            done() { return player.p.total.gte(10) }
        },
        2: {
            requirementDescription: "100 次总飞升",
            effectDescription: "将光环掷骰冷却时间减少 1 秒！",
            done() { return player.p.total.gte(100) },
            unlocked() {return player.p.total.gte(10)}
        },
        3: {
            requirementDescription: "1,000 次总飞升",
            effectDescription: "如果已掷出 1,000 个光环，飞升获取翻倍。如果掷出 10,000 个，再翻倍！",
            done() { return player.p.total.gte(1000) },
            unlocked() {return player.p.total.gte(100)}
        },
        4: {
            requirementDescription: "10,000 次总飞升",
            effectDescription: "小幅提升 - 将光环掷骰冷却时间减少 0.5 秒，并将光环幸运乘以 1.4",
            done() { return player.p.total.gte(10000) },
            unlocked() {return player.p.total.gte(1000)}
        },
        5: {
            requirementDescription: "100,000 次总飞升",
            effectDescription: "电力获取翻倍！",
            done() { return player.p.total.gte(1e5) },
            unlocked() {return player.p.total.gte(1e4)}
        },
        6: {
            requirementDescription: "1M 次总飞升 - 最后一个里程碑...",
            effectDescription: "飞升获取提升三倍！同时将光环掷骰冷却时间再减少 0.7 秒。",
            done() { return player.p.total.gte(1e6) },
            unlocked() {return player.p.total.gte(1e5)}
        },
        7: {
            requirementDescription: "e100K 电力",
            effectDescription: "+25% 电力获取",
            done() { return player.points.gte("e100e3") },
            unlocked() {return player.points.gte("e50e3")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        8: {
            requirementDescription: "e250K 电力",
            effectDescription: "+25% 能量获取",
            done() { return player.points.gte("e250e3") },
            unlocked() {return player.points.gte("e100e3")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        9: {
            requirementDescription: "e500K 电力",
            effectDescription: "“更好的自动”购买价格减半。",
            done() { return player.points.gte("e500e3") },
            unlocked() {return player.points.gte("e250e3")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        10: {
            requirementDescription: "e1M 电力",
            effectDescription: "+100% 飞升、能量",
            done() { return player.points.gte("e1000e3") },
            unlocked() {return player.points.gte("e500e3")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        11: {
            requirementDescription: "e2M 电力",
            effectDescription: "将“强化飞升”购买的效果提升至 +80%。",
            done() { return player.points.gte("e2e6") },
            unlocked() {return player.points.gte("e1e6")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        12: {
            requirementDescription: "e4M 电力",
            effectDescription: "将“疯狂飞升”购买的效果提升至 +230%",
            done() { return player.points.gte("e4e6") },
            unlocked() {return player.points.gte("e2e6")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        13: {
            requirementDescription: "e8M 电力",
            effectDescription: "将“更多！！！”购买的价格降低十倍",
            done() { return player.points.gte("e8e6") },
            unlocked() {return player.points.gte("e4e6")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        14: {
            requirementDescription: "e14M 电力",
            effectDescription: "将“激增倍数”购买的价格降低十倍",
            done() { return player.points.gte("e14e6") },
            unlocked() {return player.points.gte("e8e6")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        15: {
            requirementDescription: "1B 能量",
            effectDescription: "当掷出 4,000 个光环时，能量乘以 1.5。",
            done() { return player.p.energy.gte("1e9") },
            unlocked() {return player.p.energy.gte("1")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        16: {
            requirementDescription: "5B 能量",
            effectDescription: "“更伟大的飞升”购买提升至 +40%",
            done() { return player.p.energy.gte("5e9") },
            unlocked() {return player.p.energy.gte("1e9")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        17: {
            requirementDescription: "50B 能量",
            effectDescription: "解锁光环幸运加成！",
            done() { return player.p.energy.gte("50e9") },
            unlocked() {return player.p.energy.gte("5e9")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        18: {
            requirementDescription: "400B 能量",
            effectDescription: "连击重置所需时间从 150 毫秒增加到 10 秒",
            done() { return player.p.energy.gte("400e9") },
            unlocked() {return player.p.energy.gte("50e9")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        19: {
            requirementDescription: "5T 能量",
            effectDescription() {
                mult = new Decimal(1)
                if (hasMilestone("p",8)) mult = mult.mul(1.25)
                if (hasMilestone("p",10)) mult = mult.mul(2)
                if (hasMilestone("p",19)) mult = mult.mul(1.75)
                if (hasMilestone("p",22)) mult = mult.mul(100)
                if (hasMilestone("p",15) && (player.aura.totalRolls>4000)) mult = mult.mul(1.5)
                if (hasMilestone("p",21) && (player.aura.totalRolls>20000)) mult = mult.mul(2)
                if (hasMilestone("p",21) && (player.aura.totalRolls>75000)) mult = mult.mul(2)
                if (hasMilestone("p",21) && (player.points.gte("e15e6"))) mult = mult.mul(2)
                let des = "被动能量获取，虽然非常弱。同时 +75% 能量。当前：+"
                des = des + " (当前：+" + notationChooser(player.points.add(1).log10().add(1).log(1.1).mul(player.p.points.add(1).log(1.1)).mul(mult).floor()) + " 能量/秒)"
                return des
            },
            done() { return player.p.energy.gte("5e12") },
            unlocked() {return player.p.energy.gte("400e9")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        20: {
            requirementDescription: "20T 能量",
            effectDescription: "连击永不重置。",
            done() { return player.p.energy.gte("20e12") },
            unlocked() {return player.p.energy.gte("5e12")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        21: {
            requirementDescription: "150T 能量",
            effectDescription: "当掷出 20,000 和 75,000 个光环时，能量获取翻倍。如果电力 >e15M，能量获取再翻倍",
            done() { return player.p.energy.gte("150e12") },
            unlocked() {return player.p.energy.gte("20e12")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
        22: {
            requirementDescription: "5Qd 能量",
            effectDescription: "x100 能量获取！！",
            done() { return player.p.energy.gte("5e15") },
            unlocked() {return player.p.energy.gte("150e12")},
            style() {
                return {
                    'width': '700px',
                    'font-size': '16px',
                };
            },
        },
    },
    buyables: {
        11: {
            title: "大幅提升光环幸运！",
            cost(x) {
                return new Decimal(1).mul(Decimal.pow(2, x)).floor()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>已购买: " + getBuyableAmount(this.layer, this.id) + "<br>效果: 将光环幸运乘以 x" + notationChooser(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                base1 = new Decimal(4)
                base2 = x
                expo = new Decimal(1)
                let eff = base1.pow(Decimal.pow(base2, expo))
                return eff
            },
            tooltip() {
                return "x4 光环幸运，相当于约 x1.15 的倍数。"
            }
        },
        12: {
            title: "更好的自动",
            cost(x) {
                let n = 1
                if (hasMilestone("p", 9)) n = 0.5
                if (x <= 8) {
                    return new Decimal(automationBuyablePrice[x]*n)
                } else {
                    return new Decimal("e1e6")
                }
            },
            display() {
                let x = getBuyableAmount(this.layer, this.id)
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>已购买: " + getBuyableAmount(this.layer, this.id) + "<br>效果: 要自动升级，你需要 " + automationReqs[x.toNumber()] + "x >> " + automationReqs[x.toNumber()+1] + "x 升级成本才能自动购买。"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                base1 = new Decimal(4)
                base2 = x
                expo = new Decimal(1)
                let eff = base1.pow(Decimal.pow(base2, expo))
                return eff
            },
            tooltip() {
                return "成本+效果: 1Mx（免费） -> 100x（1） -> 25x（2） -> 15x（4） -> 10x（10） -> 6x（50） -> 4x（500） -> 3x（5,000） -> 2.5x（100K） -> 2x（2M）。"
            }
        },
        13: {
            title: "激增倍数",
            cost(x) {
                let costdiv = new Decimal(1)
                if (hasMilestone("p",14)) costdiv = new Decimal(10)
                return new Decimal(3).mul(Decimal.pow(1.9, x)).div(costdiv).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>当你尚未购买升级 " + (getBuyableAmount(this.layer, this.id)*50) + " 时，x" + notationChooser(buyableEffect(this.layer, this.id)) + " 电力倍数"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let eff = new Decimal(1)
                if (x.gt(0)) {
                    eff = new Decimal(x).add(2)
                } else {
                    eff = new Decimal(1)
                }
                return eff
            },
            tooltip() {
                return "每次购买将升级上限增加 50，倍数增加 1（首次购买从 3 开始）"
            }
        },
        14: {
            title: "更多！！！",
            cost(x) {
                let costdiv = new Decimal(1)
                if (hasMilestone("p",13)) costdiv = new Decimal(10)
                return new Decimal(1).mul(Decimal.pow(1.8, x)).div(costdiv).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>可解锁的最大升级: " + buyableEffect("p",14).add(100)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return x.mul(100)
            },
            tooltip() {
                return "每次购买将升级上限增加 100"
            }
        },
        15: {
            title: "更伟大的飞升",
            cost(x) {
                return new Decimal(4).mul(Decimal.pow(3, x)).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>效果: +" + buyableEffect("p",15) + "% 飞升"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                b = 30
                if (hasMilestone("p",16)) b = 40
                return x.mul(b)
            },
            tooltip() {
                return "+"+b+"% 飞升/级。"
            },
            unlocked() {
                return hasMilestone("p",1)
            }
        },
        16: {
            title: "强化飞升",
            cost(x) {
                return new Decimal(25).mul(Decimal.pow(5, x)).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>效果: +" + buyableEffect("p",16) + "% 飞升"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                b = 60
                if (hasMilestone("p",11)) b = 80
                return x.mul(b)
            },
            tooltip() {
                return "+"+b+"% 飞升/级。"
            },
            unlocked() {return getBuyableAmount("p", 15).gte(1)}
        },
        17: {
            title: "超级飞升",
            cost(x) {
                return new Decimal(250).mul(Decimal.pow(9, x)).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>效果: +" + buyableEffect("p",17) + "% 飞升"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return x.mul(110)
            },
            tooltip() {
                return "+110% 飞升/级。"
            },
            unlocked() {return getBuyableAmount("p", 16).gte(1)}
        },
        18: {
            title: "疯狂飞升",
            cost(x) {
                return new Decimal(5000).mul(Decimal.pow(12,x)).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>效果: +" + buyableEffect("p",18) + "% 飞升"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                b = 160
                if (hasMilestone("p",12)) b = 230
                return x.mul(b)
            },
            tooltip() {
                return "+"+b+"% 飞升/级。"
            },
            unlocked() {return getBuyableAmount("p", 17).gte(1)}
        },
        19: {
            title: "欧米茄飞升",
            cost(x) {
                return new Decimal(400000).mul(Decimal.pow(20, x)).round()
            },
            display() {
                return "成本: " + notationChooser(tmp[this.layer].buyables[this.id].cost) + " 飞升次数。" + "<br>效果: +" + buyableEffect("p",19) + "% 飞升"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return x.mul(280)
            },
            tooltip() {
                return "+280% 飞升/级。"
            },
            unlocked() {return getBuyableAmount("p", 18).gte(1)}
        },
    },
    prestigeButtonText() {
        if (tmp.p.canReset) {
            return "飞升以获得 " + formatWhole(tmp.p.resetGain) + " " + tmp.p.resource + "！<br>（下次在 " + formatWhole(getNextAt("p")) + "）"
        }
        return "达到 " + formatWhole(tmp.p.requires) + " " + tmp.p.baseResource + " 才能飞升<br>（下次在 " + formatWhole(getNextAt("p")) + "）"
    },
});


const FIXED_AURAS = [
    { name: "无", rarity: 1, multi: 1.00 },
    { name: "微小", rarity: 3, multi: 1.1 },
    { name: "轻盈", rarity: 10, multi: 1.2 },
    { name: "粒子", rarity: 40, multi: 1.34 },
    { name: "糟糕", rarity: 100, multi: 1.47 },
    { name: "一般", rarity: 200, multi: 1.63 },
    { name: "平庸", rarity: 500, multi: 1.83 },
    { name: "良好", rarity: 1000, multi: 2.05 },
    { name: "平均", rarity: 2400, multi: 2.42 },
    { name: "不错", rarity: 6000, multi: 2.88 },
    { name: "优秀", rarity: 15000, multi: 3.37 },
    { name: "伟大", rarity: 35000, multi: 4.06 },
    { name: "惊人", rarity: 55000, multi: 4.58 },
    { name: "辐射", rarity: 85000, multi: 5.02 },
];

const AURA_BASES = ["火山", "地震", "精通", "卓越", "疯狂", "野兽", "巨蛇", "霸主"];
const AURA_SUFFIXES = ["超级", "巨型", "终极", "欧米茄", "超能", "天体", "疯狂", "棱镜", "超验", "神级", "异界", "全能", "绝对"];

function getAuraData(index) {
    if (index < FIXED_AURAS.length) {
        let f = FIXED_AURAS[index];
        return { name: f.name, rarity: new Decimal(f.rarity), multi: new Decimal(f.multi) };
    }
    let step = index - FIXED_AURAS.length;
    let rarity = new Decimal(100000).mul(new Decimal(2).pow(step));
    let multiVal = 5.57 * Math.pow(1.11, step + 1);
    let multi = new Decimal((Math.round(multiVal * 100) / 100).toFixed(2));
    
    let base = AURA_BASES[step % AURA_BASES.length];
    let suffix = AURA_SUFFIXES[Math.floor(step / AURA_BASES.length) % AURA_SUFFIXES.length];
    let tier = Math.floor(step / (AURA_BASES.length * AURA_SUFFIXES.length));
    let name = suffix + " " + base + (tier > 0 ? " +" + tier : "");

    return { name, rarity, multi };
}

function rollAura() {
    let r = Math.random();
    if (r <= 0) r = 1e-15;
    let luck = (tmp.aura && tmp.aura.luck) ? tmp.aura.luck : (player.aura.luck ? new Decimal(player.aura.luck) : new Decimal(1));
    let rollVal = new Decimal(1).div(r).mul(luck);
    
    let earnedIndex = 0;
    if (rollVal.gte(200000)) {
        let step = rollVal.div(200000).log2().floor().toNumber();
        earnedIndex = FIXED_AURAS.length + step;
    } else {
        let num = rollVal.toNumber();
        for (let i = FIXED_AURAS.length - 1; i >= 0; i--) {
            if (num >= FIXED_AURAS[i].rarity) {
                earnedIndex = i;
                break;
            }
        }
    }
    
    let aura = getAuraData(earnedIndex);
    player.aura.lastAura = aura;
    player.aura.totalRolls = (player.aura.totalRolls || 0) + 1;
    
    if (earnedIndex > (player.aura.bestIndex || 0)) {
        player.aura.bestIndex = earnedIndex;
        player.aura.bestName = aura.name;
        player.aura.bestMulti = aura.multi;
        player.aura.bestRarity = aura.rarity;
    }
    
    player.aura.cd = player.aura.basecd;
}

addLayer("aura", {
    name: "光环小游戏",
    symbol: "A",
    startData() {
        return {
            unlocked: true,
            luck: new Decimal(1),
            cd: new Decimal(0),
            basecd: new Decimal(2.5),
            bestIndex: 0,
            bestName: "无",
            bestRarity: new Decimal(1),
            bestMulti: new Decimal(1),
            lastAura: null,
            totalRolls: 0,
        };
    },
    color: "grey",
    row: "side",
    tooltip() {
        return "光环小游戏";
    },
    luck() {
        return player.aura.luck ? new Decimal(player.aura.luck) : new Decimal(1);
    },
    powerMult() {
        return player.aura.bestMulti ? new Decimal(player.aura.bestMulti) : new Decimal(1);
    },
    tabFormat: [
        ["display-text", function() {
            let activeMulti = tmp.aura.powerMult ? tmp.aura.powerMult : new Decimal(1);
            let luckMulti = tmp.aura.luck ? tmp.aura.luck : new Decimal(1);
            let nextAura = getAuraData((player.aura.bestIndex || 0) + 1);
            
            let text = "<h2>光环倍数: " + activeMulti.toFixed(2) + "x</h2><br>";
            text += "幸运倍数: <b>x" + notationChooser(luckMulti) + "</b><br><br>";
            text += "因为你掷出了 <b>" + player.aura.totalRolls + "</b> 个光环，你将获得 x"+ (1+(player.aura.totalRolls/1000)) +" 幸运倍数。<br><br>";
            text += "最佳光环: <b>" + player.aura.bestName + "</b> (1/" + notationChooser(new Decimal(player.aura.bestRarity)) + ")<br>";
            if (player.aura.lastAura) {
                text += "上次掷出: <b>" + player.aura.lastAura.name + "</b> (1/" + notationChooser(new Decimal(player.aura.lastAura.rarity)) + ") - x" + new Decimal(player.aura.lastAura.multi).toFixed(2) + "<br>";
            } else {
                text += "上次掷出: 无<br>";
            }
            text += "下一个目标: <b>" + nextAura.name + "</b> (1/" + notationChooser(nextAura.rarity) + ") - x" + nextAura.multi.toFixed(2) + "<br>";
            return text;
        }],
        "blank",
        ["clickables", [1]],
        "blank",
        "blank",
        ["infobox", "main"],
    ],
    clickables: {
        11: {
            title() {
                if (player.aura.cd && player.aura.cd.gt(0)) {
                    return "等待 " + player.aura.cd.toFixed(1) + " 秒";
                }
                return "掷光环";
            },
            canClick() {
                return !player.aura.cd || player.aura.cd.lte(0);
            },
            onClick() {
                rollAura();
            },
            style() {
                return {
                    'width': '600px',
                    'height': '200px',
                    'font-size': '16px',
                };
            },
        },
    },
    infoboxes: {
        main: {
            title: "欢迎来到光环小游戏！",
            body() { return "掷出不同稀有度的光环！更稀有的光环给予更稀有的加成……虽然很小。已解锁的最稀有光环会提升电力" },
        },
    },
    update(diff) {
                mult = new Decimal(1)
                if (hasMilestone("p",8)) mult = mult.mul(1.25)
                if (hasMilestone("p",10)) mult = mult.mul(2)
                if (hasMilestone("p",19)) mult = mult.mul(1.75)
                if (hasMilestone("p",22)) mult = mult.mul(100)
                if (hasMilestone("p",15) && (player.aura.totalRolls>4000)) mult = mult.mul(1.5)
                if (hasMilestone("p",21) && (player.aura.totalRolls>20000)) mult = mult.mul(2)
                if (hasMilestone("p",21) && (player.aura.totalRolls>75000)) mult = mult.mul(2)
                if (hasMilestone("p",21) && (player.points.gte("e15e6"))) mult = mult.mul(2)
        player.p.maxUnlockedRow = getMaxUnlockedRow();
        player.aura.luck = new Decimal(1)
        if (hasMilestone("p",19)) player.p.energy = player.p.energy.add(player.points.add(1).log10().add(1).log(1.1).mul(player.p.points.add(1).log(1.1)).floor().mul(mult).mul(diff))
        player.p.timesincelast = player.p.timesincelast.add(diff)
        let letsecs = new Decimal(0.15)
        if (hasMilestone("p",18)) letsecs = new Decimal(10)
        if (hasMilestone("p",20)) letsecs = new Decimal(1e100)
        if (player.p.timesincelast.gt(letsecs)) player.p.holdCombo = 0
        player.aura.luck = player.aura.luck.mul((1+(player.aura.totalRolls/1000)))
        player.aura.luck = player.aura.luck.mul(buyableEffect("p",11))
        if (player.aura.cd && player.aura.cd.gt(0)) {
            player.aura.cd = player.aura.cd.sub(diff).max(0);
        }
        player.p.upsunlocked = (buyableEffect("p",14).add(100)).toNumber()
        player.p.autoMult = new Decimal(automationReqs[getBuyableAmount("p",12).toNumber()])
        player.p.totalPresMulti = (buyableEffect("p",15).add(buyableEffect("p",16)).add(buyableEffect("p",17)).add(buyableEffect("p",18)).add(buyableEffect("p",19))).div(100).add(1)
        if (hasMilestone("p",1)) player.p.totalPresMulti = player.p.totalPresMulti.mul(1.1)
        if (hasMilestone("p",10)) player.p.totalPresMulti = player.p.totalPresMulti.mul(2)
        player.p.totalPresMulti = player.p.totalPresMulti.mul(new Decimal(1.2).pow(player.p.energy.div(1e5).add(1).log10()))
        if (hasMilestone("p",3)) {
            if (player.aura.totalRolls>1000) player.p.totalPresMulti = player.p.totalPresMulti.mul(2)
            if (player.aura.totalRolls>10000) player.p.totalPresMulti = player.p.totalPresMulti.mul(2)
        }
        if (hasMilestone("p",4)) player.aura.luck = player.aura.luck.mul(1.4)
        if (hasMilestone("p",17)) player.aura.luck = player.aura.luck.mul(new Decimal(1.07).pow(player.p.energy.div(1e9).add(1).log10()))
        if (hasMilestone("p",2)) player.aura.basecd = new Decimal(1.5)
        if (hasMilestone("p",4)) player.aura.basecd = new Decimal(1)
        if (hasMilestone("p",6)) player.aura.basecd = new Decimal(0.3)
    },
});