let ww = window.innerWidth;
let wh = window.innerHeight;
let isMobile = ww < 500;

/**
 * Creat and int a tunel
 * @constructor
 */
function Tunnel() {
    this.init();
    this.createMesh();

    this.handleEvents();

    window.requestAnimationFrame(this.render.bind(this));
}

/**
 * init function
 */
Tunnel.prototype.init = function () {

    this.speed = 1;
    this.prevTime = 0;

    this.mouse = {
        position: new THREE.Vector2(ww * 0.5, wh * 0.7),
        ratio: new THREE.Vector2(0, 0),
        target: new THREE.Vector2(ww * 0.5, wh * 0.7)
    };

    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector("#scene")
    });
    this.renderer.setSize(ww, wh);

    this.camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 100);
    this.camera.rotation.y = Math.PI;
    this.camera.position.z = 0.35;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000d25, 0.05, 1.6);
    this.scene.add(new THREE.HemisphereLight(0xe9eff2, 0x01010f, 1));

    this.addParticle();

    this.parametersController = {
        speed: 0.003,
        speed_burst: 0.006,
        scale_factor: 0.001,
        scale_update: true,
        incr_scale: function () {
            this.scale_factor = 0.001;
            this.scale_update = false;
        },
        sub_scale: function () {
            this.scale_factor = -0.001;
            this.scale_update = false;
        }
    };

    // Parameters interface
    this.gui = new dat.GUI();
    this.gui.add(this.parametersController, 'speed', 0.000, 0.009, 0.001);
    this.gui.add(this.parametersController, 'speed_burst', 0.000, 0.009, 0.001);
    this.gui.add(this.parametersController, 'incr_scale');
    this.gui.add(this.parametersController, 'sub_scale');
};

/**
 * Add all particles
 */
Tunnel.prototype.addParticle = function () {
    this.particles = [];
    for (let i = 0; i < (isMobile ? 70 : 150); i++) {
        this.particles.push(new Particle(this.scene));
    }
};

/**
 * Creat the mesh
 */
Tunnel.prototype.createMesh = function () {
    let points = [];
    let geometry;

    this.scene.remove(this.tubeMesh);

    for (let i = 0; i < 5; i += 1) {
        points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
    }
    points[4].y = -0.06;

    this.curve = new THREE.CatmullRomCurve3(points);
    this.curve.type = "catmullrom";

    geometry = new THREE.Geometry();
    geometry.vertices = this.curve.getPoints(70);
    this.splineMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial());

    this.tubeMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        color: 0xffffff
    });

    this.tubeGeometry = new THREE.TubeGeometry(this.curve, 70, 0.02, 30, false);
    this.tubeGeometry_o = this.tubeGeometry.clone();
    this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);

    this.scene.add(this.tubeMesh);

};

/**
 * Add all event listener
 */
Tunnel.prototype.handleEvents = function () {

    window.addEventListener('resize', this.onResize.bind(this), false);

    document.body.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.body.addEventListener('touchmove', this.onMouseMove.bind(this), false);

    document.body.addEventListener('touchstart', this.onMouseDown.bind(this), false);
    document.body.addEventListener('mousedown', this.onMouseDown.bind(this), false);

    document.body.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    document.body.addEventListener('mouseleave', this.onMouseUp.bind(this), false);
    document.body.addEventListener('touchend', this.onMouseUp.bind(this), false);
    window.addEventListener('mouseout', this.onMouseUp.bind(this), false);
};

/**
 * When we press the mouse
 */
Tunnel.prototype.onMouseDown = function () {
    this.mousedown = true;
    TweenMax.to(this.scene.fog.color, 0.6, {
        r: 0.09,
        g: 0.14,
        b: 0.23
    });
    TweenMax.to(this.tubeMaterial.color, 0.6, {
        r: 0.34,
        g: 0.62,
        b: 0.96
    });
    TweenMax.to(this, 1.5, {
        speed: 0.1,
        ease: Power2.easeInOut
    });
};

/**
 * When we release the mouse
 */
Tunnel.prototype.onMouseUp = function () {
    this.mousedown = false;
    TweenMax.to(this.scene.fog.color, 0.6, {
        r: 0,
        g: 0.050980392156862744,
        b: 0.1450980392156863
    });
    TweenMax.to(this.tubeMaterial.color, 0.6, {
        r: 0.81,
        g: 0.83,
        b: 0.83
    });
    TweenMax.to(this, 0.6, {
        speed: 1,
        ease: Power2.easeIn
    });
};

/**
 * Window resize event
 */
Tunnel.prototype.onResize = function () {
    ww = window.innerWidth;
    wh = window.innerHeight;

    isMobile = ww < 500;

    this.camera.aspect = ww / wh;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(ww, wh);
};

/**
 * Wen he mouse is moving we change the target mouse
 * @param e position of the mouse
 */
Tunnel.prototype.onMouseMove = function (e) {
    if (e.type === "mousemove") {
        this.mouse.target.x = e.clientX;
        this.mouse.target.y = e.clientY;
    } else {
        this.mouse.target.x = e.touches[0].clientX;
        this.mouse.target.y = e.touches[0].clientY;
    }
};

/**
 * Update the position of the camera
 */
Tunnel.prototype.updateCameraPosition = function () {

    this.mouse.position.x += (this.mouse.target.x - this.mouse.position.x) / 30;
    this.mouse.position.y += (this.mouse.target.y - this.mouse.position.y) / 30;

    this.mouse.ratio.x = (this.mouse.position.x / ww);
    this.mouse.ratio.y = (this.mouse.position.y / wh);

    this.camera.rotation.z = ((this.mouse.ratio.x) * 1 - 0.05);
    this.camera.rotation.y = Math.PI - (this.mouse.ratio.x * 0.3 - 0.15);
    this.camera.position.x = ((this.mouse.ratio.x) * 0.044 - 0.025);
    this.camera.position.y = ((this.mouse.ratio.y) * 0.044 - 0.025);

};

/**
 * Update the tunnel
 */
Tunnel.prototype.updateCurve = function () {
    let index = 0;
    let vertice_o = null;
    let vertice = null;
    for (let i = 0; i < this.tubeGeometry.vertices.length; i += 1) {
        vertice_o = this.tubeGeometry_o.vertices[i];
        vertice = this.tubeGeometry.vertices[i];
        index = Math.floor(i / 30);
        vertice.x += ((vertice_o.x + this.splineMesh.geometry.vertices[index].x) - vertice.x) / 15;
        vertice.y += ((vertice_o.y + this.splineMesh.geometry.vertices[index].y) - vertice.y) / 15;
    }
    this.tubeGeometry.verticesNeedUpdate = true;

    this.curve.points[2].x = 0.6 * (1 - this.mouse.ratio.x) - 0.3;
    this.curve.points[3].x = 0;
    this.curve.points[4].x = 0.6 * (1 - this.mouse.ratio.x) - 0.3;

    this.curve.points[2].y = 0.6 * (1 - this.mouse.ratio.y) - 0.3;
    this.curve.points[3].y = 0;
    this.curve.points[4].y = 0.6 * (1 - this.mouse.ratio.y) - 0.3;

    this.splineMesh.geometry.verticesNeedUpdate = true;
    this.splineMesh.geometry.vertices = this.curve.getPoints(70);
};

/**
 * Update the render and all particles
 * @param time time for color change and when we need to add more shapes
 */
Tunnel.prototype.render = function (time) {

    this.updateCameraPosition();

    this.updateCurve();
    for (let i = 0; i < this.particles.length; i++) {

        if(this.particles[i].burst)
            this.particles[i].speed = this.parametersController.speed_burst;
        else
            this.particles[i].speed = this.parametersController.speed;

        // look if we can update the particles scale
        if (!this.parametersController.scale_update){
            this.particles[i].mesh.scale.x += this.parametersController.scale_factor;
            this.particles[i].mesh.scale.y += this.parametersController.scale_factor;
            this.particles[i].mesh.scale.z += this.parametersController.scale_factor;
        }
        this.particles[i].update(this);
        if (this.particles[i].burst && this.particles[i].percent > 1) {
            this.particles.splice(i, 1);
            i--;
        }
    }
    this.parametersController.scale_update = true;

    // When mouse down, add a lot of shapes
    if (this.mousedown) {
        if (time - this.prevTime > 20) {
            this.prevTime = time;
            this.particles.push(new Particle(this.scene, true, time));
            if (!isMobile) {
                this.particles.push(new Particle(this.scene, true, time));
                this.particles.push(new Particle(this.scene, true, time));
            }
        }
    }

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
};

/**
 * Start point of the script
 */
window.onload = function () {

    window.tunnel = new Tunnel();

};