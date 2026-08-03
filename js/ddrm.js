addLayer("ddrm", {
    startData() { return {
        unlocked: false,
        points: new Decimal(0),

        marvelous: new Decimal(0),
        mEffect: new Decimal(1),
        great: new Decimal(0),
        gEffect: new Decimal(1),
        almost: new Decimal(0),
        aEffect: new Decimal(1),
        miss: new Decimal(0),

        combo: new Decimal(0),
        highestCombo: new Decimal(0),
        cEffect: new Decimal(0),    

        current: [],
        speed: 1,
        timer: 0,
        paused: false,
    }},
	color: "#C70078",
    symbol: "👯",

    resource: "命中数", 
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("舞蹈革命迷你游戏")
    },

    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER

    hotkeys: [
        {key: "ArrowLeft", onPress(){tmp.ddrm.arrowClicking_DDRM(1)}},
        {key: "ArrowDown", onPress(){tmp.ddrm.arrowClicking_DDRM(2)}},
        {key: "ArrowUp", onPress(){tmp.ddrm.arrowClicking_DDRM(3)}},
        {key: "ArrowRight", onPress(){tmp.ddrm.arrowClicking_DDRM(4)}},
        {key: "/", onPress(){player.ddrm.paused = !player.ddrm.paused}}
    ],

    findMults_DDRM(type, comboArg){
        let mult = new Decimal(1)
        if (type == "m"){
            mult = mult.mul(player.ddrm.cEffect)
            if (hasUpgrade("ddr", 12)) mult = mult.mul(2)
            if (hasChallenge("ddr", 11)) mult = mult.mul(3)
            if (hasChallenge("ddr", 12)) mult = mult.mul(5)
            if (hasUpgrade("n", 301)) mult = mult.mul(4)
            if (player.ddrfc.points.gte(3)) mult = mult.mul(25)

            return mult
        }
        if (type == "g"){
            mult = mult.mul(player.ddrm.cEffect)
            if (hasChallenge("ddr", 11)) mult = mult.mul(3)
            if (hasChallenge("ddr", 12)) mult = mult.mul(5)
            if (hasUpgrade("n", 301)) mult = mult.mul(4)
            if (hasMilestone("ddr", 4)) mult = mult.mul(15)
            if (player.ddrfc.points.gte(3)) mult = mult.mul(25)

            return mult
        }
        if (type == "a"){
            mult = mult.mul(player.ddrm.cEffect)
            if (hasUpgrade("ddr", 12)) mult = mult.mul(2)
            if (hasChallenge("ddr", 12)) mult = mult.mul(5)
            if (hasUpgrade("n", 301)) mult = mult.mul(4)
            if (hasUpgrade("s", 31)) mult = mult.mul(15)
            if (player.ddrfc.points.gte(3)) mult = mult.mul(25)

            return mult
        }
        if (type == "c"){
            mult = new Decimal(1)
            if (inChallenge("ddr", 11) ||
            inChallenge("ddr", 12) ||
            inChallenge("ddr", 21) ||
            inChallenge("ddr", 22)) mult = mult.mul(player.MEComboNerf)

            
            if (hasChallenge("ddr", 11)) mult = mult.mul(2.5)
            if (hasUpgrade("n", 301)) mult = mult.mul(4)
            if (hasUpgrade("n", 303)) mult = mult.mul(10)
            if (hasMilestone("s", 10)) mult = mult.mul(player.ddrm.aEffect)
            if (hasUpgrade("s", 31)) mult = mult.mul(15)
            if (player.ddrfc.points.gte(4)) mult = mult.mul("1e10")

            mult = mult.mul(buyableEffect("n", 12))
            mult = mult.mul(buyableEffect("ddr", 32))
            
            let softcap = new Decimal(0.1)
            let softcapStart = new Decimal("1e500")
            if (mult.gte(softcapStart)) mult = mult.pow(softcap).mul(new Decimal(softcapStart).pow(decimalOne.sub(softcap)))

            //specifics
            if (comboArg == "m"){
                if (hasUpgrade("ddr", 31)) mult = mult.mul(3)
            }

            return mult
        }
    },

    arrowClicking_DDRM(column){
        if (getGridData("ddrm", 100 + column) == 1){
            setGridData("ddrm", 100 + column, 0)

            let index = player.ddrm.current.findIndex(x => x[1] == 100 + column)
            player.ddrm.current.splice(index, 1)

            player.ddrm.points = player.ddrm.points.add(1)
            player.ddrm.great = player.ddrm.great.add(tmp.ddrm.findMults_DDRM("g", "g"))
            if (inChallenge("ddr", 31)) player.ddrm.combo = new Decimal(0)
            else if (inChallenge("ddr", 32) && Math.random() < 0.025) player.ddrm.combo = new Decimal(0)
            else player.ddrm.combo = player.ddrm.combo.add(tmp.ddrm.findMults_DDRM("c", "g"))
        } else if (getGridData("ddrm", 200 + column) == 1){
            setGridData("ddrm", 200 + column, 0)

            let index = player.ddrm.current.findIndex(x => x[1] == 200 + column)
            player.ddrm.current.splice(index, 1)

            player.ddrm.points = player.ddrm.points.add(1)
            player.ddrm.marvelous = player.ddrm.marvelous.add(tmp.ddrm.findMults_DDRM("m", "m"))
            if (inChallenge("ddr", 32)) player.ddrm.combo = new Decimal(0)
            else player.ddrm.combo = player.ddrm.combo.add(tmp.ddrm.findMults_DDRM("c", "m"))
        } else if (getGridData("ddrm", 300 + column) == 1){
            setGridData("ddrm", 300 + column, 0)

            let index = player.ddrm.current.findIndex(x => x[1] == 300 + column)
            player.ddrm.current.splice(index, 1)

            player.ddrm.points = player.ddrm.points.add(1)
            player.ddrm.great = player.ddrm.great.add(tmp.ddrm.findMults_DDRM("g", "g"))
            if (inChallenge("ddr", 31)) player.ddrm.combo = new Decimal(0)
            else if (inChallenge("ddr", 32) && Math.random() < 0.025) player.ddrm.combo = new Decimal(0)
            else player.ddrm.combo = player.ddrm.combo.add(tmp.ddrm.findMults_DDRM("c", "g"))
        } else if (getGridData("ddrm", 400 + column) == 1){
            setGridData("ddrm", 400 + column, 0)

            let index = player.ddrm.current.findIndex(x => x[1] == 400 + column)
            player.ddrm.current.splice(index, 1)

            player.ddrm.points = player.ddrm.points.add(1)
            player.ddrm.almost = player.ddrm.almost.add(tmp.ddrm.findMults_DDRM("a", "a"))
            if (inChallenge("ddr", 22) || inChallenge("ddr", 31) || inChallenge("ddr", 32)) player.ddrm.combo = new Decimal(0)
            else if (hasUpgrade("ddr", 31)) player.ddrm.combo = player.ddrm.combo.add(tmp.ddrm.findMults_DDRM("c", "a"))
        } else if (getGridData("ddrm", 500 + column) == 1){
            setGridData("ddrm", 500 + column, 0)

            let index = player.ddrm.current.findIndex(x => x[1] == 500 + column)
            player.ddrm.current.splice(index, 1)

            player.ddrm.points = player.ddrm.points.add(1)
            player.ddrm.almost = player.ddrm.almost.add(tmp.ddrm.findMults_DDRM("a", "a"))
            if (inChallenge("ddr", 22) || inChallenge("ddr", 31) || inChallenge("ddr", 32)) player.ddrm.combo = new Decimal(0)
            else if (hasUpgrade("ddr", 31)) player.ddrm.combo = player.ddrm.combo.add(tmp.ddrm.findMults_DDRM("c", "a"))
        }
    },

    grid: {
        rows: 10, // If these are dynamic make sure to have a max value as well!
        cols: 4,
        getStartData(id) {
            return 0
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            if (id == 201 || id == 202 || id == 203 || id == 204) return true
            return false
        },
        onClick(data, id) { 
                if (id % 100 == 1) tmp.ddrm.arrowClicking_DDRM(1)
                if (id % 100 == 2) tmp.ddrm.arrowClicking_DDRM(2)
                if (id % 100 == 3) tmp.ddrm.arrowClicking_DDRM(3)
                if (id % 100 == 4) tmp.ddrm.arrowClicking_DDRM(4)
        },
        getDisplay(data, id){
            return ""
        },
        getStyle(data, id){
            if (data == 1) {
                //moving arrows
                let value = 0.1
                if (id % 100 == 1){
                    if (id == 201) value += 0.15
                    return {
                    "background": `rgb(199,0,200,${value})`,
                    "background-image": "url('trgt_ddr_mg_arrow_red.png')",
                    "background-size": "contain",
                    "transform": `rotate(0deg)`
                    }
                }

                if (id % 100 == 2){
                    if (id == 202) value += 0.15
                    return {
                    "background": `rgb(199,0,200,${value})`,
                    "background-image": "url('trgt_ddr_mg_arrow_red.png')",
                    "background-size": "contain",
                    "transform": `rotate(270deg)`
                    }
                }

                if (id % 100 == 3){
                    if (id == 203) value += 0.15
                    return {
                    "background": `rgb(199,0,200,${value})`,
                    "background-image": "url('trgt_ddr_mg_arrow_red.png')",
                    "background-size": "contain",
                    "transform": `rotate(90deg)`
                    }
                }

                if (id % 100 == 4){
                    if (id == 204) value += 0.15
                    return {
                    "background": `rgb(199,0,200,${value})`,
                    "background-image": "url('trgt_ddr_mg_arrow_red.png')",
                    "background-size": "contain",
                    "transform": `rotate(180deg)`
                    }
                }
            }

            if (id == 201 || id == 202 || id == 203 || id == 204) {
                let num = 0
                if (id == 201) num = 0
                if (id == 202) num = 270
                if (id == 203) num = 90
                if (id == 204) num = 180

                return {
                    "background": "rgb(199,0,200,0.25)",
                    "background-image": "url('trgt_ddr_mg_arrow_white.png')",
                    "background-size": "contain",
                    "transform": `rotate(${num}deg)`
                }
            }

            if (id % 100 == 1) return {
                "background": "rgb(199,0,200,0.1)",
                "transform": `rotate(0deg)`
            }

            if (id % 100 == 2) return {
                "background": "rgb(199,0,200,0.1)",
                "transform": `rotate(270deg)`
            }

            if (id % 100 == 3) return {
                "background": "rgb(199,0,200,0.1)",
                "transform": `rotate(90deg)`
            }

            if (id % 100 == 4) return {
                "background": "rgb(199,0,200,0.1)",
                "transform": `rotate(180deg)`
            }
        },
    },

    clickables: {
        11: {
            title: "清空DDR面板",
            canClick() {return true},
            onClick() {
                player.ddrm.current = [[1, 1001]]

                let others = [
                    101, 102, 103, 104,
                    201, 202, 203, 204,
                    301, 302, 303, 304,
                    401, 402, 403, 404,
                    501, 502, 503, 504,
                    601, 602, 603, 604,
                    701, 702, 703, 704,
                    801, 802, 803, 804,
                    901, 902, 903, 904,
                    1002, 1003, 1004
                ]

                others.forEach(function(i){
                    setGridData("ddrm", i, "0")
                })
            },
        },
        12: {
            title: "暂停DDR面板",
            canClick() {return true},
            onClick() {
                player.ddrm.paused = !player.ddrm.paused
            },
        },
    },

    update(diff){
        player.ddrm.timer += 1
        player.ddrm.timer = Math.floor(player.ddrm.timer % 12)

        /*
        INFO:
        Each note is described as a two-element array in another array.
        Example: [1, 803]

        The first number determines the color:
        1 is red, meaning on beat.
        2 is blue, meaning on the "off" beat (halfway between beats)
        3 is yellow, meaning on the "e" or "a" beats (quarter of the way between beats)

        The second number determines its current position.
        x0y, where x is the current row (10 is the lowest row, 1 is the highest, and 2 is the step zone)
        */

        if (Math.random() > 0.1 && player.ddrm.timer == 0 && player.ddrm.paused){ //this conditional spawns the notes
            let num = Math.floor(Math.random() * 4) + 1 //chooses column
            let quantize = 1 //initializes color
            player.ddrm.current.push([quantize, 1100 + num]) //pushes the chosen color and column to the array
            
        }

        for (var DDRMC = 0; DDRMC < player.ddrm.current.length; DDRMC++){ //this loop moves the notes
            if (player.ddrm.timer % 3 <= 0.01 && player.ddrm.paused){ //every few
                player.ddrm.current[DDRMC][1] = player.ddrm.current[DDRMC][1] - 100 //shift the note in the array
                setGridData("ddrm", player.ddrm.current[DDRMC][1], player.ddrm.current[DDRMC][0]) //changes the data
                setGridData("ddrm", player.ddrm.current[DDRMC][1] + 100, "0") //removes the data
                if (player.ddrm.current[DDRMC][1] < 0){ //is it out of the play area?
                    player.ddrm.current.shift() //delete it!
                    player.ddrm.miss = player.ddrm.miss.add(1) //add a miss
                    if (hasUpgrade("ddr", 31)) player.ddrm.combo = Decimal.max(player.ddrm.combo.sub(50), new Decimal(0))
                    else player.ddrm.combo = new Decimal(0)
                }
            }
        }

        //automation!
        if (hasMilestone("ddr", 4)) player.ddrm.marvelous = player.ddrm.marvelous.add(tmp.ddrm.findMults_DDRM("m", "m").div(100))
        if (hasMilestone("ddr", 7)) player.ddrm.great = player.ddrm.great.add(tmp.ddrm.findMults_DDRM("g", "g").div(100))
        if (hasMilestone("ddr", 8)) player.ddrm.almost = player.ddrm.almost.add(tmp.ddrm.findMults_DDRM("a", "a").div(100))

        if (player.ddrfc.points.gte(6)) player.ddrm.combo = player.ddrm.combo.add(tmp.ddrm.findMults_DDRM("c", "m").div(100))

        //update the effects
        player.ddrm.mEffect = player.ddrm.marvelous.add(1).pow(0.5).mul(15)
        player.ddrm.gEffect = player.ddrm.great.add(1).pow(0.5).mul(2)
        player.ddrm.aEffect = player.ddrm.almost.add(1).log(100).div(25).add(1)

        if (player.ddrm.marvelous.eq(0)) player.ddrm.mEffect = new Decimal(1)
        if (player.ddrm.great.eq(0)) player.ddrm.gEffect = new Decimal(1)
        if (player.ddrm.almost.eq(0)) player.ddrm.aEffect = new Decimal(1)

        if (hasChallenge("ddr", 12)) {
            player.ddrm.mEffect = player.ddrm.mEffect.mul(50).pow(1.25)
            player.ddrm.gEffect = player.ddrm.gEffect.mul(50).pow(1.25)
            player.ddrm.aEffect = player.ddrm.aEffect.mul(1.1).pow(1.1)
        }

        if (hasMilestone("ddr", 10)) player.ddrm.mEffect = player.ddrm.mEffect.pow(1.15)
        if (hasMilestone("ddr", 11)) player.ddrm.aEffect = player.ddrm.aEffect.mul(1.5)
        if (hasMilestone("ddr", 13)) player.ddrm.aEffect = player.ddrm.aEffect.mul(1.25)

        //combo stuff
        let mult = new Decimal(1)
        if (player.ddrm.combo.gte(player.ddrm.highestCombo)) player.ddrm.highestCombo = player.ddrm.combo
        mult = player.ddrm.highestCombo.add(1).pow(0.15)
        
        if (hasMilestone("ddr", 10)) mult = mult.mul("1e6")

        if (hasMilestone("ddr", 7)) mult = mult.pow(1.75)
        if (hasUpgrade("n", 212)) mult = mult.pow(1.5)
        mult = mult.pow(buyableEffect("ddr", 23))

        player.ddrm.cEffect = mult

        //stream
        player.ddrm.mEffect = player.ddrm.mEffect.div(player.ddr.stream)
        player.ddrm.gEffect = player.ddrm.gEffect.div(player.ddr.stream)
        player.ddrm.aEffect = player.ddrm.aEffect.div(player.ddr.stream)
    },

    tabFormat: [
        "main-display",
        ["infobox", "minigame"],
        ["clickables", [1]],
        "blank",
        ["display-text", function(){return `你已击中 <h2 style="color: #8000FF; text-shadow: 0px 0px 10px #8000FF">${format(player.ddrm.marvelous, 4)}</h2> 个完美箭头，将ME乘以 x${format(player.ddrm.mEffect, 4)}`}],
        ["display-text", function(){return `你已击中 <h2 style="color: #40FF40; text-shadow: 0px 0px 10px #40FF40">${format(player.ddrm.great, 4)}</h2> 个优秀箭头，将音符乘以 x${format(player.ddrm.gEffect, 4)}`}],
        ["display-text", function(){return `你已击中 <h2 style="color: #FF4040; text-shadow: 0px 0px 10px #FF4040">${format(player.ddrm.almost, 4)}</h2> 个勉强箭头，将歌曲乘以 x${format(player.ddrm.aEffect, 4)}`}],
        ["display-text", function(){return `你已错过 <h2 style="color: #B0B0B0; text-shadow: 0px 0px 10px #B0B0B0">${format(player.ddrm.miss, 4)}</h2> 个箭头`}],
        ["blank", "8px"],
        ["display-text", function(){return `你的最高连击是 <h2 style="color: #0080FF; text-shadow: 0px 0px 10px #0080FF">${format(player.ddrm.highestCombo, 4)}</h2> 个箭头，将M、G和A箭头的获取量乘以 x${format(player.ddrm.cEffect, 4)}`}],
        ["display-text", function(){return `你当前的连击是 <h2 style="color: #0080FF; text-shadow: 0px 0px 10px #0080FF">${format(player.ddrm.combo, 4)}</h2> 个箭头`}],
        ["blank", "8px"],
        ["display-text", function(){return "使用方向键或点击白色箭头来击中它们！按 / 暂停DDR。"}],
        "blank",
        "grid"
    ],

    infoboxes: {
        minigame: {
            title: "DDR迷你游戏",
            body() { return "这就是，天花板弹射器——我是说DDR迷你游戏。以下是它的玩法。 " +
                "你可以按第二行箭头（白色）或使用方向键来击中音符。 " +
                "根据你与白色箭头的接近程度，你可以获得完美、优秀或勉强。简称M、G和A。 " +
                "M箭头是通过直接在白色箭头上击中音符获得的，G箭头是在其之前或之后击中获得的， " +
                "而很早击中音符则获得A箭头。 <br><br> 你还有一个连击，用蓝色显示，以及一个最高连击，它有效果。 " +
                "错过箭头不会造成任何影响，并且是通过……什么都不做来获得的。所有这些值都可以相互影响或通过树状功能影响。 " +
                "M和G命中会增加连击，通常增加1但可以增加更多，而A命中不会增加。错过一个箭头会重置你当前的连击。 " +
                "顶部的两个按钮分别用于清空和暂停面板。如果你不玩迷你游戏，请使用它们。" },
            unlocked() {return true},
        },
    },

    layerShown(){
        if (player.ddr.points.gte(1)) player.ddrm.unlocked = true
        return player.ddrm.unlocked
    },
})