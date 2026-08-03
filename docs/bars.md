# 进度条

进度条让你能以更直观的方式展示信息。它可以是进度条、生命条、容量指示器，或任何其他用途。

进度条与其他大型特性（Big Features）的定义方式相同：

```js
bars: {
    bigBar: {
        direction: RIGHT,
        width: 200,
        height: 50,
        progress() { return 0 },
        etc
    },
    etc
}
```

特性：

- direction：UP、DOWN、LEFT 或 RIGHT（注意不是字符串）。决定进度条填充时的方向。RIGHT 表示从左到右。

- width、height：进度条的像素尺寸，以数字形式表示（末尾不带“px”）。

- progress()：一个函数，返回进度条已填充的比例，从 0 表示“空”到 1 表示“满”，会自动更新。
    （如果数值超出此范围也不会产生问题，数值可以是数字或 `Decimal` 类型）

- display()：**可选**。一个函数，返回显示在进度条上方的文本，可以使用 HTML。

- unlocked()：**可选**。一个返回布尔值的函数，用于决定进度条是否可见。默认值为已解锁（unlocked）。

- baseStyle、fillStyle、borderStyle、textStyle：**可选**。以对象形式对进度条的未填充部分、填充部分、边框以及显示文本应用 CSS，其中键为 CSS 属性，值为对应属性的值（均为字符串）。

- layer：**自动分配**。其值与当前层的名称相同，因此你可以使用 `player[this.layer].points` 或类似写法。

- id：**自动分配**。即进度条存储时所使用的“键”，方便访问。示例中进度条的 id 为“bigBar”。

- instant：**非常可选**。如果设为 true，进度条将立即跳转到当前值，而不是在中间进行动画过渡。适用于需要精确计时的场景。