import { createAction } from "openstack-uicore-foundation/lib/utils/actions";
import { saveMarketingSetting } from "./marketing-actions";

export const RECEIVE_BADGE_EXTENSIONS_REGISTRY =
  "RECEIVE_BADGE_EXTENSIONS_REGISTRY";
export const BADGE_EXTENSION_INSTALLED = "BADGE_EXTENSION_INSTALLED";
export const BADGE_EXTENSION_UNINSTALLED = "BADGE_EXTENSION_UNINSTALLED";
export const BADGE_EXTENSION_CONFIG_UPDATED = "BADGE_EXTENSION_CONFIG_UPDATED";

/**
 * Fetch the extensions registry from badge-print-app.
 */
export const getExtensionsRegistry = () => async (dispatch) => {
  const printAppUrl = window.PRINT_APP_URL;
  if (!printAppUrl) {
    console.warn("PRINT_APP_URL not configured, badge extensions unavailable");
    return;
  }

  try {
    const response = await fetch(
      `${printAppUrl}/extensions.json?t=${Date.now()}`
    );
    if (response.ok) {
      const registry = await response.json();
      dispatch(
        createAction(RECEIVE_BADGE_EXTENSIONS_REGISTRY)({
          extensions: registry.extensions || []
        })
      );
    }
  } catch (err) {
    console.warn("Failed to fetch badge extensions registry:", err.message);
  }
};

const getOverlayConfigKey = (extensionId) =>
  `BADGE_EXTENSION_${extensionId.replace(/-/g, "_").toUpperCase()}_CONFIG`;

const getRendererConfigKey = (fieldName) =>
  `BADGE_EXTENSION_${fieldName.toUpperCase()}_RENDERER`;

/**
 * Save an extension setting, looking up existing ID from badge settings
 * to avoid duplicate key errors (PUT vs POST).
 */
const saveExtensionSetting = (key, value) => (dispatch, getState) => {
  const { currentBadgeSettingState } = getState();
  const existing = currentBadgeSettingState?.badge_settings?.[key];
  const entity = {
    key,
    value,
    type: "TEXT",
    ...(existing?.id && { id: existing.id })
  };
  return dispatch(saveMarketingSetting(entity));
};

/**
 * Install an overlay extension for the current summit.
 */
export const installOverlayExtension =
  (extensionId, props = {}) =>
  async (dispatch) => {
    const key = getOverlayConfigKey(extensionId);
    const value = JSON.stringify({ extensionId, props });
    await dispatch(saveExtensionSetting(key, value));
    dispatch(
      createAction(BADGE_EXTENSION_INSTALLED)({ extensionId, props, key })
    );
  };

/**
 * Uninstall an overlay extension.
 */
export const uninstallOverlayExtension = (extensionId) => async (dispatch) => {
  const key = getOverlayConfigKey(extensionId);
  await dispatch(saveExtensionSetting(key, ""));
  dispatch(createAction(BADGE_EXTENSION_UNINSTALLED)({ extensionId, key }));
};

/**
 * Set a renderer extension for a text field.
 */
export const setFieldRenderer =
  (fieldName, extensionId, props = {}) =>
  async (dispatch) => {
    const key = getRendererConfigKey(fieldName);
    const value = JSON.stringify({ extensionId, fieldName, props });
    await dispatch(saveExtensionSetting(key, value));
    dispatch(
      createAction(BADGE_EXTENSION_CONFIG_UPDATED)({
        fieldName,
        extensionId,
        props,
        key
      })
    );
  };

/**
 * Clear a renderer extension for a text field.
 */
export const clearFieldRenderer = (fieldName) => async (dispatch) => {
  const key = getRendererConfigKey(fieldName);
  await dispatch(saveExtensionSetting(key, ""));
  dispatch(
    createAction(BADGE_EXTENSION_CONFIG_UPDATED)({
      fieldName,
      extensionId: null,
      props: {},
      key
    })
  );
};

/**
 * Parse installed extensions from badge settings.
 */
export const parseInstalledExtensions = (badgeSettings) => {
  const installed = [];

  Object.entries(badgeSettings).forEach(([key, setting]) => {
    const value = setting?.value;
    if (!value) return;

    if (key.startsWith("BADGE_EXTENSION_") && key.endsWith("_CONFIG")) {
      try {
        const config = JSON.parse(value);
        if (config.extensionId) {
          installed.push({
            extensionId: config.extensionId,
            props: config.props || {}
          });
        }
      } catch (e) {
        // invalid JSON, skip
      }
    }

    if (key.startsWith("BADGE_EXTENSION_") && key.endsWith("_RENDERER")) {
      try {
        const config = JSON.parse(value);
        if (config.extensionId) {
          installed.push({
            extensionId: config.extensionId,
            fieldName: config.fieldName,
            props: config.props || {}
          });
        }
      } catch (e) {
        // invalid JSON, skip
      }
    }
  });

  return installed;
};
