# 粒子

粒子是自由漂浮的元素，可以移动并具有多种不同的行为。它们还可以与鼠标交互。

要创建粒子，请使用 `makeParticles(particle, amount)`。`particle` 是一个定义粒子的对象，其特性如下所述。还有 `makeShinies`，它使用不同的默认值并在随机位置创建静止粒子。末尾还列出了一些其他有用的功能。

```js

const myParticle {
    image:"options_wheel.png",
    spread: 20,
    gravity: 2,
    time: 3,
    speed() { // 稍微随机化速度
        return (Math.random() + 1.2) * 8 
    },
    etc...
}
```

特性可以是函数或常量。这些特性会在每个粒子创建时被调用，并带有一个 `id` 参数，该参数根据正在生成的 `amount` 个粒子中的序号分配。**所有这些都是可选的**，都有默认值。

所有距离单位均为像素，角度单位为度，0度表示向上，顺时针方向为正。

- time: 粒子持续的时间，单位为秒。默认值为 3。
- fadeOutTime: 结束时淡出所需的时间（属于总生命周期的一部分），单位为秒。默认值为 1。
- fadeInTime: 淡入所需的时间（属于总生命周期的一部分），单位为秒。默认值为 0。

- image: 粒子应显示的图像。`""` 表示不显示图像。默认是一个通用粒子。
- text: 在粒子上显示文本。可以使用基本的 HTML。
- style: 允许你对粒子应用其他 CSS 样式。
- width, height: 粒子的尺寸。默认值为 35 和 35。
- color: 将图像的颜色设置为该颜色。

- angle: 粒子应朝向的角度。默认值为 0。
- dir: 粒子初始移动的角度，在考虑 spread 之前。默认值为 angle 的值。
- spread: 如果有多个粒子，它们将以 dir 为中心，按此度数分散。默认值为 30。

- rotation: 粒子（视觉）角度应改变的量。默认值为 0。
- speed: 粒子的初始速度。默认值为 15。
- gravity: 粒子向下加速的量。默认值为 0。

- x, y: 粒子的起始坐标。默认在鼠标位置。
- offset: 每个粒子应出现在起点多远的位置。默认值为 10。
- xVel, yVel: 初始根据其他属性设置，然后用于更新移动。

- layer: 当切换标签页时，如果离开 `layer` 标签页，该粒子将被清除。
- 你可以向粒子添加其他特性，但必须自己实现它们的效果。

函数特性：这些保持为函数形式，用于更高级的功能。它们是可选的。

- update(): 每帧调用。允许你通过更改其他属性来实现更高级的视觉和移动行为。
- onClick(), onMouseOver(), onMouseLeave(): 当粒子被交互时调用。


其他不属于粒子对象特性的有用功能：

- setDir(particle, dir), setSpeed(particle, speed): 设置粒子的速度/方向。
- clearParticles(check): 删除粒子的函数。不带 check 参数时，删除所有粒子。Check 是一个接受粒子并返回 true（如果该粒子应被删除）的函数。
- 你可以使用 Vue.delete(particles, this.id) 让粒子删除自身。
- mouseX 和 mouseY 是跟踪鼠标位置的变量。
- sin(x), cos(x), tan(x): 执行这些运算的函数，x 以度为单位（而非弧度）。
- asin(x), acos(x), atan(x): 执行这些运算的函数，返回值以度为单位（而非弧度）。