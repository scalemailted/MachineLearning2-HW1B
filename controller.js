var start_button = document.getElementById('start');
start_button.onclick = () => {
    if (start_button.innerText === 'Start') start();
    else stop();
};

var radios = document.getElementsByName('optradio');

var readText = document.getElementById('read-text');

var status_message = document.getElementById('status');
var fitness_input = document.getElementById('target-value');

var worker;
var proteins = [];

var protein_counter = document.getElementById('protein-counter')
protein_counter.innerText = '1 of 1'

function start(){
    //toggle to STOP button
    //toggleToStop();

    let config = new Object();
    config.population_size = parseInt( document.getElementById('population-size').value );
    config.elite_rate = parseFloat( document.getElementById('elite-rate').value );
    config.crossover_rate = parseFloat( document.getElementById('crossover-rate').value );
    config.mutation_rate = parseFloat( document.getElementById('mutation-rate').value );
    config.protein_length = parseInt( document.getElementById('protein-length').value );
    config.target_value = parseInt( document.getElementById('target-value').value );
    config.max_generations = parseInt( document.getElementById('max-generations').value );
    
    if (radios[0].checked){
        config.sequence = readText.value //.split("");
        document.getElementById('protein-length').value = config.sequence.length;
        run_GeneticAlgorithm(config);
    }
    else if (radios[1].checked){
        if (proteins.length === 0){
            proteins = getProteins();
        }
        protein_counter.innerText = `${protein_data.length -  proteins.length} of ${protein_data.length}` 
        let {sequence, fitness} = proteins.shift();
        config.sequence = sequence;
        readText.value = sequence;
        document.getElementById('protein-length').value = sequence.length;
        config.target_value = fitness;
        fitness_input.value = fitness;
        run_GeneticAlgorithm(config);

        /*console.log(protein_data);
        for (let data of protein_data){
            let {sequence, fitness} = data;
            config.sequence = sequence;
            readText.value = sequence;
            document.getElementById('protein-length').value = sequence.length;
            config.target_value = fitness;
            fitness_input.value = fitness;
            run_GeneticAlgorithm(config);
        }
        */
    }
}

function run_GeneticAlgorithm(config){
    toggleToStop();
    status_message.value = 'Running...'

    //status_message.value = 'Done.'
    let getPost = function(e) {
        var data = e.data;
        switch (data.cmd) {
            case 'iter_count':
                status_message.value = data.iter_count;
                if (data.iter_count === config.max_generations){
                    toggleToStart();
                }
                break;
            case 'update_plot':
                show(data);
                if (data.fitness <= config.target_value){
                    console.log(config.target_value);
                    console.log(data.fitness);
                    toggleToStart();
                }
                break;
            case 'reset':
                console.log('reset elites');
                break;
            case 'err':
                console.log(data.error);
                break;
            
        }
      };

    worker = new Worker('protein_folding.js')
    worker.postMessage({'cmd': 'start', 'data': config});
    //worker.addEventListener('message', e => console.log('worker said: ', e.data), false );
    worker.addEventListener('message', getPost, false );
}

function stop(){
    worker.terminate();
    toggleToStart();
}

function toggleToStop(){
    start_button.classList.replace("btn-success","btn-danger")
    start_button.innerText = "Stop";
}

function toggleToStart(){
    start_button.classList.replace("btn-danger","btn-success")
    start_button.innerText = "Start";
}

function show( config ){
    let data = [ config.trace ];

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

        },
        title: {
            text:`Fitness:${config.fitness}/${config.best}` ,
        },
    };
    Plotly.newPlot('plot-protein', data, layout);
}

