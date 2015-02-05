/**
 *前端模图片处理 ppimage：
 * 兼容性：IE9+
 * version: 0.1.1
 *@author：ppfyang(hzyang_fan@corp.netease.com)
 */

'use strict';
(function (_global) {

    var MODE = {
        // Mode1:  Sharpen              (锐化)
        1: {
            method: 1,
            options: {divisor: 1, offset: 0, matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0, 1, 0]}
        },
        // Mode2:  Emboss               (浮雕)
        2: {
            method: 1,
            options: {divisor: 1, offset: 0, matrix: [-6, -3, 0, -3, 1, 3, 0, 3, 6, 1, 0]}
        },
        // Mode3:  Contrast-enhancement (增加对比度)
        3: {
            method: 1,
            options: {divisor: 1, offset: 0, matrix: [0, 0, 0, 0, 2, 0, 0, 0, 0, 1, -255]}
        },
        // Mode4:  Color burn           (颜色加深)
        4: {
            method: 1,
            options: {divisor: 1, offset: 0, matrix: [0, -2, 0, -2, 20, -2, 0, -2, 0, 10, -40]}
        },
        // Mode5:  Accented Edges       (强化边缘)
        5: {
            method: 1,
            options: {divisor: 1, offset: 0, matrix: [0, -1, 0, -1, 4, -1, 0, -1, 0, 1, 127]}
        },
        // Mode6:  Blur                 (模糊)
        6: {
            method: 1,
            options: {divisor: 1, offset: 0, matrix: [0, 1, 0, 1, 1, 1, 0, 1, 0, 5, 0]}
        },
        // Mode7:  Mirror               (镜像)
        7: {
            method: 2,
            options: {}
        },
        // Mode8:  Brighten             (变亮)
        8: {
            method: 3,
            options: {r: 'r += 100;', g: 'g += 100;', b: 'b += 100;'}
        },
        // Mode9:  Dark                 (变暗)
        9: {
            method: 3,
            options: {r: 'r -= 100;', g: 'g -= 100;', b: 'b -= 100;'}
        },
        // Mode10: Grayed               (变灰)
        10: {
            method: 3,
            options: {param: 'v = r * .3 + g * .59 + b * .11;', r: 'r = v;', g: 'g = v;', b: 'b = v;'}
        },
        // Mode11: Plate                (反色)
        11: {
            method: 3,
            options: {r: 'r = 255 - r;', g: 'g = 255 - g;', b: 'b =  255 - b;'}
        }
    }

    var RENDER = {

        // Convolution Matrix
        1: function (_input, _options, _opacity) {

            var _output = document.createElement("canvas").getContext('2d').createImageData(_input);

            var w = _input.width, h = _input.height;
            var iD = _input.data, oD = _output.data;
            var m = _options.matrix;

            // Convolution Calculate
            for (var y = 1; y < h - 1; y += 1) {
                for (var x = 1; x < w - 1; x += 1) {
                    for (var c = 0; c < 3; c += 1) {
                        var i = (y * w + x) * 4 + c;
                        oD[i] = _options.offset + (
                        m[0] * iD[i - w * 4 - 4]
                        + m[1] * iD[i - w * 4] + m[2] * iD[i - w * 4 + 4]
                        + m[3] * iD[i - 4] + m[4] * iD[i] + m[5] * iD[i + 4]
                        + m[6] * iD[i + w * 4 - 4] + m[7] * iD[i + w * 4] + m[8] * iD[i + w * 4 + 4]
                        ) / _options.divisor;
                    }

                    // Set opacity
                    oD[(y * w + x) * 4 + 3] = parseInt(_opacity / 100 * 255);
                }
            }
            return _output;
        },

        // Permutations
        2: function (_input, _options, _opacity) {

            var _output = document.createElement("canvas").getContext('2d').createImageData(_input);
            _output.data.set(_input.data);

            for (var x = 0, column = _input.width; x < column; x++) {

                for (var y = 0, row = _input.height; y < row; y++) {

                    // Index of the pixel in the array
                    var idx = (x + y * column) * 4;
                    var midx = (((column - 1) - x) + y * column) * 4;

                    // Red channel
                    _output.data[midx + 0] = _input.data[idx + 0];
                    // Green channel
                    _output.data[midx + 1] = _input.data[idx + 1];
                    // Blue channel
                    _output.data[midx + 2] = _input.data[idx + 2];
                    // Alpha channel
                    _output.data[midx + 3] = parseInt(_opacity / 100 * 255);
                }
            }
            return _output;
        },

        // Freedom
        3: function (_input, _options, _opacity) {

            var _param = _options.param;
            var _fn = '"use strict";'
                + 'var pixels = _input.data;'
                + 'for (var i = 0, n = pixels.length; i < n; i += 4) {'
                + (_param ? 'var ' + _param.replace(/r/igm, 'pixels[i]').replace(/g/igm, 'pixels[i + 1]').replace(/b/igm, 'pixels[i + 2]') : '')
                + _options.r.replace(/r/igm, 'pixels[i]')
                + _options.g.replace(/g/igm, 'pixels[i + 1]')
                + _options.b.replace(/b/igm, 'pixels[i + 2]')
                + 'pixels[i + 3] = parseInt(' + _opacity + ' / 100 * 255);'
                + '}'
                + 'return _input;';
            var _render = new Function('_input, _options, _opacity', _fn);
            return _render.apply(this, [_input, _options, _opacity]);
        }
    }

    // Init function
    var ppimage = function (_options, _callback) {

        if ({}.toString.call(_callback) == "[object Function]") {

            var _url = _options.url || '';

            // Create a new Image
            var _image = new Image();
            _image.src = _url;
            _image.onerror = function () {

                // No image
                throw new Error('Fail to load image!');
                return false;
            }
            _image.onload = function () {

                var _w = _image.width, _h = _image.height;

                var _map = {
                    url: _url,      // image url
                    sx: 0,          // start x
                    sy: 0,          // start y
                    nw: _w,         // image new width
                    nh: _h,         // image new height
                    w: _w,          // final image's width
                    h: _h,          // final image's height
                    opacity: 100,   // image opacity
                    quality: 100,   // image quality
                    mode: 0         // filter mode
                }

                for (var _option in _options) {
                    if (_options.hasOwnProperty(_option) && _map.hasOwnProperty(_option)) {
                        _map[_option] = _options[_option];
                    }
                }

                // Create a new Canvas
                var _tempCanvas = document.createElement("canvas");
                _tempCanvas.width = _map.w;
                _tempCanvas.height = _map.h;

                // Render image
                if (!!_tempCanvas.getContext) {

                    var _tempCtx = _tempCanvas.getContext('2d');
                    var _fileType = 'image/'
                        + ( _map.url.match(/^.*?\.(x-icon|png|bmp|svg)$/igm) ? _map.url.match(/\.(\w+)$/)[1] : 'jpeg');
                    _tempCtx.drawImage(_image, _map.sx, _map.sy, _map.w, _map.h, 0, 0, _map.nw, _map.nh);
                    if (!!_map.mode) {

                        try {
                            var _mode = MODE[_map.mode];
                            var _imageData = _tempCtx.getImageData(0, 0, _map.w, _map.h);
                            var _newImage = RENDER[_mode.method](_imageData, _mode.options, _map.opacity);

                            _tempCtx.clearRect(0, 0, _map.w, _map.h);
                            _tempCtx.putImageData(_newImage, 0, 0);

                        } catch (_err) {
                            console.log(_err);
                        }
                    } else {

                        _tempCtx.globalAlpha = _map.opacity / 100;
                        _tempCtx.clearRect(0, 0, _map.w, _map.h);
                        _tempCtx.drawImage(_image, _map.sx, _map.sy, _map.w, _map.h, 0, 0, _map.nw, _map.nh);
                    }

                    _callback(_tempCanvas.toDataURL(_fileType.toLowerCase(), _map.quality / 100))

                } else {

                    // Not support canvas
                    _callback(_map.url);
                }
            }
        } else {

            // No callback
            throw new Error('Callback function not found!');
            return false;
        }
    }

    // Set function
    _global.ppimage = ppimage;
})(window)