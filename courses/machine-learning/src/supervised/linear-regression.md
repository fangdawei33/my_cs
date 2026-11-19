# 2.1 模型与损失函数

> 📖 先用一个特征理解整个训练过程，再推广到多个特征。

## 模型：一条可以调整的直线

对于一个输入特征，线性回归的预测写作：

\\[ \hat{y}_i = w x_i + b \\]

`w` 是斜率，`b` 是截距；训练的目标是根据数据找到合适的参数。模型名称中的“线性”主要指模型对待学习参数的线性关系。

## 损失：均方误差

把每个样本的预测误差平方，再取平均：

\\[ L(w,b) = \frac{1}{n}\sum_{i=1}^{n}(w x_i+b-y_i)^2 \\]

平方能避免正负误差互相抵消，也会让较大的偏差受到更大的惩罚。均方误差适合许多回归问题，但并不是所有问题都应使用它。

## 优化：根据梯度调整参数

这里采用没有额外乘以 `1/2` 的均方误差定义，因此梯度包含系数 `2`：

\\[ \frac{\partial L}{\partial w}=\frac{2}{n}\sum_{i=1}^{n}(w x_i+b-y_i)x_i \\]

\\[ \frac{\partial L}{\partial b}=\frac{2}{n}\sum_{i=1}^{n}(w x_i+b-y_i) \\]

每次更新都沿着梯度的反方向移动一小步：

```python
predictions = [w * xi + b for xi in x]
errors = [prediction - yi for prediction, yi in zip(predictions, y)]
dw = 2 * sum(error * xi for error, xi in zip(errors, x)) / len(x)
db = 2 * sum(errors) / len(x)
w -= learning_rate * dw
b -= learning_rate * db
```

学习率过大可能导致损失震荡甚至发散；过小则会让训练变慢。不同特征的尺度也会影响优化过程。

## 用实验验证

[配套实验](../practice.md)提供一个只依赖 Python 标准库的版本。数据严格满足 `y = 2x + 1`，便于检查实现是否能恢复已知参数。

这只能验证一个简单实现是否符合预期，不能替代在真实数据上的训练、验证和测试。

## 继续思考

- 为什么均方误差的梯度里有 `2`？
- 如果把所有输入扩大 100 倍，原来的学习率还合适吗？
- 如果数据带有噪声，损失还能降到 0 吗？
