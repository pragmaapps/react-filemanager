import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './Toolbar.less';
import Svg from '@opuscapita/react-svg/lib/SVG';
import DropdownMenu from '../DropdownMenu';
import DropdownMenuItem from '../DropdownMenuItem';
import { isHistoryStepPossible, doHistoryStep } from '../history';
import getMess from '../../../translations';

import icons from './icons-svg';

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.object,
    onClick: PropTypes.func
  })),
  newButtonItems: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.object,
    onClick: PropTypes.func
  })),
  newButtonText: PropTypes.string,
  history: PropTypes.shape({
    stack: PropTypes.array,
    currentPointer: PropTypes.number
  }),
  onMoveBackward: PropTypes.func,
  onMoveForward: PropTypes.func,
  locale: PropTypes.string
};
const defaultProps = {
  history: [],
  items: [],
  newButtonItems: [],
  locale: 'en',
};

export default
  class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDropdownMenu: false,
    };
  }


  handleShowDropdownMenu = () => {
    this.setState({ showDropdownMenu: true });
  }

  handleHideDropdownMenu = () => {
    this.setState({ showDropdownMenu: false });
  }

  handleMoveBackward = () => {
    const { history } = this.props;
    const newHistory = doHistoryStep(history, -1);
    this.props.onMoveBackward(newHistory);
  }

  handleMoveForward = () => {
    const { history } = this.props;
    const newHistory = doHistoryStep(history, 1);
    this.props.onMoveForward(newHistory);
  }

  handleChange = (e) => {
    console.log(`[FILEMANAGER] Select device: ${e.target.value}`);
    this.props.changeToolbarDropdow(e.target.value);
  }

  formatBytes = (num, binary = false) => {
    var neg = num < 0;
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (neg) {
      num = -num;
    }
    if (num < 1) {
      return (neg ? '-' : '') + num + ' B';
    }
    var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    var unit = units[exponent];
    return (neg ? '-' : '') + num + ' ' + unit;

  }

  handleSelectTab = (compressor) => {
    this.props.handleCompressor(compressor);
  }

  handleRefresh = () => {
    this.props.handleRefresh();
  }


  render() {
    const {
      items,
      newButtonItems,
      newButtonText,
      history,
      devices,
      where,
      disabled,
      ejected,
      selectedRow,
      diskSpace,
      selection,
      compressor,
      fromSession,
      openningFrom,
      selectedDevice,
      onMoveBackward, // eslint-disable-line no-unused-vars
      onMoveForward // eslint-disable-line no-unused-vars
    } = this.props;
    const { showDropdownMenu, selectedTab } = this.state;
    let ext = selectedRow && selectedRow.type !== 'DIR' ? selectedRow.name.match(/\.(.+)$/)[1] : "";
    let viewDisabled = ext === 'png'
      || ext === 'tiff'
      || ext === 'isxd'
      || ext === 'MIRA'
      || ext === 'json'
      && selection.length > 0
      ? false : true;
    let remoteDisabled = where === 'remote' && ejected ? true : false;
    const itemsElement = items.length ? (
      <div data-test-id="toolbar" className="oc-fm--toolbar__items">
        {items.map((item, i) => (
          fromSession && (item.id === 'rename' || item.id === 'delete') ? <button
            type="button"
            key={i}
            data-test-id={`toolbar-item--${item.id}`}
            disabled={item.disabled || remoteDisabled || disabled}
            className={item.disabled || remoteDisabled || disabled ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
            title={item.label || ''}
            onClick={(item.onClick) || (() => { })}
          >
            <Svg
              className="oc-fm--toolbar__item-icon"
              svg={item.icon && item.icon.svg}
              style={{ fill: (item.icon && item.icon.fill) || '#424242' }}
            />
          </button> : !fromSession ?
            <button
              type="button"
              key={i}
              data-test-id={`toolbar-item--${item.id}`}
              disabled={item.disabled || remoteDisabled || disabled}
              className={item.disabled || remoteDisabled || disabled ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
              title={item.label || ''}
              onClick={(item.onClick) || (() => { })}
            >
              <Svg
                className="oc-fm--toolbar__item-icon"
                svg={item.icon && item.icon.svg}
                style={{ fill: (item.icon && item.icon.fill) || '#424242' }}
              />
            </button> : ""

        ))}
      </div>
    ) : null;



    const newButtonElement = newButtonText ? (
      <button
        type="button"
        onClick={this.handleShowDropdownMenu}
        className="oc-fm--toolbar__new-button"
      >
        {newButtonText}
      </button>
    ) : newButtonItems.map((item, i) => (
      where === 'remote'
        ?
        <button
          key={i}
          data-test-id={`toolbar-item--${item.id}`}
          disabled={item.disabled || remoteDisabled || item.id === 'upload'}
          className={item.disabled || remoteDisabled || item.id === 'upload' ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={item.label || ''}
          onClick={(item.onClick) || (() => { })}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={item.icon && item.icon.svg}
            style={{ fill: (item.icon && item.icon.fill) || '#424242' }}
          />
        </button>
        : where === 'local' && fromSession && item.id === 'createFolder' ? <button
          key={i}
          data-test-id={`toolbar-item--${item.id}`}
          disabled={item.disabled}
          className={item.disabled ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={item.label || ''}
          onClick={(item.onClick) || (() => { })}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={item.icon && item.icon.svg}
            style={{ fill: (item.icon && item.icon.fill) || '#424242' }}
          />
        </button>
          : where === 'local' && !fromSession
            ? <button
              key={i}
              data-test-id={`toolbar-item--${item.id}`}
              disabled={item.disabled || item.id === 'upload'}
              className={item.disabled || item.id === 'upload' ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
              title={item.label || ''}
              onClick={(item.onClick) || (() => { })}
            >
              <Svg
                className="oc-fm--toolbar__item-icon"
                svg={item.icon && item.icon.svg}
                style={{ fill: (item.icon && item.icon.fill) || '#424242' }}
              />
            </button> : ""
    ));

    const dropdownMenuItems = newButtonItems.map((item, i) => (
      <DropdownMenuItem key={i} icon={item.icon} onClick={item.onClick || (() => { })}>
        <span>{item.label}</span>
      </DropdownMenuItem>
    ));

    const dropdownMenuElement = showDropdownMenu ? (
      <DropdownMenu
        show={showDropdownMenu}
        onHide={this.handleHideDropdownMenu}
      >
        {dropdownMenuItems}
      </DropdownMenu>
    ) : null;

    const newButtonContainer = newButtonText ? (
      <div className="oc-fm--toolbar__new-button-container">
        {newButtonElement}
        {dropdownMenuElement}
      </div>
    ) : (
      <div data-test-id="toolbar" className="oc-fm--toolbar__items">
        {newButtonElement}
      </div>
    );

    const getMessage = getMess.bind(null, this.props.locale);

    const navButtons = (
      <div className="oc-fm--toolbar__nav-buttons">
        <button
          type="button"
          disabled={!isHistoryStepPossible(history, -1)}
          className={!isHistoryStepPossible(history, -1) ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={getMessage('moveBack')}
          onClick={() => this.handleMoveBackward()}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={icons.moveBackward}
            style={{ fill: '#424242' }}
          />
        </button>

        <button
          type="button"
          disabled={!isHistoryStepPossible(history, 1)}
          className={!isHistoryStepPossible(history, 1) ? `oc-fm--toolbar__item cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={getMessage('moveForward')}
          onClick={() => this.handleMoveForward()}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={icons.moveForward}
            style={{ fill: '#424242' }}
          />
        </button>
      </div>
    );

    let drop = (
      <div className="oc-fm--toolbar__items">
        <select name="devices" value={this.props.selectedDevice} disabled={disabled} className="form-control" onChange={this.handleChange} style={{ height: 32 }}>
          <option value="none">Please Select Device</option>
          {devices.map(device => {
            return <option value={device.volume} key={device.uuid}>{device.volume}</option>
          })}
        </select>
      </div>
    );

    let diskSpaceItem = (
      <div className="oc-fm--toolbar__items m-0 p-0 d-none d-lg-block">
        {diskSpace.free && <span>{this.formatBytes(diskSpace.free)} FREE / {this.formatBytes(diskSpace.total)}</span>}
      </div>
    )

    let ejectBtn = (
      <div className="oc-fm--toolbar__items m-0 p-0">
        <button
          type="button"
          disabled={disabled || remoteDisabled}
          className={disabled || remoteDisabled ? `oc-fm--toolbar__item btn-sm cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={'Eject Device'}
          onClick={() => this.props.handleEject()}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={icons.ejectDevice}
            style={{ fill: '#424242' }}
          />
        </button>
      </div>
    );


    const viewBtn = (
      <div className="oc-fm--toolbar__items">
        <button
          type="button"
          disabled={viewDisabled || disabled || remoteDisabled || ext === 'isxd' || ext === 'MIRA'}
          className={viewDisabled || disabled || !selectedRow || remoteDisabled || ext === 'isxd' || ext === 'MIRA' ? `oc-fm--toolbar__item btn-sm cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={'View File'}
          onClick={() => this.props.handleView()}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={icons.viewFile}
            style={{ fill: '#424242' }}
          />
        </button>
      </div>
    );

    const tempButtons = (
      <div className="oc-fm--toolbar__items ml-auto">
        <button
          type="button"
          disabled={disabled || remoteDisabled}
          className={disabled || remoteDisabled ? `oc-fm--toolbar__item btn-sm cursor-guest-mode` : `oc-fm--toolbar__item`}
          title={'Refresh'}
          onClick={() => this.handleRefresh()}
        >
          <Svg
            className="oc-fm--toolbar__item-icon"
            svg={icons.reload}
            style={{ fill: '#424242' }}
          />
        </button>
      </div>
    );

    return (
      <div className="oc-fm--toolbar">
        {/* {navButtons} */}
        {newButtonContainer}
        {where === 'local' && diskSpace ? diskSpaceItem : ""}
        {fromSession ? "" : tempButtons}
        {where === 'remote' ? drop : ""}
        {where === 'remote' && !ejected ? ejectBtn : ""}
        {fromSession ? "" : viewBtn}
        {itemsElement}
      </div>
    );
  }
}

Toolbar.propTypes = propTypes;
Toolbar.defaultProps = defaultProps;
