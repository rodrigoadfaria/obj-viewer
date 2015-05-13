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

Manipulator = function() {
	this.type = null;
	this.axis = null;
	this.active = false;
	this.index = -1;
	
	//used to show the user the offset X, Y and in any transformation
	this.offsetContent = '';
};

Manipulator.prototype = {

	ROTATE: "ROTATE",
	TRANSLATE: "TRANSLATE",
	SCALE: "SCALE",
	NONE: "NONE",
	
	getActiveObjectIndex: function() {
		return this.index;
	},
	
	setActiveObjectIndex: function(idx) {
		this.index = idx;
	},
	
	setType: function(keyCode) {
		this.type = keyCode;
		//user changing the manipulator
		this.active = false;
	},
	
	setAxis: function(keyCode) {
		this.axis = keyCode;
		
		if (this.type != null && (this.type == Key.T ||
								  this.type == Key.R ||
								  this.type == Key.S)) {
			this.active = true;
		}
	},
	
	getType: function() {
		if (this.type) {
			if (this.type == Key.R)
				return this.ROTATE;
			if (this.type == Key.S)
				return this.SCALE;
			if (this.type == Key.T)
				return this.TRANSLATE;
		}
		
		return this.NONE;
	},
	
	updateView: function() {
		var type = this.getType().toString();
		
		$('.man-content').hide();
		$('#manipulator').show();
		
		var divContentId = '#m-content-'+ type.toLowerCase();
		$(divContentId).find('.m-offset').text(this.offsetContent);
		$(divContentId).show();
	},
	
	makeOffsetView: function(x, y, z) {
		if (x != undefined && y != undefined && z != undefined) {
			this.offsetContent = 'Factors X: '+ x +
										' Y: '+ y +
										' Z: '+ z;
		} else {
			this.offsetContent = '';
		}
	},
	
	apply: function(direction) {
      if(direction != 0){
         var index = this.getActiveObjectIndex();

         if (index >= 0) {
            var object = scene.meshes[index];
            var offset = new Object();
            
            if (this.type == Key.T) {
               var maxT;
               var minT;
               var xT = object.translation[0][3];
               var yT = object.translation[1][3];
               var zT = object.translation[2][3];

               offset.x = 0;
               offset.y = 0;
               offset.z = 0;

               if(direction > 0)
                  delta = 0.1;
               else
                  delta = -0.1;

               if (this.axis == Key.X)
                     offset.x = delta;
               if (this.axis == Key.Y)
                  offset.y = delta;
               if (this.axis == Key.Z)
                  offset.z = delta;
                  
			   this.translate(object, offset, xT, yT, zT);
            } else if (this.type == Key.R) {
               var rot;
               if(direction > 0)
                  delta = 2;
               else
                  delta = -2;

               if (this.axis == Key.X)
                  rot = rotate(delta, [1, 0, 0]);
               if (this.axis == Key.Y)
                  rot = rotate(delta, [0, 1, 0]);
               if (this.axis == Key.Z)
                  rot = rotate(delta, [0, 0, 1]);

               this.rotate(object, rot);
            } else if (this.type == Key.S) {
               offset.x = 1; 
               offset.y = 1; 
               offset.z = 1;
               if(direction > 0)
                  delta = 1.1;
               else
                  delta = 0.9;
               if (this.axis == Key.X)
                  offset.x *= delta;
               if (this.axis == Key.Y)
                  offset.y *= delta;
               if (this.axis == Key.Z)
                  offset.z *= delta;
               
               this.scale(object, offset);
            } 
            
            render();
         }
      }
	},
	
	translate: function(object, offset, xT, yT, zT) {
		if (object) {
			this.makeOffsetView(xT, yT, zT);
			object.translation = translate(offset.x + xT, offset.y + yT, offset.z + zT);
			return this.updateMesh(object);
		}
	},
	
	scale: function(object, offset) {
		if (object) {
			this.makeOffsetView(offset.x, offset.y, offset.z);
			
			var scale = genScale(offset.x, offset.y, offset.z);
			object.scale = mult(object.scale, scale);
			
			return this.updateMesh(object);
		}
	},

	rotate: function(object, rot) {
		if (object) {
			object.rotate = mult(rot, object.rotate);
			
			return this.updateMesh(object);
		}
	},
	
	updateMesh: function(obj) {
		obj.modelMatrix = obj.scale;
		obj.modelMatrix = mult(obj.modelMatrix, obj.translation);
		obj.modelMatrix = mult(obj.modelMatrix, obj.rotate);
		return obj;
	}
};
