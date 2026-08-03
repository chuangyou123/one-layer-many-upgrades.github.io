# 网格

网格是制作一组相似可点击元素的更简便方式。它们都具有相同的行为，但根据其数据而有所不同。

**注意：网格元素在某些方面与可点击元素相似，但在很多方面与普通的 TMT 大功能有根本区别。请务必牢记以下几点：**
  - 网格元素的 ID 使用 100 进制而非 10 进制，因此一行中可以容纳超过 10 个格子。这意味着网格可能看起来像这样：
    101  102
    201  202
  - 单个网格元素不是单独定义的。所有属性直接放入“grid”对象中。函数调用时会传入网格元素的 ID 及其关联数据作为参数，因此你可以根据这些信息为它们赋予合适的外观和属性。
  - 如果在一个层级中需要两个不相关的网格，你需要使用层级代理组件。

处理网格的常用函数：

- getGridData(layer, id)：获取所选网格元素的数据
- setGridData(layer, id, state)：设置所选网格元素的数据
- gridEffect(layer, id)：获取所选网格元素的效果

网格的格式应如下所示：

```js
grid: {
    rows: 4, // 如果这些是动态的，请确保同时设置最大值！
    cols: 5,
    getStartData(id) {
        return 0
    },
    getUnlocked(id) { // 默认
        return true
    },
    getCanClick(data, id) {
        return true
    },
    onClick(data, id) { 
        player[this.layer].grid[id]++
    },
    getDisplay(data, id) {
        return data 
    },

    等等
}
```

功能特性：

- rows, cols：要显示的网格元素的行数和列数。

- maxRows, maxCols：**有时需要**。如果 rows 或 cols 是动态的，你需要定义可能的最大值（不过你可以在更新游戏时增加它）。这些值不能是动态的。

- getStartData(id)：在此位置创建网格元素的默认数据。这可以是对象或普通值。

- getUnlocked(id)：**可选**。如果此位置的网格元素应可见，则返回 true。

- getTitle(data, id)：**可选**。根据网格元素的位置和数据，返回应显示在顶部较大字体的文本。

- getDisplay(data, id)：**可选**。根据网格元素的位置和数据，返回标题之后应显示在网格元素上的所有内容。

- getStyle(data, id)：**可选**。返回应用于此网格元素的 CSS，形式为对象，其中键为 CSS 属性，值为这些属性的值（均为字符串）。

- getCanClick(data, id)：**可选**。一个返回布尔值的函数，用于根据网格元素的数据和位置确定是否可以点击。如果不存在，则始终可以点击。

- onClick(data, id)：一个根据位置和数据实现点击网格元素功能的函数。

- onHold(data, id)：**可选**。当按钮被按住至少 0.25 秒时，每秒调用 20 次的函数。
                  
- getEffect(data, id)：**可选**。一个根据位置和数据计算并返回网格元素效果的函数。（具体含义取决于网格元素）

- getTooltip(data, id)：**可选**。为网格元素添加工具提示，在悬停时显示。可以使用基本 HTML。默认无工具提示。如果此函数返回空值，也会禁用工具提示。

- layer：**自动分配**。与该层级的名称相同，因此你可以使用 `player[this.layer].points` 或类似操作。