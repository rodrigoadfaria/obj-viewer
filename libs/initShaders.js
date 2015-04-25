//
//  LoadShaders.js
//

function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    var vertShdr = getShader(gl, vertexShaderId );
    var fragShdr = getShader(gl, fragmentShaderId );

    var program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
};

function initShadersObject( gl, vertexShaderId, fragmentShaderId )
{
    var vertShdr = getShader(gl, vertexShaderId );
    var fragShdr = getShader(gl, fragmentShaderId );

    var program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return {'progID': program, 'vertID': vertShdr, 'fragID': fragShdr};
};

function getShader(gl, shaderId) {
    var shader;

    var vertElem = document.getElementById( shaderId );
    if ( !vertElem ) { 
        alert( "Unable to load shader element " + shaderId );
        return -1;
    } else {
		if (vertElem.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (vertElem.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        gl.shaderSource( shader, vertElem.text );
        gl.compileShader( shader );
        if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
            var msg = "Shader id["+ shaderId +"] failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( shader ) + "</pre>";
            alert( msg );
            return -1;
        }
    }
	
	return shader;
}