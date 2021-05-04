'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _handler = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(apiOptions, actions) {
        var showDialog, hideDialog, navigateToDir, updateNotifications, getSelectedResources, getResource, getNotifications, getRemoteCurrentpath, getLocalCurrentpath, setRefresh, getSelection, isEjected, showErrorPopup, handleShowCopyPopupTemp, showCheckSizePopup, getMessage, selectedResources, isDir, dialogFilesText, desPath, srcPath, data, checkSizedata, _response, response, resource;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        showDialog = actions.showDialog, hideDialog = actions.hideDialog, navigateToDir = actions.navigateToDir, updateNotifications = actions.updateNotifications, getSelectedResources = actions.getSelectedResources, getResource = actions.getResource, getNotifications = actions.getNotifications, getRemoteCurrentpath = actions.getRemoteCurrentpath, getLocalCurrentpath = actions.getLocalCurrentpath, setRefresh = actions.setRefresh, getSelection = actions.getSelection, isEjected = actions.isEjected, showErrorPopup = actions.showErrorPopup, handleShowCopyPopupTemp = actions.handleShowCopyPopupTemp, showCheckSizePopup = actions.showCheckSizePopup;
                        getMessage = _translations2.default.bind(null, apiOptions.locale);
                        selectedResources = getSelectedResources();
                        isDir = false;

                        selectedResources.map(function (file) {
                            if (file.type === 'DIR') {
                                isDir = true;
                            }
                        });

                        dialogFilesText = selectedResources.length > 1 ? selectedResources.length + ' ' + getMessage('files') : '"' + selectedResources[0].name + '"';

                        // hideDialog();

                        _context.prev = 6;
                        desPath = apiOptions.fromWhere === 'remote' ? getLocalCurrentpath() : apiOptions.fromWhere === 'local' ? getRemoteCurrentpath() : getLocalCurrentpath();
                        srcPath = selectedResources[0].path === '/' ? selectedResources[0].path : '/' + selectedResources[0].path + '/';
                        data = {
                            dst: {
                                where: apiOptions.fromWhere === 'remote' ? 'local' : apiOptions.fromWhere === 'local' ? 'remote' : 'local',
                                path: desPath.name === '/' ? desPath.name : '/' + desPath.name + '/'
                            },
                            src: {
                                where: apiOptions.fromWhere,
                                path: srcPath,
                                files: getSelection()
                            }
                        };

                        if (!isDir) {
                            _context.next = 17;
                            break;
                        }

                        checkSizedata = {
                            src: {
                                where: apiOptions.fromWhere,
                                path: srcPath,
                                files: getSelection()
                            }
                        };
                        _context.next = 14;
                        return _inscopixApi2.default.checkFilesSize(apiOptions, checkSizedata);

                    case 14:
                        _response = _context.sent;

                        showCheckSizePopup(_response, data);
                        return _context.abrupt('return');

                    case 17:
                        if (!isEjected()) {
                            _context.next = 20;
                            break;
                        }

                        showErrorPopup();
                        return _context.abrupt('return');

                    case 20:
                        _context.next = 22;
                        return _inscopixApi2.default.filemanagerRequest(apiOptions, 'copy', data);

                    case 22:
                        response = _context.sent;

                        handleShowCopyPopupTemp();
                        resource = getResource();

                        navigateToDir(resource.name, null, true);
                        setRefresh();
                        _context.next = 33;
                        break;

                    case 29:
                        _context.prev = 29;
                        _context.t0 = _context['catch'](6);

                        (0, _onFailError2.default)({
                            getNotifications: getNotifications,
                            label: getMessage(label),
                            notificationId: 'delete',
                            updateNotifications: updateNotifications
                        });
                        console.log(_context.t0);

                    case 33:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[6, 29]]);
    }));

    return function _handler(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var _inscopixApi = require('../inscopixApi');

var _inscopixApi2 = _interopRequireDefault(_inscopixApi);

var _onFailError = require('../utils/onFailError');

var _onFailError2 = _interopRequireDefault(_onFailError);

var _iconsSvg = require('../icons-svg');

var _iconsSvg2 = _interopRequireDefault(_iconsSvg);

var _translations = require('../translations');

var _translations2 = _interopRequireDefault(_translations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var label = 'copy';

exports.default = function (apiOptions, actions) {
    var localeLabel = (0, _translations2.default)(apiOptions.locale, label);
    var getSelectedResources = actions.getSelectedResources,
        isEjected = actions.isEjected;

    return {
        id: 'copy',
        icon: { svg: _iconsSvg2.default.copy },
        label: 'Copy',
        shouldBeAvailable: function shouldBeAvailable(apiOptions) {
            var selectedResources = getSelectedResources();

            if (!selectedResources.length) {
                return false;
            }

            return selectedResources.every(function (resource) {
                return resource.capabilities.canCopy;
            });
        },
        availableInContexts: ['row', 'toolbar'],
        handler: function handler() {
            return _handler(apiOptions, actions);
        }
    };
};