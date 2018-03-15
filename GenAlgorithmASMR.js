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
  console.log(p.map(x => x.map(y=>samples[y].name).join(" ")).join(" | "));
  console.log(p.map(x => x.map(y=>samples[y].name).sort().join(" ")).join(" | "));
}

function runGen() {
  gens++;
  voted = new Array(population.length).fill(false);
  childSelected = 0;

  var bestSample = 3;
  var luckyFew = 1;
  var chanceOfMutation = 50

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
function fitByPairs(word) {
  var score = 0;
  for (var r = 0; r < voteMatrix.length; r++) {
    for (var c = 0; c < voteMatrix[0].length; c++) {
      score += voteMatrix[r][c];
    }
  }
  return score;
}

function fitness(word) {
  return fitByPairs(word);
}

function generateAWord() {
  //w = [...Array(4)].map(() => Math.floor(Math.random() * numberOfSamples));
  w = [];
  while (w.length < 4) {
    var x = Math.floor(Math.random() * numberOfSamples);
    if (w.indexOf(x) === -1) {
      w.push(x);
    }
  }
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
  // Fisher-Yates shuffle from
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/2450976
  // bc why reinvent the wheel
  // thnx m8
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function selectFromPopulation(populationSorted, bestSample, luckyFew) {
  nextGen = [];
  console.log("Population: best sample");
  for (var i = 0; i < bestSample; i++) {
    console.log(letters(populationSorted[i]) + ": " + fitByVotes(populationSorted[i]));
    nextGen.push(populationSorted[i]);
  }
  console.log("Population: lucky few")
  for (var i = 0; i < luckyFew; i++) {
    var randomIndex = Math.floor(Math.random() * populationSorted.length);
    console.log(letters(populationSorted[randomIndex]) + ": " + fitByVotes(populationSorted[randomIndex]));
    nextGen.push(populationSorted[randomIndex]);
  }
  nextGen = shuffleArray(nextGen);
  return nextGen;
}

function letters(word) {
  return word.map(x => samples[x].name).join("");
}

function createChild(scene1, scene2) {
  var scene = scene1.slice(0);
  for (var i = 0; i < scene2.length; i++) {
    if (scene.indexOf(scene2[i]) === -1) {
      scene.push(scene2[i]);
    }
  }
  var res = shuffleArray(scene).slice(0,4);
  console.log(letters(scene1)+" + "+letters(scene2)+" = "+letters(res));
  return res;
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
    console.log(voteMatrixToString());
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
    childSelected--;
    if (childSelected < 0) {
      childSelected = population.length - 1;
    }
    setSounds();
  }
}

function doVote(isGood) {
  for (var i = 0; i < population[childSelected].length; i++) {
    //TODO: decide how we're dealing with duplicates
    samples[population[childSelected][i]].vote(isGood);
  }
  voted[childSelected] = true;

  var scene = population[childSelected];
  for (var i = 0; i < scene.length; i++) {
    for (var j = 0; j < scene.length; j++) {
      if (i != j) {
        voteMatrix[scene[i]][scene[j]].all++;
        if (isGood) {
          voteMatrix[scene[i]][scene[j]].good++;
        }
      }
    }
  }


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
function voteMatrixToString() {
    return voteMatrix.map(
      r=>r.map(o=>o.all == 0? 0 : o.good/o.all).join(", ")
    ).join("\n");

}

// --------------------------------------------------------------------------------------

var toggleVolume = true;
var samples;
var numberOfSamples = 1;
var voted = [];
var voteMatrix;

function preload() {
  var names = "abcdefghijklmnopqrstuvwxy".split("");
  samples = [];
  for (var i = 0; i < names.length; i++) {
    //samples.push(loadSound("samples/" + names[i] + ".wav"));
    var s = new Sample(names[i]);
    samples.push(s);
  }
  numberOfSamples = samples.length;

  font = loadFont("RobotoMono-Regular.ttf");
}


var reverb;
function setup() {
  createCanvas(600,800);
    background(60);
  //noStroke();
  textFont(font);
  textAlign(LEFT, TOP);

  reverb = new p5.Reverb();
  for (var i = 0; i < numberOfSamples; i++) {
    // soundfile, seconds reverbTime, decayRate of x%
    reverb.process(samples[i].sound, 4, 5);
  }

  voteMatrix = [];
  for (var i = 0; i < numberOfSamples; i++) {


    var row = [];
    for (var j = 0; j < numberOfSamples; j++) {
      row.push({all:0,good:0});
    }
    voteMatrix.push(row);
  }

  begin();

  for (var i = 0; i < samples.length; i++) {
    samples[i].mute();
    samples[i].unpause();
  }
  setSounds();

  voted = new Array(population.length).fill(false)
}

function draw() {
  /*
  if (!toggleVolume) {
    background(30);
  }
  else if (voted[childSelected]) {
    background(60);
  }
  else {
    background(60);
  }
  */
  noStroke();
  fill(60);
  rect(330, 5, 120, 40);
  fill(255);
  var sz = 12;
  textSize(sz);
  text(childSelected + ": " +
    population[childSelected]
    .map(x => samples[x].name)
    .sort()
    .join(" "),
    340, 10);
  text(voted.map(v => v ? "=" : "-").join(" "), 340, 30);
  //text(voteMatrixToString(), 10, 20*sz);
  drawSampleGrid();
  drawVoteGrid();
  drawGen();
}

function drawSampleGrid() {
  var cols = 5;
  for (var i = 0; i < samples.length; i++) {
    drawSampleBox(Math.floor(i/cols), i%cols, samples[i].name, samples[i].getScore());
  }
}

function drawSampleBox(r, c, name, score) {
  var unit = 20;
  var x0 = 340;
  var y0 = 50;
  var m = 2;
  var x = x0+unit*c;
  var y = y0+unit*r;
  noStroke();
  fill(150+(score));
  rect(x, y, unit-m, unit-m);
  fill(80);
  textSize(8);
  text(name, x+2, y-1);
  text(score, x+2, y-1+8);
  noStroke();
}

function drawVoteGrid() {
  for (var i = 0; i < voteMatrix.length; i++) {
    for (var j = 0; j < voteMatrix[0].length; j++) {
      drawVoteBox(i,j);
    }
  }
}

function drawVoteBox(r,c) {
  var unit = 13;
  var x0 = 10;
  var y0 = 10;
  var m = 2;
  var x = x0+unit*c;
  var y = y0+unit*r;
  var score = voteMatrix[r][c].all == 0 ? 0 : voteMatrix[r][c].good / voteMatrix[r][c].all;
  noStroke();
  fill(100+(score*150));
  rect(x, y, unit-m, unit-m);
  fill(80);
  //textSize(12);
  //text(score, x+2, y-1);
  noStroke();
}

var gens = 0;
function drawGen() {
  for (var i = 0; i < population.length; i++) {
    drawGenBox(i);
  }
}
function drawGenBox(i) {
  var x0 = 10;
  var y0 = 340;
  var w = 41;
  var h = 20;
  var m = 2;
  y0 += gens*(h+m);
  fill(100);
  noStroke();
  if (i === 0) {
    rect(x0+w*i, y0, w-m-3, h);
  }
  else {
    rect(x0+w*i-3, y0, w-m, h);
  }
  fill(60);
  textSize(10);
  text(population[i].map(x=>samples[x].name).sort().join(""), x0+w*i+4, y0+2);
}
