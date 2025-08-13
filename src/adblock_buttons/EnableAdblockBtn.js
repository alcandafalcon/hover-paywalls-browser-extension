/*
 * EnableAdblockBtn.js renders the button to toggle Adblock functionalities on/off
 */

/*global chrome*/

import React, { Component } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

class EnableAdblockBtn extends Component {
  constructor(props) {
    super(props);
    this.toggleAdblock = this.toggleAdblock.bind(this);
  }

  toggleAdblock = (checked) => {
    const command = checked ? "removeFromAdblockWhitelist" : "addToAdblockWhitelist";
    chrome.runtime.sendMessage({ command }, () => {
      this.props.rerenderParentCallback();
      chrome.tabs.reload();
    });
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col xs={7} >
            <b>Block Ads: </b><br></br>
            <p style={{ fontSize: "14px" }}>(On Site):</p>
          </Col>
          <Col xs={5}>
            <BootstrapSwitchButton
              onChange={this.toggleAdblock}
              checked={this.props.enabled}
              onlabel={'On '}
              offlabel={'Off'}
              width={65}
              onstyle="info" />
          </Col>
        </Row>
      </Container>
    );
  }
}
export default EnableAdblockBtn;
