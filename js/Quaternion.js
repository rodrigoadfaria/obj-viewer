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

	// reference: http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
	setFromAxisAngle : function(axis, theta) {
		var s = Math.sin(theta / 2);
		this.x = axis[0] * s;
		this.y = axis[1] * s;
		this.z = axis[2] * s;
		this.w = Math.cos(theta / 2);
		return this;
	},

	//reference: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
	multiply : function(quatb) {
		var qax = this.x, qay = this.y, qaz = this.z, qaw = this.w;
		var qbx = quatb.x, qby = quatb.y, qbz = quatb.z, qbw = quatb.w;

		this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		return this;
	},

	//reference: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/transforms/index.htm
	makeRotationFromQuaternion : function() {
		var x = this.x, y = this.y, z = this.z, w = this.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		var result = mat4();

		result[0] = [ 1 - (yy + zz), xy - wz,       xz + wy,       0 ],
		result[1] =	[ xy + wz,       1 - (xx + zz), yz - wx,       0 ],
		result[2] = [ xz - wy,       yz + wx,       1 - (xx + yy), 0 ],
		result[3] = [ 0,             0,             0,             1 ];

		return result;
	},
};