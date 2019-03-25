window.onload = function () {
    var scene = new THREE.Scene();
    var loader = new THREE.TextureLoader();
    var renderer;
    loader.crossOrigin = "Anonymous";
    loader.load(
        "img/demo3/galaxyTexture.jpg",
        function (texture) {
            document.body.classList.remove("loading");

            var pmremGenerator = new THREE.PMREMGenerator(texture);
            pmremGenerator.update(renderer);

            var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
            pmremCubeUVPacker.update(renderer);

            var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;

            // model
            var loader = new THREE.GLTFLoader().setPath('models/fighter/');
            loader.load('scene.gltf', function (gltf) {

                gltf.scene.traverse(function (child) {

                    if (child.isMesh) {

                        child.material.envMap = envMap;

                    }

                });

                scene.add(gltf.scene);

            });

            pmremGenerator.dispose();
            pmremCubeUVPacker.dispose();
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                canvas: document.querySelector("#scene")
            });
            renderer.setSize(ww, wh);
            window.tunnel = new Tunnel(scene, renderer, texture);
        }
    );
};
