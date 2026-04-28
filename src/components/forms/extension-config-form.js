import React from "react";
import { Input, Dropdown } from "openstack-uicore-foundation/lib/components";
import HexColorInput from "../inputs/hex-color-input";

/**
 * ExtensionConfigForm - Auto-generates a form from an extension's prop schema.
 *
 * Reads the props definition from the extension manifest and renders
 * appropriate input controls for each prop type.
 *
 * @param {Object} props
 * @param {Object} props.propsSchema - Extension manifest props definition
 * @param {Object} props.values - Current prop values
 * @param {Function} props.onChange - Called with (propName, value) on change
 */
const ExtensionConfigForm = ({ propsSchema = {}, values = {}, onChange }) => {
  const handleChange = (propName, value) => {
    onChange(propName, value);
  };

  const renderField = (propName, schema) => {
    const value = values[propName] ?? schema.default ?? "";

    switch (schema.type) {
      case "string":
        return (
          <Input
            className="form-control"
            id={propName}
            value={value}
            onChange={(ev) => handleChange(propName, ev.target.value)}
          />
        );

      case "number":
        return (
          <Input
            className="form-control"
            id={propName}
            type="number"
            value={value}
            onChange={(ev) => handleChange(propName, Number(ev.target.value))}
          />
        );

      case "color":
        return (
          <HexColorInput
            className="form-control"
            id={propName}
            value={value}
            onChange={(ev) => handleChange(propName, ev.target.value)}
          />
        );

      case "enum":
        return (
          <Dropdown
            id={propName}
            value={value}
            onChange={(ev) => handleChange(propName, ev.target.value)}
            options={(schema.options || []).map((opt) => ({
              label: opt,
              value: opt
            }))}
            isClearable
          />
        );

      case "json":
        return (
          <textarea
            className="form-control"
            id={propName}
            rows={4}
            value={
              typeof value === "string"
                ? value
                : JSON.stringify(value, null, "  ")
            }
            onChange={(ev) => {
              try {
                handleChange(propName, JSON.parse(ev.target.value));
              } catch (e) {
                // Allow invalid JSON while typing
                handleChange(propName, ev.target.value);
              }
            }}
          />
        );

      default:
        return (
          <Input
            className="form-control"
            id={propName}
            value={value}
            onChange={(ev) => handleChange(propName, ev.target.value)}
          />
        );
    }
  };

  return (
    <div className="extension-config-form">
      {Object.entries(propsSchema).map(([propName, schema]) => (
        <div
          key={propName}
          className="form-group"
          style={{ marginBottom: "10px" }}
        >
          <label style={{ fontSize: "12px", fontWeight: "bold" }}>
            {schema.label || propName}
            {schema.required && " *"}
          </label>
          {schema.description && (
            <span
              style={{ marginLeft: "5px", fontSize: "11px", color: "#999" }}
              title={schema.description}
            >
              <i className="fa fa-info-circle" />
            </span>
          )}
          {renderField(propName, schema)}
        </div>
      ))}
    </div>
  );
};

export default ExtensionConfigForm;
