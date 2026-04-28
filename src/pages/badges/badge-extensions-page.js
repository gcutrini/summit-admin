/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React from "react";
import { connect } from "react-redux";
import ExtensionManager from "../../components/forms/extension-manager";
import {
  parseInstalledExtensions,
  installOverlayExtension,
  uninstallOverlayExtension
} from "../../actions/badge-extension-actions";
import { getBadgeSettings } from "../../actions/badge-actions";

class BadgeExtensionsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      extensionsRegistry: []
    };

    props.getBadgeSettings();
  }

  componentDidMount() {
    const printAppUrl = window.PRINT_APP_URL;
    if (!printAppUrl) return;

    fetch(`${printAppUrl}/extensions.json?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.extensions) {
          this.setState({ extensionsRegistry: data.extensions });
        }
      })
      .catch((err) =>
        console.warn("Failed to fetch extensions registry:", err)
      );
  }

  handleInstallOverlay = (extId, props) => {
    this.props.installOverlayExtension(extId, props).then(() => {
      this.props.getBadgeSettings();
    });
  };

  handleUninstallOverlay = (extId) => {
    this.props.uninstallOverlayExtension(extId).then(() => {
      this.props.getBadgeSettings();
    });
  };

  render() {
    const { badge_settings: badgeSettings } = this.props;
    const { extensionsRegistry } = this.state;
    const installedExtensions = parseInstalledExtensions(badgeSettings || {});

    return (
      <div className="container">
        <h3>Badge Extensions</h3>
        <p style={{ color: "#666" }}>
          Browse and install badge extensions. Installed extensions become
          available in Badge Settings for configuration.
        </p>
        <hr />
        {extensionsRegistry.length > 0 ? (
          <ExtensionManager
            registry={extensionsRegistry}
            installedExtensions={installedExtensions}
            onInstallOverlay={this.handleInstallOverlay}
            onUninstallOverlay={this.handleUninstallOverlay}
          />
        ) : (
          <p style={{ color: "#999" }}>
            {window.PRINT_APP_URL
              ? "Loading extensions registry..."
              : "PRINT_APP_URL not configured. Badge extensions are unavailable."}
          </p>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ currentBadgeSettingState, baseState }) => ({
  loading: baseState.loading,
  ...currentBadgeSettingState
});

export default connect(mapStateToProps, {
  getBadgeSettings,
  installOverlayExtension,
  uninstallOverlayExtension
})(BadgeExtensionsPage);
