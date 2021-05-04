import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './FileNavigator.less';
import ListView from '../ListView';
import LocationBar from '../LocationBar';
import Notifications from '../Notifications';
import Toolbar from '../Toolbar';
import { SortDirection } from 'react-virtualized';
import { find, isEqual } from 'lodash';
import clickOutside from 'react-click-outside';
import ContextMenu from '../ContextMenu';
import rawToReactElement from '../raw-to-react-element';
import { createHistory, pushToHistory, doHistoryStep } from '../history';
import FileNavigatorRemote from './FileNavigatorRemote';

function hasContext(capability, context) {
  return capability.availableInContexts && capability.availableInContexts.indexOf(context) !== -1;
}

const propTypes = {
  id: PropTypes.string,
  api: PropTypes.object,
  apiOptions: PropTypes.object,
  capabilities: PropTypes.func,
  className: PropTypes.string,
  initialResourceId: PropTypes.string,
  listViewLayout: PropTypes.func,
  viewLayoutOptions: PropTypes.object,
  signInRenderer: PropTypes.func,
  onClickOutside: PropTypes.func,
  onResourceItemClick: PropTypes.func,
  onResourceItemRightClick: PropTypes.func,
  onResourceItemDoubleClick: PropTypes.func,
  onResourceLocationChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onResourceChange: PropTypes.func,
  onResourceChildrenChange: PropTypes.func,
  // inscopixApi: PropTypes.object
};

const defaultProps = {
  id: '',
  api: 'nodeV1',
  apiOptions: {
    locale: 'en'
  },
  capabilities: () => [],
  className: '',
  initialResourceId: '',
  listViewLayout: () => { },
  viewLayoutOptions: {},
  signInRenderer: null,
  onClickOutside: ({ fileNavigator }) => fileNavigator.handleSelectionChange([]),
  onResourceItemClick: () => { },
  onResourceItemRightClick: () => { },
  onResourceItemDoubleClick: () => { },
  onResourceLocationChange: () => { },
  onSelectionChange: () => { },
  onResourceChange: () => { },
  onResourceChildrenChange: () => { }
};

const MONITOR_API_AVAILABILITY_TIMEOUT = 16;

@clickOutside
export default
  class FileNavigator extends Component {
  state = {
    apiInitialized: false,
    apiSignedIn: false,
    config: {},
    dialogElement: null,
    error: null,
    loadingResourceLocation: false,
    loadingView: false,
    notifications: [],
    resource: {},
    resourceChildren: [],
    resourceLocation: [],
    history: createHistory(),
    selection: [],
    sortBy: 'title',
    sortDirection: SortDirection.ASC,
    initializedCapabilities: [],
    resourceParents: [],
    lastParamenters: '',
    selectedResource: { name: '/', path: '/' },
    isMounted: false,
    remotePath: '/',
    localPath: '/',
    devices: [],
    selectedDevice: 'none',
    ejected: true,
    selectedRow: null,
    refresh: false,
    compressor: false
  };

  componentDidMount() {
    this._isMounted = true;
    this.initialize();
    this.getDevices();
  }

  componentWillReceiveProps(nextProps) {
    const needToNavigate =
      (this.props.initialResourceId !== nextProps.initialResourceId) &&
      ((this.state.resource && this.state.resource.name) !== nextProps.initialResourceId);

    if (needToNavigate) {
      this.navigateToDir(nextProps.initialResourceId);
    }

    if (!isEqual(this.props.apiOptions, nextProps.apiOptions)) {
      const { apiOptions, capabilities } = nextProps;
      const capabilitiesProps = this.getCapabilitiesProps();
      const initializedCapabilities = capabilities(apiOptions, capabilitiesProps);
      this.setState({ initializedCapabilities });
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  setStateAsync = (...args) => {
    if (this._isMounted) {
      this.setState(...args)
    }
  }

  clickOutside = (selection) => {
    return;
  }

  initialize = async () => {
    const { apiOptions, api, capabilities, viewLayoutOptions } = this.props;

    const capabilitiesProps = this.getCapabilitiesProps();
    const initializedCapabilities = capabilities(apiOptions, capabilitiesProps);

    const { apiInitialized, apiSignedIn } = await api.init({ ...apiOptions });
    this.setStateAsync({
      apiInitialized,
      apiSignedIn,
      initializedCapabilities,
      sortBy: viewLayoutOptions.initialSortBy || 'title',
      sortDirection: viewLayoutOptions.initialSortDirection || 'ASC'
    }, _ => {
      if (apiSignedIn) {
        this.handleApiReady();
      } else {
        if (apiInitialized) {
          this.handleApiSignInFail();
        } else {
          this.handleApiInitFail();
        }

        this.monitorApiAvailability();
      }
    });
  }

  startViewLoading = () => {
    this.setStateAsync({ loadingView: true, loadingResourceLocation: true });
  };

  stopViewLoading = () => {
    this.setStateAsync({ loadingView: false });
  };

  focusView = () => {
    this.viewRef.focus();
  };

  handleApiReady = () => {
    const { initialResourceId } = this.props;
    const resourceId = this.state.resource.name;
    const idToNavigate = typeof resourceId === 'undefined' ? '/' : resourceId;
    this.navigateToDir(idToNavigate);
  };

  monitorApiAvailability = () => {
    const { api } = this.props;

    this.apiAvailabilityTimeout = setTimeout(() => {
      if (api.hasSignedIn()) {
        this.setStateAsync({ apiInitialized: true, apiSignedIn: true });
        this.handleApiReady();
      } else {
        this.monitorApiAvailability();
      }
    }, MONITOR_API_AVAILABILITY_TIMEOUT);
  };

  handleApiInitFail = () => {
    this.handleResourceChildrenChange([]);
  };

  handleApiSignInFail = () => {
    this.handleSelectionChange([]);
    this.handleResourceChildrenChange([]);
    this.handleResourceChange({});
  };

  handleLocationBarChange = (id) => {
    if (this.props.disabled) {
      return;
    }
    let path = id.path;
    let name = id.name;
    let selectedResource = id;
    this.setState({ selectedResource });
    this.navigateToDir(path, name);
  };

  handleHistoryChange = (history) => {
    this.setStateAsync({ history });
    const navigateToId = history.stack[history.currentPointer];
    let selectedResource = { name: navigateToId.name, path: navigateToId.path };
    this.setState({ selectedResource });
    this.navigateToDir(navigateToId.path, null, true, false);
  };

  formatDate = (string) => {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(string).toLocaleDateString([], options);
  }


  navigateToDir = async (toId, idToSelect, startLoading = true, changeHistory = true) => {
    const { history, sortBy, sortDirection, selectedDevice } = this.state;

    if (startLoading) {
      this.startViewLoading();
    }

    const resource = { name: toId, capabilities: { canDelete: true, canRename: true, canCopy: true, canEdit: true, canDownload: true, canListChildren: true, canAddChildren: true, canRemoveChildren: true } };

    this.handleResourceChange(resource);

    let resourceChildren = [];
    if (this.props.where === 'remote') {
      if (selectedDevice && selectedDevice !== 'none') {
        resourceChildren = await this.getChildrenForId(toId, sortBy, sortDirection);
      }
    }
    if (this.props.where === 'local') {
      resourceChildren = await this.getChildrenForId(toId, sortBy, sortDirection);
    }

    if (this.props.openningFrom === 'session') {
      resourceChildren = resourceChildren.filter((file) => {
        if (file.type && file.type === 'DIR') {
          return file;
        }
      });
    }


    if (this.props.openningFrom === 'recordings') {
      resourceChildren = resourceChildren.filter((file) => {
        if (file.type && file.type === 'DIR') {
          return file;
        }
        else if (file.name && file.name.endsWith('.isxd')) {
          return file;
        }
      });
    }

    if (this.props.openningFrom === 'snapshots') {
      resourceChildren = resourceChildren.filter((file) => {
        if (file.type && file.type === 'DIR') {
          return file;
        }

        else if (file.name) {
          if (file.name.endsWith('.tiff') || file.name && file.name.endsWith('.MIRA')) {
            return file;
          }
        }

      });
    }

    if (resourceChildren.length > 0) {
      resourceChildren.sort(function (a, b) {
        if (a.name === '..') {
          return -1;
        }
        if (b.name === '..') {
          return 1;
        }
        return new Date(b.modifiedTime) - new Date(a.modifiedTime);
      })
    }


    resourceChildren = resourceChildren.filter((file) => {
      if (file.type && file.type === 'DIR') {
        return file;
      }

      else if (file.name) {
        if (file.name.endsWith('.lock')) {

        }
        else {
          return file;
        }
      }

    });



    this.setState({ lastParamenters: toId });
    const newSelection = (typeof idToSelect === 'undefined' || idToSelect === null) ? [] : [idToSelect];
    if (changeHistory) {
      this.setStateAsync({ history: pushToHistory(history, this.state.selectedResource) });
    }

    this.handleSelectionChange(newSelection);
    resourceChildren && this.handleResourceChildrenChange(resourceChildren);

    this.stopViewLoading();
    this.setParentsForResource(this.state.selectedResource);
  };

  getDevices = async () => {
    const devices = await this.getConnectedDevices();
    if (typeof devices !== "undefined") {
      this.setStateAsync({ isMounted: false });
    } else {
      console.warn('No devices connected');
      this.setStateAsync({ isMounted: false });
    }
    let isMount = false;
    let selectedDevice = ''
    devices.forEach((device) => {
      if (device.mount.isMounted) {
        isMount = true;
        selectedDevice = device;
        return
      }
    });

    if (isMount) {
      this.props.deviceEjected(false);
      this.setStateAsync({ ejected: false });
    }

    console.log("%c[FILEMANAGER]%c Got devices", "color: blue; font-weight: bold;", "color: black;");
    console.log('[FILEMANAGER] devices', devices);
    this.setStateAsync({ isMounted: isMount, selectedDevice: selectedDevice.volume });
    if (devices && devices.length > 0) {
      this.setStateAsync({ devices: devices });
      this.navigateToDir('/', null);
    }
  }

  handleDropdown = async (device) => {

    if (device === 'none') {
      this.props.deviceEjected(true);
      this.setStateAsync({ selectedDevice: device, isMounted: false, resourceChildren: [], ejected: true });
      // this.navigateToDir('/', null);
      return;
    }
    this.startViewLoading();
    let response = await this.mountDevice(device);
    this.setStateAsync({ selectedDevice: device });
    await this.getDevices();
    if (response.status) {
      console.log(`[FILEMANAGER] Device ${device} successfully mounted!`);
      // this.setStateAsync({ selectedDevice: device });
      this.navigateToDir('/', null);
    } else {
      //alert for error
    }
  }


  handleEject = async () => {
    this.setStateAsync({ ejected: true });
    this.handleDropdown('none');
    await this.unmountDevice();
    console.log('[FILEMANAGER] Dvices Ejected');
    this.props.deviceEjected(true);
    await this.getDevices();
    this.navigateToDir('/', null, true);
  }


  unmountDevice = async () => {
    const { api, apiOptions } = this.props;
    return await api.unmountDevice(apiOptions);
  }

  //doubt in method
  async setParentsForResource(resource) {
    if (resource && resource.name && resource.name !== undefined) {
      const resourceParents = this.state.resourceParents;//[]
      // if (resource.name === '..') {
      //   resource.path = this.removeLastDirectory(resource.path);
      //   console.log(resource, "after Remmoving");
      // }
      let find = resourceParents.findIndex((n1) => (n1.path === resource.path));
      let temp = [];
      for (let i = 0; i <= find; i++) {
        const element = resourceParents[i];
        temp.push(element);
      }
      const resourceLocation = temp.length > 0 ? temp : resourceParents.concat(resource);
      // const resourceLocation = resourceParents.concat(resource);
      this.handleResourceLocationChange(resourceLocation);
      this.setStateAsync({ loadingResourceLocation: false, resourceParents: resourceLocation });
    }
    else {
      let selectedResource = this.state.resourceChildren;
      selectedResource.name = '/';
      const resourceLocation = [selectedResource];
      this.handleResourceLocationChange(resourceLocation);
      this.setStateAsync({ loadingResourceLocation: false, resourceParents: resourceLocation });
    }
  }

  async getParentsForId(id) {
    const { api, apiOptions } = this.props;
    return await api.getParentsForId(apiOptions, id);
  }

  async getResourceById(id) {
    const { api, apiOptions } = this.props;
    const result = await api.getResourceById(apiOptions, id);
    return result;
  }

  async getChildrenForId(id, sortBy, sortDirection) {
    const { api, apiOptions, where, compressor, openningFrom } = this.props;
    const { lastParamenters } = this.state;
    let compress = where === 'local' ? compressor : false;
    return api.getChildrenForId(apiOptions, { id, sortBy, sortDirection, where, lastParamenters, compress, openningFrom });
  }

  async getConnectedDevices() {
    const { api, apiOptions } = this.props;
    return api.getDevices(apiOptions);
  }

  async mountDevice(volume) {
    const { api, apiOptions } = this.props;
    return api.mountDevice(apiOptions, { volume });
  }

  getResourceChildrenBySelection(selection) {
    const { resourceChildren } = this.state;
    const filteredResourceItems = resourceChildren && resourceChildren.filter((o) => selection.indexOf(o.id) !== -1);
    return filteredResourceItems;
  }

  handleClickOutside = () => {
    this.props.onClickOutside({ fileNavigator: this });
  };

  handleResourceLocationChange = (resourceLocation) => {
    // let last = this.state.lastParamenters;
    // if (resourceLocation.length > 1) {
    //   last = resourceLocation[resourceLocation.length - 1].path
    // }
    // if (resourceLocation.length === 1) {
    //   last = resourceLocation[0].path;
    // }
    // console.log(last, "last");
    // console.log(resourceLocation, "resourceLocation");
    this.setStateAsync({ resourceLocation });
    this.props.onResourceLocationChange(resourceLocation);

  };

  handleSelectionChange = (selection) => {
    // this.props.getSelectedFile(selection);
    if (selection.length === 0) {
      this.setStateAsync({ selectedRow: null });
    }
    this.setStateAsync({ selection });
    this.props.onSelectionChange(selection);
  };

  handleResourceChildrenChange = (resourceChildren) => {
    this.setStateAsync({ resourceChildren });
    this.props.onResourceChildrenChange(resourceChildren);
  };

  handleResourceChange = (resource) => {
    const where = this.props.where;
    if (where === 'remote') {
      this.props.getRemoteCurrentpath(resource);
      this.setStateAsync({ remotePath: resource });
    }
    else if (where === 'local') {
      this.props.getLocalCurrentpath(resource);
      this.setStateAsync({ localPath: resource });
    }

    this.setStateAsync({ resource });
    this.props.onResourceChange(resource);
  };

  handleSort = async ({ sortBy, sortDirection }) => {
    const { initializedCapabilities } = this.state;
    const sortCapability = find(initializedCapabilities, (o) => o.id === 'sort');
    if (!sortCapability) {
      return;
    }

    // const sort = sortCapability.handler;
    // this.setStateAsync({ loadingView: true });
    // const newResourceChildren = await sort({ sortBy, sortDirection });
    // this.handleResourceChildrenChange(newResourceChildren);
    this.setStateAsync({
      sortBy,
      sortDirection,
      // loadingView: false
    });
  };

  handleResourceItemClick = async ({ event, number, rowData }) => {
    if (rowData.name === '..') {
      return
    }
    console.log(`[FILEMANAGER] Selected File is ${rowData.name}`);
    let selection = [rowData.name];
    // if (rowData.name !== '..') {
    this.setStateAsync({ selectedRow: rowData });
    // }
    // this.handleSelectionChange(selection);
    this.props.onResourceItemClick({ event, number, rowData });
  };

  handleResourceItemRightClick = async ({ event, number, rowData }) => {
    this.props.onResourceItemRightClick({ event, number, rowData });
  };

  handleMoveBackward = () => {
    const { history } = this.state;
    const newHistory = doHistoryStep(history, -1);
    this.handleHistoryChange(newHistory);
  }

  removeLastDirectory = (path) => {
    if (path === '/') {
      return path;
    }
    return path.replace(/([^\/]+)\/$/, '');
  }

  handleResourceItemDoubleClick = async ({ event, number, rowData }) => {
    if (this.props.disabled) {
      return;
    }
    console.log(`[FILEMANAGER] Selected File is ${rowData.name}`);
    const { loadingView } = this.state;
    let { name: id } = rowData;
    if (loadingView) {
      return;
    }

    const isDirectory = rowData.type === 'DIR';
    if (isDirectory) {
      if (rowData.name === 'lost+found') {
        id = '%2Flost%2Bfound%2F';
      }
      let last = this.state.lastParamenters;

      if (rowData.name === '..') {
        id = this.state.resourceLocation[this.state.resourceLocation.length - 2].path;
      }
      if (last !== '' && last !== '/' && rowData.name !== '..') {
        last = last + '/' + id;
      } else {
        last = id;
      }

      // if (rowData.name === '..') {
      //   last = this.removeLastDirectory(rowData.path);
      //   console.log(last, "last path");
      // }


      let selectedResource = rowData;
      selectedResource.path = last;
      this.setState({ selectedResource });
      this.navigateToDir(selectedResource.path, null);
    }

    this.focusView();

    this.props.onResourceItemDoubleClick({ event, number, rowData });
  };

  handleViewKeyDown = async (e) => {
    const { api, apiOptions } = this.props;
    const { loadingView } = this.state;

    if ((e.which === 13 || e.which === 39) && !loadingView) { // Enter key or Right Arrow
      const { selection } = this.state;
      if (selection.length === 1) {
        // Navigate to selected resource if selected resource is single and is directory
        const selectedResourceChildren = this.getResourceChildrenBySelection(selection);

        if (!selectedResourceChildren[0]) {
          // Fix for fast selection updates
          return;
        }

        const isDirectory = selectedResourceChildren[0].type === 'DIR';

        if (isDirectory) {
          this.navigateToDir(selectedResourceChildren[0].id);
        }
      }
    }

    if ((e.which === 8 || e.which === 37) && !loadingView) { // Backspace or Left Arrow
      // Navigate to parent directory
      const { resource } = this.state;
      const parentId = await api.getParentIdForResource(apiOptions, resource);
      if (parentId) {
        this.navigateToDir(parentId, resource.id);
      }
    }
  };

  handleKeyDown = async (e) => {

  };

  handleViewRef = (ref) => {
    this.viewRef = ref;
  };

  showDialog = (rawDialogElement) => {
    this.props.getPopup(rawDialogElement);
    const dialogElement = rawToReactElement(rawDialogElement);
    this.setStateAsync({ dialogElement });
  };

  hideDialog = () => {
    this.props.getPopup(null);
    this.setStateAsync({ dialogElement: null });
  };

  updateNotifications = (notifications) => {
    this.setStateAsync({ notifications });
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.refresh) {
      // if (this.props.where === 'local') {
      //   let path = this.props.localPath.name;
      //   this.navigateToDir(path, null, true);
      // }
      // if (this.props.where === 'remote') {
      //   let path = this.props.remotePath.name;
      //   this.navigateToDir(path, null, true);
      // }
      let path = this.props.where === 'local' ? this.props.localPath.name : this.props.where === 'remote' ? this.props.remotePath.name : '/';
      this.navigateToDir(path, null);
      // this.setStateAsync({ refresh: !this.state.refresh });
      this.props.handleRefresh();
    }

    if (this.state.selection && this.state.selection.length === 0 && this.state.dialogElement) {
      if (this.state.dialogElement !== null) {
        if (this.state.dialogElement.props.headerText === 'Remove') {
          this.hideDialog();
        }
        if (this.state.dialogElement.props.headerText === 'Rename') {
          this.hideDialog();
        }
      }
      
    }
  }

  handleCompressor = (compressor) => {
    // this.setStateAsync({ compressor });
    this.props.handleCompressor(compressor);
    let path = this.state.resourceLocation[this.state.resourceLocation.length - 1].path;
    this.navigateToDir(path, true);
  }


  getCapabilitiesProps = () => ({
    showDialog: this.showDialog,
    hideDialog: this.hideDialog,
    updateNotifications: this.updateNotifications,
    navigateToDir: this.navigateToDir,
    getSelection: () => this.state.selection,
    getSelectedResources: () => this.state.resourceChildren.filter(o => this.state.selection.some((s) => s === o.name)),
    getResource: () => this.state.resource,
    getResourceChildren: () => this.state.resourceChildren,
    getResourceLocation: () => this.state.resourceLocation,
    getNotifications: () => this.state.notifications,
    getSortState: () => ({ sortBy: this.state.sortBy, sortDirection: this.state.sortDirection }),
    getRemoteCurrentpath: () => this.props.remotePath,
    getLocalCurrentpath: () => this.props.localPath,
    setRefresh: () => this.props.handleRefresh(),
    getDevices: () => this.getDevices(),
    isEjected: () => this.props.ejected,
    showErrorPopup: () => this.props.handleShowErrorPopup(),
    handleShowCopyPopupTemp: () => this.props.handleShowCopyPopupTemp(),
    showCheckSizePopup: (data, copyFilesData) => this.props.handleshowCheckSizePopup(data, copyFilesData)
  });

  getContextCapabilities = ({ context, isDataView = false }) => {
    const { apiOptions, handleToolbarActions, disabled, compressor } = this.props;
    const { initializedCapabilities } = this.state;
    return initializedCapabilities.
      filter(capability => (
        (isDataView ? capability.shouldBeAvailable(apiOptions) : true) && hasContext(capability, context)
      )).
      map(capability => {
        const res = ({
          id: capability.id,
          icon: capability.icon,
          label: capability.label || '',
          onClick: capability.handler || (() => { }),
          className: 'btn-primary'
        });

        if (!isDataView) {
          res.disabled = compressor === 'on' || disabled || !capability.shouldBeAvailable(apiOptions);
        }
        return res;
      });
  };


  handleView = () => {
    let selectedFile = this.state.selectedRow;
    let where = this.props.where;
    this.props.getSelectedFile(selectedFile, where);
  }

  handleRefreshFromIcon = () => {
    let path = this.props.where === 'local' ? this.props.localPath.name : this.props.where === 'remote' ? this.props.remotePath.name : '/';
    this.navigateToDir(path, null);
  }


  render() {
    const {
      id,
      apiOptions,
      className,
      listViewLayout,
      signInRenderer,
      viewLayoutOptions,
      disabled,
      where,
      diskSpace,
      compressor,
      loader
    } = this.props;

    const {
      apiInitialized,
      apiSignedIn,
      dialogElement,
      history,
      loadingResourceLocation,
      loadingView,
      notifications,
      resourceChildren,
      resourceLocation,
      selection,
      sortBy,
      sortDirection,
      resource,
      devices,
    } = this.state;

    let viewLoadingElement = null;

    if (!apiInitialized) {
      viewLoadingElement = 'Problems with server connection';
    }

    if (!apiSignedIn) {
      viewLoadingElement = signInRenderer ? signInRenderer() : 'Not authenticated';
    }

    if (dialogElement) {
      viewLoadingElement = dialogElement;
    }

    const viewLoadingOverlay = (viewLoadingElement) ? (
      <div className="oc-fm--file-navigator__view-loading-overlay">
        {viewLoadingElement}
      </div>
    ) : null;

    const locationItems = resourceLocation.map((o, i) => ({
      name: this.props.api.getResourceName(this.props.apiOptions, o),
      onClick: () => this.handleLocationBarChange(o)
    }));

    const rowContextMenuItems = this.getContextCapabilities({ context: 'row', isDataView: true });
    const filesViewContextMenuItems = this.getContextCapabilities({ context: 'files-view', isDataView: true });
    const toolbarItems = this.getContextCapabilities({ context: 'toolbar' });
    const newButtonItems = this.getContextCapabilities({ context: 'new-button', isDataView: true });

    const rowContextMenuId = `row-context-menu-${id}`;
    const filesViewContextMenuId = `files-view-context-menu-${id}`;

    const HideToolBar = this.props.hideToolBar ? this.props.hideToolBar : false;

    const fromSession = this.props.openningFrom === 'session' ? true : false;

    return (
      <div
        id={id}
        data-test-id="filenavigator"
        className={`oc-fm--file-navigator ${className}`}
        style={this.props.minHeight ? { minHeight: this.props.minHeight } : { minHeight: 250 }}
        onKeyDown={this.handleKeyDown}
        ref={(ref) => (this.containerRef = ref)}
      >
        {viewLoadingOverlay}
        {loadingView ? loader : ''}
        {!compressor && !HideToolBar ? <div className="oc-fm--file-navigator__toolbar">
          <Toolbar
            items={toolbarItems}
            newButtonItems={newButtonItems}
            history={history}
            onMoveForward={this.handleHistoryChange}
            onMoveBackward={this.handleHistoryChange}
            locale={apiOptions.locale}
            devices={devices}
            where={where}
            changeToolbarDropdow={this.handleDropdown}
            selectedDevice={this.state.selectedDevice}
            disabled={this.props.disabled}
            handleEject={this.handleEject}
            ejected={this.state.ejected}
            selectedRow={this.state.selectedRow}
            handleView={this.handleView}
            selection={selection}
            diskSpace={diskSpace}
            handleCompressor={this.handleCompressor}
            compressor={compressor}
            handleRefresh={this.handleRefreshFromIcon}
            fromSession={fromSession}
            openningFrom={this.props.openningFrom}
          />
        </div> : ""}
        <div className="oc-fm--file-navigator__view">
          <ListView
            rowContextMenuId={rowContextMenuId}
            filesViewContextMenuId={filesViewContextMenuId}
            onKeyDown={this.handleViewKeyDown}
            onRowClick={this.handleResourceItemClick}
            onRowRightClick={this.handleResourceItemRightClick}
            onRowDoubleClick={this.handleResourceItemDoubleClick}
            onSelection={this.handleSelectionChange}
            onSort={this.handleSort}
            onRef={this.handleViewRef}
            selection={selection}
            sortBy={sortBy}
            sortDirection={sortDirection}
            items={resourceChildren}
            layout={listViewLayout}
            layoutOptions={viewLayoutOptions}
            disabled={disabled}
            compressor={compressor}
          >
            <Notifications
              className="oc-fm--file-navigator__notifications"
              notifications={notifications}
            />
          </ListView>
        </div>
        <div className="oc-fm--file-navigator__location-bar">
          <LocationBar
            items={locationItems}
            disabled={disabled}
          />
        </div>
        <ContextMenu
          triggerId={rowContextMenuId}
          items={rowContextMenuItems}
          fromSession={fromSession}
        />
        {/* <ContextMenu
          triggerId={filesViewContextMenuId}
          items={filesViewContextMenuItems}
          fromSession={fromSession}
        /> */}
      </div>
    );
  }
}

FileNavigator.propTypes = propTypes;
FileNavigator.defaultProps = defaultProps;
