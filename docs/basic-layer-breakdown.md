# 基础层级解析

这是一个相对简洁的层级，功能较少。大多数情况下需要额外功能。

```js
addLayer("p", {
    startData() { return {                  // startData 是一个返回该层级默认数据的函数。
        unlocked: true,                     // 你可以在此添加更多变量以扩展层级。
        points: new Decimal(0),             // "points" 是该层级主要资源的内部名称。
    }},

    color: "#4BDC13",                       // 该层级的颜色，影响多个元素。
    resource: "prestige points",            // 该层级主要飞升资源的名称。
    row: 0,                                 // 该层级所在的行（0 为第一行）。

    baseResource: "points",                 // 飞升收益所基于的资源名称。
    baseAmount() { return player.points },  // 返回当前基础资源数量的函数。

    requires: new Decimal(10),              // 获得 1 个飞升货币所需的基础资源数量。
                                            // 同时也是解锁该层级所需的数量。

    type: "normal",                         // 决定用于计算飞升货币的公式。
    exponent: 0.5,                          // "normal" 类型的飞升收益为（货币^指数）。

    gainMult() {                            // 返回飞升资源收益的倍数。
        return new Decimal(1)               // 在此处加入任何增加收益的加成。
    },
    gainExp() {                             // 返回飞升资源收益的指数。
        return new Decimal(1)
    },

    layerShown() { return true },          // 返回一个布尔值，决定该层级节点是否在树中可见。

    upgrades: {
        // 查看升级文档以了解此处应填写的内容！
    },
})
```