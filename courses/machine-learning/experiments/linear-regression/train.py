"""一元线性回归示例：只使用 Python 标准库。"""


def train(steps=2000, learning_rate=0.05):
    x = [-2.0, -1.0, 0.0, 1.0, 2.0]
    y = [2 * value + 1 for value in x]
    w, b = 0.0, 0.0
    history = []
    for step in range(steps):
        errors = [w * xi + b - yi for xi, yi in zip(x, y)]
        loss = sum(error**2 for error in errors) / len(x)
        dw = 2 * sum(error * xi for error, xi in zip(errors, x)) / len(x)
        db = 2 * sum(errors) / len(x)
        w -= learning_rate * dw
        b -= learning_rate * db
        if step % 200 == 0:
            history.append((step, loss))
    return w, b, history


if __name__ == "__main__":
    weight, bias, losses = train()
    for step, loss in losses:
        print(f"step={step:4d}  mse={loss:.8f}")
    print(f"训练结果：w={weight:.6f}, b={bias:.6f}")
    print(f"输入 x=3 时的预测：{weight * 3 + bias:.6f}")
