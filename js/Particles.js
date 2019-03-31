/**
 *
 * @param scene Scene to add particle
 * @param burst (bool) true if the particle is in burst
 * @param time (float) time value to change the color
 * @constructor
 */
function Particle(scene, burst, time) {
    let radius = Math.random() * 0.002 + 0.0003;
    let geom = this.icosahedron;
    let random = Math.random();
    if (random > 0.9) {
        geom = this.cube;
    } else if (random > 0.8) {
        geom = this.sphere;
    }
    let range = 50;
    if (burst) {
        this.color = new THREE.Color("hsl(" + (time / 50) + ",100%,60%)");
    } else {
        let offset = 180;
        this.color = new THREE.Color("hsl(" + (Math.random() * range + offset) + ",100%,80%)");
    }
    let mat = new THREE.MeshPhongMaterial({
        color: this.color,
        shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.scale.set(radius, radius, radius);
    this.mesh.position.set(0, 0, 1.5);
    this.percent = burst ? 0.2 : Math.random();
    this.burst = burst ? true : false;
    this.offset = new THREE.Vector3((Math.random() - 0.5) * 0.025, (Math.random() - 0.5) * 0.025, 0);
    this.speed = Math.random() * 0.004 + 0.0002;
    // set the speed of the bust particles
    if (this.burst) {
        this.speed += 0.003;
        this.mesh.scale.x *= 1.4;
        this.mesh.scale.y *= 1.4;
        this.mesh.scale.z *= 1.4;
    }
    this.rotate = new THREE.Vector3(-Math.random() * 0.1 + 0.01, 0, Math.random() * 0.01);

    this.pos = new THREE.Vector3(0, 0, 0);
    scene.add(this.mesh);
}

Particle.prototype.cube = new THREE.BoxBufferGeometry(1, 1, 1);
Particle.prototype.sphere = new THREE.SphereBufferGeometry(1, 6, 6);
Particle.prototype.icosahedron = new THREE.IcosahedronBufferGeometry(1, 0);
Particle.prototype.update = function (tunnel) {

    this.percent += this.speed * (this.burst ? 1 : tunnel.speed);

    this.pos = tunnel.curve.getPoint(1 - (this.percent % 1)).add(this.offset);
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    this.mesh.rotation.x += this.rotate.x;
    this.mesh.rotation.y += this.rotate.y;
    this.mesh.rotation.z += this.rotate.z;
};