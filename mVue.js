//编译指令
const compileUtil = {
    getVal(expr, vm) {
        return [...expr.split('.')].reduce((returnVal, currenValue) => {
            return returnVal[currenValue]
        }, vm.$data)
    },
    text(node, expr, vm) {
        let value;
        if (expr.indexOf('{{') !== -1) {
            value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                return this.getVal(args[1], vm)
            })
        } else {
            value = this.getVal(expr, vm);
        }
        this.updater.textUpdater(node, value);
    },
    html(node, expr, vm) {
        let value = this.getVal(expr, vm);
        //创建观察者
        new Watcher(vm, expr, (newVal) => this.updater.htmlUpdater(node, newVal))
        this.updater.htmlUpdater(node, value);
    },
    model(node, expr, vm) {
        let value = this.getVal(expr, vm);
        //创建观察者
        new Watcher(vm, expr, (newVal) => this.updater.modelUpdater(node, newVal))
        this.updater.modelUpdater(node, value);
    },
    on(node, expr, vm, eventName) {
        const func = vm.$options.methods && vm.$options.methods[expr];
        node.addEventListener(eventName, func.bind(vm), false)
    },
    //数据驱动视图，更新视图
    updater: {
        textUpdater(node, val) {
            node.textContent = val;
        },
        htmlUpdater(node, val) {
            node.innerHTML = val;
        },
        modelUpdater(node, val) {
            node.value = val;
        },
    }
}
class Compile {
    constructor(el, vm) {
        this.vm = vm;
        this.el = this.isElementType(el) ? el : document.querySelector(el);
        //1. 将所有节点插入到文档碎片中（使用文档碎片可以减少重绘重排，提升性能）
        const fragment = this.nodeFragment(this.el);
        //2. 指令解析
        this.compile(fragment)

        //3. 将文档碎片挂载到根元素里面
        this.el.appendChild(fragment)
    }
    compile(fragment) {
        let childList = fragment.childNodes;
        [...childList].forEach(child => {
            if (this.isElementType(child)) {
                //编译元素节点
                this.compileElement(child);
            } else {
                //编译文本节点
                this.compileText(child);
            }
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        })
    }
    //compileElement编译元素节点
    compileElement(node) {
        const childAttr = node.attributes;
        [...childAttr].forEach(attr => {
            const { name, value } = attr;
            if (this.isDirective(name)) {
                const [, directive] = name.split('-');
                const [directiveName, eventName] = directive.split(':');
                //更新视图，数据驱动视图
                compileUtil[directiveName](node, value, this.vm, eventName);
                //移除行间指令
                node.removeAttribute(`v-${directiveName}`);
                eventName && node.removeAttribute(`v-${directiveName}:${eventName}`)
            } else if (this.isEventName(name)) {
                //编译@指令
                const [, eventName] = name.split('@');
                compileUtil['on'](node, value, this.vm, eventName)
                eventName && node.removeAttribute(`@${eventName}`)
            }
        })
    }
    //compileNode编译文本节点
    compileText(node) {
        // {{}} 
        const content = node.textContent;
        if (/\{\{.+?\}\}/.test(content)) {
            compileUtil['text'](node, content, this.vm)
        }
    }
    //判断是否是通过@绑定事件
    isEventName(attr) {
        return attr.startsWith('@');
    }
    //判断是否为指令
    isDirective(attr) {
        return attr.startsWith('v-');
    }
    //创建文档碎片s
    nodeFragment(el) {
        const f = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            f.appendChild(firstChild);
        }
        return f;
    }
    //判断元素是否是元素节点
    isElementType(node) {
        return node.nodeType === 1
    }
}
class mVue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        //顺序不能变
        //1. 实现一个数据监听器
        new Observe(this.$data)
        //2. 实现一个指令解析器
        if (this.$el) {
            new Compile(this.$el, this)
        }
    }
}