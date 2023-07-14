import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
    constructor(gl) {
        // Camera virtual
        this.cam = new Camera(gl);

        // Luz
        this.light = new Light();

        // Mesh
        this.tatuzao = new Mesh( 0.0, 'armadillo');
        this.coelhinho = new Mesh(-10.0, 'bunny');
    }

    async init(gl) {
        await this.tatuzao.loadMeshV4('./bunny.obj');
        await this.coelhinho.loadMeshV4('./armadillo.obj');
        this.tatuzao.init(gl, this.light);
        this.coelhinho.init(gl, this.light);
    }

    draw(gl) {
        this.cam.updateCam();
        this.light.updateLight();

        this.tatuzao.draw(gl, this.cam, this.light);
        this.coelhinho.draw(gl, this.cam, this.light);
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
        if (this.scene.tatuzao.isReady() && this.scene.coelhinho.isReady() ) {
            this.scene.draw(this.gl);
        }

        requestAnimationFrame(this.draw.bind(this));
    }
}

window.onload = () => {
    const app = new Main();
    app.draw();
}


