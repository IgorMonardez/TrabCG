import vertShaderSrc from './phong.vert.js';
import fragShaderSrc from './phong.frag.js';

import Shader from './shader.js';
import { HalfEdgeDS } from './half-edge.js';

export default class Mesh {
    constructor(delta, animal) {
        // model data structure
        this.heds = new HalfEdgeDS();

        this.animal = animal;
        // Matriz de modelagem
        this.angle = 0;
        this.delta = delta;
        this.model = mat4.create();

        // Shader program
        this.vertShd = null;
        this.fragShd = null;
        this.program = null;

        // Data location
        this.vaoLoc = -1;
        this.indicesLoc = -1;

        this.uModelLoc = -1;
        this.uViewLoc = -1;
        this.uProjectionLoc = -1;

        // texture
        this.colorMap = [];
        this.colorMapLoc = -1;

        this.texColorMap = -1;
        this.uColorMap = -1;
    }

    isReady() {
        return this.heds.isReady();
    }


    async loadMeshV4(file) {
        var resp = await fetch(file);
        var text = await resp.text();

        var txtList = text.split('\n');


        var vertices = [];
        var faces = [];

        for(var i = 0; i< txtList.length;i++) {
            var line = txtList[i];
            var values;
            if(line.startsWith('v ')) {
                values = line.split(' ');
                vertices.push(parseFloat(values[1]));
                vertices.push(parseFloat(values[2]));
                vertices.push(parseFloat(values[3]));
                vertices.push(1.0);
            } else if (line.startsWith("f ")) {
                values = line.split(' ');

                for (var j = 1; j < values.length; j++) {
                    var vertexData = values[j].split("//");
                    var vertexIndex = parseInt(vertexData[0]) - 1;
                    faces.push(vertexIndex);
                }
            }
        }

        console.log('vertices: ', vertices);
        console.log('faces: ', faces);
        this.heds.build(vertices, faces);
    }

    createShader(gl) {
        this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
        this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
        this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);

        gl.useProgram(this.program);
    }

    createUniforms(gl) {
        this.uModelLoc = gl.getUniformLocation(this.program, "u_model");
        this.uViewLoc = gl.getUniformLocation(this.program, "u_view");
        this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection");
    }

    createVAO(gl) {
        const vbos = this.heds.getVBOs();
        console.log(vbos);

        var coordsAttributeLocation = gl.getAttribLocation(this.program, "position");
        const coordsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[0]));

        var scalarsAttributeLocation = gl.getAttribLocation(this.program, "scalar");
        const scalarsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[1]));

        var normalsAttributeLocation = gl.getAttribLocation(this.program, "normal");
        const normalsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[2]));

        this.vaoLoc = Shader.createVAO(gl,
            coordsAttributeLocation, coordsBuffer,
            scalarsAttributeLocation, scalarsBuffer,
            normalsAttributeLocation, normalsBuffer);

        this.indicesLoc = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3]));
    }

    createTex(gl) {
        this.uColorMap = gl.getUniformLocation(this.program, 'uColorMap');

        this.texColorMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texColorMap);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        const texData = [
            213,62,79,255,
            244,109,67,255,
            253,174,97,255,
            254,224,139,255,
            230,245,152,255,
            171,221,164,255,
            102,194,165,255,
            50,136,189,255
        ].map(d => d / 255);

        console.log("=====>", texData);

        const size = [8, 1];
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size[0], size[1], 0, gl.RGBA, gl.FLOAT, new Float32Array(texData));

        // set which texture units to render with.
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.uColorMap, 0);
    }

    init(gl, light) {
        this.createShader(gl);
        this.createUniforms(gl);
        this.createVAO(gl);
        this.createTex(gl);

        light.createUniforms(gl, this.program);
    }

    updateModelMatrix() {
        this.angle += 0.01;

        mat4.identity( this.model );
        mat4.translate(this.model, this.model, [this.delta, 0, 0]);
        if(this.animal === 'amardillo') {

            mat4.rotateY(this.model, this.model, this.angle);

        }
        else if( this.animal === 'bunny') {

            mat4.rotateZ(this.model, this.model, this.angle);

        }
        mat4.translate(this.model, this.model, [-0.25, -0.25, -0.25]);

        if(this.animal === 'amardillo') {

            mat4.scale(this.model, this.model, [3, 3, 3]);

        }
        else if(this.animal === 'bunny') {

            mat4.scale(this.model, this.model, [1, 1, 1]);

        }
    }

    draw(gl, cam) {
        // faces orientadas no sentido anti-horário
        gl.frontFace(gl.CCW);

        // face culling
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.useProgram(this.program);
        // updates the model transformations
        this.updateModelMatrix();

        const model = this.model;
        const view = cam.getView();
        const proj = cam.getProj();


        gl.uniformMatrix4fv(this.uModelLoc, false, model);
        gl.uniformMatrix4fv(this.uViewLoc, false, view);
        gl.uniformMatrix4fv(this.uProjectionLoc, false, proj);

        gl.bindVertexArray(this.vaoLoc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesLoc);


        gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0);

        gl.disable(gl.CULL_FACE);
    }
}