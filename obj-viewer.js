
var program;
var canvas;
var gl;

var lightPosition = vec4( 30.0, 30.0, 50.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var viewMatrix, projectionMatrix, modelMatrix;
var viewMatrixLoc, projectionMatrixLoc, modelMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var theta = [0, 0, 0];
var thetaLoc;

// camera definitions
var eye = vec3(0.0, 0.0, 30.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe perspective view
var znear = 0.1;
var zfar = 100.0;
var fovy = 10.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0;       // Viewport aspect ratio

// to control the start up
var isStart = true;

// control shaders
var vertexShaderName = "vertex-shader";
var fragShaderName = "fragment-shader";

// scene object
var scene;

// tell us the kind of primitive to be used
var GL_DRAW = {
	TRIANGLES: 1,
	LINE_STRIP: 2
}
var glDraw = GL_DRAW.TRIANGLES;

var virtualTB;

window.onload = function initialize() {
	scene = new Scene();
	init();
}

/**
* Set up the webgl, shaders, page components, and
* the shader program variables.
*/
function init() {
    canvas = document.getElementById( "gl-canvas" );
    resizeCanvas();
	
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // disable the context menu when right click is pressed
	canvas.oncontextmenu = function() {
		return false;  
	};
	
	// create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers	
    initObj = initShadersObject( gl, vertexShaderName, fragShaderName );
	program = initObj.progID;
    gl.useProgram( program );

	if (isStart)// pass here just once
		prepareElements(initObj);

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model, view and projection matrices
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),   flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    
    render();
	$('.overlay').hide();
	if($.browser.msie){
	   $('.overlay').css({"visibility":"hidden"});
	}
}

/**
* Prepare the elements of the page to listen to the needed events.
*/
function prepareElements(initObj) {
	var btnShadingVertex = $("#shading-vertex");
	var btnShadingFragment = $("#shading-fragment");
	btnShadingVertex.click(function() {
		vertexShaderName = "vertex-shader";
		fragShaderName   = "fragment-shader";
		btnShadingVertex.addClass('active');
		btnShadingFragment.removeClass('active');

		toggleShader(initObj);
	});
	btnShadingFragment.click(function() {
		vertexShaderName = "vertex-shader-frag";
		fragShaderName = "fragment-shader-frag";
		btnShadingVertex.removeClass('active');
		btnShadingFragment.addClass('active');

		toggleShader(initObj);
	});
	
	var btnMeshFlat = $("#shading-flat");
	var btnMeshSmooth = $("#shading-smooth");
	btnMeshFlat.click(function() {
		btnMeshSmooth.removeClass('active');
		btnMeshFlat.addClass('active');
		
		scene.isSmoothShading = false;
		scene.toggleMeshShader();
		render();
	});

	btnMeshSmooth.click(function() {
		btnMeshFlat.removeClass('active');
		btnMeshSmooth.addClass('active');
		
		scene.isSmoothShading = true;
		scene.toggleMeshShader();
		render();
	});

	var btnTriangles = $("#btn-triangles");
	var btnLines = $("#btn-lines");
	btnTriangles.click(function() {
		btnLines.removeClass('active');
		btnTriangles.addClass('active');
		
		glDraw = GL_DRAW.TRIANGLES;
		render();
	});

	btnLines.click(function() {
		btnTriangles.removeClass('active');
		btnLines.addClass('active');
		
		glDraw = GL_DRAW.LINE_STRIP;
		render();
	});
	
    $("#btn-load-file").click(function() {
		$("#files").trigger('click');
	});
	$("#files").change(function (evt) {
		setupFileLoad(evt);
    });

	virtualTB = new VirtualTrackBall();
	setupCanvasMouseEvents();	
}

/**
* Resize event to change the aspect ratio of the canvas.
*/
window.onresize = resizeCanvas;

function resizeCanvas() {
	var height = window.innerHeight;
	
	var ratio = canvas.width/canvas.height;
	var width = height * ratio;
	
	canvas.style.width = width / 1.25   + 'px';
	canvas.style.height = height / 1.25 + 'px';
	aspect = canvas.width/canvas.height;
}

/**
* Draw the object according the material given, light
* and position in the canvas space.
*/
var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    viewMatrix = lookAt(eye, at, up);

	var vtrm = virtualTB.getRotationMatrix();
	viewMatrix = mult(viewMatrix, vtrm);

	projectionMatrix = perspective(fovy, aspect, znear, zfar);

	gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

	scene.buffers = new Array(scene.meshes.length);
	for (i = 0; i < scene.meshes.length; i++) {
		obj = scene.meshes[i];
		
		var bufferObj = scene.createBuffers(obj.vertices, obj.draw_normals);
		if (bufferObj) {
			scene.buffers[i] = bufferObj;
		}
		
		gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(obj.modelMatrix));

		if (glDraw == GL_DRAW.TRIANGLES)
			gl.drawArrays( gl.TRIANGLES, 0, obj.vertices.length);
		else if (glDraw == GL_DRAW.LINE_STRIP)
			gl.drawArrays(gl.LINE_STRIP, 0, obj.vertices.length);
	}
}

/**
* Set up the toggle button to change between the shaders 
* available in the HTML file.
*/
function toggleShader(initObj) {
	gl.deleteProgram(initObj.progID);
	gl.deleteShader(initObj.vertID);
	gl.deleteShader(initObj.fragID);
	
	isStart = false;
	init();	
};

/**
* Set up the button to the file load event.
*/
function setupFileLoad(evt) {
	//Retrieve the file chosen from the FileList object
	var file = evt.target.files[0]; 

	if (file) {
		$('.overlay').show();
		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			var contents = e.target.result;
			
			loadObject(contents, file.name);			
		}
		
		fileReader.readAsText(file);
	} else { 
		alert("Ops, you need to select a valid file :(");
	}
};

/**
* Call the parser to get the file content
* and keep it in our OBJ variable.
*/
function loadObject(data, fileName) {
	OBJ = loadObjFile(data);
	if (OBJ) {
		scene.add(OBJ);
		$("#file-name").text(fileName);
		isStart = false;
		init();
	}	
};

/**
* Set up mouse down, up and move events in canvas element.
*/
function setupCanvasMouseEvents() {
	virtualTB.setCanvasSize(canvas.width, canvas.height);
	
	canvas.addEventListener("mousedown", this.mouseDownListener(), false);
	canvas.addEventListener("mouseup", this.mouseUpListener(), false);
	canvas.addEventListener("mousemove", this.mouseMoveListener(), false);
	canvas.addEventListener("mousewheel", this.mouseWheelListener(), false );
	
	canvas.addEventListener("keyup", this.keyUpListener(), false );
};

/**
* Mouse down event listener used to capture the click in the canvas area
* to start monitoring the user movements.
*/
function mouseDownListener() {
	return function(event) {
		virtualTB.mousedown = true;
		var rect = canvas.getBoundingClientRect();
		virtualTB.setRotationStart(event.clientX - rect.left, event.clientY - rect.top);
	};
};

/**
* Mouse up event listener used to capture the release of the mouse
* when clicked in the canvas area to end up the user movements.
*/
function mouseUpListener() {
	return function(event) {
		virtualTB.mousedown = false;
	};
};

/**
* Mouse move event listener used to keep tracking the user movements
* in the canvas area and, so:
* 1. Rotate if the event came from left click.
* 2. Scale if the event is from the right click.
*/
var tempMouseY = 0;
function mouseMoveListener() {
	return function(event) {
		if (virtualTB.mousedown == true) {
			if (event.button === 2 || event.buttons === 2) {//right click
				var direction = event.pageY > tempMouseY;
				
				tempMouseY = event.pageY;
				var d = 1;
				if (direction)
					d = -1;

				fovy = virtualTB.getZoomFactor(fovy, d, znear, zfar);
			} else {
				var rect = canvas.getBoundingClientRect();
				var x = event.clientX - rect.left;
				var y = event.clientY - rect.top;
				virtualTB.rotateTo(x, y);
			}
			
			render();
		}
	}
};

/**
* Mouse wheel event listener used to keep tracking the mouse middle button 
* user movements in the canvas area and scale the scene according it.
*/
function mouseWheelListener() {
	return function(event) {
		var d = ((typeof event.wheelDelta != "undefined") ? 
			(-event.wheelDelta) : event.detail);
		d = ( d > 0) ? 1 : -1;

		fovy = virtualTB.getZoomFactor(fovy, d, znear, zfar);
		render();
	};
};

var Key = {
	R: 82,
	S: 83,
	T: 84,
	X: 88,
	Y: 89,
	Z: 90,
	ESC: 27,
	DEL: 46,
	NONE: -1
};

function keyUpListener() {
	return function(event) {
		var code = (event.keyCode ? event.keyCode : event.which);
		console.log(code);
		
		//FIXME: we are applying the manipulators in the last object,
		//change it by the ray generated by the mouse pick.
		var index = scene.meshes.length - 1;
		if (code == Key.DEL || code == Key.X) {
			scene.remove(index);
		}
		
		render();
	};
};