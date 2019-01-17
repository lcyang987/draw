function BasicDraw (opt) {
  for (var i in opt) { this[i] = opt[i]; }
  this.init();
}

BasicDraw.prototype.init = function () {
  this.style = {
    width: this.container.children[0].offsetWidth,
    height: this.container.children[0].offsetHeight,
  };
  this.container.classList.add('svgContainer');
  this.createSvgProduct();
  this.createSvgDraw();
  this.createMode(); // 编辑模式
  this.createOperations();
}

BasicDraw.prototype.createSvg = function (name) {
  this[name] = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.container.appendChild(this[name]);
  var data = {
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    class: 'svg ' + name,
    viewBox: '0 0 ' + this.style.width + ' ' + this.style.height,
  };
  for (var i in data) { this[name].setAttribute(i, data[i]); }
}

BasicDraw.prototype.createSvgProduct = function () {
  this.createSvg('svgProduct');
}

BasicDraw.prototype.createSvgDraw = function () {
  this.createSvg('svgDraw');
}

BasicDraw.prototype.createOperations = function () {
  this.operations = document.createElement('div');
  this.container.appendChild(this.operations);
  this.operations.classList.add('operations');
  this.createToggle();
  this.createOtherBtn(); // 其他按钮
}

BasicDraw.prototype.createToggle = function () {
  this.toggle = document.createElement('div');
  this.operations.appendChild(this.toggle)
  this.toggle.classList.add('toggle');
  this.toggle.innerHTML = '关闭画图';
  var _this = this;
  this.toggle.onclick = function () {
    this.hide = !this.hide;
    if (this.hide) {
      _this.svgDraw.classList.add('hide');
      _this.svgProduct.classList.add('show');
      _this.drawClose(); // 额外操作
      this.innerHTML = '开启画图';
    } else {
      _this.svgDraw.classList.remove('hide');
      _this.svgProduct.classList.remove('show');
      _this.drawOpen(); // 额外操作
      this.innerHTML = '关闭画图';
    }
  }
}

BasicDraw.prototype.createMode = function () { logUndefind('编辑模式') }
BasicDraw.prototype.createOtherBtn = function () { logUndefind('其他按钮') }
BasicDraw.prototype.drawClose = function () { logUndefind('关闭画图额外操作') }
BasicDraw.prototype.drawOpen = function () { logUndefind('开启画图额外操作') }

function logUndefind(name) {
  console.warn('没有定义"' + name + '"');
}