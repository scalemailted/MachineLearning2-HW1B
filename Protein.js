//let protein = data.proteins[0];

class Protein{
    constructor(sequence){
        this.sequence = sequence;
        this.occupied = [];
        this.invalid = [];
        this.path = [];
        this.fold();
        this.calculate_fitness();
    }
    shuffle = (array) => array.sort(() => Math.random() - 0.5);
    isOccupied = (point) => this.occupied.some( (e) => e.equals(point)  )
    isInvalid = (point) => this.invalid.some( (e) => e.equals(point)  )

    walk(index, checked=null){
        let origin = this.occupied[index];
        let unchecked = this.shuffle( ['left', 'right', 'up', 'down'] );
        if (checked) unchecked.unshift(checked);
        while (unchecked.length > 0){
            let direction = unchecked.shift();
            let nextPoint = origin.getNeighbor(direction);
            if ( this.isOccupied(nextPoint) === false && this.isInvalid(nextPoint) === false){
                this.path.push(direction);
                return nextPoint;
            }
        } 
        return null;
    }

    fold(){
        let sequence = this.sequence;
        this.occupied.push( new Point(0,0, sequence[0]) );
        let index = 0;
        while (index < sequence.length-1){
            let next_step = this.walk(index);
            if (next_step === null){
                index--;
                let deadend = this.occupied.pop();
                this.invalid.push(deadend);
                this.path.pop();
            }
            else{
                index++;
                next_step.type = sequence[index];
                this.occupied.push(next_step);
            }
        }
    }

    show( div='plot-protein' ){
        let sequence = this.sequence;
        let colors = sequence.map( e => { return (e==='p')?'rgba(255,0,0,1)':'rgba(0,255,0,1)' } )    
        
        let trace = {
            x: this.occupied.map( e => e.x ),
            y: this.occupied.map( e => e.y ),
            mode: 'lines+markers',
            marker: {color:colors, size: 10}
            //marker: {color:['rgba(255,0,0,1)']}
        };
        
        let data = [ trace ];
    
        let layout = {  
            xaxis:{
                zeroline:false,
                showticklabels:false,
            },
            yaxis:{
                zeroline:false,
                showticklabels:false,
            },
            legend:{
    
            }
        };
        //Plotly.newPlot('plot-protein', data, layout);
        return trace;
    }

    calculate_fitness(){
        let count = 0;
        let sequence = this.sequence;
        //get all H indexes
        const hIndexes = sequence.flatMap((amino, i) => amino === 'h' ? i : []);
        //Next go through hIndexes and check for adjancies and see if neighbor, then make sure its not connected
        for (let i=0;i<hIndexes.length; i++){
            let this_h = hIndexes[i];
            //console.log(hydrophobe)
            for (let j=0; j<hIndexes.length; j++){
                let other_h = hIndexes[j];
                if ( Math.abs(other_h - this_h) > 1){
                    //console.log(`Pair: ${this_h}, ${other_h}`);
                    //check neighbors
                    let hydrophobe1 = this.occupied[this_h];
                    let hydrophobe2 = this.occupied[other_h];
                    if (hydrophobe1 === undefined || hydrophobe2 === undefined){
                        self.postMessage({'cmd':'error','error':this.occupied});
                    }
                    else if (hydrophobe1.isNeighbor(hydrophobe2) ){
                        //console.log(`Pair: ${this_h}:${hydrophobe1}, ${other_h}:${hydrophobe2}`);
                        count++;
                    }
                    
                }
            }
        }
        //console.log(`fitness: ${-(count/2)}`);
        this.fitness = -(count/2);
    }

    rotate(direction, times=1){
        for (let i=0; i<times; i++){
            switch(direction){
                case 'left':  direction = 'up'; break
                case 'up':    direction = 'right'; break
                case 'right': direction = 'down'; break
                case 'down':  direction = 'left'; break
            }
        }
        return direction
    }
    
    
    mutation(index){
        let sequence = this.sequence;
        this.invalid = [];             //destroy invalid cells
        this.occupied.splice(index+1); //destroy old occupied cells
        let turn = parseInt(Math.random() * 3)+1; //random number of 90 degree clockwise turns
        let oldPath = this.path.splice(index);
        let newPath = oldPath.map( e => e=this.rotate(e,turn) )
        while(newPath.length > 0){
            let newWay = newPath.shift();
            let next_step = this.walk(index,newWay);
            if (next_step === null){
                //console.log('back step')
                index--;
                let deadend = this.occupied.pop();
                this.invalid.push(deadend);
                newPath.unshift( newWay ); //undo this step
                newPath.unshift( this.path.pop() ); //undo last step
            }
            else{
                //console.log('forward step')
                index++;
                next_step.type = sequence[index];
                this.occupied.push(next_step);
            }
        }
        //console.log("mutated");
    }
    
    swap(index, newPath){
        let sequence = this.sequence;
        this.invalid = [];             //destroy invalid cells
        this.occupied.splice(index+1); //destroy old occupied cells
        let oldPath = this.path.splice(index);
        while(newPath.length > 0){
            let newWay = newPath.shift();
            let next_step = this.walk(index,newWay);
            if (next_step === null){
                //console.log('back step')
                index--;
                let deadend = this.occupied.pop();
                this.invalid.push(deadend);
                newPath.unshift( newWay ); //undo this step
                newPath.unshift( this.path.pop() ); //undo last step
            }
            else{
                //console.log('forward step')
                index++;
                next_step.type = sequence[index];
                this.occupied.push(next_step);
            }
        }
        //console.log("swapped");
    }
    
    getPath(index){
        return this.path.slice(index);
    }

    updatePlot(){
        let trace = {
            x: [this.occupied.map( e => e.x )],
            y: [this.occupied.map( e => e.y )],
        }
        Plotly.restyle('plot-protein', trace, 0);
    
    }

    copy(){
        let clone = new Protein(this.sequence);
        clone.occupied = [ ...this.occupied];
        clone.invalid = [ ...this.invalid];
        clone.path = [ ...this.path];
        clone.fitness = this.fitness
        return clone;
    }

    equals(other){
        for (let index in this.path){
            if (this.path[index] !== other.path[index]){
                return false;
            }
        }
        return true;
    }
}
