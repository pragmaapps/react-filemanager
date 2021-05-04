import PropTypes from 'prop-types';
import React, { Component, Children } from 'react';
import './FileManager.less';

const propTypes = {
  className: PropTypes.string
};
const defaultProps = {};


export default
  class FileManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const { children, className, ...restProps } = this.props;
    // console.log(apiOptionsForLocal, "apiOptionsForLocal");
    return (
      <div data-test-id="filemanager" className={`oc-fm--file-manager ${className || ''}`} {...restProps}>
        <div className="oc-fm--file-manager__navigators row">
          <div className="oc-fm--file-manager__navigator pb-3 col-md-6 col-12">
            {children[0]}
          </div>
          <div className="oc-fm--file-manager__navigator pb-3 col-md-6 col-12">
            {children[1]}
          </div>
        </div>
      </div>
    );
  }
}

FileManager.propTypes = propTypes;
FileManager.defaultProps = defaultProps;
