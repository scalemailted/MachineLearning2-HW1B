var file_data; 
var protein_data;

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    function showFile() {
       var preview = document.getElementById('show-text');
       var file = document.querySelector('input[type=file]').files[0];
       var label = document.getElementById('read-file-label');
       label.innerHTML = file.name;

       var showbutton = document.getElementById('show-file-button');
       /*showbutton.innerHTML =  `<button class="btn btn-outline-secondary mt-2" 
                                    type="button" 
                                    data-toggle="collapse" 
                                    data-target="#show-text" 
                                    aria-expanded="false" 
                                    aria-controls="show-text">
                                        Show	
                                </button>`;*/

                                
    
        showbutton.innerHTML =  `<button class="btn btn-outline-secondary"
                                    onclick="this.innerHTML=(this.innerHTML==='Show')?'Hide':'Show';" 
                                    data-toggle="collapse" 
                                    data-target="#show-text" 
                                    aria-expanded="false" 
                                    aria-controls="show-text"
                                    type="button"> 
                                    Hide
                                </button>`

        //showbutton.onclick= () => showbutton.innerHTML=(showbutton.innerHTML=='Hide')?'Show':'Hide';
        

       var reader = new FileReader()

       var textFile = /text.*/;

       if (file.type.match(textFile)) {
          reader.onload = function (event) {
            //console.log(event.target.result)
            let text = event.target.result
             preview.innerHTML = text.replace(/\n/g,'<br>');
             parseText(text)
          }
       } else {
          preview.innerHTML = "<span class='error'>It doesn't seem to be a text file!</span>";
       }
       reader.readAsText(file);
    }
 } else {
    alert("Your browser is too old to support HTML5 File API");
 }

 function parseText(text){
   //text= text.replace(/ =/g, ':')
   file_data = text.split('\n')
   let [headerLabel, proteinTotal] = file_data[0].split('=');
   if( headerLabel.includes('TotalProtein') ){
      total = parseInt(proteinTotal);
      protein_data = [];
      for (let i=1; i<total*2; i+=2){
         let sequence = file_data[i].replace('Seq = ', '')
         let fitness = +file_data[i+1].replace('Fitness = ', '');
         protein_data.push( {'sequence': sequence, 'fitness':fitness}  )
      }
   }

   
   
   //if (file_data[0].contains("TotalProtein") )
   //console.log("file:",file_data);
 }

 function getProteins(){
    return [ ...protein_data];
 }
