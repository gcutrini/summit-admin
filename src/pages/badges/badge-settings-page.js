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
import BadgeSettingsForm from "../../components/forms/badge-settings-form-v2";
import {
  parseInstalledExtensions,
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

  handleOpenPreview = () => {
    const { match } = this.props;
    const previewUrl = `${window.location.origin}${match.url}/preview`;
    window.open(previewUrl, "badge-preview", "width=500,height=700");
  };

  handleSetFieldRenderer = (fieldName, extId, extProps) => {
    this.props.setFieldRenderer(fieldName, extId, extProps).then(() => {
      this.props.getBadgeSettings();
    });
  };

  handleClearFieldRenderer = (fieldName) => {
    this.props.clearFieldRenderer(fieldName).then(() => {
      this.props.getBadgeSettings();
    });
  };

  render() {
    const { currentSummit, badge_settings: badgeSettings, errors } = this.props;
    const { extensionsRegistry } = this.state;

    const installedExtensions = parseInstalledExtensions(badgeSettings || {});

    return (
      <div className="container">
        <div className="row" style={{ marginBottom: "15px" }}>
          <div className="col-md-6">
            <h3 style={{ margin: 0 }}>
              {T.translate("badge_settings.badge_settings")}
            </h3>
          </div>
          <div className="col-md-6 text-right">
            <button
              className="btn btn-default"
              onClick={this.handleOpenPreview}
            >
              <i className="fa fa-external-link" /> Open Preview
            </button>
          </div>
        </div>
        <hr />
        {currentSummit && (
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
