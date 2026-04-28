import React, { useState } from "react";
import { Panel } from "openstack-uicore-foundation/lib/components";
import ExtensionConfigForm from "./extension-config-form";

const TYPE_LABELS = {
  overlay: { label: "Overlay", bg: "#e3f2fd", color: "#1565c0" },
  "text-field-renderer": { label: "Renderer", bg: "#f3e5f5", color: "#7b1fa2" }
};

/**
 * ExtensionManager - UI for installing, configuring, and uninstalling extensions.
 *
 * Reads available extensions from the registry and installed extensions from
 * marketing settings. Generates configuration forms from extension prop schemas.
 *
 * @param {Object} props
 * @param {Array}  props.registry - Available extensions from extensions.json
 * @param {Array}  props.installedExtensions - Currently installed [{extensionId, fieldName?, props}]
 * @param {Function} props.onInstallOverlay - (extensionId, props) => void
 * @param {Function} props.onUninstallOverlay - (extensionId) => void
 */
const ExtensionManager = ({
  registry = [],
  installedExtensions = [],
  onInstallOverlay,
  onUninstallOverlay
}) => {
  const [expandedExtension, setExpandedExtension] = useState(null);
  const [editingProps, setEditingProps] = useState({});

  const overlayExtensions = registry.filter((ext) => ext.type === "overlay");
  const rendererExtensions = registry.filter(
    (ext) => ext.type === "text-field-renderer"
  );

  const isOverlayInstalled = (extensionId) =>
    installedExtensions.some(
      (inst) => inst.extensionId === extensionId && !inst.fieldName
    );

  const getInstalledOverlayProps = (extensionId) => {
    const inst = installedExtensions.find(
      (i) => i.extensionId === extensionId && !i.fieldName
    );
    return inst?.props || {};
  };

  const handlePropChange = (extensionId, propName, value) => {
    setEditingProps((prev) => ({
      ...prev,
      [extensionId]: {
        ...(prev[extensionId] || {}),
        [propName]: value
      }
    }));
  };

  const handleInstallOverlay = (ext) => {
    const props = editingProps[ext.id] || {};
    // Merge defaults
    const mergedProps = {};
    Object.entries(ext.props || {}).forEach(([key, schema]) => {
      mergedProps[key] = props[key] ?? schema.default;
    });
    onInstallOverlay(ext.id, mergedProps);
  };

  const typeTag = (type) => {
    const config = TYPE_LABELS[type] || {
      label: type,
      bg: "#eee",
      color: "#333"
    };
    return (
      <span
        style={{
          marginLeft: "8px",
          padding: "2px 8px",
          borderRadius: "3px",
          fontSize: "11px",
          backgroundColor: config.bg,
          color: config.color
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ marginTop: "15px" }}>
      {overlayExtensions.length > 0 && (
        <>
          <h5>Overlay Extensions</h5>
          {overlayExtensions.map((ext) => {
            const installed = isOverlayInstalled(ext.id);
            const currentProps = installed
              ? getInstalledOverlayProps(ext.id)
              : editingProps[ext.id] || {};
            return (
              <Panel
                key={ext.id}
                show={expandedExtension === ext.id}
                title={
                  <>
                    {ext.name}
                    {typeTag(ext.type)}
                    {installed && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "#4caf50",
                          fontSize: "11px"
                        }}
                      >
                        Installed
                      </span>
                    )}
                  </>
                }
                handleClick={() =>
                  setExpandedExtension(
                    expandedExtension === ext.id ? null : ext.id
                  )
                }
              >
                <p style={{ fontSize: "12px", color: "#666" }}>
                  {ext.description}
                </p>
                <ExtensionConfigForm
                  propsSchema={ext.props || {}}
                  values={currentProps}
                  onChange={(propName, value) =>
                    handlePropChange(ext.id, propName, value)
                  }
                />
                <div style={{ marginTop: "10px" }}>
                  {installed ? (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleInstallOverlay(ext)}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: "5px" }}
                        onClick={() => onUninstallOverlay(ext.id)}
                      >
                        Uninstall
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleInstallOverlay(ext)}
                    >
                      Install
                    </button>
                  )}
                </div>
              </Panel>
            );
          })}
        </>
      )}

      {rendererExtensions.length > 0 && (
        <>
          <h5 style={{ marginTop: "15px" }}>Text Field Renderers</h5>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Install a renderer to make it available in field settings.
          </p>
          {rendererExtensions.map((ext) => {
            const installed = installedExtensions.some(
              (i) => i.extensionId === ext.id
            );
            return (
              <div
                key={ext.id}
                style={{
                  padding: "10px",
                  marginBottom: "5px",
                  backgroundColor: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong>{ext.name}</strong>
                  {typeTag(ext.type)}
                  {installed && (
                    <span
                      style={{
                        marginLeft: "8px",
                        color: "#4caf50",
                        fontSize: "11px"
                      }}
                    >
                      Installed
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "3px"
                    }}
                  >
                    {ext.description}
                  </div>
                </div>
                {!installed && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const defaults = {};
                      Object.entries(ext.props || {}).forEach(([k, s]) => {
                        defaults[k] = s.default;
                      });
                      onInstallOverlay(ext.id, defaults);
                    }}
                  >
                    Install
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default ExtensionManager;
