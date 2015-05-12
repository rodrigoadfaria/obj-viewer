/**
* Starts the parser to get the content from the
* OBJ file given by the user.
*/
function loadObjFile(content) {
	var objDoc = new OBJDoc();
	var result = objDoc.parse(content);
	if (!result) {
		console.log("OBJ file parsing error.");
		return null;
	}

	return objDoc.parseResult();
}

// OBJDoc object
var OBJDoc = function() {
	this.objects = [];
	this.vertices = [];
	this.normals = [];
}

/**
* Break up the file into a lines array and parse it
* line by line according to the commands from the OBJ
* file structure. For this exercise, we are skipping some
* commands that are not gonna be used such as 'mtlib',
* 'usemtl'.
*/
OBJDoc.prototype.parse = function(content) {
	var lines = content.split('\n');
	lines.push(null);
	var index = 0;
	var currentObject = null;

	var line;
	var sp = new StringParser();
	while ((line = lines[index++]) != null) {
		sp.init(line);
		var command = sp.getWord();
		if (command == null) continue;

		switch(command){
		case '#':      	   // Skip comments
		case 'mtllib':	   // Skip material
		case 'usemtl':     // Skip material name
			continue;	   // Go to the next line
		case 'o':          // Object name
		case 'g':          // Object group name
			var object = new Mesh(sp.getWord());
			this.objects.push(object);
			currentObject = object;
			continue;
		case 'v':          // Read vertex
			var vertex = this.parseVertex(sp);
			this.vertices.push(vertex); 
			continue; 
		case 'vn':         // Read normal
			var normal = this.parseNormal(sp);
			this.normals.push(normal); 
			continue;
		case 'f':          // Read face
			var face = this.parseFace(sp, this.vertices);

			if (!currentObject) { // Not found any 'g' or 'o' object name
				object = new Mesh("not_named_obj_" + new Date().getTime());
				this.objects.push(object);
				currentObject = object;
			}
			currentObject.addFace(face);
			continue;
		}
	}

	return true;
}

/**
* Parse the vertex using to a float value.
*/
OBJDoc.prototype.parseVertex = function(sp) {
	var x = sp.getFloat();
	var y = sp.getFloat();
	var z = sp.getFloat();
	return (new Vertex(x, y, z));
}

/**
* Parse the normal from the file to a Normal object.
*/
OBJDoc.prototype.parseNormal = function(sp) {
	var x = sp.getFloat();
	var y = sp.getFloat();
	var z = sp.getFloat();
	return (new Normal(x, y, z));
}

/**
* Parse the face according to the 'f' command in the OBJ file.
* If the face has more than 4 vertices, subdivide it in triangles
* and calculate the normals for each face.
* The face line is separated by a slash with the objects:
* vertex/texture-coordinate/normal.
*/
OBJDoc.prototype.parseFace = function(sp, vertices) {
	var face = new Face();
	var line = sp.getWord();
	while(line != null) {
		var faceInfo = line.split('/');
		if (faceInfo.length >= 1) {//vertex
			// remove 1 because the index in the OBJ file starts in 1
			var vertexIdx = parseInt(faceInfo[0]) - 1;
			face.vIndices.push(vertexIdx);
		}
		if (faceInfo.length >= 3) {//normal
			var normalIdx = parseInt(faceInfo[2]) - 1;
			face.nIndices.push(normalIdx);
		} else {
			face.nIndices.push(-1);
		}
		
		line = sp.getWord();
	}

	var p0 = this.getPointByIndex(vertices, face.vIndices[0]);
	var p1 = this.getPointByIndex(vertices, face.vIndices[1]);
	var p2 = this.getPointByIndex(vertices, face.vIndices[2]);
	var normal = computeFaceNormal(p0, p1, p2);
	face.normal = new Normal(normal[0], normal[1], normal[2]);
	
	if (face.vIndices.length > 3) {
		this.splitFace(face);
	}

	return face;
}

/**
* Split the face in new triangles when bigger than 3 vertices.
*/
OBJDoc.prototype.splitFace = function(face) {
	var x = 0, y = 1, z = 2;
	var size = face.vIndices.length - 2;
	
	var splitVIdx = [size * 3];
	var splitNIdx = [size * 3];
	for (var i = 0; i < size; i++) {
		splitVIdx[i*3 + x] = face.vIndices[x];
		splitVIdx[i*3 + y] = face.vIndices[i+y];
		splitVIdx[i*3 + z] = face.vIndices[i+z];
		splitNIdx[i*3 + x] = face.nIndices[x];
		splitNIdx[i*3 + y] = face.nIndices[i+y];
		splitNIdx[i*3 + z] = face.nIndices[i+z];
	}
	
	face.vIndices = splitVIdx;
	face.nIndices = splitNIdx;	
}

/**
* Get a point in the vertices array in the given index.
*/
OBJDoc.prototype.getPointByIndex = function(vertices, idx) {
	point = [ vertices[idx].x,
			  vertices[idx].y,
			  vertices[idx].z];
			  
	return point;
}

/**
* Store each face which has an intersection with the ixVertice'th vertex
* and sum up all adjacent faces normals to get the mean normal around
* the vertex.
*/
OBJDoc.prototype.computeVertexNormal = function (ixVertice, obj, smoothNormals) {
	var adjFaces = new Array(0);
	
	for (var ix = 0; ix < obj.faces.length; ix++) {
		var pFace = obj.faces[ix];
		
		for (var k = 0; k < pFace.vertices.length; k++) {
			var vertex = pFace.vertices[k];
			if (vertex == ixVertice)
				adjFaces.push(pFace);
		}
	}
	
	for (var jx = 0; jx < adjFaces.length; jx++) {
		var adjFace = adjFaces[jx];
		ixVertice.normal = add(ixVertice.normal, vec4(adjFace.normal.x, adjFace.normal.y, adjFace.normal.z, 0));
	}
	
	smoothNormals.push(normalize(ixVertice.normal));
}

/**
* Make room for vertex coordinates, normals, and 'smooth' normals.
* We track the normals and vertices got before from the file,
* check whether 'vn' is present to use it as the normal face and 
* compute normals for the smooth shading.
*/
OBJDoc.prototype.parseResult = function() {
	var vertices = [];
	var normals = [];
	var smoothNormals = [];
	var tMatrix = new Tmatrix();
	
	for (var i = 0; i < this.objects.length; i++) {
		var object = this.objects[i];
		for (var j = 0; j < object.faces.length; j++) {
			var face = object.faces[j];
			for (var k = 0; k < face.vIndices.length; k++) {
				var vertex = this.vertices[face.vIndices[k]];
				vertices.push(vec4(vertex.x, vertex.y, vertex.z, 1));
				
				tMatrix.calcMinMaxValue(vertex.x, vertex.y, vertex.z);
				
				// calculated normals
				var fNormal = vec4(face.normal.x, face.normal.y, face.normal.z, 0);
				
				// we keep the face normal for the flat shader
				normals.push(fNormal);
				
				var idxNormal = face.nIndices[k];
				if (idxNormal >= 0) {
					// in this case, we have normals in the file
					var normal = this.normals[idxNormal];
					fNormal = vec4(normal.x, normal.y, normal.z, 0);
				}
				
				vertex.normal = fNormal;
				face.addVertex(vertex);
			}
		}

		for (var j = 0; j < object.faces.length; j++) {
			var face = object.faces[j];
			for (var k = 0; k < face.vertices.length; k++) {
				this.computeVertexNormal(face.vertices[k], object, smoothNormals);
			}
		}
	
	}
	
	var objInfo = new Object();
	objInfo.vertices = vertices;
	objInfo.normals = normals;
	objInfo.faces = object.faces;
	objInfo.smooth_normals = smoothNormals;

	// get the mean value of each axis to translate
	// the object to the world origin.
	tMatrix.x = (tMatrix.max_x - Math.abs(tMatrix.min_x)) / 2;;
	tMatrix.y = (tMatrix.max_y - Math.abs(tMatrix.min_y)) / 2;
	tMatrix.z = (tMatrix.max_z - Math.abs(tMatrix.min_z)) / 2;;
	tMatrix.generateScaleFactor();
	objInfo.mov_matrix = tMatrix;

	objInfo.scale = genScale([objInfo.mov_matrix.scale, objInfo.mov_matrix.scale, objInfo.mov_matrix.scale]);
	objInfo.translation = translate([-objInfo.mov_matrix.x, -objInfo.mov_matrix.y, -objInfo.mov_matrix.z]);
   objInfo.rotate = mat4([1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]);
	
	objInfo.modelMatrix = objInfo.scale;
	objInfo.modelMatrix = mult(objInfo.modelMatrix, objInfo.translation);	
	objInfo.modelMatrix = mult(objInfo.modelMatrix, objInfo.rotate);	
	
	return objInfo;
}

var Tmatrix = function () {
	this.started = false,
	
	this.min_x = 0,
	this.min_y = 0,
	this.min_z = 0,
	this.max_x = 0,
	this.max_y = 0,
	this.max_z = 0,
	this.x = 0,
	this.y = 0,
	this.z = 0,
	
	this.scale = 1
};

/**
* Look for the max value of x, y or z coordinate to be
* the candidate for the scale factor.
*/
Tmatrix.prototype.generateScaleFactor = function() {
	this.scale = Math.abs(this.max_x);
	
	var maxAbsY = Math.abs(this.max_y);
	if (this.scale < maxAbsY)
		this.scale = maxAbsY;
	
	var maxAbsZ = Math.abs(this.max_z);
	if (this.scale < maxAbsZ)
		this.scale = maxAbsZ;
		
	this.scale = 1 / this.scale;
}

/**
* Compute the min/max value for each axis 
* using the value of each vertex.
*/
Tmatrix.prototype.calcMinMaxValue = function(x, y, z) {
	if (this.started) {
		if (this.min_x > x)
			this.min_x = x;
		else if (this.max_x < x)
			this.max_x = x;

		if (this.min_y > y)
			this.min_y = y;
		else if (this.max_y < y)
			this.max_y = y;

		if (this.min_z > z)
			this.min_z = z;
		else if (this.max_z < z)
			this.max_z = z;
			
	} else {
		this.min_x = x;
		this.min_y = y;
		this.min_z = z;
		this.started = true;
	}
}

// Vertex Object
var Vertex = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

// Normal Object
var Normal = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

// Mesh Object
var Mesh = function(name) {
	this.name = name;
	this.faces = new Array(0);
}

/**
* Add a face to the Mesh object.
*/
Mesh.prototype.addFace = function(face) {
	this.faces.push(face);
}

// Face Object
var Face = function() {
	this.vIndices = new Array(0);
	this.nIndices = new Array(0);
	this.vertices = new Array(0);
}

/**
* Add a vertex to the Face object.
*/
Face.prototype.addVertex = function(vertex) {
	this.vertices.push(vertex);
}

// StringParser
var StringParser = function(str) {
	this.str;
	this.index;
	this.init(str);
}

/**
* Initialize StringParser object.
*/
StringParser.prototype.init = function(str){
	this.str = str;
	this.index = 0;
}

/** 
* Skip delimiters according to the character
* set in the isDelimiter() function.
*/
StringParser.prototype.skipDelimiters = function()  {
	for(var i = this.index; i < this.str.length; i++){
		if (this.isDelimiter(i)) continue;
		break;
	}
	
	this.index = i;
}

/**
* Get a word, skipping the delimiters and verifying 
* the length to the next word.
*/
StringParser.prototype.getWord = function() {
	this.skipDelimiters();
	for (var i = this.index; i < this.str.length; i++) {
		if (this.isDelimiter(i)) 
			break;
	}
	
	var offset = i - this.index;
	if (offset == 0)
		return null;
		
	var word = this.str.substr(this.index, offset);
	//increment offset due the size of the char
	this.index +=  ++offset;

	return word;
}

/**
* Check if the chart at the given index is
* TAB, SPACE, '(', ')' or '"'.
*/
StringParser.prototype.isDelimiter = function(idx) {
	var c = this.str.charAt(idx);
	if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"')
		return true;
		
	return false;
}

/**
* Get a word and convert it to an integer number.
*/
StringParser.prototype.getInt = function() {
	return parseInt(this.getWord());
}

/**
* Get a word and convert it to a floating point number.
*/
StringParser.prototype.getFloat = function() {
	return parseFloat(this.getWord());
}

/**
* Compute the face normals.
*/
function computeFaceNormal(p1, p2, p3) {
	var t1 = subtract(p2, p1);
	var t2 = subtract(p3, p1);

	var normal = normalize(vec4(cross(t1, t2), 0));
	if (isNaN(normal[0]) || isNaN(normal[1]) || isNaN(normal[2]) || isNaN(normal[3]))
		normal = [0.0, 1.0, 0.0, 0.0];//some problem occurred, using default
		
	return normal;
}
