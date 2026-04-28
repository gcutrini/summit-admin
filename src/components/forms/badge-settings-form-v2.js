import React, { useState, useEffect } from "react";
import {
  Input,
  UploadInput,
  Dropdown,
  Panel
} from "openstack-uicore-foundation/lib/components";
import Switch from "react-switch";
import Swal from "sweetalert2";
import HexColorInput from "../inputs/hex-color-input";
import ExtensionConfigForm from "./extension-config-form";
import {
  BADGE_SETTINGS_SECTIONS,
  getFeatureFieldSchema
} from "../../utils/badge-settings-schema";
import { PREVIEW_CHANNEL } from "../../pages/badges/badge-preview-page";

const SchemaField = ({
  id,
  schema,
  value,
  entity,
  onChange,
  onUpload,
  onRemoveFile
}) => {
  switch (schema.type) {
    case "string":
      return (
        <Input
          className="form-control"
          id={id}
          value={value}
          onChange={onChange}
        />
      );

    case "textarea":
      return (
        <textarea
          className="form-control"
          id={id}
          rows={4}
          value={value}
          onChange={(ev) =>
            onChange({ target: { id, value: ev.target.value } })
          }
        />
      );

    case "color":
      return (
        <HexColorInput
          className="form-control"
          id={id}
          value={value}
          onChange={onChange}
        />
      );

    case "enum":
      return (
        <Dropdown
          id={id}
          value={value}
          onChange={onChange}
          options={schema.options || []}
          isClearable
        />
      );

    case "switch":
      return (
        <Switch
          id={id}
          checked={value !== "HIDE"}
          onChange={(val) =>
            onChange({
              target: { id, value: val ? "SHOW" : "HIDE", type: "switch" }
            })
          }
          uncheckedIcon={false}
          checkedIcon={false}
          className="react-switch"
        />
      );

    case "file":
      return (
        <UploadInput
          id={id}
          value={entity?.[id]?.file_preview || entity?.[id]?.file}
          handleUpload={(file, props) => onUpload(file, props)}
          handleRemove={() => onRemoveFile(id)}
          className="dropzone col-md-6"
          multiple={false}
        />
      );

    default:
      return (
        <Input
          className="form-control"
          id={id}
          value={value}
          onChange={onChange}
        />
      );
  }
};

const FieldRow = ({ id, schema, entity, onChange, onUpload, onRemoveFile }) => {
  if (schema.showWhen) {
    const conditionValue = entity?.[schema.showWhen.key]?.value;
    if (conditionValue !== schema.showWhen.value) return null;
  }

  const value = entity?.[id]?.value ?? "";

  return (
    <div className="col-md-6" style={{ marginBottom: "10px" }}>
      <label>
        {schema.label}
        {schema.help && (
          <>
            {" "}
            <i className="fa fa-info-circle" title={schema.help} />
          </>
        )}
      </label>
      <br />
      <SchemaField
        id={id}
        schema={schema}
        value={value}
        entity={entity}
        onChange={onChange}
        onUpload={onUpload}
        onRemoveFile={onRemoveFile}
      />
    </div>
  );
};

const isFieldVisible = (schema, entity) => {
  if (!schema.showWhen) return true;
  return entity?.[schema.showWhen.key]?.value === schema.showWhen.value;
};

const SectionFields = ({
  fields,
  entity,
  onChange,
  onUpload,
  onRemoveFile
}) => {
  const visibleEntries = Object.entries(fields).filter(([, schema]) =>
    isFieldVisible(schema, entity)
  );
  const rows = [];

  const COLS_PER_ROW = 2;
  for (let i = 0; i < visibleEntries.length; i += COLS_PER_ROW) {
    rows.push(
      <div className="row form-group" key={visibleEntries[i][0]}>
        <FieldRow
          id={visibleEntries[i][0]}
          schema={visibleEntries[i][1]}
          entity={entity}
          onChange={onChange}
          onUpload={onUpload}
          onRemoveFile={onRemoveFile}
        />
        {visibleEntries[i + 1] && (
          <FieldRow
            id={visibleEntries[i + 1][0]}
            schema={visibleEntries[i + 1][1]}
            entity={entity}
            onChange={onChange}
            onUpload={onUpload}
            onRemoveFile={onRemoveFile}
          />
        )}
      </div>
    );
  }

  return rows;
};

const RendererSelector = ({
  fieldName,
  rendererExtensions,
  installedExtensions,
  onSetFieldRenderer,
  onClearFieldRenderer
}) => {
  if (!rendererExtensions?.length) return null;

  const currentRenderer = installedExtensions?.find(
    (i) => i.fieldName === fieldName
  );

  const installedIds = new Set(
    (installedExtensions || []).map((i) => i.extensionId)
  );
  const available = rendererExtensions.filter(
    (ext) =>
      installedIds.has(ext.id) &&
      (!ext.applicableFields || ext.applicableFields.includes(fieldName))
  );

  if (!available.length && !currentRenderer) return null;

  return (
    <div
      className="row form-group"
      style={{
        marginBottom: "15px",
        paddingBottom: "10px",
        borderBottom: "1px solid #eee"
      }}
    >
      <div className="col-md-6">
        <label>Rendering Strategy</label>
        <select
          className="form-control"
          value={currentRenderer?.extensionId || ""}
          onChange={(ev) => {
            const extId = ev.target.value;
            if (extId) {
              const ext = available.find((e) => e.id === extId);
              if (ext) {
                const defaults = {};
                Object.entries(ext.props || {}).forEach(([k, s]) => {
                  defaults[k] = s.default;
                });
                onSetFieldRenderer(fieldName, extId, defaults);
              }
            } else {
              onClearFieldRenderer(fieldName);
            }
          }}
        >
          <option value="">Default (TextFit)</option>
          {available.map((ext) => (
            <option key={ext.id} value={ext.id}>
              {ext.name}
            </option>
          ))}
        </select>
      </div>
      {currentRenderer &&
        (() => {
          const ext = available.find(
            (e) => e.id === currentRenderer.extensionId
          );
          if (!ext?.props) return null;
          return (
            <div className="col-md-6">
              <ExtensionConfigForm
                propsSchema={ext.props}
                values={currentRenderer.props || {}}
                onChange={(propName, value) => {
                  const newProps = {
                    ...(currentRenderer.props || {}),
                    [propName]: value
                  };
                  onSetFieldRenderer(fieldName, ext.id, newProps);
                }}
              />
            </div>
          );
        })()}
    </div>
  );
};

const BadgeSettingsFormV2 = ({
  entity: initialEntity,
  currentSummit,
  errors: initialErrors,
  onSubmit,
  onDeleteImage,
  onDeleteBadgeTypeImage,
  rendererExtensions,
  installedExtensions,
  onSetFieldRenderer,
  onClearFieldRenderer
}) => {
  const [entity, setEntity] = useState({ ...initialEntity });
  const [, setErrors] = useState(initialErrors || {});
  const [showSection, setShowSection] = useState(null);

  useEffect(() => {
    setEntity({ ...initialEntity });
  }, [initialEntity]);

  useEffect(() => {
    setErrors(initialErrors || {});
  }, [initialErrors]);

  // Broadcast settings to detached preview window
  useEffect(() => {
    const channel = new BroadcastChannel(PREVIEW_CHANNEL);
    const marketingSettings = Object.entries(entity).map(([key, setting]) => ({
      key,
      value: setting?.value || "",
      file: setting?.file || setting?.file_preview || null
    }));

    channel.postMessage({
      type: "SETTINGS_UPDATE",
      payload: { marketingSettings, badgeSettings: entity }
    });

    // Respond to preview window requesting initial state
    const handleMessage = (event) => {
      if (event.data?.type === "REQUEST_STATE") {
        channel.postMessage({
          type: "SETTINGS_UPDATE",
          payload: { marketingSettings, badgeSettings: entity }
        });
      }
    };
    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [entity]);

  const handleChange = (ev) => {
    const newEntity = { ...entity };
    let { value, id } = ev.target;

    if (ev.target.type === "checkbox" || ev.target.type === "switch") {
      if (ev.target.type === "checkbox") value = ev.target.checked;
    }

    if (!newEntity[id]?.type) {
      const newEntityType = id.includes("_COLOR") ? "HEX_COLOR" : "TEXT";
      newEntity[id] = { value, type: newEntityType, updated: true };
    } else {
      newEntity[id] = { ...newEntity[id], value, updated: true };
    }

    setEntity(newEntity);
  };

  const handleUploadFile = (file, props) => {
    const { id } = props;
    const formerFile = { ...entity[id] };
    const newEntity = {
      ...entity,
      [id]: {
        id: formerFile?.id || 0,
        type: "FILE",
        file,
        file_preview: file.preview,
        updated: true
      }
    };
    setEntity(newEntity);
  };

  const handleRemoveFile = (attr) => {
    const newEntity = { ...entity };
    newEntity[attr] = { ...newEntity[attr], file_preview: "", file: "" };

    if (newEntity[attr]?.id) {
      onDeleteImage(newEntity[attr].id).then(() => {
        newEntity[attr].id = 0;
        setEntity({ ...newEntity });
      });
    } else {
      setEntity(newEntity);
    }
  };

  const handleRemoveBadgeTypeFile = (attr) => {
    const newEntity = { ...entity };
    newEntity[attr] = { ...newEntity[attr], file_preview: "", file: "" };

    if (newEntity[attr]?.id) {
      onDeleteBadgeTypeImage(newEntity[attr].id).then(() => {
        newEntity[attr].id = 0;
        setEntity({ ...newEntity });
      });
    } else {
      setEntity(newEntity);
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const settingsToSave = Object.fromEntries(
      Object.entries(entity).filter(([, values]) => values.updated === true)
    );
    onSubmit(settingsToSave).then(() => {
      Swal.fire({
        title: "Done",
        html: "Badge template settings updated",
        type: "success"
      });
    });
  };

  const toggleSection = (section) => {
    setShowSection(showSection === section ? null : section);
  };

  const renderSection = (section) => {
    const content = (
      <>
        {section.textField && (
          <RendererSelector
            fieldName={section.textField}
            rendererExtensions={rendererExtensions}
            installedExtensions={installedExtensions}
            onSetFieldRenderer={onSetFieldRenderer}
            onClearFieldRenderer={onClearFieldRenderer}
          />
        )}
        <SectionFields
          fields={section.fields}
          entity={entity}
          onChange={handleChange}
          onUpload={handleUploadFile}
          onRemoveFile={handleRemoveFile}
        />
      </>
    );

    if (section.collapsible) {
      return (
        <Panel
          key={section.id}
          show={showSection === section.id}
          title={section.title}
          handleClick={() => toggleSection(section.id)}
        >
          {content}
        </Panel>
      );
    }

    return (
      <div key={section.id}>
        <h3>{section.title}</h3>
        {content}
        <hr />
      </div>
    );
  };

  const renderFeatureSections = () => {
    if (!currentSummit?.badge_features_types?.length) return null;

    return currentSummit.badge_features_types.map((bf) => {
      const featureFields = getFeatureFieldSchema(bf.id);
      return (
        <Panel
          key={`feature-${bf.id}`}
          show={showSection === `feature-${bf.name}`}
          title={bf.name}
          handleClick={() => toggleSection(`feature-${bf.name}`)}
        >
          <SectionFields
            fields={featureFields}
            entity={entity}
            onChange={handleChange}
            onUpload={handleUploadFile}
            onRemoveFile={handleRemoveFile}
          />
        </Panel>
      );
    });
  };

  const renderBadgeTypeSections = () => {
    if (!currentSummit?.badge_types?.length) return null;

    return (
      <div>
        <h3>Badge Types</h3>
        {currentSummit.badge_types.map((bt) => {
          const key = `BADGE_TEMPLATE_TYPE_${bt.id}_BACKGROUND_IMG`;
          return (
            <Panel
              key={`type-${bt.id}`}
              show={showSection === `type-${bt.name}`}
              title={bt.name}
              handleClick={() => toggleSection(`type-${bt.name}`)}
            >
              <div className="row form-group">
                <div className="col-md-12">
                  <label>Background Image</label>
                  <br />
                  <UploadInput
                    id={key}
                    value={entity?.[key]?.file_preview || entity?.[key]?.file}
                    handleUpload={handleUploadFile}
                    handleRemove={() => handleRemoveBadgeTypeFile(key)}
                    className="dropzone col-md-6"
                    multiple={false}
                  />
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    );
  };

  return (
    <form className="badge-settings-form">
      {BADGE_SETTINGS_SECTIONS.map(renderSection)}

      {renderFeatureSections()}

      <hr />
      {renderBadgeTypeSections()}

      <hr />
      <div className="row">
        <div className="col-md-12 submit-buttons">
          <input
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary pull-right"
            value="Save"
          />
        </div>
      </div>
    </form>
  );
};

export default BadgeSettingsFormV2;
