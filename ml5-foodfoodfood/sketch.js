let noseX = 0;
let noseY = 0;
let labelName = '';
let eyelX = 0;
let eyelY = 0;

const minMouseDist = 150;
const minDist = 20;

let colors;
let points = []
let center;
let maxRadius;


let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;


function setup() {
  createCanvas(windowWidth, windowHeight);
	noStroke();
	
	center = createVector(width/2, height/2);
	maxRadius = min(center.x, center.y) * 0.9;
	
	colors = [color("#581845"), color("#900C3F"), color("#C70039"), color("#FF5733"), color("#FFC30F")];
	
	let total = map(min(width, height), 200, 1080, 20, 200);
	for(let i = 0; i < total; i++){
		let v = createVector(random(width), random(height));
		points.push({
			dest: v,
			pos: v.copy(),
			color: colors[floor(random(colors.length))],
			size: pow(random(), 5) * 60 + 10 
		});
	}
   // Create a featureExtractor that can extract the already learned features from MobileNet
   featureExtractor = ml5.featureExtractor('MobileNet', MobileNetmodelReady);
  //  noCanvas();
   // Create a video element
   video = createCapture(VIDEO);
   video.hide();
   // Append it to the videoContainer DOM element
   video.parent('videoContainer');
   // Create the UI buttons
   createButtons();
   poseNet = ml5.poseNet(video, poseNetmodelReady);
   poseNet.on('pose', gotPoses);
   
}

function draw() {
  //background(240);
  image(video, 0, 0,windowWidth, windowHeight);
  filter(GRAY);
  let d = dist(noseX, noseY, eyelX, eyelY);
  ellipse(noseX, noseY, d);

let nose = createVector(noseX, noseY);
	
	//update
	for(let i = 0; i < points.length; i++){
		let d1 = points[i].dest;
		let s1 = points[i].size;
		
		//distance from mouse
		if(d1.dist(nose) < minMouseDist){
			let a = atan2(d1.y - nose.y, d1.x - nose.x);
			d1.x =nose.x + cos(a) * minMouseDist;
			d1.y = nose.y + sin(a) * minMouseDist;
		}
		
		//distance from others
		for(let j = 0; j < points.length; j++){
			if(i == j) continue;
			let d2 = points[j].dest;
			let r = (s1 + points[j].size) * 0.5;
			if(d1.dist(d2) < minDist + r){
				let a = atan2(d2.y - d1.y, d2.x - d1.x);
				d2.x = d1.x + cos(a) * (minDist + r + 2);
				d2.y = d1.y + sin(a) * (minDist + r + 2);
			}
		}
		
		//circular constrain
		if(d1.dist(center) > maxRadius){
			let a = atan2(d1.y - center.y, d1.x - center.x);
			d1.x = center.x + cos(a) * (maxRadius - s1);
			d1.y = center.y + sin(a) * (maxRadius - s1);
		}
		
		//smooth
		points[i].pos.x += (d1.x - points[i].pos.x) * 0.09;
    points[i].pos.y += (d1.y - points[i].pos.y) * 0.09;
    

	}
	
	//draw
	
    // loop through foods with a for..of loop
 
    if(labelName=='Rock'){
      for(let i = 0; i < points.length; i++){
        fill(points[i].color);
        ellipse(points[i].pos.x, points[i].pos.y, points[i].size, points[i].size);
        // console.log(points[i].pos.x);
      }
    }else if (labelName == 'Paper') {
      for(let i = 0; i < points.length; i++){
        fill(points[i].color);
        points[i].pos.x=noseX;
        points[i].pos.y=noseY-100;
        ellipse(points[i].pos.x, points[i].pos.y, 20, 20);
  }
}
}

// food class



function MobileNetmodelReady(){
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  const features = featureExtractor.infer(video);
  
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  const features = featureExtractor.infer(video);
  knnClassifier.classify(features, gotResults);
}


// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "rock" to the classifier
  buttonA = select('#addClassRock');
  buttonA.mousePressed(function() {
    addExample('Rock');
  });

  buttonB = select('#addClassPaper');
  buttonB.mousePressed(function() {
    addExample('Paper');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
    }

    select('#confidenceRock').html(`${confidences['Rock'] ? confidences['Rock'] * 100 : 0} %`);
    select('#confidencePaper').html(`${confidences['Paper'] ? confidences['Paper'] * 100 : 0} %`);
    //console.log(result.label);
    labelName=result.label;
    console.log("labelName:"+labelName);
  }

  classify();
}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleRock').html(counts['Rock'] || 0);
  select('#examplePaper').html(counts['Paper'] || 0);
  
}

function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    let nX = ((poses[0].pose.keypoints[0].position.x)*width/640);
    let nY = ((poses[0].pose.keypoints[0].position.y)*height/480);
    let eX = ((poses[0].pose.keypoints[1].position.x)*width/640);
    let eY = ((poses[0].pose.keypoints[1].position.y)*height/480);
    noseX = lerp(noseX, nX, 0.5);
    noseY = lerp(noseY, nY, 0.5);
    eyelX = lerp(eyelX, eX, 0.5);
    eyelY = lerp(eyelY, eY, 0.5);
  }
}

function poseNetmodelReady() {
  console.log('poseNetmodel ready');
}
