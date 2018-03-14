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
field.print();

function setup() {
  createCanvas(field.width*field.size+1,
               field.height*field.size+1);
  noStroke();
}

function draw() {
  background(160);
  field.draw();
}
