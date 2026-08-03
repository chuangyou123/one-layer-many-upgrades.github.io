# 可购买项

可购买项通常是指可以多次购买且成本递增的物品。它们带有可选按钮，可用于重置或出售可购买项等操作。

拥有的可购买项数量是一个 `Decimal` 类型。

处理可购买项及实现其效果的有用函数：

- getBuyableAmount(layer, id)：获取玩家拥有的可购买项数量
- addBuyables(layer, id, amount)：增加可购买项的数量
- setBuyableAmount(layer, id, amount)：设置玩家拥有的可购买项数量
- buyableEffect(layer, id)：返回该可购买项的当前效果（如果有）。

可购买项的格式应如下所示：

```js
buyables: {
    11: {
        cost(x) { return new Decimal(1).mul(x) },
        display() { return "Blah" },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        etc
    },
    etc
}
```

功能特性：

- title：**可选**。显示在顶部，字体较大。也可以是一个返回动态文本的函数。

- cost()：购买下一个可购买项的成本。可以有一个可选参数 "x" 来计算第 x+1 次购买的成本（x 是一个 `Decimal`）。
    如果有多种货币，可以返回一个对象。
                    
- effect()：**可选**。一个计算并返回该可购买项当前加成值的函数。可以有一个可选参数 "x" 来计算拥有 x 个该可购买项时的效果。
    可以返回一个值或包含多个值的对象。

- display()：一个返回在标题之后应显示在可购买项上的所有内容的函数，通常包括描述、已购买数量、成本和当前效果。可以使用基本 HTML。

- unlocked()：**可选**。一个返回布尔值的函数，用于确定可购买项是否可见。默认为已解锁。

- canAfford()：一个返回布尔值的函数，用于确定你是否能购买一个该可购买项。

- buy()：一个实现购买一个该可购买项的函数，包括花费货币。

- buyMax()：**可选**。一个实现尽可能多地购买该可购买项的函数。

- style：**可选**。以对象形式向此可购买项应用 CSS，其中键为 CSS 属性，值为这些属性的值（均为字符串）。
        
- purchaseLimit：**可选**。可购买项可购买数量的上限。默认为无限制。

- marked：**可选**。在可购买项角落添加标记。如果为 "true" 则为星形，但也可以是图片 URL。

- tooltip：**可选**。为此可购买项添加工具提示，悬停时显示。可以使用基本 HTML。默认为无工具提示。如果此函数返回空值，也会禁用工具提示。

- layer：**自动分配**。与该层名称相同，因此你可以使用 `player[this.layer].points` 或类似操作。

- id：**自动分配**。它是可购买项存储时使用的 "键"，便于访问。示例中可购买项的 id 为 11。

出售一个/出售全部：

包含 `sellOne` 或 `sellAll` 函数将在可购买项下方显示一个额外按钮。它们在功能上相同，但 "出售一个" 显示在 "出售全部" 上方。你也可以将它们用于其他用途。

- sellOne/sellAll()：**可选**。按下按钮时调用。标准用途是减少/重置可购买项的数量，并可能向玩家返还一些货币。

- canSellOne/canSellAll()：**可选**。决定是否显示按钮的布尔值。如果 "canSellOne/All" 不存在但 "sellOne/All" 存在，则相应按钮将始终显示。


要添加重置按钮或类似功能，请在主 buyables 对象中添加 respecBuyables 函数（而不是单个可购买项）。
你可以结合使用以下功能：

- respec()：**可选**。按下按钮时调用（在可切换的确认消息之后）。

- respecText：**可选**。重置按钮上显示的文本。

- showRespec()：**可选**。如果定义了 respecBuyables，则此函数决定是否显示按钮。如果不存在，默认为 true。

- respecMessage：**可选**。重置时的自定义确认消息，替代默认消息。



- branches：**可选**，主要用于可购买项树。一个可购买项 id 的数组。将从该可购买项到列表中的所有可购买项绘制一条连线。或者，数组中的条目可以是一个由可购买项 id 和颜色值组成的双元素数组。颜色值可以是十六进制颜色代码字符串，也可以是 1-3 的数字（受主题影响的颜色）。数组中的第三个元素可选地指定线宽。