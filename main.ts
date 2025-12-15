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
function getTranslate(transform: string): number[] {
    transform = transform.slice(10);
    let values: string[] = transform.split(" ");
    return [parseFloat(values[0]), parseInt(values[1])];
}

const xmlns = "http://www.w3.org/2000/svg";

class Display {
    private SVGelement: HTMLElement;
    private toolbox: toolBox;
    private edgeGroup: SVGGElement;
    private guideText: HTMLSpanElement | null = null;
    private draggingNode: node | null = null;
    private selectedNode: node | null = null;
    private nodes: node[] = [];
    constructor(SVGelement: HTMLElement, toolbox: toolBox) {
        this.SVGelement = SVGelement;
        this.toolbox = toolbox;
        //mouse listeners ----------------
        this.SVGelement.onmousedown = () => {
            if (this.draggingNode != null) {
                this.SVGelement.onmousemove = (e) => {
                    this.draggingNode!.translate = [e.clientX, e.clientY];
                }
            }
        }
        this.SVGelement.onmouseup = this.defaultOnMouseUp;
        //mouse listeners end-----------
        //toolbox----------
        if (toolbox.addNode != null) {
            document.getElementById(toolbox.addNode)!.onclick = () => {
                this.addNode();
            }
        }
        if (toolbox.deleteNode != null) {
            document.getElementById(toolbox.deleteNode)!.onclick = () => {
                this.deleteNode();
            }
        } if (toolbox.guide != null) {
            this.guideText = document.getElementById(toolbox.guide) as HTMLSpanElement;
        }
        //toolbox end------
        this.edgeGroup = document.createElementNS(xmlns, "g") as SVGGElement;
        this.SVGelement.appendChild(this.edgeGroup);
        //edge group ----------

    }
    private defaultOnMouseUp = () => {
        this.SVGelement.onmousemove = null;
        if (this.draggingNode != null) {
            this.draggingNode = this.draggingNode.updateEdges();
        }
    }
    public addNode() {
        let val = window.prompt("Enter node value", "0") ?? "0";
        while (!Number(val) && val != "0") {
            val = window.prompt("Enter a valid number", "0") ?? "0";
        }
        let Gtmp = document.createElementNS(xmlns, "g") as SVGGElement;
        this.SVGelement.appendChild(Gtmp);
        let newNode = new node(Gtmp, this.nodes.length, val);
        Gtmp.onmousedown = () => {
            this.draggingNode = newNode;
            this.updateSelection(newNode);
        }
        this.nodes.push(newNode);
    }
    private updateSelection(node: node) {
        if (this.selectedNode != null) {
            this.selectedNode.highColor = "rgb(47, 47, 47)";
        }
        this.selectedNode = node;
        this.selectedNode.highColor = "rgba(17, 255, 0, 1)"//highlight color
    }
    private displayGuide(text: string) {
        if (this.guideText != null) {
            this.guideText.textContent = text;
        }
    }
    public deleteNode() {
        if (this.selectedNode == null) {
            this.displayGuide("No node selected to delete");
        } else {
            if (window.confirm("Do you want to delete the selected node ?")) {
                let id = this.selectedNode.id;
                this.nodes[id].remove();
                delete this.nodes[id];
                for (let i = id + 1; i < this.nodes.length; i++) {
                    this.nodes[i].id -= 1;
                }
                this.nodes.splice(id, 1);
                this.selectedNode = null;
            }
        }
    }
    public addEdge() {
        let start = this.selectedNode;
        if (start == null) {
            this.displayGuide("No start node selected");
            return;
        }
        start.highColor = "rgba(255, 179, 0, 1)";
        this.displayGuide("Select the end node");
        this.SVGelement.onmouseup = () => {
            this.SVGelement.onmousemove = null;
            if (this.draggingNode != null) {
                let end = this.draggingNode;
                let SVGline = document.createElementNS(xmlns, "polyline") as SVGPolylineElement;
                this.edgeGroup.appendChild(SVGline);
                let newEdge = new edge(SVGline, start, end);
                start.addEdge(newEdge);
                end.addEdge(newEdge);
                this.displayGuide("Edge added");
                this.SVGelement.onmouseup = this.defaultOnMouseUp;
            }
            this.draggingNode = null;
        }
    }
}
class toolBox {
    public addNode: string | null = null;
    public deleteNode: string | null = null;
    public guide: string | null = null;
}
class edge {
    private SVGline: SVGPolylineElement;
    private start: node;
    private end: node;
    constructor(SVGline: SVGPolylineElement, start: node, end: node) {
        this.SVGline = SVGline;
        this.start = start;
        this.end = end;
        this.updateEdge();
    }
    public updateEdge() {
        let startPos = this.start.translate;
        let endPos = this.end.translate;
        this.SVGline.setAttribute("points", "" + startPos[0] + "," + startPos[1] + " " + endPos[0] + "," + endPos[1]);
    }
}
class node {
    private SVGCircleNode: SVGCircleElement;
    private SVGgroup: SVGGElement;
    private SVGid: SVGTextElement;
    private edgesList: edge[] = [];
    public id: number;
    public value: number;
    static r: number = 20;

    public constructor(g: SVGGElement, id: number, value: string) {
        this.id = id;
        this.SVGgroup = g;
        this.SVGgroup.id = "n" + id.toString();
        this.SVGCircleNode = document.createElementNS(xmlns, "circle") as SVGCircleElement;
        this.SVGid = document.createElementNS(xmlns, "text") as SVGTextElement;
        this.SVGgroup.appendChild(this.SVGCircleNode);
        this.SVGgroup.appendChild(this.SVGid);
        this.SVGid.textContent = value;
        this.value = Number(value);
        this.SVGgroup.setAttribute("transform", "translate(" + node.r + " " + node.r + ")");
    }
    set translate(values: number[]) {
        this.SVGgroup.setAttribute("transform", "translate(" + values[0] + " " + values[1] + ")");
    }
    public remove() {
        this.SVGgroup.remove();
    }
    set color(color: string) {
        this.SVGCircleNode.style.fill = color;
    }
    set highColor(color: string) {
        this.SVGCircleNode.style.stroke = color;
    }
    get translate(): number[] {
        return getTranslate(this.SVGgroup.getAttribute("transform") ?? "translate(0 0)");
    }
    public addEdge(e: edge) {
        this.edgesList.push(e);
    }
    public updateEdges(): null {
        this.edgesList.forEach(edge => {
            edge.updateEdge();
        });
        return null;
    }
}
var dis = document.getElementById("display");
if (dis == null) {
    throw new Error("Display element not found");
}
var toolbox = new toolBox();
toolbox.addNode = "addnode";
toolbox.deleteNode = "delnode";
toolbox.guide = "guide";
var displayObject = new Display(dis!, toolbox);