(function(){
    // Initialize vetices
    var randomGeometry = new THREE.Geometry();
    var numParticles = 1000;
    for(var i = 0 ; i < numParticles ; i++) {
     	randomGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }

    var radius = 100;
    var duration = 1000;

    function get_intermediate(src_dict, end_dict){
	var middle_x = (src_dict.x + end_dict.x)/2;
	var middle_y = (src_dict.y + end_dict.y)/2;
	var middle_z = (src_dict.z + end_dict.z)/2;

	var len = Math.sqrt((middle_x * middle_x) + (middle_y * middle_y) + (middle_z * middle_z));
	var unit_x = middle_x / len;
	var unit_y = middle_y / len;
	var unit_z = middle_z / len;
	
	var intermediate_x = unit_x * radius;
	var intermediate_y = unit_y * radius;
	var intermediate_z = unit_z * radius;
	
	return {x: intermediate_x,
		y: intermediate_y,
		z: intermediate_z};
    };

    function get_quarter(src_dict, end_dict, hight){
	second = get_intermediate(src_dict, end_dict);
	first = get_intermediate(src_dict, second);
	third = get_intermediate(second, end_dict);
	
	first.x = hight * first.x;
	first.y = hight * first.y;
	first.z = hight * first.z;

	second.x = hight * second.x;
	second.y = hight * second.y;
	second.z = hight * second.z;

	third.x = hight * third.x;
	third.y = hight * third.y;
	third.z = hight * third.z;
	
	return {src: src_dict,
		first: first,
		second: second,
		third: third,
		end: end_dict};
    };

    function get_random_geom(){
	// [0, 1)

	var azimuth = Math.random() * 2 * Math.PI; 
	var altura = (Math.random()-0.5) * Math.PI;
	
	var x = radius * Math.cos(azimuth)*Math.cos(altura);
	var y = radius * Math.sin(azimuth)*Math.cos(altura);
	var z = radius * Math.sin(altura);

	var recalc = (x*x + y*y + z*z);
	//console.log('recalc', recalc);
	var tmp = {x:x, y:y, z:z};
	return tmp;
    };

    function get_random_geom2(){
	// [0, 1)

	var azimuth = Math.random() * Math.PI/20; 
	var altura = (Math.random()-0.5) * Math.PI/20;
	
	var x = radius * Math.cos(azimuth)*Math.cos(altura);
	var y = radius * Math.sin(azimuth)*Math.cos(altura);
	var z = radius * Math.sin(altura);

	var recalc = (x*x + y*y + z*z);
	var tmp = {x:x, y:y, z:z};
	return tmp;
    };

    function clone(src){
        var dst = {}
        for(var k in src){
            dst[k] = src[k];
        }
        return dst;
    };
    
    var Factory = function(){
        var that = {};
        that.empty_list = [];
        that.tween_obj = [];
    
        for(var i=0; i<numParticles; ++i){
    	that.empty_list.push(i);
    	that.tween_obj[i] = null;
        }
       
        that.gen = function(src_dict, end_dict, delay, hight) {
    	    if(typeof delay === 'undefined'){
    		delay = 0
    	    }
    	    if(typeof hight === 'undefined'){
    		hight = 1.1;
    	    }
    	    
            if( that.empty_list.length == 0 ){
		throw {
                    name: 'ArgumentError',
                    message: 'No more room!'
		};
            }
	    
    	    var index = that.empty_list.pop()
            // console.log("gen", index);
            // console.log("src_dict", src_dict);
            // console.log("end_dict", end_dict);
	    
    	    var src_dict_orig = clone(src_dict);

	    // initialize the corresponding vertice
	    var target = randomGeometry.vertices[index];
	    target.x = src_dict.x;
	    target.y = src_dict.y;
	    target.z = src_dict.z;

	    var quarter_tab = get_quarter(src_dict, end_dict, hight);
	    var tween0 = new TWEEN.Tween( quarter_tab.src )
		.to(quarter_tab.first, duration)
		.easing( TWEEN.Easing.Linear.None )
		.onUpdate( function() {
		    var dict = {x: this.x, y: this.y, z: this.z};
		    that.update_proxy(index, dict);
		});
	    
	    var tween1 = new TWEEN.Tween( quarter_tab.first )
		.to(quarter_tab.second, duration)
		.easing( TWEEN.Easing.Linear.None )
		.onUpdate( function() {
		    var dict = {x: this.x, y: this.y, z: this.z};
		    that.update_proxy(index, dict);
		});

	    var tween2 = new TWEEN.Tween( quarter_tab.second )
		.to(quarter_tab.third, duration)
		.easing( TWEEN.Easing.Linear.None )
		.onUpdate( function() {
		    var dict = {x: this.x, y: this.y, z: this.z};
		    that.update_proxy(index, dict);
		});

	    var tween3 = new TWEEN.Tween( quarter_tab.third )
		.to(quarter_tab.end, duration)
		.easing( TWEEN.Easing.Linear.None )
		.onUpdate( function() {
		    var dict = {x: this.x, y: this.y, z: this.z};
		    that.update_proxy(index, dict);
		})
		.onComplete( function() { 
		    var dict = {src_dict: src_dict_orig, end_dict: end_dict, delay: delay, hight: hight};
		    that.destroy_proxy(index, dict);
		});

	    tween0.chain(tween1);
	    tween1.chain(tween2);
	    tween2.chain(tween3);
	    var tween = tween0;
	    
    	    tween.delay(delay);
	    
            if( that.tween_obj[index] != null ){
                throw {
                    name: 'ArgumentError',
                    message: 'No more room!'
                };
            }
	    
    	    that.tween_obj[index] = tween;
            tween.start();
        };
	
        that.update_proxy = function(index, dict){
	    var target = randomGeometry.vertices[index];
	    target.x = dict.x;
	    target.y = dict.y;
	    target.z = dict.z;
	  
	    if (false){
		console.log("update_proxy for", index, 
    			    dict.x.toFixed(2), dict.y.toFixed(2), dict.z.toFixed(2));
	    }
        };
        
        that.destroy_proxy = function(index, dict){
    	    that.empty_list.push(index);
    	    delete that.tween_obj[index];
    	    that.tween_obj[index] = null;
    	    
    	    // do that again!
    	    that.gen(dict.src_dict, dict.end_dict, dict.delay, dict.hight);
        };
    
        return that
    };

    function init() {
	// factory
	var fact = Factory();

	// Generate random particles
	for(var i=0; i<numParticles; i++){
	    var delay = Math.random() * 4000;
	    fact.gen(get_random_geom(),
		    get_random_geom2(),
		    delay);
	}

	// standard global variables
	var container, scene, camera, renderer, controls, stats;
	//var keyboard = new THREEx.KeyboardState();
	var clock = new THREE.Clock();
	
	// custom global variables
	var cube;

	///////////
	// SCENE //
	///////////
	scene = new THREE.Scene();

	////////////
	// CAMERA //
	////////////
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;	
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	
	//////////////
	// RENDERER //
	//////////////
	if ( Detector.webgl )
	    renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
	    renderer = new THREE.CanvasRenderer(); 
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	
	// attach div element to variable to contain the renderer
	container = document.getElementById( 'ThreeJS' );
	
	// attach renderer to the container div
	container.appendChild( renderer.domElement );
	
	//////////////
	// CONTROLS //
	//////////////
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	///////////
	// STATS //
	///////////
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
	///////////
	// LIGHT //
	///////////
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	/////////////////////
	// Particle system //
	/////////////////////
	var discTexture = THREE.ImageUtils.loadTexture( 'images/disc.png' );
	var material_particle = new THREE.ParticleBasicMaterial({
	    size: 10, color: 0xff8888, blending: THREE.AdditiveBlending,
	    transparent: true, depthTest: false, map: discTexture });
 
	var particleCube = new THREE.ParticleSystem( randomGeometry, material_particle);
	scene.add( particleCube );

	////////////
	// Sphere //
	////////////
	var geometry = new THREE.SphereGeometry( radius, 40, 40 );
	var material = new THREE.MeshBasicMaterial( { wireframe: true, color: '#2194ce'} );
	var mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	////////////
	// sprite //
	////////////
        var spriteTexture1 = THREE.ImageUtils.loadTexture( 'images/aaa.png' );
        var spriteMaterial1 = new THREE.SpriteMaterial( { map: spriteTexture1, useScreenCoordinates: false, color: 'white' } );

	var sprite1 = new THREE.Sprite( spriteMaterial1 );
	sprite1.position.set( -10, 60, 110 );
	sprite1.scale.set( 32, 32, 1.0 ); // imageWidth, imageHeight
	scene.add( sprite1 );

        var spriteTexture2 = THREE.ImageUtils.loadTexture( 'images/smile.png' );
        var spriteMaterial2 = new THREE.SpriteMaterial( { map: spriteTexture2, useScreenCoordinates: false, color: 'palegreen' } );

	var sprite2 = new THREE.Sprite( spriteMaterial2 );
	sprite2.position.set( 90, 90, 0 );
	sprite2.scale.set( 32, 32, 1.0 ); // imageWidth, imageHeight
	scene.add( sprite2 );



 	///////////
 	// FLOOR //
 	///////////
 	// note: 4x4 checkboard pattern scaled so that each square is 25 by 25 pixels.
 	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
 	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
 	floorTexture.repeat.set( 10, 10 );
 	// DoubleSide: render texture on both sides of mesh
 	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
 	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
 	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
 	floor.position.y = -150;
 	floor.rotation.x = Math.PI / 2;
 	scene.add(floor);
	
	function animate() {
            function render() {	
    		renderer.render( scene, camera );
            };
	    
            function update(){
    		var delta = clock.getDelta(); 
    		randomGeometry.verticesNeedUpdate=true;
    		controls.update();
    		stats.update();
            };
	    
            TWEEN.update();
            requestAnimationFrame( animate );
            render();
            update();
	};
	animate();
    };

    // initialization
    init();
})();
