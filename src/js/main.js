$(function(){
	
	function headerApp() {
		if (!Modernizr.canvas) {
			return;
		}
		
		$('#headergen').attr('width', window.innerWidth+'px');
		$('#headergen').attr('height', window.innerHeight+'px');
		
		var displayCanvas = document.getElementById("headergen");
		var context = displayCanvas.getContext("2d");
		var displayWidth = displayCanvas.width;
		var displayHeight = displayCanvas.height;	
		
		var numCircles;
		var maxMaxRad;
		var minMaxRad;
		var minRadFactor;
		var circles;
		var iterations;
		var numPoints;
		var timer;
		var drawsPerFrame;
		var drawCount;
		var bgColor,urlColor;
		var lineWidth;
		var colorParamArray;
		var colorArray;
		var dataLists;
		var minX, maxX, minY, maxY;
		var xSpace, ySpace;
		var lineNumber;
		var twistAmount;
		var fullTurn;
		var lineAlpha;
		var maxColorValue;
		var minColorValue;
		
		init();
		
		function init() {
			numCircles = 12;
			maxMaxRad = 150;
			minMaxRad = 150;
			minRadFactor = 0;
			iterations = 9;
			numPoints = Math.pow(2,iterations)+1;
			drawsPerFrame = 2;
			
			fullTurn = Math.PI*2*numPoints/(1+numPoints);
			
			minX = -maxMaxRad;
			maxX = displayWidth + maxMaxRad;
			minY = displayHeight/2-50;
			maxY = displayHeight/2+50;
			
			twistAmount = 0.67*Math.PI*2;
			
			stepsPerSegment = Math.floor(800/numCircles);
			
			maxColorValue = 100;
			minColorValue = 20;
			lineAlpha = 0.25;
			
			bgColor = "#000000";
			urlColor = "#333333";
			
			lineWidth = 1;
			
			startGenerate();
			$(window).bind('resize', onResize);
		}
		
		function onResize() {
			$('#headergen').attr('width', window.innerWidth+'px');
			$('#headergen').attr('height', window.innerHeight+'px');
			startGenerate(); 
		}
			
		function startGenerate() {
			drawCount = 0;
			context.setTransform(1,0,0,1,0,0);
			context.clearRect(0,0,displayWidth,displayHeight);
			setCircles();
			colorArray = setColorList(iterations);
			lineNumber = 0;
			if(timer) {clearInterval(timer);}
			timer = setInterval(onTimer,1000/60);
		}
		
		function setColorList(iter) {
			var r0,g0,b0;
			var r1,g1,b1;
			var r2,g2,b2;
			var param;
			var colorArray;
			var lastColorObject;
			var i, len;
			
			var maxComponentDistance = 32;
			var maxComponentFactor = 0.5;
			
			r1 = 255;
			g1 = 102;
			b1 = 0;
			
			r0 = 193;
			g0 = 59;
			b0 = 0;
	
			a = lineAlpha;
			
			var colorParamArray = setLinePoints(iter);
			colorArray = [];
			
			len = colorParamArray.length;
			
			for (i = 0; i < len; i++) {
				param = colorParamArray[i];
				
				r = Math.floor(r0 + param*(r1 - r0));
				g = Math.floor(g0 + param*(g1 - g0));
				b = Math.floor(b0 + param*(b1 - b0));
					
				var newColor = "rgba("+r+","+g+","+b+","+a+")";
				
				colorArray.push(newColor);
			}
			
			return colorArray;
			
		}
		
		function setCircles() {
			var i;
			var r,g,b,a;
			var grad;
			
			circles = [];
			
			for (i = 0; i < numCircles; i++) {
				maxR = minMaxRad+Math.random()*(maxMaxRad-minMaxRad);
				minR = minRadFactor*maxR;
				
				var newCircle = {
					centerX: minX + i/(numCircles-1)*(maxX - minX),
					centerY: minY + i/(numCircles-1)*(maxY - minY),
					//centerY: minY + Math.random()*(maxY - minY),
					maxRad : maxR,
					minRad : minR,
					phase : i/(numCircles-1)*twistAmount,
					pointArray : setLinePoints(iterations)
					};
				circles.push(newCircle);
			}
		}
		
		function onTimer() {
			var i;
			var cosTheta, sinTheta;
			var theta;
			
			var numCircles = circles.length;
	
			var linParam;
			var cosParam;
			var centerX, centerY;
			var xSqueeze = 0.75;
			var x0,y0;
			var rad, rad0, rad1;
			var phase, phase0, phase1;
			
			for (var k = 0; k < drawsPerFrame; k++) {
			
				theta = lineNumber/(numPoints-1)*fullTurn;
				
				context.globalCompositeOperation = "lighter";
				
				context.lineJoin = "miter";
				
				context.strokeStyle = colorArray[lineNumber];
				context.lineWidth = lineWidth;
				context.beginPath();
				
				//move to first point
				centerX = circles[0].centerX;
				centerY = circles[0].centerY;
				rad = circles[0].minRad + circles[0].pointArray[lineNumber]*(circles[0].maxRad - circles[0].minRad);
				phase = circles[0].phase;
				x0 = centerX + xSqueeze*rad*Math.cos(theta + phase);
				y0 = centerY + rad*Math.sin(theta + phase);
				context.moveTo(x0,y0);
				
				for (i=0; i< numCircles-1; i++) {
					//draw between i and i+1 circle
					rad0 = circles[i].minRad + circles[i].pointArray[lineNumber]*(circles[i].maxRad - circles[i].minRad);
					rad1 = circles[i+1].minRad + circles[i+1].pointArray[lineNumber]*(circles[i+1].maxRad - circles[i+1].minRad);
					phase0 = circles[i].phase;
					phase1 = circles[i+1].phase;
					
					for (j = 0; j < stepsPerSegment; j++) {
						linParam = j/(stepsPerSegment-1);
						cosParam = 0.5-0.5*Math.cos(linParam*Math.PI);
						
						//interpolate center
						centerX = circles[i].centerX + linParam*(circles[i+1].centerX - circles[i].centerX);
						centerY = circles[i].centerY + cosParam*(circles[i+1].centerY - circles[i].centerY);
						
						//interpolate radius
						rad = rad0 + cosParam*(rad1 - rad0);
						
						//interpolate phase
						phase = phase0 + cosParam*(phase1 - phase0);
						
						x0 = centerX + xSqueeze*rad*Math.cos(theta + phase);
						y0 = centerY + rad*Math.sin(theta + phase);
						
						context.lineTo(x0,y0);
						
					}
					
				}
				
				context.stroke();
						
				lineNumber++;
				if (lineNumber > numPoints-1) {
					clearInterval(timer);
					timer = null;
					break;
				}
			}
		}
			
		//Here is the function that defines a noisy (but not wildly varying) data set which we will use to draw the curves.
		//We first define the points in a linked list, but then store the values in an array.
		function setLinePoints(iterations) {
			var pointList = {};
			var pointArray = [];
			pointList.first = {x:0, y:1};
			var lastPoint = {x:1, y:1}
			var minY = 1;
			var maxY = 1;
			var point;
			var nextPoint;
			var dx, newX, newY;
			var ratio;
			
			var minRatio = 0.5;
					
			pointList.first.next = lastPoint;
			for (var i = 0; i < iterations; i++) {
				point = pointList.first;
				while (point.next != null) {
					nextPoint = point.next;
					
					dx = nextPoint.x - point.x;
					newX = 0.5*(point.x + nextPoint.x);
					newY = 0.5*(point.y + nextPoint.y);
					newY += dx*(Math.random()*2 - 1);
					
					var newPoint = {x:newX, y:newY};
					
					//min, max
					if (newY < minY) {
						minY = newY;
					}
					else if (newY > maxY) {
						maxY = newY;
					}
					
					//put between points
					newPoint.next = nextPoint;
					point.next = newPoint;
					
					point = nextPoint;
				}
			}
			
			//normalize to values between 0 and 1
			//Also store y values in array here.
			if (maxY != minY) {
				var normalizeRate = 1/(maxY - minY);
				point = pointList.first;
				while (point != null) {
					point.y = normalizeRate*(point.y - minY);
					pointArray.push(point.y);
					point = point.next;
				}
			}
			//unlikely that max = min, but could happen if using zero iterations. In this case, set all points equal to 1.
			else {
				point = pointList.first;
				while (point != null) {
					point.y = 1;
					pointArray.push(point.y);
					point = point.next;
				}
			}
					
			return pointArray;		
		}	
	}
	
	
	function init() {
		
		headerApp();
		
		$('.js-remove').remove();
		$('.js-hidden').attr('class', 'js-show');
		
		$('#contact-form-submit').click(function(){
			
			$('#contact-form-msg').html('');
			$('#contact-form-msg').attr('class', '');
			$('#contact-form-submit').html('sending message <img src="img/load.gif" title="loading.."/>');
 
			$.post("send.php", $("#contact-form").serialize(),  function(response) {
				if(response==="success") {
					$('#contact-form-msg').attr('class', 'success');
					$('#contact-form-msg').html('<i class="icon-ok-sign"></i> Thank you for your message!');
				} else {
					$('#contact-form-msg').attr('class', 'error');
					if(response==="no_name") {
						$('#contact-form-msg').html('<i class="icon-bolt"></i> Please enter your name to send this message!');
					} else if(response==="no_mail") {
						$('#contact-form-msg').html('<i class="icon-bolt"></i> Please enter an valid email address to send this message!');
					} else if(response==="no_subject") {
						$('#contact-form-msg').html('<i class="icon-bolt"></i> Please enter a subject to send this message!');
					} else if(response==="no_message") {
						$('#contact-form-msg').html('<i class="icon-bolt"></i> Please enter a message!');
					}
				}
				$('#contact-form-submit').html('send message <i class="icon-circle-arrow-right"></i>');
			});
			return false;
		});
		
		$('#menu li:first').attr('class', 'active');
		$('#menu-mobile ul').remove();
		
		['top', 'about', 'work', 'contact'].forEach(function( v,i ) {
			$("."+v).click(function(e) {
				 $('html, body').stop().animate({
						 scrollTop: $("#"+v).offset().top - 38
				 }, 500);
				 e.preventDefault();
			});
		});
		
		// Cache selectors
		var lastId,
		topMenu = $("#menu"),
		topMenuHeight = topMenu.outerHeight(),
		// All list items
		menuItems = topMenu.find("a"),
		// Anchors corresponding to menu items
		scrollItems = menuItems.map(function(){
			var item = $($(this).attr("href"));
			if (item.length) { return item; }
		});
		
		// Bind to scroll
		$(window).scroll(function(){
			 // Get container scroll position
			 var fromTop = $(this).scrollTop()+topMenuHeight;
			 
			 // Get id of current scroll item
			 var cur = scrollItems.map(function(){
				 if ($(this).offset().top < fromTop)
					 return this;
			 });
			 // Get the id of the current element
			 cur = cur[cur.length-1];
			 var id = cur && cur.length ? cur[0].id : "";
			 
			 if (lastId !== id) {
					 lastId = id;
					 // Set/remove active class
					 menuItems
						 .parent().removeClass("active")
						 .end().filter("[href=#"+id+"]").parent().addClass("active");
			 }                   
		});
	}
	
	window.onload = init;
		
}());