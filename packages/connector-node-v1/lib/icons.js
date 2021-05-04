'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIcon = getIcon;

var _iconsSvg = require('./icons-svg');

var _iconsSvg2 = _interopRequireDefault(_iconsSvg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dirIcon = _iconsSvg2.default.folder;
var soundFileIcon = _iconsSvg2.default.volumeUp;
var pictureFileIcon = _iconsSvg2.default.image;
var videoFileIcon = _iconsSvg2.default.ondemandVideo;
var archiveFileIcon = _iconsSvg2.default.archive;
var booksFileIcon = _iconsSvg2.default.book;
var unknownFileIcon = _iconsSvg2.default.insertDriveFile;
var miraFileIcon = _iconsSvg2.default.miraFileIcon;
var isxdFileIcon = _iconsSvg2.default.isxd;
var gpioFileIcon = _iconsSvg2.default.gpio;
var folderIcon = _iconsSvg2.default.folderIcon;

var defaultFillColor = '#424242';
var soundFilesExtensions = ['aac', 'aiff', 'flac', 'm4a', 'ogg', 'mp3', 'wav', 'wma'];
var pictureFilesExtensions = ['gif', 'png', 'jpg', 'jpeg', 'bmp', 'svg', 'tiff'];
var videoFilesExtensions = ['avi', 'flv', 'wmv', 'mov', 'mp4', 'MIRA'];
var isxdFilesExtensions = ['isxd'];
var miraFilesExtensions = ['MIRA'];
var gpioFilesExtensions = ['gpio'];
var archiveFilesExtensions = ['tar', 'zip', 'gz', 'bz2', 'rar'];
var booksFilesExtensions = ['pdf', 'epub', 'fb2'];

function matchFileExtensions(filename, extensions) {
  var extensionsRegExp = '(' + extensions.join('|') + ')';
  return extensions.some(function (o) {
    return new RegExp('^.*.' + extensionsRegExp + '$').test(filename.toLowerCase());
  });
}

function getIcon(resource) {
  if (resource.type === 'DIR') {
    return { svg: folderIcon, fill: defaultFillColor };
  } else if (matchFileExtensions(resource.name, soundFilesExtensions)) {
    return { svg: soundFileIcon, fill: '#e53935' };
  } else if (matchFileExtensions(resource.name, pictureFilesExtensions)) {
    return { svg: pictureFileIcon, fill: '#e53935' };
  } else if (matchFileExtensions(resource.name, videoFilesExtensions)) {
    return { svg: videoFileIcon, fill: '#e53935' };
  }
  // else if (matchFileExtensions(resource.name, archiveFilesExtensions)) {
  //   return { svg: archiveFileIcon, fill: `#616161` };
  // } 
  else if (matchFileExtensions(resource.name, booksFilesExtensions)) {
      return { svg: booksFileIcon, fill: '#e53935' };
    } else if (matchFileExtensions(resource.name, miraFilesExtensions)) {
      return { svg: miraFileIcon, fill: '#e53935' };
    } else if (matchFileExtensions(resource.name, isxdFilesExtensions)) {
      return { svg: isxdFileIcon, fill: '#e53935' };
    } else if (matchFileExtensions(resource.name, gpioFilesExtensions)) {
      return { svg: gpioFileIcon, fill: '#e53935' };
    } else {
      return { svg: unknownFileIcon, fill: '#616161' };
    }
}