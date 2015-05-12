/**
 * VirtualTrackBall object.
 */

VirtualTrackBall = function(){};

VirtualTrackBall.prototype = {

	default_acuteness : 10.0,
	
	/**
	* Set up the canvas size using the min value between canvas 
	* width and height to be our sphere radius.
	*/
	setCanvasSize: function(width, height){
		this.width = width;
		this.height = height;
		
		var min = width > height ? height : width;
		this.radius = min / 2;
		
		this.quaternion = new Quaternion();
		this.start;
	},
	
	/**
	* Create a track ball vector according the x and y position.
	*/
	getTrackBallVector: function(win_x, win_y){
		var x = (2.0 * win_x - this.width) / this.width;
		var y = (this.height - 2.0 * win_y) / this.height;
				
		var v = vec3(x, y, 0);
		var len = lengthOf(v);
		len = (len < 1.0) ? len : 1.0;
		var z = Math.sqrt(1 - len * len);
		v[2] = z;
		
		return normalize(v);
	},
	
	/**
	* Create track ball vector for start position.
	*/
	setRotationStart: function(x, y){
		this.start = this.getTrackBallVector(x, y);
	},

	/**
	* Create a new track ball vector based on the end x and y position, generate
	* a quaternion from the axis and angle realized between end and start vectors.
	* Finally, multiply this quaternion with the current 'quaternion' object
	* to rotate to the target position.
	*/
	rotateTo: function(targetX, targetY){
		var end = this.getTrackBallVector(targetX, targetY);
		var axis = normalize(cross(end, this.start));
		
		//FIXME: find out what is causing this NAN in the cross product/normalize
		if (isNaN(axis[0]))
			axis[0] = 0;
		if (isNaN(axis[1]))
			axis[1] = 0;
		if (isNaN(axis[2]))
			axis[2] = 0;
			
		var angle = 0 - (lengthOf(subtract(end, this.start)) * 2);
		
		var axisAngleQuat = new Quaternion();
		axisAngleQuat.set(axis, angle);
		
		this.quaternion = Quaternion.multiply(axisAngleQuat, this.quaternion);
		this.start = end;
	},
	
	/**
	* Check if the quaternion object is valid and generate a matrix from it.
	* Return the identity matrix otherwise.
	*/
	getRotationMatrix: function(){
		var temp = mat4();
		if(this.quaternion==null || this.quaternion==undefined)
			return temp;

		return Quaternion.getMatrixFromQuaternion(this.quaternion);
	},
	
	/**
	* Get the zoom factor based on the field of view
	* and an offset delta.
	* We use a a ratio to control the velocity of the zoom.
	*/
	getZoomFactor: function(fov, delta, znear, zfar) {
		if (fov != null && fov != undefined) {
			delta = (( delta > 0) ? 1 : -1);
			delta = delta * (1 / fov);
			
			var prevFov = fov;
			fov += delta;
			if ((fov <= znear * 20) || (fov >= zfar / 2))
				fov = prevFov;
		}

		return fov;
	}

};