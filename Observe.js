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
        this.observe(data[key])
            //通过 Object.definedProperty 方法劫持data属性
        Object.defineProperty(data, key, {
            configurable: false,
            enumerable: true,
            get: () => {
                console.log('触发get方法');
                return value;
            },
            set: (newVal) => {
                console.log('触发set方法');
                this.observe(newVal)
                if (newVal !== value) {
                    value = newVal;
                }
            }
        })
    }
}