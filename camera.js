export default class Camera {
    constructor(gl) {
        // Posição da camera
        this.eye = vec3.fromValues(-7.0, 2.0, 2.0);
        this.at  = vec3.fromValues(0.0, 0.0, 0.0);
        this.up  = vec3.fromValues(0.0, 1.0, 0.0);

        // Parâmetros da projeção
        this.fovy = Math.PI / 2;
        this.aspect = gl.canvas.width / gl.canvas.height;

        this.near = 0;
        this.far = 5;

        this.angle = 0;
        this.rotationSpeed = 0.01;

        // Matrizes View e Projection
        this.view = mat4.create();
        this.proj = mat4.create();
    }

    getView() {
        return this.view;
    }

    getProj() {
        return this.proj;
    }

    updateAngle() {
        this.angle += this.rotationSpeed;
        if( this.angle >= 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        }
    }

    updateViewMatrix() {
        mat4.identity( this.view );
        mat4.lookAt(this.view, this.eye, this.at, this.up);

        const x = Math.cos(this.angle) * 7 ;
        const z = Math.sin(this.angle) * 7;
        this.eye[0] = x;
        this.eye[2] = z;
        // TODO: Tentar implementar as contas diretamente
    }

    updateProjectionMatrix() {
        mat4.identity( this.proj );

        mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);

    }

    updateCam() {
        this.updateAngle();
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }
}