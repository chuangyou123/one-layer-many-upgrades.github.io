addLayer("a", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    resource: "成就点数", 
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("成就")
    },
    achievementPopups: true,
    achievements: {
        11: {
            name: "你的节奏之旅",
            done() {return hasUpgrade("n", 11)},
            unlocked() {return true},
            tooltip() {return "购买第一个音符升级。+1 成就点数"},
            onComplete() {player.a.points = player.a.points.add(1)}
        },
        12: {
            name: "百万步里程碑",
            done() {return player.points.gte("1e6")},
            unlocked() {return true},
            tooltip() {return "拥有 100 万音乐能量。+1 成就点数"},
            onComplete() {player.a.points = player.a.points.add(1)}
        },
        13: {
            name: "创作总是充满乐趣",
            done() {return player.s.points.gte("1")},
            unlocked() {return true},
            tooltip() {return "创作你的第一首歌曲。+2 成就点数"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },
        14: {
            name: "快速发布迷你专辑",
            done() {return getResetGain("s").gte(4)},
            unlocked() {return true},
            tooltip() {return "一次创作 4 首歌曲。+2 成就点数"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },
        15: {
            name: "2x2x2x2",
            done() {return hasUpgrade("n", 44)},
            unlocked() {return true},
            tooltip() {return "拥有 16（或 4x4）个音符升级。+2 成就点数"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },
        16: {
            name: "专业制作人",
            done() {return hasMilestone("s", 6)},
            unlocked() {return true},
            tooltip() {return "拥有 6 个歌曲里程碑。+2 成就点数 / 行完成奖励：+100 和 x100 音符。"},
            onComplete() {player.a.points = player.a.points.add(2)}
        },

        21: {
            name: "展示你的舞步！",
            done() {return player.ddr.points.gte(1)},
            unlocked() {return true},
            tooltip() {return "首次进行 DDR 重置。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        22: {
            name: "无限音乐性！",
            done() {return player.points.gte("1.79e308")},
            unlocked() {return true},
            tooltip() {return "拥有 1.79e308 音乐能量。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        23: {
            name: "无懈可击的演奏",
            done() {return player.ddrm.combo.gte("500") &&
                player.ddrm.marvelous.gte("1e3") &&
                player.ddrm.great.gte("1e3") &&
                player.ddrm.almost.gte("1e3")
            },
            unlocked() {return true},
            tooltip() {return "至少拥有 1,000 个完美、优秀和接近箭头，并且连击数至少达到 500。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        24: {
            name: "这是什么难度？",
            done() {return hasUpgrade("ddr", 41)},
            unlocked() {return true},
            tooltip() {return "解锁节奏雷达。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        25: {
            name: "舞池精通",
            done() {return hasChallenge("ddr", 31)},
            unlocked() {return true},
            tooltip() {return "完成\"挑战\"舞蹈关卡。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        26: {
            name: "安可附加舞台",
            done() {return hasUpgrade("n", 314)},
            unlocked() {return true},
            tooltip() {return "解锁\"完美连击\"。+3 成就点数 / 行完成奖励：x1e100 音乐能量！哇！"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        31: {
            name: "律动古戈尔",
            done() {return player.ddr.groovePower.gte("1e100")},
            unlocked() {return true},
            tooltip() {return "拥有 1e100 律动能量。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        32: {
            name: "膨胀的舞蹈",
            done() {return getBuyableAmount("ddr", 22)},
            unlocked() {return true},
            tooltip() {return "将\"机器增强器\"升至满级。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        33: {
            name: "无限连击",
            done() {return player.ddrm.combo.gte("1.79e308")},
            unlocked() {return true},
            tooltip() {return "拥有 1.79e308 连击数。+3 成就点数"},
            onComplete() {player.a.points = player.a.points.add(3)}
        },
        34: {
            name: "击碎节拍。",
            done() {return player.bs.points.gte(1)},
            unlocked() {return true},
            tooltip() {return "首次进行节奏光剑重置。+5 成就点数"},
            onComplete() {player.a.points = player.a.points.add(5)}
        },
    },
})