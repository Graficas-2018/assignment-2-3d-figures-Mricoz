var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas){
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas){
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas){
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// TO DO: Create the functions for each of the figures.
function createPyramid(gl, translation, rotationAxis){
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
        -1.0, -2.0,  0.0,
         1.0, -2.0,  0.0,
         0.0,  0.0,  0.0,
        -1.5,  0.0,  0.0,
         0.0,  1.5,  0.0,
         1.5,  0.0,  0.0,

        -1.5,  0.0,  0.0,
         0.0,  1.5,  0.0,
         0.0,  0.0,  2.0,

         0.0,  1.5,  0.0,
         1.5,  0.0,  0.0,
         0.0,  0.0,  2.0,

         1.5,  0.0,  0.0,
         1.0, -2.0,  0.0,
         0.0,  0.0,  2.0,

         1.0, -2.0,  0.0,
        -1.0, -2.0,  0.0,
         0.0,  0.0,  2.0,

        -1.0, -2.0,  0.0,
        -1.5,  0.0,  0.0,
         0.0,  0.0,  2.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
    ];

    var vertices = [6, 3, 3, 3, 3, 3];
    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    var i = 0;
    for (const color of faceColors){
        for (var j = 0; j < vertices[i]; j++){
            vertexColors = vertexColors.concat(color);
        }
        i++
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
    var pyramidIndices = [
        0, 1, 2,   0, 2, 3,   3, 2, 4,  4, 2, 5,  1, 2, 5, // pent
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    var pyramid = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
        vertSize:3, nVerts:21, colorSize:4, nColors: 20, nIndices:30,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function(){
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    return pyramid;
}

function createScutoid(gl, translation, rotationAxis){
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
        // Hex
        -1.0,  2.0, -1.5,
         1.0,  2.0, -1.5,
         0.0,  2.0,  0.0, // centro
         2.0,  2.0,  0.0,
         1.0,  2.0,  1.5,
        -1.0,  2.0,  1.5,
        -2.0,  2.0,  0.0,

        // Pent
        -1.0, -2.0, -1.5,
         1.0, -2.0, -1.5,
         0.0, -2.0,  0.0, // centro
         2.0, -2.0,  0.0,
         0.0, -2.0,  1.5,
        -2.0, -2.0,  0.0,

        // Rect 1
        -1.0,  2.0, -1.5,
         1.0,  2.0, -1.5,
         1.0, -2.0, -1.5,
        -1.0, -2.0, -1.5,

        // Rect 2
         1.0,  2.0, -1.5,
         2.0,  2.0,  0.0,
         2.0, -2.0,  0.0,
         1.0, -2.0, -1.5,

         // Triangulo
         -1.0,  2.0,  1.5,
          1.0,  2.0,  1.5,
          0.0,  0.7,  1.5,

          // Cara junto al triangulo
          0.0, -2.0,  1.5,
          2.0, -2.0,  0.0,
          0.0,  0.7,  1.5,
          2.0,  0.7,  0.0,
          1.0,  2.0,  1.5,
          2.0,  2.0,  0.0,

          // Cara junto al triangulo
          0.0, -2.0,  1.5,
         -2.0, -2.0,  0.0,
          0.0,  0.7,  1.5,
         -2.0,  0.7,  0.0,
         -1.0,  2.0,  1.5,
         -2.0,  2.0,  0.0,

         // Rect 3
         -2.0,  2.0,  0.0,
         -1.0,  2.0, -1.5,
         -2.0, -2.0,  0.0,
         -1.0, -2.0, -1.5

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [0.180, 0.282, 0.760, 1.0],
        [0.835, 0.376, 0.101, 1.0],
        [0.760, 0.180, 0.180, 1.0],
        [0.525, 0.078, 0.741, 1.0],
        [0.776, 0.772, 0.023, 1.0],
        [0.929, 0.490, 0.858, 1.0],
        [0.109, 0.549, 0.709, 1.0],
        [0.090, 0.588, 0.345, 1.0],
    ];

    var vertices = [7, 6, 4, 4, 3, 6, 6, 4];
    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    var i = 0;
    for (const color of faceColors){
        for (var j = 0; j < vertices[i]; j++){
            vertexColors = vertexColors.concat(color);
        }
        i++
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var scutoidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);
    var scutoidIndices = [
        0, 1, 2,  1, 2, 3,  3, 2, 4,  4, 2, 5,  5, 2, 6,  6, 2, 0,
        7, 8, 9,  8, 9, 10,  10, 9, 11,  11, 9, 12,  12, 9, 7,
        13, 14, 15,  13, 15, 16,
        17, 18, 20,  20, 19, 18,
        21, 22, 23,
        24, 25, 26,  26, 27, 25,  26, 28, 29,  26, 27, 29,
        30, 31, 32,  32, 33, 31,  32, 34, 35,  32, 33, 35,
        36, 37, 38,  37, 38, 39
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);

    var scutoid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
            vertSize:3, nVerts:40, colorSize:4, nColors: 40, nIndices:78,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

    scutoid.update = function(){
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return scutoid;
}

function createOchta(gl, translation, rotationAxis){
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
        // Top
        -1.5,  0.0,  0.0,
         0.0,  0.0,  1.5,
         0.0,  1.5,  0.0,

         0.0,  0.0,  1.5,
         1.5,  0.0,  0.0,
         0.0,  1.5,  0.0,

         1.5,  0.0,  0.0,
         0.0,  0.0, -1.5,
         0.0,  1.5,  0.0,

         0.0,  0.0, -1.5,
        -1.5,  0.0,  0.0,
         0.0,  1.5,  0.0,

         // Bottom
        -1.5,  0.0,  0.0,
         0.0,  0.0,  1.5,
         0.0, -1.5,  0.0,

         0.0,  0.0,  1.5,
         1.5,  0.0,  0.0,
         0.0, -1.5,  0.0,

         1.5,  0.0,  0.0,
         0.0,  0.0, -1.5,
         0.0, -1.5,  0.0,

         0.0,  0.0, -1.5,
        -1.5,  0.0,  0.0,
         0.0, -1.5,  0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [0.847, 0.760, 0.411, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [0.721, 0.721, 0.721, 1.0],
        [0.035, 0.443, 0.117, 1.0],
        [0.929, 0.490, 0.858, 1.0],
        [0.964, 0.376, 0.192, 1.0],
        [0.443, 0.035, 0.360, 1.0],

    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    for (const color of faceColors){
        for (var j=0; j < 3; j++){
            vertexColors = vertexColors.concat(color);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var ochtaIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ochtaIndexBuffer);
    var ochtaIndices = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ochtaIndices), gl.STATIC_DRAW);

    var ochta = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:ochtaIndexBuffer,
        vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    };

    mat4.translate(ochta.modelViewMatrix, ochta.modelViewMatrix, translation);

    ochta.update = function(){
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    return ochta;
}

function createShader(gl, str, type){
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl){
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs){
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i < objs.length; i++){
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs){
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
