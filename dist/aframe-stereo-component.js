/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// Browser distrubution of the A-Frame component.
	(function () {
	  if (!AFRAME) {
	    console.error('Component attempted to register before AFRAME was available.');
	    return;
	  }

	  // Register all components here.
	  var components = {
	    stereo: __webpack_require__(1).stereo_component,
	    stereocam: __webpack_require__(1).stereocam_component
	  };

	  Object.keys(components).forEach(function (name) {
	    if (AFRAME.aframeCore) {
	      AFRAME.aframeCore.registerComponent(name, components[name]);
	    } else {
	      AFRAME.registerComponent(name, components[name]);
	    }
	  });
	})();



/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = {

	   // Put an object into left, right or both eyes.
	   // If it's a video sphere, take care of correct stereo mapping for both eyes (if full dome)
	   // or half the sphere (if half dome)
	   
	  'stereo_component' : {
	      schema: {
	        eye: { type: 'string', default: "left"},
	        mode: { type: 'string', default: "full"}
	      },
	       init: function(){
	          var object3D = this.el.object3D;


	          // Check if it's a sphere w/ video material, and if so

	          if(object3D.geometry instanceof THREE.SphereGeometry
	                   && 'map' in object3D.material 
	                   && object3D.material.map instanceof THREE.VideoTexture) {


	              // hold video element for play on click (mobile)

	              var self = this;

	              // attach video element onclick to scene canvas

	              this.videoEl = document.querySelector(this.el.components.material.textureSrc);

	               this.el.sceneEl.canvas.onclick = function () {
	                    self.videoEl.play();
	               };

	              // if half-dome mode, rebuild geometry (with default 100, radius, 64 width segments and 64 height segments)

	              if(this.data.mode === "half"){

	                var geo_def = this.el.getAttribute("geometry");
	                var geometry = new THREE.SphereGeometry(geo_def.radius || 100, geo_def.segmentsWidth || 64, geo_def.segmentsHeight || 64,  Math.PI/2, Math.PI, 0, Math.PI);

	                object3D.geometry = geometry;

	                // Rotate to put center of half panorama in front

	                object3D.rotation.y = -Math.PI / 2;

	                }

	                // If left eye, take first horizontal half of texture from video

	                if(this.data.eye === "left"){

	                      var uvs = object3D.geometry.faceVertexUvs[ 0 ];
	                      for (var i = 0; i < uvs.length; i++) {
	                          for (var j = 0; j < 3; j++) {
	                              uvs[ i ][ j ].x *= 0.5;
	                          }
	                      }

	                }

	                // If right eye, take last horizontal half of texture from video

	                if(this.data.eye === "right"){
	                      var uvs = object3D.geometry.faceVertexUvs[ 0 ];
	                      for (var i = 0; i < uvs.length; i++) {
	                          for (var j = 0; j < 3; j++) {
	                              uvs[ i ][ j ].x *= 0.5;
	                              uvs[ i ][ j ].x += 0.5;                            
	                          }
	                      }

	                }                             


	          }

	       }, 
	       // On element update, put in the right layer, 0:both, 1:left, 2:right (spheres or not)

	       update: function(oldData){

	            var object3D = this.el.object3D;
	            var data = this.data;

	            if(data.eye === "both"){
	              object3D.layers.set(0);
	            }
	            else{
	              object3D.layers.set(data.eye === 'left' ? 1:2);
	            }

	       }
	     },

	  // Sets the 'default' eye viewed by camera in non-VR mode

	  'stereocam_component':{

	      schema: {
	        eye: { type: 'string', default: "left"}
	      },

	       // Since layer enabling for cam should be done on the right object down this object hierarchy,
	       // Use update every tick if flagged as 'not changed yet'

	       init: function(){
	            // Register update on tick
	            this.el.sceneEl.addBehavior(this);
	            this.layer_changed = false;
	       },

	       tick: function(oldData){

	            
	            var originalData = this.data;

	            // If layer never changed

	            if(!this.layer_changed){

	            // because stereocam component should be attached to an a-camera element
	            // need to get down to the root PerspectiveCamera before addressing layers

	            // Gather the children of this a-camera and identify types

	            var childrenTypes = [];

	            this.el.object3D.children.forEach( function (item, index, array) {
	                childrenTypes[index] = item.type;
	            });

	            // Retrieve the PerspectiveCamera
	            var rootIndex = childrenTypes.indexOf("PerspectiveCamera");
	            var rootCam = this.el.object3D.children[rootIndex];

	            if(originalData.eye === "both"){
	                rootCam.layers.enable( 1 );
	                rootCam.layers.enable( 2 );
	              }
	              else{
	                rootCam.layers.enable(originalData.eye === 'left' ? 1:2);
	              }
	            }
	       }

	  }
	};


/***/ }
/******/ ]);