/*
 * PaywallCookieBtn.js renders the button to add/remove sites from
 * the paywall cookie list
 */

/*global chrome*/

import React, { Component } from "react";
import Button from 'react-bootstrap/Button';


class PaywallCookieBtn extends Component {
  constructor(props) {
    super(props);
    this.removeFromCookieWhitelist = this.removeFromCookieWhitelist.bind(this);
    this.addToCookieWhitelist = this.addToCookieWhitelist.bind(this);
  }

  addToCookieWhitelist = () => {
    chrome.runtime.sendMessage({ command: "addToPaywallCookieWhitelist" }, () => {
      this.props.rerenderParentCallback();
    });
  }

  removeFromCookieWhitelist = () => {
    chrome.runtime.sendMessage({ command: "removeFromPaywallCookieWhitelist" }, () => {
      this.props.rerenderParentCallback();
    });
  }

  render() {
    let listBtn;
    if (this.props.paywallEnabled) {
      if (this.props.inWhitelist)
        listBtn = <Button onClick={this.removeFromCookieWhitelist} variant="warning" style={{ fontSize: "15px" }}>Block Cookies</Button>
      else
        listBtn = <Button onClick={this.addToCookieWhitelist} variant="outline-info" style={{ fontSize: "15px" }}>Unblock Cookies</Button>
    }
    else {
      listBtn = <Button variant="outline-info" style={{ fontSize: "15px" }} disabled>Bypass Paywall Disabled On Site</Button>
    }
    return (<div>
      {listBtn}
    </div>
    );
  }
}
export default PaywallCookieBtn;
