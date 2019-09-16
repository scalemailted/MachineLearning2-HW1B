self.importScripts('Point.js', 'Protein.js');

self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
        case 'start':
            var result = genetic_algorithm(data.data); // Some function that calculates the average from the numeric array.
            self.postMessage(result);
            break;
        default:
            self.postMessage('Unknown command');
    }
  }, false);

//START GENETIC ALGORITHM
const genetic_algorithm = function(config){
    let population_size = config.population_size;
    let elite_rate = config.elite_rate ;
    let crossover_rate = config.crossover_rate;
    let mutation_rate = config.mutation_rate;
    let protein_length = config.sequence.length;
    let target_value = config.target_value;
    let max_generations = config.max_generations;
    let sequence = config.sequence.split("");
    let best_fit = 0;

    let this_generation = initialize(population_size, sequence);

    for (var generation=0; generation<=max_generations; generation++){
        self.postMessage({'cmd':'iter_count','iter_count':generation})
        this_generation.map( protein => protein.calculate_fitness() )
        this_generation.sort((p1, p2) => parseFloat(p1.fitness) - parseFloat(p2.fitness));

        //send message out to main thread
        let fitness = this_generation[0].fitness;
        if (fitness < best_fit){
            best_fit = fitness;
            self.postMessage({'cmd':'update_plot','trace':this_generation[0].show(), 'best':target_value, 'fitness':fitness})
            //self.postMessage({'cmd':'plot','plot':'Update Plot!'})
        }

        if (fitness <= target_value) break;

        //get elite count for next gen
        let elite_count = parseInt(elite_rate * population_size) 
        let elite_proteins = this_generation.slice(0, elite_count);        

        //get nonelite count for next gen
        let nonelite_count = population_size - elite_count;

        //get crossover proteins for next gen
        let crossover_count = parseInt(crossover_rate * nonelite_count) / 2 * 2; //must be even; 
        let crossover_indices = selectSamples(this_generation, crossover_count);
        let crossover_proteins = crossover_indices.map( i => this_generation[i].copy() );
        for (let index=0; index<crossover_proteins.length; index+=2){
            let protein1 = crossover_proteins[index];
            let protein2 = crossover_proteins[index+1];
            let location = parseInt(Math.random() * protein_length)
            //crossover(protein1, protein2, location);
        }

        //get remaining proteins for next gen
        let remaining_count = population_size - elite_count - crossover_count;
        let remaining_proteins = initialize(remaining_count, sequence);

        //perform mutations on nonelite 
        let mutation_count = parseInt(mutation_rate * nonelite_count);
        let nonelite_proteins = [ ...crossover_proteins, ...remaining_proteins];
        let mututation_indices = new Set();
        while (mututation_indices.size < mutation_count){
            let index = parseInt(Math.random() * nonelite_count);
            mututation_indices.add(index);
        }
        [ ...mututation_indices ].map( e=>nonelite_proteins[e].mutation( ~~(Math.random()*protein_length) ));

        //set next generation
        let next_generation = [ ...elite_proteins, ...nonelite_proteins]

        this_generation = next_generation;
    }

    return generation//this_generation[0].fitness;
    //self.postMessage(result);
   // self.postMessage([{"data":[result] }]);

    //console.log(`Generation: ${max_generations}`)
    //this_generation.sort((p1, p2) => parseFloat(p1.fitness) - parseFloat(p2.fitness));
    //this_generation.map( e=>console.log(e.fitness) );
    //this_generation[0].show();
};

const initialize = function(population_size, sequence){
    let arr = []
    for (let i=0; i<population_size; i++){
        arr.push( new Protein(sequence) );
    }
    return arr;
}

//roulette wheel selection
const randomChoice = function(probabilities) {
    let rnd = probabilities.reduce( (a, b) => a + b ) * Math.random();
    return probabilities.findIndex( a => (rnd -= a) < 0 );
}

const randomChoices = function(probabilities, count) {
    return Array.from(Array(count), randomChoice.bind(null, probabilities));
}

const selectSamples = function(population, count){
    let max = population.reduce( (sum,protein) => sum + protein.fitness, 0)
    let selection_probs = population.map( e => e.fitness/max)
    return randomChoices(selection_probs, count)
}

const crossover = function(protein1, protein2, index){
    let protein1_path = protein1.getPath(index);
    let protein2_path = protein2.getPath(index);
    protein1.swap(protein2_path, index);
    protein2.swap(protein1_path, index);
}