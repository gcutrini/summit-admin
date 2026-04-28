/**
 * Badge Settings Schema
 *
 * Defines all badge template settings as a schema for schema-driven form rendering.
 * Keys match BADGE_TEMPLATE_* marketing settings consumed by badge-print-app.
 * Source of truth: badge-print-app/src/utils/marketingSettings.js
 */

const ALIGN_OPTIONS = [
  { label: "Left", value: "LEFT" },
  { label: "Right", value: "RIGHT" },
  { label: "Justify", value: "JUSTIFY" },
  { label: "Center", value: "CENTER" }
];

const FONT_CASING_OPTIONS = [
  { label: "Lowercase", value: "LOWERCASE" },
  { label: "Uppercase", value: "UPPERCASE" }
];

const NAME_DISPLAY_MODE_OPTIONS = [
  { label: "Full Name", value: "FULL_NAME" },
  { label: "Stacked", value: "STACKED" },
  { label: "First Name Only", value: "FIRST_NAME_ONLY" },
  { label: "Last Name Only", value: "LAST_NAME_ONLY" }
];

const FEATURE_DISPLAY_MODE_OPTIONS = [
  { label: "Text", value: "TEXT" },
  { label: "Image", value: "IMAGE" }
];

/**
 * Template for per-text-field settings.
 * Used to generate fields for firstName, lastName, company, jobTitle.
 * @param {string} prefix - e.g. "FIRST_NAME", "LAST_NAME", "COMPANY", "TITLE"
 */
export const getTextFieldSchema = (prefix) => ({
  [`BADGE_TEMPLATE_${prefix}_PADDING`]: {
    type: "string",
    label: "Padding",
    help: "CSS padding value (e.g. 5px 10px)"
  },
  [`BADGE_TEMPLATE_${prefix}_TEXT_ALIGN`]: {
    type: "enum",
    label: "Text Align",
    options: ALIGN_OPTIONS
  },
  [`BADGE_TEMPLATE_${prefix}_FONT_CASING`]: {
    type: "enum",
    label: "Font Casing",
    options: FONT_CASING_OPTIONS
  },
  [`BADGE_TEMPLATE_${prefix}_FONT_SIZE_MIN`]: {
    type: "string",
    label: "Font Size Min",
    help: "Integer value (px)"
  },
  [`BADGE_TEMPLATE_${prefix}_FONT_SIZE_MAX`]: {
    type: "string",
    label: "Font Size Max",
    help: "Integer value (px)"
  },
  [`BADGE_TEMPLATE_${prefix}_SHRINK_AT_LINE`]: {
    type: "string",
    label: "Shrink At Line",
    help: "Number of lines before shrinking"
  },
  [`BADGE_TEMPLATE_${prefix}_FONT_FAMILY`]: {
    type: "string",
    label: "Font Family"
  },
  [`BADGE_TEMPLATE_${prefix}_COLOR`]: {
    type: "color",
    label: "Color"
  },
  [`BADGE_TEMPLATE_${prefix}_LINE_HEIGHT`]: {
    type: "string",
    label: "Line Height",
    help: "CSS line-height value"
  }
});

/**
 * Template for per-badge-feature settings.
 * @param {number} featureId
 */
export const getFeatureFieldSchema = (featureId) => ({
  [`BADGE_TEMPLATE_FEATURE_${featureId}_TOP`]: {
    type: "string",
    label: "Top",
    help: "CSS length (e.g. 10mm)"
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_LEFT`]: {
    type: "string",
    label: "Left",
    help: "CSS length (e.g. 10mm)"
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_DISPLAY_MODE`]: {
    type: "enum",
    label: "Display Type",
    options: FEATURE_DISPLAY_MODE_OPTIONS
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_DISPLAY`]: {
    type: "switch",
    label: "Display"
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_TEXT_COLOR`]: {
    type: "color",
    label: "Text Color",
    showWhen: {
      key: `BADGE_TEMPLATE_FEATURE_${featureId}_DISPLAY_MODE`,
      value: "TEXT"
    }
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_FONT_SIZE`]: {
    type: "string",
    label: "Font Size",
    showWhen: {
      key: `BADGE_TEMPLATE_FEATURE_${featureId}_DISPLAY_MODE`,
      value: "TEXT"
    }
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_IMAGE_WIDTH`]: {
    type: "string",
    label: "Image Width",
    help: "CSS length",
    showWhen: {
      key: `BADGE_TEMPLATE_FEATURE_${featureId}_DISPLAY_MODE`,
      value: "IMAGE"
    }
  },
  [`BADGE_TEMPLATE_FEATURE_${featureId}_IMAGE_HEIGHT`]: {
    type: "string",
    label: "Image Height",
    help: "CSS length",
    showWhen: {
      key: `BADGE_TEMPLATE_FEATURE_${featureId}_DISPLAY_MODE`,
      value: "IMAGE"
    }
  }
});

/**
 * Main badge settings schema - static sections.
 */
export const BADGE_SETTINGS_SECTIONS = [
  {
    id: "dimensions",
    title: "Dimensions & Background",
    collapsible: false,
    fields: {
      BADGE_TEMPLATE_WIDTH: {
        type: "string",
        label: "Width",
        help: "CSS length (e.g. 94mm)"
      },
      BADGE_TEMPLATE_HEIGHT: {
        type: "string",
        label: "Height",
        help: "CSS length (e.g. 140mm)"
      },
      BADGE_TEMPLATE_MARGIN: {
        type: "string",
        label: "Margin",
        help: "CSS margin value"
      },
      BADGE_TEMPLATE_BACKGROUND_COLOR: {
        type: "color",
        label: "Background Color"
      },
      BADGE_TEMPLATE_FONT_FAMILY: { type: "string", label: "Font Family" },
      BADGE_TEMPLATE_FONT_FACES_INLINE_DEFINITION: {
        type: "textarea",
        label: "Font Faces (CSS @font-face)"
      }
    }
  },
  {
    id: "backgrounds",
    title: "Background Images",
    collapsible: true,
    fields: {
      BADGE_TEMPLATE_BACKGROUND_IMG: {
        type: "file",
        label: "Front Background Image"
      },
      BADGE_TEMPLATE_BACK_BACKGROUND_IMG: {
        type: "file",
        label: "Back Background Image"
      }
    }
  },
  {
    id: "textFieldsGlobal",
    title: "Text Fields (Global)",
    collapsible: false,
    fields: {
      BADGE_TEMPLATE_TEXT_FIELDS_FONT_FAMILY: {
        type: "string",
        label: "Font Family"
      },
      BADGE_TEMPLATE_TEXT_FIELDS_COLOR: { type: "color", label: "Color" },
      BADGE_TEMPLATE_TEXT_FIELDS_MARGIN: {
        type: "string",
        label: "Margin",
        help: "CSS margin value"
      },
      BADGE_TEMPLATE_NAME_DISPLAY_MODE: {
        type: "enum",
        label: "Name Display Mode",
        options: NAME_DISPLAY_MODE_OPTIONS
      },
      BADGE_TEMPLATE_TEXT_FIELDS_ALIGN: {
        type: "enum",
        label: "Alignment",
        options: ALIGN_OPTIONS
      },
      BADGE_TEMPLATE_TEXT_FIELDS_LINE_HEIGHT: {
        type: "string",
        label: "Line Height",
        help: "CSS line-height value"
      }
    }
  },
  {
    id: "firstName",
    title: "First Name",
    collapsible: true,
    textField: "firstName",
    fields: getTextFieldSchema("FIRST_NAME")
  },
  {
    id: "lastName",
    title: "Last Name",
    collapsible: true,
    textField: "lastName",
    fields: getTextFieldSchema("LAST_NAME")
  },
  {
    id: "company",
    title: "Company",
    collapsible: true,
    textField: "company",
    fields: getTextFieldSchema("COMPANY")
  },
  {
    id: "title",
    title: "Job Title",
    collapsible: true,
    textField: "jobTitle",
    fields: getTextFieldSchema("TITLE")
  },
  {
    id: "featuresGlobal",
    title: "Badge Features",
    collapsible: false,
    fields: {
      BADGE_TEMPLATE_FEATURES_MARGIN: {
        type: "string",
        label: "Margin",
        help: "CSS margin value"
      },
      BADGE_TEMPLATE_FEATURES_FONT_FAMILY: {
        type: "string",
        label: "Font Family"
      },
      BADGE_TEMPLATE_FEATURES_TEXT_COLOR: {
        type: "color",
        label: "Text Color"
      },
      BADGE_TEMPLATE_FEATURES_FONT_SIZE: {
        type: "string",
        label: "Font Size",
        help: "CSS length"
      }
    }
  },
  {
    id: "qrCode",
    title: "QR Code",
    collapsible: true,
    fields: {
      BADGE_TEMPLATE_QR_DISPLAY: { type: "switch", label: "Show QR Code" },
      BADGE_TEMPLATE_QR_SIZE: {
        type: "string",
        label: "Size",
        help: "Integer value (px)"
      },
      BADGE_TEMPLATE_QR_TOP: {
        type: "string",
        label: "Top",
        help: "CSS length"
      },
      BADGE_TEMPLATE_QR_LEFT: {
        type: "string",
        label: "Left",
        help: "CSS length"
      },
      BADGE_TEMPLATE_QR_COLOR: { type: "color", label: "Color" }
    }
  }
];

/**
 * Text field names and their prefixes for dynamic section generation.
 */
export const TEXT_FIELD_PREFIXES = {
  firstName: "FIRST_NAME",
  lastName: "LAST_NAME",
  company: "COMPANY",
  jobTitle: "TITLE"
};
