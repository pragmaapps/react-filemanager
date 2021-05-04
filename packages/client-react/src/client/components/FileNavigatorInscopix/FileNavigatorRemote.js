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
import { createHistory, pushToHistory } from '../history';

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
    class FileNavigatorRemote extends Component {
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
        isMounted: false
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
        const { history, sortBy, sortDirection } = this.state;

        if (startLoading) {
            this.startViewLoading();
        }

        const resource = { name: toId, capabilities: { canDelete: true, canRename: true, canCopy: true, canEdit: true, canDownload: true, canListChildren: true, canAddChildren: true, canRemoveChildren: true } };

        this.handleResourceChange(resource);
        this.setState({ lastParamenters: toId });

        let resourceChildren = [];
        const isMounted = this.state.isMounted;
        if (this.props.where === 'remote') {
            if (isMounted) {
                resourceChildren = await this.getChildrenForId(toId, sortBy, sortDirection);
            }
        }
        if (this.props.where === 'local') {
            resourceChildren = await this.getChildrenForId(toId, sortBy, sortDirection);
        }

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
        console.log(devices, "devices");
        if (typeof devices !== "undefined") {
            this.setStateAsync({ isMounted: false });
        } else {
            console.warn('No devices connected');
            this.setStateAsync({ isMounted: false });
        }
        this.devices = devices.slice();
        console.log("%c[FILEMANAGER]%c Got devices", "color: blue; font-weight: bold;", "color: black;");
        console.log('[FILEMANAGER] devices', devices);
        if (devices && devices.length > 0) {
            this.setStateAsync({ isMounted: true });
            this.navigateToDir('/', null);
        }
    }


    //doubt in method
    async setParentsForResource(resource) {
        if (resource && resource.name && resource.name !== undefined) {

            const resourceParents = this.state.resourceParents;//[]
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
        const { api, apiOptions } = this.props;
        return api.getChildrenForId(apiOptions, { id, sortBy, sortDirection });
    }

    async getConnectedDevices() {
        const { api, apiOptions } = this.props;
        return api.getDevices(apiOptions);
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
        this.setStateAsync({ resourceLocation });
        this.props.onResourceLocationChange(resourceLocation);
    };

    handleSelectionChange = (selection) => {
        this.props.getSelectedFile(selection);
        this.setStateAsync({ selection });
        this.props.onSelectionChange(selection);
    };

    handleResourceChildrenChange = (resourceChildren) => {
        this.setStateAsync({ resourceChildren });
        this.props.onResourceChildrenChange(resourceChildren);
    };

    handleResourceChange = (resource) => {
        this.props.getCurrentpath(resource);
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
        console.log(`[FILEMANAGER] Selected File is ${rowData.name}`);
        let selection = [rowData.name];
        this.handleSelectionChange(selection);
        this.props.onResourceItemClick({ event, number, rowData });
    };

    handleResourceItemRightClick = async ({ event, number, rowData }) => {
        this.props.onResourceItemRightClick({ event, number, rowData });
    };

    handleResourceItemDoubleClick = async ({ event, number, rowData }) => {
        if (this.props.disabled) {
            return;
        }
        console.log(`[FILEMANAGER] Selected File is ${rowData.name}`);
        const { loadingView } = this.state;
        const { name: id } = rowData;
        if (loadingView) {
            return;
        }

        const isDirectory = rowData.type === 'DIR';
        if (isDirectory) {

            let last = this.state.lastParamenters;
            if (last !== '' && last !== '/') {
                last = last + '/' + id;
            } else {
                last = id;
            }

            let selectedResource = rowData;
            selectedResource.path = last;
            this.setState({ selectedResource });
            this.navigateToDir(last, null);
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
        // this.props.getPopup(rawDialogElement);
        const dialogElement = rawToReactElement(rawDialogElement);
        this.setStateAsync({ dialogElement });
    };

    hideDialog = () => {
        // this.props.getPopup(null);
        this.setStateAsync({ dialogElement: null });
    };

    updateNotifications = (notifications) => {
        this.setStateAsync({ notifications });
    };

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
        getSortState: () => ({ sortBy: this.state.sortBy, sortDirection: this.state.sortDirection })
    });

    getContextCapabilities = ({ context, isDataView = false }) => {
        const { apiOptions, handleToolbarActions, disabled } = this.props;
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
                    res.disabled = disabled || !capability.shouldBeAvailable(apiOptions);
                }
                return res;
            });
    };


    render() {
        const {
            id,
            apiOptions,
            className,
            listViewLayout,
            signInRenderer,
            viewLayoutOptions,
            disabled
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
            resource
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

        return (
            <div
                id={id}
                data-test-id="filenavigator"
                className={`oc-fm--file-navigator ${className}`}
                onKeyDown={this.handleKeyDown}
                ref={(ref) => (this.containerRef = ref)}
            >
                {viewLoadingOverlay}
                <div className="oc-fm--file-navigator__toolbar">
                    <Toolbar
                        items={toolbarItems}
                        newButtonItems={newButtonItems}
                        history={history}
                        onMoveForward={this.handleHistoryChange}
                        onMoveBackward={this.handleHistoryChange}
                        locale={apiOptions.locale}
                    />
                </div>
                <div className="oc-fm--file-navigator__view">
                    <ListView
                        rowContextMenuId={rowContextMenuId}
                        filesViewContextMenuId={filesViewContextMenuId}
                        onKeyDown={this.handleViewKeyDown}
                        onRowClick={this.handleResourceItemClick}
                        onRowRightClick={this.handleResourceItemRightClick}
                        onRowDoubleClick={this.handleResourceItemDoubleClick}
                        // onSelection={this.handleSelectionChange}
                        onSort={this.handleSort}
                        onRef={this.handleViewRef}
                        loading={loadingView}
                        selection={selection}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        items={resourceChildren}
                        layout={listViewLayout}
                        layoutOptions={viewLayoutOptions}
                        disabled={disabled}
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
                        loading={loadingResourceLocation}
                        disabled={disabled}
                    />
                </div>
                <ContextMenu
                    triggerId={rowContextMenuId}
                    items={rowContextMenuItems}
                />
                <ContextMenu
                    triggerId={filesViewContextMenuId}
                    items={filesViewContextMenuItems}
                />
            </div>
        );
    }
}

FileNavigatorRemote.propTypes = propTypes;
FileNavigatorRemote.defaultProps = defaultProps;
