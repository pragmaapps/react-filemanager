import request from 'superagent';
import { normalizeInscopixResource } from './utils/common';

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

async function getCapabilitiesForResource(options, resource) {
    return resource.capabilities || [];
}

async function getResourceById(options, id) {
    const route = `${options.configData.get('baseURL')}${id}`;
    const method = 'GET';
    const response = await request(method, route);
    return { name: id, capabilities: { canDelete: false, canRename: false, canCopy: false, canEdit: false, canDownload: false, canListChildren: true, canAddChildren: true, canRemoveChildren: true } };
}

//get files 
async function getChildrenForId(options, { id, sortBy = 'name', sortDirection = 'ASC', where, lastParamenters, compress = false, openningFrom = undefined }) {
    const route = `${options.configData.get('baseURL')}api/filemanager/${where}/files?path=${id === undefined ? '/' : id}&compressFilesPanel=${compress}&fromOnepTwop=false`;
    console.log(`[FILEMANAGER] getChildrenForIdApi ${route}`);
    const method = 'GET';
    const response = await request(method, route);
    return response.body.files.map(normalizeInscopixResource, { path: id, parentFolderPath: lastParamenters, filter: openningFrom });

}

//get Devices
async function getDevices(options) {
    const route = `${options.configData.get('baseURL')}api/filemanager/devices`;
    const method = 'GET';
    const response = await request(method, route);
    return response.body.devices;

}

//get Devices
async function mountDevice(options, { volume }) {
    const route = `${options.configData.get('baseURL')}api/filemanager/mount?volume=${volume}`;
    console.log(`[FILEMANAGER] Sending request to mount ${volume}`)
    const method = 'GET';
    const response = await request(method, route).send();
    return response.body;

}

async function unmountDevice(options) {
    const route = `${options.configData.get('baseURL')}api/filemanager/umount`;
    console.log(`[FILEMANAGER] Sending request to unmount`);
    const method = 'GET';
    const response = await request(method, route).send();
    return response.body;

}


async function getParentsForId(options, id, result = []) {
    if (!id) {
        return result;
    }

    const resource = await getResourceById(options, id);
    if (resource && resource.name) {
        return [resource];
    }
    return result;
}

async function getBaseResource(options) {
    const route = `${options.apiRoot}/files`;
    const response = await request.get(route);
    return normalizeResource(response.body);
}

async function getIdForPartPath(options, currId, pathArr) {
    const resourceChildren = await getChildrenForId(options, { id: currId });
    for (let i = 0; i < resourceChildren.length; i++) {
        const resource = resourceChildren[i];
        if (resource.name === pathArr[0]) {
            if (pathArr.length === 1) {
                return resource.id;
            } else {
                return getIdForPartPath(options, resource.id, pathArr.slice(1));
            }
        }
    }

    return null;
}

async function getIdForPath(options, path) {
    const resource = await getBaseResource(options);
    const pathArr = path.split('/');

    if (pathArr.length === 0 || pathArr.length === 1 || pathArr[0] !== '') {
        return null;
    }

    if (pathArr.length === 2 && pathArr[1] === '') {
        return resource.id;
    }

    return getIdForPartPath(options, resource.id, pathArr.slice(1));
}

async function getParentIdForResource(options, resource) {
    return resource.parentId;
}

async function uploadFileToId({ apiOptions, parentId, file, onProgress }) {
    const route = `${apiOptions.apiRoot}/files`;
    return request.post(route).
        field('type', 'file').
        field('parentId', parentId).
        attach('files', file.file, file.name).
        on('progress', event => {
            onProgress(event.percent);
        });
}

async function downloadResources(options, where, path, filename) {
    const downloadUrl = `${options.configData.get('baseURL')}api/filemanager/download?where=${where}&path=${path}&filename=${filename}`

    const res = await request.get(downloadUrl);
    // responseType('blob')
    // on('progress', event => {
    //     onProgress(event.percent);
    // });

    return res.body;
}

//create folder
async function createFolder(options, parentId, folderName) {
    const route = `${options.configData.get('baseURL')}api/filemanager/folder`;
    console.log(`[FILEMANAGER] createFolderApi ${route}`);
    const method = 'POST';
    const params = {
        where: options.fromWhere,
        path: parentId,
        foldername: folderName
    };
    return request(method, route).send(params)
}

function getResourceName(apiOptions, resource) {
    return resource.name;
}

//rename folder
async function renameResource(options, id, newName, fileToRename) {
    const route = `${options.configData.get('baseURL')}api/filemanager/rename`;
    console.log(`[FILEMANAGER] renameResourceApi ${route}`);
    const method = 'PUT';
    let data = {
        where: options.fromWhere,
        path: id,
        srcname: fileToRename,
        dstname: newName
    }
    return request(method, route).type('application/json').send(data)
}

//remove folder
async function removeResource(options, id, file) {
    const route = `${options.configData.get('baseURL')}api/filemanager/remove`;
    console.log(`[FILEMANAGER] removeResourceApi ${route}`);
    const method = 'DELETE';
    let data = {
        where: options.fromWhere,
        path: id,
        files: file
    }
    return request(method, route).send(data)
}


//cencle copy
async function cancelCopy(options) {
    const route = `${options.configData.get('baseURL')}api/filemanager/copy-cancel`;
    console.log(`[FILEMANAGER] cancelCopyApi ${route}`);
    const method = 'POST';
    let response = await request(method, route).send();
    console.log(`%c[FILEMANAGER]%c Cancel copy status ${response.body.status}:`, "color: blue; font-weight: bold;", "color: black;", response.body);
    //call get Devices
    return response.body;
}

// view
async function viewFile(options, where, path, filename) {
    const route = `${options.configData.get('baseURL')}api/filemanager/view/?where=${where}&path=${path}&filename=${filename}`;
    console.log(`[FILEMANAGER] viewFile ${route}`);
    const method = 'GET';
    let response = await request(method, route).send();
    let json = JSON.parse(response.text);
    console.group(`%c[FILEMANAGER]%c Got file ${path}/${filename} with JSON:`, "color: blue; font-weight: bold;", "color: black;");
    console.log(json ? 'JSON' : 'RAW');
    if (json && (typeof json.extraProperties != "undefined")) {
        json = json.extraProperties;
        console.log('JSON Stripped to extraProperties level');
    }
    console.log(json || response.text);
    console.groupEnd();
    //call get Devices
    return response.text;
}

//cencle copy
async function cancelCompress(options, data) {
    const route = `${options.configData.get('baseURL')}api/filemanager/compress-cancel`;
    console.log(`[FILEMANAGER] cancelCompressApi ${route}`);
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

    const method = 'POST';
    let response = await request(method, route).send(data);
    console.log(`%c[FILEMANAGER]%c Cancel compress status ${response.body.status}:`, "color: blue; font-weight: bold;", "color: black;", response.body);
    //call get Devices
    return response.body;
}

async function filemanagerRequest(options, operation, data) {
    const route = `${options.configData.get('baseURL')}api/filemanager/${operation}`;
    console.log(`[FILEMANAGER] filemanagerRequestApi ${route}`);
    const method = 'POST';
    console.log(data, "data");
    console.log(route, "route");

    await fetch(route, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json; utf-8" }
    }).then((res) => {
        return res.body;
    }).catch((err) => {
        console.log(err, "err");
        return err;
    })
    // return (await request(method, route).send(data)).header({ "Content-Type": "application/json; utf-8" });
}

async function filemanagerCompressRequest(options, operation, data) {
    const route = `${options.configData.get('baseURL')}api/filemanager/${operation}`;
    console.log(`[FILEMANAGER] filemanagerCompressRequestApi ${route}`);
    const method = 'POST';
    console.log(data, "data");
    console.log(route, "route");

    await fetch(route, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json; utf-8" }
    }).then((res) => {
        console.log(res, "res");
        return res.body;
    }).catch((err) => {
        console.log(err, "err");
        return err;
    })
}


async function checkFilesSize(options, data) {
    const route = `${options.configData.get('baseURL')}api/filemanager/check-files-size`;
    console.log(`[FILEMANAGER] checkFilesSizeApi ${route}`);
    const method = 'POST';
    let response = await request(method, route).send(data);
    console.log(`%c[FILEMANAGER]%c Check file size ${response.body.status}:`, "color: blue; font-weight: bold;", "color: black;", response.body.size);
    //call get Devices
    return response.body;
}



async function removeResources(options, selectedResources) {
    return Promise.all(selectedResources.map(resource => removeResource(options, resource)))
}

export default {
    init,
    hasSignedIn,
    getIdForPath,
    getResourceById,
    getCapabilitiesForResource,
    getChildrenForId,
    getParentsForId,
    getParentIdForResource,
    getResourceName,
    createFolder,
    downloadResources,
    renameResource,
    removeResources,
    uploadFileToId,
    removeResource,
    getDevices,
    filemanagerRequest,
    mountDevice,
    unmountDevice,
    filemanagerCompressRequest,
    cancelCopy,
    cancelCompress,
    viewFile,
    checkFilesSize
};
