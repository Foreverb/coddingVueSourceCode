class Compile {
  constructor(el, vm) {
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
    [...childList].forEach(child=>{
      if( this.isElementType(child) ) {
        //编译元素节点
        this.compileElement(child);
      }else{
        //编译文本节点
        this.compileText(child);
      }
      if( child.childNodes && child.childNodes.length ) {
        this.compile(child)
      }
    })
  }
  //compileElement编译元素节点
  compileElement(node) {
    
  }
  //compileNode编译文本节点
  compileText(node) {

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
  constructor(options){
    this.$el = options.el;
    this.$data = options.data;
    this.$options = options;
    //1. 实现一个指令解析器
    if( this.$el ) {
      new Compile(this.$el, this)
    }
    //2. 实现一个数据监听器
  }
}