class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    //旧值
    this.oldVal = this.getOldVal()
  }
  //获取旧值
  getOldVal() {
    Dep.target = this;
    const oldVal = compileUtil.getVal(this.expr, this.vm);
    Dep.target = null;
    return oldVal;
  }
  //触发视图更新
  update() {
    const newVal = compileUtil.getVal(this.expr, this.vm);
    if( newVal !== this.oldVal ) {
      //将新值传出，更新视图
      this.cb(newVal);
    }
  }
}
class Dep {
  constructor() {
    this.subs = [];
  }
  // 1. 添加/收集观察者
  addSubs(watcher) {
    this.subs.push(watcher);
  }
  // 2. 通知观察者，去更新
  notify() {
    console.log('通知watcher更新视图');
    this.subs.forEach(w => w.update());
  }
}
class Observe {
  constructor(data) {
    //劫持监听data
    this.observe(data);
  }
  observe(data) {
    //只针对对象
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        //劫持监听第一层data属性
        this.observeReactnative(data, key, data[key])
      })
    }
  }
  observeReactnative(data, key, value) {
    //递归遍历  劫持监听data所有属性
    this.observe(data[key]);
    const dep = new Dep();
    //通过 Object.definedProperty 方法劫持data属性
    Object.defineProperty(data, key, {
      configurable: false,
      enumerable: true,
      get: () => {
        //定义数据变化时，往dep中添加观察者
        Dep.target && dep.addSubs(Dep.target);
        return value;
      },
      set: (newVal) => {
        this.observe(newVal)
        if (newVal !== value) {
          value = newVal;
          dep.notify()
        }
      }
    })
  }
} 