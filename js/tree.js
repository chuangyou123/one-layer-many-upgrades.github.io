var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
})

addLayer("musicfocus", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    resource: "成就点数", 
    row: 0,
    position: 1,
    layerShown: false,
    achievementPopups: true,
    achievements: {
        11: {
            name: "身体漂浮在零重力空间中 - Camellia",
            done() {return false},
        },
        21: {
            name: "将此输入你的脊椎 - Camellia",
            done() {return false},
        },
        31: {
            name: "与寂静共舞 - Camellia",
            done() {return false},
        },
        41: {
            name: "用一些恶魔般的酒精蒸汽朋克引擎计算它 - Camellia",
            done() {return false},
        },
        61: {
            name: "与我一同飞翔 - Camellia",
            done() {return false},
        },
        71: {
            name: "+ERABY+E C0NNEC+10N - Camellia",
            done() {return false},
        },
        81: {
            name: "Tera I/O - Camellia",
            done() {return false},
        },
        91: {
            name: "M1LLI0N PP - Camellia",
            done() {return false},
        },
        101: {
            name: "火焰之墙 - Camellia",
            done() {return false},
        },
        51: {
            name: "BAD ACCESS (来自一个萌系女仆) - Camellia",
            done() {return false},
        },
        111: {
            name: "5YN+AX.3R40R(): - Justcubing97 vs. 3435Phi",
            done() {return false},
        },
        121: {
            name: "ARPG = FLOW - Justcubing97 vs. 3435Phi",
            done() {return false},
        },
        131: {
            name: "追逐星光 - Justcubing97",
            done() {return false},
        },
        141: {
            name: "数字模拟器 - SUPiFiNiTY vs. 3435Phi",
            done() {return false},
        },
        151: {
            name: "幽灵 - Camellia",
            done() {return false},
        },
        161: {
            name: "为该死的冲击做好准备 - Camellia",
            done() {return false},
        },
        171: {
            name: "离开地球大气层 - Camellia",
            done() {return false},
        },
        181: {
            name: "永远在一起，我亲爱的电子游戏卡带 - Camellia",
            done() {return false},
        },
        191: {
            name: "我们可以获得更多机枪精神病风格！（以及更多流派切换）- Camellia",
            done() {return false},
        },
        201: {
            name: "给魔术师的报纸 - Camellia",
            done() {return false},
        },
        211: {
            name: "死亡之环 - Camellia",
            done() {return false},
        },
        221: {
            name: "S.A.T.E.L.L.I.T.E. - Camellia",
            done() {return false},
        },
    },
})