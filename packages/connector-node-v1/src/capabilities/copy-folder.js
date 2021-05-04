import api from '../inscopixApi';
import onFailError from '../utils/onFailError';
import icons from '../icons-svg';
import getMess from '../translations';

const label = 'copy';

async function handler(apiOptions, actions) {
    const {
        showDialog,
        hideDialog,
        navigateToDir,
        updateNotifications,
        getSelectedResources,
        getResource,
        getNotifications,
        getRemoteCurrentpath,
        getLocalCurrentpath,
        setRefresh,
        getSelection,
        isEjected,
        showErrorPopup,
        handleShowCopyPopupTemp,
        showCheckSizePopup
    } = actions;

    const getMessage = getMess.bind(null, apiOptions.locale);

    const selectedResources = getSelectedResources();

    let isDir = false;
    selectedResources.map(file => {
        if (file.type === 'DIR') {
            isDir = true;
        }
    });

    const dialogFilesText = selectedResources.length > 1 ?
        `${selectedResources.length} ${getMessage('files')}` :
        `"${selectedResources[0].name}"`;

    // hideDialog();
    try {

        const desPath = apiOptions.fromWhere === 'remote' ? getLocalCurrentpath() : apiOptions.fromWhere === 'local' ? getRemoteCurrentpath() : getLocalCurrentpath();
        const srcPath = selectedResources[0].path === '/' ? selectedResources[0].path : `/${selectedResources[0].path}/`;
        let data = {
            dst: {
                where: apiOptions.fromWhere === 'remote' ? 'local' : apiOptions.fromWhere === 'local' ? 'remote' : 'local',
                path: desPath.name === '/' ? desPath.name : `/${desPath.name}/`
            },
            src: {
                where: apiOptions.fromWhere,
                path: srcPath,
                files: getSelection()
            }
        }
        if (isDir) {
            let checkSizedata = {
                src: {
                    where: apiOptions.fromWhere,
                    path: srcPath,
                    files: getSelection()
                }
            };
            let response = await api.checkFilesSize(apiOptions, checkSizedata);
            showCheckSizePopup(response, data);
            return;
        }
        if (isEjected()) {
            showErrorPopup();
            return;
        }
        let response = await api.filemanagerRequest(apiOptions, 'copy', data);
        handleShowCopyPopupTemp();
        const resource = getResource();
        navigateToDir(resource.name, null, true);
        setRefresh();
    } catch (err) {
        onFailError({
            getNotifications,
            label: getMessage(label),
            notificationId: 'delete',
            updateNotifications
        });
        console.log(err)
    }

    // const dialogNameText = dialogFilesText + ''

    // const rawDialogElement = {
    //     elementType: 'CopyDialog',
    //     elementProps: {
    //         onHide: hideDialog,
    //         onSubmit: async (whereTo) => {
    //             hideDialog();
    //             try {
    //                 console.log(selectedResources, "selectedResources");
    //                 const desPath = whereTo === 'remote' ? getRemoteCurrentpath() : whereTo === 'local' ? getLocalCurrentpath() : getLocalCurrentpath();
    //                 const srcPath = selectedResources[0].path === '/' ? selectedResources[0].path : `/${selectedResources[0].path}/`;
    //                 let data = {
    //                     dst: {
    //                         where: whereTo,
    //                         path: desPath.name === '/' ? desPath.name : `/${desPath.name}/`
    //                     },
    //                     src: {
    //                         where: apiOptions.fromWhere,
    //                         path: srcPath,
    //                         files: getSelection()
    //                     }
    //                 }
    //                 console.log(data, "data");
    //                 let response = await api.filemanagerRequest(apiOptions, 'copy', data);
    //                 console.log(response, "response");
    //                 const resource = getResource();
    //                 navigateToDir(resource.name, null, true);
    //                 setRefresh();
    //             } catch (err) {
    //                 onFailError({
    //                     getNotifications,
    //                     label: getMessage(label),
    //                     notificationId: 'delete',
    //                     updateNotifications
    //                 });
    //                 console.log(err)
    //             }
    //         },
    //         headerText: 'Copy',
    //         // messageText: dialogNameText,
    //         cancelButtonText: getMessage('cancel'),
    //         submitButtonText: getMessage('confirm')
    //     }
    // };

    // showDialog(rawDialogElement);
}

export default (apiOptions, actions) => {
    const localeLabel = getMess(apiOptions.locale, label);
    const { getSelectedResources, isEjected } = actions;
    return {
        id: 'copy',
        icon: { svg: icons.copy },
        label: 'Copy',
        shouldBeAvailable: (apiOptions) => {
            const selectedResources = getSelectedResources();

            if (!selectedResources.length) {
                return false;
            }

            return selectedResources.every(resource => resource.capabilities.canCopy);
        },
        availableInContexts: ['row', 'toolbar'],
        handler: () => handler(apiOptions, actions)
    };
}
