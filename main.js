import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';
import Mesh2 from "./mesh2.js";

class Scene {
    constructor(gl) {
        // Camera virtual
        this.cam = new Camera(gl);

        // Luz
        this.light = new Light();

        // Mesh
        this.mesh = new Mesh( 0.0);
        this.copy = new Mesh2(-10.0);
    }

    async init(gl) {
        await this.mesh.loadMeshV4('./bunny.obj');
        this.mesh.init(gl, this.light);

        await this.copy.loadMeshV4('./armadillo.obj');
        this.copy.init(gl, this.light);
    }

    draw(gl) {
        this.cam.updateCam();
        this.light.updateLight();

        this.mesh.draw(gl, this.cam, this.light);
        this.copy.draw(gl, this.cam, this.light);
    }
}

class Main {
    constructor() {
        const canvas = document.querySelector("#glcanvas");

        this.gl = canvas.getContext("webgl2");
        this.setViewport();

        this.scene = new Scene(this.gl);
        this.scene.init(this.gl);
    }

    setViewport() {
        var devicePixelRatio = window.devicePixelRatio || 1;
        this.gl.canvas.width = 1024 * devicePixelRatio;
        this.gl.canvas.height = 768 * devicePixelRatio;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    draw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // só desenha se as malhas estiverem carregadas
        if (this.scene.mesh.isReady() && this.scene.copy.isReady() ) {
            this.scene.draw(this.gl);
        }

        requestAnimationFrame(this.draw.bind(this));
    }
}

window.onload = () => {
    const app = new Main();
    app.draw();
}


