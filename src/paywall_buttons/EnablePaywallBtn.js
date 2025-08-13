/*
 * EnablePaywallBtn.js renders the button to toggle Paywall Bypas functionalities on/off
 */


/*global chrome*/

import React, { Component } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

class EnablePaywallBtn extends Component {
  constructor(props) {
    super(props);
    this.togglePaywall = this.togglePaywall.bind(this);
  }

  togglePaywall = (checked) => {
    const command = checked ? "enablePaywall" : "disablePaywall";
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
            <b>Bypass Paywalls</b><br></br>
            <p style={{ fontSize: "14px" }}>(On Site):</p>
          </Col>
          <Col xs={5}>
            <BootstrapSwitchButton
              onChange={this.togglePaywall}
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
export default EnablePaywallBtn;
