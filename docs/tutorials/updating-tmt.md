# 更新Modding Tree

本教程假设您已经使用了[入门教程](getting-started.md)，并且正在使用Github Desktop和VSCode来开发您的模组。

当TMT有更新时，您需要做以下操作：

1. 查看更新日志。它会提醒您更新是否会破坏任何内容或需要做出更改。决定是否尝试更新。

2. 打开Github Desktop，在顶部中间点击“fetch origin”。这将使Github Desktop获取更新的信息。

3. 在顶部中间点击显示“current branch: master”的位置，在出现的窗口底部，点击“choose a branch to merge into master”。

4. 选择upstream/master。它可能会提示存在冲突，但您有工具来解决它们。点击“Merge upstream/master into master”。

5. 当您尝试合并的内容在同一位置都有更改时，就会发生冲突。点击第一个文件旁边的“open in Visual Studio Code”。

6. 向下滚动文件，查找以红色和绿色高亮显示的部分。其中一个是您的代码，另一个是更新将修改的代码。尽力编辑，以保留更新后的更改，同时保留您的内容。

7. 对所有剩余的更改继续执行此操作。

8. 执行更新要求的任何其他更改，运行游戏，修复问题等。