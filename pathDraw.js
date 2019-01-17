function PathDraw(opt) {
  BasicDraw.call(this, opt);
}

for (var i in BasicDraw.prototype) {
  PathDraw.prototype[i] = BasicDraw.prototype[i];
}

PathDraw.prototype.createMode = function () {
  this.createPath();
}

PathDraw.prototype.createOtherBtn = function () {
  this.createRemoveBtn();
  this.createUndoBtn();
}

PathDraw.prototype.createRemoveBtn = function () {
  this.removeBtn = document.createElement('div');
  this.operations.appendChild(this.removeBtn);
  this.removeBtn.innerHTML = '删除';
  this.removeBtn.classList.add('removeBtn');
  var _this = this;
  this.removeBtn.onclick = function () {
    _this.svgProduct.removeChild(_this.select);
    this.classList.remove('show');
  }
}

PathDraw.prototype.createUndoBtn = function () {
  this.undoBtn = document.createElement('div');
  this.operations.appendChild(this.undoBtn);
  this.undoBtn.innerHTML = '撤销';
  this.undoBtn.classList.add('undoBtn');
  this.undoBtn.classList.add('show');
  var _this = this;
  this.undoBtn.onclick = function () {
    _this.svgDraw.classList.remove('close');
    if (_this.svgDraw.children.length > 1) {
      if (_this.path.getAttribute('d').slice(-1) === 'Z') {
        _this.path.setAttribute('d', _this.path.getAttribute('d').slice(0, -2))
      }
      _this.path.setAttribute('d', _this.path.getAttribute('d').split(' ').slice(0, -1).join(' '));
      _this.svgDraw.removeChild(_this.svgDraw.children[_this.svgDraw.children.length - 1]);
    }
  }
}

PathDraw.prototype.createPath = function () {
  this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  this.svgDraw.appendChild(this.path);
  this.path.classList.add('path');
  var _this = this;
  this.svgDraw.onmousedown = function (ev) { _this.mousedown(ev); }
  this.svgDraw.oncontextmenu = function (ev) { _this.contextmenu(ev); }
} 

PathDraw.prototype.mousedown = function (ev) {
  var oEvent = ev || window.event;
  if (oEvent.button === 2) { return false }
  if (this.path.getAttribute('d') && this.path.getAttribute('d').slice(-1) === 'Z') { return false }
  var scale = this.style.width / parseInt(getComputedStyle(this.container,false)['width']);
  var x = parseInt(oEvent.offsetX * scale);
  var y = parseInt(oEvent.offsetY * scale);
  this.createBezierG({ x: x, y: y, index: this.svgDraw.children.length - 1 });
  if (!this.path.getAttribute('d')) {
    this.path.setAttribute('d', 'M' + x + ',' + y);
  }
  this.bezier({ x: x, y: y });
  this.createBezierRect({ x: x, y: y });
}

PathDraw.prototype.bezier = function (opt) {
  var _this = this;
  var scale = this.style.width / parseInt(getComputedStyle(this.container,false)['width']);
  var X = opt.x;
  var Y = opt.y;
  var imageX = opt.x - (X - opt.x);
  var imageY = opt.y - (Y - opt.y);

  var isM = this.svgDraw.children.length < 3;
  if (!isM) {
    var last2g = this.svgDraw.children[this.svgDraw.children.length - 2];
    var hideX = last2g.getAttribute('x');
    var hideY = last2g.getAttribute('y');
    var lastX = last2g.getAttribute('locationx');
    var lastY = last2g.getAttribute('locationy');
    var path = this.createBezierPath('M' + lastX + ',' + lastY + ' C' + hideX + ',' + hideY + ',' + imageX + ',' + imageY + ',' + opt.x + ',' + opt.y);
  }

  var line = this.createBezierLine({ x1: X, y1: Y, x2: opt.x, y2: opt.y, type: 'line' });
  var imageLine = this.createBezierLine({ x1: imageX, y1: imageY, x2: opt.x, y2: opt.y, type: 'imageLine' });
  var circle = this.createBezierCircle({ x: X, y: Y, type: 'circle' });
  var imageCircle = this.createBezierCircle({ x: imageX, y: imageY, type: 'imageCircle' });

  window.onmousemove = function (ev) {
    var oEvent = ev || window.event;
    X = parseInt(oEvent.offsetX * scale);
    Y = parseInt(oEvent.offsetY * scale);
    imageX = opt.x - (X - opt.x);
    imageY = opt.y - (Y - opt.y);
    line.setAttribute('x1', X);
    line.setAttribute('y1', Y);
    imageLine.setAttribute('x1', imageX);
    imageLine.setAttribute('y1', imageY);
    circle.setAttribute('cx', X);
    circle.setAttribute('cy', Y);
    imageCircle.setAttribute('cx', imageX);
    imageCircle.setAttribute('cy', imageY);
    if(path) {
      path.setAttribute('d', 'M' + lastX + ',' + lastY + ' C' + hideX + ',' + hideY + ',' + imageX + ',' + imageY + ',' + opt.x + ',' + opt.y)
    }
  }
  window.onmouseup = function () {
    this.onmousemove = null;
    this.onmouseup = null;
    var last1G = _this.svgDraw.children[_this.svgDraw.children.length - 1];
    last1G.setAttribute('x', X);
    last1G.setAttribute('y', Y);
    last1G.setAttribute('imagex', imageX);
    last1G.setAttribute('imagey', imageY);
    last1G.setAttribute('locationx', opt.x);
    last1G.setAttribute('locationy', opt.y);
    if(path) {
      _this.path.setAttribute('d', _this.path.getAttribute('d') + ' C' + hideX + ',' + hideY + ',' + imageX + ',' + imageY + ',' + opt.x + ',' + opt.y);
      path.setAttribute('d', 'M' + lastX + ',' + lastY + ' C' + hideX + ',' + hideY + ',' + imageX + ',' + imageY + ',' + opt.x + ',' + opt.y)
    }
  }
}

PathDraw.prototype.createBezierG = function (data) {
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  this.svgDraw.appendChild(g);
  for (var i in data) { g.setAttribute(i, data[i]); }
}

PathDraw.prototype.createBezierCircle = function (opt) {
  var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  this.svgDraw.children[this.svgDraw.children.length - 1].appendChild(circle);
  var data = {
    cx: opt.x,
    cy: opt.y,
    type: opt.type,
    class: 'b-' + opt.type,
  };
  for (var i in data) { circle.setAttribute(i, data[i]); }
  var _this = this;
  circle.onmousedown = function (ev) {
    var oEvent = ev || window.event;
    oEvent.stopPropagation();
    _this.circleMove(ev, this);
  }
  return circle;
}

PathDraw.prototype.circleMove = function (ev, obj) {
  var _this = this;
  var scale = this.style.width / parseInt(getComputedStyle(this.container,false)['width']);
  var oEvent = ev || window.event;
  var x = parseInt(oEvent.offsetX * scale);
  var y = parseInt(oEvent.offsetY * scale);
  var disX = x - obj.getAttribute('cx');
  var disY = y - obj.getAttribute('cy');
  var X = x - disX;
  var Y = y - disY;
  var index = parseInt(obj.parentNode.getAttribute('index'));
  var isImage = obj.getAttribute('type') !== 'circle';
  if (isImage) { // 镜像点
    var path = obj.parentNode.querySelector('path');
  } else if (obj.parentNode.nextSibling){ // 隐藏点（前个点）
    var path = obj.parentNode.nextSibling.querySelector('path');
  } else { // 点
    var isCircle = true;
  }
  var line = obj.parentNode.querySelector('.b-' + (isImage ? 'imageLine' : 'line'));
  if (!isCircle && !path) {
    var closePath = this.svgDraw.children[this.svgDraw.children.length - 1].querySelector('path');
  }
  window.onmousemove = function (ev) {
    var oEvent = ev || window.event;
    X = parseInt(oEvent.offsetX * scale) - disX;
    Y = parseInt(oEvent.offsetY * scale) - disY;
    obj.setAttribute('cx', X);
    obj.setAttribute('cy', Y);
    if (!isCircle && path) { // 不是点
      var M = path.getAttribute('d').split(' ')[0];
      var data = path.getAttribute('d').split(' ')[1].split(',');
      var pathData = _this.path.getAttribute('d').split(' ');
      if (isImage) { // 镜像点
        var d = ' ' + data.slice(0, 2).join(',') + ',' + X + ',' + Y + ',' + data.slice(4).join(',');
        var lastD = pathData.slice(index + 1).join(' ') ? ' ' + pathData.slice(index + 1).join(' ') : ''
        var pathD = pathData.slice(0, index).join(' ') + d + lastD;
        _this.path.setAttribute('d', pathD);
      } else { // 隐藏点（前个点）
        var d = ' ' + 'C' + X + ',' + Y + ',' + data.slice(2).join(',');
        var lastD = pathData.slice(index + 2).join(' ') ? ' ' + pathData.slice(index + 2).join(' ') : '';
        var pathD = pathData.slice(0, index + 1).join(' ') + d + lastD;
        _this.path.setAttribute('d', pathD);
      }
      path.setAttribute('d', M + d);
    }
    if (isImage) { // 包括起点的镜像点
      obj.parentNode.setAttribute('imagex', X);
      obj.parentNode.setAttribute('imagey', Y);
    } else { // 点
      obj.parentNode.setAttribute('x', X);
      obj.parentNode.setAttribute('y', Y);
    }
    if (closePath) { // 起点镜像点
      var M = closePath.getAttribute('d').split(' ')[0];
      var data = closePath.getAttribute('d').split(' ')[1].split(',');
      var d = ' ' + data.slice(0, 2) + ',' + X + ',' + Y + ',' + data.slice(4);
      closePath.setAttribute('d', M + d);
      var pathData = _this.path.getAttribute('d').split(' ').slice(0, -2).join(' ');
      var pathD = pathData + d + ' Z';
      _this.path.setAttribute('d', pathD);
    }
    line.setAttribute('x1', X);
    line.setAttribute('y1', Y);
  }
  window.onmouseup = function () {
    this.onmousemove = null;
    this.onmouseup = null;
  }
}

PathDraw.prototype.createBezierLine = function (opt) {
  var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  this.svgDraw.children[this.svgDraw.children.length - 1].appendChild(line);
  var data = {
    x1: opt.x1,
    y1: opt.y1,
    x2: opt.x2,
    y2: opt.y2,
    type: opt.type,
    class: 'b-' + opt.type,
  };
  for (var i in data) { line.setAttribute(i, data[i]); }
  return line;
}

PathDraw.prototype.createBezierPath = function (str) {
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  this.svgDraw.children[this.svgDraw.children.length - 1].appendChild(path);
  path.setAttribute('d', str);
  var data = {
    class: 'temp-path'
  }
  for (var i in data) { path.setAttribute(i, data[i]); }
  return path
}

PathDraw.prototype.createBezierRect = function (opt) {
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  this.svgDraw.children[this.svgDraw.children.length - 1].appendChild(rect);
  var data = {
    class: 'rect',
    x: opt.x - 3,
    y: opt.y - 3,
  };
  for (var i in data) { rect.setAttribute(i, data[i]); }
  var _this = this;
  rect.onmousedown = function (ev) {
    var oEvent = ev || window.event;
    oEvent.stopPropagation();
    _this.rectMove(ev, this);
  }
}

PathDraw.prototype.rectMove = function (ev, obj) {
  var _this = this;
  var oEvent = ev || window.event;
  var scale = this.style.width / parseInt(getComputedStyle(this.container,false)['width']);
  var x = parseInt(oEvent.offsetX * scale);
  var y = parseInt(oEvent.offsetY * scale);
  var disX = x - obj.parentNode.getAttribute('locationx');
  var disY = y - obj.parentNode.getAttribute('locationy');
  var X = x - disX;
  var Y = y - disY;
  var path = obj.parentNode.querySelector('path');
  var circle = obj.parentNode.querySelectorAll('circle');
  var line = obj.parentNode.querySelectorAll('line');
  var index = parseInt(obj.parentNode.getAttribute('index'));
  var otherDis = {"0": {}, "1": {}};
  for (var i = 0; i < 2; i++) {
    otherDis[i].x = circle[i].getAttribute('cx') - obj.parentNode.getAttribute('locationx');
    otherDis[i].y = circle[i].getAttribute('cy') - obj.parentNode.getAttribute('locationy');
  }
  var hasNext = obj.parentNode.nextSibling;
  if (hasNext) {
    var nextPath = hasNext.querySelector('path');
  }
  var width = 8; // parseInt(getComputedStyle(obj, false)['width']);
  var height = 8; // parseInt(getComputedStyle(obj, false)['height']);
  if (_this.path.getAttribute('d').slice(-1) === 'Z') {
    var closePath = _this.svgDraw.children[_this.svgDraw.children.length - 1].querySelector('path');
  }
  window.onmousemove = function (ev) {
    var oEvent = ev || window.event;
    X = parseInt(oEvent.offsetX * scale) - disX;
    Y = parseInt(oEvent.offsetY * scale) - disY;
    obj.setAttribute('x', X - width / 2);
    obj.setAttribute('y', Y - height / 2);
    obj.parentNode.setAttribute('locationx', X);
    obj.parentNode.setAttribute('locationy', Y);
    for (var i = 0; i < 2; i++) {
      var cx = X + otherDis[i].x;
      var cy = Y + otherDis[i].y;
      circle[i].setAttribute('cx', cx);
      circle[i].setAttribute('cy', cy);
      line[i].setAttribute('x2', X);
      line[i].setAttribute('y2', Y);
      line[i].setAttribute('x1', cx);
      line[i].setAttribute('y1', cy);
      if(i) {
        obj.parentNode.setAttribute('imagex', cx)
        obj.parentNode.setAttribute('imagey', cy)
      } else {
        obj.parentNode.setAttribute('x', cx)
        obj.parentNode.setAttribute('y', cy)
      }
    }
    if (path) {
      path.setAttribute('d', path.getAttribute('d').split(' ')[0] + ' ' + path.getAttribute('d').split(' ')[1].split(',').slice(0, 2).join(',') + ',' + obj.parentNode.getAttribute('imagex') + ',' + obj.parentNode.getAttribute('imagey') + ',' + X + ',' + Y);
    }
    if (hasNext) {
      nextPath.setAttribute('d', 'M' + X + ',' + Y + ' C' + obj.parentNode.getAttribute('x') + ',' + obj.parentNode.getAttribute('y') + ',' + nextPath.getAttribute('d').split(' ')[1].split(',').slice(2).join(','));
    }
    var pathData = _this.path.getAttribute('d').split(' ');
    if (path) { // 如果不是起点
      var d = ' ' + 'C' + obj.parentNode.previousSibling.getAttribute('x') + ',' + obj.parentNode.previousSibling.getAttribute('y') + ',' + path.getAttribute('d').split(' ')[1].split(',').slice(2);
      d += pathData.slice(index + 1).join(' ') ? ' ' + pathData.slice(index + 1).join(' ') : '';
      var pathD = pathData.slice(0, index).join(' ') + d;
      if (hasNext) {
        d = ' C' + obj.parentNode.getAttribute('x') + ',' + obj.parentNode.getAttribute('y') + ',' + pathD.split(' ')[index + 1].split(',').slice(2).join(',');
        d += pathD.split(' ').slice(index + 2).join(' ') ? ' ' + pathD.split(' ').slice(index + 2).join(' ') : '';
        pathD = pathD.split(' ').slice(0, index + 1).join(' ') + d;
      }
      _this.path.setAttribute('d', pathD);
    } else { // 起点
      var d = '';
      if (pathData.length !== 1) {
        var lastD = pathData.slice(2).join(' ') ? ' ' + pathData.slice(2).join(' ') : '';
        d = ' C'+ obj.parentNode.getAttribute('x') + ',' + obj.parentNode.getAttribute('y') + ',' + pathData[1].split(',').slice(2).join(',') + lastD;
      }
      console.log(pathData, pathData.length)
      if (closePath) { // 如果有终点
        var lastD = obj.parentNode.getAttribute('imagex') + ',' + obj.parentNode.getAttribute('imagey') + ',' + X + ',' + Y;
        closePath.setAttribute('d', closePath.getAttribute('d').split(' ')[0] + ' ' + closePath.getAttribute('d').split(' ')[1].split(',').slice(0, 2).join(',') + ',' + lastD);
        var lastPath = d.split(' ')[d.split(' ').length - 2].split(',');
        d = d.split(' ').slice(0, -2).join(' ') + ' ' + lastPath.slice(0, 2).join(',') + ',' + lastD + ' ' + 'Z';
      }
      _this.path.setAttribute('d', 'M' + X + ',' + Y + d);
    }
  }
  window.onmouseup = function () {
    this.onmousemove = null;
    this.onmouseup = null;
  }
}

PathDraw.prototype.contextmenu = function (ev) {
  var oEvent = ev || window.event;
  oEvent.preventDefault();
  if (this.svgDraw.children.length < 3) { return false }
  var data = this.path.getAttribute('d');
  if (data.slice(-1) === 'Z') { // 第二次点击
    this.addProduct();
    this.clear();
    this.createPath();
  } else { // 第一次点击
    this.closePath();
  }
}

PathDraw.prototype.closePath = function () {
  this.svgDraw.classList.add('close');
  var M = this.svgDraw.children[1];
  var imageX = M.getAttribute('imagex');
  var imageY = M.getAttribute('imagey');
  var locationX = M.getAttribute('locationx');
  var locationY = M.getAttribute('locationy');
  var last2g = this.svgDraw.children[this.svgDraw.children.length - 1];
  var hideX = last2g.getAttribute('x');
  var hideY = last2g.getAttribute('y');
  this.path.setAttribute('d', this.path.getAttribute('d') + ' C' + hideX + ',' + hideY + ',' + imageX + ',' + imageY + ',' + locationX + ',' + locationY);
  this.createBezierG();
  var lastX = last2g.getAttribute('locationx');
  var lastY = last2g.getAttribute('locationy');
  this.createBezierPath('M' + lastX + ',' + lastY + ' C' + hideX + ',' + hideY + ',' + imageX + ',' + imageY + ',' + locationX + ',' + locationY);
  this.path.setAttribute('d', this.path.getAttribute('d') + ' Z');
}

PathDraw.prototype.addProduct = function () {
  var obj = this.svgDraw.children[0];
  this.svgProduct.appendChild(obj);
  var _this = this;
  obj.onclick = function () {
    _this.setSelect(this);
  }
  obj.onmousedown = function (ev) {
    _this.productMove(ev, this);
  }
  this.svgDraw.classList.remove('close');
}

PathDraw.prototype.setSelect = function (obj) {
  if (this.select) { this.select.classList.remove('select'); }
  this.select = obj;
  this.select.classList.add('select');
  this.removeBtn.classList.add('show');
}

PathDraw.prototype.clear = function (opt) {
  this.svgDraw.innerHTML = '';
}

PathDraw.prototype.productMove = function (ev, obj) {
  var oEvent = ev || window.event;
  var scale = this.style.width / parseInt(getComputedStyle(this.container,false)['width']);
  var x = parseInt(oEvent.clientX * scale);
  var y = parseInt(oEvent.clientY * scale);
  var X = 0;
  var Y = 0;
  var _this = this;
  window.onmousemove = function (ev) {
    var oEvent = ev || window.event;
    X = parseInt(oEvent.clientX * scale) - x;
    Y = parseInt(oEvent.clientY * scale) - y;
    obj.setAttribute('transform', 'translate(' + X + ',' + Y + ')');
  }
  window.onmouseup = function () {
    this.onmousemove = null;
    this.onmouseup = null;
    _this.productPositionReset(obj, X, Y);
  }
}

PathDraw.prototype.productPositionReset = function (obj, X, Y) {
  var d = obj.getAttribute('d').split(' ').slice(0, -1);
  var nowD = '';
  for (var i = 0; i < d.length; i++) {
    var values = d[i].substring(1).split(',');
    for (var n = 0; n < values.length; n++) {
      values[n] = parseInt(values[n]);
    }
    nowD += d[i][0] + (values[0] + X) + ',';
    nowD += (values[1] + Y) + ',';
    for (var j = 2; j < values.length; j++) {
      if (j % 2) {
        nowD += (values[j] + Y) + ',';
      } else {
        nowD += (values[j] + X) + ',';
      }
    }
    nowD = nowD.slice(0, -1) + ' ';
  }
  obj.setAttribute('d', nowD + 'Z');
  obj.removeAttribute('transform');
}

PathDraw.prototype.drawClose = function () {
  this.undoBtn.classList.remove('show');
}

PathDraw.prototype.drawOpen = function () {
  this.undoBtn.classList.add('show');
  this.removeBtn.classList.remove('show');
  if (this.select) { this.select.classList.remove('select'); }
}