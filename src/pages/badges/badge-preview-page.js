import React, { Suspense, useState, useEffect } from "react";
import { parseInstalledExtensions } from "../../actions/badge-extension-actions";

const BadgePreview = React.lazy(() => import("badgeRenderer/BadgePreview"));

const PREVIEW_CHANNEL = "badge-preview";

const BadgePreviewPage = () => {
  const [marketingSettings, setMarketingSettings] = useState([]);
  const [badgeSettings, setBadgeSettings] = useState({});
  const [badgeTypeId, setBadgeTypeId] = useState(0);

  useEffect(() => {
    const channel = new BroadcastChannel(PREVIEW_CHANNEL);

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "SETTINGS_UPDATE") {
        if (payload.marketingSettings)
          setMarketingSettings(payload.marketingSettings);
        if (payload.badgeSettings) setBadgeSettings(payload.badgeSettings);
        if (payload.badgeTypeId != null) setBadgeTypeId(payload.badgeTypeId);
      }
    };

    // Request initial state from the settings page
    channel.postMessage({ type: "REQUEST_STATE" });

    return () => channel.close();
  }, []);

  const mockBadgeData = {
    firstName: "Jane",
    lastName: "Smith",
    company: "Acme Corporation",
    features: [],
    extraQuestions: {}
  };

  const installedExtensions = parseInstalledExtensions(badgeSettings);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        padding: "20px"
      }}
    >
      <h3 style={{ marginBottom: "20px", color: "#333" }}>Badge Preview</h3>
      <Suspense fallback={<div>Loading preview...</div>}>
        <BadgePreview
          badgeData={mockBadgeData}
          marketingSettings={marketingSettings}
          badgeTypeId={badgeTypeId}
          viewType="Card"
          installedExtensions={installedExtensions}
        />
      </Suspense>
      <p style={{ marginTop: "20px", color: "#999", fontSize: "12px" }}>
        This preview updates in real time as you change settings.
      </p>
    </div>
  );
};

export { PREVIEW_CHANNEL };
export default BadgePreviewPage;
