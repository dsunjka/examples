// Einstiegspunkt für das Vendor-Bündel: three.js + die Addons, die die 3D-Welt nutzt.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
const addons = { RoomEnvironment, RoundedBoxGeometry, mergeGeometries, mergeVertices, toCreasedNormals, SimplexNoise, Sky };
window.THREE = Object.assign({}, THREE, { addons });
