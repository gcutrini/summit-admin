/**
 * Copyright 2020 OpenStack Foundation
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
import T from "i18n-react/dist/i18n-react";
import BadgeSettingsForm from "../../components/forms/badge-settings-form";
import BadgePreviewPanel from "../../components/forms/badge-preview-panel";
import { parseInstalledExtensions ,
  setFieldRenderer,
  clearFieldRenderer
} from "../../actions/badge-extension-actions";
import { getSummitById } from "../../actions/summit-actions";
import {
  getBadgeSettings,
  removeBadgeFeatureImage,
  saveBadgeSettings
} from "../../actions/badge-actions";
import { deleteSetting } from "../../actions/marketing-actions";

class BadgeSettingsPage extends React.Component {
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

  handleSetFieldRenderer = (fieldName, extId, props) => {
    this.props.setFieldRenderer(fieldName, extId, props).then(() => {
      this.props.getBadgeSettings();
    });
  };

  handleClearFieldRenderer = (fieldName) => {
    this.props.clearFieldRenderer(fieldName).then(() => {
      this.props.getBadgeSettings();
    });
  };

  render() {
    const {
      currentSummit,
      badge_settings: badgeSettings,
      marketingSettings,
      errors
    } = this.props;
    const { extensionsRegistry } = this.state;

    const installedExtensions = parseInstalledExtensions(badgeSettings || {});

    return (
      <div className="container">
        <h3>{T.translate("badge_settings.badge_settings")}</h3>
        <hr />
        {currentSummit && (
          <div className="row">
            <div className="col-md-8">
              <BadgeSettingsForm
                entity={badgeSettings}
                currentSummit={currentSummit}
                errors={errors}
                onSubmit={this.props.saveBadgeSettings}
                onDeleteImage={this.props.deleteSetting}
                onDeleteBadgeTypeImage={this.props.removeBadgeFeatureImage}
                rendererExtensions={extensionsRegistry.filter(
                  (ext) => ext.type === "text-field-renderer"
                )}
                installedExtensions={installedExtensions}
                onSetFieldRenderer={this.handleSetFieldRenderer}
                onClearFieldRenderer={this.handleClearFieldRenderer}
              />
            </div>
            <div className="col-md-4">
              <BadgePreviewPanel
                marketingSettings={marketingSettings}
                badgeSettings={badgeSettings}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({
  currentSummitState,
  currentBadgeSettingState,
  baseState
}) => ({
  currentSummit: currentSummitState.currentSummit,
  marketingSettings: Object.entries(
    currentBadgeSettingState.badge_settings || {}
  ).map(([key, setting]) => ({
    key,
    value: setting?.value || "",
    file: setting?.file || setting?.file_preview || null
  })),
  loading: baseState.loading,
  ...currentBadgeSettingState
});

export default connect(mapStateToProps, {
  getSummitById,
  deleteSetting,
  getBadgeSettings,
  saveBadgeSettings,
  removeBadgeFeatureImage,
  setFieldRenderer,
  clearFieldRenderer
})(BadgeSettingsPage);
