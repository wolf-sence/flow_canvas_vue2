export default {
    name: 'edge',
    props: ['end'], // start: 锚点anchor
    block: false,
    link: false,
    data: {
        start: {
            x: 120,
            y: 120,
            width: 160,
            height: 40,
        }
    },
    draw() {
        this.drawShape();
        if (this.isSelected) {
            this.createPath();
            let ctx = this.ctx,
                output = this.$parent.output;
            ctx.lineWidth = 8;
            ctx.strokeStyle = 'rgba(138, 209, 255, 0.3)';
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.strokeStyle = output.color;
            ctx.stroke();
        }
    },
    isHere(x, y) {
        let ctx = this.ctx;
        this.createPath();
        for (let i = -3; i <= 3; i++) {
            if (ctx.isPointInStroke(x + i, y)) {
                return true;
            }
            if (ctx.isPointInStroke(x, y + i)) {
                return true;
            }
        }
        return false;
    },
    computed: {
        path() {
            this.start = this.$parent.bounds;
            let x = this.start.x+this.start.width/2,
                y = this.start.y+this.start.height;
            if (this.end.width) {
                let path = this.getToNodePath(x, y, this.start, this.end);
                return path;
            } else {
                let path = this.getToPointPath(x, y, this.end.x, this.end.y, this.start);
                return path;
            }
        }
    },
    methods: { 
        drawShape() {
            this.createPath();
            let ctx = this.ctx,
                output = this.$parent.output;
            ctx.lineWidth = 2;
            ctx.strokeStyle = output.color;
            ctx.stroke();
            this.createArrowPath();
            ctx.fillStyle = output.color;
            ctx.fill();
        },
        createPath() {
            let ctx = this.ctx,
                path = this.path;
            if (!path || path.length < 2) {
                return;
            }

            let px = 0, 
                py = 0;
            let start = path[0];
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            for (let i = 1, item; i < path.length; i++) {
                item = path[i];
                let x = px + item.x, y = item.y + py;
                let temp1 = path[i - 1];
                let x1 = px + temp1.x, y1 = py + temp1.y;
                let temp2 = path[i + 1];
                if (temp2) {
                    let x2 = px + temp2.x, y2 = py + temp2.y;
                    let radius = 6;
                    if (x != x1 && Math.abs(x - x1) < 12) {
                        radius = Math.abs(x - x1) / 2
                    } else if (y != y1 && Math.abs(y - y1) < 12) {
                        radius = Math.abs(y - y1) / 2
                    } else if (x != x2 && Math.abs(x - x2) < 12) {
                        radius = Math.abs(x - x2) / 2
                    } else if (y != y2 && Math.abs(y - y2) < 12) {
                        radius = Math.abs(y - y2) / 2
                    }
                    if (y > y1) {
                        y - radius > y1 && ctx.lineTo(x, y - radius);
                    } else if (y < y1) {
                        y + radius < y1 && ctx.lineTo(x, y + radius);
                    } else if (x > x1) {
                        x - radius > x1 && ctx.lineTo(x - radius, y);
                    } else if (x > x1) {
                        x + radius < x1 && ctx.lineTo(x + radius, y);
                    }
                    ctx.arcTo(x, y, x2, y2, radius);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        },
        createArrowPath() {
            let ctx = this.ctx,
                path = this.path;
            if (!path || path < 2) {
                return;
            }
            let px = 0, 
                py = 0;
            ctx.beginPath();
            let temp1 = path[path.length - 2],
                x1 = temp1.x + px, y1 = temp1.y + py,
                temp2 = path[path.length - 1],
                x2 = temp2.x + px, y2 = temp2.y + py;
            if (x2 == x1 && y2 > y1) {
                ctx.moveTo(x2 - 5, y2 - 10);
                ctx.lineTo(x2 + 5, y2 - 10);
                ctx.lineTo(x2, y2 + 3);
                ctx.closePath();
            } else if (x2 == x1 && y2 < y1) {
                ctx.moveTo(x2 - 5, y2 + 10);
                ctx.lineTo(x2 + 5, y2 + 10);
                ctx.lineTo(x2, y2 - 3);
                ctx.closePath();
            } else if (y2 == y1 && x2 > x1) {
                ctx.moveTo(x2 - 10, y2 + 5);
                ctx.lineTo(x2 - 10, y2 - 5);
                ctx.lineTo(x2 + 3, y2);
                ctx.closePath();
            } else if (y2 == y1 && x2 < x1) {
                ctx.moveTo(x2 + 10, y2 + 5);
                ctx.lineTo(x2 + 10, y2 - 5);
                ctx.lineTo(x2 - 3, y2);
                ctx.closePath();
            } else {
                ctx.moveTo(x2 - 5, y2 - 10);
                ctx.lineTo(x2 + 5, y2 - 10);
                ctx.lineTo(x2, y2 + 3);
                ctx.closePath();
            }
        },
        isIncluded(x1, y1, x2, y2) {
            if (x1 > x2) {
                let temp = x1;
                x1 = x2;
                x2 = temp;
            }
            if (y1 > y2) {
                let temp = y1;
                y1 = y2;
                y2 = temp;
            }

            let path = this.path;
            for (let i = 0, item; i < path.length; i++) {
                item = path[i];
                if (item.x < x1 || item.x > x2 || item.y < y1 || item.y > y2) {
                    return false;
                }
            }
            return true;
        },
        getToNodePath(x1, y1, sBounds, eBounds) {
            let x2 = eBounds.x + parseInt(eBounds.width / 2),
                y2 = eBounds.y,
                mx = (x1 + x2) / 2,
                my = (y1 + y2) / 2;

            let path = [];
            path.push({ x: x1, y: y1 });
            if (y2 > y1 + 15) {
                path.push({ x: x1, y: my });
                path.push({ x: x2, y: my });
            } else {
                let left1 = sBounds.x,
                    right1 = sBounds.x + sBounds.width,
                    left2 = eBounds.x,
                    right2 = eBounds.x + eBounds.width;
                if (left1 > right2) {
                    mx = (left1 + right2) / 2;
                } else if (right1 < left2) {
                    mx = (right1 + left2) / 2;
                } else if (mx > left1 && mx < right1) {
                    if (Math.abs(x1 - left1) > Math.abs(x1 - right1) - 5) {
                        mx = right1 + 10;
                    } else {
                        mx = left1 - 10;
                    }
                }
                path.push({ x: x1, y: y1 + 15 });
                path.push({ x: mx, y: y1 + 15 });
                path.push({ x: mx, y: y2 - 15 });
                path.push({ x: x2, y: y2 - 15 });
            }
            path.push({ x: x2, y: y2 });
            return path;
        },
        getToPointPath(x1, y1, x2, y2, sBounds) {
            let path = [];
            path.push({ x: x1, y: y1 });
            if (y2 < y1 + 15) {
                path.push({ x: x1, y: y1 + 15 });
                if (x2 < x1 + sBounds.width / 2 + 15 && x2 > sBounds.x - 15) {
                    if (x2 > x1) {
                        path.push({ x: x1 + sBounds.width / 2 + 15, y: y1 + 15 });
                        path.push({ x: x1 + sBounds.width / 2 + 15, y: y2 });
                    } else {
                        path.push({ x: sBounds.x - 15, y: y1 + 15 });
                        path.push({ x: sBounds.x - 15, y: y2 });
                    }
                } else {
                    path.push({ x: x2, y: y1 + 15 });
                }
            } else {
                path.push({ x: x1, y: y2 });
            }
            path.push({ x: x2, y: y2 });
            return path;
        }
    }
}