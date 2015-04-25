
var program;
var canvas;
var gl;

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta = [0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

// to control the smooth state
var isSmoothShading = false;
var isStart = true;

// control shaders
var vertexShaderName = "vertex-shader";
var fragShaderName = "fragment-shader";

// contains the OBJ vertices, normals and indices
var OBJ;

// ID of the timeout event
var animID;

// tell us the kind of primitive to be used
var GL_DRAW = {
	TRIANGLES: 1,
	LINE_STRIP: 2
}
var glDraw = GL_DRAW.TRIANGLES;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {
	var t1 = subtract(vertices[b], vertices[a]);
	var t2 = subtract(vertices[c], vertices[b]);
	var normal = vec4(cross(t1, t2), 0);

	OBJ.vertices.push(vertices[a]); 
	OBJ.normals.push(normal); 
	OBJ.vertices.push(vertices[b]); 
	OBJ.normals.push(normal); 
	OBJ.vertices.push(vertices[c]); 
	OBJ.normals.push(normal); 
	OBJ.vertices.push(vertices[a]);  
	OBJ.normals.push(normal); 
	OBJ.vertices.push(vertices[c]); 
	OBJ.normals.push(normal); 
	OBJ.vertices.push(vertices[d]); 
	OBJ.normals.push(normal);    
}

// define faces of a cube
function colorCube() {
	OBJ.vertices = [];
	OBJ.normals = [];
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function initialize() {
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

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers	
    initObj = initShadersObject( gl, vertexShaderName, fragShaderName );
	program = initObj.progID;
    gl.useProgram( program );
    
    // draw simple cube for starters
    if (isStart) {
		OBJ = new Object();
		OBJ.mov_matrix = new Object();
		OBJ.mov_matrix.x = 0;
		OBJ.mov_matrix.y = 0;
		OBJ.mov_matrix.z = 0;
		OBJ.mov_matrix.scale = 1;
		colorCube();
	} 
	
	var normals = OBJ.normals;
	if (isSmoothShading && OBJ.smooth_normals)
		normals = OBJ.smooth_normals;

	if (isStart)// pass here just once
		prepareElements(initObj);
	
    // create vertex and normal buffers
    createBuffers(OBJ.vertices, normals);

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),   flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    
    render();
}

/**
* Prepare the elements of the page to listen to the needed events.
*/
function prepareElements(initObj) {
	setupRotation();
	
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
		
		createBuffers(OBJ.vertices, OBJ.normals);
		isSmoothShading = false;
	});

	btnMeshSmooth.click(function() {
		btnMeshFlat.removeClass('active');
		btnMeshSmooth.addClass('active');
		
		createBuffers(OBJ.vertices, OBJ.smooth_normals);
		isSmoothShading = true;
	});

	var btnTriangles = $("#btn-triangles");
	var btnLines = $("#btn-lines");
	btnTriangles.click(function() {
		btnLines.removeClass('active');
		btnTriangles.addClass('active');
		
		glDraw = GL_DRAW.TRIANGLES;
	});

	btnLines.click(function() {
		btnTriangles.removeClass('active');
		btnLines.addClass('active');
		
		glDraw = GL_DRAW.LINE_STRIP;
	});
	
    $("#btn-load-file").click(function() {
		$("#files").trigger('click');
	});
	$("#files").change(function (evt) {
		setupFileLoad(evt);
    });
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
}

/**
* Draw the object according the material given, light
* and position in the canvas space.
*/
var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    if (flag) theta[axis] += 2.0;
            
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);

	modelViewMatrix = mult(modelViewMatrix, genScale([OBJ.mov_matrix.scale, OBJ.mov_matrix.scale, OBJ.mov_matrix.scale]));
    modelViewMatrix = mult(modelViewMatrix, translate([-OBJ.mov_matrix.x, -OBJ.mov_matrix.y, -OBJ.mov_matrix.z]));
	
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    
    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    if (glDraw == GL_DRAW.TRIANGLES)
		gl.drawArrays( gl.TRIANGLES, 0, OBJ.vertices.length);
	else if (glDraw == GL_DRAW.LINE_STRIP)
		gl.drawArrays(gl.LINE_STRIP, 0, OBJ.vertices.length);
            
    animID = requestAnimFrame(render);
}

/**
* Create the buffers for the shaders.
*/
function createBuffers(points, normals) {
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
};

/**
* Set up the toggle button to change between the shaders 
* available in the HTML file.
*/
function toggleShader(initObj) {
	// stop old animation to avoid redrawing
	if (animID) {
		cancelAnimationFrame(animID);
		animID = undefined;
	}
	
	gl.deleteProgram(initObj.progID);
	gl.deleteShader(initObj.vertID);
	gl.deleteShader(initObj.fragID);
	
	isStart = false;
	init();	
};

/**
* Set up the rotation event buttons.
*/
function setupRotation() {
	var btnToggleRotation = $("#btn-toggle-rotation");
	var btnX = $("#btn-x");
	var btnY = $("#btn-y");
	var btnZ = $("#btn-z");
	
	btnX.click(function() {
		axis = xAxis;
		btnX.addClass('active');
		btnY.removeClass('active');
		btnZ.removeClass('active');
	});
	btnY.click(function() {
		axis = yAxis;
		btnX.removeClass('active');
		btnY.addClass('active');
		btnZ.removeClass('active');

	});
	btnZ.click(function() {
		axis = zAxis;
		btnX.removeClass('active');
		btnY.removeClass('active');
		btnZ.addClass('active');
	});
    
	btnToggleRotation.click(function(){
		btnToggleRotation.addClass('active');
		flag = !flag;
		if (flag)
			btnToggleRotation.removeClass('active');
	});
};

/**
* Set up the button to the file load event.
*/
function setupFileLoad(evt) {
	//Retrieve the file chosen from the FileList object
	var file = evt.target.files[0]; 

	if (file) {
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
		// stop old animation to avoid redrawing
		if (animID) {
			cancelAnimationFrame(animID);
			animID = undefined;
		}
		
		// reset the modelview/projection matrix
		modelViewMatrix = null;
		projectionMatrix = null;
		modelViewMatrixLoc = null;
		projectionMatrixLoc = null;
		theta = [0, 0, 0];
		
		$("#file-name").text(fileName);
		isStart = false;
		init();
	}
}