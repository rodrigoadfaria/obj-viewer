/**
* Quaternion object
*/
Quaternion = function(x, y, z, w) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = (w !== undefined) ? w : 1;
};

Quaternion.prototype = {
	x : 0,
	y : 0,
	z : 0,
	w : 0,

	/**
	* Allow us to represent a 3D rotation from an angle and an axis
	* represented by a vector (ax,ay,az) of unit length.
	* We assume that the axis unit vector is normalized.
	*
	* @reference http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
	*/
	set: function(axis, theta) {
		var s = Math.sin(theta / 2);
		this.x = axis[0] * s;
		this.y = axis[1] * s;
		this.z = axis[2] * s;
		this.w = Math.cos(theta / 2);
		
		return this.normalize();
	},
	
	/**
	* Multiply the given quaternion to this object.
	*
	* @reference http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
	*/
	mult: function(quatb) {
		var qax = this.x, qay = this.y, qaz = this.z, qaw = this.w;
		var qbx = quatb.x, qby = quatb.y, qbz = quatb.z, qbw = quatb.w;

		this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		return this.normalize();
	},
	
	/**
	* Normalize this quaternion object.
	*
	* @reference http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
	*/
	normalize: function() {
		var n = Math.sqrt(this.x*this.x + this.y*this.y + 
						  this.z*this.z + this.w*this.w);
		this.x /= n;
		this.y /= n;
		this.z /= n;
		this.w /= n;
		
		return this;
	}
};

/**
* Multiply the given quaternions and set the result in a third one.
*
* @reference http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
*/
Quaternion.multiply = function ( q1, q2 ) {
	var quat = new Quaternion();
	
	if ((q1==null || q1==undefined) || (q2==null || q2==undefined))// not valid parameters
		return quat;

	quat.x =  q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
	quat.y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
	quat.z =  q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
	quat.w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;

	return quat.normalize();
};

/**
* Transform the given quaternion to a mat4 matrix which can be used
* to represent a rotation in the form:
 ----------------------------------------------------------------
| 1 - 2*qy2 - 2*qz2  |  2*qx*qy - 2*qz*qw  |  2*qx*qz + 2*qy*qw  |
| 2*qx*qy + 2*qz*qw  |  1 - 2*qx2 - 2*qz2  |  2*qy*qz - 2*qx*qw  |
| 2*qx*qz - 2*qy*qw  |  2*qy*qz + 2*qx*qw  |  1 - 2*qx2 - 2*qy2  |
 ----------------------------------------------------------------
*
* @reference http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
*/
Quaternion.getMatrixFromQuaternion = function(quat) {
	var result = mat4();
	if (quat==null || quat==undefined)// not valid parameters
		return result;

	var x2 = quat.x * quat.x;
	var y2 = quat.y * quat.y;
	var z2 = quat.z * quat.z;
	var xy = quat.x * quat.y;
	var xz = quat.x * quat.z;
	var yz = quat.y * quat.z;
	var xw = quat.w * quat.x;
	var yw = quat.w * quat.y;
	var zw = quat.w * quat.z;
 
	result[0] = [1.0 - 2.0 * (y2 + z2), 2.0 * (xy - zw), 2.0 * (xz + yw), 0.0],
	result[1] = [2.0 * (xy + zw), 1.0 - 2.0 * (x2 + z2), 2.0 * (yz - xw), 0.0],
	result[2] = [2.0 * (xz - yw), 2.0 * (yz + xw), 1.0 - 2.0 * (x2 + y2), 0.0],
	result[3] = [0.0, 0.0, 0.0, 1.0];
	
	return result;
};