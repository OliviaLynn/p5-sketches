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

function Sample(name) {
  this.sound = loadSound("samples/" + name + ".wav"),
  this.name = name,
  this.allVotes = 0,
  this.goodVotes = 0,
  this.vote = function(isGood) {
    this.allVotes++;
    if (isGood) {
      this.goodVotes++;
    }
  },
  this.getScore = function() {
    return this.allVotes > 0 ? Math.round(100*this.goodVotes/this.allVotes) : 0;
  },
  this.pause = function() {
    this.sound.stop();
  },
  this.unpause = function() {
    this.sound.loop();
  },
  this.mute = function() {
    this.sound.setVolume(0);
  },
  this.unmute = function() {
    this.sound.setVolume(0.8);
  }
  this.draw = function(x,y,idx) {
    text("("+idx+")" + this.name + ": " + this.getScore(), x, y);
  }
}

// --------------------------------------------------------------------------------------

var population;
var sizePopulation = 8;
var childSelected = 0;

function printPop(title, p) {
  //console.log(title);
  console.log(p.map(x => x.join(" ")).join(" | "));
}

function runGen() {
  voted = new Array(population.length).fill(false);

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

function add(a,b) {return a+b;}
function fitThree(word) {
  return word.map(x => x == 3 ? 1 : 0).reduce(add);
}
function fitByVotes(word) {
  return word.map(x => samples[x].getScore()).reduce(add);
}

function fitness(word) {
  return fitByVotes(word);
}

function generateAWord() {
  w = [...Array(4)].map(() => Math.floor(Math.random() * numberOfSamples));
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
  word[indexToMod] = Math.floor(Math.random() * numberOfSamples);
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
  if (key == 'i') {
    for (var i = 0; i < population.length; i++) {
      console.log(population[i]);
      console.log(fitByVotes(population[i]));
    }
  }
  return false;
}
function keyPressed() {
  if (keyCode === UP_ARROW) {
    if (!voted[childSelected]) {
      doVote(true);
    }
  }
  if (keyCode === DOWN_ARROW) {
    if (!voted[childSelected]) {
      doVote(false);
    }
  }
  if (keyCode === RIGHT_ARROW) {
    childSelected = (childSelected+1) % population.length;
    setSounds();
  }
  if (keyCode === LEFT_ARROW) {
    childSelected = (childSelected-1) % population.length;
    setSounds();
  }
}

function doVote(isGood) {
  for (var i = 0; i < population[childSelected].length; i++) {
    //TODO: decide how we're dealing with duplicates
    samples[population[childSelected][i]].vote(isGood);
  }
  voted[childSelected] = true;
}
function stopSound() {
  toggleVolume = false;
  for (var i = 0; i < samples.length; i++) {
    samples[i].pause();
  }
}
function startSound() {
  toggleVolume = true;
  for (var i = 0; i < samples.length; i++) {
    samples[i].unpause();
  }
}
function setSounds() {
  for (var i = 0; i < samples.length; i++) {
    samples[i].mute()
  }
  for (var i = 0; i < population[childSelected].length; i++) {
    samples[population[childSelected][i]].unmute();
  }
}

// --------------------------------------------------------------------------------------

var toggleVolume = true;
var samples;
var numberOfSamples = 1;
var voted = [];

function preload() {
  var names = "abcdefghijklmnopqrs".split("");
  samples = [];
  for (var i = 0; i < names.length; i++) {
    //samples.push(loadSound("samples/" + names[i] + ".wav"));
    var s = new Sample(names[i]);
    samples.push(s);
  }
  numberOfSamples = samples.length;

  font = loadFont("RobotoMono-Regular.ttf");
}

function setup() {
  createCanvas(300,800);
  //noStroke();
  textFont(font);

  begin();

  for (var i = 0; i < samples.length; i++) {
    samples[i].mute();
    samples[i].unpause();
  }
  setSounds();

  voted = new Array(population.length).fill(false)
}

function draw() {
  if (!toggleVolume) {
    background(60);
  }
  else if (voted[childSelected]) {
    background(200);
  }
  else {
    background(160);
  }
  fill(0);
  var sz = 12;
  textSize(sz);
  text("Selected: " + childSelected, 10, sz);
  text(population[childSelected].join(" "), 10, sz*2);
  text(population[childSelected]
    .map(x => samples[x].name + ".wav")
    .join(" | "),
    10, 3*sz);
  for (var i = 0; i < samples.length; i++) {
    samples[i].draw(10, (5+i)*sz, i);
  }
  text(voted.map(v => v ? "=" : "-").join(" "), 10, (6+numberOfSamples)*sz);
}
