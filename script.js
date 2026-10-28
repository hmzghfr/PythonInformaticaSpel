// speelveld en raster
var canvas;

var raster = {
  aantalRijen: 12,
  aantalKolommen: 18,
  celGrootte: null,

  berekenCelGrootte() {
    // celgrootte berekend op basis van de breedte van het canvas
    this.celGrootte = canvas.width / this.aantalKolommen;
  },

  teken() {
    push();
    noFill();
    stroke("grey");
    strokeWeight(1);

    // alle vakjes van het raster tekenen
    // p.s. curry kan je hier nog extra toevoegen
    for (let rij = 0; rij < this.aantalRijen; rij++) {
      for (let kolom = 0; kolom < this.aantalKolommen; kolom++) {
        rect(
          kolom * this.celGrootte,
          rij * this.celGrootte,
          this.celGrootte,
          this.celGrootte
        );
      }
    }

    // blauwe rand om het hele speelveld
    stroke("blue");
    strokeWeight(6);
    noFill();
    rect(0, 0, canvas.width, canvas.height);
    pop();
  }
};

// jos
class Jos {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.animatie = [];
    this.frameNummer = 3;
    this.stapGrootte = null;
  }

  beweeg() {
    // wasd besturing
    if (keyIsDown(65)) { // A: naar links
      this.x -= this.stapGrootte;
      this.frameNummer = 2;
    }
    if (keyIsDown(68)) { // D: naar rechts
      this.x += this.stapGrootte;
      this.frameNummer = 1;
    }
    if (keyIsDown(87)) { // W: omhoog
      this.y -= this.stapGrootte;
      this.frameNummer = 4;
    }
    if (keyIsDown(83)) { // S: omlaag
      this.y += this.stapGrootte;
      this.frameNummer = 5;
    }

    // zorgen dat je niet out of boudns kan gaan
    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }

  wordtGeraakt(object) {
    // geen overlapping
    return (
      abs(this.x - object.x) < raster.celGrootte &&
      abs(this.y - object.y) < raster.celGrootte
    );
  }

  heeftOverkantGehaald() {
    // kijken of jos de overkant heeft gehaald of niet
    return this.x >= canvas.width - raster.celGrootte;
  }

  toon() {
    image(
      this.animatie[this.frameNummer],
      this.x,
      this.y,
      raster.celGrootte,
      raster.celGrootte
    );
  }
}

// class voor de vijanden 
class Vijand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.stapGrootte = null;
  }

  beweeg() {
    // random stapjes doen in x en y richting
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;

    // binnen het canvas blijven
    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }

  toon() {
    image(
      this.sprite,
      this.x,
      this.y,
      raster.celGrootte,
      raster.celGrootte
    );
  }
}

// class voor de bewegende bommen
class Bom {
  constructor(kolom, snelheid) {
    this.x = kolom * raster.celGrootte;
    this.y = random(0, canvas.height - raster.celGrootte);
    this.snelheid = snelheid;
    this.diameter = raster.celGrootte * 0.7;
  }

  beweeg() {
    this.y += this.snelheid;

    // stuiter functie
    if (this.y <= 0) {
      this.y = 0;
      this.snelheid = abs(this.snelheid);
    }
    if (this.y >= canvas.height - raster.celGrootte) {
      this.y = canvas.height - raster.celGrootte;
      this.snelheid = -abs(this.snelheid);
    }
  }

  toon() {
    push();
    noStroke();
    fill("black");
    circle(
      this.x + raster.celGrootte / 2,
      this.y + raster.celGrootte / 2,
      this.diameter
    );
    fill("orange");
    circle(
      this.x + raster.celGrootte / 2 + this.diameter * 0.12,
      this.y + raster.celGrootte / 2 - this.diameter * 0.12,
      this.diameter * 0.25
    );
    pop();
  }
}

// class voor pingpongbal
class Pingpongbal {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.snelheidX = raster.celGrootte * 0.35;
    this.snelheidY = raster.celGrootte * 0.25;
    this.diameter = raster.celGrootte * 0.5;
  }

  beweeg() {
    this.x += this.snelheidX;
    this.y += this.snelheidY;

    // stuiteren zijkanten
    if (this.x <= this.diameter / 2 || this.x >= canvas.width - this.diameter / 2) {
      this.snelheidX *= -1;
    }

    // stuiteren boven en onderkant
    if (this.y <= this.diameter / 2 || this.y >= canvas.height - this.diameter / 2) {
      this.snelheidY *= -1;
    }
  }

  toon() {
    push();
    fill("white");
    stroke("black");
    strokeWeight(1);
    circle(this.x, this.y, this.diameter);
    pop();
  }

  raakt(object) {
    return (
      abs(this.x - (object.x + raster.celGrootte / 2)) <
        (this.diameter + raster.celGrootte) / 2 &&
      abs(this.y - (object.y + raster.celGrootte / 2)) <
        (this.diameter + raster.celGrootte) / 2
    );
  }
}

var brug;
var eve;
var alice;
var bob;
var bom1;
var bom2;
var bal;
var josAnimatie = [];
var aliceSprite;
var bobSprite;

var spelAfgelopen = false;
var achtergrondX = 0;

function preload() {
  brug = loadImage("images/backgrounds/dame_op_brug_1800.jpg");

  for (let frame = 0; frame < 6; frame++) {
    josAnimatie.push(
      loadImage("images/sprites/Jos100px/Jos_" + frame + ".png")
    );
  }

  aliceSprite = loadImage("images/sprites/Alice100px/Alice.png");
  bobSprite = loadImage("images/sprites/Bob100px/Bob.png");
}

function setup() {
  canvas = createCanvas(900, 600);
  canvas.parent("processing");
  frameRate(10);
  textFont("Verdana");

  raster.berekenCelGrootte();
  nieuwSpel();
}

function nieuwSpel() {
  spelAfgelopen = false;

  // jos linkerkant
  eve = new Jos();
  eve.animatie = josAnimatie;
  eve.stapGrootte = raster.celGrootte;
  eve.x = 0;
  eve.y = floor(raster.aantalRijen / 2) * raster.celGrootte;

  // alice maken
  alice = new Vijand(
    11 * raster.celGrootte,
    3 * raster.celGrootte
  );
  alice.stapGrootte = eve.stapGrootte;
  alice.sprite = aliceSprite;

  // bob maken
  bob = new Vijand(
    14 * raster.celGrootte,
    8 * raster.celGrootte
  );
  bob.stapGrootte = eve.stapGrootte;
  bob.sprite = bobSprite;

  // random startkolommen kiezen 
  let startKolomRechts = floor(raster.aantalKolommen / 2) + 1;
  let kolom1 = floor(random(startKolomRechts, raster.aantalKolommen));
  let kolom2 = floor(random(startKolomRechts, raster.aantalKolommen));

  // zorgen dat beide bommen niet zelfde plek komen
  while (kolom2 === kolom1) {
    kolom2 = floor(random(startKolomRechts, raster.aantalKolommen));
  }

  // twee bommen
  bom1 = new Bom(kolom1, raster.celGrootte * 0.3);
  bom2 = new Bom(kolom2, -raster.celGrootte * 0.5);

  bal = new Pingpongbal();
  achtergrondX = 0;

  loop();
}

function tekenAchtergrond() {
  // laat achtergrond meebewegen
  if (brug) {
    image(brug, -achtergrondX, 0, canvas.width, canvas.height);
    image(brug, canvas.width - achtergrondX, 0, canvas.width, canvas.height);

    achtergrondX += 1.5;

    // reset de positie
    if (achtergrondX >= canvas.width) {
      achtergrondX = 0;
    }
  } else {
    background("lightblue");
  }
}

// eindscherm 
function tekenEindscherm(gewonnen, boodschap) {
  if (gewonnen) {
    background("green");
  } else {
    background("red");
  }

  push();
  fill("white");
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  text(boodschap, canvas.width / 2, canvas.height / 2 - 30);

  textSize(20);
  text(
    "Druk op ENTER om opnieuw te spelen",
    canvas.width / 2,
    canvas.height / 2 + 35
  );
  pop();
}

function draw() {
  if (spelAfgelopen) {
    return;
  }

  // 1. veld tekenen
  tekenAchtergrond();
  raster.teken();

  // 2. objecten laten bewegen
  eve.beweeg();
  alice.beweeg();
  bob.beweeg();
  bom1.beweeg();
  bom2.beweeg();
  bal.beweeg();

  // 3. objecten op het scherm tonen
  eve.toon();
  alice.toon();
  bob.toon();
  bom1.toon();
  bom2.toon();
  bal.toon();

  // 4. checken op winnen 
  if (eve.heeftOverkantGehaald()) {
    eindeSpel(true, "Gefeliciteerd, je hebt de overkant gehaald!");
    return;
  }

  // 5. checken op botsingen 
  if (eve.wordtGeraakt(alice) || eve.wordtGeraakt(bob)) {
    eindeSpel(false, "Je bent geraakt door een vijand!");
    return;
  }

  if (eve.wordtGeraakt(bom1) || eve.wordtGeraakt(bom2)) {
    eindeSpel(false, "Je bent geraakt door een bom!");
    return;
  }

  if (bal.raakt(eve)) {
    eindeSpel(false, "Je bent geraakt door de pingpongbal!");
    return;
  }
}

function eindeSpel(gewonnen, boodschap) {
  spelAfgelopen = true;
  noLoop();
  tekenEindscherm(gewonnen, boodschap);
}

function keyPressed() {
  // opnieuw starten met enter als het spel voorbij is
  if (keyCode === ENTER && spelAfgelopen) {
    nieuwSpel();
  }
}