import React, { Suspense } from "react";
import { parseInstalledExtensions } from "../../actions/badge-extension-actions";

const BadgePreview = React.lazy(() => import("badgeRenderer/BadgePreview"));

class BadgePreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div
          style={{
            padding: "20px",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            textAlign: "center",
            color: "#999"
          }}
        >
          <p>Badge preview unavailable.</p>
          <p style={{ fontSize: "12px" }}>
            Badge Print App may be unreachable. Settings can still be configured
            without preview.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const BadgePreviewPanel = ({
  marketingSettings,
  badgeSettings,
  badgeTypeId
}) => {
  const mockBadgeData = {
    firstName: "Jane",
    lastName: "Smith",
    company: "Acme Corporation",
    features: [],
    extraQuestions: {}
  };

  const installedExtensions = parseInstalledExtensions(badgeSettings || {});

  return (
    <div
      style={{
        position: "sticky",
        top: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "#f9f9f9"
      }}
    >
      <h4 style={{ marginTop: 0 }}>Badge Preview</h4>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          transform: "scale(0.7)",
          transformOrigin: "top center"
        }}
      >
        <BadgePreviewErrorBoundary>
          <Suspense fallback={<div>Loading preview...</div>}>
            <BadgePreview
              badgeData={mockBadgeData}
              marketingSettings={marketingSettings}
              badgeTypeId={badgeTypeId || 0}
              viewType="Card"
              installedExtensions={installedExtensions}
            />
          </Suspense>
        </BadgePreviewErrorBoundary>
      </div>
    </div>
  );
};

export { BadgePreviewErrorBoundary };
export default BadgePreviewPanel;
