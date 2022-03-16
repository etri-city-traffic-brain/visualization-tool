/*!
 * maptalks.three v0.20.3
 * LICENSE : MIT
 * (c) 2016-2022 maptalks.org
 */
;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('maptalks'), require('three'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'maptalks', 'three'], factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory(
        (global.maptalks = global.maptalks || {}),
        global.maptalks,
        global.THREE
      ))
})(this, function (exports, maptalks, THREE) {
  'use strict'

  function _interopNamespace (e) {
    if (e && e.__esModule) return e
    var n = Object.create(null)
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k)
          Object.defineProperty(
            n,
            k,
            d.get
              ? d
              : {
                  enumerable: true,
                  get: function () {
                    return e[k]
                  }
                }
          )
        }
      })
    }
    n['default'] = e
    return Object.freeze(n)
  }

  var maptalks__namespace = /*#__PURE__*/ _interopNamespace(maptalks)
  var THREE__namespace = /*#__PURE__*/ _interopNamespace(THREE)

  function _inheritsLoose (subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype)
    subClass.prototype.constructor = subClass

    _setPrototypeOf(subClass, superClass)
  }

  function _setPrototypeOf (o, p) {
    _setPrototypeOf =
      Object.setPrototypeOf ||
      function _setPrototypeOf (o, p) {
        o.__proto__ = p
        return o
      }

    return _setPrototypeOf(o, p)
  }

  function _assertThisInitialized (self) {
    if (self === void 0) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      )
    }

    return self
  }

  /**
   * three api adapt
   */

  var REVISION = parseInt(THREE__namespace.REVISION.replace('dev', '')) //Three does not print version information now. Output the version of three to find compatibility problems

  console.log(
    'maptalks.three log: current three.js version is %c' + REVISION,
    'color:red;font-size: 16px;font-weight: bold;'
  )
  /**
   *
   * @param {THREE.BufferGeometry} bufferGeomertry
   * @param {String} key
   * @param {*} value
   */

  function addAttribute (bufferGeomertry, key, value) {
    if (REVISION > 109) {
      bufferGeomertry.setAttribute(key, value)
    } else {
      bufferGeomertry.addAttribute(key, value)
    }

    return bufferGeomertry
  }
  function setRaycasterLinePrecision (raycaster, linePrecision) {
    if (REVISION > 113) {
      raycaster.params.Line.threshold = linePrecision
    } else {
      raycaster.linePrecision = linePrecision
    }
  }
  function getVertexColors () {
    if (THREE__namespace.VertexColors) {
      return THREE__namespace.VertexColors
    }

    return true
  }

  var LineSegmentsGeometry = /*#__PURE__*/ (function (_THREE$InstancedBuffe) {
    _inheritsLoose(LineSegmentsGeometry, _THREE$InstancedBuffe)

    function LineSegmentsGeometry () {
      var _this

      _this = _THREE$InstancedBuffe.call(this) || this
      _this.isLineSegmentsGeometry = true
      _this.type = 'LineSegmentsGeometry'
      var positions = [
        -1,
        2,
        0,
        1,
        2,
        0,
        -1,
        1,
        0,
        1,
        1,
        0,
        -1,
        0,
        0,
        1,
        0,
        0,
        -1,
        -1,
        0,
        1,
        -1,
        0
      ]
      var uvs = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2]
      var index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5]

      _this.setIndex(index)

      addAttribute(
        _assertThisInitialized(_this),
        'position',
        new THREE__namespace.Float32BufferAttribute(positions, 3)
      )
      addAttribute(
        _assertThisInitialized(_this),
        'uv',
        new THREE__namespace.Float32BufferAttribute(uvs, 2)
      )
      return _this
    } // THREE.InstancedBufferGeometry.call(this);
    // var plane = new THREE.BufferGeometry();
    // this.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    // this.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    var _proto = LineSegmentsGeometry.prototype

    _proto.applyMatrix = function applyMatrix (matrix) {
      var start = this.attributes.instanceStart
      var end = this.attributes.instanceEnd

      if (start !== undefined) {
        matrix.applyToBufferAttribute(start)
        matrix.applyToBufferAttribute(end)
        start.data.needsUpdate = true
      }

      if (this.boundingBox !== null) {
        this.computeBoundingBox()
      }

      if (this.boundingSphere !== null) {
        this.computeBoundingSphere()
      }

      return this
    }

    _proto.setPositions = function setPositions (array) {
      var lineSegments

      if (array instanceof Float32Array) {
        lineSegments = array
      } else if (Array.isArray(array)) {
        lineSegments = new Float32Array(array)
      }

      var instanceBuffer = new THREE__namespace.InstancedInterleavedBuffer(
        lineSegments,
        6,
        1
      ) // xyz, xyz

      addAttribute(
        this,
        'instanceStart',
        new THREE__namespace.InterleavedBufferAttribute(instanceBuffer, 3, 0)
      )
      addAttribute(
        this,
        'instanceEnd',
        new THREE__namespace.InterleavedBufferAttribute(instanceBuffer, 3, 3)
      ) // this.addAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0)); // xyz
      // this.addAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3)); // xyz
      //

      this.computeBoundingBox()
      this.computeBoundingSphere()
      return this
    }

    _proto.setColors = function setColors (array) {
      var colors

      if (array instanceof Float32Array) {
        colors = array
      } else if (Array.isArray(array)) {
        colors = new Float32Array(array)
      }

      var instanceColorBuffer = new THREE__namespace.InstancedInterleavedBuffer(
        colors,
        6,
        1
      ) // rgb, rgb

      addAttribute(
        this,
        'instanceColorStart',
        new THREE__namespace.InterleavedBufferAttribute(
          instanceColorBuffer,
          3,
          0
        )
      )
      addAttribute(
        this,
        'instanceColorEnd',
        new THREE__namespace.InterleavedBufferAttribute(
          instanceColorBuffer,
          3,
          3
        )
      ) // this.addAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 0)); // rgb
      // this.addAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 3)); // rgb

      return this
    }

    _proto.fromWireframeGeometry = function fromWireframeGeometry (geometry) {
      this.setPositions(geometry.attributes.position.array)
      return this
    }

    _proto.fromEdgesGeometry = function fromEdgesGeometry (geometry) {
      this.setPositions(geometry.attributes.position.array)
      return this
    }

    _proto.fromMesh = function fromMesh (mesh) {
      this.fromWireframeGeometry(
        new THREE__namespace.WireframeGeometry(mesh.geometry)
      ) // set colors, maybe

      return this
    }

    _proto.fromLineSegements = function fromLineSegements (lineSegments) {
      var geometry = lineSegments.geometry

      if (geometry.isGeometry) {
        this.setPositions(geometry.vertices)
      } else if (geometry.isBufferGeometry) {
        this.setPositions(geometry.position.array) // assumes non-indexed
      } // set colors, maybe

      return this
    }

    _proto.computeBoundingBox = function computeBoundingBox () {
      var box = new THREE__namespace.Box3()

      if (this.boundingBox === null) {
        this.boundingBox = new THREE__namespace.Box3()
      }

      var start = this.attributes.instanceStart
      var end = this.attributes.instanceEnd

      if (start !== undefined && end !== undefined) {
        this.boundingBox.setFromBufferAttribute(start)
        box.setFromBufferAttribute(end)
        this.boundingBox.union(box)
      }
    }

    _proto.computeBoundingSphere = function computeBoundingSphere () {
      var vector = new THREE__namespace.Vector3()

      if (this.boundingSphere === null) {
        this.boundingSphere = new THREE__namespace.Sphere()
      }

      if (this.boundingBox === null) {
        this.computeBoundingBox()
      }

      var start = this.attributes.instanceStart
      var end = this.attributes.instanceEnd

      if (start !== undefined && end !== undefined) {
        var center = this.boundingSphere.center
        this.boundingBox.getCenter(center)
        var maxRadiusSq = 0

        for (var i = 0, il = start.count; i < il; i++) {
          vector.fromBufferAttribute(start, i)
          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector))
          vector.fromBufferAttribute(end, i)
          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector))
        }

        this.boundingSphere.radius = Math.sqrt(maxRadiusSq)

        if (isNaN(this.boundingSphere.radius)) {
          console.error(
            'THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.',
            this
          )
        }
      }
    }

    _proto.toJSON = function toJSON () {
      // todo
    } // clone: function () {
    //     // todo
    // },
    // eslint-disable-next-line no-unused-vars

    _proto.copy = function copy (source) {
      // todo
      return this
    }

    return LineSegmentsGeometry
  })(THREE__namespace.InstancedBufferGeometry)

  var UniformsLib = {},
    ShaderLib = {}
  UniformsLib.line = {
    linewidth: {
      value: 1
    },
    resolution: {
      value: new THREE__namespace.Vector2(1, 1)
    },
    dashScale: {
      value: 1
    },
    dashSize: {
      value: 1
    },
    gapSize: {
      value: 1
    } // todo FIX - maybe change to totalSize
  }
  ShaderLib['line'] = {
    uniforms: THREE__namespace.UniformsUtils.merge([
      THREE__namespace.UniformsLib.common,
      THREE__namespace.UniformsLib.fog,
      UniformsLib.line
    ]),
    vertexShader:
      '\n\t\t#include <common>\n\t\t#include <color_pars_vertex>\n\t\t#include <fog_pars_vertex>\n\t\t#include <logdepthbuf_pars_vertex>\n\t\t#include <clipping_planes_pars_vertex>\n\n\t\tuniform float linewidth;\n\t\tuniform vec2 resolution;\n\n\t\tattribute vec3 instanceStart;\n\t\tattribute vec3 instanceEnd;\n\n\t\tattribute vec3 instanceColorStart;\n\t\tattribute vec3 instanceColorEnd;\n\n\t\tvarying vec2 vUv;\n\n\t\t#ifdef USE_DASH\n\n\t\t\tuniform float dashScale;\n\t\t\tattribute float instanceDistanceStart;\n\t\t\tattribute float instanceDistanceEnd;\n\t\t\tvarying float vLineDistance;\n\n\t\t#endif\n\n\t\tvoid trimSegment( const in vec4 start, inout vec4 end ) {\n\n\t\t\t// trim end segment so it terminates between the camera plane and the near plane\n\n\t\t\t// conservative estimate of the near plane\n\t\t\tfloat a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column\n\t\t\tfloat b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column\n\t\t\tfloat nearEstimate = - 0.5 * b / a;\n\n\t\t\tfloat alpha = ( nearEstimate - start.z ) / ( end.z - start.z );\n\n\t\t\tend.xyz = mix( start.xyz, end.xyz, alpha );\n\n\t\t}\n\n\t\tvoid main() {\n\n\t\t\t#ifdef USE_COLOR\n\n\t\t\t\tvColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;\n\n\t\t\t#endif\n\n\t\t\t#ifdef USE_DASH\n\n\t\t\t\tvLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;\n\n\t\t\t#endif\n\n\t\t\tfloat aspect = resolution.x / resolution.y;\n\n\t\t\tvUv = uv;\n\n\t\t\t// camera space\n\t\t\tvec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );\n\t\t\tvec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\n\n\t\t\t// special case for perspective projection, and segments that terminate either in, or behind, the camera plane\n\t\t\t// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space\n\t\t\t// but we need to perform ndc-space calculations in the shader, so we must address this issue directly\n\t\t\t// perhaps there is a more elegant solution -- WestLangley\n\n\t\t\tbool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column\n\n\t\t\tif ( perspective ) {\n\n\t\t\t\tif ( start.z < 0.0 && end.z >= 0.0 ) {\n\n\t\t\t\t\ttrimSegment( start, end );\n\n\t\t\t\t} else if ( end.z < 0.0 && start.z >= 0.0 ) {\n\n\t\t\t\t\ttrimSegment( end, start );\n\n\t\t\t\t}\n\n\t\t\t}\n\n\t\t\t// clip space\n\t\t\tvec4 clipStart = projectionMatrix * start;\n\t\t\tvec4 clipEnd = projectionMatrix * end;\n\n\t\t\t// ndc space\n\t\t\tvec2 ndcStart = clipStart.xy / clipStart.w;\n\t\t\tvec2 ndcEnd = clipEnd.xy / clipEnd.w;\n\n\t\t\t// direction\n\t\t\tvec2 dir = ndcEnd - ndcStart;\n\n\t\t\t// account for clip-space aspect ratio\n\t\t\tdir.x *= aspect;\n\t\t\tdir = normalize( dir );\n\n\t\t\t// perpendicular to dir\n\t\t\tvec2 offset = vec2( dir.y, - dir.x );\n\n\t\t\t// undo aspect ratio adjustment\n\t\t\tdir.x /= aspect;\n\t\t\toffset.x /= aspect;\n\n\t\t\t// sign flip\n\t\t\tif ( position.x < 0.0 ) offset *= - 1.0;\n\n\t\t\t// endcaps\n\t\t\tif ( position.y < 0.0 ) {\n\n\t\t\t\toffset += - dir;\n\n\t\t\t} else if ( position.y > 1.0 ) {\n\n\t\t\t\toffset += dir;\n\n\t\t\t}\n\n\t\t\t// adjust for linewidth\n\t\t\toffset *= linewidth;\n\n\t\t\t// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...\n\t\t\toffset /= resolution.y;\n\n\t\t\t// select end\n\t\t\tvec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;\n\n\t\t\t// back to clip space\n\t\t\toffset *= clip.w;\n\n\t\t\tclip.xy += offset;\n\n\t\t\tgl_Position = clip;\n\n\t\t\tvec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation\n\n\t\t\t#include <logdepthbuf_vertex>\n\t\t\t#include <clipping_planes_vertex>\n\t\t\t#include <fog_vertex>\n\n\t\t}\n\t\t',
    fragmentShader:
      '\n\t\tuniform vec3 diffuse;\n\t\tuniform float opacity;\n\n\t\t#ifdef USE_DASH\n\n\t\t\tuniform float dashSize;\n\t\t\tuniform float gapSize;\n\n\t\t#endif\n\n\t\tvarying float vLineDistance;\n\n\t\t#include <common>\n\t\t#include <color_pars_fragment>\n\t\t#include <fog_pars_fragment>\n\t\t#include <logdepthbuf_pars_fragment>\n\t\t#include <clipping_planes_pars_fragment>\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\t#include <clipping_planes_fragment>\n\n\t\t\t#ifdef USE_DASH\n\n\t\t\t\tif ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps\n\n\t\t\t\tif ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX\n\n\t\t\t#endif\n\n\t\t\tif ( abs( vUv.y ) > 1.0 ) {\n\n\t\t\t\tfloat a = vUv.x;\n\t\t\t\tfloat b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;\n\t\t\t\tfloat len2 = a * a + b * b;\n\n\t\t\t\tif ( len2 > 1.0 ) discard;\n\n\t\t\t}\n\n\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\n\t\t\t#include <logdepthbuf_fragment>\n\t\t\t#include <color_fragment>\n\n\t\t\tgl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );\n\n\t\t\t#include <premultiplied_alpha_fragment>\n\t\t\t#include <tonemapping_fragment>\n\t\t\t#include <encodings_fragment>\n\t\t\t#include <fog_fragment>\n\n\t\t}\n\t\t'
  }

  var LineMaterial = /*#__PURE__*/ (function (_THREE$ShaderMaterial) {
    _inheritsLoose(LineMaterial, _THREE$ShaderMaterial)

    function LineMaterial (parameters) {
      var _this

      _this =
        _THREE$ShaderMaterial.call(this, {
          uniforms: THREE__namespace.UniformsUtils.clone(
            ShaderLib['line'].uniforms
          ),
          vertexShader: ShaderLib['line'].vertexShader,
          fragmentShader: ShaderLib['line'].fragmentShader
        }) || this
      _this.dashed = true
      _this.isLineMaterial = true
      _this.type = 'LineMaterial'
      Object.defineProperties(_assertThisInitialized(_this), {
        color: {
          enumerable: true,
          get: function get () {
            return this.uniforms.diffuse.value
          },
          set: function set (value) {
            this.uniforms.diffuse.value = value
          }
        },
        linewidth: {
          enumerable: true,
          get: function get () {
            return this.uniforms.linewidth.value
          },
          set: function set (value) {
            this.uniforms.linewidth.value = value
          }
        },
        dashScale: {
          enumerable: true,
          get: function get () {
            return this.uniforms.dashScale.value
          },
          set: function set (value) {
            this.uniforms.dashScale.value = value
          }
        },
        dashSize: {
          enumerable: true,
          get: function get () {
            return this.uniforms.dashSize.value
          },
          set: function set (value) {
            this.uniforms.dashSize.value = value
          }
        },
        gapSize: {
          enumerable: true,
          get: function get () {
            return this.uniforms.gapSize.value
          },
          set: function set (value) {
            this.uniforms.gapSize.value = value
          }
        },
        resolution: {
          enumerable: true,
          get: function get () {
            return this.uniforms.resolution.value
          },
          set: function set (value) {
            this.uniforms.resolution.value.copy(value)
          }
        }
      })

      _this.setValues(parameters)

      return _this
    }

    return LineMaterial
  })(THREE__namespace.ShaderMaterial)

  var LineSegments2 = /*#__PURE__*/ (function (_THREE$Mesh) {
    _inheritsLoose(LineSegments2, _THREE$Mesh)

    function LineSegments2 (geometry, material) {
      var _this

      _this = _THREE$Mesh.call(this, geometry, material) || this
      _this.isLineSegments2 = true
      _this.type = 'LineSegments2'
      _this.geometry =
        geometry !== undefined ? geometry : new LineSegmentsGeometry()
      _this.material =
        material !== undefined
          ? material
          : new LineMaterial({
              color: Math.random() * 0xffffff
            })
      return _this
    }

    var _proto = LineSegments2.prototype

    _proto.computeLineDistances = function computeLineDistances () {
      var start = new THREE__namespace.Vector3()
      var end = new THREE__namespace.Vector3()
      var geometry = this.geometry
      var instanceStart = geometry.attributes.instanceStart
      var instanceEnd = geometry.attributes.instanceEnd

      if (!instanceStart || !instanceEnd) {
        return this
      }

      var lineDistances = new Float32Array(2 * instanceStart.data.count)

      for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {
        start.fromBufferAttribute(instanceStart, i)
        end.fromBufferAttribute(instanceEnd, i)
        lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1]
        lineDistances[j + 1] = lineDistances[j] + start.distanceTo(end)
      }

      var instanceDistanceBuffer = new THREE__namespace.InstancedInterleavedBuffer(
        lineDistances,
        2,
        1
      ) // d0, d1

      addAttribute(
        geometry,
        'instanceDistanceStart',
        new THREE__namespace.InterleavedBufferAttribute(
          instanceDistanceBuffer,
          1,
          0
        )
      )
      addAttribute(
        geometry,
        'instanceDistanceEnd',
        new THREE__namespace.InterleavedBufferAttribute(
          instanceDistanceBuffer,
          1,
          1
        )
      ) // geometry.addAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)); // d0
      // geometry.addAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)); // d1

      return this
    }

    return LineSegments2
  })(THREE__namespace.Mesh)

  var LineGeometry = /*#__PURE__*/ (function (_LineSegmentsGeometry) {
    _inheritsLoose(LineGeometry, _LineSegmentsGeometry)

    function LineGeometry () {
      var _this

      _this = _LineSegmentsGeometry.call(this) || this
      _this.isLineGeometry = true
      _this.type = 'LineGeometry'
      return _this
    }

    var _proto = LineGeometry.prototype

    _proto.fromLine = function fromLine (line) {
      var geometry = line.geometry

      if (geometry.isGeometry) {
        this.setPositions(geometry.vertices)
      } else if (geometry.isBufferGeometry) {
        this.setPositions(geometry.position.array) // assumes non-indexed
      }

      return this
    }

    return LineGeometry
  })(LineSegmentsGeometry)

  var Line2 = /*#__PURE__*/ (function (_LineSegments) {
    _inheritsLoose(Line2, _LineSegments)

    function Line2 (geometry, material) {
      var _this

      _this = _LineSegments.call(this, geometry, material) || this
      _this.isLine2 = true
      _this.type = 'Line2'
      _this.geometry = geometry !== undefined ? geometry : new LineGeometry()
      _this.material =
        material !== undefined
          ? material
          : new LineMaterial({
              color: Math.random() * 0xffffff
            })
      return _this
    }

    var _proto = Line2.prototype

    _proto.copy = function copy (source) {
      return this
    }

    return Line2
  })(LineSegments2)

  var OPTIONS$k = {
    interactive: true,
    altitude: 0,
    minZoom: 0,
    maxZoom: 30,
    asynchronous: false
  }
  /**
   * a Class for Eventable
   */

  function Base () {} // class Base {
  //     constructor() {
  //     }
  // }

  /**
   * EVENTS=[
   *  'add',
   *  'remove',
      'mousemove',
      'click',
      'mousedown',
      'mouseup',
      'dblclick',
      'contextmenu',
      'touchstart',
      'touchmove',
      'touchend',
      'mouseover',
      'mouseout',
      'idchange',
      'propertieschange',
      'show',
      'hide',
      'symbolchange'
       empty
  ];
   * This is the base class for all 3D objects
   *
   *
   * Its function and maptalks.geometry are as similar as possible
   *
   * maptalks.Eventable(Base) return a Class  https://github.com/maptalks/maptalks.js/blob/master/src/core/Eventable.js
   *
   */

  var BaseObject = /*#__PURE__*/ (function (_maptalks$Eventable) {
    _inheritsLoose(BaseObject, _maptalks$Eventable)

    function BaseObject (id) {
      var _this

      _this = _maptalks$Eventable.call(this) || this
      _this.isAdd = false
      _this._mouseover = false
      _this._visible = true
      _this._zoomVisible = true
      _this.picked = false
      _this.isBaseObject = true

      if (id === undefined) {
        id = maptalks__namespace.Util.GUID()
      }

      _this.id = id
      return _this
    }

    var _proto = BaseObject.prototype

    _proto.addTo = function addTo (layer) {
      if (layer && layer.type === 'ThreeLayer') {
        layer.addMesh([this])
      } else {
        console.error('layer only support maptalks.ThreeLayer')
      }

      return this
    }

    _proto.remove = function remove () {
      var layer = this.getLayer()

      if (layer) {
        layer.removeMesh([this])
      }

      return this
    }

    _proto.getObject3d = function getObject3d () {
      return this.object3d
    }

    _proto.getId = function getId () {
      return this.id
    }

    _proto.setId = function setId (id) {
      var oldId = this.getId()
      this.id = id

      this._fire('idchange', {
        old: oldId,
        new: id,
        target: this
      })

      return this
    }

    _proto.getType = function getType () {
      return this.type
    }

    _proto.getOptions = function getOptions () {
      return this.options
    }

    _proto.getProperties = function getProperties () {
      return (this.options || {}).properties
    }

    _proto.setProperties = function setProperties (property) {
      var old = Object.assign({}, this.getProperties())
      this.options.properties = property

      this._fire('propertieschange', {
        old: old,
        new: property,
        target: this
      })

      return this
    }

    _proto.getLayer = function getLayer () {
      return this.options.layer
    } // eslint-disable-next-line consistent-return

    _proto.getMap = function getMap () {
      var layer = this.getLayer()

      if (layer) {
        return layer.getMap()
      }
    } // eslint-disable-next-line consistent-return

    _proto.getCenter = function getCenter () {
      var options = this.getOptions()
      var coordinate = options.coordinate,
        lineString = options.lineString,
        polygon = options.polygon

      if (coordinate) {
        return coordinate instanceof maptalks__namespace.Coordinate
          ? coordinate
          : new maptalks__namespace.Coordinate(coordinate)
      } else {
        var geometry = polygon || lineString

        if (geometry && geometry.getCenter) {
          return geometry.getCenter()
        }
      }
    }

    _proto.getAltitude = function getAltitude () {
      return this.getOptions().altitude
    }
    /**
     * Different objects need to implement their own methods
     * @param {*} altitude
     */

    _proto.setAltitude = function setAltitude (altitude) {
      if (maptalks__namespace.Util.isNumber(altitude)) {
        var z = this.getLayer().distanceToVector3(altitude, altitude).x
        this.getObject3d().position.z = z
        this.options.altitude = altitude

        if (this.pickObject3d) {
          this.pickObject3d.position.z = z
        } //fix merged mesh

        if (this._baseObjects && Array.isArray(this._baseObjects)) {
          for (var i = 0, len = this._baseObjects.length; i < len; i++) {
            if (this._baseObjects[i]) {
              this._baseObjects[i].getObject3d().position.z = z
            }
          }
        }
      }

      return this
    }

    _proto.show = function show () {
      //  in zoom range
      if (this._zoomVisible) {
        this.getObject3d().visible = true

        this._fire('show')
      }

      this._visible = true
      return this
    }

    _proto.hide = function hide () {
      this.getObject3d().visible = false

      this._fire('hide')

      this._visible = false
      return this
    }

    _proto.isVisible = function isVisible () {
      return !!this.getObject3d().visible
    }
    /**
     *  Different objects need to implement their own methods
     */

    _proto.getSymbol = function getSymbol () {
      return this.getObject3d().material
    }
    /**
     *  Different objects need to implement their own methods
     * @param {*} material
     */

    _proto.setSymbol = function setSymbol (material) {
      if (material && material instanceof THREE__namespace.Material) {
        material.needsUpdate = true
        material.vertexColors = this.getObject3d().material.vertexColors
        var old = this.getObject3d().material.clone()
        this.getObject3d().material = material

        this._fire('symbolchange', {
          old: old,
          new: material,
          target: this
        })
      }

      return this
    }

    _proto.setInfoWindow = function setInfoWindow (options) {
      this.removeInfoWindow()
      this.infoWindow = new maptalks__namespace.ui.InfoWindow(options)
      this.infoWindow.addTo(this)
      return this
    }

    _proto.getInfoWindow = function getInfoWindow () {
      return this.infoWindow
    }

    _proto.openInfoWindow = function openInfoWindow (coordinate) {
      coordinate = coordinate || this.getCenter()

      if (!(coordinate instanceof maptalks__namespace.Coordinate)) {
        coordinate = new maptalks__namespace.Coordinate(coordinate)
      } // eslint-disable-next-line no-unused-expressions

      coordinate && this.infoWindow && this.infoWindow.show(coordinate)
      return this
    }

    _proto.closeInfoWindow = function closeInfoWindow () {
      // eslint-disable-next-line no-unused-expressions
      this.infoWindow && this.infoWindow.hide()
      return this
    }

    _proto.removeInfoWindow = function removeInfoWindow () {
      // eslint-disable-next-line no-unused-expressions
      if (this.infoWindow) {
        this.infoWindow.remove()
        delete this.infoWindow
      }

      return this
    }

    _proto.setToolTip = function setToolTip (content, options) {
      this.removeToolTip()
      this.toolTip = new maptalks__namespace.ui.ToolTip(content, options)
      this.toolTip.addTo(this)
      return this
    }

    _proto.getToolTip = function getToolTip () {
      return this.toolTip
    }

    _proto.openToolTip = function openToolTip (coordinate) {
      coordinate = coordinate || this.getCenter()

      if (!(coordinate instanceof maptalks__namespace.Coordinate)) {
        coordinate = new maptalks__namespace.Coordinate(coordinate)
      } // eslint-disable-next-line no-unused-expressions

      coordinate && this.toolTip && this.toolTip.show(coordinate)
      return this
    }

    _proto.closeToolTip = function closeToolTip () {
      // eslint-disable-next-line no-unused-expressions
      this.toolTip && this.toolTip.hide()
      return this
    }

    _proto.removeToolTip = function removeToolTip () {
      // eslint-disable-next-line no-unused-expressions
      if (this.toolTip) {
        this.toolTip.remove()
        delete this.toolTip
      }

      return this
    }
    /**
     * different components should implement their own animation methods
     * @param {*} options
     * @param {*} cb
     */
    // eslint-disable-next-line no-unused-vars

    _proto.animateShow = function animateShow (options, cb) {
      var _this2 = this

      if (options === void 0) {
        options = {}
      }

      if (this._showPlayer) {
        this._showPlayer.cancel()
      }

      if (maptalks__namespace.Util.isFunction(options)) {
        options = {}
        cb = options
      }

      var duration = options['duration'] || 1000,
        easing = options['easing'] || 'out'
      var player = (this._showPlayer = maptalks__namespace.animation.Animation.animate(
        {
          scale: 1
        },
        {
          duration: duration,
          easing: easing
        },
        function (frame) {
          var scale = frame.styles.scale

          if (scale > 0) {
            _this2.getObject3d().scale.z = scale
          }

          if (cb) {
            cb(frame, scale)
          }
        }
      ))
      player.play()
      return player
    }

    _proto.getMinZoom = function getMinZoom () {
      return this.getOptions().minZoom
    }

    _proto.getMaxZoom = function getMaxZoom () {
      return this.getOptions().maxZoom
    }

    _proto.isAsynchronous = function isAsynchronous () {
      return this.getOptions().asynchronous
    }

    _proto.fire = function fire (eventType, param) {
      this._fire(eventType, param)

      if (this._vt && this._vt.onSelectMesh) {
        this._vt.onSelectMesh(eventType, param)
      }

      return this
    }

    _proto.config = function config () {
      return this
    }

    _proto.setPickObject3d = function setPickObject3d (object3d) {
      this.pickObject3d = object3d
      this.pickObject3d['__parent'] = this
      return this
    }
    /**
     * more method support
     * @param {*} options
     */

    /**
     *
     * @param {*} options
     */

    _proto._initOptions = function _initOptions (options) {
      this.options = maptalks__namespace.Util.extend({}, OPTIONS$k, options)
      return this
    }

    _proto._createMesh = function _createMesh (geometry, material) {
      this.object3d = new THREE__namespace.Mesh(geometry, material)
      this.object3d['__parent'] = this
      return this
    }

    _proto._createGroup = function _createGroup () {
      this.object3d = new THREE__namespace.Group()
      this.object3d['__parent'] = this
      return this
    }

    _proto._createLine = function _createLine (geometry, material) {
      this.object3d = new THREE__namespace.Line(geometry, material) // (this.object3d as THREE.Line).computeLineDistances();

      this._computeLineDistances(geometry)

      this.object3d['__parent'] = this
      return this
    }

    _proto._createLine2 = function _createLine2 (geometry, material) {
      this.object3d = new Line2(geometry, material)
      this.object3d.computeLineDistances()
      this.object3d['__parent'] = this
      return this
    } // eslint-disable-next-line no-unused-vars

    _proto._createPoints = function _createPoints (geometry, material) {
      //Serving for particles
      this.object3d = new THREE__namespace.Points(geometry, material)
      this.object3d['__parent'] = this
      return this
    }

    _proto._createLineSegments = function _createLineSegments (
      geometry,
      material
    ) {
      this.object3d = new THREE__namespace.LineSegments(geometry, material) // (this.object3d as THREE.LineSegments).computeLineDistances();

      this._computeLineDistances(geometry)

      this.object3d['__parent'] = this
      return this
    }
    /**
     * rewrite three.js computeLineDistances ,1.7 speed
     * @param geometry
     */

    _proto._computeLineDistances = function _computeLineDistances (geometry) {
      var position = geometry.attributes.position.array
      var count = geometry.attributes.position.count
      var lineDistances = new Float32Array(count)
      lineDistances[0] = 0
      var start = new THREE__namespace.Vector3(0, 0, 0),
        end = new THREE__namespace.Vector3(0, 0, 0)

      for (var i = 1; i < count; i++) {
        var idx = (i - 1) * 3
        start.x = position[idx]
        start.y = position[idx + 1]
        start.z = position[idx + 2]
        var idx1 = i * 3
        end.x = position[idx1]
        end.y = position[idx1 + 1]
        end.z = position[idx1 + 2]
        var distance = end.distanceTo(start)
        lineDistances[i] = lineDistances[i - 1] + distance
      }

      addAttribute(
        geometry,
        'lineDistance',
        new THREE__namespace.BufferAttribute(lineDistances, 1)
      )
    }

    return BaseObject
  })(maptalks__namespace.Eventable(Base))

  function mergeBufferGeometries (geometries) {
    var _mergeBufferGeometrie = mergeBufferGeometriesAttribute(geometries),
      position = _mergeBufferGeometrie.position,
      normal = _mergeBufferGeometrie.normal,
      uv = _mergeBufferGeometrie.uv,
      indices = _mergeBufferGeometrie.indices

    var bufferGeomertry = new THREE__namespace.BufferGeometry()
    var color = new Float32Array(position.length)
    color.fill(1, 0, position.length)
    addAttribute(
      bufferGeomertry,
      'color',
      new THREE__namespace.BufferAttribute(color, 3)
    )
    addAttribute(
      bufferGeomertry,
      'normal',
      new THREE__namespace.BufferAttribute(normal, 3)
    )
    addAttribute(
      bufferGeomertry,
      'position',
      new THREE__namespace.BufferAttribute(position, 3)
    )

    if (uv && uv.length) {
      addAttribute(
        bufferGeomertry,
        'uv',
        new THREE__namespace.BufferAttribute(uv, 2)
      )
    }

    bufferGeomertry.setIndex(new THREE__namespace.BufferAttribute(indices, 1))
    return bufferGeomertry
  }
  function mergeBufferGeometriesAttribute (geometries) {
    var attributes = {},
      attributesLen = {}

    for (var i = 0; i < geometries.length; ++i) {
      var geometry = geometries[i]

      for (var name in geometry) {
        if (attributes[name] === undefined) {
          attributes[name] = []
          attributesLen[name] = 0
        }

        attributes[name].push(geometry[name])
        attributesLen[name] += geometry[name].length
      }
    } // merge attributes

    var mergedGeometry = {}
    var indexOffset = 0
    var mergedIndex = new Uint32Array(attributesLen['indices'])

    for (var _name in attributes) {
      if (_name === 'indices') {
        var indices = attributes[_name]
        var iIndex = 0

        for (var _i = 0, len = indices.length; _i < len; _i++) {
          var index = indices[_i]

          for (var j = 0, len1 = index.length; j < len1; j++) {
            mergedIndex[iIndex] = index[j] + indexOffset
            iIndex++ // mergedIndex.push(index[j] + indexOffset);
          }

          indexOffset += attributes['position'][_i].length / 3
        }
      } else {
        var mergedAttribute = mergeBufferAttributes(
          attributes[_name],
          attributesLen[_name]
        )
        if (!mergedAttribute) return null
        mergedGeometry[_name] = mergedAttribute
      }
    }

    mergedGeometry['indices'] = mergedIndex
    return mergedGeometry
  }

  function mergeBufferAttributes (attributes, arrayLength) {
    var array = new Float32Array(arrayLength)
    var offset = 0

    for (var i = 0; i < attributes.length; ++i) {
      array.set(attributes[i], offset)
      offset += attributes[i].length
    }

    return array
  }

  function generateBufferGeometry (data) {
    //arraybuffer data
    var position = data.position,
      normal = data.normal,
      uv = data.uv,
      indices = data.indices // const color = new Float32Array(position.length);
    // color.fill(1, 0, position.length);

    var bufferGeomertry = new THREE__namespace.BufferGeometry() // addAttribute(bufferGeomertry, 'color', new THREE.BufferAttribute(color, 3));

    addAttribute(
      bufferGeomertry,
      'normal',
      new THREE__namespace.BufferAttribute(new Float32Array(normal), 3)
    )
    addAttribute(
      bufferGeomertry,
      'position',
      new THREE__namespace.BufferAttribute(new Float32Array(position), 3)
    )
    addAttribute(
      bufferGeomertry,
      'uv',
      new THREE__namespace.BufferAttribute(new Float32Array(uv), 2)
    )
    bufferGeomertry.setIndex(
      new THREE__namespace.BufferAttribute(new Uint32Array(indices), 1)
    )
    return bufferGeomertry
  }
  function generatePickBufferGeometry (geometry) {
    var bufferGeomertry = new THREE__namespace.BufferGeometry()
    addAttribute(bufferGeomertry, 'normal', geometry.getAttribute('normal'))
    addAttribute(
      bufferGeomertry,
      'position',
      geometry.getAttribute('position').clone()
    )
    bufferGeomertry.setIndex(geometry.getIndex())
    return bufferGeomertry
  }
  var defaultBufferGeometry
  function getDefaultBufferGeometry () {
    if (!defaultBufferGeometry) {
      var SIZE = 0.000001
      defaultBufferGeometry = new THREE__namespace.BoxBufferGeometry(
        SIZE,
        SIZE,
        SIZE
      )
    }

    return defaultBufferGeometry
  }
  getDefaultBufferGeometry()

  var MergeGeometryUtil = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    mergeBufferGeometries: mergeBufferGeometries,
    mergeBufferGeometriesAttribute: mergeBufferGeometriesAttribute,
    generateBufferGeometry: generateBufferGeometry,
    generatePickBufferGeometry: generatePickBufferGeometry,
    getDefaultBufferGeometry: getDefaultBufferGeometry
  })

  var barGeometryCache = {}
  var defaultBoxGeometry = new THREE__namespace.BoxBufferGeometry(1, 1, 1)
  defaultBoxGeometry.translate(0, 0, 0.5)
  var topColor$1 = new THREE__namespace.Color('#fff'),
    bottomColor$1 = new THREE__namespace.Color('#fff')

  function getDefaultCylinderBufferGeometry (radialSegments) {
    if (radialSegments === void 0) {
      radialSegments = 6
    }

    if (!barGeometryCache[radialSegments]) {
      var geometry = new THREE__namespace.CylinderBufferGeometry(
        1,
        1,
        1,
        radialSegments,
        1
      )
      geometry.rotateX(Math.PI / 2)
      geometry.translate(0, 0, 0.5)
      geometry.rotateZ(Math.PI / 6)
      barGeometryCache[radialSegments] = geometry
    }

    return barGeometryCache[radialSegments]
  }
  /**
   * Reuse Geometry   , Meter as unit
   * @param {*} property
   */
  // eslint-disable-next-line no-unused-vars

  function getGeometry (property) {
    var height = property.height,
      radialSegments = property.radialSegments,
      radius = property.radius
    var geometry = getDefaultCylinderBufferGeometry(radialSegments).clone()
    geometry.scale(radius, radius, height)
    return geometry
  }
  /**
   * init Colors
   * @param {*} geometry
   * @param {*} color
   * @param {*} _topColor
   */

  function initVertexColors$1 (geometry, color, _topColor, key, v) {
    if (key === void 0) {
      key = 'y'
    }

    if (v === void 0) {
      v = 0
    }

    var offset = 0

    if (key === 'y') {
      offset = 1
    } else if (key === 'z') {
      offset = 2
    }

    var position = geometry.attributes.position.array
    var len = position.length
    bottomColor$1.setStyle(color)
    topColor$1.setStyle(_topColor)
    var colors = new Float32Array(len)

    for (var i = 0; i < len; i += 3) {
      var y = position[i + offset]

      if (y > v) {
        colors[i] = topColor$1.r
        colors[i + 1] = topColor$1.g
        colors[i + 2] = topColor$1.b // colors.push(topColor.r, topColor.g, topColor.b);
      } else {
        colors[i] = bottomColor$1.r
        colors[i + 1] = bottomColor$1.g
        colors[i + 2] = bottomColor$1.b // colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
      }
    }

    addAttribute(
      geometry,
      'color',
      new THREE__namespace.BufferAttribute(colors, 3, true)
    )
    return colors
  }
  function mergeBarGeometry (geometries) {
    var attributes = []
    var len = geometries.length
    var colorLen = 0

    for (var i = 0; i < len; i++) {
      var color = geometries[i].attributes.color

      if (color) {
        colorLen += color.array.length
      }
    }

    var colors = new Float32Array(colorLen)
    var offset = 0

    for (var _i = 0, _len = geometries.length; _i < _len; _i++) {
      var _geometries$_i$attrib = geometries[_i].attributes,
        _color = _geometries$_i$attrib.color,
        normal = _geometries$_i$attrib.normal,
        position = _geometries$_i$attrib.position,
        uv = _geometries$_i$attrib.uv
      var index = geometries[_i].index

      if (_color) {
        colors.set(_color.array, offset)
        offset += _color.array.length // for (let j = 0, len1 = color.array.length; j < len1; j++) {
        //     colors.push(color.array[j]);
        // }
      }

      attributes.push({
        // color: color.array,
        normal: normal.array,
        uv: uv.array,
        position: position.array,
        indices: index.array
      })
    }

    var bufferGeometry = mergeBufferGeometries(attributes)

    if (colors.length) {
      addAttribute(
        bufferGeometry,
        'color',
        new THREE__namespace.BufferAttribute(colors, 3, true)
      ) // for (let i = 0, len = colors.length; i < len; i++) {
      //     bufferGeometry.attributes.color.array[i] = colors[i];
      // }
    }

    for (var _i2 = 0, _len2 = geometries.length; _i2 < _len2; _i2++) {
      geometries[_i2].dispose()
    }

    return bufferGeometry
  }
  function getDefaultBoxGeometry () {
    return defaultBoxGeometry
  }

  var OPTIONS$j = {
    radius: 10,
    height: 100,
    radialSegments: 6,
    altitude: 0,
    topColor: '',
    bottomColor: '#2d2f61'
  }
  /**
   *
   */

  var Bar = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(Bar, _BaseObject)

    function Bar (coordinate, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$j, options, {
        layer: layer,
        coordinate: coordinate
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _options = options,
        height = _options.height,
        radius = _options.radius,
        topColor = _options.topColor,
        bottomColor = _options.bottomColor,
        altitude = _options.altitude
      options.height = layer.distanceToVector3(height, height).x
      options.radius = layer.distanceToVector3(radius, radius).x // Meter as unit

      options['_radius'] = _this.options['radius']
      options['_height'] = _this.options['height']
      var geometry = getGeometry(options)

      if (topColor) {
        initVertexColors$1(
          geometry,
          bottomColor,
          topColor,
          'z',
          options.height / 2
        )
        material.vertexColors = getVertexColors()
      }

      _this._createMesh(geometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var position = layer.coordinateToVector3(coordinate, z)

      _this.getObject3d().position.copy(position)

      _this.type = 'Bar'
      return _this
    }

    return Bar
  })(BaseObject)

  /* eslint-disable indent */
  var TYPES = [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon'
  ]

  function getGeoJSONType (feature) {
    return feature.geometry ? feature.geometry.type : null
  }

  function isGeoJSON (feature) {
    var type = getGeoJSONType(feature)

    if (type) {
      for (var i = 0, len = TYPES.length; i < len; i++) {
        if (TYPES[i] === type) {
          return true
        }
      }
    }

    return false
  }
  function isGeoJSONPolygon (feature) {
    var type = getGeoJSONType(feature)

    if (type && (type === TYPES[4] || type === TYPES[5])) {
      return true
    }

    return false
  }
  function isGeoJSONLine (feature) {
    var type = getGeoJSONType(feature)

    if (type && (type === TYPES[2] || type === TYPES[3])) {
      return true
    }

    return false
  }
  function isGeoJSONPoint (feature) {
    var type = getGeoJSONType(feature)

    if (type && (type === TYPES[0] || type === TYPES[1])) {
      return true
    }

    return false
  }
  function isGeoJSONMulti (feature) {
    var type = getGeoJSONType(feature)

    if (type) {
      if (type.indexOf('Multi') > -1) {
        return true
      }
    }

    return false
  }
  function getGeoJSONCoordinates (feature) {
    return feature.geometry ? feature.geometry.coordinates : []
  }
  function getGeoJSONCenter (feature, out) {
    var type = getGeoJSONType(feature)

    if (!type || !feature.geometry) {
      return null
    }

    var geometry = feature.geometry
    var coordinates = geometry.coordinates

    if (!coordinates) {
      return null
    } // const coords: Array<Array<number>> = [];

    var sumX = 0,
      sumY = 0,
      coordLen = 0

    switch (type) {
      case 'Point': {
        sumX = coordinates[0]
        sumY = coordinates[1] // coords.push(coordinates as Array<number>);

        coordLen++
        break
      }

      case 'MultiPoint':
      case 'LineString': {
        for (var i = 0, len = coordinates.length; i < len; i++) {
          sumX += coordinates[i][0]
          sumY += coordinates[i][1]
          coordLen++ // coords.push(coordinates[i] as Array<number>);
        }

        break
      }

      case 'MultiLineString':
      case 'Polygon': {
        for (var _i = 0, _len = coordinates.length; _i < _len; _i++) {
          for (var j = 0, len1 = coordinates[_i].length; j < len1; j++) {
            // coords.push((coordinates[i] as Array<Array<number>>)[j]);
            sumX += coordinates[_i][j][0]
            sumY += coordinates[_i][j][1]
            coordLen++
          }
        }

        break
      }

      case 'MultiPolygon': {
        for (var _i2 = 0, _len2 = coordinates.length; _i2 < _len2; _i2++) {
          for (var _j = 0, _len3 = coordinates[_i2].length; _j < _len3; _j++) {
            for (var m = 0, len2 = coordinates[_i2][_j].length; m < len2; m++) {
              // coords.push(((coordinates[i] as Array<Array<Array<number>>>)[j])[m]);
              sumX += coordinates[_i2][_j][m][0]
              sumY += coordinates[_i2][_j][m][1]
              coordLen++
            }
          }
        }

        break
      }
    }

    var x = sumX / coordLen,
      y = sumY / coordLen

    if (out) {
      out.x = x
      out.y = y
      return out
    }

    return new maptalks__namespace.Coordinate(x, y)
  }
  function spliteGeoJSONMulti (feature) {
    var type = getGeoJSONType(feature)

    if (!type || !feature.geometry) {
      return null
    }

    var geometry = feature.geometry
    var properties = feature.properties || {}
    var coordinates = geometry.coordinates

    if (!coordinates) {
      return null
    }

    var features = []
    var fType

    switch (type) {
      case 'MultiPoint': {
        fType = 'Point'
        break
      }

      case 'MultiLineString': {
        fType = 'LineString'
        break
      }

      case 'MultiPolygon': {
        fType = 'Polygon'
        break
      }
    }

    if (fType) {
      for (var i = 0, len = coordinates.length; i < len; i++) {
        features.push({
          type: 'Feature',
          geometry: {
            type: fType,
            coordinates: coordinates[i]
          },
          properties: properties
        })
      }
    } else {
      features.push(feature)
    }

    return features
  }

  var GeoJSONUtil = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    isGeoJSON: isGeoJSON,
    isGeoJSONPolygon: isGeoJSONPolygon,
    isGeoJSONLine: isGeoJSONLine,
    isGeoJSONPoint: isGeoJSONPoint,
    isGeoJSONMulti: isGeoJSONMulti,
    getGeoJSONCoordinates: getGeoJSONCoordinates,
    getGeoJSONCenter: getGeoJSONCenter,
    spliteGeoJSONMulti: spliteGeoJSONMulti
  })

  var earcut$2 = { exports: {} }

  earcut$2.exports = earcut
  earcut$2.exports.default = earcut

  function earcut (data, holeIndices, dim) {
    dim = dim || 2

    var hasHoles = holeIndices && holeIndices.length,
      outerLen = hasHoles ? holeIndices[0] * dim : data.length,
      outerNode = linkedList(data, 0, outerLen, dim, true),
      triangles = []

    if (!outerNode || outerNode.next === outerNode.prev) return triangles

    var minX, minY, maxX, maxY, x, y, invSize

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim)

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
      minX = maxX = data[0]
      minY = maxY = data[1]

      for (var i = dim; i < outerLen; i += dim) {
        x = data[i]
        y = data[i + 1]
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }

      // minX, minY and invSize are later used to transform coords into integers for z-order calculation
      invSize = Math.max(maxX - minX, maxY - minY)
      invSize = invSize !== 0 ? 1 / invSize : 0
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize)

    return triangles
  }

  // create a circular doubly linked list from polygon points in the specified winding order
  function linkedList (data, start, end, dim, clockwise) {
    var i, last

    if (clockwise === signedArea(data, start, end, dim) > 0) {
      for (i = start; i < end; i += dim)
        last = insertNode(i, data[i], data[i + 1], last)
    } else {
      for (i = end - dim; i >= start; i -= dim)
        last = insertNode(i, data[i], data[i + 1], last)
    }

    if (last && equals(last, last.next)) {
      removeNode(last)
      last = last.next
    }

    return last
  }

  // eliminate colinear or duplicate points
  function filterPoints (start, end) {
    if (!start) return start
    if (!end) end = start

    var p = start,
      again
    do {
      again = false

      if (
        !p.steiner &&
        (equals(p, p.next) || area$1(p.prev, p, p.next) === 0)
      ) {
        removeNode(p)
        p = end = p.prev
        if (p === p.next) break
        again = true
      } else {
        p = p.next
      }
    } while (again || p !== end)

    return end
  }

  // main ear slicing loop which triangulates a polygon (given as a linked list)
  function earcutLinked (ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize)

    var stop = ear,
      prev,
      next

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
      prev = ear.prev
      next = ear.next

      if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
        // cut off the triangle
        triangles.push(prev.i / dim)
        triangles.push(ear.i / dim)
        triangles.push(next.i / dim)

        removeNode(ear)

        // skipping the next vertex leads to less sliver triangles
        ear = next.next
        stop = next.next

        continue
      }

      ear = next

      // if we looped through the whole remaining polygon and can't find any more ears
      if (ear === stop) {
        // try filtering points and slicing again
        if (!pass) {
          earcutLinked(
            filterPoints(ear),
            triangles,
            dim,
            minX,
            minY,
            invSize,
            1
          )

          // if this didn't work, try curing all small self-intersections locally
        } else if (pass === 1) {
          ear = cureLocalIntersections(filterPoints(ear), triangles, dim)
          earcutLinked(ear, triangles, dim, minX, minY, invSize, 2)

          // as a last resort, try splitting the remaining polygon into two
        } else if (pass === 2) {
          splitEarcut(ear, triangles, dim, minX, minY, invSize)
        }

        break
      }
    }
  }

  // check whether a polygon node forms a valid ear with adjacent nodes
  function isEar (ear) {
    var a = ear.prev,
      b = ear,
      c = ear.next

    if (area$1(a, b, c) >= 0) return false // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next

    while (p !== ear.prev) {
      if (
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area$1(p.prev, p, p.next) >= 0
      )
        return false
      p = p.next
    }

    return true
  }

  function isEarHashed (ear, minX, minY, invSize) {
    var a = ear.prev,
      b = ear,
      c = ear.next

    if (area$1(a, b, c) >= 0) return false // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : b.x < c.x ? b.x : c.x,
      minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : b.y < c.y ? b.y : c.y,
      maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : b.x > c.x ? b.x : c.x,
      maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : b.y > c.y ? b.y : c.y

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, invSize),
      maxZ = zOrder(maxTX, maxTY, minX, minY, invSize)

    var p = ear.prevZ,
      n = ear.nextZ

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
      if (
        p !== ear.prev &&
        p !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area$1(p.prev, p, p.next) >= 0
      )
        return false
      p = p.prevZ

      if (
        n !== ear.prev &&
        n !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
        area$1(n.prev, n, n.next) >= 0
      )
        return false
      n = n.nextZ
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
      if (
        p !== ear.prev &&
        p !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        area$1(p.prev, p, p.next) >= 0
      )
        return false
      p = p.prevZ
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
      if (
        n !== ear.prev &&
        n !== ear.next &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
        area$1(n.prev, n, n.next) >= 0
      )
        return false
      n = n.nextZ
    }

    return true
  }

  // go through all polygon nodes and cure small local self-intersections
  function cureLocalIntersections (start, triangles, dim) {
    var p = start
    do {
      var a = p.prev,
        b = p.next.next

      if (
        !equals(a, b) &&
        intersects(a, p, p.next, b) &&
        locallyInside(a, b) &&
        locallyInside(b, a)
      ) {
        triangles.push(a.i / dim)
        triangles.push(p.i / dim)
        triangles.push(b.i / dim)

        // remove two nodes involved
        removeNode(p)
        removeNode(p.next)

        p = start = b
      }
      p = p.next
    } while (p !== start)

    return filterPoints(p)
  }

  // try splitting polygon into two and triangulate them independently
  function splitEarcut (start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start
    do {
      var b = a.next.next
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          // split the polygon in two by the diagonal
          var c = splitPolygon(a, b)

          // filter colinear points around the cuts
          a = filterPoints(a, a.next)
          c = filterPoints(c, c.next)

          // run earcut on each half
          earcutLinked(a, triangles, dim, minX, minY, invSize)
          earcutLinked(c, triangles, dim, minX, minY, invSize)
          return
        }
        b = b.next
      }
      a = a.next
    } while (a !== start)
  }

  // link every hole into the outer loop, producing a single-ring polygon without holes
  function eliminateHoles (data, holeIndices, outerNode, dim) {
    var queue = [],
      i,
      len,
      start,
      end,
      list

    for (i = 0, len = holeIndices.length; i < len; i++) {
      start = holeIndices[i] * dim
      end = i < len - 1 ? holeIndices[i + 1] * dim : data.length
      list = linkedList(data, start, end, dim, false)
      if (list === list.next) list.steiner = true
      queue.push(getLeftmost(list))
    }

    queue.sort(compareX)

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
      eliminateHole(queue[i], outerNode)
      outerNode = filterPoints(outerNode, outerNode.next)
    }

    return outerNode
  }

  function compareX (a, b) {
    return a.x - b.x
  }

  // find a bridge between vertices that connects hole with an outer ring and and link it
  function eliminateHole (hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode)
    if (outerNode) {
      var b = splitPolygon(outerNode, hole)

      // filter collinear points around the cuts
      filterPoints(outerNode, outerNode.next)
      filterPoints(b, b.next)
    }
  }

  // David Eberly's algorithm for finding a bridge between hole and outer polygon
  function findHoleBridge (hole, outerNode) {
    var p = outerNode,
      hx = hole.x,
      hy = hole.y,
      qx = -Infinity,
      m

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
      if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
        var x = p.x + ((hy - p.y) * (p.next.x - p.x)) / (p.next.y - p.y)
        if (x <= hx && x > qx) {
          qx = x
          if (x === hx) {
            if (hy === p.y) return p
            if (hy === p.next.y) return p.next
          }
          m = p.x < p.next.x ? p : p.next
        }
      }
      p = p.next
    } while (p !== outerNode)

    if (!m) return null

    if (hx === qx) return m // hole touches outer segment; pick leftmost endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
      mx = m.x,
      my = m.y,
      tanMin = Infinity,
      tan

    p = m

    do {
      if (
        hx >= p.x &&
        p.x >= mx &&
        hx !== p.x &&
        pointInTriangle(
          hy < my ? hx : qx,
          hy,
          mx,
          my,
          hy < my ? qx : hx,
          hy,
          p.x,
          p.y
        )
      ) {
        tan = Math.abs(hy - p.y) / (hx - p.x) // tangential

        if (
          locallyInside(p, hole) &&
          (tan < tanMin ||
            (tan === tanMin &&
              (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))
        ) {
          m = p
          tanMin = tan
        }
      }

      p = p.next
    } while (p !== stop)

    return m
  }

  // whether sector in vertex m contains sector in vertex p in the same coordinates
  function sectorContainsSector (m, p) {
    return area$1(m.prev, m, p.prev) < 0 && area$1(p.next, m, m.next) < 0
  }

  // interlink polygon nodes in z-order
  function indexCurve (start, minX, minY, invSize) {
    var p = start
    do {
      if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize)
      p.prevZ = p.prev
      p.nextZ = p.next
      p = p.next
    } while (p !== start)

    p.prevZ.nextZ = null
    p.prevZ = null

    sortLinked(p)
  }

  // Simon Tatham's linked list merge sort algorithm
  // http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
  function sortLinked (list) {
    var i,
      p,
      q,
      e,
      tail,
      numMerges,
      pSize,
      qSize,
      inSize = 1

    do {
      p = list
      list = null
      tail = null
      numMerges = 0

      while (p) {
        numMerges++
        q = p
        pSize = 0
        for (i = 0; i < inSize; i++) {
          pSize++
          q = q.nextZ
          if (!q) break
        }
        qSize = inSize

        while (pSize > 0 || (qSize > 0 && q)) {
          if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
            e = p
            p = p.nextZ
            pSize--
          } else {
            e = q
            q = q.nextZ
            qSize--
          }

          if (tail) tail.nextZ = e
          else list = e

          e.prevZ = tail
          tail = e
        }

        p = q
      }

      tail.nextZ = null
      inSize *= 2
    } while (numMerges > 1)

    return list
  }

  // z-order of a point given coords and inverse of the longer side of data bbox
  function zOrder (x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) * invSize
    y = 32767 * (y - minY) * invSize

    x = (x | (x << 8)) & 0x00ff00ff
    x = (x | (x << 4)) & 0x0f0f0f0f
    x = (x | (x << 2)) & 0x33333333
    x = (x | (x << 1)) & 0x55555555

    y = (y | (y << 8)) & 0x00ff00ff
    y = (y | (y << 4)) & 0x0f0f0f0f
    y = (y | (y << 2)) & 0x33333333
    y = (y | (y << 1)) & 0x55555555

    return x | (y << 1)
  }

  // find the leftmost node of a polygon ring
  function getLeftmost (start) {
    var p = start,
      leftmost = start
    do {
      if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y))
        leftmost = p
      p = p.next
    } while (p !== start)

    return leftmost
  }

  // check if a point lies within a convex triangle
  function pointInTriangle (ax, ay, bx, by, cx, cy, px, py) {
    return (
      (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
      (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
      (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0
    )
  }

  // check if a diagonal between two polygon nodes is valid (lies in polygon interior)
  function isValidDiagonal (a, b) {
    return (
      a.next.i !== b.i &&
      a.prev.i !== b.i &&
      !intersectsPolygon(a, b) && // dones't intersect other edges
      ((locallyInside(a, b) &&
      locallyInside(b, a) &&
      middleInside(a, b) && // locally visible
        (area$1(a.prev, a, b.prev) || area$1(a, b.prev, b))) || // does not create opposite-facing sectors
        (equals(a, b) &&
          area$1(a.prev, a, a.next) > 0 &&
          area$1(b.prev, b, b.next) > 0))
    ) // special zero-length case
  }

  // signed area of a triangle
  function area$1 (p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
  }

  // check if two points are equal
  function equals (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y
  }

  // check if two segments intersect
  function intersects (p1, q1, p2, q2) {
    var o1 = sign(area$1(p1, q1, p2))
    var o2 = sign(area$1(p1, q1, q2))
    var o3 = sign(area$1(p2, q2, p1))
    var o4 = sign(area$1(p2, q2, q1))

    if (o1 !== o2 && o3 !== o4) return true // general case

    if (o1 === 0 && onSegment(p1, p2, q1)) return true // p1, q1 and p2 are collinear and p2 lies on p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true // p1, q1 and q2 are collinear and q2 lies on p1q1
    if (o3 === 0 && onSegment(p2, p1, q2)) return true // p2, q2 and p1 are collinear and p1 lies on p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true // p2, q2 and q1 are collinear and q1 lies on p2q2

    return false
  }

  // for collinear points p, q, r, check if point q lies on segment pr
  function onSegment (p, q, r) {
    return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    )
  }

  function sign (num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0
  }

  // check if a polygon diagonal intersects any polygon segments
  function intersectsPolygon (a, b) {
    var p = a
    do {
      if (
        p.i !== a.i &&
        p.next.i !== a.i &&
        p.i !== b.i &&
        p.next.i !== b.i &&
        intersects(p, p.next, a, b)
      )
        return true
      p = p.next
    } while (p !== a)

    return false
  }

  // check if a polygon diagonal is locally inside the polygon
  function locallyInside (a, b) {
    return area$1(a.prev, a, a.next) < 0
      ? area$1(a, b, a.next) >= 0 && area$1(a, a.prev, b) >= 0
      : area$1(a, b, a.prev) < 0 || area$1(a, a.next, b) < 0
  }

  // check if the middle point of a polygon diagonal is inside the polygon
  function middleInside (a, b) {
    var p = a,
      inside = false,
      px = (a.x + b.x) / 2,
      py = (a.y + b.y) / 2
    do {
      if (
        p.y > py !== p.next.y > py &&
        p.next.y !== p.y &&
        px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x
      )
        inside = !inside
      p = p.next
    } while (p !== a)

    return inside
  }

  // link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
  // if one belongs to the outer ring and another to a hole, it merges it into a single ring
  function splitPolygon (a, b) {
    var a2 = new Node(a.i, a.x, a.y),
      b2 = new Node(b.i, b.x, b.y),
      an = a.next,
      bp = b.prev

    a.next = b
    b.prev = a

    a2.next = an
    an.prev = a2

    b2.next = a2
    a2.prev = b2

    bp.next = b2
    b2.prev = bp

    return b2
  }

  // create a node and optionally link it with previous one (in a circular doubly linked list)
  function insertNode (i, x, y, last) {
    var p = new Node(i, x, y)

    if (!last) {
      p.prev = p
      p.next = p
    } else {
      p.next = last.next
      p.prev = last
      last.next.prev = p
      last.next = p
    }
    return p
  }

  function removeNode (p) {
    p.next.prev = p.prev
    p.prev.next = p.next

    if (p.prevZ) p.prevZ.nextZ = p.nextZ
    if (p.nextZ) p.nextZ.prevZ = p.prevZ
  }

  function Node (i, x, y) {
    // vertex index in coordinates array
    this.i = i

    // vertex coordinates
    this.x = x
    this.y = y

    // previous and next vertex nodes in a polygon ring
    this.prev = null
    this.next = null

    // z-order curve value
    this.z = null

    // previous and next nodes in z-order
    this.prevZ = null
    this.nextZ = null

    // indicates whether this is a steiner point
    this.steiner = false
  }

  // return a percentage difference between the polygon area and its triangulation area;
  // used to verify correctness of triangulation
  earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim))
    if (hasHoles) {
      for (var i = 0, len = holeIndices.length; i < len; i++) {
        var start = holeIndices[i] * dim
        var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length
        polygonArea -= Math.abs(signedArea(data, start, end, dim))
      }
    }

    var trianglesArea = 0
    for (i = 0; i < triangles.length; i += 3) {
      var a = triangles[i] * dim
      var b = triangles[i + 1] * dim
      var c = triangles[i + 2] * dim
      trianglesArea += Math.abs(
        (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
          (data[a] - data[b]) * (data[c + 1] - data[a + 1])
      )
    }

    return polygonArea === 0 && trianglesArea === 0
      ? 0
      : Math.abs((trianglesArea - polygonArea) / polygonArea)
  }

  function signedArea (data, start, end, dim) {
    var sum = 0
    for (var i = start, j = end - dim; i < end; i += dim) {
      sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1])
      j = i
    }
    return sum
  }

  // turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
  earcut.flatten = function (data) {
    var dim = data[0][0].length,
      result = { vertices: [], holes: [], dimensions: dim },
      holeIndex = 0

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d])
      }
      if (i > 0) {
        holeIndex += data[i - 1].length
        result.holes.push(holeIndex)
      }
    }
    return result
  }

  var earcut$1 = earcut$2.exports

  /*
   (c) 2017, Vladimir Agafonkin
   Simplify.js, a high-performance JS polyline simplification library
   mourner.github.io/simplify-js
  */

  // to suit your point format, run search/replace for '.x' and '.y';
  // for 3D version, see 3d branch (configurability would draw significant performance overhead)

  // square distance between 2 points
  function getSqDist (p1, p2) {
    var dx = p1[0] - p2[0],
      dy = p1[1] - p2[1]

    return dx * dx + dy * dy
  }

  // square distance from a point to a segment
  function getSqSegDist (p, p1, p2) {
    var x = p1[0],
      y = p1[1],
      dx = p2[0] - x,
      dy = p2[1] - y

    if (dx !== 0 || dy !== 0) {
      var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy)

      if (t > 1) {
        x = p2[0]
        y = p2[1]
      } else if (t > 0) {
        x += dx * t
        y += dy * t
      }
    }

    dx = p[0] - x
    dy = p[1] - y

    return dx * dx + dy * dy
  }
  // rest of the code doesn't care about point format

  // basic distance-based simplification
  function simplifyRadialDist (points, sqTolerance) {
    var prevPoint = points[0],
      newPoints = [prevPoint],
      point

    for (var i = 1, len = points.length; i < len; i++) {
      point = points[i]

      if (getSqDist(point, prevPoint) > sqTolerance) {
        newPoints.push(point)
        prevPoint = point
      }
    }

    if (prevPoint !== point) newPoints.push(point)

    return newPoints
  }

  function simplifyDPStep (points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
      index

    for (var i = first + 1; i < last; i++) {
      var sqDist = getSqSegDist(points[i], points[first], points[last])

      if (sqDist > maxSqDist) {
        index = i
        maxSqDist = sqDist
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1)
        simplifyDPStep(points, first, index, sqTolerance, simplified)
      simplified.push(points[index])
      if (last - index > 1)
        simplifyDPStep(points, index, last, sqTolerance, simplified)
    }
  }

  // simplification using Ramer-Douglas-Peucker algorithm
  function simplifyDouglasPeucker (points, sqTolerance) {
    var last = points.length - 1

    var simplified = [points[0]]
    simplifyDPStep(points, 0, last, sqTolerance, simplified)
    simplified.push(points[last])

    return simplified
  }

  // both algorithms combined for awesome performance
  function simplify (points, tolerance, highestQuality) {
    if (points.length <= 2) return points

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance)
    points = simplifyDouglasPeucker(points, sqTolerance)

    return points
  }

  function dot (v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
  }
  function v2Dot (v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1]
  }

  function normalize (out, v) {
    const x = v[0]
    const y = v[1]
    const z = v[2]
    const d = Math.sqrt(x * x + y * y + z * z)
    out[0] = x / d
    out[1] = y / d
    out[2] = z / d
    return out
  }

  function v2Normalize (out, v) {
    const x = v[0]
    const y = v[1]
    const d = Math.sqrt(x * x + y * y)
    out[0] = x / d
    out[1] = y / d
    return out
  }

  function scale (out, v, s) {
    out[0] = v[0] * s
    out[1] = v[1] * s
    out[2] = v[2] * s
    return out
  }

  function scaleAndAdd (out, v1, v2, s) {
    out[0] = v1[0] + v2[0] * s
    out[1] = v1[1] + v2[1] * s
    out[2] = v1[2] + v2[2] * s
    return out
  }

  function v2Add (out, v1, v2) {
    out[0] = v1[0] + v2[0]
    out[1] = v1[1] + v2[1]
    return out
  }

  function v3Sub (out, v1, v2) {
    out[0] = v1[0] - v2[0]
    out[1] = v1[1] - v2[1]
    out[2] = v1[2] - v2[2]
    return out
  }

  function v3Normalize (out, v) {
    const x = v[0]
    const y = v[1]
    const z = v[2]
    const d = Math.sqrt(x * x + y * y + z * z)
    out[0] = x / d
    out[1] = y / d
    out[2] = z / d
    return out
  }

  function v3Cross (out, v1, v2) {
    var ax = v1[0],
      ay = v1[1],
      az = v1[2],
      bx = v2[0],
      by = v2[1],
      bz = v2[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
  }

  const rel = []
  // start and end must be normalized
  function slerp (out, start, end, t) {
    // https://keithmaggio.wordpress.com/2011/02/15/math-magician-lerp-slerp-and-nlerp/
    const cosT = dot(start, end)
    const theta = Math.acos(cosT) * t

    scaleAndAdd(rel, end, start, -cosT)
    normalize(rel, rel) // start and rel Orthonormal basis

    scale(out, start, Math.cos(theta))
    scaleAndAdd(out, out, rel, Math.sin(theta))

    return out
  }

  function lineIntersection (x1, y1, x2, y2, x3, y3, x4, y4, out, writeOffset) {
    const dx1 = x2 - x1
    const dx2 = x4 - x3
    const dy1 = y2 - y1
    const dy2 = y4 - y3

    const cross = dy2 * dx1 - dx2 * dy1
    const tmp1 = y1 - y3
    const tmp2 = x1 - x3
    const t1 = (dx2 * tmp1 - dy2 * tmp2) / cross
    // const t2 = (dx1 * tmp1 - dy1 * tmp2) / cross;

    if (out) {
      writeOffset = writeOffset || 0
      out[writeOffset] = x1 + t1 * (x2 - x1)
      out[writeOffset + 1] = y1 + t1 * (y2 - y1)
    }

    return t1
  }

  function area (points, start, end) {
    // Signed polygon area
    const n = end - start
    if (n < 3) {
      return 0
    }
    let area = 0
    for (let i = (end - 1) * 2, j = start * 2; j < end * 2; ) {
      const x0 = points[i]
      const y0 = points[i + 1]
      const x1 = points[j]
      const y1 = points[j + 1]
      i = j
      j += 2
      area += x0 * y1 - x1 * y0
    }

    return area
  }

  // TODO fitRect x, y are negative?

  function triangulate (vertices, holes, dimensions = 2) {
    return earcut$1(vertices, holes, dimensions)
  }
  function flatten (data) {
    return earcut$1.flatten(data)
  }

  const v1 = []
  const v2 = []
  const v = []

  function innerOffsetPolygon (
    vertices,
    out,
    start,
    end,
    outStart,
    offset,
    miterLimit,
    close,
    removeIntersections
    // offsetLines
  ) {
    const checkMiterLimit = miterLimit != null
    let cursor = outStart
    let indicesMap = null
    if (checkMiterLimit) {
      indicesMap = new Uint32Array(end - start)
    }
    let prevOffsetX
    let prevOffsetY
    let prevCursor
    let tmpIntersection = []

    for (let i = start; i < end; i++) {
      const nextIdx = i === end - 1 ? start : i + 1
      const prevIdx = i === start ? end - 1 : i - 1
      const x1 = vertices[prevIdx * 2]
      const y1 = vertices[prevIdx * 2 + 1]
      const x2 = vertices[i * 2]
      const y2 = vertices[i * 2 + 1]
      const x3 = vertices[nextIdx * 2]
      const y3 = vertices[nextIdx * 2 + 1]

      v1[0] = x2 - x1
      v1[1] = y2 - y1
      v2[0] = x3 - x2
      v2[1] = y3 - y2

      v2Normalize(v1, v1)
      v2Normalize(v2, v2)

      checkMiterLimit && (indicesMap[i] = cursor)

      let needCheckIntersection = false
      let offsetX
      let offsetY
      if (!close && i === start) {
        v[0] = v2[1]
        v[1] = -v2[0]
        v2Normalize(v, v)
        prevOffsetX = out[cursor * 2] = x2 + v[0] * offset
        prevOffsetY = out[cursor * 2 + 1] = y2 + v[1] * offset
        prevCursor = cursor

        // offsetLines && offsetLines.push([x2, y2, prevOffsetX, prevOffsetY, cursor])
        cursor++
      } else if (!close && i === end - 1) {
        v[0] = v1[1]
        v[1] = -v1[0]
        v2Normalize(v, v)

        offsetX = x2 + v[0] * offset
        offsetY = y2 + v[1] * offset

        needCheckIntersection = true
      } else {
        // PENDING Why using sub will lost the direction info.
        v2Add(v, v2, v1)
        const tmp = v[1]
        v[1] = -v[0]
        v[0] = tmp

        v2Normalize(v, v)

        const cosA = v2Dot(v, v2)
        const sinA = Math.sqrt(1 - cosA * cosA)
        // PENDING
        // Make sure it's offset lines instead of vertices.
        const miter = offset * Math.min(10, 1 / sinA)

        const isCovex = offset * cosA < 0

        if (checkMiterLimit && 1 / sinA > miterLimit && isCovex) {
          // No need to check line intersection on the outline.
          const mx = x2 + v[0] * offset
          const my = y2 + v[1] * offset
          const halfA = Math.acos(sinA) / 2
          const dist = Math.tan(halfA) * Math.abs(offset)
          out[cursor * 2] = mx + v[1] * dist
          out[cursor * 2 + 1] = my - v[0] * dist
          cursor++
          out[cursor * 2] = mx - v[1] * dist
          out[cursor * 2 + 1] = my + v[0] * dist
          cursor++
        } else {
          offsetX = x2 + v[0] * miter
          offsetY = y2 + v[1] * miter
          needCheckIntersection = true
        }

        if (needCheckIntersection) {
          // TODO Handle with whole.
          if (removeIntersections && prevOffsetX != null) {
            // Greedy, only check with previous offset line
            // PENDING: Is it necessary to check with other lines?
            const t = lineIntersection(
              x1,
              y1,
              prevOffsetX,
              prevOffsetY,
              x2,
              y2,
              offsetX,
              offsetY,
              tmpIntersection,
              0
            )
            // Use a eplison
            if (t >= -1e-2 && t <= 1 + 1e-2) {
              // Update previous offset points.
              out[prevCursor * 2] = offsetX = tmpIntersection[0]
              out[prevCursor * 2 + 1] = offsetY = tmpIntersection[1]
            }
          }

          prevOffsetX = out[cursor * 2] = offsetX
          prevOffsetY = out[cursor * 2 + 1] = offsetY
          prevCursor = cursor

          // offsetLines && offsetLines.push([x2, y2, offsetX, offsetY, cursor])

          cursor++
        }
      }
    }

    return indicesMap
  }

  function innerOffsetPolyline (
    vertices,
    out,
    start,
    end,
    outStart,
    offset,
    miterLimit,
    close
  ) {
    const checkMiterLimit = miterLimit != null
    let outOff = outStart
    let indicesMap = null
    if (checkMiterLimit) {
      indicesMap = new Uint32Array(end - start)
    }
    for (let i = start; i < end; i++) {
      const nextIdx = i === end - 1 ? start : i + 1
      const prevIdx = i === start ? end - 1 : i - 1
      const x1 = vertices[prevIdx * 2]
      const y1 = vertices[prevIdx * 2 + 1]
      const x2 = vertices[i * 2]
      const y2 = vertices[i * 2 + 1]
      const x3 = vertices[nextIdx * 2]
      const y3 = vertices[nextIdx * 2 + 1]

      v1[0] = x2 - x1
      v1[1] = y2 - y1
      v2[0] = x3 - x2
      v2[1] = y3 - y2

      v2Normalize(v1, v1)
      v2Normalize(v2, v2)

      checkMiterLimit && (indicesMap[i] = outOff)
      if (!close && i === start) {
        v[0] = v2[1]
        v[1] = -v2[0]
        v2Normalize(v, v)
        out[outOff * 2] = x2 + v[0] * offset
        out[outOff * 2 + 1] = y2 + v[1] * offset
        outOff++
      } else if (!close && i === end - 1) {
        v[0] = v1[1]
        v[1] = -v1[0]
        v2Normalize(v, v)
        out[outOff * 2] = x2 + v[0] * offset
        out[outOff * 2 + 1] = y2 + v[1] * offset
        outOff++
      } else {
        // PENDING Why using sub will lost the direction info.
        v2Add(v, v2, v1)
        const tmp = v[1]
        v[1] = -v[0]
        v[0] = tmp

        v2Normalize(v, v)

        const cosA = v2Dot(v, v2)
        const sinA = Math.sqrt(1 - cosA * cosA)
        // PENDING
        const miter = offset * Math.min(10, 1 / sinA)

        const isCovex = offset * cosA < 0

        if (checkMiterLimit && 1 / sinA > miterLimit && isCovex) {
          const mx = x2 + v[0] * offset
          const my = y2 + v[1] * offset
          const halfA = Math.acos(sinA) / 2
          const dist = Math.tan(halfA) * Math.abs(offset)
          out[outOff * 2] = mx + v[1] * dist
          out[outOff * 2 + 1] = my - v[0] * dist
          outOff++
          out[outOff * 2] = mx - v[1] * dist
          out[outOff * 2 + 1] = my + v[0] * dist
          outOff++
        } else {
          out[outOff * 2] = x2 + v[0] * miter
          out[outOff * 2 + 1] = y2 + v[1] * miter
          outOff++
        }
      }
    }

    return indicesMap
  }

  function offsetPolygon (vertices, holes, offset, miterLimit, close) {
    const offsetVertices =
      miterLimit != null ? [] : new Float32Array(vertices.length)
    const exteriorSize = holes && holes.length ? holes[0] : vertices.length / 2

    innerOffsetPolygon(
      vertices,
      offsetVertices,
      0,
      exteriorSize,
      0,
      offset,
      miterLimit,
      close,
      true
    )

    if (holes) {
      for (let i = 0; i < holes.length; i++) {
        const start = holes[i]
        const end = holes[i + 1] || vertices.length / 2
        innerOffsetPolygon(
          vertices,
          offsetVertices,
          start,
          end,
          miterLimit != null ? offsetVertices.length / 2 : start,
          offset,
          miterLimit,
          close,
          false
        )
      }
    }

    // TODO holes
    // Remove intersections of offseted polygon
    // let len = offsetLines.length;
    // let tmpIntersection = [];
    // for (let i = 0; i < len; i++) {
    //     const line1 = offsetLines[i];
    //     for (let k = i + 1; k < len; k++) {
    //         const line2 = offsetLines[k];

    //         const t = lineIntersection(
    //             line1[0], line1[1], line1[2], line1[3],
    //             line2[0], line2[1], line2[2], line2[3], tmpIntersection, 0
    //         );
    //         // Use a eplison
    //         if (t >= -1e-2 && t <= 1 + 1e-2) {
    //             const cursor1 = line1[4] * 2;
    //             const cursor2 = line2[4] * 2;
    //             // Update
    //             offsetVertices[cursor1] = offsetVertices[cursor2] = line1[2] = line2[2] = tmpIntersection[0];
    //             offsetVertices[cursor1 + 1] = offsetVertices[cursor2 + 1] = line1[3] = line2[3]= tmpIntersection[1];
    //         }
    //     }
    // }
    return offsetVertices
  }

  function reversePoints (points, stride, start, end) {
    for (let i = 0; i < Math.floor((end - start) / 2); i++) {
      for (let j = 0; j < stride; j++) {
        const a = (i + start) * stride + j
        const b = (end - i - 1) * stride + j
        const tmp = points[a]
        points[a] = points[b]
        points[b] = tmp
      }
    }

    return points
  }

  function convertToClockwise (vertices, holes) {
    let polygonVertexCount = vertices.length / 2
    let start = 0
    let end = holes && holes.length ? holes[0] : polygonVertexCount
    if (area(vertices, start, end) > 0) {
      reversePoints(vertices, 2, start, end)
    }
    for (let h = 1; h < (holes ? holes.length : 0) + 1; h++) {
      start = holes[h - 1]
      end = holes[h] || polygonVertexCount
      if (area(vertices, start, end) < 0) {
        reversePoints(vertices, 2, start, end)
      }
    }
  }

  function normalizeOpts (opts) {
    opts.depth = opts.depth || 1
    opts.bevelSize = opts.bevelSize || 0
    opts.bevelSegments = opts.bevelSegments == null ? 2 : opts.bevelSegments
    opts.smoothBevel = opts.smoothBevel || false
    opts.simplify = opts.simplify || 0

    if (opts.smoothSide == null) {
      opts.smoothSide = 'auto'
    }
    if (opts.smoothSideThreshold == null) {
      opts.smoothSideThreshold = 0.9
    }

    // Normalize bevel options.
    if (typeof opts.depth === 'number') {
      opts.bevelSize = Math.min(
        !(opts.bevelSegments > 0) ? 0 : opts.bevelSize,
        opts.depth / 2
      )
    }
    if (!(opts.bevelSize > 0)) {
      opts.bevelSegments = 0
    }
    opts.bevelSegments = Math.round(opts.bevelSegments)

    const boundingRect = opts.boundingRect
    opts.translate = opts.translate || [0, 0]
    opts.scale = opts.scale || [1, 1]
    if (opts.fitRect) {
      let targetX =
        opts.fitRect.x == null ? boundingRect.x || 0 : opts.fitRect.x
      let targetY =
        opts.fitRect.y == null ? boundingRect.y || 0 : opts.fitRect.y
      let targetWidth = opts.fitRect.width
      let targetHeight = opts.fitRect.height
      if (targetWidth == null) {
        if (targetHeight != null) {
          targetWidth =
            (targetHeight / boundingRect.height) * boundingRect.width
        } else {
          targetWidth = boundingRect.width
          targetHeight = boundingRect.height
        }
      } else if (targetHeight == null) {
        targetHeight = (targetWidth / boundingRect.width) * boundingRect.height
      }
      opts.scale = [
        targetWidth / boundingRect.width,
        targetHeight / boundingRect.height
      ]
      opts.translate = [
        (targetX - boundingRect.x) * opts.scale[0],
        (targetY - boundingRect.y) * opts.scale[1]
      ]
    }
  }

  function generateNormal (indices, position) {
    function v3Set (p, a, b, c) {
      p[0] = a
      p[1] = b
      p[2] = c
    }

    const p1 = []
    const p2 = []
    const p3 = []

    const v21 = []
    const v32 = []

    const n = []

    const len = indices.length
    const normals = new Float32Array(position.length)

    for (let f = 0; f < len; ) {
      const i1 = indices[f++] * 3
      const i2 = indices[f++] * 3
      const i3 = indices[f++] * 3

      v3Set(p1, position[i1], position[i1 + 1], position[i1 + 2])
      v3Set(p2, position[i2], position[i2 + 1], position[i2 + 2])
      v3Set(p3, position[i3], position[i3 + 1], position[i3 + 2])

      v3Sub(v21, p1, p2)
      v3Sub(v32, p2, p3)
      v3Cross(n, v21, v32)
      // Already be weighted by the triangle area
      for (let i = 0; i < 3; i++) {
        normals[i1 + i] = normals[i1 + i] + n[i]
        normals[i2 + i] = normals[i2 + i] + n[i]
        normals[i3 + i] = normals[i3 + i] + n[i]
      }
    }

    for (var i = 0; i < normals.length; ) {
      v3Set(n, normals[i], normals[i + 1], normals[i + 2])
      v3Normalize(n, n)
      normals[i++] = n[0]
      normals[i++] = n[1]
      normals[i++] = n[2]
    }

    return normals
  }
  // 0,0----1,0
  // 0,1----1,1
  const quadToTriangle = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
    [1, 1],
    [0, 1]
  ]

  function ringDistance (vertices, start, end) {
    let distance = 0
    let preX = vertices[start],
      preY = vertices[start + 1]
    const firstX = preX,
      firstY = preY
    for (let i = start + 2; i < end; i += 2) {
      const x = vertices[i],
        y = vertices[i + 1]
      distance += Math.sqrt((x - preX) * (x - preX) + (y - preY) * (y - preY))
      preX = x
      preY = y
    }
    distance += Math.sqrt(
      (preX - firstX) * (preX - firstX) + (preY - firstY) * (preY - firstY)
    )
    return distance
  }

  // Add side vertices and indices. Include bevel.
  function addExtrudeSide (
    out,
    { vertices, topVertices, splittedMap, depth, rect },
    start,
    end,
    cursors,
    opts
  ) {
    const ringVertexCount = end - start

    const splitBevel = opts.smoothBevel ? 1 : 2
    const bevelSize = Math.min(depth / 2, opts.bevelSize)
    const bevelSegments = opts.bevelSegments
    const vertexOffset = cursors.vertex
    const ringPerimeter = cursors.ringPerimeter
    const size = Math.max(rect.width, rect.height, depth, ringPerimeter)

    function isDuplicateVertex (idx) {
      const nextIdx = (idx + 1) % ringVertexCount
      const x0 = vertices[idx * 2]
      const y0 = vertices[idx * 2 + 1]
      const x1 = vertices[nextIdx * 2]
      const y1 = vertices[nextIdx * 2 + 1]
      return x0 === x1 && y0 === y1
    }

    // Side vertices
    if (bevelSize > 0) {
      const v0 = [0, 0, 1]
      const v1 = []
      const v2 = [0, 0, -1]
      const v = []

      let ringCount = 0
      let vLen = new Float32Array(ringVertexCount)
      for (let k = 0; k < 2; k++) {
        const z = k === 0 ? depth - bevelSize : bevelSize
        for (let s = 0; s <= bevelSegments * splitBevel; s++) {
          let uLen = 0
          let prevX
          let prevY
          for (let i = 0; i < ringVertexCount; i++) {
            const idx = ((i % ringVertexCount) + start) * 2
            const rawIdx = splittedMap ? splittedMap[idx / 2] * 2 : idx
            v1[0] = vertices[idx] - topVertices[rawIdx]
            v1[1] = vertices[idx + 1] - topVertices[rawIdx + 1]
            v1[2] = 0
            const l = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1])
            v1[0] /= l
            v1[1] /= l

            const t =
              (Math.floor(s / splitBevel) + (s % splitBevel)) / bevelSegments
            k === 0 ? slerp(v, v0, v1, t) : slerp(v, v1, v2, t)

            const t2 = k === 0 ? t : 1 - t
            const a = bevelSize * Math.sin((t2 * Math.PI) / 2)
            const b = l * Math.cos((t2 * Math.PI) / 2)

            // ellipse radius
            const r = (bevelSize * l) / Math.sqrt(a * a + b * b)

            const x = v[0] * r + topVertices[rawIdx]
            const y = v[1] * r + topVertices[rawIdx + 1]
            const zz = v[2] * r + z
            out.position[cursors.vertex * 3] = x
            out.position[cursors.vertex * 3 + 1] = y
            out.position[cursors.vertex * 3 + 2] = zz

            // TODO Cache and optimize
            if (i > 0) {
              uLen += Math.sqrt(
                (prevX - x) * (prevX - x) + (prevY - y) * (prevY - y)
              )
            }
            if (s > 0 || k > 0) {
              let tmp = (cursors.vertex - ringVertexCount) * 3
              let prevX2 = out.position[tmp]
              let prevY2 = out.position[tmp + 1]
              let prevZ2 = out.position[tmp + 2]

              vLen[i] += Math.sqrt(
                (prevX2 - x) * (prevX2 - x) +
                  (prevY2 - y) * (prevY2 - y) +
                  (prevZ2 - zz) * (prevZ2 - zz)
              )
            }
            out.uv[cursors.vertex * 2] = uLen / size
            out.uv[cursors.vertex * 2 + 1] = vLen[i] / size

            prevX = x
            prevY = y
            cursors.vertex++

            // Just ignore this face if vertex are duplicted in `splitVertices`
            if (isDuplicateVertex(i)) {
              continue
            }
            if (
              (splitBevel > 1 && s % splitBevel) ||
              (splitBevel === 1 && s >= 1)
            ) {
              for (let f = 0; f < 6; f++) {
                const m = (quadToTriangle[f][0] + i) % ringVertexCount
                const n = quadToTriangle[f][1] + ringCount
                out.indices[cursors.index++] =
                  (n - 1) * ringVertexCount + m + vertexOffset
              }
            }
          }

          ringCount++
        }
      }
    } else {
      for (let k = 0; k < 2; k++) {
        const z = k === 0 ? depth - bevelSize : bevelSize
        let uLen = 0
        let prevX
        let prevY
        for (let i = 0; i < ringVertexCount; i++) {
          const idx = ((i % ringVertexCount) + start) * 2
          const x = vertices[idx]
          const y = vertices[idx + 1]
          out.position[cursors.vertex * 3] = x
          out.position[cursors.vertex * 3 + 1] = y
          out.position[cursors.vertex * 3 + 2] = z
          if (i > 0) {
            uLen += Math.sqrt(
              (prevX - x) * (prevX - x) + (prevY - y) * (prevY - y)
            )
          }
          out.uv[cursors.vertex * 2] = uLen / size
          out.uv[cursors.vertex * 2 + 1] = z / size
          prevX = x
          prevY = y

          cursors.vertex++
        }
      }
    }
    // Connect the side
    const sideStartRingN = bevelSize > 0 ? bevelSegments * splitBevel + 1 : 1
    for (let i = 0; i < ringVertexCount; i++) {
      // Just ignore this face if vertex are duplicted in `splitVertices`
      if (isDuplicateVertex(i)) {
        continue
      }
      for (let f = 0; f < 6; f++) {
        const m = (quadToTriangle[f][0] + i) % ringVertexCount
        const n = quadToTriangle[f][1] + sideStartRingN
        out.indices[cursors.index++] =
          (n - 1) * ringVertexCount + m + vertexOffset
      }
    }
  }

  function addTopAndBottom (
    { indices, topVertices, rect, depth },
    out,
    cursors,
    opts
  ) {
    if (topVertices.length <= 4) {
      return
    }

    const vertexOffset = cursors.vertex
    // Top indices
    const indicesLen = indices.length
    for (let i = 0; i < indicesLen; i++) {
      out.indices[cursors.index++] = vertexOffset + indices[i]
    }
    const size = Math.max(rect.width, rect.height)
    // Top and bottom vertices
    for (let k = 0; k < (opts.excludeBottom ? 1 : 2); k++) {
      for (let i = 0; i < topVertices.length; i += 2) {
        const x = topVertices[i]
        const y = topVertices[i + 1]
        out.position[cursors.vertex * 3] = x
        out.position[cursors.vertex * 3 + 1] = y
        out.position[cursors.vertex * 3 + 2] = (1 - k) * depth

        out.uv[cursors.vertex * 2] = (x - rect.x) / size
        out.uv[cursors.vertex * 2 + 1] = (y - rect.y) / size
        cursors.vertex++
      }
    }
    // Bottom indices
    if (!opts.excludeBottom) {
      const vertexCount = topVertices.length / 2
      for (let i = 0; i < indicesLen; i += 3) {
        for (let k = 0; k < 3; k++) {
          out.indices[cursors.index++] =
            vertexOffset + vertexCount + indices[i + 2 - k]
        }
      }
    }
  }

  /**
   * Split vertices for sharp side.
   */
  function splitVertices (vertices, holes, smoothSide, smoothSideThreshold) {
    const isAutoSmooth = smoothSide == null || smoothSide === 'auto'
    if (smoothSide === true) {
      return { vertices, holes }
    }
    const newVertices = []
    const newHoles = holes && []
    const count = vertices.length / 2
    const v1 = []
    const v2 = []

    // Map of splitted index to raw index
    const splittedMap = []

    let start = 0
    let end = 0

    const polysCount = (holes ? holes.length : 0) + 1
    for (let h = 0; h < polysCount; h++) {
      if (h === 0) {
        end = holes && holes.length ? holes[0] : count
      } else {
        start = holes[h - 1]
        end = holes[h] || count
      }

      for (let i = start; i < end; i++) {
        const x2 = vertices[i * 2]
        const y2 = vertices[i * 2 + 1]
        const nextIdx = i === end - 1 ? start : i + 1
        const x3 = vertices[nextIdx * 2]
        const y3 = vertices[nextIdx * 2 + 1]

        if (isAutoSmooth) {
          const prevIdx = i === start ? end - 1 : i - 1
          const x1 = vertices[prevIdx * 2]
          const y1 = vertices[prevIdx * 2 + 1]

          v1[0] = x1 - x2
          v1[1] = y1 - y2
          v2[0] = x3 - x2
          v2[1] = y3 - y2

          v2Normalize(v1, v1)
          v2Normalize(v2, v2)

          const angleCos = v2Dot(v1, v2) * 0.5 + 0.5

          if (1 - angleCos > smoothSideThreshold) {
            newVertices.push(x2, y2)
            splittedMap.push(i)
          } else {
            newVertices.push(x2, y2, x2, y2)
            splittedMap.push(i, i)
          }
        } else {
          newVertices.push(x2, y2, x2, y2)
          splittedMap.push(i, i)
        }
      }

      if (h < polysCount - 1 && newHoles) {
        newHoles.push(newVertices.length / 2)
      }
    }

    return {
      vertices: new Float32Array(newVertices),
      splittedMap,
      holes: newHoles
    }
  }

  function innerExtrudeTriangulatedPolygon (preparedData, opts) {
    let indexCount = 0
    let vertexCount = 0

    for (let p = 0; p < preparedData.length; p++) {
      const {
        indices,
        vertices,
        splittedMap,
        topVertices,
        depth
      } = preparedData[p]
      const bevelSize = Math.min(depth / 2, opts.bevelSize)
      const bevelSegments = !(bevelSize > 0) ? 0 : opts.bevelSegments

      const holes = preparedData[p].holes || []

      indexCount += indices.length * (opts.excludeBottom ? 1 : 2)
      vertexCount += (topVertices.length / 2) * (opts.excludeBottom ? 1 : 2)
      const ringCount = 2 + bevelSegments * 2

      let start = 0
      let end = 0
      for (let h = 0; h < holes.length + 1; h++) {
        if (h === 0) {
          end = holes.length ? holes[0] : vertices.length / 2
        } else {
          start = holes[h - 1]
          end = holes[h] || vertices.length / 2
        }

        const faceEnd = splittedMap ? splittedMap[end - 1] + 1 : end
        const faceStart = splittedMap ? splittedMap[start] : start
        indexCount += (faceEnd - faceStart) * 6 * (ringCount - 1)

        const sideRingVertexCount = end - start
        vertexCount +=
          sideRingVertexCount * ringCount +
          // Double the bevel vertex number if not smooth
          (!opts.smoothBevel ? bevelSegments * sideRingVertexCount * 2 : 0)
      }
    }

    const data = {
      position: new Float32Array(vertexCount * 3),
      indices: new (vertexCount > 0xffff ? Uint32Array : Uint16Array)(
        indexCount
      ),
      uv: new Float32Array(vertexCount * 2)
    }

    const cursors = {
      vertex: 0,
      index: 0,
      ringPerimeter: 0
    }

    for (let d = 0; d < preparedData.length; d++) {
      addTopAndBottom(preparedData[d], data, cursors, opts)
    }

    for (let d = 0; d < preparedData.length; d++) {
      const { holes, vertices } = preparedData[d]
      const vertexCount = vertices.length / 2

      let start = 0
      let end = holes && holes.length ? holes[0] : vertexCount
      cursors.ringPerimeter = ringDistance(
        preparedData[d].topVertices,
        start,
        end
      )
      // Add exterior
      addExtrudeSide(data, preparedData[d], start, end, cursors, opts)
      // Add holes
      if (holes) {
        for (let h = 0; h < holes.length; h++) {
          start = holes[h]
          end = holes[h + 1] || vertexCount
          cursors.ringPerimeter = ringDistance(
            preparedData[d].topVertices,
            start,
            end
          )
          addExtrudeSide(data, preparedData[d], start, end, cursors, opts)
        }
      }
    }

    // Wrap uv
    for (let i = 0; i < data.uv.length; i++) {
      const val = data.uv[i]
      if (val > 0 && Math.round(val) === val) {
        data.uv[i] = 1
      } else {
        data.uv[i] = val % 1
      }
    }

    data.normal = generateNormal(data.indices, data.position)
    // PENDING
    data.boundingRect = preparedData[0] && preparedData[0].rect

    return data
  }

  function convertPolylineToTriangulatedPolygon (polyline, polylineIdx, opts) {
    const lineWidth = opts.lineWidth
    const pointCount = polyline.length
    const points = new Float32Array(pointCount * 2)
    const translate = opts.translate || [0, 0]
    const scale = opts.scale || [1, 1]
    for (let i = 0, k = 0; i < pointCount; i++) {
      points[k++] = polyline[i][0] * scale[0] + translate[0]
      points[k++] = polyline[i][1] * scale[1] + translate[1]
    }

    if (area(points, 0, pointCount) < 0) {
      reversePoints(points, 2, 0, pointCount)
    }

    const insidePoints = []
    const outsidePoints = []
    const miterLimit = opts.miterLimit
    const outsideIndicesMap = innerOffsetPolyline(
      points,
      outsidePoints,
      0,
      pointCount,
      0,
      -lineWidth / 2,
      miterLimit,
      false
    )
    reversePoints(points, 2, 0, pointCount)
    const insideIndicesMap = innerOffsetPolyline(
      points,
      insidePoints,
      0,
      pointCount,
      0,
      -lineWidth / 2,
      miterLimit,
      false
    )

    const polygonVertexCount = (insidePoints.length + outsidePoints.length) / 2
    const polygonVertices = new Float32Array(polygonVertexCount * 2)

    let offset = 0
    const outsidePointCount = outsidePoints.length / 2
    for (let i = 0; i < outsidePoints.length; i++) {
      polygonVertices[offset++] = outsidePoints[i]
    }
    for (let i = 0; i < insidePoints.length; i++) {
      polygonVertices[offset++] = insidePoints[i]
    }

    // Built indices
    const indices = new (polygonVertexCount > 0xffff
      ? Uint32Array
      : Uint16Array)(
      ((pointCount - 1) * 2 + (polygonVertexCount - pointCount * 2)) * 3
    )
    let off = 0
    for (let i = 0; i < pointCount - 1; i++) {
      const i2 = i + 1
      indices[off++] = outsidePointCount - 1 - outsideIndicesMap[i]
      indices[off++] = outsidePointCount - 1 - outsideIndicesMap[i] - 1
      indices[off++] = insideIndicesMap[i] + 1 + outsidePointCount

      indices[off++] = outsidePointCount - 1 - outsideIndicesMap[i]
      indices[off++] = insideIndicesMap[i] + 1 + outsidePointCount
      indices[off++] = insideIndicesMap[i] + outsidePointCount

      if (insideIndicesMap[i2] - insideIndicesMap[i] === 2) {
        indices[off++] = insideIndicesMap[i] + 2 + outsidePointCount
        indices[off++] = insideIndicesMap[i] + 1 + outsidePointCount
        indices[off++] = outsidePointCount - outsideIndicesMap[i2] - 1
      } else if (outsideIndicesMap[i2] - outsideIndicesMap[i] === 2) {
        indices[off++] = insideIndicesMap[i2] + outsidePointCount
        indices[off++] = outsidePointCount - 1 - (outsideIndicesMap[i] + 1)
        indices[off++] = outsidePointCount - 1 - (outsideIndicesMap[i] + 2)
      }
    }

    const topVertices =
      opts.bevelSize > 0
        ? offsetPolygon(polygonVertices, [], opts.bevelSize, null, true)
        : polygonVertices
    const boundingRect = opts.boundingRect

    const res = splitVertices(
      polygonVertices,
      null,
      opts.smoothSide,
      opts.smoothSideThreshold
    )
    return {
      vertices: res.vertices,
      rawVertices: topVertices,
      splittedMap: res.splittedMap,
      indices,
      topVertices,
      rect: {
        x: boundingRect.x * scale[0] + translate[0],
        y: boundingRect.y * scale[1] + translate[1],
        width: boundingRect.width * scale[0],
        height: boundingRect.height * scale[1]
      },
      depth:
        typeof opts.depth === 'function' ? opts.depth(polylineIdx) : opts.depth,
      holes: []
    }
  }

  function removeClosePointsOfPolygon (polygon, epsilon) {
    const newPolygon = []
    for (let k = 0; k < polygon.length; k++) {
      const points = polygon[k]
      const newPoints = []
      const len = points.length
      let x1 = points[len - 1][0]
      let y1 = points[len - 1][1]
      let dist = 0
      for (let i = 0; i < len; i++) {
        let x2 = points[i][0]
        let y2 = points[i][1]
        const dx = x2 - x1
        const dy = y2 - y1
        dist += Math.sqrt(dx * dx + dy * dy)
        if (dist > epsilon) {
          newPoints.push(points[i])
          dist = 0
        }
        x1 = x2
        y1 = y2
      }
      if (newPoints.length >= 3) {
        newPolygon.push(newPoints)
      }
    }
    return newPolygon.length > 0 ? newPolygon : null
  }

  function simplifyPolygon (polygon, tolerance) {
    const newPolygon = []
    for (let k = 0; k < polygon.length; k++) {
      let points = polygon[k]
      points = simplify(points, tolerance, true)
      if (points.length >= 3) {
        newPolygon.push(points)
      }
    }
    return newPolygon.length > 0 ? newPolygon : null
  }
  /**
   *
   * @param {Array} polygons Polygons array that match GeoJSON MultiPolygon geometry.
   * @param {Object} [opts]
   * @param {number|Function} [opts.depth]
   * @param {number} [opts.bevelSize = 0]
   * @param {number} [opts.bevelSegments = 2]
   * @param {number} [opts.simplify = 0]
   * @param {boolean} [opts.smoothSide = 'auto']
   * @param {boolean} [opts.smoothSideThreshold = 0.9]    // Will not smooth sharp side.
   * @param {boolean} [opts.smoothBevel = false]
   * @param {boolean} [opts.excludeBottom = false]
   * @param {Object} [opts.fitRect] translate and scale will be ignored if fitRect is set
   * @param {Array} [opts.translate]
   * @param {Array} [opts.scale]
   *
   * @return {Object} {indices, position, uv, normal, boundingRect}
   */
  function extrudePolygon (polygons, opts) {
    opts = Object.assign({}, opts)

    const min = [Infinity, Infinity]
    const max = [-Infinity, -Infinity]
    for (let i = 0; i < polygons.length; i++) {
      updateBoundingRect(polygons[i][0], min, max)
    }
    opts.boundingRect = opts.boundingRect || {
      x: min[0],
      y: min[1],
      width: max[0] - min[0],
      height: max[1] - min[1]
    }

    normalizeOpts(opts)

    const preparedData = []
    const translate = opts.translate || [0, 0]
    const scale = opts.scale || [1, 1]
    const boundingRect = opts.boundingRect
    const transformdRect = {
      x: boundingRect.x * scale[0] + translate[0],
      y: boundingRect.y * scale[1] + translate[1],
      width: boundingRect.width * scale[0],
      height: boundingRect.height * scale[1]
    }

    const epsilon = Math.min(boundingRect.width, boundingRect.height) / 1e5
    for (let i = 0; i < polygons.length; i++) {
      let newPolygon = removeClosePointsOfPolygon(polygons[i], epsilon)
      if (!newPolygon) {
        continue
      }
      const simplifyTolerance = opts.simplify / Math.max(scale[0], scale[1])
      if (simplifyTolerance > 0) {
        newPolygon = simplifyPolygon(newPolygon, simplifyTolerance)
      }
      if (!newPolygon) {
        continue
      }

      const { vertices, holes, dimensions } = earcut$1.flatten(newPolygon)

      for (let k = 0; k < vertices.length; ) {
        vertices[k] = vertices[k++] * scale[0] + translate[0]
        vertices[k] = vertices[k++] * scale[1] + translate[1]
      }

      convertToClockwise(vertices, holes)

      if (dimensions !== 2) {
        throw new Error('Only 2D polygon points are supported')
      }
      const topVertices =
        opts.bevelSize > 0
          ? offsetPolygon(vertices, holes, opts.bevelSize, null, true)
          : vertices
      const indices = triangulate(topVertices, holes, dimensions)
      const res = splitVertices(
        vertices,
        holes,
        opts.smoothSide,
        opts.smoothSideThreshold
      )

      preparedData.push({
        indices,
        vertices: res.vertices,
        rawVertices: vertices,
        topVertices,
        holes: res.holes,
        splittedMap: res.splittedMap,
        rect: transformdRect,
        depth: typeof opts.depth === 'function' ? opts.depth(i) : opts.depth
      })
    }
    return innerExtrudeTriangulatedPolygon(preparedData, opts)
  }
  /**
   *
   * @param {Array} polylines Polylines array that match GeoJSON MultiLineString geometry.
   * @param {Object} [opts]
   * @param {number} [opts.depth]
   * @param {number} [opts.bevelSize = 0]
   * @param {number} [opts.bevelSegments = 2]
   * @param {number} [opts.simplify = 0]
   * @param {boolean} [opts.smoothSide = 'auto']
   * @param {boolean} [opts.smoothSideThreshold = 0.9]    // Will not smooth sharp side.
   * @param {boolean} [opts.smoothBevel = false]
   * @param {boolean} [opts.excludeBottom = false]
   * @param {boolean} [opts.lineWidth = 1]
   * @param {boolean} [opts.miterLimit = 2]
   * @param {Object} [opts.fitRect] translate and scale will be ignored if fitRect is set
   * @param {Array} [opts.translate]
   * @param {Array} [opts.scale]
   * @param {Object} [opts.boundingRect]
   * @return {Object} {indices, position, uv, normal, boundingRect}
   */
  function extrudePolyline (polylines, opts) {
    opts = Object.assign({}, opts)

    const min = [Infinity, Infinity]
    const max = [-Infinity, -Infinity]
    for (let i = 0; i < polylines.length; i++) {
      updateBoundingRect(polylines[i], min, max)
    }
    opts.boundingRect = opts.boundingRect || {
      x: min[0],
      y: min[1],
      width: max[0] - min[0],
      height: max[1] - min[1]
    }

    normalizeOpts(opts)
    const scale = opts.scale || [1, 1]

    if (opts.lineWidth == null) {
      opts.lineWidth = 1
    }
    if (opts.miterLimit == null) {
      opts.miterLimit = 2
    }
    const preparedData = []
    // Extrude polyline to polygon
    for (let i = 0; i < polylines.length; i++) {
      let newPolyline = polylines[i]
      const simplifyTolerance = opts.simplify / Math.max(scale[0], scale[1])
      if (simplifyTolerance > 0) {
        newPolyline = simplify(newPolyline, simplifyTolerance, true)
      }
      preparedData.push(
        convertPolylineToTriangulatedPolygon(newPolyline, i, opts)
      )
    }

    return innerExtrudeTriangulatedPolygon(preparedData, opts)
  }

  function updateBoundingRect (points, min, max) {
    for (let i = 0; i < points.length; i++) {
      min[0] = Math.min(points[i][0], min[0])
      min[1] = Math.min(points[i][1], min[1])
      max[0] = Math.max(points[i][0], max[0])
      max[1] = Math.max(points[i][1], max[1])
    }
  }

  /**
   *
   * @param {Object} geojson
   * @param {Object} [opts]
   * @param {number} [opts.depth]
   * @param {number} [opts.bevelSize = 0]
   * @param {number} [opts.bevelSegments = 2]
   * @param {number} [opts.simplify = 0]
   * @param {boolean} [opts.smoothSide = 'auto']
   * @param {boolean} [opts.smoothSideThreshold = 0.9]    // Will not smooth sharp side.
   * @param {boolean} [opts.smoothBevel = false]
   * @param {boolean} [opts.excludeBottom = false]
   * @param {boolean} [opts.lineWidth = 1]
   * @param {boolean} [opts.miterLimit = 2]
   * @param {Object} [opts.fitRect] translate and scale will be ignored if fitRect is set
   * @param {Array} [opts.translate]
   * @param {Array} [opts.scale]
   * @param {Object} [opts.boundingRect]
   * @return {Object} {polyline: {indices, position, uv, normal}, polygon: {indices, position, uv, normal}}
   */

  // TODO Not merge feature
  function extrudeGeoJSON (geojson, opts) {
    opts = Object.assign({}, opts)

    const polylines = []
    const polygons = []

    const polylineFeatureIndices = []
    const polygonFeatureIndices = []

    const min = [Infinity, Infinity]
    const max = [-Infinity, -Infinity]

    for (let i = 0; i < geojson.features.length; i++) {
      const feature = geojson.features[i]
      const geometry = feature.geometry
      if (geometry && geometry.coordinates) {
        switch (geometry.type) {
          case 'LineString':
            polylines.push(geometry.coordinates)
            polylineFeatureIndices.push(i)
            updateBoundingRect(geometry.coordinates, min, max)
            break
          case 'MultiLineString':
            for (let k = 0; k < geometry.coordinates.length; k++) {
              polylines.push(geometry.coordinates[k])
              polylineFeatureIndices.push(i)
              updateBoundingRect(geometry.coordinates[k], min, max)
            }
            break
          case 'Polygon':
            polygons.push(geometry.coordinates)
            polygonFeatureIndices.push(i)
            updateBoundingRect(geometry.coordinates[0], min, max)
            break
          case 'MultiPolygon':
            for (let k = 0; k < geometry.coordinates.length; k++) {
              polygons.push(geometry.coordinates[k])
              polygonFeatureIndices.push(i)
              updateBoundingRect(geometry.coordinates[k][0], min, max)
            }
            break
        }
      }
    }

    opts.boundingRect = opts.boundingRect || {
      x: min[0],
      y: min[1],
      width: max[0] - min[0],
      height: max[1] - min[1]
    }

    const originalDepth = opts.depth
    return {
      polyline: extrudePolyline(
        polylines,
        Object.assign(opts, {
          depth: function (idx) {
            if (typeof originalDepth === 'function') {
              return originalDepth(
                geojson.features[polylineFeatureIndices[idx]]
              )
            }
            return originalDepth
          }
        })
      ),
      polygon: extrudePolygon(
        polygons,
        Object.assign(opts, {
          depth: function (idx) {
            if (typeof originalDepth === 'function') {
              return originalDepth(geojson.features[polygonFeatureIndices[idx]])
            }
            return originalDepth
          }
        })
      )
    }
  }

  var main = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    triangulate: triangulate,
    flatten: flatten,
    offsetPolygon: offsetPolygon,
    extrudePolygon: extrudePolygon,
    extrudePolyline: extrudePolyline,
    extrudeGeoJSON: extrudeGeoJSON
  })

  function distanceToVector3 (distance, layer, cache) {
    if (cache === void 0) {
      cache = {}
    }

    if (cache[distance] === undefined) {
      cache[distance] = layer.distanceToVector3(distance, distance).x
    }

    return cache[distance]
  }
  /**
   *Get the center point of the point set
   * @param {*} coordinates
   */

  function getCenterOfPoints (coordinates) {
    if (coordinates === void 0) {
      coordinates = []
    }

    var sumX = 0,
      sumY = 0
    var len = coordinates.length

    for (var i = 0; i < len; i++) {
      var _coordinates$i = coordinates[i],
        coordinate = _coordinates$i.coordinate,
        lnglat = _coordinates$i.lnglat,
        lnglats = _coordinates$i.lnglats,
        xy = _coordinates$i.xy,
        xys = _coordinates$i.xys
      var c = coordinate || lnglat || lnglats || xy || xys || coordinates[i]
      var x = void 0,
        y = void 0

      if (Array.isArray(c)) {
        x = c[0]
        y = c[1]
      } else if (c instanceof maptalks__namespace.Coordinate) {
        x = c.x
        y = c.y
      }

      sumX += x
      sumY += y
    }

    return new maptalks__namespace.Coordinate(sumX / len, sumY / len)
  }
  function setBottomHeight (geometry, bottomHeight, layer, cache) {
    if (
      bottomHeight === undefined ||
      typeof bottomHeight !== 'number' ||
      bottomHeight === 0
    ) {
      return 0
    }

    var position

    if (geometry instanceof THREE__namespace.BufferGeometry) {
      position = geometry.attributes.position.array
    } else if (Array.isArray(geometry) || geometry instanceof Float32Array) {
      position = geometry
    } else {
      position = geometry.position
    }

    var h = 0

    if (position) {
      if (cache) {
        if (cache[bottomHeight] === undefined) {
          cache[bottomHeight] = layer.distanceToVector3(
            bottomHeight,
            bottomHeight
          ).x
        }

        h = cache[bottomHeight]
      } else {
        h = layer.distanceToVector3(bottomHeight, bottomHeight).x
      }

      var len = position.length

      if (position[0] instanceof THREE__namespace.Vector3) {
        for (var i = 0; i < len; i++) {
          position[i].z += h
        }
      } else {
        for (var _i = 0; _i < len; _i += 3) {
          position[_i + 2] += h
        }
      }
    }

    return h
  }
  function getGeometriesColorArray (geometriesAttributes) {
    var len = geometriesAttributes.length
    var colorsLen = 0

    for (var i = 0; i < len; i++) {
      var count = geometriesAttributes[i].position.count
      colorsLen += count
    }

    return new Float32Array(colorsLen * 3)
  }
  function coordiantesToArrayBuffer (coordiantes) {
    if (coordiantes === void 0) {
      coordiantes = []
    }

    var len = coordiantes.length
    var array = new Float64Array(len * 2)

    for (var i = 0; i < len; i++) {
      var x = void 0,
        y = void 0
      var c = coordiantes[i]

      if (c.x) {
        x = c.x
        y = c.y
      } else {
        x = c[0]
        y = c[1]
      }

      array[i * 2] = x
      array[i * 2 + 1] = y
    }

    return array.buffer
  }

  var topColor = new THREE__namespace.Color('#fff'),
    bottomColor = new THREE__namespace.Color('#fff')
  /**
   * this is for ExtrudeMesh util
   */

  /**
   * Fix the bug in the center of multipoygon
   * @param {maptalks.Polygon} polygon
   * @param {*} layer
   */
  // export function toShape(datas = []) {
  //     const shapes = [];
  //     for (let i = 0, len = datas.length; i < len; i++) {
  //         const { outer, holes } = datas[i];
  //         const shape = [outer];
  //         if (holes && holes.length) {
  //             for (let j = 0, len1 = holes.length; j < len1; j++) {
  //                 shape.push(holes[j]);
  //             }
  //         }
  //         shapes.push(shape);
  //     }
  //     return shapes;
  // }

  /**
   *  Support custom center point
   * @param {maptalks.Polygon|maptalks.MultiPolygon} polygon
   * @param {*} height
   * @param {*} layer
   */

  function getExtrudeGeometry (polygon, height, layer, center) {
    var _getExtrudeGeometryPa = getExtrudeGeometryParams(
        polygon,
        height,
        layer,
        center
      ),
      position = _getExtrudeGeometryPa.position,
      normal = _getExtrudeGeometryPa.normal,
      uv = _getExtrudeGeometryPa.uv,
      indices = _getExtrudeGeometryPa.indices

    var color = new Float32Array(position.length)
    color.fill(1, 0, position.length)
    var bufferGeomertry = new THREE__namespace.BufferGeometry()
    addAttribute(
      bufferGeomertry,
      'color',
      new THREE__namespace.BufferAttribute(color, 3)
    )
    addAttribute(
      bufferGeomertry,
      'normal',
      new THREE__namespace.BufferAttribute(normal, 3)
    )
    addAttribute(
      bufferGeomertry,
      'position',
      new THREE__namespace.BufferAttribute(position, 3)
    )
    addAttribute(
      bufferGeomertry,
      'uv',
      new THREE__namespace.BufferAttribute(uv, 2)
    )
    bufferGeomertry.setIndex(
      new THREE__namespace.Uint32BufferAttribute(indices, 1)
    )
    return bufferGeomertry
  }
  function getExtrudeGeometryParams (
    polygon,
    height,
    layer,
    center,
    centerPt,
    altCache
  ) {
    var datas = getPolygonPositions(polygon, layer, center, centerPt, false)
    var shapes = datas //Possible later use of geojson

    if (!shapes) return null //Reduce height and repeat calculation

    if (altCache) {
      if (altCache[height] == null) {
        altCache[height] = layer.distanceToVector3(height, height).x
      }

      height = altCache[height]
    } else {
      height = layer.distanceToVector3(height, height).x
    }

    var _extrudePolygon = extrudePolygon(shapes, {
        depth: height
      }),
      position = _extrudePolygon.position,
      normal = _extrudePolygon.normal,
      uv = _extrudePolygon.uv,
      indices = _extrudePolygon.indices

    return {
      position: position,
      normal: normal,
      uv: uv,
      indices: indices
    }
  }
  /**
   *
   * @param {*} geometry
   * @param {*} color
   * @param {*} _topColor
   */

  function initVertexColors (geometry, color, _topColor, minZ) {
    if (minZ === undefined) {
      minZ = 0
    }

    var position = geometry.attributes.position.array
    var len = position.length
    bottomColor.setStyle(color)
    topColor.setStyle(_topColor)
    var colors

    if (Array.isArray(minZ)) {
      var colorLen = 0

      for (var i = 0, _len = minZ.length; i < _len; i++) {
        var count = minZ[i].position.count
        colorLen += count * 3
      }

      colors = new Float32Array(colorLen)
    } else {
      colors = new Float32Array(position.length)
    }

    if (Array.isArray(minZ)) {
      for (var _i = 0, _len2 = minZ.length; _i < _len2; _i++) {
        var _minZ$_i$position = minZ[_i].position,
          middleZ = _minZ$_i$position.middleZ,
          start = _minZ$_i$position.start,
          end = _minZ$_i$position.end

        for (var j = start; j < end; j += 3) {
          var z = position[j + 2]

          if (z > middleZ) {
            colors[j] = topColor.r
            colors[j + 1] = topColor.g
            colors[j + 2] = topColor.b
          } else {
            colors[j] = bottomColor.r
            colors[j + 1] = bottomColor.g
            colors[j + 2] = bottomColor.b
          }
        }
      }
    } else {
      for (var _i2 = 0; _i2 < len; _i2 += 3) {
        var _z = position[_i2 + 2]

        if (_z > minZ) {
          colors[_i2] = topColor.r
          colors[_i2 + 1] = topColor.g
          colors[_i2 + 2] = topColor.b
        } else {
          colors[_i2] = bottomColor.r
          colors[_i2 + 1] = bottomColor.g
          colors[_i2 + 2] = bottomColor.b
        }
      }
    }

    addAttribute(
      geometry,
      'color',
      new THREE__namespace.BufferAttribute(colors, 3, true)
    )
    return colors
  }
  /**
   *
   * @param {*} polygon
   * @param {*} layer
   * @param {*} center
   */

  function getPolygonPositions (polygon, layer, center, centerPt, isArrayBuff) {
    if (isArrayBuff === void 0) {
      isArrayBuff = false
    }

    if (!polygon) {
      return null
    }

    var datas = []

    if (polygon instanceof maptalks__namespace.MultiPolygon) {
      datas = polygon.getGeometries().map(function (p) {
        return getSinglePolygonPositions(
          p,
          layer,
          center || polygon.getCenter(),
          centerPt,
          isArrayBuff
        )
      })
    } else if (polygon instanceof maptalks__namespace.Polygon) {
      var data = getSinglePolygonPositions(
        polygon,
        layer,
        center || polygon.getCenter(),
        centerPt,
        isArrayBuff
      )
      datas.push(data)
    } else if (isGeoJSONPolygon(polygon)) {
      // const cent = getGeoJSONCenter(polygon);
      if (!isGeoJSONMulti(polygon)) {
        var _data = getSinglePolygonPositions(
          polygon,
          layer,
          center || getGeoJSONCenter(polygon),
          centerPt,
          isArrayBuff
        )

        datas.push(_data)
      } else {
        var fs = spliteGeoJSONMulti(polygon)

        for (var i = 0, len = fs.length; i < len; i++) {
          datas.push(
            getSinglePolygonPositions(
              fs[i],
              layer,
              center || getGeoJSONCenter(polygon),
              centerPt,
              isArrayBuff
            )
          )
        }
      }
    }

    return datas
  }
  function getSinglePolygonPositions (
    polygon,
    layer,
    center,
    centerPt,
    isArrayBuff
  ) {
    if (isArrayBuff === void 0) {
      isArrayBuff = false
    }

    var shell, holes //it is pre for geojson,Possible later use of geojson

    if (isGeoJSONPolygon(polygon)) {
      var coordinates = getGeoJSONCoordinates(polygon)
      shell = coordinates[0]
      holes = coordinates.slice(1, coordinates.length)
      center = center || getGeoJSONCenter(polygon)
    } else if (polygon instanceof maptalks__namespace.Polygon) {
      shell = polygon.getShell()
      holes = polygon.getHoles()
      center = center || polygon.getCenter()
    }

    centerPt = centerPt || layer.coordinateToVector3(center)
    var outer

    if (isArrayBuff) {
      outer = layer.coordinatiesToGLFloatArray(shell, centerPt).positons2d
    } else {
      outer = layer.coordinatiesToGLArray(shell, centerPt)
    }

    var data = [isArrayBuff ? outer.buffer : outer]

    if (holes && holes.length > 0) {
      for (var i = 0, len = holes.length; i < len; i++) {
        var pts = void 0

        if (isArrayBuff) {
          pts = layer.coordinatiesToGLFloatArray(holes[i], centerPt).positons2d
        } else {
          pts = layer.coordinatiesToGLArray(holes[i], centerPt)
        }

        data.push(isArrayBuff ? pts.buffer : pts)
      }
    }

    return data
  }
  function getPolygonArrayBuffer (polygon) {
    if (!polygon) {
      return null
    }

    var datas = []

    if (polygon instanceof maptalks__namespace.MultiPolygon) {
      datas = polygon.getGeometries().map(function (p) {
        return getSinglePolygonArrayBuffer(p, false)
      })
    } else if (polygon instanceof maptalks__namespace.Polygon) {
      var data = getSinglePolygonArrayBuffer(polygon, false)
      datas.push(data)
    } else if (isGeoJSONPolygon(polygon)) {
      // const cent = getGeoJSONCenter(polygon);
      if (!isGeoJSONMulti(polygon)) {
        var _data2 = getSinglePolygonArrayBuffer(polygon, true)

        datas.push(_data2)
      } else {
        var fs = spliteGeoJSONMulti(polygon)

        for (var i = 0, len = fs.length; i < len; i++) {
          datas.push(getSinglePolygonArrayBuffer(fs[i], true))
        }
      }
    }

    return datas
  }
  function getSinglePolygonArrayBuffer (polygon, isGeoJSON) {
    var shell, holes //it is pre for geojson,Possible later use of geojson

    if (isGeoJSON) {
      var coordinates = getGeoJSONCoordinates(polygon)
      shell = coordinates[0]
      holes = coordinates.slice(1, coordinates.length)
    } else if (polygon instanceof maptalks__namespace.Polygon) {
      shell = polygon.getShell()
      holes = polygon.getHoles()
    }

    var outer = coordiantesToArrayBuffer(shell)
    var data = [outer]

    if (holes && holes.length > 0) {
      for (var i = 0, len = holes.length; i < len; i++) {
        var pts = coordiantesToArrayBuffer(holes[i])
        data.push(pts)
      }
    }

    return data
  }

  var ExtrudeUtil = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    getExtrudeGeometry: getExtrudeGeometry,
    getExtrudeGeometryParams: getExtrudeGeometryParams,
    initVertexColors: initVertexColors,
    getPolygonPositions: getPolygonPositions,
    getSinglePolygonPositions: getSinglePolygonPositions,
    getPolygonArrayBuffer: getPolygonArrayBuffer,
    getSinglePolygonArrayBuffer: getSinglePolygonArrayBuffer
  })

  var COMMA = ','
  /**
   *
   * @param {maptalks.LineString} lineString
   * @param {ThreeLayer} layer
   */

  function getLinePosition (lineString, layer, center, hasVectorArray) {
    if (hasVectorArray === void 0) {
      hasVectorArray = true
    }

    var positionsV = []
    var positions, positions2d

    if (
      Array.isArray(lineString) &&
      lineString[0] instanceof THREE__namespace.Vector3
    ) {
      for (var i = 0, len = lineString.length; i < len; i++) {
        var v = lineString[i]
        positionsV.push(v)
      }
    } else {
      if (Array.isArray(lineString)) {
        lineString = new maptalks__namespace.LineString(lineString)
      }

      var z = 0 //support geojson

      var coordinates, cent

      if (isGeoJSON(lineString)) {
        coordinates = getGeoJSONCoordinates(lineString)

        if (!center) {
          cent = getGeoJSONCenter(lineString)
        }
      } else if (lineString instanceof maptalks__namespace.LineString) {
        coordinates = lineString.getCoordinates()

        if (!center) {
          cent = lineString.getCenter()
        }
      }

      var centerPt = layer.coordinateToVector3(center || cent)

      if (hasVectorArray) {
        for (var _i = 0, _len = coordinates.length; _i < _len; _i++) {
          var coordinate = coordinates[_i]

          var _v = layer.coordinateToVector3(coordinate, z).sub(centerPt) // positions.push(v.x, v.y, v.z);

          positionsV.push(_v)
        }
      } else {
        var result = layer.coordinatiesToGLFloatArray(coordinates, centerPt)
        positions = result.positions
        positions2d = result.positons2d
      }
    }

    if (!hasVectorArray) {
      return {
        positions: positions,
        positionsV: positionsV,
        positions2d: positions2d,
        arrayBuffer: positions2d.buffer
      }
    }

    positions2d = new Float32Array(positionsV.length * 2)
    positions = new Float32Array(positionsV.length * 3)

    for (var _i2 = 0, _len2 = positionsV.length; _i2 < _len2; _i2++) {
      var idx = _i2 * 3
      var _v2 = positionsV[_i2]
      positions[idx] = _v2.x
      positions[idx + 1] = _v2.y
      positions[idx + 2] = _v2.z
      var idx1 = _i2 * 2
      positions2d[idx1] = _v2.x
      positions2d[idx1 + 1] = _v2.y
    }

    return {
      positions: positions,
      positionsV: positionsV,
      positions2d: positions2d,
      arrayBuffer: positions2d.buffer
    }
  }
  /**
   *
   * @param {maptalks.LineString} lineString
   * @param {Number} lineWidth
   * @param {Number} depth
   * @param {ThreeLayer} layer
   */

  function getExtrudeLineGeometry (
    lineString,
    lineWidth,
    depth,
    layer,
    center
  ) {
    if (lineWidth === void 0) {
      lineWidth = 1
    }

    if (depth === void 0) {
      depth = 1
    }

    var _getExtrudeLineParams = getExtrudeLineParams(
        lineString,
        lineWidth,
        depth,
        layer,
        center
      ),
      indices = _getExtrudeLineParams.indices,
      position = _getExtrudeLineParams.position,
      normal = _getExtrudeLineParams.normal,
      uv = _getExtrudeLineParams.uv

    var geometry = new THREE__namespace.BufferGeometry()
    addAttribute(
      geometry,
      'position',
      new THREE__namespace.BufferAttribute(position, 3)
    )
    addAttribute(
      geometry,
      'normal',
      new THREE__namespace.BufferAttribute(normal, 3)
    )
    addAttribute(geometry, 'uv', new THREE__namespace.BufferAttribute(uv, 2))
    geometry.setIndex(new THREE__namespace.BufferAttribute(indices, 1))
    return geometry
  }
  /**
   *
   * @param {Array[Array]} chunkLines
   * @param {*} layer
   */

  function getChunkLinesPosition (chunkLines, layer, positionMap, centerPt) {
    var positions = [],
      positionsV = [],
      lnglats = []

    for (var i = 0, len = chunkLines.length; i < len; i++) {
      var line = chunkLines[i]

      for (var j = 0, len1 = line.length; j < len1; j++) {
        var lnglat = line[j]

        if (lnglats.length > 0) {
          var key = lnglat.join(COMMA).toString()
          var key1 = lnglats[lnglats.length - 1].join(COMMA).toString()

          if (key !== key1) {
            lnglats.push(lnglat)
          }
        } else {
          lnglats.push(lnglat)
        }
      }
    }

    var z = 0

    for (var _i3 = 0, _len3 = lnglats.length; _i3 < _len3; _i3++) {
      var _lnglat = lnglats[_i3]
      var v = void 0

      var _key = _lnglat.join(COMMA).toString()

      if (positionMap && positionMap[_key]) {
        v = positionMap[_key]
      } else {
        v = layer.coordinateToVector3(_lnglat, z).sub(centerPt)
      }

      positionsV.push(v)
      positions.push(v.x, v.y, v.z)
    }

    return {
      positions: positions,
      positionsV: positionsV,
      lnglats: lnglats
    }
  }
  /**
   *
   * @param {*} lineString
   * @param {*} lineWidth
   * @param {*} depth
   * @param {*} layer
   */

  function getExtrudeLineParams (lineString, lineWidth, depth, layer, center) {
    if (lineWidth === void 0) {
      lineWidth = 1
    }

    if (depth === void 0) {
      depth = 1
    }

    var positions = getLinePosition(lineString, layer, center).positionsV
    var ps = []

    for (var i = 0, len = positions.length; i < len; i++) {
      var p = positions[i]
      ps.push([p.x, p.y])
    }

    var _extrudePolyline = extrudePolyline([ps], {
        lineWidth: lineWidth,
        depth: depth
      }),
      indices = _extrudePolyline.indices,
      position = _extrudePolyline.position,
      normal = _extrudePolyline.normal,
      uv = _extrudePolyline.uv

    return {
      position: position,
      normal: normal,
      indices: indices,
      uv: uv
    }
  }
  function LineStringSplit (lineString) {
    var lineStrings = [],
      center

    if (lineString instanceof maptalks__namespace.MultiLineString) {
      lineStrings = lineString.getGeometries()
      center = lineString.getCenter()
    } else if (lineString instanceof maptalks__namespace.LineString) {
      lineStrings.push(lineString)
      center = lineString.getCenter()
    } else if (isGeoJSON(lineString)) {
      center = getGeoJSONCenter(lineString)

      if (isGeoJSONMulti(lineString)) {
        lineStrings = spliteGeoJSONMulti(lineString)
      } else {
        lineStrings.push(lineString)
      }
    }

    return {
      lineStrings: lineStrings,
      center: center
    }
  }
  function setLineSegmentPosition (position, positionsV) {
    for (var i = 0, len = positionsV.length; i < len; i++) {
      var v = positionsV[i]

      if (i > 0 && i < len - 1) {
        position.push(v.x, v.y, v.z)
      }

      position.push(v.x, v.y, v.z)
    }
  }
  function getLineSegmentPosition (ps) {
    var position = new Float32Array(ps.length * 2 - 6)
    var j = 0

    for (var i = 0, len = ps.length / 3; i < len; i++) {
      var x = ps[i * 3],
        y = ps[i * 3 + 1],
        z = ps[i * 3 + 2]

      if (i > 0 && i < len - 1) {
        var _idx = j * 3

        position[_idx] = x
        position[_idx + 1] = y
        position[_idx + 2] = z
        j++
      }

      var idx = j * 3
      position[idx] = x
      position[idx + 1] = y
      position[idx + 2] = z
      j++
    }

    return position
  }
  function mergeLinePositions (positionsList) {
    var len = 0
    var l = positionsList.length

    if (l === 1) {
      return positionsList[0]
    }

    for (var i = 0; i < l; i++) {
      len += positionsList[i].length
    }

    var position = new Float32Array(len)
    var offset = 0

    for (var _i4 = 0; _i4 < l; _i4++) {
      position.set(positionsList[_i4], offset)
      offset += positionsList[_i4].length
    }

    return position
  }
  function getLineArrayBuffer (lineString) {
    if (lineString instanceof maptalks__namespace.LineString) {
      return coordiantesToArrayBuffer(lineString.getCoordinates())
    } else if (isGeoJSONLine(lineString)) {
      return coordiantesToArrayBuffer(lineString.geometry.coordinates)
    }
  }
  var defaultGeometry
  function getDefaultLineGeometry () {
    if (!defaultGeometry) {
      defaultGeometry = new THREE__namespace.BufferGeometry()
      addAttribute(
        defaultGeometry,
        'position',
        new THREE__namespace.BufferAttribute(new Float32Array(3), 3)
      )
    }

    return defaultGeometry
  }

  var LineUtil = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    getLinePosition: getLinePosition,
    getExtrudeLineGeometry: getExtrudeLineGeometry,
    getChunkLinesPosition: getChunkLinesPosition,
    getExtrudeLineParams: getExtrudeLineParams,
    LineStringSplit: LineStringSplit,
    setLineSegmentPosition: setLineSegmentPosition,
    getLineSegmentPosition: getLineSegmentPosition,
    mergeLinePositions: mergeLinePositions,
    getLineArrayBuffer: getLineArrayBuffer,
    getDefaultLineGeometry: getDefaultLineGeometry
  })

  // eslint-disable-next-line quotes
  var workerName$1 = '__maptalks.three__'
  function getWorkerName$1 () {
    return workerName$1
  }

  var MeshActor

  if (maptalks__namespace.worker) {
    MeshActor = /*#__PURE__*/ (function (_maptalks$worker$Acto) {
      _inheritsLoose(MeshActor, _maptalks$worker$Acto)

      function MeshActor () {
        return _maptalks$worker$Acto.apply(this, arguments) || this
      }

      var _proto = MeshActor.prototype

      _proto.test = function test (info, cb) {
        //send data to worker thread
        this.send(info, null, cb)
      }

      _proto.pushQueue = function pushQueue (q) {
        if (q === void 0) {
          q = {}
        }

        var _q = q,
          type = _q.type,
          data = _q.data,
          callback = _q.callback,
          layer = _q.layer,
          key = _q.key,
          center = _q.center,
          lineStrings = _q.lineStrings,
          options = _q.options,
          id = _q.id
        var params

        if (type.indexOf('ExtrudePolygon') > -1) {
          params = gengerateExtrudePolygons(data, center, layer, options)
        } else if (type === 'ExtrudeLines') {
          params = gengerateExtrudeLines(data, center, layer, lineStrings)
        } else if (type === 'Point');
        else if (type === 'Line' || type === 'FatLine') {
          params = gengerateLines(data, center, layer, lineStrings, options)
        } else if (type === 'Lines' || type === 'FatLines') {
          params = gengerateLines(data, center, layer, lineStrings)
        } else if (type === 'ExtrudeLine') {
          params = gengerateExtrudeLines(
            data,
            center,
            layer,
            lineStrings,
            options
          )
        }

        if (!params) {
          console.error("not support '" + type + "' worker")
          return
        }

        this.send(
          {
            type: type,
            datas: params.datas,
            glRes: params.glRes,
            matrix: params.matrix,
            center: params.center
          },
          params.transfer,
          function (err, message) {
            if (err) {
              console.error(err)
            }

            message.key = key
            message.id = id
            callback(message)
          }
        )
      }

      return MeshActor
    })(maptalks__namespace.worker.Actor)
  }

  var actor
  function getActor () {
    if (!maptalks__namespace.worker) {
      console.error(
        "maptalks.worker is not defined,You can't use ThreeVectorTileLayer"
      )
    }

    if (!actor && MeshActor) {
      actor = new MeshActor(getWorkerName$1())
    }

    return actor
  }
  /**
   *
   * @param distance
   * @param layer
   * @param altCache
   * @returns
   */

  function getDistance (distance, layer, altCache) {
    if (altCache === void 0) {
      altCache = {}
    }

    if (
      distance !== undefined &&
      typeof distance === 'number' &&
      distance !== 0
    ) {
      if (altCache[distance] === undefined) {
        altCache[distance] = layer.distanceToVector3(distance, distance).x
      }

      return altCache[distance]
    }

    return 0
  }
  /**
   * generate extrudepolygons data for worker
   * @param {*} polygons
   * @param {*} layer
   */

  function gengerateExtrudePolygons (polygons, center, layer, options) {
    if (polygons === void 0) {
      polygons = []
    }

    if (options === void 0) {
      options = []
    }

    var isMercator = layer.isMercator()
    var glRes, matrix

    if (isMercator) {
      var map = layer.getMap()
      glRes = map.getGLRes()
      matrix = map.getSpatialReference().getTransformation().matrix
    }

    var centerPt

    if (center) {
      centerPt = layer.coordinateToVector3(center)
    }

    var len = polygons.length
    var datas = [],
      transfer = [],
      altCache = {}

    for (var i = 0; i < len; i++) {
      var polygon = polygons[i]
      var p = polygon
      var properties = options[i]
        ? options[i]
        : isGeoJSONPolygon(p)
        ? p['properties']
        : p.getProperties() || {}

      if (!center) {
        centerPt = layer.coordinateToVector3(properties.center)
      }

      var data = void 0

      if (isMercator) {
        data = getPolygonArrayBuffer(polygon)
      } else {
        data = getPolygonPositions(
          polygon,
          layer,
          properties.center || center,
          centerPt,
          true
        )
      }

      for (var j = 0, len1 = data.length; j < len1; j++) {
        var _d = data[j]

        for (var m = 0, len2 = _d.length; m < len2; m++) {
          //ring
          transfer.push(_d[m])
        }
      }

      var height = properties.height || 1
      var bottomHeight = properties.bottomHeight || 0
      height = getDistance(height, layer, altCache)
      bottomHeight = getDistance(bottomHeight, layer, altCache)
      var d = {
        id: properties.id,
        data: data,
        height: height,
        bottomHeight: bottomHeight
      }

      if (isMercator) {
        d.center = [centerPt.x, centerPt.y]
      }

      datas.push(d) //delete Internal properties

      if (p._properties) {
        delete p._properties
      }
    }

    return {
      datas: datas,
      transfer: transfer,
      glRes: glRes,
      matrix: matrix,
      center: isMercator ? [centerPt.x, centerPt.y] : null
    }
  }
  /**
   * generate ExtrudeLines data for worker
   * @param {*} lineStringList
   * @param {*} center
   * @param {*} layer
   */

  function gengerateExtrudeLines (
    lineStringList,
    center,
    layer,
    lineStrings,
    options
  ) {
    if (options === void 0) {
      options = []
    }

    var isMercator = layer.isMercator()
    var glRes, matrix

    if (isMercator) {
      var map = layer.getMap()
      glRes = map.getGLRes()
      matrix = map.getSpatialReference().getTransformation().matrix
    }

    var centerPt

    if (center) {
      centerPt = layer.coordinateToVector3(center)
    }

    var datas = [],
      transfer = [],
      altCache = {}
    var len = lineStringList.length

    for (var i = 0; i < len; i++) {
      var multiLineString = lineStringList[i]
      var properties = options[i]
        ? options[i]
        : isGeoJSONLine(lineStrings[i])
        ? lineStrings[i]['properties']
        : lineStrings[i].getProperties() || {}

      if (!center) {
        centerPt = layer.coordinateToVector3(properties.center)
      }

      var width = properties.width || 1
      var height = properties.height || 1
      var bottomHeight = properties.bottomHeight || 0
      width = getDistance(width, layer, altCache)
      height = getDistance(height, layer, altCache)
      bottomHeight = getDistance(bottomHeight, layer, altCache)
      var data = []

      for (var j = 0, len1 = multiLineString.length; j < len1; j++) {
        var lineString = multiLineString[j]
        var arrayBuffer = void 0

        if (isMercator) {
          arrayBuffer = getLineArrayBuffer(lineString)
        } else {
          arrayBuffer = getLinePosition(lineString, layer, center, false)
            .arrayBuffer
        }

        transfer.push(arrayBuffer)
        data.push(arrayBuffer)
      }

      var d = {
        id: properties.id,
        data: data,
        height: height,
        width: width,
        bottomHeight: bottomHeight
      }

      if (isMercator) {
        d.center = [centerPt.x, centerPt.y]
      }

      datas.push(d)
    }

    return {
      datas: datas,
      transfer: transfer,
      glRes: glRes,
      matrix: matrix,
      center: isMercator ? [centerPt.x, centerPt.y] : null
    }
  }
  /**
   * generate Lines data for worker
   * @param lineStringList
   * @param center
   * @param layer
   * @param lineStrings
   * @param options
   * @returns
   */

  function gengerateLines (
    lineStringList,
    center,
    layer,
    lineStrings,
    options
  ) {
    if (options === void 0) {
      options = []
    }

    var isMercator = layer.isMercator()
    var glRes, matrix

    if (isMercator) {
      var map = layer.getMap()
      glRes = map.getGLRes()
      matrix = map.getSpatialReference().getTransformation().matrix
    }

    var centerPt

    if (center) {
      centerPt = layer.coordinateToVector3(center)
    }

    var datas = [],
      transfer = [],
      altCache = {}
    var len = lineStringList.length

    for (var i = 0; i < len; i++) {
      var multiLineString = lineStringList[i]
      var properties = options[i]
        ? options[i]
        : isGeoJSONLine(lineStrings[i])
        ? lineStrings[i]['properties']
        : lineStrings[i].getProperties() || {}

      if (!center) {
        centerPt = layer.coordinateToVector3(properties.center)
      }

      var bottomHeight = properties.bottomHeight || 0
      bottomHeight = getDistance(bottomHeight, layer, altCache)
      var data = []

      for (var j = 0, len1 = multiLineString.length; j < len1; j++) {
        var lineString = multiLineString[j]

        if (isMercator) {
          var arrayBuffer = getLineArrayBuffer(lineString)
          data.push(arrayBuffer)
          data.push(arrayBuffer)
        } else {
          var _arrayBuffer = getLinePosition(lineString, layer, center, false)
            .arrayBuffer
          transfer.push(_arrayBuffer)
          data.push(_arrayBuffer)
        }
      }

      var d = {
        id: properties.id,
        data: data,
        bottomHeight: bottomHeight
      }

      if (isMercator) {
        d.center = [centerPt.x, centerPt.y]
      }

      datas.push(d)
    }

    return {
      datas: datas,
      transfer: transfer,
      glRes: glRes,
      matrix: matrix,
      center: isMercator ? [centerPt.x, centerPt.y] : null
    }
  }

  function getDatas (queues) {
    return queues.map(function (q) {
      return q.data
    })
  }

  function getOptions (queues) {
    return queues.map(function (q) {
      return q.baseObject.getOptions()
    })
  }

  var BaseObjectTask = /*#__PURE__*/ (function () {
    function BaseObjectTask () {
      this.queueMap = {}
      this.tempQueue = []
      this.time = this.getCurrentTime()
      this.deQueueCount = 5
      this.resultQueue = []
    }

    var _proto = BaseObjectTask.prototype

    _proto.getCurrentTime = function getCurrentTime () {
      return maptalks__namespace.Util.now()
    }

    _proto.loop = function loop () {
      this.deQueue()
    }

    _proto.push = function push (data) {
      this.tempQueue.push(data)

      if (data.id) {
        this.queueMap[data.id] = data
      }

      return this
    }

    _proto.reset = function reset () {
      this.time = this.getCurrentTime()
      this.tempQueue = []
      return this
    }

    _proto.pushResult = function pushResult (result) {
      var _this = this

      if (!result) {
        return
      }

      if (!Array.isArray(result)) {
        result = [result]
      }

      result.forEach(function (d) {
        _this.resultQueue.push(d)
      })
      return this
    }

    _proto.deQueue = function deQueue () {
      var _this2 = this

      if (!this.resultQueue.length) {
        return this
      }

      var count = this.deQueueCount
      var resultList = this.resultQueue.slice(0, count) || []
      resultList.forEach(function (result) {
        var id = result.id

        if (_this2.queueMap[id]) {
          var baseObject = _this2.queueMap[id].baseObject

          if (baseObject && baseObject._workerLoad) {
            baseObject._workerLoad(result)
          }

          delete _this2.queueMap[id]
        }
      })
      this.resultQueue.splice(0, count)
      return this
    }

    return BaseObjectTask
  })()

  var ExtrudePolygonTask = /*#__PURE__*/ (function (_BaseObjectTask) {
    _inheritsLoose(ExtrudePolygonTask, _BaseObjectTask)

    function ExtrudePolygonTask () {
      var _this3

      _this3 = _BaseObjectTask.call(this) || this
      _this3.deQueueCount = 100
      return _this3
    }

    var _proto2 = ExtrudePolygonTask.prototype

    _proto2.loop = function loop () {
      var _this4 = this

      var t = this.getCurrentTime()

      if (
        (t - this.time >= 32 || this.tempQueue.length >= 1000) &&
        this.tempQueue.length
      ) {
        var actor = getActor()
        actor.pushQueue({
          type: 'ExtrudePolygon',
          layer: this.tempQueue[0].layer,
          data: getDatas(this.tempQueue),
          options: getOptions(this.tempQueue),
          callback: function callback (result) {
            _this4.pushResult(result)
          }
        })
        this.reset()
      }

      _BaseObjectTask.prototype.loop.call(this)
    }

    return ExtrudePolygonTask
  })(BaseObjectTask)

  var ExtrudePolygonsTask = /*#__PURE__*/ (function (_BaseObjectTask2) {
    _inheritsLoose(ExtrudePolygonsTask, _BaseObjectTask2)

    function ExtrudePolygonsTask () {
      return _BaseObjectTask2.apply(this, arguments) || this
    }

    var _proto3 = ExtrudePolygonsTask.prototype

    _proto3.loop = function loop () {
      var _this5 = this

      if (this.tempQueue.length) {
        var actor = getActor()
        this.tempQueue.forEach(function (queue) {
          actor.pushQueue({
            id: queue.id,
            type: 'ExtrudePolygons',
            layer: queue.layer,
            data: queue.data,
            key: queue.key,
            center: queue.center,
            callback: function callback (result) {
              _this5.pushResult(result)
            }
          })
        })
        this.reset()
      }

      _BaseObjectTask2.prototype.loop.call(this)
    }

    return ExtrudePolygonsTask
  })(BaseObjectTask)

  var ExtrudeLineTask = /*#__PURE__*/ (function (_BaseObjectTask3) {
    _inheritsLoose(ExtrudeLineTask, _BaseObjectTask3)

    function ExtrudeLineTask () {
      var _this6

      _this6 = _BaseObjectTask3.call(this) || this
      _this6.deQueueCount = 100
      return _this6
    }

    var _proto4 = ExtrudeLineTask.prototype

    _proto4.loop = function loop () {
      var _this7 = this

      var t = this.getCurrentTime()

      if (
        (t - this.time >= 32 || this.tempQueue.length >= 1000) &&
        this.tempQueue.length
      ) {
        var actor = getActor()
        actor.pushQueue({
          type: 'ExtrudeLine',
          layer: this.tempQueue[0].layer,
          data: getDatas(this.tempQueue),
          options: getOptions(this.tempQueue),
          lineStrings: this.tempQueue.map(function (q) {
            return q.lineString
          }),
          callback: function callback (result) {
            _this7.pushResult(result)
          }
        })
        this.reset()
      }

      _BaseObjectTask3.prototype.loop.call(this)
    }

    return ExtrudeLineTask
  })(BaseObjectTask)

  var ExtrudeLinesTask = /*#__PURE__*/ (function (_BaseObjectTask4) {
    _inheritsLoose(ExtrudeLinesTask, _BaseObjectTask4)

    function ExtrudeLinesTask () {
      return _BaseObjectTask4.apply(this, arguments) || this
    }

    var _proto5 = ExtrudeLinesTask.prototype

    _proto5.loop = function loop () {
      var _this8 = this

      if (this.tempQueue.length) {
        var actor = getActor()
        this.tempQueue.forEach(function (queue) {
          actor.pushQueue({
            id: queue.id,
            type: 'ExtrudeLines',
            layer: queue.layer,
            data: queue.data,
            key: queue.key,
            lineStrings: queue.lineStrings,
            center: queue.center,
            callback: function callback (result) {
              _this8.pushResult(result)
            }
          })
        })
        this.reset()
      }

      _BaseObjectTask4.prototype.loop.call(this)
    }

    return ExtrudeLinesTask
  })(BaseObjectTask)

  var LineTask = /*#__PURE__*/ (function (_BaseObjectTask5) {
    _inheritsLoose(LineTask, _BaseObjectTask5)

    function LineTask () {
      var _this9

      _this9 = _BaseObjectTask5.call(this) || this
      _this9.deQueueCount = 200
      return _this9
    }

    var _proto6 = LineTask.prototype

    _proto6.loop = function loop () {
      var _this10 = this

      var t = this.getCurrentTime()

      if (
        (t - this.time >= 32 || this.tempQueue.length >= 1000) &&
        this.tempQueue.length
      ) {
        var actor = getActor()
        actor.pushQueue({
          type: 'Line',
          layer: this.tempQueue[0].layer,
          data: getDatas(this.tempQueue),
          options: getOptions(this.tempQueue),
          lineStrings: this.tempQueue.map(function (q) {
            return q.lineString
          }),
          callback: function callback (result) {
            _this10.pushResult(result)
          }
        })
        this.reset()
      }

      _BaseObjectTask5.prototype.loop.call(this)
    }

    return LineTask
  })(BaseObjectTask)

  var LinesTask = /*#__PURE__*/ (function (_BaseObjectTask6) {
    _inheritsLoose(LinesTask, _BaseObjectTask6)

    function LinesTask () {
      return _BaseObjectTask6.apply(this, arguments) || this
    }

    var _proto7 = LinesTask.prototype

    _proto7.loop = function loop () {
      var _this11 = this

      if (this.tempQueue.length) {
        var actor = getActor()
        this.tempQueue.forEach(function (queue) {
          actor.pushQueue({
            id: queue.id,
            type: 'Lines',
            layer: queue.layer,
            data: queue.data,
            key: queue.key,
            lineStrings: queue.lineStrings,
            center: queue.center,
            callback: function callback (result) {
              _this11.pushResult(result)
            }
          })
        })
        this.reset()
      }

      _BaseObjectTask6.prototype.loop.call(this)
    }

    return LinesTask
  })(BaseObjectTask)

  var FatLineTask = /*#__PURE__*/ (function (_BaseObjectTask7) {
    _inheritsLoose(FatLineTask, _BaseObjectTask7)

    function FatLineTask () {
      var _this12

      _this12 = _BaseObjectTask7.call(this) || this
      _this12.deQueueCount = 100
      return _this12
    }

    var _proto8 = FatLineTask.prototype

    _proto8.loop = function loop () {
      var _this13 = this

      var t = this.getCurrentTime()

      if (
        (t - this.time >= 32 || this.tempQueue.length >= 1000) &&
        this.tempQueue.length
      ) {
        var actor = getActor()
        actor.pushQueue({
          type: 'FatLine',
          layer: this.tempQueue[0].layer,
          data: getDatas(this.tempQueue),
          options: getOptions(this.tempQueue),
          lineStrings: this.tempQueue.map(function (q) {
            return q.lineString
          }),
          callback: function callback (result) {
            _this13.pushResult(result)
          }
        })
        this.reset()
      }

      _BaseObjectTask7.prototype.loop.call(this)
    }

    return FatLineTask
  })(BaseObjectTask)

  var FatLinesTask = /*#__PURE__*/ (function (_BaseObjectTask8) {
    _inheritsLoose(FatLinesTask, _BaseObjectTask8)

    function FatLinesTask () {
      return _BaseObjectTask8.apply(this, arguments) || this
    }

    var _proto9 = FatLinesTask.prototype

    _proto9.loop = function loop () {
      var _this14 = this

      if (this.tempQueue.length) {
        var actor = getActor()
        this.tempQueue.forEach(function (queue) {
          actor.pushQueue({
            id: queue.id,
            type: 'FatLines',
            layer: queue.layer,
            data: queue.data,
            key: queue.key,
            lineStrings: queue.lineStrings,
            center: queue.center,
            callback: function callback (result) {
              _this14.pushResult(result)
            }
          })
        })
        this.reset()
      }

      _BaseObjectTask8.prototype.loop.call(this)
    }

    return FatLinesTask
  })(BaseObjectTask)

  var ExtrudePolygonTaskIns = new ExtrudePolygonTask()
  var ExtrudePolygonsTaskIns = new ExtrudePolygonsTask()
  var ExtrudeLineTaskIns = new ExtrudeLineTask()
  var ExtrudeLinesTaskIns = new ExtrudeLinesTask()
  var LineTaskIns = new LineTask()
  var LinesTaskIns = new LinesTask()
  var FatLineTaskIns = new FatLineTask()
  var FatLinesTaskIns = new FatLinesTask()
  var BaseObjectTaskManager = {
    isRunning: false,
    loop: function loop () {
      ExtrudePolygonTaskIns.loop()
      ExtrudePolygonsTaskIns.loop()
      ExtrudeLineTaskIns.loop()
      ExtrudeLinesTaskIns.loop()
      LineTaskIns.loop()
      LinesTaskIns.loop()
      FatLineTaskIns.loop()
      FatLinesTaskIns.loop()
      maptalks__namespace.Util.requestAnimFrame(BaseObjectTaskManager.loop)
    },
    star: function star () {
      if (!BaseObjectTaskManager.isRunning) {
        BaseObjectTaskManager.isRunning = true
        BaseObjectTaskManager.loop()
      }
    }
  }

  function initColors (cs) {
    var colors = []

    if (cs && cs.length) {
      cs.forEach(function (color) {
        color =
          color instanceof THREE__namespace.Color
            ? color
            : new THREE__namespace.Color(color)
        colors.push(color.r, color.g, color.b)
      })
    }

    return colors
  }

  var OPTIONS$i = {
    altitude: 0,
    bottomHeight: 0,
    colors: null
  }
  /**
   *
   */

  var Line = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(Line, _BaseObject)

    function Line (lineString, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$i, options, {
        layer: layer,
        lineString: lineString
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _LineStringSplit = LineStringSplit(lineString),
        lineStrings = _LineStringSplit.lineStrings,
        center = _LineStringSplit.center

      var _options = options,
        asynchronous = _options.asynchronous
      var geometry

      if (asynchronous) {
        geometry = getDefaultLineGeometry()
        var id = maptalks__namespace.Util.GUID()
        _this.getOptions().id = id
        _this.getOptions().center = center
        LineTaskIns.push({
          id: id,
          data: lineStrings,
          layer: layer,
          key: options.key,
          lineString: lineString,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        var positionList = []

        for (var i = 0, len = lineStrings.length; i < len; i++) {
          var _lineString = lineStrings[i]

          var _getLinePosition = getLinePosition(
              _lineString,
              layer,
              center,
              false
            ),
            positions = _getLinePosition.positions

          positionList.push(getLineSegmentPosition(positions))
        }

        var position = mergeLinePositions(positionList)
        geometry = new THREE__namespace.BufferGeometry()
        addAttribute(
          geometry,
          'position',
          new THREE__namespace.BufferAttribute(position, 3)
        )
        setBottomHeight(geometry, options.bottomHeight, layer)
        var colors = initColors(options.colors)

        if (colors && colors.length) {
          addAttribute(
            geometry,
            'color',
            new THREE__namespace.Float32BufferAttribute(colors, 3)
          )
          material.vertexColors = getVertexColors()
        }
      }

      _this._createLineSegments(geometry, material)

      var _options2 = options,
        altitude = _options2.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      _this.type = 'Line'
      return _this
    }

    var _proto = Line.prototype

    _proto._workerLoad = function _workerLoad (result) {
      var geometry = new THREE__namespace.BufferGeometry()
      addAttribute(
        geometry,
        'position',
        new THREE__namespace.BufferAttribute(
          new Float32Array(result.position),
          3
        )
      )
      var colors = initColors(this.getOptions().colors)
      var object3d = this.getObject3d()
      var material = object3d.material

      if (colors && colors.length) {
        addAttribute(
          geometry,
          'color',
          new THREE__namespace.Float32BufferAttribute(colors, 3)
        )
        material.vertexColors = getVertexColors()
      }

      this._computeLineDistances(geometry)

      object3d.geometry = geometry
      object3d.material.needsUpdate = true

      this._fire('workerload', {
        target: this
      })
    }

    return Line
  })(BaseObject)

  var OPTIONS$h = {
    bottomHeight: 0,
    width: 3,
    height: 1,
    altitude: 0,
    topColor: null,
    bottomColor: '#2d2f61'
  }
  /**
   *
   */

  var ExtrudeLine = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(ExtrudeLine, _BaseObject)

    function ExtrudeLine (lineString, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$h, options, {
        layer: layer,
        lineString: lineString
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _options = options,
        height = _options.height,
        width = _options.width,
        bottomColor = _options.bottomColor,
        topColor = _options.topColor,
        bottomHeight = _options.bottomHeight,
        altitude = _options.altitude,
        asynchronous = _options.asynchronous
      var h = layer.distanceToVector3(height, height).x
      var w = layer.distanceToVector3(width, width).x

      var _LineStringSplit = LineStringSplit(lineString),
        lineStrings = _LineStringSplit.lineStrings,
        center = _LineStringSplit.center

      var geometry

      if (asynchronous) {
        geometry = getDefaultBufferGeometry()
        var id = maptalks__namespace.Util.GUID()
        _this.getOptions().id = id
        _this.getOptions().center = center
        ExtrudeLineTaskIns.push({
          id: id,
          data: lineStrings,
          layer: layer,
          center: center,
          lineString: lineString,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        var extrudeParams = []
        var minZ = 0
        var cache = {}

        for (var i = 0, len = lineStrings.length; i < len; i++) {
          var attribute = getExtrudeLineParams(
            lineStrings[i],
            w,
            h,
            layer,
            center
          )
          minZ = setBottomHeight(attribute, bottomHeight, layer, cache)
          extrudeParams.push(attribute)
        }

        geometry = mergeBufferGeometries(extrudeParams)

        if (topColor) {
          initVertexColors(geometry, bottomColor, topColor, minZ + h / 2)
          material.vertexColors = getVertexColors()
        }
      }

      _this._createMesh(geometry, material) // const center = (isGeoJSON(lineString) ? getGeoJSONCenter(lineString) : lineString.getCenter());

      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      _this.type = 'ExtrudeLine'
      return _this
    }

    var _proto = ExtrudeLine.prototype

    _proto._workerLoad = function _workerLoad (result) {
      var bufferGeometry = generateBufferGeometry(result)

      var _this$getOptions = this.getOptions(),
        topColor = _this$getOptions.topColor,
        bottomColor = _this$getOptions.bottomColor,
        bottomHeight = _this$getOptions.bottomHeight,
        height = _this$getOptions.height

      var object3d = this.getObject3d()
      var material = object3d.material

      if (topColor) {
        var layer = this.getLayer()
        var h = layer.distanceToVector3(bottomHeight, bottomHeight).x
        var extrudeH = layer.distanceToVector3(height, height).x
        initVertexColors(
          bufferGeometry,
          bottomColor,
          topColor,
          h + extrudeH / 2
        )
        material.vertexColors = getVertexColors()
      }

      object3d.geometry = bufferGeometry
      object3d.material.needsUpdate = true

      this._fire('workerload', {
        target: this
      })
    }

    return ExtrudeLine
  })(BaseObject)

  var OPTIONS$g = {
    altitude: 0,
    height: 1,
    bottomHeight: 0,
    topColor: null,
    bottomColor: '#2d2f61'
  }
  /**
   *
   */

  var ExtrudePolygon = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(ExtrudePolygon, _BaseObject)

    function ExtrudePolygon (polygon, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$g, options, {
        layer: layer,
        polygon: polygon
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _options = options,
        height = _options.height,
        topColor = _options.topColor,
        bottomColor = _options.bottomColor,
        altitude = _options.altitude,
        bottomHeight = _options.bottomHeight,
        asynchronous = _options.asynchronous
      var geometry
      var center = isGeoJSONPolygon(polygon)
        ? getGeoJSONCenter(polygon)
        : polygon.getCenter()

      if (asynchronous) {
        geometry = getDefaultBufferGeometry()
        var id = maptalks__namespace.Util.GUID()
        _this.getOptions().id = id
        _this.getOptions().center = center
        ExtrudePolygonTaskIns.push({
          data: polygon,
          layer: layer,
          id: id,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        geometry = getExtrudeGeometry(polygon, height, layer)
        var h = setBottomHeight(geometry, bottomHeight, layer)

        if (topColor) {
          var extrudeH = layer.distanceToVector3(height, height).x
          initVertexColors(geometry, bottomColor, topColor, h + extrudeH / 2)
          material.vertexColors = getVertexColors()
        }
      }

      _this._createMesh(geometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      _this.type = 'ExtrudePolygon'
      return _this
    }

    var _proto = ExtrudePolygon.prototype

    _proto._workerLoad = function _workerLoad (data) {
      var bufferGeometry = generateBufferGeometry(data)

      var _this$getOptions = this.getOptions(),
        topColor = _this$getOptions.topColor,
        bottomColor = _this$getOptions.bottomColor,
        bottomHeight = _this$getOptions.bottomHeight,
        height = _this$getOptions.height

      var object3d = this.getObject3d()
      var material = object3d.material

      if (topColor) {
        var layer = this.getLayer()
        var h = layer.distanceToVector3(bottomHeight, bottomHeight).x
        var extrudeH = layer.distanceToVector3(height, height).x
        initVertexColors(
          bufferGeometry,
          bottomColor,
          topColor,
          h + extrudeH / 2
        )
        material.vertexColors = getVertexColors()
      }

      object3d.geometry = bufferGeometry
      object3d.material.needsUpdate = true

      this._fire('workerload', {
        target: this
      })
    }

    return ExtrudePolygon
  })(BaseObject)

  var OPTIONS$f = {
    altitude: 0,
    coordinate: null
  }
  /**
   * Model container
   */

  var Model = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(Model, _BaseObject)

    function Model (model, options, layer) {
      var _this

      if (options === void 0) {
        options = {}
      }

      if (!options.coordinate) {
        console.warn('coordinate is null,it is important to locate the model')
        options.coordinate = layer.getMap().getCenter()
      }

      options = maptalks__namespace.Util.extend({}, OPTIONS$f, options, {
        layer: layer,
        model: model
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      _this._createGroup()

      _this.getObject3d().add(model)

      var _options = options,
        altitude = _options.altitude,
        coordinate = _options.coordinate
      var z = layer.distanceToVector3(altitude, altitude).x
      var position = layer.coordinateToVector3(coordinate, z)

      _this.getObject3d().position.copy(position)

      _this.type = 'Model'
      return _this
    }

    return Model
  })(BaseObject)

  var PI = Math.PI / 180
  var R = 6378137
  var MINLENGTH = 1

  function formatLineArray (polyline) {
    var lnglats = polyline.getCoordinates()
    return lnglats.map(function (lnglat) {
      return lnglat.toArray()
    })
  }

  function degreesToRadians (d) {
    return d * PI
  }

  function distance (c1, c2) {
    if (!c1 || !c2) {
      return 0
    }

    if (!Array.isArray(c1)) {
      c1 = c1.toArray()
    }

    if (!Array.isArray(c2)) {
      c2 = c2.toArray()
    }

    var b = degreesToRadians(c1[1])
    var d = degreesToRadians(c2[1]),
      e = b - d,
      f = degreesToRadians(c1[0]) - degreesToRadians(c2[0])
    b =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(e / 2), 2) +
            Math.cos(b) * Math.cos(d) * Math.pow(Math.sin(f / 2), 2)
        )
      )
    b *= R
    return Math.round(b * 1e5) / 1e5
  }
  function lineLength (polyline) {
    var lnglatArray = polyline

    if (!Array.isArray(polyline)) {
      lnglatArray = formatLineArray(polyline)
    }

    var l = 0

    for (var i = 0, len = lnglatArray.length; i < len - 1; i++) {
      l += distance(lnglatArray[i], lnglatArray[i + 1])
    }

    return l
  }

  function getPercentLngLat (l, length) {
    var len = l.len,
      c1 = l.c1,
      c2 = l.c2
    var dx = c2[0] - c1[0],
      dy = c2[1] - c1[1]
    var percent = length / len
    var lng = c1[0] + percent * dx
    var lat = c1[1] + percent * dy
    return [lng, lat]
  }
  /**
   * This is not an accurate line segment cutting method, but rough, in order to speed up the calculation,
   * the correct cutting algorithm can be referred to. http://turfjs.org/docs/#lineChunk
   * @param {*} cs
   * @param {*} lineChunkLength
   */

  function lineSlice (cs, lineChunkLength) {
    if (lineChunkLength === void 0) {
      lineChunkLength = 10
    }

    lineChunkLength = Math.max(lineChunkLength, MINLENGTH)

    if (!Array.isArray(cs)) {
      cs = formatLineArray(cs)
    }

    var LEN = cs.length
    var list = []
    var totalLen = 0

    for (var i = 0; i < LEN - 1; i++) {
      var len = distance(cs[i], cs[i + 1])
      var floorlen = Math.floor(len)
      list.push({
        c1: cs[i],
        len: floorlen,
        c2: cs[i + 1]
      })
      totalLen += floorlen
    }

    if (totalLen <= lineChunkLength) {
      var lnglats = list.map(function (d) {
        return [d.c1, d.c2]
      })
      return lnglats
    }

    if (list.length === 1) {
      if (list[0].len <= lineChunkLength) {
        return [[list[0].c1, list[0].c2]]
      }
    }

    var LNGLATSLEN = list.length
    var first = list[0]
    var idx = 0
    var currentLngLat
    var currentLen = 0
    var lines = []
    var lls = [first.c1]

    while (idx < LNGLATSLEN) {
      var _list$idx = list[idx],
        _len = _list$idx.len,
        c2 = _list$idx.c2
      currentLen += _len

      if (currentLen < lineChunkLength) {
        lls.push(c2)

        if (idx === LNGLATSLEN - 1) {
          lines.push(lls)
        }

        idx++
      }

      if (currentLen === lineChunkLength) {
        lls.push(c2)
        currentLen = 0
        lines.push(lls) //next

        lls = [c2]
        idx++
      }

      if (currentLen > lineChunkLength) {
        var offsetLen = _len - currentLen + lineChunkLength
        currentLngLat = getPercentLngLat(list[idx], offsetLen)
        lls.push(currentLngLat)
        lines.push(lls)
        currentLen = 0
        list[idx].c1 = currentLngLat
        list[idx].len = _len - offsetLen //next

        lls = []
        lls.push(currentLngLat)
      }
    }

    return lines
  }

  var GeoUtil = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    distance: distance,
    lineLength: lineLength,
    lineSlice: lineSlice
  })

  var MAX_POINTS = 1000
  /**
   *
   * @param {THREE.BufferGeometry} geometry
   * @param {*} ps
   * @param {*} norls
   * @param {*} indices
   */

  function setExtrudeLineGeometryAttribute (geometry, ps, norls, indices) {
    var len = ps.length
    geometry.attributes.normal.count = len
    geometry.attributes.position.count = len
    var positions = geometry.attributes.position.array
    var normals = geometry.attributes.normal.array

    for (var i = 0; i < len; i++) {
      positions[i] = ps[i]
      normals[i] = norls[i]
    } // geometry.index.array = new Uint16Array(indices.length);

    geometry.index.count = indices.length // geometry.index.needsUpdate = true;

    for (var _i = 0, len1 = indices.length; _i < len1; _i++) {
      geometry.index.array[_i] = indices[_i]
    } // geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
    // geometry.setDrawRange(0, len / 3);
  }

  var OPTIONS$e = {
    trail: 5,
    chunkLength: 50,
    width: 2,
    height: 1,
    speed: 1,
    altitude: 0,
    interactive: false
  }
  /**
   *
   */

  var ExtrudeLineTrail = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(ExtrudeLineTrail, _BaseObject)

    function ExtrudeLineTrail (lineString, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$e, options, {
        layer: layer,
        lineString: lineString
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _options = options,
        width = _options.width,
        height = _options.height,
        altitude = _options.altitude,
        speed = _options.speed,
        chunkLength = _options.chunkLength,
        trail = _options.trail
      var center, coordinates

      if (isGeoJSON(lineString)) {
        center = getGeoJSONCenter(lineString)
        coordinates = getGeoJSONCoordinates(lineString)
      } else {
        center = lineString.getCenter()
        coordinates = lineString
      }

      var chunkLines = lineSlice(coordinates, chunkLength)
      var centerPt = layer.coordinateToVector3(center) //cache position for  faster computing,reduce double counting

      var positionMap = {}

      for (var i = 0, len = chunkLines.length; i < len; i++) {
        var chunkLine = chunkLines[i]

        for (var j = 0, len1 = chunkLine.length; j < len1; j++) {
          var lnglat = chunkLine[j]
          var key = lnglat.join(',').toString()

          if (!positionMap[key]) {
            positionMap[key] = layer.coordinateToVector3(lnglat).sub(centerPt)
          }
        }
      }

      var positions = getChunkLinesPosition(
        chunkLines.slice(0, 1),
        layer,
        positionMap,
        centerPt
      ).positionsV //generate geometry

      var geometry = new THREE__namespace.BufferGeometry()
      var ps = new Float32Array(MAX_POINTS * 3) // 3 vertices per point

      var norls = new Float32Array(MAX_POINTS * 3) // 3 vertices per point

      var inds = new Uint16Array(MAX_POINTS)
      addAttribute(
        geometry,
        'position',
        new THREE__namespace.BufferAttribute(ps, 3)
      )
      addAttribute(
        geometry,
        'normal',
        new THREE__namespace.BufferAttribute(norls, 3)
      )
      geometry.setIndex(new THREE__namespace.BufferAttribute(inds, 1))
      var lineWidth = layer.distanceToVector3(width, width).x
      var depth = layer.distanceToVector3(height, height).x
      var params = getExtrudeLineParams(positions, lineWidth, depth, layer)
      setExtrudeLineGeometryAttribute(
        geometry,
        params.position,
        params.normal,
        params.indices
      )

      _this._createMesh(geometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      _this._params = {
        index: 0,
        chunkLines: chunkLines,
        geometries: [],
        layer: layer,
        trail: Math.max(1, trail),
        lineWidth: lineWidth,
        depth: depth,
        speed: Math.min(1, speed),
        idx: 0,
        loaded: false,
        positionMap: positionMap,
        centerPt: centerPt
      }

      _this._init(_this._params)

      _this.type = 'ExtrudeLineTrail'
      return _this
    }
    /**
     * Follow-up support for adding webworker
     * @param {*} params
     */

    var _proto = ExtrudeLineTrail.prototype

    _proto._init = function _init (params) {
      var layer = params.layer,
        trail = params.trail,
        lineWidth = params.lineWidth,
        depth = params.depth,
        chunkLines = params.chunkLines,
        positionMap = params.positionMap,
        centerPt = params.centerPt
      var len = chunkLines.length,
        geometries = []

      for (var i = 0; i < len; i++) {
        var lines = chunkLines.slice(i, i + trail)
        var ps = getChunkLinesPosition(lines, layer, positionMap, centerPt)
          .positionsV
        geometries.push(getExtrudeLineParams(ps, lineWidth, depth, layer))
      }

      this._params.geometries = geometries
      this._params.loaded = true
    }

    _proto._animation = function _animation () {
      var _this$_params = this._params,
        index = _this$_params.index,
        geometries = _this$_params.geometries,
        speed = _this$_params.speed,
        idx = _this$_params.idx,
        chunkLines = _this$_params.chunkLines,
        trail = _this$_params.trail,
        lineWidth = _this$_params.lineWidth,
        depth = _this$_params.depth,
        loaded = _this$_params.loaded,
        layer = _this$_params.layer,
        positionMap = _this$_params.positionMap,
        centerPt = _this$_params.centerPt
      if (!loaded) return
      var i = Math.round(index)

      if (i > idx) {
        this._params.idx++
        var p = geometries[i] //if not init, this is will running

        if (!p) {
          var lines = chunkLines.slice(i, i + trail)
          var ps = getChunkLinesPosition(lines, layer, positionMap, centerPt)
            .positionsV
          p = getExtrudeLineParams(ps, lineWidth, depth, layer)
          geometries[i] = p
        }

        var object3d = this.getObject3d()
        setExtrudeLineGeometryAttribute(
          object3d.geometry,
          p.position,
          p.normal,
          p.indices
        )
        object3d.geometry.attributes.position.needsUpdate = true
        object3d.geometry.attributes.normal.needsUpdate = true
        object3d.geometry.index.needsUpdate = true
      }

      if (index >= chunkLines.length - 1) {
        this._params.index = -1
        this._params.idx = -1
      }

      this._params.index += speed
    }

    return ExtrudeLineTrail
  })(BaseObject)

  var EVENTS$1 = [
    'click',
    'mousemove',
    'mousedown',
    'mouseup',
    'dblclick',
    'contextmenu'
  ]
    .join(' ')
    .toString()
  var defaultMaterial = new THREE__namespace.MeshBasicMaterial()
  defaultMaterial.vertexColors = getVertexColors()
  /**
   * This is for the merger, MergedExtrudeMesh,Points ...
   * @param {*} Base
   */

  var MergedMixin = function MergedMixin (Base) {
    return /*#__PURE__*/ (function (_Base) {
      _inheritsLoose(_class, _Base)

      function _class () {
        return _Base.apply(this, arguments) || this
      }

      var _proto = _class.prototype

      // this._faceMap=[];
      // this._baseObjects = [];
      // this._datas = [];
      // this.faceIndex = null;
      // this.index=null;
      // this._geometriesAttributes = [];
      // this._geometryCache = geometry.clone();
      // this.isHide = false;

      /**
       *
       * @param {*} baseObjects
       */
      _proto._initBaseObjectsEvent = function _initBaseObjectsEvent (
        baseObjects
      ) {
        if (baseObjects && Array.isArray(baseObjects) && baseObjects.length) {
          for (var i = 0, len = baseObjects.length; i < len; i++) {
            var baseObject = baseObjects[i]

            this._proxyEvent(baseObject)
          }
        }

        return this
      }
      /**
       *Events representing the merge
       * @param {*} baseObject
       */

      _proto._proxyEvent = function _proxyEvent (baseObject) {
        var _this = this

        baseObject.on('add', function (e) {
          _this._showGeometry(e.target, true)
        })
        baseObject.on('remove', function (e) {
          _this._showGeometry(e.target, false)
        })
        baseObject.on('mouseout', function (e) {
          _this._mouseover = false

          _this.fire(
            'mouseout',
            Object.assign({}, e, {
              target: _this,
              selectMesh: _this.getSelectMesh ? _this.getSelectMesh() : null
            })
          ) // this._showGeometry(e.target, false);
        })
        baseObject.on(EVENTS$1, function (e) {
          _this.fire(
            e.type,
            Object.assign({}, e, {
              target: _this,
              selectMesh: _this.getSelectMesh ? _this.getSelectMesh() : null
            })
          )
        })
      }
      /**
       * Get the index of the monomer to be hidden
       * @param {*} attribute
       */

      _proto._getHideGeometryIndex = function _getHideGeometryIndex (
        attribute
      ) {
        var indexs = []
        var count = 0

        for (var i = 0, len = this._geometriesAttributes.length; i < len; i++) {
          if (this._geometriesAttributes[i].hide === true) {
            indexs.push(i)
            count += this._geometriesAttributes[i][attribute].count
          }
        }

        return {
          indexs: indexs,
          count: count
        }
      }
      /**
       * update geometry attributes
       * @param {*} bufferAttribute
       * @param {*} attribute
       */

      _proto._updateAttribute = function _updateAttribute (
        bufferAttribute,
        attribute
      ) {
        var _this$_getHideGeometr = this._getHideGeometryIndex(attribute),
          indexs = _this$_getHideGeometr.indexs

        var array = this._geometryCache.attributes[attribute].array
        var len = array.length

        for (var i = 0; i < len; i++) {
          bufferAttribute.array[i] = array[i]
        }

        var value = NaN

        if (this.getObject3d() instanceof THREE__namespace.LineSegments) {
          value = 0
        }

        for (var j = 0; j < indexs.length; j++) {
          var index = indexs[j]
          var _this$_geometriesAttr = this._geometriesAttributes[index][
              attribute
            ],
            start = _this$_geometriesAttr.start,
            end = _this$_geometriesAttr.end

          for (var _i = start; _i < end; _i++) {
            bufferAttribute.array[_i] = value
          }
        }

        return this
      }
      /**
       * show or hide monomer
       * @param {*} baseObject
       * @param {*} isHide
       */

      _proto._showGeometry = function _showGeometry (baseObject, isHide) {
        var index

        if (baseObject) {
          index = baseObject.getOptions().index
        }

        if (index != null) {
          var geometryAttributes = this._geometriesAttributes[index]
          var hide = geometryAttributes.hide

          if (hide === isHide) {
            return this
          }

          geometryAttributes.hide = isHide
          var buffGeom = this.getObject3d().geometry

          this._updateAttribute(buffGeom.attributes.position, 'position') // this._updateAttribute(buffGeom.attributes.normal, 'normal', 3);
          // this._updateAttribute(buffGeom.attributes.color, 'color', 3);
          // this._updateAttribute(buffGeom.attributes.uv, 'uv', 2);

          buffGeom.attributes.position.needsUpdate = true // buffGeom.attributes.color.needsUpdate = true;
          // buffGeom.attributes.normal.needsUpdate = true;
          // buffGeom.attributes.uv.needsUpdate = true;

          this.isHide = isHide
        }

        return this
      }
      /**
       * Get selected monomer
       */
      // eslint-disable-next-line consistent-return

      _proto.getSelectMesh = function getSelectMesh () {
        var index = this._getIndex()

        if (index != null) {
          return {
            data: this._datas[index],
            baseObject: this._baseObjects[index]
          }
        }
      }

      _proto._getIndex = function _getIndex (faceIndex) {
        if (faceIndex == null) {
          faceIndex = this.faceIndex || this.index
        }

        return faceIndex
      }

      _proto._init = function _init () {
        var _this2 = this

        var pick = this.getLayer().getPick()
        this.on('add', function () {
          pick.add(_this2.pickObject3d)
        })
        this.on('remove', function () {
          pick.remove(_this2.pickObject3d)
        })
      } //Different objects need to implement their own methods

      _proto._setPickObject3d = function _setPickObject3d () {
        if (!this._colorMap) {
          return
        } // multiplexing geometry

        var geometry =
          this._geometryCache || this.getObject3d().geometry.clone()
        var pick = this.getLayer().getPick()
        var _geometriesAttributes = this._geometriesAttributes
        var len = _geometriesAttributes.length
        var colors = getGeometriesColorArray(_geometriesAttributes)
        var cIndex = 0

        for (var i = 0; i < len; i++) {
          var _color = pick.getColor()

          var _colorIndex = _color.getHex()

          this._colorMap[_colorIndex] = i
          var count = _geometriesAttributes[i].position.count
          this._datas[i].colorIndex = _colorIndex

          for (var j = 0; j < count; j++) {
            colors[cIndex] = _color.r
            colors[cIndex + 1] = _color.g
            colors[cIndex + 2] = _color.b
            cIndex += 3
          }
        }

        addAttribute(
          geometry,
          'color',
          new THREE__namespace.BufferAttribute(colors, 3, true)
        ) // const material = new THREE.MeshBasicMaterial();
        // material.vertexColors = THREE.VertexColors;

        var color = pick.getColor()
        var colorIndex = color.getHex()
        var mesh = new THREE__namespace.Mesh(geometry, defaultMaterial)
        mesh.position.copy(this.getObject3d().position)
        mesh['_colorIndex'] = colorIndex
        this.setPickObject3d(mesh)
      }

      return _class
    })(Base)
  }

  var OPTIONS$d = {
    altitude: 0,
    height: 1,
    bottomHeight: 0,
    topColor: null,
    bottomColor: '#2d2f61'
  }
  var TEMP_COORD$1 = new maptalks__namespace.Coordinate(0, 0)

  var ExtrudePolygons = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(ExtrudePolygons, _MergedMixin)

    function ExtrudePolygons (polygons, options, material, layer) {
      var _this

      if (!Array.isArray(polygons)) {
        polygons = [polygons]
      }

      var len = polygons.length

      if (len === 0) {
        console.error('polygons is empty')
      } // const centers = [];

      var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity

      for (var i = 0; i < len; i++) {
        var polygon = polygons[i]

        var _center = polygon.getCenter
          ? polygon.getCenter()
          : getGeoJSONCenter(polygon, TEMP_COORD$1)

        var x = void 0,
          y = void 0

        if (Array.isArray(_center)) {
          x = _center[0]
          y = _center[1]
        } else if (_center instanceof maptalks__namespace.Coordinate) {
          x = _center.x
          y = _center.y
        }

        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      } // Get the center point of the point set

      var center = new maptalks__namespace.Coordinate(
        (minX + maxX) / 2,
        (minY + maxY) / 2
      )
      options = maptalks__namespace.Util.extend({}, OPTIONS$d, options, {
        layer: layer,
        polygons: polygons,
        coordinate: center
      })
      var _options = options,
        topColor = _options.topColor,
        bottomColor = _options.bottomColor,
        altitude = _options.altitude,
        asynchronous = _options.asynchronous
      var bufferGeometry
      var extrudePolygons = [],
        faceMap = [],
        geometriesAttributes = []
      _this = _MergedMixin.call(this) || this

      if (asynchronous) {
        bufferGeometry = getDefaultBufferGeometry()
        ExtrudePolygonsTaskIns.push({
          id: maptalks__namespace.Util.GUID(),
          layer: layer,
          key: options.key,
          center: center,
          data: polygons,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        var centerPt = layer.coordinateToVector3(center)
        var geometries = []
        var faceIndex = 0,
          psIndex = 0,
          normalIndex = 0,
          uvIndex = 0
        var altCache = {}

        for (var _i = 0; _i < len; _i++) {
          var _polygon = polygons[_i]
          var properties = isGeoJSONPolygon(_polygon)
            ? _polygon['properties']
            : _polygon.getProperties() || {}
          var height = properties.height || 1
          var bottomHeight = properties.bottomHeight || 0
          var buffGeom = getExtrudeGeometryParams(
            _polygon,
            height,
            layer,
            center,
            centerPt,
            altCache
          )
          geometries.push(buffGeom)
          var minZ = setBottomHeight(buffGeom, bottomHeight, layer, altCache) // const extrudePolygon = new ExtrudePolygon(polygon, Object.assign({}, options, { height, index: i }), material, layer);
          // extrudePolygons.push(extrudePolygon);

          var position = buffGeom.position,
            normal = buffGeom.normal,
            uv = buffGeom.uv,
            indices = buffGeom.indices
          var faceLen = indices.length / 3
          faceMap[_i] = [faceIndex + 1, faceIndex + faceLen]
          faceIndex += faceLen
          var psCount = position.length / 3,
            //  colorCount = buffGeom.attributes.color.count,
            normalCount = normal.length / 3,
            uvCount = uv.length / 2
          geometriesAttributes[_i] = {
            position: {
              middleZ: minZ + altCache[height] / 2,
              count: psCount,
              start: psIndex,
              end: psIndex + psCount * 3
            },
            normal: {
              count: normalCount,
              start: normalIndex,
              end: normalIndex + normalCount * 3
            },
            // color: {
            //     count: colorCount,
            //     start: colorIndex,
            //     end: colorIndex + colorCount * 3,
            // },
            uv: {
              count: uvCount,
              start: uvIndex,
              end: uvIndex + uvCount * 2
            },
            hide: false
          }
          psIndex += psCount * 3
          normalIndex += normalCount * 3 // colorIndex += colorCount * 3;

          uvIndex += uvCount * 2
        }

        bufferGeometry = mergeBufferGeometries(geometries)

        if (topColor) {
          initVertexColors(
            bufferGeometry,
            bottomColor,
            topColor,
            geometriesAttributes
          )
          material.vertexColors = getVertexColors()
        }
      }

      _this._initOptions(options)

      _this._createMesh(bufferGeometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v) //Face corresponding to monomer

      _this._faceMap = faceMap
      _this._baseObjects = extrudePolygons
      _this._datas = polygons
      _this._geometriesAttributes = geometriesAttributes
      _this.faceIndex = null
      _this._geometryCache = bufferGeometry.clone()
      _this.isHide = false
      _this._colorMap = {}

      _this._initBaseObjectsEvent(extrudePolygons)

      if (!asynchronous) {
        _this._setPickObject3d()

        _this._init()
      }

      _this.type = 'ExtrudePolygons'
      return _this
    } // eslint-disable-next-line consistent-return

    var _proto = ExtrudePolygons.prototype

    _proto.getSelectMesh = function getSelectMesh () {
      var index = this._getIndex()

      if (index != null) {
        if (!this._baseObjects[index]) {
          var polygon = this._datas[index]
          var opts = Object.assign(
            {},
            this.options,
            isGeoJSONPolygon(polygon)
              ? polygon.properties
              : polygon.getProperties(),
            {
              index: index
            }
          )
          this._baseObjects[index] = new ExtrudePolygon(
            polygon,
            opts,
            this.getObject3d().material,
            this.getLayer()
          )

          this._proxyEvent(this._baseObjects[index])
        }

        return {
          data: this._datas[index],
          baseObject: this._baseObjects[index]
        }
      }
    } // eslint-disable-next-line no-unused-vars

    _proto.identify = function identify (coordinate) {
      return this.picked
    }

    _proto._workerLoad = function _workerLoad (result) {
      var faceMap = result.faceMap,
        geometriesAttributes = result.geometriesAttributes
      this._faceMap = faceMap
      this._geometriesAttributes = geometriesAttributes
      var bufferGeometry = generateBufferGeometry(result)
      this._geometryCache = generatePickBufferGeometry(bufferGeometry)

      var _this$getOptions = this.getOptions(),
        topColor = _this$getOptions.topColor,
        bottomColor = _this$getOptions.bottomColor

      var object3d = this.getObject3d()
      var material = object3d.material

      if (topColor) {
        initVertexColors(
          bufferGeometry,
          bottomColor,
          topColor,
          geometriesAttributes
        )
        material.vertexColors = getVertexColors()
      }

      object3d.geometry = bufferGeometry
      object3d.material.needsUpdate = true

      this._setPickObject3d()

      this._init()

      if (this.isAdd) {
        var pick = this.getLayer().getPick()
        pick.add(this.pickObject3d)
      }

      this._fire('workerload', {
        target: this
      })
    }

    return ExtrudePolygons
  })(MergedMixin(BaseObject))

  function positionsConvert (worldPoints, altitude, layer) {
    if (altitude === void 0) {
      altitude = 0
    }

    var vectors = [],
      cache = {}

    for (var i = 0, len = worldPoints.length; i < len; i += 3) {
      var x = worldPoints[i],
        y = worldPoints[i + 1],
        z = worldPoints[i + 2]

      if (altitude > 0) {
        z += distanceToVector3(altitude, layer, cache)
      }

      vectors.push(new THREE__namespace.Vector3(x, y, z))
    }

    return vectors
  }

  function vectors2Pixel (worldPoints, size, camera, altitude, layer) {
    if (altitude === void 0) {
      altitude = 0
    }

    if (!(worldPoints[0] instanceof THREE__namespace.Vector3)) {
      worldPoints = positionsConvert(worldPoints, altitude, layer)
    }

    var pixels = worldPoints.map(function (worldPoint) {
      return vector2Pixel(worldPoint, size, camera)
    })
    return pixels
  } // eslint-disable-next-line camelcase

  function vector2Pixel (world_vector, size, camera) {
    // eslint-disable-next-line camelcase
    var vector = world_vector.project(camera)
    var halfWidth = size.width / 2
    var halfHeight = size.height / 2
    var result = {
      x: Math.round(vector.x * halfWidth + halfWidth),
      y: Math.round(-vector.y * halfHeight + halfHeight)
    }
    return result
  }

  var IdentifyUtil = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    vectors2Pixel: vectors2Pixel,
    vector2Pixel: vector2Pixel
  })

  var OPTIONS$c = {
    altitude: 0,
    height: 0,
    color: null
  }
  var vector$1 = new THREE__namespace.Vector3()

  var Point = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(Point, _BaseObject)

    function Point (coordinate, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$c, options, {
        layer: layer,
        coordinate: coordinate
      })
      _this = _BaseObject.call(this) || this
      var _options = options,
        height = _options.height,
        altitude = _options.altitude,
        color = _options.color,
        size = _options.size
      var vs = [],
        colors = []

      if (color) {
        color =
          color instanceof THREE__namespace.Color
            ? color
            : new THREE__namespace.Color(color)
        colors.push(color.r, color.g, color.b)
      }

      var z = layer.distanceToVector3(height, height).x
      var v = layer.coordinateToVector3(coordinate, z)
      vs.push(0, 0, v.z)
      var geometry = new THREE__namespace.BufferGeometry()
      addAttribute(
        geometry,
        'position',
        new THREE__namespace.Float32BufferAttribute(vs, 3, true)
      )

      if (colors.length) {
        addAttribute(
          geometry,
          'color',
          new THREE__namespace.Float32BufferAttribute(colors, 3, true)
        )
      }

      if (size !== undefined) {
        addAttribute(
          geometry,
          'size',
          new THREE__namespace.Float32BufferAttribute([size], 1, true)
        )
      }

      options.positions = v

      _this._initOptions(options)

      _this._createPoints(geometry, material)

      var z1 = layer.distanceToVector3(altitude, altitude).x
      var v1 = new THREE__namespace.Vector3(v.x, v.y, z1)

      _this.getObject3d().position.copy(v1)

      _this.type = 'Point'
      return _this
    }
    /**
     *
     * @param {maptalks.Coordinate} coordinate
     */

    var _proto = Point.prototype

    _proto.identify = function identify (coordinate) {
      var layer = this.getLayer(),
        size = this.getMap().getSize(),
        camera = this.getLayer().getCamera(),
        positions = this.getOptions().positions,
        altitude = this.getOptions().altitude //Size of points

      var pointSize = this.getObject3d().material.size

      if (pointSize === undefined) {
        pointSize = this.options.size || 1
      }

      var pixel = this.getMap().coordToContainerPoint(coordinate)
      var z = layer.distanceToVector3(altitude, altitude).x
      vector$1.x = positions.x
      vector$1.y = positions.y
      vector$1.z = positions.z + z //3D vector to screen coordinates

      var p = vector2Pixel(vector$1, size, camera) //Distance between two points

      var distance = Math.sqrt(
        Math.pow(pixel.x - p.x, 2) + Math.pow(pixel.y - p.y, 2)
      )
      return distance <= pointSize / 2
    }

    return Point
  })(BaseObject)

  var ROW = 30,
    COL = 30

  function contains (b, p) {
    var minx = b.minx,
      miny = b.miny,
      maxx = b.maxx,
      maxy = b.maxy
    var x = p[0],
      y = p[1]

    if (minx <= x && x <= maxx && miny <= y && y <= maxy) {
      return true
    }

    return false
  }

  var BBox = /*#__PURE__*/ (function () {
    function BBox (minlng, minlat, maxlng, maxlat) {
      this.minlng = minlng
      this.minlat = minlat
      this.maxlng = maxlng
      this.maxlat = maxlat
      this.minx = Infinity
      this.miny = Infinity
      this.maxx = -Infinity
      this.maxy = -Infinity
      this.coordinates = []
      this.positions = []
      this.indexs = []
      this.key = null
    }
    /**
     *
     * @param {*} map
     */

    var _proto = BBox.prototype

    _proto.updateBBoxPixel = function updateBBoxPixel (map) {
      var minx = Infinity,
        miny = Infinity,
        maxx = -Infinity,
        maxy = -Infinity
      var minlng = this.minlng,
        minlat = this.minlat,
        maxlng = this.maxlng,
        maxlat = this.maxlat
      ;[
        [minlng, minlat],
        [minlng, maxlat],
        [maxlng, minlat],
        [maxlng, maxlat]
      ]
        .map(function (lnglat) {
          return new maptalks__namespace.Coordinate(lnglat)
        })
        .map(function (coordinate) {
          return map.coordToContainerPoint(coordinate)
        })
        .forEach(function (pixel) {
          minx = Math.min(minx, pixel.x)
          miny = Math.min(miny, pixel.y)
          maxx = Math.max(maxx, pixel.x)
          maxy = Math.max(maxy, pixel.y)
        })
      this.minx = minx
      this.miny = miny
      this.maxx = maxx
      this.maxy = maxy
      return this
    }
    /**
     *Determine whether a point is included
     * @param {*} c
     */

    _proto.containsCoordinate = function containsCoordinate (c) {
      var lng, lat

      if (Array.isArray(c)) {
        lng = c[0]
        lat = c[1]
      } else if (c instanceof maptalks__namespace.Coordinate) {
        lng = c.x
        lat = c.y
      }

      var minlng = this.minlng,
        minlat = this.minlat,
        maxlng = this.maxlng,
        maxlat = this.maxlat
      return minlng <= lng && lng <= maxlng && minlat <= lat && lat <= maxlat
    }
    /**
     *Judge rectangle intersection
     * @param {*} pixel
     * @param {*} size
     */

    _proto.isRecCross = function isRecCross (pixel, size) {
      var x = pixel.x,
        y = pixel.y
      var rec = {
        minx: x - size / 2,
        miny: y - size / 2,
        maxx: x + size / 2,
        maxy: y + size / 2
      }
      var minx = rec.minx,
        miny = rec.miny,
        maxx = rec.maxx,
        maxy = rec.maxy

      if (
        contains(this, [minx, miny]) ||
        contains(this, [minx, maxy]) ||
        contains(this, [maxx, miny]) ||
        contains(this, [maxx, maxy]) ||
        contains(rec, [this.minx, this.miny]) ||
        contains(rec, [this.minx, this.maxy]) ||
        contains(rec, [this.maxx, this.miny]) ||
        contains(rec, [this.maxx, this.maxy])
      ) {
        return true
      }

      return false
    }
    /**
     *generate grids
     * @param {*} minlng
     * @param {*} minlat
     * @param {*} maxlng
     * @param {*} maxlat
     */

    BBox.initGrids = function initGrids (minlng, minlat, maxlng, maxlat) {
      var grids = [],
        offsetX = maxlng - minlng,
        offsetY = maxlat - minlat
      var averageX = offsetX / COL,
        averageY = offsetY / ROW
      var x = minlng,
        y = minlat

      for (var i = 0; i < COL; i++) {
        x = minlng + i * averageX

        for (var j = 0; j < ROW; j++) {
          y = minlat + j * averageY
          var bounds = new BBox(x, y, x + averageX, y + averageY)
          bounds.key = j + '-' + i
          grids.push(bounds)
        }
      }

      return {
        grids: grids,
        averageX: averageX,
        averageY: averageY,
        ROWS: ROW,
        COLS: COL
      }
    }

    return BBox
  })()

  var OPTIONS$b = {
    altitude: 0
  }
  var vector = new THREE__namespace.Vector3()

  function roundFun (value, n) {
    var tempValue = Math.pow(10, n)
    return Math.round(value * tempValue) / tempValue
  }
  /**
   *points
   */

  var Points = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(Points, _MergedMixin)

    function Points (points, options, material, layer) {
      var _this

      if (!Array.isArray(points)) {
        points = [points]
      }

      options = maptalks__namespace.Util.extend({}, OPTIONS$b, options, {
        layer: layer,
        points: points
      })
      var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity

      for (var i = 0, len = points.length; i < len; i++) {
        var coordinate = points[i].coordinate
        var x = void 0,
          y = void 0

        if (Array.isArray(coordinate)) {
          x = coordinate[0]
          y = coordinate[1]
        } else if (coordinate instanceof maptalks__namespace.Coordinate) {
          x = coordinate.x
          y = coordinate.y
        }

        points[i].coords = [x, y]
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }

      var centerPt = layer.coordinateToVector3([
        (minX + maxX) / 2,
        (minY + maxY) / 2
      ])

      var _BBox$initGrids = BBox.initGrids(minX, minY, maxX, maxY),
        grids = _BBox$initGrids.grids,
        averageX = _BBox$initGrids.averageX,
        averageY = _BBox$initGrids.averageY,
        ROWS = _BBox$initGrids.ROWS
      _BBox$initGrids.COLS

      grids.length
      var vs = new Float32Array(points.length * 3),
        vectors = [],
        colors = new Float32Array(points.length * 3),
        sizes = new Float32Array(points.length),
        pointMeshes = [],
        geometriesAttributes = []
      var cache = {}
      var maxSize = 0
      var hasColor = false,
        hasSize = false
      var TEMP_VECTOR = new THREE__namespace.Vector3(0, 0, 0)

      for (var _i = 0, _len = points.length; _i < _len; _i++) {
        var _points$_i = points[_i],
          _coordinate = _points$_i.coordinate,
          height = _points$_i.height,
          color = _points$_i.color,
          size = _points$_i.size,
          coords = _points$_i.coords
        var idx = _i * 3

        if (color) {
          hasColor = true
          color =
            color instanceof THREE__namespace.Color
              ? color
              : new THREE__namespace.Color(color)
          colors[idx] = color.r
          colors[idx + 1] = color.g
          colors[idx + 2] = color.b
        }

        if (size) {
          hasSize = true
          sizes[_i] = size
          maxSize = Math.max(maxSize, size)
        }

        var _z = distanceToVector3(height, layer, cache)

        var _v = layer.coordinateToVector3(_coordinate, _z)

        TEMP_VECTOR.x = _v.x
        TEMP_VECTOR.y = _v.y
        TEMP_VECTOR.z = _v.z
        TEMP_VECTOR.sub(centerPt) // const v1 = v.clone().sub(centerPt);

        vs[idx] = TEMP_VECTOR.x
        vs[idx + 1] = TEMP_VECTOR.y
        vs[idx + 2] = TEMP_VECTOR.z
        vectors.push(_v)
        geometriesAttributes[_i] = {
          position: {
            count: 1,
            start: _i * 3,
            end: _i * 3 + 3
          },
          hide: false
        }
        var row = roundFun((coords[1] - minY) / averageY, 4)
        var col = roundFun((coords[0] - minX) / averageX, 4)
        row -= 1
        col -= 1
        row = Math.max(0, row)
        col = Math.max(0, col)
        row = Math.ceil(row)
        col = Math.ceil(col)
        var gridIndex = col * ROWS + row

        if (grids[gridIndex]) {
          grids[gridIndex].positions.push(_v)
          grids[gridIndex].indexs.push(_i)
        } // for (let j = 0; j < gridslen; j++) {
        //     if (grids[j].containsCoordinate(coordinate)) {
        //         // grids[j].coordinates.push(coordinate);
        //         grids[j].positions.push(v);
        //         grids[j].indexs.push(i);
        //         console.log(j, gridIndex);
        //         break;
        //     }
        // }
      }

      var geometry = new THREE__namespace.BufferGeometry()
      addAttribute(
        geometry,
        'position',
        new THREE__namespace.BufferAttribute(vs, 3, true)
      )

      if (hasColor) {
        addAttribute(
          geometry,
          'color',
          new THREE__namespace.BufferAttribute(colors, 3, true)
        )
      }

      if (hasSize) {
        addAttribute(
          geometry,
          'size',
          new THREE__namespace.BufferAttribute(sizes, 1, true)
        )
      } //for identify

      options.positions = vectors
      _this = _MergedMixin.call(this) || this

      _this._initOptions(options)

      _this._createPoints(geometry, material)

      var altitude = options.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = centerPt.clone()
      v.z = z

      _this.getObject3d().position.copy(v)

      _this._baseObjects = pointMeshes
      _this._datas = points
      _this.faceIndex = null
      _this._geometriesAttributes = geometriesAttributes
      _this._geometryCache = geometry.clone()
      _this.isHide = false

      _this._initBaseObjectsEvent(pointMeshes)

      _this._grids = grids

      _this._bindMapEvents()

      _this.type = 'Points'
      _this.maxSize = maxSize
      return _this
    }

    var _proto = Points.prototype

    _proto._bindMapEvents = function _bindMapEvents () {
      var _this2 = this

      var map = this.getMap()
      var events =
        'zoomstart zooming zoomend movestart moving moveend pitch rotate'
      this.on('add', function () {
        _this2._updateGrids()

        map.on(events, _this2._updateGrids, _this2)
      })
      this.on('remove', function () {
        map.off(events, _this2._updateGrids, _this2)
      })
    }

    _proto._updateGrids = function _updateGrids () {
      var map = this.getMap()

      this._grids.forEach(function (b) {
        if (b.indexs.length) {
          b.updateBBoxPixel(map)
        }
      })
    } // eslint-disable-next-line consistent-return

    _proto.getSelectMesh = function getSelectMesh () {
      var index = this.faceIndex

      if (index != null) {
        if (!this._baseObjects[index]) {
          var data = this._datas[index]
          var coordinate = data.coordinate,
            height = data.height,
            color = data.color,
            size = data.size
          this._baseObjects[index] = new Point(
            coordinate,
            {
              height: height,
              index: index,
              color: color,
              size: size
            },
            this.getObject3d().material,
            this.getLayer()
          )

          this._proxyEvent(this._baseObjects[index])
        }

        return {
          data: this._datas[index],
          baseObject: this._baseObjects[index]
        }
      }
    }
    /**
     *
     * @param {maptalks.Coordinate} coordinate
     */

    _proto.identify = function identify (coordinate) {
      var _this3 = this

      var layer = this.getLayer(),
        size = this.getMap().getSize(),
        camera = this.getLayer().getCamera(),
        altitude = this.getOptions().altitude,
        map = this.getMap()
      var z = layer.distanceToVector3(altitude, altitude).x
      var pointSize = this.getObject3d().material.size
      var isDynamicSize = pointSize === undefined
      var pixel = map.coordToContainerPoint(coordinate)
      var bs = []

      this._grids.forEach(function (b) {
        if (b.indexs.length) {
          if (b.isRecCross(pixel, isDynamicSize ? _this3.maxSize : pointSize)) {
            bs.push(b)
          }
        }
      })

      if (bs.length < 1) {
        return false
      }

      for (var i = 0, len = bs.length; i < len; i++) {
        for (var len1 = bs[i].positions.length, j = len1 - 1; j >= 0; j--) {
          if (isDynamicSize) {
            pointSize = this._datas[bs[i].indexs[j]].size || 1
          }

          var v = bs[i].positions[j]
          vector.x = v.x
          vector.y = v.y
          vector.z = v.z + z
          var p = vector2Pixel(vector, size, camera)
          var distance = Math.sqrt(
            Math.pow(pixel.x - p.x, 2) + Math.pow(pixel.y - p.y, 2)
          )

          if (distance <= pointSize / 2) {
            this.faceIndex = bs[i].indexs[j]
            return true
          }
        }
      }

      return false
    }

    return Points
  })(MergedMixin(BaseObject))

  var OPTIONS$a = {
    coordinate: '',
    radius: 10,
    height: 100,
    radialSegments: 6,
    altitude: 0,
    topColor: '',
    bottomColor: '#2d2f61'
  }
  /**
   * merged bars
   */

  var Bars = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(Bars, _MergedMixin)

    function Bars (points, options, material, layer) {
      var _this

      if (!Array.isArray(points)) {
        points = [points]
      }

      var len = points.length
      var center = getCenterOfPoints(points)
      var centerPt = layer.coordinateToVector3(center)
      var geometries = [],
        bars = [],
        geometriesAttributes = [],
        faceMap = []
      var faceIndex = 0,
        psIndex = 0,
        normalIndex = 0,
        uvIndex = 0
      var cache = {}

      for (var i = 0; i < len; i++) {
        var opts = maptalks__namespace.Util.extend(
          {
            index: i
          },
          OPTIONS$a,
          points[i]
        )
        var radius = opts.radius,
          radialSegments = opts.radialSegments,
          _altitude = opts.altitude,
          topColor = opts.topColor,
          bottomColor = opts.bottomColor,
          height = opts.height,
          coordinate = opts.coordinate
        var r = distanceToVector3(radius, layer, cache)
        var h = distanceToVector3(height, layer, cache)
        var alt = distanceToVector3(_altitude, layer, cache)
        var buffGeom = getGeometry({
          radius: r,
          height: h,
          radialSegments: radialSegments
        })

        if (topColor) {
          initVertexColors$1(buffGeom, bottomColor, topColor, 'z', h / 2)
          material.vertexColors = getVertexColors()
        } // buffGeom.rotateX(Math.PI / 2);

        var _v = layer.coordinateToVector3(coordinate).sub(centerPt)

        var parray = buffGeom.attributes.position.array

        for (var j = 0, len1 = parray.length; j < len1; j += 3) {
          parray[j + 2] += alt
          parray[j] += _v.x
          parray[j + 1] += _v.y
          parray[j + 2] += _v.z
        }

        geometries.push(buffGeom)
        var bar = new Bar(coordinate, opts, material, layer)
        bars.push(bar)
        var faceLen = buffGeom.index.count / 3
        faceMap[i] = [faceIndex + 1, faceIndex + faceLen]
        faceIndex += faceLen
        var psCount = buffGeom.attributes.position.count,
          //  colorCount = buffGeom.attributes.color.count,
          normalCount = buffGeom.attributes.normal.count,
          uvCount = buffGeom.attributes.uv.count
        geometriesAttributes[i] = {
          position: {
            count: psCount,
            start: psIndex,
            end: psIndex + psCount * 3
          },
          normal: {
            count: normalCount,
            start: normalIndex,
            end: normalIndex + normalCount * 3
          },
          // color: {
          //     count: colorCount,
          //     start: colorIndex,
          //     end: colorIndex + colorCount * 3,
          // },
          uv: {
            count: uvCount,
            start: uvIndex,
            end: uvIndex + uvCount * 2
          },
          hide: false
        }
        psIndex += psCount * 3
        normalIndex += normalCount * 3 // colorIndex += colorCount * 3;

        uvIndex += uvCount * 2
      }

      _this = _MergedMixin.call(this) || this
      options = maptalks__namespace.Util.extend(
        {},
        {
          altitude: 0,
          layer: layer,
          points: points
        },
        options
      )

      _this._initOptions(options)

      var geometry = mergeBarGeometry(geometries)

      _this._createMesh(geometry, material)

      var altitude = options.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = centerPt.clone()
      v.z = z

      _this.getObject3d().position.copy(v)

      _this._faceMap = faceMap
      _this._baseObjects = bars
      _this._datas = points
      _this._geometriesAttributes = geometriesAttributes
      _this.faceIndex = null
      _this._geometryCache = geometry.clone()
      _this.isHide = false
      _this._colorMap = {}

      _this._initBaseObjectsEvent(bars)

      _this._setPickObject3d()

      _this._init()

      _this.type = 'Bars'
      return _this
    } // eslint-disable-next-line no-unused-vars

    var _proto = Bars.prototype

    _proto.identify = function identify () {
      return this.picked
    }

    return Bars
  })(MergedMixin(BaseObject))

  var OPTIONS$9 = {
    width: 3,
    height: 1,
    altitude: 0,
    topColor: null,
    bottomColor: '#2d2f61'
  }

  var ExtrudeLines = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(ExtrudeLines, _MergedMixin)

    function ExtrudeLines (lineStrings, options, material, layer) {
      var _this

      if (!Array.isArray(lineStrings)) {
        lineStrings = [lineStrings]
      }

      var centers = [],
        lineStringList = []
      var len = lineStrings.length

      for (var i = 0; i < len; i++) {
        var lineString = lineStrings[i]
        var result = LineStringSplit(lineString)
        centers.push(result.center)
        lineStringList.push(result.lineStrings)
      } // Get the center point of the point set

      var center = getCenterOfPoints(centers)
      options = maptalks__namespace.Util.extend({}, OPTIONS$9, options, {
        layer: layer,
        lineStrings: lineStrings,
        coordinate: center
      })
      var _options = options,
        altitude = _options.altitude,
        topColor = _options.topColor,
        bottomColor = _options.bottomColor,
        asynchronous = _options.asynchronous
      var bufferGeometry
      var faceMap = [],
        extrudeLines = [],
        geometriesAttributes = []
      _this = _MergedMixin.call(this) || this

      if (asynchronous) {
        bufferGeometry = getDefaultBufferGeometry()
        ExtrudeLinesTaskIns.push({
          id: maptalks__namespace.Util.GUID(),
          layer: layer,
          key: options.key,
          center: center,
          data: lineStringList,
          lineStrings: lineStrings,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        var geometries = []
        var faceIndex = 0,
          _faceMap = [],
          psIndex = 0,
          normalIndex = 0
        var cache = {}

        for (var _i = 0; _i < len; _i++) {
          var _lineString = lineStrings[_i]
          var opts = maptalks__namespace.Util.extend(
            {},
            OPTIONS$9,
            isGeoJSON(_lineString)
              ? _lineString['properties']
              : _lineString.getProperties(),
            {
              index: _i
            }
          )
          var height = opts.height,
            width = opts.width,
            bottomHeight = opts.bottomHeight
          var w = distanceToVector3(width, layer, cache)
          var h = distanceToVector3(height, layer, cache)
          var lls = lineStringList[_i]
          var extrudeParams = []
          var minZ = 0

          for (var m = 0, le = lls.length; m < le; m++) {
            var attribute = getExtrudeLineParams(lls[m], w, h, layer, center)
            minZ = setBottomHeight(attribute, bottomHeight, layer, cache)
            extrudeParams.push(attribute)
          }

          var buffGeom = mergeBufferGeometriesAttribute(extrudeParams)
          geometries.push(buffGeom) // const extrudeLine = new ExtrudeLine(lineString, opts, material, layer);
          // extrudeLines.push(extrudeLine);

          var position = buffGeom.position,
            normal = buffGeom.normal,
            indices = buffGeom.indices
          var faceLen = indices.length / 3
          _faceMap[_i] = [faceIndex + 1, faceIndex + faceLen]
          faceIndex += faceLen
          var psCount = position.length / 3,
            //  colorCount = buffGeom.attributes.color.count,
            normalCount = normal.length / 3
          geometriesAttributes[_i] = {
            position: {
              middleZ: minZ + h / 2,
              count: psCount,
              start: psIndex,
              end: psIndex + psCount * 3
            },
            normal: {
              count: normalCount,
              start: normalIndex,
              end: normalIndex + normalCount * 3
            },
            // color: {
            //     count: colorCount,
            //     start: colorIndex,
            //     end: colorIndex + colorCount * 3,
            // },
            // uv: {
            //     count: uvCount,
            //     start: uvIndex,
            //     end: uvIndex + uvCount * 2,
            // },
            hide: false
          }
          psIndex += psCount * 3
          normalIndex += normalCount * 3 // colorIndex += colorCount * 3;
          // uvIndex += uvCount * 2;
        }

        bufferGeometry = mergeBufferGeometries(geometries)

        if (topColor) {
          initVertexColors(
            bufferGeometry,
            bottomColor,
            topColor,
            geometriesAttributes
          )
          material.vertexColors = getVertexColors()
        }
      }

      _this._initOptions(options)

      _this._createMesh(bufferGeometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v) //Face corresponding to monomer

      _this._faceMap = faceMap
      _this._baseObjects = extrudeLines
      _this._datas = lineStrings
      _this._geometriesAttributes = geometriesAttributes
      _this.faceIndex = null
      _this._geometryCache = bufferGeometry.clone()
      _this.isHide = false
      _this._colorMap = {}

      _this._initBaseObjectsEvent(extrudeLines)

      if (!asynchronous) {
        _this._setPickObject3d()

        _this._init()
      }

      _this.type = 'ExtrudeLines'
      return _this
    } // eslint-disable-next-line consistent-return

    var _proto = ExtrudeLines.prototype

    _proto.getSelectMesh = function getSelectMesh () {
      var index = this._getIndex()

      if (index != null) {
        if (!this._baseObjects[index]) {
          var lineString = this._datas[index]
          var opts = Object.assign(
            {},
            this.options,
            isGeoJSONLine(lineString)
              ? lineString.properties
              : lineString.getProperties(),
            {
              index: index
            }
          )
          this._baseObjects[index] = new ExtrudeLine(
            lineString,
            opts,
            this.getObject3d().material,
            this.getLayer()
          )

          this._proxyEvent(this._baseObjects[index])
        }

        return {
          data: this._datas[index],
          baseObject: this._baseObjects[index]
        }
      }
    } // eslint-disable-next-line no-unused-vars

    _proto.identify = function identify (coordinate) {
      return this.picked
    }

    _proto._workerLoad = function _workerLoad (result) {
      var faceMap = result.faceMap,
        geometriesAttributes = result.geometriesAttributes
      this._faceMap = faceMap
      this._geometriesAttributes = geometriesAttributes
      var bufferGeometry = generateBufferGeometry(result)
      this._geometryCache = generatePickBufferGeometry(bufferGeometry)

      var _this$getOptions = this.getOptions(),
        topColor = _this$getOptions.topColor,
        bottomColor = _this$getOptions.bottomColor
      _this$getOptions.bottomHeight
      _this$getOptions.height

      var object3d = this.getObject3d()
      var material = object3d.material

      if (topColor) {
        initVertexColors(
          bufferGeometry,
          bottomColor,
          topColor,
          geometriesAttributes
        )
        material.vertexColors = getVertexColors()
      }

      this.getObject3d().geometry = bufferGeometry
      this.getObject3d().material.needsUpdate = true

      this._setPickObject3d()

      this._init()

      if (this.isAdd) {
        var pick = this.getLayer().getPick()
        pick.add(this.pickObject3d)
      }

      this._fire('workerload', {
        target: this
      })
    }

    return ExtrudeLines
  })(MergedMixin(BaseObject))

  var OPTIONS$8 = {
    altitude: 0,
    colors: null
  }
  /**
   *
   */

  var Lines = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(Lines, _MergedMixin)

    function Lines (lineStrings, options, material, layer) {
      var _this

      if (!Array.isArray(lineStrings)) {
        lineStrings = [lineStrings]
      }

      var centers = [],
        lineStringList = []
      var len = lineStrings.length

      for (var i = 0; i < len; i++) {
        var lineString = lineStrings[i]
        var result = LineStringSplit(lineString)
        centers.push(result.center)
        lineStringList.push(result.lineStrings)
      } // Get the center point of the point set

      var center = getCenterOfPoints(centers)
      options = maptalks__namespace.Util.extend({}, OPTIONS$8, options, {
        layer: layer,
        lineStrings: lineStrings,
        coordinate: center
      })
      _this = _MergedMixin.call(this) || this

      _this._initOptions(options)

      var _options = options,
        asynchronous = _options.asynchronous
      var geometry
      var lines = [],
        cache = {}
      var faceIndex = 0,
        faceMap = [],
        geometriesAttributes = [],
        psIndex = 0,
        positionList = []

      if (asynchronous) {
        geometry = getDefaultLineGeometry()
        LinesTaskIns.push({
          id: maptalks__namespace.Util.GUID(),
          layer: layer,
          key: options.key,
          center: center,
          data: lineStringList,
          lineStrings: lineStrings,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        for (var _i = 0; _i < len; _i++) {
          var lls = lineStringList[_i]
          var psCount = 0

          for (var m = 0, le = lls.length; m < le; m++) {
            var properties = isGeoJSONLine(lls[m])
              ? lls[m]['properties']
              : lls[m].getProperties() || {}

            var _getLinePosition = getLinePosition(
                lls[m],
                layer,
                center,
                false
              ),
              positions = _getLinePosition.positions

            setBottomHeight(positions, properties.bottomHeight, layer, cache)
            psCount += (positions.length / 3) * 2 - 2
            positionList.push(getLineSegmentPosition(positions))
          } // const line = new Line(lineString, opts, material, layer);
          // lines.push(line);
          // const psCount = positionsV.length + positionsV.length - 2;

          var faceLen = psCount
          faceMap[_i] = [faceIndex, faceIndex + faceLen]
          faceIndex += faceLen
          geometriesAttributes[_i] = {
            position: {
              count: psCount,
              start: psIndex,
              end: psIndex + psCount * 3
            },
            hide: false
          }
          psIndex += psCount * 3
        }

        var position = mergeLinePositions(positionList)
        geometry = new THREE__namespace.BufferGeometry()
        addAttribute(
          geometry,
          'position',
          new THREE__namespace.BufferAttribute(position, 3)
        )
      }

      _this._createLineSegments(geometry, material)

      var _options2 = options,
        altitude = _options2.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      _this._faceMap = faceMap
      _this._baseObjects = lines
      _this._datas = lineStrings
      _this._geometriesAttributes = geometriesAttributes
      _this.faceIndex = null
      _this.index = null
      _this._geometryCache = geometry.clone()
      _this.isHide = false
      _this._colorMap = {}

      _this._initBaseObjectsEvent(lines)

      if (!asynchronous) {
        _this._setPickObject3d()

        _this._init()
      }

      _this.type = 'Lines'
      return _this
    } // eslint-disable-next-line consistent-return

    var _proto = Lines.prototype

    _proto.getSelectMesh = function getSelectMesh () {
      var index = this._getIndex()

      if (index != null) {
        if (!this._baseObjects[index]) {
          var lineString = this._datas[index]
          var opts = maptalks__namespace.Util.extend(
            {},
            this.getOptions(),
            {
              index: index
            },
            isGeoJSONLine(lineString)
              ? lineString.properties
              : lineString.getProperties()
          )
          this._baseObjects[index] = new Line(
            lineString,
            opts,
            this.getObject3d().material,
            this.getLayer()
          )

          this._proxyEvent(this._baseObjects[index])
        }

        return {
          data: this._datas[index],
          baseObject: this._baseObjects[index]
        }
      }
    }

    _proto._setPickObject3d = function _setPickObject3d () {
      if (!this._colorMap) {
        return
      }

      var geometry = this._geometryCache || this.getObject3d().geometry.clone()
      var pick = this.getLayer().getPick()
      var _geometriesAttributes = this._geometriesAttributes
      var len = _geometriesAttributes.length
      var colors = getGeometriesColorArray(_geometriesAttributes)
      var cIndex = 0

      for (var i = 0; i < len; i++) {
        var _color = pick.getColor()

        var _colorIndex = _color.getHex()

        this._colorMap[_colorIndex] = i
        var count = _geometriesAttributes[i].position.count
        this._datas[i].colorIndex = _colorIndex

        for (var j = 0; j < count; j++) {
          colors[cIndex] = _color.r
          colors[cIndex + 1] = _color.g
          colors[cIndex + 2] = _color.b
          cIndex += 3
        }
      }

      addAttribute(
        geometry,
        'color',
        new THREE__namespace.BufferAttribute(colors, 3, true)
      )
      var material = this.getObject3d().material.clone()
      material.color.set('#fff')
      material.vertexColors = getVertexColors()
      var color = pick.getColor()
      var colorIndex = color.getHex()
      var mesh = new THREE__namespace.LineSegments(geometry, material)
      mesh.position.copy(this.getObject3d().position)
      mesh['_colorIndex'] = colorIndex
      this.setPickObject3d(mesh)
    } // eslint-disable-next-line no-unused-vars

    _proto.identify = function identify (coordinate) {
      return this.picked
    }

    _proto._workerLoad = function _workerLoad (result) {
      var position = result.position,
        faceMap = result.faceMap,
        geometriesAttributes = result.geometriesAttributes
      this._faceMap = faceMap
      this._geometriesAttributes = geometriesAttributes
      var geometry = new THREE__namespace.BufferGeometry()
      addAttribute(
        geometry,
        'position',
        new THREE__namespace.BufferAttribute(new Float32Array(position), 3)
      )

      this._computeLineDistances(geometry)

      this._geometryCache = geometry.clone()
      this.getObject3d().geometry = geometry
      this.getObject3d().material.needsUpdate = true

      this._setPickObject3d()

      this._init()

      if (this.isAdd) {
        var pick = this.getLayer().getPick()
        pick.add(this.pickObject3d)
      }

      this._fire('workerload', {
        target: this
      })
    }

    return Lines
  })(MergedMixin(BaseObject))

  /*

  Global sharing

  */
  //Maximum concurrent
  var MAX = 10
  var waitingQueue = []
  var currentQueue = []
  function getQueues () {
    return {
      waitingQueue: waitingQueue,
      currentQueue: currentQueue
    }
  }
  /**
   *
   * @param {*} key
   * @param {*} url
   * @param {*} callback
   * @param {*} img
   * @param {*} vt
   */

  function pushQueue (key, url, callback, img, vt) {
    // url += `?key=${key}`;
    var q = {
      key: key,
      url: url,
      callback: callback,
      img: img,
      vt: vt
    }

    if (currentQueue.length < MAX) {
      currentQueue.push(q)
      vt.loopMessage(q)
    } else {
      waitingQueue.push(q)
    }
  }
  /**
   *
   * @param {*} index
   */

  function outQueue (index) {
    var callback = deleteQueueItem(waitingQueue, index)

    if (callback) {
      callback(index)
    }
  }
  /**
   *
   * @param {*} queArray
   * @param {*} index
   */

  function deleteQueueItem (queArray, index) {
    for (var i = 0, len = queArray.length; i < len; i++) {
      var q = queArray[i]

      if (q) {
        var key = q.key,
          callback = q.callback

        if (index === key) {
          queArray.splice(i, 1)
          return callback
        }
      }
    }

    return null
  }
  /**
   *
   * @param {*} key
   * @param {*} vt
   */

  function nextLoop (key, vt) {
    deleteQueueItem(currentQueue, key)

    if (waitingQueue.length) {
      currentQueue.push(waitingQueue[0])
      waitingQueue.splice(0, 1)
      var last = currentQueue[currentQueue.length - 1]
      vt.loopMessage(last)
    }
  }

  var canvas$1 = document.createElement('canvas')
  var SIZE = 256
  canvas$1.width = canvas$1.height = SIZE
  var DEFAULT_IMAGE
  function generateImage$1 (key, debug) {
    if (DEFAULT_IMAGE) {
      return DEFAULT_IMAGE
    }

    var ctx = canvas$1.getContext('2d')
    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.save()
    DEFAULT_IMAGE = canvas$1.toDataURL()
    return DEFAULT_IMAGE
  }
  function createCanvas (width, height) {
    if (width === void 0) {
      width = 1
    }

    if (height === void 0) {
      height = 1
    }

    var canvas

    if (typeof document === 'undefined');
    else {
      canvas = document.createElement('canvas')

      if (width) {
        canvas.width = width
      }

      if (height) {
        canvas.height = height
      }
    }

    return canvas
  }

  /**
   *
   */

  var BaseVectorTileLayer = /*#__PURE__*/ (function (_maptalks$TileLayer) {
    _inheritsLoose(BaseVectorTileLayer, _maptalks$TileLayer)

    function BaseVectorTileLayer (url, options) {
      var _this

      if (options === void 0) {
        options = {}
      }

      _this =
        _maptalks$TileLayer.call(
          this,
          maptalks__namespace.Util.GUID(),
          maptalks__namespace.Util.extend(
            {
              urlTemplate: url
            },
            options
          )
        ) || this
      _this._opts = null
      _this._layer = null
      _this.material = null
      _this.getMaterial = null
      _this._baseObjectKeys = {}
      _this._loadTiles = {}
      _this._add = null
      _this._layerLaodTime = new Date().getTime()
      return _this
    }

    var _proto = BaseVectorTileLayer.prototype

    _proto.isAsynchronous = function isAsynchronous () {
      return this._opts.worker
    }
    /**
     *get current all baseobject
     */

    _proto.getBaseObjects = function getBaseObjects () {
      var loadTiles = this._loadTiles
      var baseos = []

      for (var key in loadTiles) {
        var baseobjects = this._baseObjectKeys[key]

        if (baseobjects && Array.isArray(baseobjects) && baseobjects.length) {
          for (var i = 0, len = baseobjects.length; i < len; i++) {
            baseos.push(baseobjects[i])
          }
        }
      }

      return baseos
    }
    /**
     * This method should be overridden for event handling
     * @param {*} type
     * @param {*} e
     */
    // eslint-disable-next-line no-unused-vars

    _proto.onSelectMesh = function onSelectMesh (type, e) {}
    /**
     * this is can override
     * @param {*} index
     * @param {*} json
     */
    // eslint-disable-next-line no-unused-vars

    _proto.formatBaseObjects = function formatBaseObjects (index, json) {
      return []
    } //queue loop
    // eslint-disable-next-line no-unused-vars

    _proto.loopMessage = function loopMessage (q) {}
    /**
     *
     * @param {*} q
     */

    _proto.getTileData = function getTileData (q) {
      var key = q.key,
        url = q.url,
        callback = q.callback,
        img = q.img
      maptalks__namespace.Ajax.getJSON(url, {}, function (error, res) {
        if (error) {
          console.error(error)
          callback(key, null, img)
        } else {
          callback(key, res, img)
        }
      })
    }

    _proto._getCurentTileKeys = function _getCurentTileKeys () {
      var tileGrids = this.getTiles().tileGrids || []
      var keys = [],
        keysMap = {}

      for (var i = 0, len = tileGrids.length; i < len; i++) {
        var d = tileGrids[i]
        var tiles = d.tiles || []

        for (var j = 0, len1 = tiles.length; j < len1; j++) {
          var id = tiles[j].id
          keys.push(id)
          keysMap[id] = true
        }
      }

      return {
        keys: keys,
        keysMap: keysMap
      }
    }

    _proto._isLoad = function _isLoad () {
      var _this$_getCurentTileK = this._getCurentTileKeys(),
        keys = _this$_getCurentTileK.keys

      var keys1 = Object.keys(this._renderer.tilesInView)

      if (keys.length === keys1.length) {
        return true
      }

      return false
    }

    _proto._layerOnLoad = function _layerOnLoad () {
      // This event will be triggered multiple times per unit time
      var time = new Date().getTime()
      var offsetTime = time - this._layerLaodTime

      if (offsetTime < 20) {
        return
      }

      this._layerLaodTime = time
      var tilesInView = this._renderer.tilesInView,
        loadTiles = this._loadTiles,
        threeLayer = this._layer,
        keys = this._baseObjectKeys
      var tilesInViewLen = Object.keys(tilesInView).length,
        loadTilesLen = Object.keys(loadTiles).length
      var needsRemoveBaseObjects = []

      if (tilesInViewLen && loadTilesLen) {
        for (var index in loadTiles) {
          if (!tilesInView[index]) {
            if (keys[index]) {
              ;(keys[index] || []).forEach(function (baseobject) {
                needsRemoveBaseObjects.push(baseobject)
              })
            }
          }
        }
      }

      if (needsRemoveBaseObjects.length) {
        threeLayer.removeMesh(needsRemoveBaseObjects, false)
      }

      if (tilesInViewLen && loadTilesLen) {
        for (var _index in tilesInView) {
          if (!loadTiles[_index]) {
            if (keys[_index]) {
              var baseobject = keys[_index]
              threeLayer.addMesh(baseobject)
            } else {
              var _this$_getXYZOfIndex = this._getXYZOfIndex(_index),
                x = _this$_getXYZOfIndex.x,
                y = _this$_getXYZOfIndex.y,
                z = _this$_getXYZOfIndex.z

              this.getTileUrl(x, y, z)
            }
          }
        }
      }

      this._loadTiles = Object.assign({}, tilesInView)

      this._diffCache()
    }

    _proto._init = function _init () {}

    _proto._workerLoad = function _workerLoad (e) {
      var baseobject = e.target
      var img = baseobject._img
      img.currentCount++

      if (img.currentCount === img.needCount) {
        img.src = generateImage$1(img._key, this._opts.debug)
      }
    }

    _proto._generateBaseObjects = function _generateBaseObjects (
      index,
      res,
      img
    ) {
      var _this2 = this

      if (res && img) {
        var _this$_getCurentTileK2 = this._getCurentTileKeys(),
          keysMap = _this$_getCurentTileK2.keysMap //not in current ,ignore

        if (!keysMap[index]) {
          img.src = generateImage$1(index, this._opts.debug)
          return
        }

        var baseobjects = this.formatBaseObjects(index, res)

        if (baseobjects.length) {
          img.needCount = baseobjects.length
          img.currentCount = 0

          for (var i = 0, len = baseobjects.length; i < len; i++) {
            var baseobject = baseobjects[i]
            baseobject._img = img
            baseobject._vt = this

            if (!this.isVisible()) {
              baseobject.hide()
            }

            this._cachetile(index, baseobject)

            if (!baseobject.isAsynchronous()) {
              img.currentCount++
            }
          }

          this._layer.addMesh(baseobjects, false)

          if (img.needCount === img.currentCount) {
            img.src = generateImage$1(index, this._opts.debug)
          }

          if (this.isAsynchronous()) {
            baseobjects
              .filter(function (baseobject) {
                return baseobject.isAsynchronous()
              })
              .forEach(function (baseobject) {
                baseobject.on('workerload', _this2._workerLoad, _this2)
              })
          } else {
            img.src = generateImage$1(index, this._opts.debug)
          }
        } else {
          img.src = generateImage$1(index, this._opts.debug)
        }

        this._loadTiles[index] = true
      } else if (img) {
        img.src = generateImage$1(index, this._opts.debug)
      }
    }

    _proto._diffCache = function _diffCache () {
      var _this3 = this

      // if (this._layer.getMap().isInteracting()) {
      //     return;
      // }
      if (
        Object.keys(this._baseObjectKeys).length > this._renderer.tileCache.max
      ) {
        ;(function () {
          var tileCache = _this3._renderer.tileCache.data
          var tilesInView = _this3._renderer.tilesInView
          var needsRemoveBaseObjects = []

          for (var index in _this3._baseObjectKeys) {
            if (!tileCache[index] && !tilesInView[index]) {
              ;(_this3._baseObjectKeys[index] || []).forEach(function (
                baseobject
              ) {
                if (baseobject.isAdd) {
                  needsRemoveBaseObjects.push(baseobject)
                }
              })

              _this3._diposeBaseObject(index)

              delete _this3._baseObjectKeys[index]
            }
          } // Batch deletion can have better performance

          if (needsRemoveBaseObjects.length) {
            _this3._layer.removeMesh(needsRemoveBaseObjects, false)
          }
        })()
      }
    }

    _proto._diposeBaseObject = function _diposeBaseObject (index) {
      var baseobjects = this._baseObjectKeys[index]

      if (baseobjects && baseobjects.length) {
        baseobjects.forEach(function (baseobject) {
          baseobject.getObject3d().geometry.dispose()

          if (baseobject._geometryCache) {
            baseobject._geometryCache.dispose()
          }

          var bos = baseobject._baseObjects

          if (bos && bos.length) {
            bos.forEach(function (bo) {
              bo.getObject3d().geometry.dispose()
              bo = null
            })
          }

          baseobject._datas = null
          baseobject._geometriesAttributes = null
          baseobject._faceMap = null
          baseobject._colorMap = null

          if (baseobject.pickObject3d) {
            baseobject.pickObject3d.geometry.dispose() // baseobject.pickObject3d.material.dispose();
          }

          baseobject = null
        })
      }
    }

    _proto._cachetile = function _cachetile (index, baseobject) {
      if (!this._baseObjectKeys[index]) {
        this._baseObjectKeys[index] = []
      }

      this._baseObjectKeys[index].push(baseobject)
    }

    _proto._getXYZOfIndex = function _getXYZOfIndex (index) {
      var splitstr = index.indexOf('_') > -1 ? '_' : '-'

      var _index$split$slice = index.split(splitstr).slice(1, 4),
        y = _index$split$slice[0],
        x = _index$split$slice[1],
        z = _index$split$slice[2]

      var x1 = parseInt(x)
      var y1 = parseInt(y)
      var z1 = parseInt(z)
      return {
        x: x1,
        y: y1,
        z: z1
      }
    }

    _proto._getTileExtent = function _getTileExtent (x, y, z) {
      var map = this.getMap(),
        res = map._getResolution(z),
        tileConfig = this._getTileConfig(),
        tileExtent = tileConfig.getTilePrjExtent(x, y, res)

      return tileExtent
    }
    /**
     *
     * @param {} x
     * @param {*} y
     * @param {*} z
     */

    _proto._getTileLngLatExtent = function _getTileLngLatExtent (x, y, z) {
      var tileExtent = this._getTileExtent(x, y, z)

      var max = tileExtent.getMax(),
        min = tileExtent.getMin()
      var map = this.getMap()
      var projection = map.getProjection()
      min = projection.unproject(min)
      max = projection.unproject(max)
      return new maptalks__namespace.Extent(min, max)
    }

    return BaseVectorTileLayer
  })(maptalks__namespace.TileLayer)

  var OPTIONS$7 = {
    worker: false
  }
  /**
   *Provide a simple data loading layer with large amount of data
   */

  var ThreeVectorTileLayer = /*#__PURE__*/ (function (_BaseVectorTileLayer) {
    _inheritsLoose(ThreeVectorTileLayer, _BaseVectorTileLayer)

    function ThreeVectorTileLayer (url, options, getMaterial, layer) {
      var _this

      if (options === void 0) {
        options = {}
      }

      _this =
        _BaseVectorTileLayer.call(
          this,
          maptalks__namespace.Util.GUID(),
          maptalks__namespace.Util.extend(
            {
              urlTemplate: url
            },
            OPTIONS$7,
            options
          )
        ) || this
      _this._opts = options
      _this._layer = layer
      _this.getMaterial = getMaterial
      _this._baseObjectKeys = {}
      _this._loadTiles = {}
      _this._add = null
      _this._layerLaodTime = new Date().getTime()

      _this._init()

      return _this
    }
    /**
     * this is can override
     * @param {*} index
     * @param {*} json
     */

    var _proto = ThreeVectorTileLayer.prototype

    _proto.formatBaseObjects = function formatBaseObjects (index, json) {
      var opts = this._opts,
        baseobjects = []
      var asynchronous = this.isAsynchronous()

      for (var layerName in json) {
        var geojson = json[layerName] || {}
        var features = void 0

        if (Array.isArray(geojson)) {
          features = geojson
        } else if (geojson.type === 'FeatureCollection') {
          features = geojson.features
        }

        if (features && features.length) {
          var polygons = [],
            lineStrings = [],
            points = []

          for (var i = 0, len = features.length; i < len; i++) {
            var feature = features[i]

            if (isGeoJSONPolygon(feature)) {
              polygons.push(feature)
            } else if (isGeoJSONLine(feature)) {
              var fs = spliteGeoJSONMulti(feature)

              for (var j = 0, len1 = fs.length; j < len1; j++) {
                lineStrings.push(fs[j])
              }
            } else if (isGeoJSONPoint(feature)) {
              var _fs = spliteGeoJSONMulti(feature)

              for (var _j = 0, _len = _fs.length; _j < _len; _j++) {
                points.push(
                  maptalks__namespace.Util.extend(
                    {},
                    _fs[_j].properties,
                    _fs[_j],
                    {
                      coordinate: getGeoJSONCoordinates(_fs[_j])
                    }
                  )
                )
              }
            }
          }

          if (polygons.length) {
            var material = this._getMaterial(
              layerName,
              polygons,
              index,
              geojson
            )

            if (material) {
              var extrudepolygons = this._layer.toExtrudePolygons(
                polygons,
                maptalks__namespace.Util.extend(
                  {},
                  {
                    topColor: '#fff',
                    layerName: layerName,
                    asynchronous: asynchronous,
                    key: index
                  },
                  opts
                ),
                material
              )

              baseobjects.push(extrudepolygons)
            }
          }

          if (lineStrings.length) {
            var _material = this._getMaterial(
              layerName,
              lineStrings,
              index,
              geojson
            )

            if (
              _material &&
              (_material instanceof THREE__namespace.LineBasicMaterial ||
                _material instanceof THREE__namespace.LineDashedMaterial)
            ) {
              var lines = this._layer.toLines(
                lineStrings,
                maptalks__namespace.Util.extend(
                  {},
                  {
                    layerName: layerName,
                    asynchronous: asynchronous
                  },
                  opts
                ),
                _material
              )

              baseobjects.push(lines)
            }
          }

          if (points.length) {
            var _material2 = this._getMaterial(
              layerName,
              points,
              index,
              geojson
            )

            if (
              _material2 &&
              _material2 instanceof THREE__namespace.PointsMaterial
            ) {
              var ps = this._layer.toPoints(
                points,
                maptalks__namespace.Util.extend(
                  {},
                  {
                    layerName: layerName,
                    asynchronous: asynchronous
                  },
                  opts
                ),
                _material2
              )

              baseobjects.push(ps)
            }
          }
        }
      }

      return baseobjects
    } //queue loop

    _proto.loopMessage = function loopMessage (q) {
      var _getQueues = getQueues(),
        currentQueue = _getQueues.currentQueue

      if (currentQueue.length > 0) {
        this.getTileData(q)
      }
    }

    _proto._init = function _init () {
      var _this2 = this

      this.on('layerload', this._layerOnLoad)
      this.on('add', function () {
        if (_this2._add === false) {
          var baseobjects = _this2.getBaseObjects()

          _this2._layer.addMesh(baseobjects)
        }

        _this2._add = true
        /**
         * layerload have a bug ,Sometimes it doesn't trigger,I don't know why
         * Add heartbeat detection mechanism
         */

        _this2.intervalId = setInterval(function () {
          if (_this2._isLoad() && !_this2._layer.getMap().isInteracting()) {
            _this2.fire('layerload')
          }
        }, 1000)
      })
      this.on('remove', function () {
        _this2._add = false

        var baseobjects = _this2.getBaseObjects()

        _this2._layer.removeMesh(baseobjects)

        clearInterval(_this2.intervalId)
      })
      this.on('show', function () {
        var baseobjects = _this2.getBaseObjects()

        baseobjects.forEach(function (baseobject) {
          baseobject.show()
        })

        for (var key in _this2._baseObjectKeys) {
          var _baseobjects = _this2._baseObjectKeys[key] || []

          _baseobjects.forEach(function (baseobject) {
            baseobject.show()
          })
        }
      })
      this.on('hide', function () {
        var baseobjects = _this2.getBaseObjects()

        baseobjects.forEach(function (baseobject) {
          baseobject.hide()
        })

        for (var key in _this2._baseObjectKeys) {
          var _baseobjects2 = _this2._baseObjectKeys[key] || []

          _baseobjects2.forEach(function (baseobject) {
            baseobject.hide()
          })
        }
      })
      this.on('renderercreate', function (e) {
        e.renderer.loadTile = function loadTile (tile) {
          var tileSize = this.layer.getTileSize()
          var tileImage = new Image()
          tileImage.width = tileSize['width']
          tileImage.height = tileSize['height']
          tileImage.onload = this.onTileLoad.bind(this, tileImage, tile)
          tileImage.onerror = this.onTileError.bind(this, tileImage, tile)
          this.loadTileImage(tileImage, tile['url'], tile.id)
          return tileImage
        }

        e.renderer.deleteTile = function (tile) {
          if (!tile || !tile.image) {
            return
          }

          tile.image.onload = null
          tile.image.onerror = null
          var tileinfo = tile.info || {}
          outQueue(tileinfo.id)
        }

        e.renderer.loadTileImage = function (img, url, key) {
          img._key = key
          pushQueue(
            key,
            url,
            function (index, json, image) {
              // img.src = generateImage(key, this._opts.debug);
              _this2._generateBaseObjects(index, json, image)

              nextLoop(index, _this2)
            },
            img,
            _this2
          )
        }
      })
    }

    _proto._getMaterial = function _getMaterial (
      layerName,
      data,
      index,
      geojson
    ) {
      if (
        this.getMaterial &&
        maptalks__namespace.Util.isFunction(this.getMaterial)
      ) {
        return this.getMaterial(layerName, data, index, geojson)
      }

      return null
    }

    return ThreeVectorTileLayer
  })(BaseVectorTileLayer)

  function getPlaneGeometryAttribute (width, height, devideW, devideH) {
    var dx = width / devideW,
      dy = height / devideH
    var minX = -width / 2,
      maxY = height / 2,
      minY = -height / 2
    var len = (devideW + 1) * (devideH + 1)
    var position = new Float32Array(len * 3),
      uv = new Float32Array(len * 2),
      normal = new Float32Array(len * 3),
      tempIndex = new Uint32Array(len * 10)
    var index = 0,
      uIndex = 0,
      iIndex = 0

    for (var j = 0; j <= devideH; j++) {
      for (var i = 0; i <= devideW; i++) {
        var x = minX + dx * i
        var y = maxY - dy * j
        position[index] = x
        position[index + 1] = y
        position[index + 2] = 0
        normal[index] = 0
        normal[index + 1] = 0
        normal[index + 2] = 1
        var uvx = (x - minX) / width,
          uvy = (y - minY) / height
        uv[uIndex] = uvx
        uv[uIndex + 1] = uvy
        index += 3
        uIndex += 2

        if (i < devideW && j < devideH) {
          var a = j * (devideW + 1) + i,
            b = a + 1,
            c = (devideW + 1) * (j + 1) + i,
            d = c + 1
          tempIndex[iIndex] = a
          tempIndex[iIndex + 1] = c
          tempIndex[iIndex + 2] = b
          tempIndex[iIndex + 3] = c
          tempIndex[iIndex + 4] = d
          tempIndex[iIndex + 5] = b
          iIndex += 6
        }
      }
    }

    var indexArray = new Uint32Array(iIndex)

    for (var _i = 0, _len = indexArray.length; _i < _len; _i++) {
      indexArray[_i] = tempIndex[_i]
    }

    return {
      position: position,
      uv: uv,
      normal: normal,
      indexs: indexArray
    }
  }
  function getPlaneGeometry (width, height, devideW, devideH) {
    var _getPlaneGeometryAttr = getPlaneGeometryAttribute(
        width,
        height,
        devideW,
        devideH
      ),
      position = _getPlaneGeometryAttr.position,
      uv = _getPlaneGeometryAttr.uv,
      normal = _getPlaneGeometryAttr.normal,
      indexs = _getPlaneGeometryAttr.indexs

    var geometry = new THREE__namespace.BufferGeometry()
    addAttribute(
      geometry,
      'position',
      new THREE__namespace.BufferAttribute(position, 3)
    )
    addAttribute(
      geometry,
      'normal',
      new THREE__namespace.BufferAttribute(normal, 3)
    )
    addAttribute(geometry, 'uv', new THREE__namespace.BufferAttribute(uv, 2))
    geometry.setIndex(new THREE__namespace.BufferAttribute(indexs, 1))
    return geometry
  }

  var textureLoader = new THREE__namespace.TextureLoader()
  var canvas = document.createElement('canvas'),
    tileSize = 256

  function getRGBData (image, width, height) {
    if (width === void 0) {
      width = tileSize
    }

    if (height === void 0) {
      height = tileSize
    }

    canvas.width = width
    canvas.height = height
    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    return ctx.getImageData(0, 0, width, height).data
  }

  function generateImage (image) {
    if (!image) {
      return null
    }

    var img

    if (typeof image === 'string') {
      img = new Image()
      img.src = image
    } else if (image instanceof HTMLCanvasElement) {
      img = new Image()
      img.src = image.toDataURL()
    } else if (image instanceof Image) {
      img = new Image()
      img.src = image.src
      img.crossOrigin = image.crossOrigin
    }

    if (img && !img.crossOrigin) {
      img.crossOrigin = 'Anonymous'
    }

    return img
  }

  var OPTIONS$6 = {
    interactive: false,
    altitude: 0,
    image: null,
    imageWidth: 256,
    imageHeight: 256,
    texture: null
  }
  /**
   *
   */

  var Terrain = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(Terrain, _BaseObject)

    function Terrain (extent, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$6, options, {
        layer: layer,
        extent: extent
      })
      var _options = options,
        texture = _options.texture,
        image = _options.image,
        altitude = _options.altitude,
        imageHeight = _options.imageHeight,
        imageWidth = _options.imageWidth

      if (!image) {
        console.error('not find image')
      }

      if (!(extent instanceof maptalks__namespace.Extent)) {
        extent = new maptalks__namespace.Extent(extent)
      }

      var _extent = extent,
        xmin = _extent.xmin,
        ymin = _extent.ymin,
        xmax = _extent.xmax,
        ymax = _extent.ymax
      var coords = [
        [xmin, ymin],
        [xmin, ymax],
        [xmax, ymax],
        [xmax, ymin]
      ]
      var vxmin = Infinity,
        vymin = Infinity,
        vxmax = -Infinity,
        vymax = -Infinity
      coords.forEach(function (coord) {
        var v = layer.coordinateToVector3(coord)
        var x = v.x,
          y = v.y
        vxmin = Math.min(x, vxmin)
        vymin = Math.min(y, vymin)
        vxmax = Math.max(x, vxmax)
        vymax = Math.max(y, vymax)
      })
      var w = Math.abs(vxmax - vxmin),
        h = Math.abs(vymax - vymin)
      var rgbImg = generateImage(image),
        img = generateImage(texture) // const geometry = new THREE.PlaneBufferGeometry(w, h, imageWidth - 1, imageHeight - 1);

      var geometry = getPlaneGeometry(w, h, imageWidth - 1, imageHeight - 1)
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      _this._createMesh(geometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(extent.getCenter(), z)

      _this.getObject3d().position.copy(v)

      material.transparent = true

      if (rgbImg) {
        material.opacity = 0

        rgbImg.onload = function () {
          var width = imageWidth,
            height = imageHeight
          var imgdata = getRGBData(rgbImg, width, height)
          var idx = 0
          var cache = {} //rgb to height  https://docs.mapbox.com/help/troubleshooting/access-elevation-data/

          for (var i = 0, len = imgdata.length; i < len; i += 4) {
            var R = imgdata[i],
              G = imgdata[i + 1],
              B = imgdata[i + 2]

            var _height = -10000 + (R * 256 * 256 + G * 256 + B) * 0.1

            var _z = distanceToVector3(_height, layer, cache)

            geometry.attributes.position.array[idx * 3 + 2] = _z
            idx++
          }

          geometry.attributes.position.needsUpdate = true

          if (img) {
            textureLoader.load(img.src, function (texture) {
              material.map = texture
              material.opacity = 1
              material.needsUpdate = true
            })
          } else {
            material.opacity = 1
          }
        }

        rgbImg.onerror = function () {
          console.error('not load ' + rgbImg.src)
        }
      }

      _this.type = 'Terrain'
      return _this
    }

    return Terrain
  })(BaseObject)

  var OPTIONS$5 = {
    // worker: false
    scale: 1,
    tileDivisor: 4
  }
  /**
   *
   */

  var TerrainVectorTileLayer = /*#__PURE__*/ (function (_BaseVectorTileLayer) {
    _inheritsLoose(TerrainVectorTileLayer, _BaseVectorTileLayer)

    function TerrainVectorTileLayer (url, options, material, layer) {
      var _this

      if (options === void 0) {
        options = {}
      }

      _this =
        _BaseVectorTileLayer.call(
          this,
          maptalks__namespace.Util.GUID(),
          maptalks__namespace.Util.extend(
            {
              urlTemplate: url
            },
            OPTIONS$5,
            options
          )
        ) || this
      _this._opts = options
      _this._layer = layer
      _this.material = material
      _this._baseObjectKeys = {}
      _this._loadTiles = {}
      _this._add = null
      _this._imgQueue = {}
      _this._layerLaodTime = new Date().getTime()

      _this._init()

      return _this
    }

    var _proto = TerrainVectorTileLayer.prototype

    _proto.isAsynchronous = function isAsynchronous () {
      return false
    }
    /**
     * this is can override
     * @param {*} index
     * @param {*} json
     */

    _proto.formatBaseObjects = function formatBaseObjects (index, image) {
      var opts = this.options,
        baseobjects = []
      var scale = opts.scale,
        tileDivisor = opts.tileDivisor

      var _this$_getXYZOfIndex = this._getXYZOfIndex(index),
        x = _this$_getXYZOfIndex.x,
        y = _this$_getXYZOfIndex.y,
        z = _this$_getXYZOfIndex.z

      var zoom = this.getMap().getZoom()
      var texture = this.getTileUrl(x, y, z)
      var _this$options$tileSiz = this.options.tileSize,
        imageWidth = _this$options$tileSiz[0],
        imageHeight = _this$options$tileSiz[1]

      var extent = this._getTileLngLatExtent(x, y, z)

      var material = this.material.clone()

      if (z + 1 >= Math.round(zoom)) {
        var terrain = new Terrain(
          extent,
          {
            image: image,
            imageWidth: imageWidth / tileDivisor,
            imageHeight: imageHeight / tileDivisor,
            texture: texture
          },
          material,
          this._layer
        )
        terrain.getObject3d().scale.set(scale, scale, 1)
        baseobjects.push(terrain)
      }

      return baseobjects
    } //queue loop

    _proto.loopMessage = function loopMessage (q) {
      this.getTileData(q)
    }

    _proto._init = function _init () {
      var _this2 = this

      this.on('layerload', this._layerOnLoad)
      this.on('add', function () {
        if (_this2._add === false) {
          var baseobjects = _this2.getBaseObjects()

          _this2._layer.addMesh(baseobjects)
        }

        _this2._add = true
        /**
         * layerload have a bug ,Sometimes it doesn't trigger,I don't know why
         * Add heartbeat detection mechanism
         */

        _this2.intervalId = setInterval(function () {
          if (_this2._isLoad() && !_this2._layer.getMap().isInteracting()) {
            _this2.fire('layerload')
          }
        }, 1000)
      })
      this.on('remove', function () {
        _this2._add = false

        var baseobjects = _this2.getBaseObjects()

        _this2._layer.removeMesh(baseobjects)

        clearInterval(_this2.intervalId)
      })
      this.on('show', function () {
        var baseobjects = _this2.getBaseObjects()

        baseobjects.forEach(function (baseobject) {
          baseobject.show()
        })

        for (var key in _this2._baseObjectKeys) {
          var _baseobjects = _this2._baseObjectKeys[key] || []

          _baseobjects.forEach(function (baseobject) {
            baseobject.show()
          })
        }
      })
      this.on('hide', function () {
        var baseobjects = _this2.getBaseObjects()

        baseobjects.forEach(function (baseobject) {
          baseobject.hide()
        })

        for (var key in _this2._baseObjectKeys) {
          var _baseobjects2 = _this2._baseObjectKeys[key] || []

          _baseobjects2.forEach(function (baseobject) {
            baseobject.hide()
          })
        }
      })
      this.on('renderercreate', function (e) {
        e.renderer.loadTile = function loadTile (tile) {
          var tileSize = this.layer.getTileSize()
          var tileImage = new Image()
          tileImage.width = tileSize['width']
          tileImage.height = tileSize['height']
          tileImage.onload = this.onTileLoad.bind(this, tileImage, tile)
          tileImage.onerror = this.onTileError.bind(this, tileImage, tile)
          this.loadTileImage(tileImage, tile['url'], tile.id)
          return tileImage
        }

        e.renderer.deleteTile = function (tile) {
          if (!tile || !tile.image) {
            return
          }

          tile.image.onload = null
          tile.image.onerror = null
          var tileinfo = tile.info || {}
          var rgbImage = _this2._imgQueue[tileinfo.id]

          if (rgbImage) {
            rgbImage.src = ''
            rgbImage.onload = null
            rgbImage.onerror = null
            delete _this2._imgQueue[tileinfo.id]
          }
        }

        e.renderer.loadTileImage = function (img, url, key) {
          img._key = key
          var rgbImage = new Image()
          _this2._imgQueue[key] = rgbImage
          var q = {
            key: key,
            url: url,
            rgbImage: rgbImage,
            callback: function callback (index, rgbImage, image) {
              _this2._generateBaseObjects(index, rgbImage, image)
            },
            img: img,
            vt: _this2
          }

          _this2.loopMessage(q)
        }
      })
    }

    return TerrainVectorTileLayer
  })(BaseVectorTileLayer)

  /*!
   * Code from baidu mapv
   * License: BSD-3
   * https://github.com/huiyan-fe/mapv
   *
   */
  /**
   * Category
   * @param {Object} [options]   Available options:
   *                             {Object} gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"}
   */

  function Intensity (options) {
    options = options || {}
    this.gradient = options.gradient || {
      0.25: 'rgba(0, 0, 255, 1)',
      0.55: 'rgba(0, 255, 0, 1)',
      0.85: 'rgba(255, 255, 0, 1)',
      1.0: 'rgba(255, 0, 0, 1)'
    }
    this.maxSize = options.maxSize || 35
    this.minSize = options.minSize || 0
    this.max = options.max || 100
    this.min = options.min || 0
    this.initPalette()
  }

  Intensity.prototype.setMax = function (value) {
    this.max = value || 100
  }

  Intensity.prototype.setMin = function (value) {
    this.min = value || 0
  }

  Intensity.prototype.setMaxSize = function (maxSize) {
    this.maxSize = maxSize || 35
  }

  Intensity.prototype.setMinSize = function (minSize) {
    this.minSize = minSize || 0
  }

  Intensity.prototype.initPalette = function () {
    var gradient = this.gradient
    var canvas = createCanvas(256, 1)
    var paletteCtx = (this.paletteCtx = canvas.getContext('2d'))
    var lineGradient = paletteCtx.createLinearGradient(0, 0, 256, 1)

    for (var key in gradient) {
      lineGradient.addColorStop(parseFloat(key), gradient[key])
    }

    paletteCtx.fillStyle = lineGradient
    paletteCtx.fillRect(0, 0, 256, 1)
  }

  Intensity.prototype.getColor = function (value) {
    var imageData = this.getImageData(value)
    return (
      'rgba(' +
      imageData[0] +
      ', ' +
      imageData[1] +
      ', ' +
      imageData[2] +
      ', ' +
      imageData[3] / 256 +
      ')'
    )
  }

  Intensity.prototype.getImageData = function (value) {
    var imageData = this.paletteCtx.getImageData(0, 0, 256, 1).data

    if (value === undefined) {
      return imageData
    }

    var max = this.max
    var min = this.min

    if (value > max) {
      value = max
    }

    if (value < min) {
      value = min
    }

    var index = Math.floor(((value - min) / (max - min)) * (256 - 1)) * 4
    return [
      imageData[index],
      imageData[index + 1],
      imageData[index + 2],
      imageData[index + 3]
    ]
  }
  /**
   * @param Number value
   * @param Number max of value
   * @param Number max of size
   * @param Object other options
   */

  Intensity.prototype.getSize = function (value) {
    var size = 0
    var max = this.max
    var min = this.min
    var maxSize = this.maxSize
    var minSize = this.minSize

    if (value > max) {
      value = max
    }

    if (value < min) {
      value = min
    }

    if (max > min) {
      size = minSize + ((value - min) / (max - min)) * (maxSize - minSize)
    } else {
      return maxSize
    }

    return size
  }

  Intensity.prototype.getLegend = function (options) {
    var gradient = this.gradient
    var width = options.width || 20
    var height = options.height || 180
    var canvas = createCanvas(width, height)
    var paletteCtx = canvas.getContext('2d')
    var lineGradient = paletteCtx.createLinearGradient(0, height, 0, 0)

    for (var key in gradient) {
      lineGradient.addColorStop(parseFloat(key), gradient[key])
    }

    paletteCtx.fillStyle = lineGradient
    paletteCtx.fillRect(0, 0, width, height)
    return canvas
  }

  /*!
   * Code from baidu mapv
   * License: BSD-3
   * https://github.com/huiyan-fe/mapv
   *
   */

  function createCircle (size) {
    var shadowBlur = size / 2
    var r2 = size + shadowBlur
    var offsetDistance = 10000
    var circle = createCanvas(r2 * 2, r2 * 2)
    var context = circle.getContext('2d')
    context.shadowBlur = shadowBlur
    context.shadowColor = 'black'
    context.shadowOffsetX = context.shadowOffsetY = offsetDistance
    context.beginPath()
    context.arc(
      r2 - offsetDistance,
      r2 - offsetDistance,
      size,
      0,
      Math.PI * 2,
      true
    )
    context.closePath()
    context.fill()
    return circle
  }

  function colorize (pixels, gradient, options) {
    var max = getMax(options)
    var min = getMin(options)
    var diff = max - min
    var range = options.range || null
    var jMin = 0
    var jMax = 1024

    if (range && range.length === 2) {
      jMin = ((range[0] - min) / diff) * 1024
    }

    if (range && range.length === 2) {
      jMax = ((range[1] - min) / diff) * 1024
    }

    var maxOpacity = options.maxOpacity || 0.8
    var minOpacity = options.minOpacity || 0 // var range = options.range;

    for (var i = 3, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i] * 4 // get gradient color from opacity value

      if (pixels[i] / 256 > maxOpacity) {
        pixels[i] = 256 * maxOpacity
      }

      if (pixels[i] / 256 < minOpacity) {
        pixels[i] = 256 * minOpacity
      }

      if (j && j >= jMin && j <= jMax) {
        pixels[i - 3] = gradient[j]
        pixels[i - 2] = gradient[j + 1]
        pixels[i - 1] = gradient[j + 2]
      } else {
        pixels[i] = 0
      }
    }
  }

  function getMax (options) {
    var max = options.max || 100
    return max
  }

  function getMin (options) {
    var min = options.min || 0
    return min
  }

  function drawGray (context, dataSet, options) {
    var max = getMax(options) // var min = getMin(options);
    // console.log(max)

    var size = options._size || options.size || 13
    var circle = createCircle(size)
    var circleHalfWidth = circle.width / 2
    var circleHalfHeight = circle.height / 2
    var data = dataSet
    var dataOrderByAlpha = {}
    data.forEach(function (item) {
      var count = item.count === undefined ? 1 : item.count
      var alpha = Math.min(1, count / max).toFixed(2)
      dataOrderByAlpha[alpha] = dataOrderByAlpha[alpha] || []
      dataOrderByAlpha[alpha].push(item)
    })

    for (var i in dataOrderByAlpha) {
      if (isNaN(i)) continue
      var _data = dataOrderByAlpha[i]
      context.beginPath()

      if (!options.withoutAlpha) {
        context.globalAlpha = i
      } // context.strokeStyle = intensity.getColor(i * max);

      _data.forEach(function (item) {
        var coordinates = item.coordinate
        var count = item.count === undefined ? 1 : item.count
        context.globalAlpha = count / max
        context.drawImage(
          circle,
          coordinates[0] - circleHalfWidth,
          coordinates[1] - circleHalfHeight
        )
      })
    }
  }

  function draw (context, data, options) {
    if (context.canvas.width <= 0 || context.canvas.height <= 0) {
      return
    }

    var strength = options.strength || 0.3
    context.strokeStyle = 'rgba(0,0,0,' + strength + ')' // var shadowCanvas = new Canvas(context.canvas.width, context.canvas.height);

    var shadowCanvas = createCanvas(context.canvas.width, context.canvas.height)
    var shadowContext = shadowCanvas.getContext('2d')
    shadowContext.scale(devicePixelRatio, devicePixelRatio)
    options = options || {} // var data = dataSet instanceof DataSet ? dataSet.get() : dataSet;

    context.save()
    var intensity = new Intensity({
      gradient: options.gradient
    })
    drawGray(shadowContext, data, options) // return false;

    if (!options.absolute) {
      var colored = shadowContext.getImageData(
        0,
        0,
        context.canvas.width,
        context.canvas.height
      )
      colorize(colored.data, intensity.getImageData(), options)
      context.putImageData(colored, 0, 0)
      context.restore()
    }

    intensity = null
    shadowCanvas = null
  }

  var HeatMapUitl = {
    draw: draw,
    drawGray: drawGray,
    colorize: colorize
  }

  var OPTIONS$4 = {
    altitude: 0,
    interactive: false,
    min: 0,
    max: 100,
    size: 13,
    gradient: {
      0.25: 'rgb(0,0,255)',
      0.55: 'rgb(0,255,0)',
      0.85: 'yellow',
      1.0: 'rgb(255,0,0)'
    },
    gridScale: 0.5
  }
  var CANVAS_MAX_SIZE = 2048
  /**
   *
   */

  var HeatMap = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(HeatMap, _BaseObject)

    function HeatMap (data, options, material, layer) {
      var _this

      if (!Array.isArray(data)) {
        data = [data]
      }

      var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity
      var vs = [] //Calculate bbox

      for (var i = 0, len = data.length; i < len; i++) {
        var _data$i = data[i],
          coordinate = _data$i.coordinate,
          lnglat = _data$i.lnglat,
          xy = _data$i.xy
        var coord = coordinate || lnglat || xy

        if (!coord) {
          console.warn('not find coordinate')
          continue
        }

        var v = layer.coordinateToVector3(coord)
        vs.push(v)
        var x = v.x,
          y = v.y
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }

      options = maptalks__namespace.Util.extend({}, OPTIONS$4, options, {
        layer: layer,
        points: data
      }) // Calculate canvas width and height

      var _options = options,
        gridScale = _options.gridScale,
        altitude = _options.altitude
      var offsetX = Math.abs(maxX - minX),
        offsetY = Math.abs(maxY - minY)
      var maxOffset = Math.max(offsetX * gridScale, offsetY * gridScale)

      if (maxOffset > CANVAS_MAX_SIZE) {
        console.warn(
          'gridScale: ' +
            gridScale +
            " it's too big. I hope it's a smaller value,canvas max size is " +
            CANVAS_MAX_SIZE +
            '* ' +
            CANVAS_MAX_SIZE
        )
        var offset = maxOffset / gridScale
        gridScale = CANVAS_MAX_SIZE / offset
      }

      var canvasWidth = Math.ceil(offsetX * gridScale),
        canvasHeight = Math.ceil(offsetY * gridScale)
      var scaleX = canvasWidth / offsetX,
        scaleY = canvasHeight / offsetY
      var pixels = []

      for (var _i = 0, _len = vs.length; _i < _len; _i++) {
        var _v = vs[_i]
        _v.x -= minX
        _v.y -= minY
        _v.x *= scaleX
        _v.y *= scaleY
        _v.y = canvasHeight - _v.y //for heat draw data

        pixels.push({
          coordinate: [_v.x, _v.y],
          count: data[_i].count
        })
      }

      var shadowCanvas = createCanvas(canvasWidth, canvasHeight)
      var shadowContext = shadowCanvas.getContext('2d') // shadowContext.scale(devicePixelRatio, devicePixelRatio);

      HeatMapUitl.drawGray(shadowContext, pixels, options)
      var colored = shadowContext.getImageData(
        0,
        0,
        shadowContext.canvas.width,
        shadowContext.canvas.height
      )
      var maxAlpha = -Infinity
      var blackps = new Float32Array(colored.data.length / 4),
        alphas = new Float32Array(colored.data.length / 4)

      for (
        var _i2 = 3, _len2 = colored.data.length, j = 0;
        _i2 < _len2;
        _i2 += 4
      ) {
        var alpha = colored.data[_i2]
        maxAlpha = Math.max(maxAlpha, alpha)
        alphas[j] = alpha //Points that do not need to be drawn

        if (alpha <= 0) {
          blackps[j] = 1
        }

        j++
      }

      var intensity = new Intensity({
        gradient: options.gradient
      })
      HeatMapUitl.colorize(colored.data, intensity.getImageData(), options)
      shadowCanvas = null
      shadowContext = null // const geometry = new THREE.PlaneBufferGeometry(offsetX, offsetY, canvasWidth - 1, canvasHeight - 1);

      var geometry = getPlaneGeometry(
        offsetX,
        offsetY,
        canvasWidth - 1,
        canvasHeight - 1
      )
      var index = geometry.getIndex().array
      var position = geometry.attributes.position.array // Index of the points that really need to be drawn

      var colors = new Float32Array(position.length)
      var tempIndex = new Uint32Array(position.length * 6)
      var color = new THREE__namespace.Color()
      var iIndex = 0

      for (
        var _i3 = 0,
          _len3 = position.length,
          _j = 0,
          len1 = index.length,
          m = 0,
          len2 = colored.data.length,
          n = 0;
        _i3 < Math.max(_len3, len1, len2);
        _i3 += 3
      ) {
        if (_i3 < _len3) {
          var _alpha = alphas[n]

          if (_alpha > 0) {
            position[_i3 + 2] = _alpha / maxAlpha
          }
        }

        if (_j < len1) {
          var a = index[_j],
            b = index[_j + 1],
            c = index[_j + 2]

          if (!blackps[a] || !blackps[b] || !blackps[c]) {
            tempIndex[iIndex] = a
            tempIndex[iIndex + 1] = b
            tempIndex[iIndex + 2] = c
            iIndex += 3
          }
        }

        if (m < len2) {
          var r = colored.data[m],
            g = colored.data[m + 1],
            _b = colored.data[m + 2] // a = colored.data[i + 3];

          var rgb = 'rgb(' + r + ',' + g + ',' + _b + ')'
          color.setStyle(rgb)
          colors[_j] = color.r
          colors[_j + 1] = color.g
          colors[_j + 2] = color.b
        }

        _j += 3
        m += 4
        n++
      }

      var filterIndex = new Uint32Array(iIndex)

      for (var _i4 = 0; _i4 < iIndex; _i4++) {
        filterIndex[_i4] = tempIndex[_i4]
      }

      geometry.setIndex(new THREE__namespace.BufferAttribute(filterIndex, 1))
      addAttribute(
        geometry,
        'color',
        new THREE__namespace.BufferAttribute(colors, 3, true)
      )
      material.vertexColors = getVertexColors()
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      _this._createMesh(geometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x

      _this
        .getObject3d()
        .position.copy(
          new THREE__namespace.Vector3((minX + maxX) / 2, (minY + maxY) / 2, z)
        )

      _this.type = 'HeatMap'
      return _this
    }

    return HeatMap
  })(BaseObject)

  var color = new THREE__namespace.Color()
  var colorIndex = 1
  /**
   *https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_cubes_gpu.html
   */

  var GPUPick = /*#__PURE__*/ (function () {
    function GPUPick (layer) {
      this.object3ds = []
      this.layer = layer
      this.camera = layer.getCamera()
      this.renderer = layer.getThreeRenderer()
      this.pickingTexture = new THREE__namespace.WebGLRenderTarget(1, 1)
      this.pickingScene = new THREE__namespace.Scene()
    }

    var _proto = GPUPick.prototype

    _proto.getColor = function getColor () {
      color.setHex(colorIndex)
      colorIndex++
      return color
    }

    _proto.add = function add (object3d) {
      if (object3d) {
        var _colorIndex = object3d['_colorIndex']

        if (_colorIndex) {
          this.object3ds[_colorIndex] = object3d
          this.pickingScene.add(object3d)
        }
      }

      return this
    }

    _proto.remove = function remove (object3d) {
      if (object3d) {
        var _colorIndex2 = object3d['_colorIndex']

        if (_colorIndex2) {
          this.object3ds[_colorIndex2] = null
          this.pickingScene.remove(object3d)
        }
      }

      return this
    }

    _proto.isEmpty = function isEmpty () {
      if (this.pickingScene.children.length === 0) {
        return true
      }

      for (var i = 0, len = this.pickingScene.children.length; i < len; i++) {
        var mesh = this.pickingScene.children[i]

        if (mesh) {
          var object3d = mesh['__parent']

          if (object3d && object3d.getOptions().interactive === true) {
            return false
          }
        }
      }

      return true
    }

    _proto.pick = function pick (pixel) {
      if (!pixel) {
        return
      }

      if (this.isEmpty()) {
        return
      }

      var camera = this.camera,
        renderer = this.renderer,
        pickingTexture = this.pickingTexture,
        pickingScene = this.pickingScene,
        object3ds = this.object3ds,
        layer = this.layer
      var len = this.pickingScene.children.length // reset all object3d picked

      for (var i = 0; i < len; i++) {
        var _object3d = this.pickingScene.children[i]

        if (_object3d && _object3d['__parent']) {
          _object3d['__parent'].picked = false
        }
      } //resize size

      var _layer$_getRenderer$c = layer._getRenderer().canvas,
        width = _layer$_getRenderer$c.width,
        height = _layer$_getRenderer$c.height

      var pw = pickingTexture.width,
        ph = pickingTexture.height

      if (width !== pw || height !== ph) {
        pickingTexture.setSize(width, height)
      } //render the picking scene off-screen
      // set the view offset to represent just a single pixel under the mouse
      // camera.setViewOffset(width, height, mouse.x, mouse.y, 1, 1);
      // render the scene

      renderer.setRenderTarget(pickingTexture)
      renderer.clear()
      renderer.render(pickingScene, camera) // clear the view offset so rendering returns to normal
      // camera.clearViewOffset();
      //create buffer for reading single pixel

      var pixelBuffer = new Uint8Array(4) //read the pixel

      var x = pixel.x,
        y = pixel.y
      var devicePixelRatio = window.devicePixelRatio
      var offsetX = x * devicePixelRatio,
        offsetY = pickingTexture.height - y * devicePixelRatio
      renderer.readRenderTargetPixels(
        pickingTexture,
        Math.round(offsetX),
        Math.round(offsetY),
        1,
        1,
        pixelBuffer
      ) //interpret the pixel as an ID

      var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2]
      var object3d = object3ds[id]

      if (object3d) {
        if (object3d['__parent']) {
          object3ds[id]['__parent'].picked = true
        }
      } else {
        //for merged mesh
        for (var _i = 0; _i < len; _i++) {
          var _object3d2 = this.pickingScene.children[_i]

          if (_object3d2 && _object3d2['__parent']) {
            var parent = _object3d2['__parent']

            if (parent._colorMap && parent._colorMap[id] != null) {
              parent.picked = true
              parent.index = parent._colorMap[id]
              break
            }
          }
        }
      }

      renderer.setRenderTarget(null)
    }

    return GPUPick
  })()

  var OPTIONS$3 = {
    bottomHeight: 0,
    altitude: 0
  }

  var FatLine = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(FatLine, _BaseObject)

    function FatLine (lineString, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$3, options, {
        layer: layer,
        lineString: lineString
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _options = options,
        asynchronous = _options.asynchronous

      var _LineStringSplit = LineStringSplit(lineString),
        lineStrings = _LineStringSplit.lineStrings,
        center = _LineStringSplit.center

      var geometry = new LineGeometry()
      var position

      if (asynchronous) {
        var id = maptalks__namespace.Util.GUID()
        _this.getOptions().id = id
        _this.getOptions().center = center
        FatLineTaskIns.push({
          id: id,
          data: lineStrings,
          lineString: lineString,
          center: center,
          layer: layer,
          baseObject: _assertThisInitialized(_this)
        })
      } else {
        var positionList = [],
          cache = {}

        for (var m = 0, le = lineStrings.length; m < le; m++) {
          var positions = getLinePosition(lineStrings[m], layer, center, false)
            .positions
          setBottomHeight(positions, options.bottomHeight, layer, cache)
          positionList.push(getLineSegmentPosition(positions))
        }

        position = mergeLinePositions(positionList)
        geometry.setPositions(position)
      }

      _this._setMaterialRes(layer, material)

      _this._createLine2(geometry, material)

      var _options2 = options,
        altitude = _options2.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      if (!asynchronous) {
        _this._setPickObject3d(position, material.linewidth)

        _this._init()
      }

      _this.type = 'FatLine'
      return _this
    }

    var _proto = FatLine.prototype

    _proto._init = function _init () {
      var _this2 = this

      var pick = this.getLayer().getPick()
      this.on('add', function () {
        pick.add(_this2.pickObject3d)
      })
      this.on('remove', function () {
        pick.remove(_this2.pickObject3d)
      })
    }

    _proto._setMaterialRes = function _setMaterialRes (layer, material) {
      var map = layer.getMap()
      var size = map.getSize()
      var width = size.width,
        height = size.height
      material.resolution.set(width, height)
    }

    _proto._setPickObject3d = function _setPickObject3d (ps, linewidth) {
      // if (!this._colorMap) {
      //     return;
      // }
      var geometry = new LineGeometry()
      geometry.setPositions(ps)
      var pick = this.getLayer().getPick()
      var color = pick.getColor()
      var colors = []

      for (var i = 0, len = ps.length / 3; i < len; i++) {
        colors.push(color.r, color.g, color.b)
      }

      geometry.setColors(colors)
      var material = new LineMaterial({
        color: '#fff',
        // side: THREE.BackSide,
        linewidth: linewidth,
        vertexColors: getVertexColors()
      })

      this._setMaterialRes(this.getLayer(), material)

      var colorIndex = color.getHex()
      var mesh = new Line2(geometry, material)
      mesh.position.copy(this.getObject3d().position)
      mesh._colorIndex = colorIndex
      this.setPickObject3d(mesh)
    } // eslint-disable-next-line no-unused-vars

    _proto.identify = function identify (coordinate) {
      return this.picked
    }

    _proto.setSymbol = function setSymbol (material) {
      if (material && material instanceof THREE__namespace.Material) {
        material.needsUpdate = true
        var size = this.getMap().getSize()
        var width = size.width,
          height = size.height
        material.resolution.set(width, height)
        this.getObject3d().material = material
      }

      return this
    }

    _proto._workerLoad = function _workerLoad (result) {
      var position = new Float32Array(result.position)
      var object3d = this.getObject3d()
      object3d.geometry.setPositions(position)
      object3d.computeLineDistances()

      this._setPickObject3d(position, object3d.material.linewidth)

      this._init()

      if (this.isAdd) {
        var pick = this.getLayer().getPick()
        pick.add(this.pickObject3d)
      }

      this._fire('workerload', {
        target: this
      })
    }

    return FatLine
  })(BaseObject)

  var OPTIONS$2 = {
    altitude: 0,
    colors: null
  }
  /**
   *
   */

  var FatLines = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(FatLines, _MergedMixin)

    function FatLines (lineStrings, options, material, layer) {
      var _this

      if (!Array.isArray(lineStrings)) {
        lineStrings = [lineStrings]
      }

      var centers = [],
        lineStringList = []
      var len = lineStrings.length

      for (var i = 0; i < len; i++) {
        var lineString = lineStrings[i]
        var result = LineStringSplit(lineString)
        centers.push(result.center)
        lineStringList.push(result.lineStrings)
      } // Get the center point of the point set

      var center = getCenterOfPoints(centers)
      options = maptalks__namespace.Util.extend({}, OPTIONS$2, options, {
        layer: layer,
        lineStrings: lineStrings,
        coordinate: center
      })
      _this = _MergedMixin.call(this) || this

      _this._initOptions(options)

      var _options = options,
        asynchronous = _options.asynchronous
      var geometry = new LineGeometry()
      var lines = [],
        cache = {}
      var faceIndex = 0,
        faceMap = [],
        geometriesAttributes = [],
        psIndex = 0,
        positionList = []
      var position
      var newPosition

      if (asynchronous) {
        FatLinesTaskIns.push({
          id: maptalks__namespace.Util.GUID(),
          data: lineStringList,
          key: options.key,
          center: center,
          layer: layer,
          baseObject: _assertThisInitialized(_this),
          lineStrings: lineStrings
        })
      } else {
        //LineSegmentsGeometry
        for (var _i = 0; _i < len; _i++) {
          var lls = lineStringList[_i]
          var psCount = 0

          for (var m = 0, le = lls.length; m < le; m++) {
            var properties = isGeoJSONLine(lls[m])
              ? lls[m]['properties']
              : lls[m].getProperties() || {}

            var _getLinePosition = getLinePosition(
                lls[m],
                layer,
                center,
                false
              ),
              positions = _getLinePosition.positions

            setBottomHeight(positions, properties.bottomHeight, layer, cache)
            psCount += (positions.length / 3) * 2 - 2
            positionList.push(getLineSegmentPosition(positions))
          } // const psCount = positionsV.length + positionsV.length - 2;

          var faceLen = psCount
          faceMap[_i] = [faceIndex, faceIndex + faceLen]
          faceIndex += faceLen
          geometriesAttributes[_i] = {
            position: {
              count: psCount,
              start: psIndex,
              end: psIndex + psCount * 3
            },
            instanceStart: {
              count: psCount,
              start: psIndex,
              end: psIndex + psCount * 3
            },
            instanceEnd: {
              count: psCount,
              start: psIndex,
              end: psIndex + psCount * 3
            },
            hide: false
          }
          psIndex += psCount * 3
        }

        position = mergeLinePositions(positionList)
        geometry.setPositions(position)
      }

      _this._setMaterialRes(layer, material)

      _this._createLine2(geometry, material)

      var _options2 = options,
        altitude = _options2.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = layer.coordinateToVector3(center, z)

      _this.getObject3d().position.copy(v)

      _this._faceMap = faceMap
      _this._baseObjects = lines
      _this._datas = lineStrings
      _this._geometriesAttributes = geometriesAttributes
      _this.faceIndex = null
      _this.index = null
      _this._geometryCache = new LineGeometry()

      if (!asynchronous) {
        newPosition = new Float32Array(position)

        _this._geometryCache.setPositions(newPosition)
      }

      _this._colorMap = {}
      _this.isHide = false

      _this._initBaseObjectsEvent(lines)

      if (!asynchronous) {
        _this._setPickObject3d(newPosition, material.linewidth)

        _this._init()
      }

      _this.type = 'FatLines'
      return _this
    }

    var _proto = FatLines.prototype

    _proto._setMaterialRes = function _setMaterialRes (layer, material) {
      var map = layer.getMap()
      var size = map.getSize()
      var width = size.width,
        height = size.height
      material.resolution.set(width, height)
    }

    _proto._setPickObject3d = function _setPickObject3d (ps, linewidth) {
      if (!this._colorMap) {
        return
      }

      var geometry = this._geometryCache || new LineGeometry()
      geometry.setPositions(ps)
      var pick = this.getLayer().getPick()
      var _geometriesAttributes = this._geometriesAttributes
      var colors = getGeometriesColorArray(_geometriesAttributes)
      var cIndex = 0

      for (var i = 0, len = _geometriesAttributes.length; i < len; i++) {
        var _color = pick.getColor()

        var _colorIndex = _color.getHex()

        this._colorMap[_colorIndex] = i
        var count = _geometriesAttributes[i].position.count
        this._datas[i].colorIndex = _colorIndex

        for (var j = 0; j < count; j++) {
          colors[cIndex] = _color.r
          colors[cIndex + 1] = _color.g
          colors[cIndex + 2] = _color.b
          cIndex += 3
        }
      }

      geometry.setColors(colors)
      var material = new LineMaterial({
        // color: color.getStyle(),
        // side: THREE.BackSide,
        color: '#fff',
        linewidth: linewidth,
        vertexColors: getVertexColors() // dashed: false
      })

      this._setMaterialRes(this.getLayer(), material)

      var color = pick.getColor()
      var colorIndex = color.getHex()
      var mesh = new Line2(geometry, material)
      mesh.position.copy(this.getObject3d().position)
      mesh._colorIndex = colorIndex
      this.setPickObject3d(mesh)
    } // eslint-disable-next-line no-unused-vars

    _proto.identify = function identify (coordinate) {
      return this.picked
    }

    _proto.setSymbol = function setSymbol (material) {
      if (material && material instanceof THREE__namespace.Material) {
        material.needsUpdate = true
        var size = this.getMap().getSize()
        var width = size.width,
          height = size.height
        material.resolution.set(width, height)
        this.getObject3d().material = material
      }

      return this
    } // eslint-disable-next-line consistent-return

    _proto.getSelectMesh = function getSelectMesh () {
      var index = this._getIndex()

      if (index != null) {
        if (!this._baseObjects[index]) {
          var lineString = this._datas[index]
          var opts = maptalks__namespace.Util.extend(
            {},
            this.getOptions(),
            {
              index: index
            },
            isGeoJSONLine(lineString)
              ? lineString.properties
              : lineString.getProperties()
          )
          this._baseObjects[index] = new FatLine(
            lineString,
            opts,
            this.getObject3d().material,
            this.getLayer()
          )

          this._proxyEvent(this._baseObjects[index])
        }

        return {
          data: this._datas[index],
          baseObject: this._baseObjects[index]
        }
      }
    }
    /**
     * update geometry attributes
     * @param {*} bufferAttribute
     * @param {*} attribute
     */

    _proto._updateAttribute = function _updateAttribute (
      bufferAttribute,
      attribute
    ) {
      var _this$_getHideGeometr = this._getHideGeometryIndex(attribute),
        indexs = _this$_getHideGeometr.indexs

      var array = this._geometryCache.attributes[attribute].array
      var len = array.length

      for (var i = 0; i < len; i++) {
        bufferAttribute.array[i] = array[i]
      }

      var value = -100000

      for (var j = 0; j < indexs.length; j++) {
        var index = indexs[j]
        var _this$_geometriesAttr = this._geometriesAttributes[index][
            attribute
          ],
          start = _this$_geometriesAttr.start,
          end = _this$_geometriesAttr.end

        for (var _i2 = start; _i2 < end; _i2++) {
          bufferAttribute.array[_i2] = value
        }
      }

      return this
    }

    _proto._showGeometry = function _showGeometry (baseObject, isHide) {
      var index

      if (baseObject) {
        index = baseObject.getOptions().index
      }

      if (index != null) {
        var geometryAttributes = this._geometriesAttributes[index]
        var hide = geometryAttributes.hide

        if (hide === isHide) {
          return this
        }

        geometryAttributes.hide = isHide
        var buffGeom = this.getObject3d().geometry

        this._updateAttribute(
          buffGeom.attributes.instanceStart,
          'instanceStart'
        )

        this._updateAttribute(buffGeom.attributes.instanceEnd, 'instanceEnd') // this._updateAttribute(buffGeom.attributes.instanceDistanceStart, 'instanceDistanceStart');
        // this._updateAttribute(buffGeom.attributes.instanceDistanceEnd, 'instanceDistanceEnd');

        buffGeom.attributes.instanceStart.data.needsUpdate = true
        buffGeom.attributes.instanceEnd.data.needsUpdate = true // buffGeom.attributes.instanceDistanceStart.data.needsUpdate = true;
        // buffGeom.attributes.instanceDistanceEnd.data.needsUpdate = true;

        this.isHide = isHide
      }

      return this
    }

    _proto._workerLoad = function _workerLoad (result) {
      var faceMap = result.faceMap,
        geometriesAttributes = result.geometriesAttributes
      this._faceMap = faceMap
      this._geometriesAttributes = geometriesAttributes
      var object3d = this.getObject3d()
      var position = new Float32Array(result.position)
      var newPosition = new Float32Array(position)
      object3d.geometry.setPositions(new Float32Array(position))

      this._geometryCache.setPositions(newPosition)

      this._setPickObject3d(newPosition, object3d.material.linewidth)

      this._init()

      if (this.isAdd) {
        var pick = this.getLayer().getPick()
        pick.add(this.pickObject3d)
      }

      this._fire('workerload', {
        target: this
      })
    }

    return FatLines
  })(MergedMixin(BaseObject))

  var OPTIONS$1 = {
    radius: 10,
    height: 100,
    altitude: 0,
    topColor: '',
    bottomColor: '#2d2f61'
  }

  var Box = /*#__PURE__*/ (function (_BaseObject) {
    _inheritsLoose(Box, _BaseObject)

    function Box (coordinate, options, material, layer) {
      var _this

      options = maptalks__namespace.Util.extend({}, OPTIONS$1, options, {
        layer: layer,
        coordinate: coordinate
      })
      _this = _BaseObject.call(this) || this

      _this._initOptions(options)

      var _options = options,
        height = _options.height,
        radius = _options.radius,
        topColor = _options.topColor,
        bottomColor = _options.bottomColor,
        altitude = _options.altitude
      var h = layer.distanceToVector3(height, height).x
      var r = layer.distanceToVector3(radius, radius).x
      var geometry = getDefaultBoxGeometry().clone()
      geometry.scale(r * 2, r * 2, h)

      if (topColor) {
        initVertexColors$1(geometry, bottomColor, topColor, 'z', h / 2)
        material.vertexColors = getVertexColors()
      }

      _this._createMesh(geometry, material)

      var z = layer.distanceToVector3(altitude, altitude).x
      var position = layer.coordinateToVector3(coordinate, z)

      _this.getObject3d().position.copy(position)

      _this.type = 'Box'
      return _this
    }

    return Box
  })(BaseObject)

  var OPTIONS = {
    radius: 10,
    height: 100,
    altitude: 0,
    topColor: null,
    bottomColor: '#2d2f61'
  }

  var Boxs = /*#__PURE__*/ (function (_MergedMixin) {
    _inheritsLoose(Boxs, _MergedMixin)

    function Boxs (points, options, material, layer) {
      var _this

      if (!Array.isArray(points)) {
        points = [points]
      }

      var len = points.length
      var center = getCenterOfPoints(points)
      var centerPt = layer.coordinateToVector3(center)
      var geometries = [],
        bars = [],
        geometriesAttributes = [],
        faceMap = []
      var faceIndex = 0,
        psIndex = 0,
        normalIndex = 0,
        uvIndex = 0
      var cache = {}

      for (var i = 0; i < len; i++) {
        var opts = maptalks__namespace.Util.extend(
          {
            index: i
          },
          OPTIONS,
          points[i]
        )
        var radius = opts.radius,
          _altitude = opts.altitude,
          topColor = opts.topColor,
          bottomColor = opts.bottomColor,
          height = opts.height,
          coordinate = opts.coordinate
        var r = distanceToVector3(radius, layer, cache)
        var h = distanceToVector3(height, layer, cache)
        var alt = distanceToVector3(_altitude, layer, cache)
        var buffGeom = getDefaultBoxGeometry().clone()
        buffGeom.scale(r * 2, r * 2, h)

        if (topColor) {
          initVertexColors$1(buffGeom, bottomColor, topColor, 'z', h / 2)
          material.vertexColors = getVertexColors()
        }

        var _v = layer.coordinateToVector3(coordinate).sub(centerPt)

        var parray = buffGeom.attributes.position.array

        for (var j = 0, len1 = parray.length; j < len1; j += 3) {
          parray[j + 2] += alt
          parray[j] += _v.x
          parray[j + 1] += _v.y
          parray[j + 2] += _v.z
        }

        geometries.push(buffGeom)
        var bar = new Box(coordinate, opts, material, layer)
        bars.push(bar)
        var faceLen = buffGeom.index.count / 3
        faceMap[i] = [faceIndex + 1, faceIndex + faceLen]
        faceIndex += faceLen
        var psCount = buffGeom.attributes.position.count,
          //  colorCount = buffGeom.attributes.color.count,
          normalCount = buffGeom.attributes.normal.count,
          uvCount = buffGeom.attributes.uv.count
        geometriesAttributes[i] = {
          position: {
            count: psCount,
            start: psIndex,
            end: psIndex + psCount * 3
          },
          normal: {
            count: normalCount,
            start: normalIndex,
            end: normalIndex + normalCount * 3
          },
          // color: {
          //     count: colorCount,
          //     start: colorIndex,
          //     end: colorIndex + colorCount * 3,
          // },
          uv: {
            count: uvCount,
            start: uvIndex,
            end: uvIndex + uvCount * 2
          },
          hide: false
        }
        psIndex += psCount * 3
        normalIndex += normalCount * 3 // colorIndex += colorCount * 3;

        uvIndex += uvCount * 2
      }

      _this = _MergedMixin.call(this) || this
      options = maptalks__namespace.Util.extend(
        {},
        {
          altitude: 0,
          layer: layer,
          points: points
        },
        options
      )

      _this._initOptions(options)

      var geometry = mergeBarGeometry(geometries)

      _this._createMesh(geometry, material)

      var altitude = options.altitude
      var z = layer.distanceToVector3(altitude, altitude).x
      var v = centerPt.clone()
      v.z = z

      _this.getObject3d().position.copy(v)

      _this._faceMap = faceMap
      _this._baseObjects = bars
      _this._datas = points
      _this._geometriesAttributes = geometriesAttributes
      _this.faceIndex = null
      _this._geometryCache = geometry.clone()
      _this.isHide = false
      _this._colorMap = {}

      _this._initBaseObjectsEvent(bars)

      _this._setPickObject3d()

      _this._init()

      _this.type = 'Boxs'
      return _this
    } // eslint-disable-next-line no-unused-vars

    var _proto = Boxs.prototype

    _proto.identify = function identify (coordinate) {
      return this.picked
    }

    return Boxs
  })(MergedMixin(BaseObject))

  // eslint-disable-next-line quotes
  var workerCode =
    '(function(e){"use strict";var t=r,n=r;function r(e,t,n){n=n||2;var r,v,h,u,l,x,c,d=t&&t.length,g=d?t[0]*n:e.length,y=i(e,0,g,n,!0),m=[];if(!y||y.next===y.prev)return m;if(d&&(y=function(e,t,n,r){var o,v,h,u=[];for(o=0,v=t.length;o<v;o++)(h=i(e,t[o]*r,o<v-1?t[o+1]*r:e.length,r,!1))===h.next&&(h.steiner=!0),u.push(p(h));for(u.sort(f),o=0;o<u.length;o++)s(u[o],n),n=a(n,n.next);return n}(e,t,y,n)),e.length>80*n){r=h=e[0],v=u=e[1];for(var M=n;M<g;M+=n)(l=e[M])<r&&(r=l),(x=e[M+1])<v&&(v=x),l>h&&(h=l),x>u&&(u=x);c=0!==(c=Math.max(h-r,u-v))?1/c:0}return o(y,m,n,r,v,c),m}function i(e,t,n,r,i){var a,o;if(i===R(e,t,n,r)>0)for(a=t;a<n;a+=r)o=A(a,e[a],e[a+1],o);else for(a=n-r;a>=t;a-=r)o=A(a,e[a],e[a+1],o);return o&&m(o,o.next)&&(z(o),o=o.next),o}function a(e,t){if(!e)return e;t||(t=e);var n,r=e;do{if(n=!1,r.steiner||!m(r,r.next)&&0!==y(r.prev,r,r.next))r=r.next;else{if(z(r),(r=t=r.prev)===r.next)break;n=!0}}while(n||r!==t);return t}function o(e,t,n,r,i,f,s){if(e){!s&&f&&function(e,t,n,r){var i=e;do{null===i.z&&(i.z=c(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next}while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,function(e){var t,n,r,i,a,o,v,h,u=1;do{for(n=e,e=null,a=null,o=0;n;){for(o++,r=n,v=0,t=0;t<u&&(v++,r=r.nextZ);t++);for(h=u;v>0||h>0&&r;)0!==v&&(0===h||!r||n.z<=r.z)?(i=n,n=n.nextZ,v--):(i=r,r=r.nextZ,h--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;n=r}a.nextZ=null,u*=2}while(o>1)}(i)}(e,r,i,f);for(var x,p,d=e;e.prev!==e.next;)if(x=e.prev,p=e.next,f?h(e,r,i,f):v(e))t.push(x.i/n),t.push(e.i/n),t.push(p.i/n),z(e),e=p.next,d=p.next;else if((e=p)===d){s?1===s?o(e=u(a(e),t,n),t,n,r,i,f,2):2===s&&l(e,t,n,r,i,f):o(a(e),t,n,r,i,f,1);break}}}function v(e){var t=e.prev,n=e,r=e.next;if(y(t,n,r)>=0)return!1;for(var i=e.next.next;i!==e.prev;){if(d(t.x,t.y,n.x,n.y,r.x,r.y,i.x,i.y)&&y(i.prev,i,i.next)>=0)return!1;i=i.next}return!0}function h(e,t,n,r){var i=e.prev,a=e,o=e.next;if(y(i,a,o)>=0)return!1;for(var v=i.x<a.x?i.x<o.x?i.x:o.x:a.x<o.x?a.x:o.x,h=i.y<a.y?i.y<o.y?i.y:o.y:a.y<o.y?a.y:o.y,u=i.x>a.x?i.x>o.x?i.x:o.x:a.x>o.x?a.x:o.x,l=i.y>a.y?i.y>o.y?i.y:o.y:a.y>o.y?a.y:o.y,f=c(v,h,t,n,r),s=c(u,l,t,n,r),x=e.prevZ,p=e.nextZ;x&&x.z>=f&&p&&p.z<=s;){if(x!==e.prev&&x!==e.next&&d(i.x,i.y,a.x,a.y,o.x,o.y,x.x,x.y)&&y(x.prev,x,x.next)>=0)return!1;if(x=x.prevZ,p!==e.prev&&p!==e.next&&d(i.x,i.y,a.x,a.y,o.x,o.y,p.x,p.y)&&y(p.prev,p,p.next)>=0)return!1;p=p.nextZ}for(;x&&x.z>=f;){if(x!==e.prev&&x!==e.next&&d(i.x,i.y,a.x,a.y,o.x,o.y,x.x,x.y)&&y(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;p&&p.z<=s;){if(p!==e.prev&&p!==e.next&&d(i.x,i.y,a.x,a.y,o.x,o.y,p.x,p.y)&&y(p.prev,p,p.next)>=0)return!1;p=p.nextZ}return!0}function u(e,t,n){var r=e;do{var i=r.prev,o=r.next.next;!m(i,o)&&M(i,r,r.next,o)&&S(i,o)&&S(o,i)&&(t.push(i.i/n),t.push(r.i/n),t.push(o.i/n),z(r),z(r.next),r=e=o),r=r.next}while(r!==e);return a(r)}function l(e,t,n,r,i,v){var h=e;do{for(var u=h.next.next;u!==h.prev;){if(h.i!==u.i&&g(h,u)){var l=Z(h,u);return h=a(h,h.next),l=a(l,l.next),o(h,t,n,r,i,v),void o(l,t,n,r,i,v)}u=u.next}h=h.next}while(h!==e)}function f(e,t){return e.x-t.x}function s(e,t){if(t=function(e,t){var n,r=t,i=e.x,a=e.y,o=-1/0;do{if(a<=r.y&&a>=r.next.y&&r.next.y!==r.y){var v=r.x+(a-r.y)*(r.next.x-r.x)/(r.next.y-r.y);if(v<=i&&v>o){if(o=v,v===i){if(a===r.y)return r;if(a===r.next.y)return r.next}n=r.x<r.next.x?r:r.next}}r=r.next}while(r!==t);if(!n)return null;if(i===o)return n;var h,u=n,l=n.x,f=n.y,s=1/0;r=n;do{i>=r.x&&r.x>=l&&i!==r.x&&d(a<f?i:o,a,l,f,a<f?o:i,a,r.x,r.y)&&(h=Math.abs(a-r.y)/(i-r.x),S(r,e)&&(h<s||h===s&&(r.x>n.x||r.x===n.x&&x(n,r)))&&(n=r,s=h)),r=r.next}while(r!==u);return n}(e,t)){var n=Z(t,e);a(t,t.next),a(n,n.next)}}function x(e,t){return y(e.prev,e,t.prev)<0&&y(t.next,e,e.next)<0}function c(e,t,n,r,i){return(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=32767*(e-n)*i)|e<<8))|e<<4))|e<<2))|e<<1))|(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=32767*(t-r)*i)|t<<8))|t<<4))|t<<2))|t<<1))<<1}function p(e){var t=e,n=e;do{(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next}while(t!==e);return n}function d(e,t,n,r,i,a,o,v){return(i-o)*(t-v)-(e-o)*(a-v)>=0&&(e-o)*(r-v)-(n-o)*(t-v)>=0&&(n-o)*(a-v)-(i-o)*(r-v)>=0}function g(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!function(e,t){var n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&M(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}(e,t)&&(S(e,t)&&S(t,e)&&function(e,t){var n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do{n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next}while(n!==e);return r}(e,t)&&(y(e.prev,e,t.prev)||y(e,t.prev,t))||m(e,t)&&y(e.prev,e,e.next)>0&&y(t.prev,t,t.next)>0)}function y(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function m(e,t){return e.x===t.x&&e.y===t.y}function M(e,t,n,r){var i=w(y(e,t,n)),a=w(y(e,t,r)),o=w(y(n,r,e)),v=w(y(n,r,t));return i!==a&&o!==v||(!(0!==i||!b(e,n,t))||(!(0!==a||!b(e,r,t))||(!(0!==o||!b(n,e,r))||!(0!==v||!b(n,t,r)))))}function b(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function w(e){return e>0?1:e<0?-1:0}function S(e,t){return y(e.prev,e,e.next)<0?y(e,t,e.next)>=0&&y(e,e.prev,t)>=0:y(e,t,e.prev)<0||y(e,e.next,t)<0}function Z(e,t){var n=new F(e.i,e.x,e.y),r=new F(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function A(e,t,n,r){var i=new F(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function z(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function F(e,t,n){this.i=e,this.x=t,this.y=n,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function R(e,t,n,r){for(var i=0,a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}function q(e,t,n){var r=t[0],i=t[1],a=n[0]-r,o=n[1]-i;if(0!==a||0!==o){var v=((e[0]-r)*a+(e[1]-i)*o)/(a*a+o*o);v>1?(r=n[0],i=n[1]):v>0&&(r+=a*v,i+=o*v)}return(a=e[0]-r)*a+(o=e[1]-i)*o}function P(e,t,n,r,i){for(var a,o=r,v=t+1;v<n;v++){var h=q(e[v],e[t],e[n]);h>o&&(a=v,o=h)}o>r&&(a-t>1&&P(e,t,a,r,i),i.push(e[a]),n-a>1&&P(e,a,n,r,i))}function L(e,t){var n=e.length-1,r=[e[0]];return P(e,0,n,t,r),r.push(e[n]),r}function V(e,t,n){if(e.length<=2)return e;var r=void 0!==t?t*t:1;return e=L(e=n?e:function(e,t){for(var n,r,i,a,o,v=e[0],h=[v],u=1,l=e.length;u<l;u++)n=e[u],i=v,a=void 0,o=void 0,a=(r=n)[0]-i[0],o=r[1]-i[1],a*a+o*o>t&&(h.push(n),v=n);return v!==n&&h.push(n),h}(e,r),r)}function B(e,t){return e[0]*t[0]+e[1]*t[1]}function E(e,t){var n=t[0],r=t[1],i=Math.sqrt(n*n+r*r);return e[0]=n/i,e[1]=r/i,e}function U(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e}function H(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e}function I(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function O(e,t){var n=t[0],r=t[1],i=t[2],a=Math.sqrt(n*n+r*r+i*i);return e[0]=n/a,e[1]=r/a,e[2]=i/a,e}function T(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[0],v=n[1],h=n[2];return e[0]=i*h-a*v,e[1]=a*o-r*h,e[2]=r*v-i*o,e}r.deviation=function(e,t,n,r){var i=t&&t.length,a=i?t[0]*n:e.length,o=Math.abs(R(e,0,a,n));if(i)for(var v=0,h=t.length;v<h;v++){var u=t[v]*n,l=v<h-1?t[v+1]*n:e.length;o-=Math.abs(R(e,u,l,n))}var f=0;for(v=0;v<r.length;v+=3){var s=r[v]*n,x=r[v+1]*n,c=r[v+2]*n;f+=Math.abs((e[s]-e[c])*(e[x+1]-e[s+1])-(e[s]-e[x])*(e[c+1]-e[s+1]))}return 0===o&&0===f?0:Math.abs((f-o)/o)},r.flatten=function(e){for(var t=e[0][0].length,n={vertices:[],holes:[],dimensions:t},r=0,i=0;i<e.length;i++){for(var a=0;a<e[i].length;a++)for(var o=0;o<t;o++)n.vertices.push(e[i][a][o]);i>0&&(r+=e[i-1].length,n.holes.push(r))}return n},t.default=n;var W=[];function j(e,t,n,r){var i=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}(t,n),a=Math.acos(i)*r;return U(W,n,t,-i),function(e,t){var n=t[0],r=t[1],i=t[2],a=Math.sqrt(n*n+r*r+i*i);e[0]=n/a,e[1]=r/a,e[2]=i/a}(W,W),function(e,t,n){e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n}(e,t,Math.cos(a)),U(e,e,W,Math.sin(a)),e}function k(e,t,n,r,i,a,o,v,h,u){var l=o-i,f=v-a,s=(l*(t-a)-f*(e-i))/(f*(n-e)-l*(r-t));return h&&(h[u=u||0]=e+s*(n-e),h[u+1]=t+s*(r-t)),s}function _(e,t,n){if(n-t<3)return 0;for(var r=0,i=2*(n-1),a=2*t;a<2*n;){var o=e[i],v=e[i+1],h=e[a],u=e[a+1];i=a,a+=2,r+=o*u-h*v}return r}function D(e,n,r){return void 0===r&&(r=2),t(e,n,r)}var C=[],G=[],J=[];function K(e,t,n,r,i,a,o,v,h){var u,l,f,s=null!=o,x=i,c=null;s&&(c=new Uint32Array(r-n));for(var p=[],d=n;d<r;d++){var g=d===r-1?n:d+1,y=d===n?r-1:d-1,m=e[2*y],M=e[2*y+1],b=e[2*d],w=e[2*d+1],S=e[2*g],Z=e[2*g+1];C[0]=b-m,C[1]=w-M,G[0]=S-b,G[1]=Z-w,E(C,C),E(G,G),s&&(c[d]=x);var A=!1,z=void 0,F=void 0;if(v||d!==n)if(v||d!==r-1){H(J,G,C);var R=J[1];J[1]=-J[0],J[0]=R,E(J,J);var q=B(J,G),P=Math.sqrt(1-q*q),L=a*Math.min(10,1/P);if(s&&1/P>o&&a*q<0){var V=b+J[0]*a,U=w+J[1]*a,I=Math.acos(P)/2,O=Math.tan(I)*Math.abs(a);t[2*x]=V+J[1]*O,t[2*x+1]=U-J[0]*O,t[2*++x]=V-J[1]*O,t[2*x+1]=U+J[0]*O,x++}else z=b+J[0]*L,F=w+J[1]*L,A=!0;if(A){if(h&&null!=u){var T=k(m,M,u,l,b,w,z,F,p,0);T>=-.01&&T<=1.01&&(t[2*f]=z=p[0],t[2*f+1]=F=p[1])}u=t[2*x]=z,l=t[2*x+1]=F,f=x,x++}}else J[0]=C[1],J[1]=-C[0],E(J,J),z=b+J[0]*a,F=w+J[1]*a,A=!0;else J[0]=G[1],J[1]=-G[0],E(J,J),u=t[2*x]=b+J[0]*a,l=t[2*x+1]=w+J[1]*a,f=x,x++}return c}function N(e,t,n,r,i,a,o,v){var h=null!=o,u=i,l=null;h&&(l=new Uint32Array(r-n));for(var f=n;f<r;f++){var s=f===r-1?n:f+1,x=f===n?r-1:f-1,c=e[2*x],p=e[2*x+1],d=e[2*f],g=e[2*f+1],y=e[2*s],m=e[2*s+1];if(C[0]=d-c,C[1]=g-p,G[0]=y-d,G[1]=m-g,E(C,C),E(G,G),h&&(l[f]=u),v||f!==n)if(v||f!==r-1){H(J,G,C);var M=J[1];J[1]=-J[0],J[0]=M,E(J,J);var b=B(J,G),w=Math.sqrt(1-b*b),S=a*Math.min(10,1/w);if(h&&1/w>o&&a*b<0){var Z=d+J[0]*a,A=g+J[1]*a,z=Math.acos(w)/2,F=Math.tan(z)*Math.abs(a);t[2*u]=Z+J[1]*F,t[2*u+1]=A-J[0]*F,t[2*++u]=Z-J[1]*F,t[2*u+1]=A+J[0]*F,u++}else t[2*u]=d+J[0]*S,t[2*u+1]=g+J[1]*S,u++}else J[0]=C[1],J[1]=-C[0],E(J,J),t[2*u]=d+J[0]*a,t[2*u+1]=g+J[1]*a,u++;else J[0]=G[1],J[1]=-G[0],E(J,J),t[2*u]=d+J[0]*a,t[2*u+1]=g+J[1]*a,u++}return l}function Q(e,t,n,r,i){var a=null!=r?[]:new Float32Array(e.length);if(K(e,a,0,t&&t.length?t[0]:e.length/2,0,n,r,i,!0),t)for(var o=0;o<t.length;o++){var v=t[o];K(e,a,v,t[o+1]||e.length/2,null!=r?a.length/2:v,n,r,i,!1)}return a}function X(e,t,n,r){for(var i=0;i<Math.floor((r-n)/2);i++)for(var a=0;a<t;a++){var o=(i+n)*t+a,v=(r-i-1)*t+a,h=e[o];e[o]=e[v],e[v]=h}return e}function Y(e,t){var n=e.length/2,r=0,i=t&&t.length?t[0]:n;_(e,r,i)>0&&X(e,2,r,i);for(var a=1;a<(t?t.length:0)+1;a++)_(e,r=t[a-1],i=t[a]||n)<0&&X(e,2,r,i)}function $(e){e.depth=e.depth||1,e.bevelSize=e.bevelSize||0,e.bevelSegments=null==e.bevelSegments?2:e.bevelSegments,e.smoothBevel=e.smoothBevel||!1,e.simplify=e.simplify||0,null==e.smoothSide&&(e.smoothSide="auto"),null==e.smoothSideThreshold&&(e.smoothSideThreshold=.9),"number"==typeof e.depth&&(e.bevelSize=Math.min(e.bevelSegments>0?e.bevelSize:0,e.depth/2)),e.bevelSize>0||(e.bevelSegments=0),e.bevelSegments=Math.round(e.bevelSegments);var t=e.boundingRect;if(e.translate=e.translate||[0,0],e.scale=e.scale||[1,1],e.fitRect){var n=null==e.fitRect.x?t.x||0:e.fitRect.x,r=null==e.fitRect.y?t.y||0:e.fitRect.y,i=e.fitRect.width,a=e.fitRect.height;null==i?null!=a?i=a/t.height*t.width:(i=t.width,a=t.height):null==a&&(a=i/t.width*t.height),e.scale=[i/t.width,a/t.height],e.translate=[(n-t.x)*e.scale[0],(r-t.y)*e.scale[1]]}}var ee=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];function te(e,t,n){for(var r=0,i=e[t],a=e[t+1],o=i,v=a,h=t+2;h<n;h+=2){var u=e[h],l=e[h+1];r+=Math.sqrt((u-i)*(u-i)+(l-a)*(l-a)),i=u,a=l}return r+=Math.sqrt((i-o)*(i-o)+(a-v)*(a-v))}function ne(e,t,n,r,i,a){var o=t.vertices,v=t.topVertices,h=t.splittedMap,u=t.depth,l=t.rect,f=r-n,s=a.smoothBevel?1:2,x=Math.min(u/2,a.bevelSize),c=a.bevelSegments,p=i.vertex,d=i.ringPerimeter,g=Math.max(l.width,l.height,u,d);function y(e){var t=(e+1)%f,n=o[2*e],r=o[2*e+1],i=o[2*t],a=o[2*t+1];return n===i&&r===a}if(x>0)for(var m=[0,0,1],M=[],b=[0,0,-1],w=[],S=0,Z=new Float32Array(f),A=0;A<2;A++)for(var z=0===A?u-x:x,F=0;F<=c*s;F++){for(var R=0,q=void 0,P=void 0,L=0;L<f;L++){var V=2*(L%f+n),B=h?2*h[V/2]:V;M[0]=o[V]-v[B],M[1]=o[V+1]-v[B+1],M[2]=0;var E=Math.sqrt(M[0]*M[0]+M[1]*M[1]);M[0]/=E,M[1]/=E;var U=(Math.floor(F/s)+F%s)/c;0===A?j(w,m,M,U):j(w,M,b,U);var H=0===A?U:1-U,I=x*Math.sin(H*Math.PI/2),O=E*Math.cos(H*Math.PI/2),T=x*E/Math.sqrt(I*I+O*O),W=w[0]*T+v[B],k=w[1]*T+v[B+1],_=w[2]*T+z;if(e.position[3*i.vertex]=W,e.position[3*i.vertex+1]=k,e.position[3*i.vertex+2]=_,L>0&&(R+=Math.sqrt((q-W)*(q-W)+(P-k)*(P-k))),F>0||A>0){var D=3*(i.vertex-f),C=e.position[D],G=e.position[D+1],J=e.position[D+2];Z[L]+=Math.sqrt((C-W)*(C-W)+(G-k)*(G-k)+(J-_)*(J-_))}if(e.uv[2*i.vertex]=R/g,e.uv[2*i.vertex+1]=Z[L]/g,q=W,P=k,i.vertex++,!y(L)&&(s>1&&F%s||1===s&&F>=1))for(var K=0;K<6;K++){var N=(ee[K][0]+L)%f,Q=ee[K][1]+S;e.indices[i.index++]=(Q-1)*f+N+p}}S++}else for(var X=0;X<2;X++)for(var Y=0===X?u-x:x,$=0,te=void 0,ne=void 0,re=0;re<f;re++){var ie=2*(re%f+n),ae=o[ie],oe=o[ie+1];e.position[3*i.vertex]=ae,e.position[3*i.vertex+1]=oe,e.position[3*i.vertex+2]=Y,re>0&&($+=Math.sqrt((te-ae)*(te-ae)+(ne-oe)*(ne-oe))),e.uv[2*i.vertex]=$/g,e.uv[2*i.vertex+1]=Y/g,te=ae,ne=oe,i.vertex++}for(var ve=x>0?c*s+1:1,he=0;he<f;he++)if(!y(he))for(var ue=0;ue<6;ue++){var le=(ee[ue][0]+he)%f,fe=ee[ue][1]+ve;e.indices[i.index++]=(fe-1)*f+le+p}}function re(e,t,n,r){var i=e.indices,a=e.topVertices,o=e.rect,v=e.depth;if(!(a.length<=4)){for(var h=n.vertex,u=i.length,l=0;l<u;l++)t.indices[n.index++]=h+i[l];for(var f=Math.max(o.width,o.height),s=0;s<(r.excludeBottom?1:2);s++)for(var x=0;x<a.length;x+=2){var c=a[x],p=a[x+1];t.position[3*n.vertex]=c,t.position[3*n.vertex+1]=p,t.position[3*n.vertex+2]=(1-s)*v,t.uv[2*n.vertex]=(c-o.x)/f,t.uv[2*n.vertex+1]=(p-o.y)/f,n.vertex++}if(!r.excludeBottom)for(var d=a.length/2,g=0;g<u;g+=3)for(var y=0;y<3;y++)t.indices[n.index++]=h+d+i[g+2-y]}}function ie(e,t,n,r){var i=null==n||"auto"===n;if(!0===n)return{vertices:e,holes:t};for(var a=[],o=t&&[],v=e.length/2,h=[],u=[],l=[],f=0,s=0,x=(t?t.length:0)+1,c=0;c<x;c++){0===c?s=t&&t.length?t[0]:v:(f=t[c-1],s=t[c]||v);for(var p=f;p<s;p++){var d=e[2*p],g=e[2*p+1],y=p===s-1?f:p+1,m=e[2*y],M=e[2*y+1];if(i){var b=p===f?s-1:p-1,w=e[2*b],S=e[2*b+1];h[0]=w-d,h[1]=S-g,u[0]=m-d,u[1]=M-g,E(h,h),E(u,u),1-(.5*B(h,u)+.5)>r?(a.push(d,g),l.push(p)):(a.push(d,g,d,g),l.push(p,p))}else a.push(d,g,d,g),l.push(p,p)}c<x-1&&o&&o.push(a.length/2)}return{vertices:new Float32Array(a),splittedMap:l,holes:o}}function ae(e,t){for(var n=0,r=0,i=0;i<e.length;i++){var a=e[i],o=a.indices,v=a.vertices,h=a.splittedMap,u=a.topVertices,l=a.depth,f=Math.min(l/2,t.bevelSize)>0?t.bevelSegments:0,s=e[i].holes||[];n+=o.length*(t.excludeBottom?1:2),r+=u.length/2*(t.excludeBottom?1:2);for(var x=2+2*f,c=0,p=0,d=0;d<s.length+1;d++){0===d?p=s.length?s[0]:v.length/2:(c=s[d-1],p=s[d]||v.length/2),n+=6*((h?h[p-1]+1:p)-(h?h[c]:c))*(x-1);var g=p-c;r+=g*x+(t.smoothBevel?0:f*g*2)}}for(var y={position:new Float32Array(3*r),indices:new(r>65535?Uint32Array:Uint16Array)(n),uv:new Float32Array(2*r)},m={vertex:0,index:0,ringPerimeter:0},M=0;M<e.length;M++)re(e[M],y,m,t);for(var b=0;b<e.length;b++){var w=e[b],S=w.holes,Z=w.vertices.length/2,A=0,z=S&&S.length?S[0]:Z;if(m.ringPerimeter=te(e[b].topVertices,A,z),ne(y,e[b],A,z,m,t),S)for(var F=0;F<S.length;F++)A=S[F],z=S[F+1]||Z,m.ringPerimeter=te(e[b].topVertices,A,z),ne(y,e[b],A,z,m,t)}for(var R=0;R<y.uv.length;R++){var q=y.uv[R];q>0&&Math.round(q)===q?y.uv[R]=1:y.uv[R]=q%1}return y.normal=function(e,t){function n(e,t,n,r){e[0]=t,e[1]=n,e[2]=r}for(var r=[],i=[],a=[],o=[],v=[],h=[],u=e.length,l=new Float32Array(t.length),f=0;f<u;){var s=3*e[f++],x=3*e[f++],c=3*e[f++];n(r,t[s],t[s+1],t[s+2]),n(i,t[x],t[x+1],t[x+2]),n(a,t[c],t[c+1],t[c+2]),I(o,r,i),I(v,i,a),T(h,o,v);for(var p=0;p<3;p++)l[s+p]=l[s+p]+h[p],l[x+p]=l[x+p]+h[p],l[c+p]=l[c+p]+h[p]}for(var d=0;d<l.length;)n(h,l[d],l[d+1],l[d+2]),O(h,h),l[d++]=h[0],l[d++]=h[1],l[d++]=h[2];return l}(y.indices,y.position),y.boundingRect=e[0]&&e[0].rect,y}function oe(e,t,n){for(var r=n.lineWidth,i=e.length,a=new Float32Array(2*i),o=n.translate||[0,0],v=n.scale||[1,1],h=0,u=0;h<i;h++)a[u++]=e[h][0]*v[0]+o[0],a[u++]=e[h][1]*v[1]+o[1];_(a,0,i)<0&&X(a,2,0,i);var l=[],f=[],s=n.miterLimit,x=N(a,f,0,i,0,-r/2,s,!1);X(a,2,0,i);for(var c=N(a,l,0,i,0,-r/2,s,!1),p=(l.length+f.length)/2,d=new Float32Array(2*p),g=0,y=f.length/2,m=0;m<f.length;m++)d[g++]=f[m];for(var M=0;M<l.length;M++)d[g++]=l[M];for(var b=new(p>65535?Uint32Array:Uint16Array)(3*(2*(i-1)+(p-2*i))),w=0,S=0;S<i-1;S++){var Z=S+1;b[w++]=y-1-x[S],b[w++]=y-1-x[S]-1,b[w++]=c[S]+1+y,b[w++]=y-1-x[S],b[w++]=c[S]+1+y,b[w++]=c[S]+y,c[Z]-c[S]==2?(b[w++]=c[S]+2+y,b[w++]=c[S]+1+y,b[w++]=y-x[Z]-1):x[Z]-x[S]==2&&(b[w++]=c[Z]+y,b[w++]=y-1-(x[S]+1),b[w++]=y-1-(x[S]+2))}var A=n.bevelSize>0?Q(d,[],n.bevelSize,null,!0):d,z=n.boundingRect,F=ie(d,null,n.smoothSide,n.smoothSideThreshold);return{vertices:F.vertices,rawVertices:A,splittedMap:F.splittedMap,indices:b,topVertices:A,rect:{x:z.x*v[0]+o[0],y:z.y*v[1]+o[1],width:z.width*v[0],height:z.height*v[1]},depth:"function"==typeof n.depth?n.depth(t):n.depth,holes:[]}}function ve(e,t){for(var n=[],r=0;r<e.length;r++){for(var i=e[r],a=[],o=i.length,v=i[o-1][0],h=i[o-1][1],u=0,l=0;l<o;l++){var f=i[l][0],s=i[l][1],x=f-v,c=s-h;(u+=Math.sqrt(x*x+c*c))>t&&(a.push(i[l]),u=0),v=f,h=s}a.length>=3&&n.push(a)}return n.length>0?n:null}function he(e,t){for(var n=[],r=0;r<e.length;r++){var i=e[r];(i=V(i,t,!0)).length>=3&&n.push(i)}return n.length>0?n:null}function ue(e,t,n){for(var r=0;r<e.length;r++)t[0]=Math.min(e[r][0],t[0]),t[1]=Math.min(e[r][1],t[1]),n[0]=Math.max(e[r][0],n[0]),n[1]=Math.max(e[r][1],n[1])}var le={x:0,y:0},fe={x:0,y:0};function se(e,t,n,r){for(var i=e.length,a=0;a<i;a++){var o=e[a].data;t=e[a].center||t;for(var v=0,h=o.length;v<h;v++)for(var u=o[v],l=0,f=u.length;l<f;l++)e[a].data[v][l]=xe(u[l],t,n,r)}}function xe(e,t,n,r){for(var i,a=[],o=0,v=(i=n?new Float64Array(e):new Float32Array(e)).length;o<v;o+=2){var h=i[o],u=i[o+1];if(t&&n&&r){le.x=h,le.y=u;var l=be(le,fe);le.x=l.x,le.y=l.y,h=(l=we(r,le,n,fe)).x,u=l.y,h-=t[0],u-=t[1]}a.push([h,u])}return a}function ce(e,t){void 0===t&&(t=!1);for(var n=e.length,r=[],i=[],a=[],o=0,v=0,h=0,u=0,l=0;l<n;l++){var f=t?de(e[l]):pe(e[l]),s=e[l].bottomHeight||0,x=f.position,c=f.normal,p=f.uv,d=f.indices;i.push(f);var g=d.length/3;a[l]=[o+1,o+g],o+=g;var y=x.length/3,m=c.length/3,M=p.length/2;r[l]={position:{middleZ:s+(e[l].height||0)/2,count:y,start:v,end:v+3*y},normal:{count:m,start:h,end:h+3*m},uv:{count:M,start:u,end:u+2*M},hide:!1},v+=3*y,h+=3*m,u+=2*M}var b=function(e){for(var t={},n={},r=0;r<e.length;++r){var i=e[r];for(var a in i)void 0===t[a]&&(t[a]=[],n[a]=0),t[a].push(i[a]),n[a]+=i[a].length}var o={},v=0,h=[];for(var u in t)if("indices"===u)for(var l=t[u],f=0,s=l.length;f<s;f++){for(var x=l[f],c=0,p=x.length;c<p;c++)h.push(x[c]+v);v+=t.position[f].length/3}else{var d=ge(t[u],n[u]);if(!d)return null;o[u]=d}return o.indices=new Uint32Array(h),o}(i),w=b.position,S=b.normal,Z=b.uv,A=b.indices;return{position:w.buffer,normal:S.buffer,uv:Z.buffer,indices:A.buffer,faceMap:a,geometriesAttributes:r}}function pe(e){var n=e.data,r=e.height,i=e.bottomHeight,a=function(e,n){n=Object.assign({},n);for(var r=[1/0,1/0],i=[-1/0,-1/0],a=0;a<e.length;a++)ue(e[a][0],r,i);n.boundingRect=n.boundingRect||{x:r[0],y:r[1],width:i[0]-r[0],height:i[1]-r[1]},$(n);for(var o=[],v=n.translate||[0,0],h=n.scale||[1,1],u=n.boundingRect,l={x:u.x*h[0]+v[0],y:u.y*h[1]+v[1],width:u.width*h[0],height:u.height*h[1]},f=Math.min(u.width,u.height)/1e5,s=0;s<e.length;s++){var x=ve(e[s],f);if(x){var c=n.simplify/Math.max(h[0],h[1]);if(c>0&&(x=he(x,c)),x){for(var p=t.flatten(x),d=p.vertices,g=p.holes,y=p.dimensions,m=0;m<d.length;)d[m]=d[m++]*h[0]+v[0],d[m]=d[m++]*h[1]+v[1];if(Y(d,g),2!==y)throw new Error("Only 2D polygon points are supported");var M=n.bevelSize>0?Q(d,g,n.bevelSize,null,!0):d,b=D(M,g,y),w=ie(d,g,n.smoothSide,n.smoothSideThreshold);o.push({indices:b,vertices:w.vertices,rawVertices:d,topVertices:M,holes:w.holes,splittedMap:w.splittedMap,rect:l,depth:"function"==typeof n.depth?n.depth(s):n.depth})}}}return ae(o,n)}(n,{depth:r}),o=a.position,v=a.normal,h=a.uv,u=a.indices;return ye(o,i),{position:o,normal:v,uv:h,indices:u}}function de(e){var t=e.data,n=e.height,r=e.width,i=e.bottomHeight,a=function(e,t){t=Object.assign({},t);for(var n=[1/0,1/0],r=[-1/0,-1/0],i=0;i<e.length;i++)ue(e[i],n,r);t.boundingRect=t.boundingRect||{x:n[0],y:n[1],width:r[0]-n[0],height:r[1]-n[1]},$(t);var a=t.scale||[1,1];null==t.lineWidth&&(t.lineWidth=1),null==t.miterLimit&&(t.miterLimit=2);for(var o=[],v=0;v<e.length;v++){var h=e[v],u=t.simplify/Math.max(a[0],a[1]);u>0&&(h=V(h,u,!0)),o.push(oe(h,v,t))}return ae(o,t)}(t,{lineWidth:r,depth:n}),o=a.position,v=a.normal,h=a.uv,u=a.indices;return ye(o,i),{position:o,normal:v,uv:h,indices:u}}function ge(e,t){for(var n=new Float32Array(t),r=0,i=0;i<e.length;++i)n.set(e[i],r),r+=e[i].length;return n}function ye(e,t){if(void 0!==t&&"number"==typeof t&&0!==t)for(var n=0,r=e.length;n<r;n+=3)e[n+2]+=t}var me=Math.PI/180,Me=6378137*Math.PI/180;function be(e,t){var n,r=85.0511287798,i=e.x,a=Math.max(Math.min(r,e.y),-r);n=0===a?0:Math.log(Math.tan((90+a)*me/2))/me;var o=i*Me,v=n*Me;return t?(t.x=o,t.y=v,t):{x:o,y:v}}function we(e,t,n,r){var i=e[0]*(t.x-e[2])/n,a=-e[1]*(t.y-e[3])/n;return r?(r.x=i,r.y=a,r):{x:i,y:a}}function Se(e){void 0===e&&(e=[]);for(var t=e.length,n=new Float32Array(3*t),r=0;r<t;r++){var i=e[r],a=3*r;n[a]=i[0],n[a+1]=i[1]}return n}function Ze(e){for(var t=new Float32Array(2*e.length-6),n=0,r=0,i=e.length/3;r<i;r++){var a=e[3*r],o=e[3*r+1],v=e[3*r+2];if(r>0&&r<i-1){var h=3*n;t[h]=a,t[h+1]=o,t[h+2]=v,n++}var u=3*n;t[u]=a,t[u+1]=o,t[u+2]=v,n++}return t}function Ae(e){var t=0,n=e.length;if(1===n)return e[0];for(var r=0;r<n;r++)t+=e[r].length;for(var i=new Float32Array(t),a=0,o=0;o<n;o++)i.set(e[o],a),a+=e[o].length;return i}e.initialize=function(){},e.onmessage=function(e,t){var n=e.data,r=n.type,i=n.datas,a=n.glRes,o=n.matrix,v=n.center;if("ExtrudePolygons"===r){se(i,v,a,o);var h=ce(i);t(null,h,[h.position,h.normal,h.uv,h.indices])}else if("ExtrudeLines"===r){for(var u=0,l=i.length;u<l;u++)for(var f=0,s=i[u].data.length;f<s;f++)i[u].data[f]=xe(i[u].data[f],i[u].center||v,a,o);var x=ce(i,!0);t(null,x,[x.position,x.normal,x.uv,x.indices])}else if("ExtrudePolygon"===r){var c=[],p=[];i.forEach((function(e){var t=[e];se(t,v,a,o);var n=ce(t),r=n.position,i=n.normal,h=n.uv,u=n.indices;c.push({id:e.id,position:r,normal:i,uv:h,indices:u}),p.push(r,i,h,u)})),t(null,c,p)}else if("Line"===r||"FatLine"===r){for(var d=[],g=[],y=0,m=i.length;y<m;y++){for(var M=[],b=0,w=i[y].data.length;b<w;b++){i[y].data[b]=xe(i[y].data[b],i[y].center||v,a,o);var S=Se(i[y].data[b]);M.push(Ze(S))}var Z=Ae(M);ye(Z,i[y].bottomHeight),d.push({id:i[y].id,position:Z.buffer}),g.push(Z.buffer)}t(null,d,g)}else if("Lines"===r||"FatLines"===r){for(var A=0,z=[],F=[],R=0,q=[],P=0,L=i.length;P<L;P++){for(var V=0,B=0,E=i[P].data.length;B<E;B++){i[P].data[B]=xe(i[P].data[B],i[P].center||v,a,o);var U=Se(i[P].data[B]);ye(U,i[P].bottomHeight),V+=U.length/3*2-2,q.push(Ze(U))}var H=V;z[P]=[A,A+H],A+=H,F[P]={position:{count:V,start:R,end:R+3*V},hide:!1},"FatLines"===r&&(F[P].instanceStart={count:V,start:R,end:R+3*V},F[P].instanceEnd={count:V,start:R,end:R+3*V}),R+=3*V}var I=Ae(q);t(null,{id:i.id,position:I.buffer,geometriesAttributes:F,faceMap:z},[I.buffer])}else if("ExtrudeLine"===r){for(var O=0,T=i.length;O<T;O++)for(var W=0,j=i[O].data.length;W<j;W++)i[O].data[W]=xe(i[O].data[W],i[O].center||v,a,o);var k=[],_=[];i.forEach((function(e){var t=ce([e],!0),n=t.position,r=t.normal,i=t.uv,a=t.indices;k.push({id:e.id,position:n,normal:r,uv:i,indices:a}),_.push(n,r,i,a)})),t(null,k,_)}},Object.defineProperty(e,"__esModule",{value:!0})})'
  var workerName = '__maptalks.three__'
  function getWorkerName () {
    return workerName
  }
  function getWorkerCode () {
    return workerCode
  }

  var options = {
    renderer: 'gl',
    doubleBuffer: false,
    glOptions: null,
    geometryEvents: true,
    identifyCountOnEvent: 0,
    forceRenderOnZooming: true,
    loopRenderCount: 50
  }
  var RADIAN = Math.PI / 180
  var LINEPRECISIONS = [
    [4000, 220],
    [2000, 100],
    [1000, 30],
    [500, 15],
    [100, 5],
    [50, 2],
    [10, 1],
    [5, 0.7],
    [2, 0.1],
    [1, 0.05],
    [0.5, 0.02],
    [0.4, 0.01],
    [0.1, 0.005],
    [0.05, 0.002],
    [0.01, 0.001]
  ]
  var EVENTS = [
    'mousemove',
    'click',
    'mousedown',
    'mouseup',
    'dblclick',
    'contextmenu',
    'touchstart',
    'touchmove',
    'touchend'
  ]
  var TEMP_COORD = new maptalks__namespace.Coordinate(0, 0)
  var TEMP_POINT = new maptalks__namespace.Point(0, 0)
  var KEY_FBO = '__webglFramebuffer' // const MATRIX4 = new THREE.Matrix4();

  /**
   * A Layer to render with THREE.JS (http://threejs.org), the most popular library for WebGL. <br>
   *
   * @classdesc
   * A layer to render with THREE.JS
   * @example
   *  var layer = new maptalks.ThreeLayer('three');
   *
   *  layer.prepareToDraw = function (gl, scene, camera) {
   *      var size = map.getSize();
   *      return [size.width, size.height]
   *  };
   *
   *  layer.draw = function (gl, view, scene, camera, width,height) {
   *      //...
   *  };
   *  layer.addTo(map);
   * @class
   * @category layer
   * @extends {maptalks.CanvasLayer}
   * @param {String|Number} id - layer's id
   * @param {Object} options - options defined in [options]{@link maptalks.ThreeLayer#options}
   */

  var ThreeLayer = /*#__PURE__*/ (function (_maptalks$CanvasLayer) {
    _inheritsLoose(ThreeLayer, _maptalks$CanvasLayer)

    function ThreeLayer (id, options) {
      var _this

      _this = _maptalks$CanvasLayer.call(this, id, options) || this
      _this._animationBaseObjectMap = {}
      _this._needsUpdate = true
      _this._mousemoveTimeOut = 0
      _this._baseObjects = []
      _this._delayMeshes = []
      _this.type = 'ThreeLayer'
      return _this
    }

    var _proto = ThreeLayer.prototype

    _proto.isMercator = function isMercator () {
      var map = this.getMap()

      if (!map) {
        return false
      }

      var sp = map.getSpatialReference()
      var prj = sp._projection,
        res = sp._resolutions

      if (
        prj &&
        prj.code === 'EPSG:3857' &&
        res &&
        res.length &&
        Math.floor(res[0]) === 156543 &&
        map.getGLRes
      ) {
        return true
      }

      return false
    }

    _proto.isRendering = function isRendering () {
      var map = this.getMap()

      if (!map) {
        return false
      }

      return map.isInteracting() || map.isAnimating()
    }

    _proto.prepareToDraw = function prepareToDraw () {}
    /**
     * Draw method of ThreeLayer
     * In default, it calls renderScene, refresh the camera and the scene
     */

    _proto.draw = function draw (gl, view, scene, camera, timeStamp, context) {
      this.renderScene(context, this)
    }
    /**
     * Draw method of ThreeLayer when map is interacting
     * In default, it calls renderScene, refresh the camera and the scene
     */

    _proto.drawOnInteracting = function drawOnInteracting (
      gl,
      view,
      scene,
      camera,
      event,
      timeStamp,
      context
    ) {
      this.renderScene(context, this)
    }
    /**
     * Convert a geographic coordinate to THREE Vector3
     * @param  {maptalks.Coordinate} coordinate - coordinate
     * @param {Number} [z=0] z value
     * @return {THREE.Vector3}
     */

    _proto.coordinateToVector3 = function coordinateToVector3 (coordinate, z) {
      if (z === void 0) {
        z = 0
      }

      var map = this.getMap()

      if (!map) {
        return null
      }

      var isArray = Array.isArray(coordinate)

      if (isArray) {
        TEMP_COORD.x = coordinate[0]
        TEMP_COORD.y = coordinate[1]
      } else if (!(coordinate instanceof maptalks__namespace.Coordinate)) {
        coordinate = new maptalks__namespace.Coordinate(coordinate)
      }

      var res = getGLRes(map)
      var p = coordinateToPoint(
        map,
        isArray ? TEMP_COORD : coordinate,
        res,
        TEMP_POINT
      )
      return new THREE__namespace.Vector3(p.x, p.y, z)
    }

    _proto.coordinatiesToGLFloatArray = function coordinatiesToGLFloatArray (
      coordinaties,
      centerPt
    ) {
      var map = this.getMap()

      if (!map) {
        return null
      }

      var res = getGLRes(map)
      var len = coordinaties.length
      var array = new Float32Array(len * 2)
      var array3d = new Float32Array(len * 3)

      for (var i = 0; i < len; i++) {
        var coordinate = coordinaties[i]
        var isArray = Array.isArray(coordinate)

        if (isArray) {
          TEMP_COORD.x = coordinate[0]
          TEMP_COORD.y = coordinate[1]
        } else if (!(coordinate instanceof maptalks__namespace.Coordinate)) {
          coordinate = new maptalks__namespace.Coordinate(coordinate)
        }

        var p = coordinateToPoint(
          map,
          isArray ? TEMP_COORD : coordinate,
          res,
          TEMP_POINT
        )
        p.x -= centerPt.x
        p.y -= centerPt.y
        var idx = i * 2
        array[idx] = p.x
        array[idx + 1] = p.y
        var idx1 = i * 3
        array3d[idx1] = p.x
        array3d[idx1 + 1] = p.y
        array3d[idx1 + 2] = 0
      }

      return {
        positions: array3d,
        positons2d: array
      }
    }

    _proto.coordinatiesToGLArray = function coordinatiesToGLArray (
      coordinaties,
      centerPt
    ) {
      var map = this.getMap()

      if (!map) {
        return null
      }

      var res = getGLRes(map)
      var len = coordinaties.length
      var array = new Array(len)

      for (var i = 0; i < len; i++) {
        var coordinate = coordinaties[i]
        var isArray = Array.isArray(coordinate)

        if (isArray) {
          TEMP_COORD.x = coordinate[0]
          TEMP_COORD.y = coordinate[1]
        } else if (!(coordinate instanceof maptalks__namespace.Coordinate)) {
          coordinate = new maptalks__namespace.Coordinate(coordinate)
        }

        var p = coordinateToPoint(
          map,
          isArray ? TEMP_COORD : coordinate,
          res,
          TEMP_POINT
        )
        p.x -= centerPt.x
        p.y -= centerPt.y
        array[i] = [p.x, p.y]
      }

      return array
    }
    /**
     * Convert geographic distance to THREE Vector3
     * @param  {Number} w - width
     * @param  {Number} h - height
     * @return {THREE.Vector3}
     */

    _proto.distanceToVector3 = function distanceToVector3 (w, h, coord) {
      if (
        (w === 0 && h === 0) ||
        !maptalks__namespace.Util.isNumber(w) ||
        !maptalks__namespace.Util.isNumber(h)
      ) {
        return new THREE__namespace.Vector3(0, 0, 0)
      }

      var map = this.getMap()
      var res = getGLRes(map)
      var center = coord || map.getCenter()

      if (!(center instanceof maptalks__namespace.Coordinate)) {
        center = new maptalks__namespace.Coordinate(center)
      }

      var target = map.locate(center, w, h)
      var p0 = coordinateToPoint(map, center, res),
        p1 = coordinateToPoint(map, target, res)
      var x = Math.abs(p1.x - p0.x) * maptalks__namespace.Util.sign(w)
      var y = Math.abs(p1.y - p0.y) * maptalks__namespace.Util.sign(h)
      return new THREE__namespace.Vector3(x, y, 0)
    }
    /**
     * Convert a Polygon or a MultiPolygon to THREE shape
     * @param  {maptalks.Polygon|maptalks.MultiPolygon} polygon - polygon or multipolygon
     * @return {THREE.Shape}
     */

    _proto.toShape = function toShape (polygon) {
      var _this2 = this

      if (!polygon) {
        return null
      }

      if (polygon instanceof maptalks__namespace.MultiPolygon) {
        return polygon.getGeometries().map(function (c) {
          return _this2.toShape(c)
        })
      }

      var center = polygon.getCenter()
      var centerPt = this.coordinateToVector3(center)
      var shell = polygon.getShell()
      var outer = shell.map(function (c) {
        var vector = _this2.coordinateToVector3(c).sub(centerPt)

        return new THREE__namespace.Vector2(vector.x, vector.y)
      })
      var shape = new THREE__namespace.Shape(outer)
      var holes = polygon.getHoles()

      if (holes && holes.length > 0) {
        shape.holes = holes.map(function (item) {
          var pts = item.map(function (c) {
            var vector = _this2.coordinateToVector3(c).sub(centerPt)

            return new THREE__namespace.Vector2(vector.x, vector.y)
          })
          return new THREE__namespace.Shape(pts)
        })
      }

      return shape
    }
    /**
     * todo   This should also be extracted as a component
     * @param {*} polygon
     * @param {*} altitude
     * @param {*} material
     * @param {*} height
     */

    _proto.toExtrudeMesh = function toExtrudeMesh (
      polygon,
      altitude,
      material,
      height
    ) {
      var _this3 = this

      if (!polygon) {
        return null
      }

      if (polygon instanceof maptalks__namespace.MultiPolygon) {
        return polygon.getGeometries().map(function (c) {
          return _this3.toExtrudeMesh(c, altitude, material, height)
        })
      }

      var rings = polygon.getCoordinates()
      rings.forEach(function (ring) {
        var length = ring.length

        for (var i = length - 1; i >= 1; i--) {
          if (ring[i].equals(ring[i - 1])) {
            ring.splice(i, 1)
          }
        }
      })
      polygon.setCoordinates(rings)
      var shape = this.toShape(polygon)
      var center = this.coordinateToVector3(polygon.getCenter())
      height = maptalks__namespace.Util.isNumber(height) ? height : altitude
      height = this.distanceToVector3(height, height).x
      var amount = this.distanceToVector3(altitude, altitude).x //{ amount: extrudeH, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

      var config = {
        bevelEnabled: false,
        bevelSize: 1
      }
      var name = parseInt(THREE__namespace.REVISION) >= 93 ? 'depth' : 'amount'
      config[name] = height
      var geom = new THREE__namespace.ExtrudeGeometry(shape, config)
      var buffGeom = geom

      if (THREE__namespace.BufferGeometry.prototype.fromGeometry) {
        buffGeom = new THREE__namespace.BufferGeometry()
        buffGeom.fromGeometry(geom)
      }

      var mesh = new THREE__namespace.Mesh(buffGeom, material)
      mesh.position.set(center.x, center.y, amount - height)
      return mesh
    }
    /**
     *
     * @param {maptalks.Polygon|maptalks.MultiPolygon} polygon
     * @param {Object} options
     * @param {THREE.Material} material
     */

    _proto.toExtrudePolygon = function toExtrudePolygon (
      polygon,
      options,
      material
    ) {
      return new ExtrudePolygon(polygon, options, material, this)
    }
    /**
     *
     * @param {maptalks.Coordinate} coordinate
     * @param {Object} options
     * @param {THREE.Material} material
     */

    _proto.toBar = function toBar (coordinate, options, material) {
      return new Bar(coordinate, options, material, this)
    }
    /**
     *
     * @param {maptalks.LineString} lineString
     * @param {Object} options
     * @param {THREE.LineMaterial} material
     */

    _proto.toLine = function toLine (lineString, options, material) {
      return new Line(lineString, options, material, this)
    }
    /**
     *
     * @param {maptalks.LineString} lineString
     * @param {Object} options
     * @param {THREE.Material} material
     */

    _proto.toExtrudeLine = function toExtrudeLine (
      lineString,
      options,
      material
    ) {
      return new ExtrudeLine(lineString, options, material, this)
    }
    /**
     *
     * @param {THREE.Mesh|THREE.Group} model
     * @param {Object} options
     */

    _proto.toModel = function toModel (model, options) {
      return new Model(model, options, this)
    }
    /**
     *
     * @param {maptalks.LineString} lineString
     * @param {*} options
     * @param {THREE.Material} material
     */

    _proto.toExtrudeLineTrail = function toExtrudeLineTrail (
      lineString,
      options,
      material
    ) {
      return new ExtrudeLineTrail(lineString, options, material, this)
    }
    /**
     *
     * @param {*} polygons
     * @param {*} options
     * @param {*} material
     */

    _proto.toExtrudePolygons = function toExtrudePolygons (
      polygons,
      options,
      material
    ) {
      return new ExtrudePolygons(polygons, options, material, this)
    }
    /**
     *
     * @param {maptalks.Coordinate} coordinate
     * @param {*} options
     * @param {*} material
     */

    _proto.toPoint = function toPoint (coordinate, options, material) {
      return new Point(coordinate, options, material, this)
    }
    /**
     *
     * @param {Array} points
     * @param {*} options
     * @param {*} material
     */

    _proto.toPoints = function toPoints (points, options, material) {
      return new Points(points, options, material, this)
    }
    /**
     *
     * @param {Array} points
     * @param {*} options
     * @param {*} material
     */

    _proto.toBars = function toBars (points, options, material) {
      return new Bars(points, options, material, this)
    }
    /**
     *
     * @param {Array[maptalks.LineString]} lineStrings
     * @param {*} options
     * @param {*} material
     */

    _proto.toExtrudeLines = function toExtrudeLines (
      lineStrings,
      options,
      material
    ) {
      return new ExtrudeLines(lineStrings, options, material, this)
    }
    /**
     *
     * @param {Array[maptalks.LineString]} lineStrings
     * @param {*} options
     * @param {*} material
     */

    _proto.toLines = function toLines (lineStrings, options, material) {
      return new Lines(lineStrings, options, material, this)
    }
    /**
     *
     * @param {*} url
     * @param {*} options
     * @param {*} getMaterial
     * @param {*} worker
     */

    _proto.toThreeVectorTileLayer = function toThreeVectorTileLayer (
      url,
      options,
      getMaterial
    ) {
      return new ThreeVectorTileLayer(url, options, getMaterial, this)
    }
    /**
     *
     * @param {*} extent
     * @param {*} options
     * @param {*} material
     */

    _proto.toTerrain = function toTerrain (extent, options, material) {
      return new Terrain(extent, options, material, this)
    }
    /**
     *
     * @param {*} url
     * @param {*} options
     * @param {*} material
     */

    _proto.toTerrainVectorTileLayer = function toTerrainVectorTileLayer (
      url,
      options,
      material
    ) {
      return new TerrainVectorTileLayer(url, options, material, this)
    }
    /**
     *
     * @param {*} data
     * @param {*} options
     * @param {*} material
     */

    _proto.toHeatMap = function toHeatMap (data, options, material) {
      return new HeatMap(data, options, material, this)
    }
    /**
     *
     * @param {*} lineString
     * @param {*} options
     * @param {*} material
     */

    _proto.toFatLine = function toFatLine (lineString, options, material) {
      return new FatLine(lineString, options, material, this)
    }
    /**
     *
     * @param {*} lineStrings
     * @param {*} options
     * @param {*} material
     */

    _proto.toFatLines = function toFatLines (lineStrings, options, material) {
      return new FatLines(lineStrings, options, material, this)
    }
    /**
     *
     * @param {*} coorindate
     * @param {*} options
     * @param {*} material
     */

    _proto.toBox = function toBox (coorindate, options, material) {
      return new Box(coorindate, options, material, this)
    }
    /**
     *
     * @param {*} points
     * @param {*} options
     * @param {*} material
     */

    _proto.toBoxs = function toBoxs (points, options, material) {
      return new Boxs(points, options, material, this)
    }

    _proto.getBaseObjects = function getBaseObjects () {
      return this.getMeshes().filter(function (mesh) {
        return mesh instanceof BaseObject
      })
    }

    _proto.getMeshes = function getMeshes () {
      var scene = this.getScene()

      if (!scene) {
        return []
      }

      var meshes = []

      for (var i = 0, len = scene.children.length; i < len; i++) {
        var child = scene.children[i]

        if (
          child instanceof THREE__namespace.Object3D &&
          !(child instanceof THREE__namespace.Camera)
        ) {
          meshes.push(child['__parent'] || child)
        }
      }

      return meshes
    }

    _proto.clear = function clear () {
      return this.clearMesh()
    }

    _proto.clearMesh = function clearMesh () {
      var scene = this.getScene()

      if (!scene) {
        return this
      }

      for (var i = scene.children.length - 1; i >= 0; i--) {
        var child = scene.children[i]

        if (
          child instanceof THREE__namespace.Object3D &&
          !(child instanceof THREE__namespace.Camera)
        ) {
          scene.remove(child)
          var parent = child['__parent']

          if (parent && parent instanceof BaseObject) {
            parent.isAdd = false

            parent._fire('remove', {
              target: parent
            })

            delete this._animationBaseObjectMap[child.uuid]
          }
        }
      }

      return this
    }

    _proto.lookAt = function lookAt (vector) {
      var renderer = this._getRenderer()

      if (renderer) {
        renderer.context.lookAt(vector)
      }

      return this
    }

    _proto.getCamera = function getCamera () {
      var renderer = this._getRenderer()

      if (renderer) {
        return renderer.camera
      }

      return null
    }

    _proto.getScene = function getScene () {
      var renderer = this._getRenderer()

      if (renderer) {
        return renderer.scene
      }

      return null
    }

    _proto.renderScene = function renderScene (context, layer) {
      var renderer = this._getRenderer()

      if (renderer) {
        renderer.clearCanvas()
        renderer.renderScene(context) //外部调用时，直接redraw

        if (!layer) {
          renderer.setToRedraw()
        }
      }

      return this
    }

    _proto.loop = function loop (render) {
      if (render === void 0) {
        render = false
      }

      var delayMeshes = this._delayMeshes

      if (!delayMeshes.length) {
        return
      }

      var map = this.getMap()

      if (!map || map.isAnimating() || map.isInteracting()) {
        return
      }

      var loopRenderCount = this.options.loopRenderCount || 50
      var meshes = delayMeshes.slice(0, loopRenderCount)

      if (meshes) {
        this.addMesh(meshes, render)
      }

      delayMeshes.splice(0, loopRenderCount)
    }

    _proto.renderPickScene = function renderPickScene () {
      var renderer = this._getRenderer()

      if (renderer) {
        var pick = renderer.pick

        if (pick) {
          pick.pick(this._containerPoint)
        }
      }

      return this
    }

    _proto.getThreeRenderer = function getThreeRenderer () {
      var renderer = this._getRenderer()

      if (renderer) {
        return renderer.context
      }

      return null
    }

    _proto.getPick = function getPick () {
      var renderer = this._getRenderer()

      if (renderer) {
        return renderer.pick
      }

      return null
    }

    _proto.delayAddMesh = function delayAddMesh (meshes) {
      if (!meshes) return this

      if (!Array.isArray(meshes)) {
        meshes = [meshes]
      }

      for (var i = 0, len = meshes.length; i < len; i++) {
        this._delayMeshes.push(meshes[i])
      }

      return this
    }
    /**
     * add object3ds
     * @param {BaseObject} meshes
     */

    _proto.addMesh = function addMesh (meshes, render) {
      var _this4 = this

      if (render === void 0) {
        render = true
      }

      if (!meshes) return this

      if (!Array.isArray(meshes)) {
        meshes = [meshes]
      }

      var scene = this.getScene()
      meshes.forEach(function (mesh) {
        if (mesh instanceof BaseObject) {
          scene.add(mesh.getObject3d())

          if (!mesh.isAdd) {
            mesh.isAdd = true

            mesh._fire('add', {
              target: mesh
            })
          }

          if (
            mesh._animation &&
            maptalks__namespace.Util.isFunction(mesh._animation)
          ) {
            _this4._animationBaseObjectMap[mesh.getObject3d().uuid] = mesh
          }
        } else if (mesh instanceof THREE__namespace.Object3D) {
          scene.add(mesh)
        }
      })

      this._zoomend()

      if (render) {
        var renderer = this._getRenderer()

        if (renderer) {
          renderer.setToRedraw()
        }
      }

      return this
    }
    /**
     * remove object3ds
     * @param {BaseObject} meshes
     */

    _proto.removeMesh = function removeMesh (meshes, render) {
      var _this5 = this

      if (render === void 0) {
        render = true
      }

      if (!meshes) return this

      if (!Array.isArray(meshes)) {
        meshes = [meshes]
      }

      var scene = this.getScene()
      meshes.forEach(function (mesh) {
        if (mesh instanceof BaseObject) {
          scene.remove(mesh.getObject3d())

          if (mesh.isAdd) {
            mesh.isAdd = false

            mesh._fire('remove', {
              target: mesh
            })
          }

          if (
            mesh._animation &&
            maptalks__namespace.Util.isFunction(mesh._animation)
          ) {
            delete _this5._animationBaseObjectMap[mesh.getObject3d().uuid]
          }

          var delayMeshes = _this5._delayMeshes

          if (delayMeshes.length) {
            for (var i = 0, len = delayMeshes.length; i < len; i++) {
              if (delayMeshes[i] === mesh) {
                delayMeshes.splice(i, 1)
                break
              }
            }
          }
        } else if (mesh instanceof THREE__namespace.Object3D) {
          scene.remove(mesh)
        }
      })

      if (render) {
        var renderer = this._getRenderer()

        if (renderer) {
          renderer.setToRedraw()
        }
      }

      return this
    }

    _proto._initRaycaster = function _initRaycaster () {
      if (!this._raycaster) {
        this._raycaster = new THREE__namespace.Raycaster()
        this._mouse = new THREE__namespace.Vector2()
      }

      return this
    }
    /**
     *
     * @param {Coordinate} coordinate
     * @param {Object} options
     * @return {Array}
     */

    _proto.identify = function identify (coordinate, options) {
      var _this6 = this

      if (!coordinate) {
        console.error('coordinate is null,it should be Coordinate')
        return []
      }

      if (Array.isArray(coordinate)) {
        coordinate = new maptalks__namespace.Coordinate(coordinate)
      }

      if (!(coordinate instanceof maptalks__namespace.Coordinate)) {
        console.error('coordinate type is error,it should be Coordinate')
        return []
      }

      var p = this.getMap().coordToContainerPoint(coordinate)
      this._containerPoint = p
      var x = p.x,
        y = p.y

      this._initRaycaster()

      var raycaster = this._raycaster,
        mouse = this._mouse,
        camera = this.getCamera(),
        scene = this.getScene(),
        size = this.getMap().getSize() //fix Errors will be reported when the layer is not initialized

      if (!scene) {
        return []
      }

      var width = size.width,
        height = size.height
      mouse.x = (x / width) * 2 - 1
      mouse.y = -(y / height) * 2 + 1
      raycaster.setFromCamera(mouse, camera) //set linePrecision for THREE.Line

      setRaycasterLinePrecision(
        raycaster,
        this._getLinePrecision(this.getMap().getResolution())
      )
      var children = [],
        hasidentifyChildren = []
      scene.children.forEach(function (mesh) {
        var parent = mesh['__parent']

        if (parent && parent.getOptions) {
          var baseObject = parent
          var interactive = baseObject.getOptions().interactive

          if (interactive && baseObject.isVisible()) {
            //If baseobject has its own hit detection
            if (
              baseObject.identify &&
              maptalks__namespace.Util.isFunction(baseObject.identify)
            ) {
              hasidentifyChildren.push(baseObject)
            } else {
              children.push(mesh)
            }
          }
        } else if (
          mesh instanceof THREE__namespace.Mesh ||
          mesh instanceof THREE__namespace.Group
        ) {
          children.push(mesh)
        }
      })
      var baseObjects = []
      var intersects = raycaster.intersectObjects(children, true)

      if (intersects && Array.isArray(intersects) && intersects.length) {
        baseObjects = intersects.map(function (intersect) {
          var object = intersect.object
          object = _this6._recursionMesh(object) || {}
          var baseObject = object['__parent'] || object
          baseObject.faceIndex = intersect.faceIndex
          baseObject.index = intersect.index
          return baseObject
        })
      }

      this.renderPickScene()

      if (hasidentifyChildren.length) {
        hasidentifyChildren.forEach(function (baseObject) {
          // baseObject identify
          if (baseObject.identify(coordinate)) {
            baseObjects.push(baseObject)
          }
        })
      }

      var len = baseObjects.length

      for (var i = 0; i < len; i++) {
        if (baseObjects[i]) {
          for (var j = i + 1; j < len; j++) {
            if (baseObjects[i] === baseObjects[j]) {
              baseObjects.splice(j, 1)
            }
          }
        }
      }

      options = maptalks__namespace.Util.extend({}, options)
      var count = options['count']
      return maptalks__namespace.Util.isNumber(count) && count > 0
        ? baseObjects.slice(0, count)
        : baseObjects
    }
    /**
     * Recursively finding the root node of mesh,Until it is scene node
     * @param {*} mesh
     */

    _proto._recursionMesh = function _recursionMesh (mesh) {
      while (mesh && mesh.parent !== this.getScene()) {
        mesh = mesh.parent
      }

      return mesh
    } //get Line Precision by Resolution

    _proto._getLinePrecision = function _getLinePrecision (res) {
      if (res === void 0) {
        res = 10
      }

      for (var i = 0, len = LINEPRECISIONS.length; i < len; i++) {
        var _LINEPRECISIONS$i = LINEPRECISIONS[i],
          resLevel = _LINEPRECISIONS$i[0],
          precision = _LINEPRECISIONS$i[1]

        if (res > resLevel) {
          return precision
        }
      }

      return 0.01
    }
    /**
     * fire baseObject events
     * @param {*} e
     */

    _proto._identifyBaseObjectEvents = function _identifyBaseObjectEvents (e) {
      if (!this.options.geometryEvents) {
        return this
      }

      var map = this.map || this.getMap() //When map interaction, do not carry out mouse movement detection, which can have better performance

      if (map.isInteracting() || !map.options.geometryEvents) {
        return this
      }

      var type = e.type,
        coordinate = e.coordinate
      var now = maptalks__namespace.Util.now()

      if (this._mousemoveTimeOut && type === 'mousemove') {
        if (now - this._mousemoveTimeOut < 64) {
          return this
        }
      }

      this._mousemoveTimeOut = now // map.resetCursor('default');

      var identifyCountOnEvent = this.options['identifyCountOnEvent']
      var count = Math.max(
        0,
        maptalks__namespace.Util.isNumber(identifyCountOnEvent)
          ? identifyCountOnEvent
          : 0
      )

      if (count === 0) {
        count = Infinity
      }

      var baseObjects = this.identify(coordinate, {
        count: count
      })
      var scene = this.getScene()

      if (baseObjects.length === 0 && scene) {
        for (var i = 0, len = scene.children.length; i < len; i++) {
          var child = scene.children[i] || {}
          var parent = child['__parent']

          if (parent) {
            parent.fire(
              'empty',
              Object.assign({}, e, {
                target: parent
              })
            )
          }
        }
      }

      if (type === 'mousemove') {
        // if (baseObjects.length) {
        //     map.setCursor('pointer');
        // }
        // mouseout objects
        var outBaseObjects = []

        if (this._baseObjects) {
          this._baseObjects.forEach(function (baseObject) {
            var isOut = true
            baseObjects.forEach(function (baseO) {
              if (baseObject === baseO) {
                isOut = false
              }
            })

            if (isOut) {
              outBaseObjects.push(baseObject)
            }
          })
        }

        outBaseObjects.forEach(function (baseObject) {
          if (baseObject && baseObject instanceof BaseObject) {
            // reset _mouseover status
            // Deal with the mergedmesh
            if (baseObject.getSelectMesh) {
              if (!baseObject.isHide) {
                baseObject._mouseover = false
                baseObject.fire(
                  'mouseout',
                  Object.assign({}, e, {
                    target: baseObject,
                    type: 'mouseout',
                    selectMesh: null
                  })
                )
                baseObject.closeToolTip()
              }
            } else {
              baseObject._mouseover = false
              baseObject.fire(
                'mouseout',
                Object.assign({}, e, {
                  target: baseObject,
                  type: 'mouseout'
                })
              )
              baseObject.closeToolTip()
            }
          }
        })
        baseObjects.forEach(function (baseObject) {
          if (baseObject instanceof BaseObject) {
            if (!baseObject._mouseover) {
              baseObject.fire(
                'mouseover',
                Object.assign({}, e, {
                  target: baseObject,
                  type: 'mouseover',
                  selectMesh: baseObject.getSelectMesh
                    ? baseObject.getSelectMesh()
                    : null
                })
              )
              baseObject._mouseover = true
            }

            baseObject.fire(
              type,
              Object.assign({}, e, {
                target: baseObject,
                selectMesh: baseObject.getSelectMesh
                  ? baseObject.getSelectMesh()
                  : null
              })
            ) // tooltip

            var tooltip = baseObject.getToolTip()

            if (tooltip && !tooltip._owner) {
              tooltip.addTo(baseObject)
            }

            baseObject.openToolTip(coordinate)
          }
        })
        this._baseObjects = baseObjects
      } else {
        baseObjects.forEach(function (baseObject) {
          if (baseObject instanceof BaseObject) {
            baseObject.fire(
              type,
              Object.assign({}, e, {
                target: baseObject,
                selectMesh: baseObject.getSelectMesh
                  ? baseObject.getSelectMesh()
                  : null
              })
            )

            if (type === 'click') {
              var infoWindow = baseObject.getInfoWindow()

              if (infoWindow && !infoWindow._owner) {
                infoWindow.addTo(baseObject)
              }

              baseObject.openInfoWindow(coordinate)
            }
          }
        })
      }

      return this
    }
    /**
     *map zoom event
     */

    _proto._zoomend = function _zoomend () {
      var scene = this.getScene()

      if (!scene) {
        return
      }

      var zoom = this.getMap().getZoom()
      scene.children.forEach(function (mesh) {
        var parent = mesh['__parent']

        if (parent && parent.getOptions) {
          var baseObject = parent

          if (
            baseObject.zoomChange &&
            maptalks__namespace.Util.isFunction(baseObject.zoomChange)
          ) {
            baseObject.zoomChange(zoom)
          }

          var minZoom = baseObject.getMinZoom(),
            maxZoom = baseObject.getMaxZoom()

          if (zoom < minZoom || zoom > maxZoom) {
            if (baseObject.isVisible()) {
              baseObject.getObject3d().visible = false
            }

            baseObject._zoomVisible = false
          } else if (minZoom <= zoom && zoom <= maxZoom) {
            if (baseObject._visible) {
              baseObject.getObject3d().visible = true
            }

            baseObject._zoomVisible = true
          }
        }
      })
    }

    _proto.onAdd = function onAdd () {
      var _this7 = this

      _maptalks$CanvasLayer.prototype.onAdd.call(this)

      var map = this.map || this.getMap()
      if (!map) return this
      EVENTS.forEach(function (event) {
        map.on(event, _this7._identifyBaseObjectEvents, _this7)
      })
      this._needsUpdate = true

      if (!this._animationBaseObjectMap) {
        this._animationBaseObjectMap = {}
      }

      map.on('zooming zoomend', this._zoomend, this)
      return this
    }

    _proto.onRemove = function onRemove () {
      var _this8 = this

      _maptalks$CanvasLayer.prototype.onRemove.call(this)

      var map = this.map || this.getMap()
      if (!map) return this
      EVENTS.forEach(function (event) {
        map.off(event, _this8._identifyBaseObjectEvents, _this8)
      })
      map.off('zooming zoomend', this._zoomend, this)
      return this
    }

    _proto._callbackBaseObjectAnimation = function _callbackBaseObjectAnimation () {
      var layer = this

      if (layer._animationBaseObjectMap) {
        for (var uuid in layer._animationBaseObjectMap) {
          var baseObject = layer._animationBaseObjectMap[uuid]

          baseObject._animation()
        }
      }

      return this
    }
    /**
     * To make map's 2d point's 1 pixel euqal with 1 pixel on XY plane in THREE's scene:
     * 1. fov is 90 and camera's z is height / 2 * scale,
     * 2. if fov is not 90, a ratio is caculated to transfer z to the equivalent when fov is 90
     * @return {Number} fov ratio on z axis
     */

    _proto._getFovRatio = function _getFovRatio () {
      var map = this.getMap()
      var fov = map.getFov()
      return Math.tan((fov / 2) * RADIAN)
    }

    return ThreeLayer
  })(maptalks__namespace.CanvasLayer)

  ThreeLayer.mergeOptions(options)

  var ThreeRenderer = /*#__PURE__*/ (function (_maptalks$renderer$Ca) {
    _inheritsLoose(ThreeRenderer, _maptalks$renderer$Ca)

    function ThreeRenderer () {
      var _this9

      _this9 = _maptalks$renderer$Ca.apply(this, arguments) || this
      _this9._renderTime = 0
      _this9._renderTarget = null
      return _this9
    }

    var _proto2 = ThreeRenderer.prototype

    _proto2.getPrepareParams = function getPrepareParams () {
      return [this.scene, this.camera]
    }

    _proto2.getDrawParams = function getDrawParams () {
      return [this.scene, this.camera]
    }

    _proto2._drawLayer = function _drawLayer () {
      _maptalks$renderer$Ca.prototype._drawLayer.apply(this, arguments) // this.renderScene();
    }

    _proto2.hitDetect = function hitDetect () {
      return false
    }

    _proto2.createCanvas = function createCanvas () {
      _maptalks$renderer$Ca.prototype.createCanvas.call(this)

      this.createContext()
    }

    _proto2.createContext = function createContext () {
      if (this.canvas.gl && this.canvas.gl.wrap) {
        this.gl = this.canvas.gl.wrap()
      } else {
        var layer = this.layer
        var attributes = layer.options.glOptions || {
          alpha: true,
          depth: true,
          antialias: true,
          stencil: true,
          preserveDrawingBuffer: false
        }
        attributes.preserveDrawingBuffer = true
        this.gl = this.gl || this._createGLContext(this.canvas, attributes)
      }

      this._initThreeRenderer()

      this.layer.onCanvasCreate(this.context, this.scene, this.camera)
    }

    _proto2._initThreeRenderer = function _initThreeRenderer () {
      this.matrix4 = new THREE__namespace.Matrix4()
      var renderer = new THREE__namespace.WebGLRenderer({
        context: this.gl,
        alpha: true
      })
      renderer.autoClear = false
      renderer.setClearColor(new THREE__namespace.Color(1, 1, 1), 0)
      renderer.setSize(this.canvas.width, this.canvas.height)
      renderer.clear() // renderer.canvas = this.canvas;

      this.context = renderer
      var scene = (this.scene = new THREE__namespace.Scene())
      var map = this.layer.getMap()
      var fov = (map.getFov() * Math.PI) / 180
      var camera = (this.camera = new THREE__namespace.PerspectiveCamera(
        fov,
        map.width / map.height,
        map.cameraNear,
        map.cameraFar
      ))
      camera.matrixAutoUpdate = false

      this._syncCamera()

      scene.add(camera)
      this.pick = new GPUPick(this.layer)
      BaseObjectTaskManager.star()
    }

    _proto2.onCanvasCreate = function onCanvasCreate () {
      _maptalks$renderer$Ca.prototype.onCanvasCreate.call(this)
    }

    _proto2.resizeCanvas = function resizeCanvas (canvasSize) {
      if (!this.canvas) {
        return
      }

      var size,
        map = this.getMap()

      if (!canvasSize) {
        size = map.getSize()
      } else {
        size = canvasSize
      } // const r = maptalks.Browser.retina ? 2 : 1;

      var r = map.getDevicePixelRatio
        ? map.getDevicePixelRatio()
        : maptalks__namespace.Browser.retina
        ? 2
        : 1
      var canvas = this.canvas //retina support

      canvas.height = r * size['height']
      canvas.width = r * size['width']

      if (this.layer._canvas && canvas.style) {
        canvas.style.width = size.width + 'px'
        canvas.style.height = size.height + 'px'
      }

      this.context.setSize(canvas.width, canvas.height)
    }

    _proto2.clearCanvas = function clearCanvas () {
      if (!this.canvas) {
        return
      }

      this.context.clear()
    }

    _proto2.prepareCanvas = function prepareCanvas () {
      if (!this.canvas) {
        this.createCanvas()
      } else {
        this.clearCanvas()
      }

      this.layer.fire('renderstart', {
        context: this.context
      })
      return null
    }

    _proto2.renderScene = function renderScene (context) {
      var time = maptalks__namespace.Util.now() // Make sure to execute only once in a frame

      if (time - this._renderTime >= 16) {
        this.layer._callbackBaseObjectAnimation()

        this._renderTime = time
      }

      this._syncCamera() // 把 WebglRenderTarget 中的 framebuffer 替换为 GroupGLLayer 中的 fbo
      // 参考: https://stackoverflow.com/questions/55082573/use-webgl-texture-as-a-three-js-texture-map
      // 实现有点 hacky，需要留意 three 版本变动 对它的影响

      if (context && context.renderTarget) {
        var _context$renderTarget = context.renderTarget.fbo,
          width = _context$renderTarget.width,
          height = _context$renderTarget.height

        if (!this._renderTarget) {
          this._renderTarget = new THREE__namespace.WebGLRenderTarget(
            width,
            height,
            {
              // depthTexture: new THREE.DepthTexture(width, height, THREE.UnsignedInt248Type)
              depthBuffer: false
            }
          ) // 绘制一次以后，才会生成 framebuffer 对象

          this.context.setRenderTarget(this._renderTarget)
          this.context.render(this.scene, this.camera)
        } else {
          // 这里不能setSize，因为setSize中会把原有的fbo dipose掉
          // this._renderTarget.setSize(width, height);
          this._renderTarget.viewport.set(0, 0, width, height)

          this._renderTarget.scissor.set(0, 0, width, height)
        }

        var renderTargetProps = this.context.properties.get(this._renderTarget)
        var threeCreatedFBO = renderTargetProps[KEY_FBO] // 用GroupGLLayer的webgl fbo对象替换WebglRenderTarget的fbo对象

        renderTargetProps[KEY_FBO] = context.renderTarget.getFramebuffer(
          context.renderTarget.fbo
        )
        this.context.setRenderTarget(this._renderTarget)
        this.context.render(this.scene, this.camera)
        renderTargetProps[KEY_FBO] = threeCreatedFBO
      } else {
        this.context.render(this.scene, this.camera)
      }

      this.context.setRenderTarget(null)
      this.completeRender()
    }

    _proto2.remove = function remove () {
      delete this._drawContext

      if (this._renderTarget) {
        this._renderTarget.dispose()

        delete this._renderTarget
      }

      _maptalks$renderer$Ca.prototype.remove.call(this)
    }

    _proto2._syncCamera = function _syncCamera () {
      var map = this.getMap()
      var camera = this.camera
      camera.matrix.elements = map.cameraWorldMatrix
      camera.projectionMatrix.elements = map.projMatrix //https://github.com/mrdoob/three.js/commit/d52afdd2ceafd690ac9e20917d0c968ff2fa7661

      if (this.matrix4.invert) {
        camera.projectionMatrixInverse.elements = this.matrix4
          .copy(camera.projectionMatrix)
          .invert().elements
      } else {
        camera.projectionMatrixInverse.elements = this.matrix4.getInverse(
          camera.projectionMatrix
        ).elements
      }
    }

    _proto2._createGLContext = function _createGLContext (canvas, options) {
      var names = ['webgl2', 'webgl', 'experimental-webgl']
      var context = null
      /* eslint-disable no-empty */

      for (var i = 0; i < names.length; ++i) {
        try {
          context = canvas.getContext(names[i], options)
        } catch (e) {}

        if (context) {
          break
        }
      }

      return context
      /* eslint-enable no-empty */
    }

    return ThreeRenderer
  })(maptalks__namespace.renderer.CanvasLayerRenderer)

  ThreeLayer.registerRenderer('gl', ThreeRenderer)

  function getGLRes (map) {
    return map.getGLRes ? map.getGLRes() : map.getGLZoom()
  }

  function coordinateToPoint (map, coordinate, res, out) {
    if (map.coordToPointAtRes) {
      return map.coordToPointAtRes(coordinate, res, out)
    }

    return map.coordinateToPoint(coordinate, res, out)
  }

  if (maptalks__namespace.registerWorkerAdapter) {
    maptalks__namespace.registerWorkerAdapter(getWorkerName(), getWorkerCode())
  }

  exports.BaseObject = BaseObject
  exports.ExtrudeUtil = ExtrudeUtil
  exports.GeoJSONUtil = GeoJSONUtil
  exports.GeoUtil = GeoUtil
  exports.IdentifyUtil = IdentifyUtil
  exports.LineMaterial = LineMaterial
  exports.LineUtil = LineUtil
  exports.MergeGeometryUtil = MergeGeometryUtil
  exports.MergedMixin = MergedMixin
  exports.ThreeLayer = ThreeLayer
  exports.ThreeRenderer = ThreeRenderer
  exports.geometryExtrude = main

  Object.defineProperty(exports, '__esModule', { value: true })

  typeof console !== 'undefined' && console.log('maptalks.three v0.20.3')
})
//# sourceMappingURL=maptalks.three.es5.js.map
