/*
 * PaywallSpoofBtn.js renders the button to add/remove sites from
 * the paywall cookie list
 */

/*global chrome*/

import React, { Component } from "react";
import Button from 'react-bootstrap/Button';


class PaywallSpoofBtn extends Component {
  constructor(props) {
    super(props);
    this.removeFromSpoofWhitelist = this.removeFromSpoofWhitelist.bind(this);
    this.addToSpoofWhitelist = this.addToSpoofWhitelist.bind(this);
  }

  addToSpoofWhitelist = () => {
    chrome.runtime.sendMessage({ command: "addToPaywallSpoofWhitelist" }, () => {
      this.props.rerenderParentCallback();
    });
  }

  removeFromSpoofWhitelist = () => {
    chrome.runtime.sendMessage({ command: "removeFromPaywallSpoofWhitelist" }, () => {
      this.props.rerenderParentCallback();
    });
  }

  render() {
    let listBtn;
    if (this.props.paywallEnabled) {
      if (this.props.inWhitelist)
        listBtn = <Button onClick={this.removeFromSpoofWhitelist} variant="warning" style={{ fontSize: "15px" }}>Spoof Site as Crawler</Button>
      else
        listBtn = <Button onClick={this.addToSpoofWhitelist} variant="outline-info" style={{ fontSize: "15px" }}>Unspoof Site as Crawler</Button>
    }
    else {
      listBtn = <Button onClick={this.addToSpoofWhitelist} variant="outline-info" style={{ fontSize: "15px" }} disabled>Bypass Paywall Disabled On Site</Button>
    }
    return (<div>
      {listBtn}
    </div>
    );
  }
}
export default PaywallSpoofBtn;
