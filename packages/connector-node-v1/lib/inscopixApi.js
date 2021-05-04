'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getCapabilitiesForResource = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(options, resource) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', resource.capabilities || []);

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getCapabilitiesForResource(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var getResourceById = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(options, id) {
        var route, method, response;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        route = '' + options.configData.get('baseURL') + id;
                        method = 'GET';
                        _context2.next = 4;
                        return (0, _superagent2.default)(method, route);

                    case 4:
                        response = _context2.sent;
                        return _context2.abrupt('return', { name: id, capabilities: { canDelete: false, canRename: false, canCopy: false, canEdit: false, canDownload: false, canListChildren: true, canAddChildren: true, canRemoveChildren: true } });

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getResourceById(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

//get files 


var getChildrenForId = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(options, _ref4) {
        var id = _ref4.id,
            _ref4$sortBy = _ref4.sortBy,
            sortBy = _ref4$sortBy === undefined ? 'name' : _ref4$sortBy,
            _ref4$sortDirection = _ref4.sortDirection,
            sortDirection = _ref4$sortDirection === undefined ? 'ASC' : _ref4$sortDirection,
            where = _ref4.where,
            lastParamenters = _ref4.lastParamenters,
            _ref4$compress = _ref4.compress,
            compress = _ref4$compress === undefined ? false : _ref4$compress,
            _ref4$openningFrom = _ref4.openningFrom,
            openningFrom = _ref4$openningFrom === undefined ? undefined : _ref4$openningFrom;
        var route, method, response;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/' + where + '/files?path=' + (id === undefined ? '/' : id) + '&compressFilesPanel=' + compress + '&fromOnepTwop=false';

                        console.log('[FILEMANAGER] getChildrenForIdApi ' + route);
                        method = 'GET';
                        _context3.next = 5;
                        return (0, _superagent2.default)(method, route);

                    case 5:
                        response = _context3.sent;
                        return _context3.abrupt('return', response.body.files.map(_common.normalizeInscopixResource, { path: id, parentFolderPath: lastParamenters, filter: openningFrom }));

                    case 7:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getChildrenForId(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

//get Devices


var getDevices = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(options) {
        var route, method, response;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/devices';
                        method = 'GET';
                        _context4.next = 4;
                        return (0, _superagent2.default)(method, route);

                    case 4:
                        response = _context4.sent;
                        return _context4.abrupt('return', response.body.devices);

                    case 6:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getDevices(_x7) {
        return _ref5.apply(this, arguments);
    };
}();

//get Devices


var mountDevice = function () {
    var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(options, _ref7) {
        var volume = _ref7.volume;
        var route, method, response;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/mount?volume=' + volume;

                        console.log('[FILEMANAGER] Sending request to mount ' + volume);
                        method = 'GET';
                        _context5.next = 5;
                        return (0, _superagent2.default)(method, route).send();

                    case 5:
                        response = _context5.sent;
                        return _context5.abrupt('return', response.body);

                    case 7:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function mountDevice(_x8, _x9) {
        return _ref6.apply(this, arguments);
    };
}();

var unmountDevice = function () {
    var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(options) {
        var route, method, response;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/umount';

                        console.log('[FILEMANAGER] Sending request to unmount');
                        method = 'GET';
                        _context6.next = 5;
                        return (0, _superagent2.default)(method, route).send();

                    case 5:
                        response = _context6.sent;
                        return _context6.abrupt('return', response.body);

                    case 7:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function unmountDevice(_x10) {
        return _ref8.apply(this, arguments);
    };
}();

var getParentsForId = function () {
    var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(options, id) {
        var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var resource;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        if (id) {
                            _context7.next = 2;
                            break;
                        }

                        return _context7.abrupt('return', result);

                    case 2:
                        _context7.next = 4;
                        return getResourceById(options, id);

                    case 4:
                        resource = _context7.sent;

                        if (!(resource && resource.name)) {
                            _context7.next = 7;
                            break;
                        }

                        return _context7.abrupt('return', [resource]);

                    case 7:
                        return _context7.abrupt('return', result);

                    case 8:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function getParentsForId(_x11, _x12) {
        return _ref9.apply(this, arguments);
    };
}();

var getBaseResource = function () {
    var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(options) {
        var route, response;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        route = options.apiRoot + '/files';
                        _context8.next = 3;
                        return _superagent2.default.get(route);

                    case 3:
                        response = _context8.sent;
                        return _context8.abrupt('return', normalizeResource(response.body));

                    case 5:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function getBaseResource(_x14) {
        return _ref10.apply(this, arguments);
    };
}();

var getIdForPartPath = function () {
    var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(options, currId, pathArr) {
        var resourceChildren, i, resource;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.next = 2;
                        return getChildrenForId(options, { id: currId });

                    case 2:
                        resourceChildren = _context9.sent;
                        i = 0;

                    case 4:
                        if (!(i < resourceChildren.length)) {
                            _context9.next = 15;
                            break;
                        }

                        resource = resourceChildren[i];

                        if (!(resource.name === pathArr[0])) {
                            _context9.next = 12;
                            break;
                        }

                        if (!(pathArr.length === 1)) {
                            _context9.next = 11;
                            break;
                        }

                        return _context9.abrupt('return', resource.id);

                    case 11:
                        return _context9.abrupt('return', getIdForPartPath(options, resource.id, pathArr.slice(1)));

                    case 12:
                        i++;
                        _context9.next = 4;
                        break;

                    case 15:
                        return _context9.abrupt('return', null);

                    case 16:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function getIdForPartPath(_x15, _x16, _x17) {
        return _ref11.apply(this, arguments);
    };
}();

var getIdForPath = function () {
    var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(options, path) {
        var resource, pathArr;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return getBaseResource(options);

                    case 2:
                        resource = _context10.sent;
                        pathArr = path.split('/');

                        if (!(pathArr.length === 0 || pathArr.length === 1 || pathArr[0] !== '')) {
                            _context10.next = 6;
                            break;
                        }

                        return _context10.abrupt('return', null);

                    case 6:
                        if (!(pathArr.length === 2 && pathArr[1] === '')) {
                            _context10.next = 8;
                            break;
                        }

                        return _context10.abrupt('return', resource.id);

                    case 8:
                        return _context10.abrupt('return', getIdForPartPath(options, resource.id, pathArr.slice(1)));

                    case 9:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    return function getIdForPath(_x18, _x19) {
        return _ref12.apply(this, arguments);
    };
}();

var getParentIdForResource = function () {
    var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(options, resource) {
        return _regenerator2.default.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        return _context11.abrupt('return', resource.parentId);

                    case 1:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function getParentIdForResource(_x20, _x21) {
        return _ref13.apply(this, arguments);
    };
}();

var uploadFileToId = function () {
    var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref15) {
        var apiOptions = _ref15.apiOptions,
            parentId = _ref15.parentId,
            file = _ref15.file,
            onProgress = _ref15.onProgress;
        var route;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        route = apiOptions.apiRoot + '/files';
                        return _context12.abrupt('return', _superagent2.default.post(route).field('type', 'file').field('parentId', parentId).attach('files', file.file, file.name).on('progress', function (event) {
                            onProgress(event.percent);
                        }));

                    case 2:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));

    return function uploadFileToId(_x22) {
        return _ref14.apply(this, arguments);
    };
}();

var downloadResources = function () {
    var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(options, where, path, filename) {
        var downloadUrl, res;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        downloadUrl = options.configData.get('baseURL') + 'api/filemanager/download?where=' + where + '&path=' + path + '&filename=' + filename;
                        _context13.next = 3;
                        return _superagent2.default.get(downloadUrl);

                    case 3:
                        res = _context13.sent;
                        return _context13.abrupt('return', res.body);

                    case 5:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function downloadResources(_x23, _x24, _x25, _x26) {
        return _ref16.apply(this, arguments);
    };
}();

//create folder


var createFolder = function () {
    var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(options, parentId, folderName) {
        var route, method, params;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/folder';

                        console.log('[FILEMANAGER] createFolderApi ' + route);
                        method = 'POST';
                        params = {
                            where: options.fromWhere,
                            path: parentId,
                            foldername: folderName
                        };
                        return _context14.abrupt('return', (0, _superagent2.default)(method, route).send(params));

                    case 5:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    }));

    return function createFolder(_x27, _x28, _x29) {
        return _ref17.apply(this, arguments);
    };
}();

//rename folder
var renameResource = function () {
    var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(options, id, newName, fileToRename) {
        var route, method, data;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/rename';

                        console.log('[FILEMANAGER] renameResourceApi ' + route);
                        method = 'PUT';
                        data = {
                            where: options.fromWhere,
                            path: id,
                            srcname: fileToRename,
                            dstname: newName
                        };
                        return _context15.abrupt('return', (0, _superagent2.default)(method, route).type('application/json').send(data));

                    case 5:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    }));

    return function renameResource(_x30, _x31, _x32, _x33) {
        return _ref18.apply(this, arguments);
    };
}();

//remove folder


var removeResource = function () {
    var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(options, id, file) {
        var route, method, data;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/remove';

                        console.log('[FILEMANAGER] removeResourceApi ' + route);
                        method = 'DELETE';
                        data = {
                            where: options.fromWhere,
                            path: id,
                            files: file
                        };
                        return _context16.abrupt('return', (0, _superagent2.default)(method, route).send(data));

                    case 5:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    }));

    return function removeResource(_x34, _x35, _x36) {
        return _ref19.apply(this, arguments);
    };
}();

//cencle copy


var cancelCopy = function () {
    var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(options) {
        var route, method, response;
        return _regenerator2.default.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/copy-cancel';

                        console.log('[FILEMANAGER] cancelCopyApi ' + route);
                        method = 'POST';
                        _context17.next = 5;
                        return (0, _superagent2.default)(method, route).send();

                    case 5:
                        response = _context17.sent;

                        console.log('%c[FILEMANAGER]%c Cancel copy status ' + response.body.status + ':', "color: blue; font-weight: bold;", "color: black;", response.body);
                        //call get Devices
                        return _context17.abrupt('return', response.body);

                    case 8:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this);
    }));

    return function cancelCopy(_x37) {
        return _ref20.apply(this, arguments);
    };
}();

// view


var viewFile = function () {
    var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(options, where, path, filename) {
        var route, method, response, json;
        return _regenerator2.default.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/view/?where=' + where + '&path=' + path + '&filename=' + filename;

                        console.log('[FILEMANAGER] viewFile ' + route);
                        method = 'GET';
                        _context18.next = 5;
                        return (0, _superagent2.default)(method, route).send();

                    case 5:
                        response = _context18.sent;
                        json = JSON.parse(response.text);

                        console.group('%c[FILEMANAGER]%c Got file ' + path + '/' + filename + ' with JSON:', "color: blue; font-weight: bold;", "color: black;");
                        console.log(json ? 'JSON' : 'RAW');
                        if (json && typeof json.extraProperties != "undefined") {
                            json = json.extraProperties;
                            console.log('JSON Stripped to extraProperties level');
                        }
                        console.log(json || response.text);
                        console.groupEnd();
                        //call get Devices
                        return _context18.abrupt('return', response.text);

                    case 13:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function viewFile(_x38, _x39, _x40, _x41) {
        return _ref21.apply(this, arguments);
    };
}();

//cencle copy


var cancelCompress = function () {
    var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(options, data) {
        var route, method, response;
        return _regenerator2.default.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/compress-cancel';

                        console.log('[FILEMANAGER] cancelCompressApi ' + route);
                        console.log(data, "data");

                        // await fetch(route, {
                        //     method: 'POST',
                        //     body: JSON.stringify(data),
                        //     headers: { "Content-Type": "application/json; utf-8" }
                        // }).then((res) => {
                        //     console.log(`%c[FILEMANAGER]%c Cancel compress status ${response.data.status}:`, "color: blue; font-weight: bold;", "color: black;", response.data);
                        //     return res.data;
                        // }).catch((err) => {
                        //     console.log(err, "err");
                        //     return err;
                        // })

                        method = 'POST';
                        _context19.next = 6;
                        return (0, _superagent2.default)(method, route).send(data);

                    case 6:
                        response = _context19.sent;

                        console.log('%c[FILEMANAGER]%c Cancel compress status ' + response.body.status + ':', "color: blue; font-weight: bold;", "color: black;", response.body);
                        //call get Devices
                        return _context19.abrupt('return', response.body);

                    case 9:
                    case 'end':
                        return _context19.stop();
                }
            }
        }, _callee19, this);
    }));

    return function cancelCompress(_x42, _x43) {
        return _ref22.apply(this, arguments);
    };
}();

var filemanagerRequest = function () {
    var _ref23 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(options, operation, data) {
        var route, method;
        return _regenerator2.default.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/' + operation;

                        console.log('[FILEMANAGER] filemanagerRequestApi ' + route);
                        method = 'POST';

                        console.log(data, "data");
                        console.log(route, "route");

                        _context20.next = 7;
                        return fetch(route, {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: { "Content-Type": "application/json; utf-8" }
                        }).then(function (res) {
                            return res.body;
                        }).catch(function (err) {
                            console.log(err, "err");
                            return err;
                        });

                    case 7:
                    case 'end':
                        return _context20.stop();
                }
            }
        }, _callee20, this);
    }));

    return function filemanagerRequest(_x44, _x45, _x46) {
        return _ref23.apply(this, arguments);
    };
}();

var filemanagerCompressRequest = function () {
    var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21(options, operation, data) {
        var route, method;
        return _regenerator2.default.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/' + operation;

                        console.log('[FILEMANAGER] filemanagerCompressRequestApi ' + route);
                        method = 'POST';

                        console.log(data, "data");
                        console.log(route, "route");

                        _context21.next = 7;
                        return fetch(route, {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: { "Content-Type": "application/json; utf-8" }
                        }).then(function (res) {
                            console.log(res, "res");
                            return res.body;
                        }).catch(function (err) {
                            console.log(err, "err");
                            return err;
                        });

                    case 7:
                    case 'end':
                        return _context21.stop();
                }
            }
        }, _callee21, this);
    }));

    return function filemanagerCompressRequest(_x47, _x48, _x49) {
        return _ref24.apply(this, arguments);
    };
}();

var checkFilesSize = function () {
    var _ref25 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22(options, data) {
        var route, method, response;
        return _regenerator2.default.wrap(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        route = options.configData.get('baseURL') + 'api/filemanager/check-files-size';

                        console.log('[FILEMANAGER] checkFilesSizeApi ' + route);
                        method = 'POST';
                        _context22.next = 5;
                        return (0, _superagent2.default)(method, route).send(data);

                    case 5:
                        response = _context22.sent;

                        console.log('%c[FILEMANAGER]%c Check file size ' + response.body.status + ':', "color: blue; font-weight: bold;", "color: black;", response.body.size);
                        //call get Devices
                        return _context22.abrupt('return', response.body);

                    case 8:
                    case 'end':
                        return _context22.stop();
                }
            }
        }, _callee22, this);
    }));

    return function checkFilesSize(_x50, _x51) {
        return _ref25.apply(this, arguments);
    };
}();

var removeResources = function () {
    var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23(options, selectedResources) {
        return _regenerator2.default.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        return _context23.abrupt('return', Promise.all(selectedResources.map(function (resource) {
                            return removeResource(options, resource);
                        })));

                    case 1:
                    case 'end':
                        return _context23.stop();
                }
            }
        }, _callee23, this);
    }));

    return function removeResources(_x52, _x53) {
        return _ref26.apply(this, arguments);
    };
}();

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _common = require('./utils/common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * hasSignedIn
 *
 * @returns {boolean}
 */
function hasSignedIn() {
    return true;
}

/**
 * Init API
 *
 * @returns {Promise<{apiInitialized: boolean, apiSignedIn: boolean}>}
 */
function init() {
    return {
        apiInitialized: true,
        apiSignedIn: true
    };
}

function getResourceName(apiOptions, resource) {
    return resource.name;
}exports.default = {
    init: init,
    hasSignedIn: hasSignedIn,
    getIdForPath: getIdForPath,
    getResourceById: getResourceById,
    getCapabilitiesForResource: getCapabilitiesForResource,
    getChildrenForId: getChildrenForId,
    getParentsForId: getParentsForId,
    getParentIdForResource: getParentIdForResource,
    getResourceName: getResourceName,
    createFolder: createFolder,
    downloadResources: downloadResources,
    renameResource: renameResource,
    removeResources: removeResources,
    uploadFileToId: uploadFileToId,
    removeResource: removeResource,
    getDevices: getDevices,
    filemanagerRequest: filemanagerRequest,
    mountDevice: mountDevice,
    unmountDevice: unmountDevice,
    filemanagerCompressRequest: filemanagerCompressRequest,
    cancelCopy: cancelCopy,
    cancelCompress: cancelCompress,
    viewFile: viewFile,
    checkFilesSize: checkFilesSize
};