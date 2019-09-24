let noseX = 0;
let noseY = 0;
let poseNet;
let eyelX = 0;
let eyelY = 0;

let foods = []; // array to hold food objects
let imgs ;
let video;


function preload() {
	// let a = Math.random[0,7]
	// img=loadImage(a+".png");
	img=loadImage("0.png");
	// for (let i = 0; i < 7; i++) {
	//   imgs[i] = loadImage('0.png');
  // }
  }

function setup() {
  createCanvas(400, 600);
   // Create a featureExtractor that can extract the already learned features from MobileNet
  
//    noCanvas();
   // Create a video element
   video = createCapture(VIDEO);
   video.hide();
   // Append it to the videoContainer DOM element
   video.parent('videoContainer');
   
   poseNet = ml5.poseNet(video, poseNetmodelReady);
   poseNet.on('pose', gotPoses);
   
}

function gotPoses(poses) {
    //console.log(poses);
    if (poses.length > 0) {
      let nX = poses[0].pose.keypoints[0].position.x;
      let nY = poses[0].pose.keypoints[0].position.y;
      let eX = poses[0].pose.keypoints[1].position.x;
      let eY = poses[0].pose.keypoints[1].position.y;
      noseX = lerp(noseX, nX, 0.5);
      noseY = lerp(noseY, nY, 0.5);
      eyelX = lerp(eyelX, eX, 0.5);
      eyelY = lerp(eyelY, eY, 0.5);
    }
  }

  function poseNetmodelReady() {
    console.log('poseNetmodel ready');
  }

function draw() {
  //background(240);
  image(video, 0, 0); 
  fill(255, 0, 0);
  let d = dist(noseX, noseY, eyelX, eyelY);
  ellipse(noseX, noseY, d);
  
  // loop through foods with a for..of loop
  var f = new Food(noseX+100, noseY,d); // Make a new object at the mouse location.
	foods.push(f);
  for (var i = 0; i < foods.length; i++) {
   
    
      foods[i].display();	
   
      foods[i].update();
      if(foods[].isDead()){
          this.foods
      }
  }

}

// food class
function Food(tempX, tempY,tempD) {
	this.x = tempX;  // x location of square 
	this.y = tempY;  // y location of square 
  this.speed = 0;  // size
  this.d=tempD;
  this,lifespan=120;
	
	this.update = function() {
		// Add speed to location
		this.y = this.y + this.speed; 
	
		// Add gravity to speed
		this.speed = this.speed + 0.8; 
        this.lifespan-=1;
		// If square reaches the bottom 
		// Reverse speed 
		if (this.y > height) { 
		  this.speed = this.speed * -1;  
    } 
  }

  this.display= function () {
    image(img, this.x, this.y, this.d, this.d);
    }
    this.isDead = function(){
        if (this.lifespan < 0) {
          return true;
        } else {
          return false;
        }
      };
  };




