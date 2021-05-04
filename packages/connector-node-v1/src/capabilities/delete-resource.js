import api from '../inscopixApi';
import onFailError from '../utils/onFailError';
import icons from '../icons-svg';
import getMess from '../translations';

const label = 'remove';

function handler(apiOptions, actions) {
  const {
    showDialog,
    hideDialog,
    navigateToDir,
    updateNotifications,
    getSelectedResources,
    getResource,
    getNotifications,
    getSelection
  } = actions;

  const getMessage = getMess.bind(null, apiOptions.locale);

  const selectedResources = getSelectedResources();

  const dialogFilesText = selectedResources.length > 1 ?
    `${selectedResources.length} ${getMessage('files')}` :
    `"${selectedResources[0].name}"`;

  const dialogNameText = getMessage('reallyRemove', { files: dialogFilesText });


  const rawDialogElement = {
    elementType: 'ConfirmDialog',
    elementProps: {
      onHide: hideDialog,
      onSubmit: async () => {
        hideDialog();
        try {
          await api.removeResource(apiOptions, selectedResources[0].path, getSelection());
          const resource = getResource();
          navigateToDir(resource.name, null, true);

        } catch (err) {
          onFailError({
            getNotifications,
            label: getMessage(label),
            notificationId: 'delete',
            updateNotifications
          });
          console.log(err)
        }
      },
      headerText: getMessage('remove'),
      messageText: dialogNameText,
      cancelButtonText: getMessage('cancel'),
      submitButtonText: getMessage('confirm')
    }
  };

  showDialog(rawDialogElement);
}

export default (apiOptions, actions) => {
  const localeLabel = getMess(apiOptions.locale, label);
  const { getSelectedResources } = actions;
  return {
    id: 'delete',
    icon: { svg: icons.delete },
    label: localeLabel,
    shouldBeAvailable: (apiOptions) => {
      const selectedResources = getSelectedResources();

      if (!selectedResources.length) {
        return false;
      }

      return selectedResources.every(resource => resource.capabilities.canDelete);
    },
    availableInContexts: ['row', 'toolbar'],
    handler: () => handler(apiOptions, actions)
  };
}
