# NULL 与 nullptr

<!-- 原笔记：NULL和nullptr.md -->

NULL
在 C++ 中，NULL 通常被宏定义为整数 0（而在 C 语言中，它可以是 (void*)0）。
在本质上是一个整型，而不是指针。这会导致在函数重载时产生严重的二义性。

nullptr 类型是std::nullptr_t  可以隐式转化为任何类型的指针，但绝对不能转换成整型。

```cpp

void func(int x) {
    cout << "调用了 func(int)" << endl;
}

void func(int* ptr) {
    cout << "调用了 func(int*)" << endl;
}

int main() {
    func(NULL);    // 编译器会调用 func(int)，这通常违背了程序员传递空指针的本意！
    func(nullptr); // 准确无误地调用 func(int*)
    return 0;
}

```
