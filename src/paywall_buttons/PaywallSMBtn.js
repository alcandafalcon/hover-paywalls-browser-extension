/*
 * PaywallSMBtn.js renders the button to add/remove sites from
 * the paywall social media referrer list
 */

/*global chrome*/

import React, { Component } from "react";
import Button from 'react-bootstrap/Button';


class PaywallSMBtn extends Component {
  constructor(props) {
    super(props);
    this.removeFromSMWhitelist = this.removeFromSMWhitelist.bind(this);
    this.addToSMWhitelist = this.addToSMWhitelist.bind(this);
  }

  addToSMWhitelist = () => {
    chrome.runtime.sendMessage({ command: "addToPaywallSMWhitelist" }, () => {
      this.props.rerenderParentCallback();
    });
  }

  removeFromSMWhitelist = () => {
    chrome.runtime.sendMessage({ command: "removeFromPaywallSMWhitelist" }, () => {
      this.props.rerenderParentCallback();
    });
  }

  render() {
    let listBtn;
    if (this.props.paywallEnabled) {
      if (this.props.inWhitelist)
        listBtn = <Button onClick={this.removeFromSMWhitelist} variant="warning" style={{ fontSize: "15px" }}>Change Referrer Header</Button>
      else
        listBtn = <Button onClick={this.addToSMWhitelist} variant="outline-info" style={{ fontSize: "15px" }}>Unchange Referrer Header</Button>
    }
    else {
      listBtn = <Button onClick={this.addToSMWhitelist} variant="outline-info" style={{ fontSize: "15px" }} disabled>Bypass Paywall Disabled On Site</Button>
    }
    return (<div>
      {listBtn}
    </div>
    );
  }
}
export default PaywallSMBtn;
