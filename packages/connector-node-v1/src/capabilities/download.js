import api from '../inscopixApi';
import notifUtils from '../utils/notifications';
import { promptToSaveBlob } from '../utils/download';
import onFailError from '../utils/onFailError';
import nanoid from 'nanoid';
import icons from '../icons-svg';
import getMess from '../translations';

const label = 'download';




async function handler(apiOptions, actions) {
  const {
    updateNotifications,
    getSelectedResources,
    getNotifications,
    getRemoteCurrentpath,
    getLocalCurrentpath,
    getSelection
  } = actions;

  const getMessage = getMess.bind(null, apiOptions.locale);

  const notificationId = label;
  const notificationChildId = nanoid();

  const onStart = ({ archiveName, quantity }) => {
    const notifications = getNotifications();
    const notification = notifUtils.getNotification(notifications, notificationId);

    const childElement = {
      elementType: 'NotificationProgressItem',
      elementProps: {
        title: getMessage('creatingName', { name: archiveName }),
        progress: 0
      }
    };

    const newChildren = notifUtils.addChild(
      (notification && notification.children) || [], notificationChildId, childElement
    );
    const newNotification = {
      title: quantity > 1 ? getMessage('zippingItems', { quantity }) : getMessage('zippingItem'),
      children: newChildren
    };

    const newNotifications = notification ?
      notifUtils.updateNotification(notifications, notificationId, newNotification) :
      notifUtils.addNotification(notifications, notificationId, newNotification);

    updateNotifications(newNotifications);
  };

  const onSuccess = _ => {
    const notifications = getNotifications();
    const notification = notifUtils.getNotification(notifications, notificationId);
    const notificationChildrenCount = notification.children.length;
    let newNotifications;

    if (notificationChildrenCount > 1) {
      newNotifications = notifUtils.updateNotification(
        notifications,
        notificationId, {
        children: notifUtils.removeChild(notification.children, notificationChildId)
      }
      );
    } else {
      newNotifications = notifUtils.removeNotification(notifications, notificationId);
    }
    updateNotifications(newNotifications);
  };

  const onProgress = (progress) => {
    const notifications = getNotifications();
    const notification = notifUtils.getNotification(notifications, notificationId);
    const child = notifUtils.getChild(notification.children, notificationChildId);

    const newChild = {
      ...child,
      element: {
        ...child.element,
        elementProps: {
          ...child.element.elementProps,
          progress
        }
      }
    };
    const newChildren = notifUtils.updateChild(notification.children, notificationChildId, newChild);
    const newNotifications = notifUtils.updateNotification(notifications, notificationId, { children: newChildren });
    updateNotifications(newNotifications);
  };

  try {
    const resources = getSelectedResources();
    // const quantity = resources.length;
    // if (quantity === 1) {
    //   const { id, name } = resources[0];
    //   const downloadUrl = `${apiOptions.apiRoot}/download?items=${id}`;
    //   // check if the file is available and trigger native browser saving prompt
    //   // if server is down the error will be catched and trigger relevant notification
    //   await api.getResourceById(apiOptions, id);
    //   promptToSaveBlob({ name, downloadUrl });
    // } 
    // // multiple resources -> download as a single archive

    let where = apiOptions.fromWhere;
    let path = resources[0].path === '/' ? '/' : `/${resources[0].path}/`;
    let file = getSelection();
    const archiveName = apiOptions.archiveName || 'archive.zip';

    console.log(where, 'where');
    console.log(path, "path");
    console.log(file, "file");
    console.log(resources, "resources");


    let url = `${apiOptions.configData.get('baseURL')}api/filemanager/download?where=${where}&path=${path}&filename=${file[0]}`;
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", file[0]);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    // onStart({ archiveName, quantity });
    // const content = await api.downloadResources(apiOptions, where, path, file[0]);
    // setTimeout(onSuccess, 1000);
    // promptToSaveBlob({ content, name: archiveName })
    // }
  } catch (err) {
    onFailError({
      getNotifications,
      label: getMessage(label),
      notificationId,
      updateNotifications
    });
    console.log(err)
  }
}

export default (apiOptions, actions) => {
  const localeLabel = getMess(apiOptions.locale, label);
  const { getSelectedResources } = actions;
  return {
    id: label,
    icon: { svg: icons.fileDownload },
    label: localeLabel,
    shouldBeAvailable: (apiOptions) => {
      const selectedResources = getSelectedResources();

      return (
        selectedResources.length === 1 &&
        !selectedResources.some(r => r.type === 'DIR') &&
        selectedResources.every(r => r.capabilities.canDownload)
      );
    },
    availableInContexts: ['row', 'toolbar'],
    handler: () => handler(apiOptions, actions)
  };
}
