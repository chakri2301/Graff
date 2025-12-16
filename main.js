"use strict";
/*
var n1 = document.getElementById("n1");
var l1 = document.getElementById("l1");
var dis = document.getElementById("display");
function move(e) {
    n1.cx.baseVal.value = e.clientX;
    n1.cy.baseVal.value = e.clientY;
}
n1.onmousedown = function () {
    dis.onmousemove = move;
}
n1.onmouseup = function () {
    dis.onmousemove = null;
    updatel1();
}
var n2 = document.getElementById("n2");

function move2(e) {
    n2.cx.baseVal.value = e.clientX;
    n2.cy.baseVal.value = e.clientY;
}
n2.onmousedown = function () {
    dis.onmousemove = move2;
}
n2.onmouseup = function () {
    dis.onmousemove = null;
    updatel1();
}
function updatel1() {
    l1.x1.baseVal.value = n1.cx.baseVal.value;
    l1.y1.baseVal.value = n1.cy.baseVal.value;
    l1.x2.baseVal.value = n2.cx.baseVal.value;
    l1.y2.baseVal.value = n2.cy.baseVal.value;

}
*/
function getTranslate(transform) {
    transform = transform.slice(10);
    var values = transform.split(" ");
    return [parseFloat(values[0]), parseInt(values[1])];
}
var xmlns = "http://www.w3.org/2000/svg";
var Display = /** @class */ (function () {
    function Display(SVGelement, toolbox) {
        var _this = this;
        this.guideText = null;
        this.draggingNode = null;
        this.selectedNode = null;
        this.nodes = [];
        this.defaultOnMouseUp = function () {
            _this.SVGelement.onmousemove = null;
            if (_this.draggingNode != null) {
                _this.draggingNode = _this.draggingNode.updateEdges();
            }
        };
        this.SVGelement = SVGelement;
        this.toolbox = toolbox;
        //mouse listeners ----------------
        this.SVGelement.onmousedown = function () {
            if (_this.draggingNode != null) {
                _this.SVGelement.onmousemove = function (e) {
                    _this.draggingNode.translate = [e.clientX, e.clientY];
                };
            }
        };
        this.SVGelement.onmouseup = this.defaultOnMouseUp;
        //mouse listeners end-----------
        //toolbox----------
        if (toolbox.addNode != null) {
            document.getElementById(toolbox.addNode).onclick = function () {
                _this.addNode();
            };
        }
        if (toolbox.deleteNode != null) {
            document.getElementById(toolbox.deleteNode).onclick = function () {
                _this.deleteNode();
            };
        }
        if (toolbox.guide != null) {
            this.guideText = document.getElementById(toolbox.guide);
        }
        //toolbox end------
        this.edgeGroup = document.createElementNS(xmlns, "g");
        this.SVGelement.appendChild(this.edgeGroup);
        //edge group ----------
    }
    Display.prototype.addNode = function () {
        var _this = this;
        var _a, _b;
        var val = (_a = window.prompt("Enter node value", "0")) !== null && _a !== void 0 ? _a : "0";
        while (!Number(val) && val != "0") {
            val = (_b = window.prompt("Enter a valid number", "0")) !== null && _b !== void 0 ? _b : "0";
        }
        var Gtmp = document.createElementNS(xmlns, "g");
        this.SVGelement.appendChild(Gtmp);
        var newNode = new node(Gtmp, this.nodes.length, val);
        Gtmp.onmousedown = function () {
            _this.draggingNode = newNode;
            _this.updateSelection(newNode);
        };
        this.nodes.push(newNode);
    };
    Display.prototype.updateSelection = function (node) {
        if (this.selectedNode != null) {
            this.selectedNode.highColor = "rgb(47, 47, 47)";
        }
        this.selectedNode = node;
        this.selectedNode.highColor = "rgba(17, 255, 0, 1)"; //highlight color
    };
    Display.prototype.displayGuide = function (text) {
        if (this.guideText != null) {
            this.guideText.textContent = text;
        }
    };
    Display.prototype.deleteNode = function () {
        if (this.selectedNode == null) {
            this.displayGuide("No node selected to delete");
        }
        else {
            if (window.confirm("Do you want to delete the selected node ?")) {
                var id = this.selectedNode.id;
                this.nodes[id].remove();
                delete this.nodes[id];
                for (var i = id + 1; i < this.nodes.length; i++) {
                    this.nodes[i].id -= 1;
                }
                this.nodes.splice(id, 1);
                this.selectedNode = null;
            }
        }
    };
    Display.prototype.addEdge = function () {
        var _this = this;
        var start = this.selectedNode;
        if (start == null) {
            this.displayGuide("No start node selected");
            return;
        }
        start.highColor = "rgba(255, 179, 0, 1)";
        this.displayGuide("Select the end node");
        this.SVGelement.onmouseup = function () {
            _this.SVGelement.onmousemove = null;
            if (_this.draggingNode != null) {
                var end = _this.draggingNode;
                var SVGline = document.createElementNS(xmlns, "polyline");
                _this.edgeGroup.appendChild(SVGline);
                var newEdge = new edge(SVGline, start, end);
                start.addEdge(newEdge);
                end.addEdge(newEdge);
                _this.displayGuide("Edge added");
                _this.SVGelement.onmouseup = _this.defaultOnMouseUp;
            }
            _this.draggingNode = null;
        };
    };
    return Display;
}());
var toolBox = /** @class */ (function () {
    function toolBox() {
        this.addNode = null;
        this.deleteNode = null;
        this.guide = null;
    }
    return toolBox;
}());
var edge = /** @class */ (function () {
    function edge(SVGline, start, end) {
        this.SVGline = SVGline;
        this.start = start;
        this.end = end;
        this.updateEdge();
    }
    edge.prototype.updateEdge = function () {
        var startPos = this.start.translate;
        var endPos = this.end.translate;
        this.SVGline.setAttribute("points", "" + startPos[0] + "," + startPos[1] + " " + endPos[0] + "," + endPos[1]);
    };
    return edge;
}());
var node = /** @class */ (function () {
    function node(g, id, value) {
        this.edgesList = [];
        this.id = id;
        this.SVGgroup = g;
        this.SVGgroup.id = "n" + id.toString();
        this.SVGCircleNode = document.createElementNS(xmlns, "circle");
        this.SVGid = document.createElementNS(xmlns, "text");
        this.SVGgroup.appendChild(this.SVGCircleNode);
        this.SVGgroup.appendChild(this.SVGid);
        this.SVGid.textContent = value;
        this.value = Number(value);
        this.SVGgroup.setAttribute("transform", "translate(" + node.r + " " + node.r + ")");
    }
    Object.defineProperty(node.prototype, "translate", {
        get: function () {
            var _a;
            return getTranslate((_a = this.SVGgroup.getAttribute("transform")) !== null && _a !== void 0 ? _a : "translate(0 0)");
        },
        set: function (values) {
            this.SVGgroup.setAttribute("transform", "translate(" + values[0] + " " + values[1] + ")");
        },
        enumerable: false,
        configurable: true
    });
    node.prototype.remove = function () {
        this.SVGgroup.remove();
    };
    Object.defineProperty(node.prototype, "color", {
        set: function (color) {
            this.SVGCircleNode.style.fill = color;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(node.prototype, "highColor", {
        set: function (color) {
            this.SVGCircleNode.style.stroke = color;
        },
        enumerable: false,
        configurable: true
    });
    node.prototype.addEdge = function (e) {
        this.edgesList.push(e);
    };
    node.prototype.updateEdges = function () {
        this.edgesList.forEach(function (edge) {
            edge.updateEdge();
        });
        return null;
    };
    node.r = 20;
    return node;
}());
var dis = document.getElementById("display");
if (dis == null) {
    throw new Error("Display element not found");
}
var toolbox = new toolBox();
toolbox.addNode = "addnode";
toolbox.deleteNode = "delnode";
toolbox.guide = "guide";
var displayObject = new Display(dis, toolbox);
