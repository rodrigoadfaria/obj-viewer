/**
* Scene object
*/
Scene = function(gl) {
	this.gl = gl;
	
	this.buffers = new Array();
	this.meshes = new Array();
	
	this.isSmoothShading = false;
};

Scene.prototype = {
	
	/**
	* Add an object to the scene according to the shader chosen by the user.
	* For each object, we keep a buffer for it to control it independently.
	*/
	add: function(object) {
		if (object) {
			var normals = object.normals;
			if (this.isSmoothShading)
				normals = object.smooth_normals;
			
			var bufferObj = this.createBuffers(object.vertices, normals);
			if (bufferObj) {
				this.buffers.push(bufferObj);
				this.meshes.push(object);
			}
		}
	},
	
	/**
	* Clean up the buffers and meshes, create them again once the flat/smooth
	* has changed.
	*/
	toggleMeshShader: function() {
		var objects = this.meshes;
		this.buffers = new Array();
		this.meshes = new Array();
		
		for (i = 0; i < objects.length; i++) {
			this.add(objects[i]);
		}
	},

	/**
	* Create the buffers for the shaders.
	*/
	createBuffers: function(points, normals) {
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
		
		var buffer = new Buffer(vBuffer, nBuffer);
		return buffer;
	},
};

/**
* Buffer object
*/
Buffer = function(vertexBuffer, normalBuffer) {
	this.nBuffer = normalBuffer;
	this.vBuffer = vertexBuffer;
};