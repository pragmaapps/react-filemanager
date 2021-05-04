import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Dialog from '../Dialog';
// import DialogActions from '@material-ui/core/DialogActions';

const propTypes = {
  headerText: PropTypes.string,
  messageText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  submitButtonText: PropTypes.string,
  onHide: PropTypes.func,
  onSubmit: PropTypes.func
};
const defaultProps = {
  headerText: 'Please Choose Destination',
  messageText: 'Please Choose Destination',
  cancelButtonText: 'Cancel',
  submitButtonText: 'OK',
  autofocus: false,
  onHide: () => { },
  onSubmit: () => { },
  onChange: () => { },
};

export default
  class CopyDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      where: 'remote'
    }
  }

  componentDidMount() {
    if (this.ref) {
      this.ref.focus();
    }
  }

  handleKeyDown = async (e) => {
    if (e.which === 13) { // Enter key
      this.handleSubmit();
    }
  };

  handleCancel = async () => {
    this.props.onHide();
  };

  handleSubmit = async () => {
    this.props.onSubmit(this.state.where);
  };

  handleChange = async (e) => {
    this.setState({ where: e.target.value });
  }

  render() {
    const { onHide, headerText, messageText, submitButtonText, cancelButtonText } = this.props;

    return (
      <Dialog onHide={onHide}>
        <div
          tabIndex="0"
          ref={ref => (this.ref = ref)}
          className="oc-fm--dialog__content" onKeyDown={this.handleKeyDown}
        >
          <div className="oc-fm--dialog__header">
            {headerText}
          </div>

          {messageText && (
            <div className="oc-fm--dialog__message">{messageText}</div>
          )}
          <form>
            <input type="radio" id="local" name="where" value="local" checked={this.state.where === 'local'} onChange={this.handleChange} />{" "}
            <label htmlFor="local" style={{ fontSize: 14 }}>local</label>&nbsp;&nbsp;
            <input type="radio" id="remote" name="where" value="remote" checked={this.state.where === 'remote'} onChange={this.handleChange} />{" "}
            <label htmlFor="remote" style={{ fontSize: 14 }}>remote</label>
          </form>

          <div className="oc-fm--dialog__horizontal-group oc-fm--dialog__horizontal-group--to-right">
            <button
              type="button"
              className="oc-fm--dialog__button oc-fm--dialog__button--default text-primary"
              onClick={this.handleCancel}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className={`oc-fm--dialog__button oc-fm--dialog__button--primary text-primary p-0`}
              onClick={this.handleSubmit}
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </Dialog>
    );
  }
}

CopyDialog.propTypes = propTypes;
CopyDialog.defaultProps = defaultProps;
