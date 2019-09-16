class Point {
    constructor(x,y,type){
        this.x=x;
        this.y=y;
        this.type=type;
    }
    getNeighbor(direction){
        switch(direction){
            case 'left':  return new Point(this.x-1,this.y);
            case 'right': return new Point(this.x+1,this.y);
            case 'up':    return new Point(this.x,this.y+1);
            case 'down':  return new Point(this.x,this.y-1);
        }
    }
    toString(){
        return `(${this.x},${this.y})`
    }
    equals(other){
        return this.x === other.x && this.y === other.y;
    }
    isNeighbor(other){
        let result = false;
        if ( other.equals(this.getNeighbor('left'))) result = true;
        else if ( other.equals(this.getNeighbor('right'))) result = true;
        else if ( other.equals(this.getNeighbor('up'))) result = true;
        else if ( other.equals(this.getNeighbor('down'))) result = true;
        return result;
    }
}