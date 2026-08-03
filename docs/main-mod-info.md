# mod.js

你可能需要编辑的大部分非层代码和数据都在[mod.js](/js/mod.js)中。
[mod.js](/js/mod.js)中的所有内容都不会因更新而被更改，除了新增内容之外。

以下是其内容的详细说明：

- modInfo 是模组大部分基本配置所在的地方。它包含：
    - name：你的模组名称。（一个字符串）
    - id：你的模组的唯一标识符，一个用于确定存档位置的唯一字符串。开始制作模组时务必设置它，之后不要更改，因为这会清除所有存档。
    - author：作者名称，显示在信息标签页中。
    - pointsName：这将更改主货币显示的内容，而不是“points”。（它不会影响代码中的实际内容。）
    - modFiles：一个文件地址数组，这些文件将为此模组加载。使用较小的文件可以更容易找到你要找的内容。
    
    - discordName、discordLink：如果你有Discord服务器或其他讨论场所，可以添加链接。

        “discordName”是链接上的文本，“discordLink”是邀请的URL。如果你使用Discord邀请链接，请确保将其设置为永不过期。

    - offlineLimit：玩家可以累积的最大离线时间，以小时为单位。任何额外的时间都会丢失。（一个数字）

        这很有用，因为大多数此类模组节奏较快，过多的离线时间会破坏平衡，例如更新之间的时间。这就是为什么我建议开发者在自己的存档上禁用离线时间。

    - initialStartPoints：新玩家开始时应该拥有的点数，为一个Decimal值。

- VERSION 用于描述你的模组的当前版本。它包含：
    - num：模组的版本号，显示在树标签页的右上角。
    - name：版本的名称，与版本号一起显示在信息标签页中。

- changelog 是显示在更新日志标签页中的HTML。如果内容变得特别长，最好将其放在单独的文件中（记得将该文件添加到index.html中）。

- doNotCallTheseFunctionsEveryTick 非常重要，如果你添加了非标准函数。TMT每帧都会调用“layers”中任何位置的每个函数来存储结果，除非特别告知不要这样做。用于执行操作的函数需要被识别。“官方”函数（文档中的那些）都没问题，但如果你创建了任何新函数，请将其名称添加到这个数组中。

```js
// （这里的示例，所有官方函数都已处理）
var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "onPurchase", "blowUpEverything"]
```

- getStartPoints()：一个用于确定玩家在重置后开始时所拥有的点数的函数。（返回一个Decimal值）

- canGenPoints()：一个返回布尔值的函数，用于判断是否应该生成点数。如果你想通过升级来解锁点数生成，可以使用此函数。

- getPointGen()：一个计算你每秒点数的函数。任何影响你点数获取的因素都应纳入此计算中。

- addedPlayerData()：一个返回任何与层无关的数据的函数，这些数据将被添加到存档数据和“player”对象中。

```js
function addedPlayerData() { return {
	weather: "Yes",
	happiness: new Decimal(72),
}}
```

- displayThings：一个函数数组，用于在树标签页顶部显示额外内容。每个函数返回一个字符串，即要显示的一行（支持基本HTML）。如果函数不返回任何内容，则不显示任何内容（且不占用一行）。

- isEndgame()：一个用于判断玩家是否已达到游戏终点的函数，此时会出现“你赢了！”的屏幕。

此后的内容不太重要！

- backgroundStyle：一个CSS对象，包含整个游戏背景的样式。可以是一个函数！

- maxTickLength()：返回最大帧长度，以毫秒为单位。仅当你有一些随时间减少的内容时才有用，因为长帧会破坏这些内容（通常是挑战）。

- fixOldSave()：可用于在加载到游戏新版本时修改存档文件。使用此功能来消除通货膨胀，切勿强制硬重置你的玩家。