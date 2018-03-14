// I don't remember what this was for, tbh. Maybe the beginning of some sort of sequencer?

function Field(size) {
  this.size = size,
  this.matrix = function(rows, cols) {
    var m = [], row = [];
    while (cols--) row.push(0);
    while (rows--) m.push(row.slice());
    return m;
  }(size, size),
  this.print = function() {
    console.log(this.matrix.map(x => x.join(", ")).join("\n"));
  },
  this.width = 50,
  this.height = 50,
  this.draw = function() {
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[r].length; c++) {
        rect(c*this.width+1,
             r*this.height+1,
             this.width-1,
             this.height-1);
      }
    }
  }
}

var field = new Field(8);
//field.print();



// --------------------------------------------------------------------------------------

var population;
var sizePopulation = 8;
var childSelected = 0;

function printPop(title, p) {
  //console.log(title);
  console.log(p.map(x => x.join(" ")).join(" | "));
}

function runGen() {
  var bestSample = 3;
  var luckyFew = 1;
  var chanceOfMutation = 20

  var p = computePerfPopulation(population);
  var pSelect = selectFromPopulation(p, bestSample, luckyFew);
  var pSelectChildren = createChildren(pSelect, 4);
  var pChildrenMutated = mutatePopulation(pSelectChildren, chanceOfMutation);

  population = pChildrenMutated;

  printPop("GEN:", population);
}

function begin() {
  generateFirstPopulation(sizePopulation);
  printPop("POP", population);
}

function mouseClicked() {
  //runGen();
}

function fitThree(word) {
  return word.map(x => x == 3 ? 1 : 0).reduce(function add(a,b) {return a+b;});
}

function fitness(word) {
  return fitThree(word);
}

function generateAWord() {
  w = [...Array(4)].map(() => Math.floor(Math.random() * numberOfSounds));
  return w;
}

function generateFirstPopulation(sizePopulation) {
  p = [];
  for (var i = 0; i < sizePopulation; i++) {
    p.push(generateAWord());
  }
  population = p;
}

function compareFitness(a, b) {
  return fitness(a) < fitness(b);
}

function computePerfPopulation() {
  return population.sort(compareFitness)
}

function shuffleArray(array) {
  // Durstenfeld shuffle from
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  // bc why reinvent the wheel
  // thnx m8
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectFromPopulation(populationSorted, bestSample, luckyFew) {
  nextGen = [];
  for (var i = 0; i < bestSample; i++) {
    nextGen.push(populationSorted[i]);
  }
  for (var i = 0; i < luckyFew; i++) {
    var randomIndex = Math.floor(Math.random() * populationSorted.length);
    nextGen.push(populationSorted[randomIndex]);
  }
  shuffleArray(nextGen);
  return nextGen;
}

function createChild(word1, word2) {
  child = [];
  for (var i = 0; i < word1.length; i++) {
    if (Math.random() < 0.5) {
      child.push(word1[i]);
    }
    else {
      child.push(word2[i]);
    }
  }
  return child;
}

function createChildren(breeders, numberOfChild) {
  p = [];
  for (var i = 0; i < (breeders.length)/2; i++) {
    for (var j = 0; j < numberOfChild; j++) {
      p.push(createChild(breeders[i], breeders[breeders.length - 1 - i]));
    }
  }
  return p;
}

function mutateWord(word) {
  var indexToMod = Math.floor(Math.random() * word.length);
  word[indexToMod] = Math.floor(Math.random() * numberOfSounds);
  return word;
}

function mutatePopulation(p, chanceOfMutation) {
  for (var i = 0; i < p.length; i++) {
    if (Math.random() * 100 < chanceOfMutation) {
      p[i] = mutateWord(p[i]);
    }
  }
  return p;
}


// --------------------------------------------------------------------------------------

function keyTyped() {
  if (['0','1','2','3','4','5','6','7'].indexOf(key) !== -1) {
    childSelected = key;
    setSounds();
  }
  if (key == 'p') {
    if (toggleVolume) {
      stopSound();
    }
    else {
      startSound();
    }
  }
  if (key == 'n') {
    runGen();
  }
  return false;
}

function stopSound() {
  toggleVolume = false;
  for (var i = 0; i < soundFiles.length; i++) {
    soundFiles[i].stop();
  }
}
function startSound() {
  toggleVolume = true;
  for (var i = 0; i < soundFiles.length; i++) {
    soundFiles[i].loop();
  }
}
function setSounds() {
  for (var i = 0; i < soundFiles.length; i++) {
    soundFiles[i].setVolume(0);
  }
  for (var i = 0; i < population[childSelected].length; i++) {
    soundFiles[population[childSelected][i]].setVolume(0.8);
  }
}

// --------------------------------------------------------------------------------------

var toggleVolume = true;
var soundFiles;
var numberOfSounds = 1;

function preload() {
  var names = "abcdefghijklmnopqrs".split("");
  soundFiles = [];
  for (var i = 0; i < names.length; i++) {
    soundFiles.push(loadSound("samples/" + names[i] + ".wav"));
  }
  numberOfSounds = soundFiles.length;
}

function setup() {
  createCanvas(field.width*field.size+1,
               field.height*field.size+1);
  //noStroke();
  begin();

  for (var i = 0; i < soundFiles.length; i++) {
    soundFiles[i].setVolume(0);
    soundFiles[i].loop();
  }
  setSounds();
}

function draw() {
  if (toggleVolume) {
    background(160);
  }
  else {
    background(200, 100, 100);
  }
  fill(0);
  var sz = 24;
  textSize(sz);
  text(childSelected, 10, sz);
  text(population[childSelected].join(" "), 10, sz*2);
  for (var i = 0; i < population[childSelected].length; i++) {
    text(soundFiles[population[childSelected][i]].url, 42, sz*(3+i))
  }
}
