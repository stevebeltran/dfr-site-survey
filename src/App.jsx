import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";

const createLocation = (index) => ({
  id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  label: `Location #${index}`,
  siteName: "",
  siteAddress: "",
  height: "",
  roofType: "",
  roofSlope: "",
  roofAccess: "",
  hazards: "",
  ppe: "OSHA Standard",
  edgeProtection: "",
  considerations: "",
  airspace: "",
  nearestAirfield: "",
  stationLatLong: "",
  stationGroundRoof: "Roof",
  physicalMount: "No",
  raisedPlatform: "Yes",
  emergencyLandingZone: "Yes",
  stationPower: "To be provided by customer",
  stationInternet: "To be provided by customer",
  rfLatLong: "",
  rfType: "Non penetrating",
  unistrut: "DNA",
  poleHeight: "",
  rfPower: "To be provided by customer",
  rfInternet: "To be provided by customer",
  otherRf: "",
  permitting: "To be provided by customer",
  towerClimber: "No",
  craneRequired: "Yes",
  craneStaging: "",
  notes: "",
  photos: [],
});

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #dbe3ea",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  fontSize: 14,
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#0f172a",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "white",
  color: "#0f172a",
};

const BRAND = {
  logoUrl: "/brinc-logo.png",
  accent: "#00D2FF",
  bg: "#000000",
  panel: "#111111",
  border: "#333333",
  text: "#ffffff",
  muted: "#aaaaaa",
};

function Field({ label, value, onChange, textarea = false, placeholder = "" }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#334155" }}>{label}</div>
      {textarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} style={textareaStyle} />
      ) : (
        <input value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
      )}
    </label>
  );
}

function ReportHeader({ survey, reportMode }) {
  return (
    <div
      style={{
        background: BRAND.bg,
        color: BRAND.text,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${BRAND.border}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          height: 6,
          background: `linear-gradient(90deg, ${BRAND.accent} 0%, #39FF14 100%)`,
        }}
      />
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: BRAND.panel,
                border: `1px solid ${BRAND.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={BRAND.logoUrl}
                alt="BRINC logo"
                style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <div style={{ color: BRAND.accent, fontSize: 12, letterSpacing: 1.6, fontWeight: 800 }}>BRINC DFR</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>Site Survey Report</div>
              <div style={{ color: BRAND.muted, marginTop: 4 }}>
                {reportMode === "internal" ? "Internal deployment planning version" : "Customer-facing site survey version"}
              </div>
            </div>
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={{ color: BRAND.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Agency</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{survey.agency || "-"}</div>
            <div style={{ marginTop: 10, color: BRAND.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Survey Date</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{survey.surveyDate || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSection({ title, rows }) {
  return (
    <div style={{ ...sectionStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 12, background: "#f8fafc", fontWeight: 700, borderBottom: "1px solid #e2e8f0" }}>
        {title}
      </div>
      <div>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(160px, 220px) 1fr",
              gap: 12,
              padding: 12,
              borderBottom: "1px solid #eef2f7",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{label}</div>
            <div style={{ fontSize: 14, color: "#0f172a", whiteSpace: "pre-wrap" }}>{value || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const fileInputRefs = useRef({});
  const STORAGE_KEY = "dfr-site-survey-autosave-v1";
  const [tab, setTab] = useState("form");
  const [reportMode, setReportMode] = useState("internal");
  const [saveMessage, setSaveMessage] = useState("Not saved yet");
  const [cloudStatus, setCloudStatus] = useState("Cloud not connected");
  const [savedSurveys, setSavedSurveys] = useState([]);
  const [currentSurveyId, setCurrentSurveyId] = useState(null);
  const [survey, setSurvey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error("Failed to load saved survey", error);
    }

    return {
    agency: "",
    surveyDate: "",
    agencyAddress: "",
    pointOfContact: "",
    rtcc: "",
    informationTechnology: "",
    facilitiesEngineer: "",
    radioShopEngineer: "",
    craneContractor: "",
    towerClimberContractor: "",
    brincProjectManager: "Steven Beltran",
    installationWeekOf: "",
    followUpRequirements: "",
    actionItems: "",
    liveOpsLocation: "",
    powerBackup: "",
    dedicatedPilots: "",
    cadSystem: "",
    alprSystem: "",
    radioSystem: "",
    rtcSystem: "",
    dems: "",
    preferredCellularProvider: "",
    gunshotDetection: "",
    live911: "",
    referenceLinks: "",
    version: "V1.0",
      locations: [createLocation(1)],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
      setSaveMessage(`Saved locally at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error("Failed to save survey", error);
      setSaveMessage("Local save failed");
    }
  }, [survey]);

  const defaultSurvey = () => ({
    agency: "",
    surveyDate: "",
    agencyAddress: "",
    pointOfContact: "",
    rtcc: "",
    informationTechnology: "",
    facilitiesEngineer: "",
    radioShopEngineer: "",
    craneContractor: "",
    towerClimberContractor: "",
    brincProjectManager: "Steven Beltran",
    installationWeekOf: "",
    followUpRequirements: "",
    actionItems: "",
    liveOpsLocation: "",
    powerBackup: "",
    dedicatedPilots: "",
    cadSystem: "",
    alprSystem: "",
    radioSystem: "",
    rtcSystem: "",
    dems: "",
    preferredCellularProvider: "",
    gunshotDetection: "",
    live911: "",
    referenceLinks: "",
    version: "V1.0",
    locations: [createLocation(1)],
  });

  const loadSurveyIntoForm = (surveyRecord) => {
    setSurvey(surveyRecord.data);
    setCurrentSurveyId(surveyRecord.id);
    setSaveMessage(`Loaded ${surveyRecord.name}`);
  };

  const fetchSavedSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("site_surveys")
        .select("id, name, agency, survey_date, updated_at, data")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setSavedSurveys(data || []);
      setCloudStatus("Cloud connected");
    } catch (error) {
      console.error("Failed to fetch surveys", error);
      setCloudStatus("Cloud fetch failed");
    }
  };

  useEffect(() => {
    fetchSavedSurveys();
  }, []);

  const saveSurveyToCloud = async () => {
    try {
      setCloudStatus("Saving to cloud...");
      const payload = {
        name: `${survey.agency || "Untitled Survey"} - ${survey.surveyDate || new Date().toLocaleDateString()}`,
        agency: survey.agency || "",
        survey_date: survey.surveyDate || null,
        data: survey,
      };

      if (currentSurveyId) {
        const { error } = await supabase.from("site_surveys").update(payload).eq("id", currentSurveyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("site_surveys").insert(payload).select().single();
        if (error) throw error;
        setCurrentSurveyId(data.id);
      }

      await fetchSavedSurveys();
      setCloudStatus(`Saved to cloud at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error("Failed to save survey", error);
      setCloudStatus("Cloud save failed");
      window.alert("Cloud save failed. Check your Supabase setup.");
    }
  };

  const createNewSurvey = () => {
    setSurvey(defaultSurvey());
    setCurrentSurveyId(null);
    setSaveMessage("New survey started");
  };

  const deleteCloudSurvey = async (id) => {
    const confirmed = window.confirm("Delete this survey from cloud storage?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("site_surveys").delete().eq("id", id);
      if (error) throw error;
      if (currentSurveyId === id) {
        setCurrentSurveyId(null);
      }
      await fetchSavedSurveys();
      setCloudStatus("Cloud survey deleted");
    } catch (error) {
      console.error("Failed to delete survey", error);
      setCloudStatus("Cloud delete failed");
    }
  };

  const clearSavedSurvey = () => {
    const confirmed = window.confirm("Clear the saved survey from this device?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setSurvey(defaultSurvey());
    setCurrentSurveyId(null);
    setSaveMessage("Saved survey cleared");
  };

  const updateSurvey = (key, value) => {
    setSurvey((current) => ({ ...current, [key]: value }));
  };

  const updateLocation = (id, key, value) => {
    setSurvey((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === id ? { ...location, [key]: value } : location
      ),
    }));
  };

  const addLocation = () => {
    setSurvey((current) => ({
      ...current,
      locations: [...current.locations, createLocation(current.locations.length + 1)],
    }));
  };

  const removeLocation = (id) => {
    setSurvey((current) => {
      const nextLocations = current.locations
        .filter((location) => location.id !== id)
        .map((location, index) => ({ ...location, label: `Location #${index + 1}` }));

      return {
        ...current,
        locations: nextLocations.length ? nextLocations : [createLocation(1)],
      };
    });
  };

  const addPhoto = (locationId) => {
    setSurvey((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === locationId
          ? {
              ...location,
              photos: [
                ...location.photos,
                { id: `${Date.now()}-${Math.random()}`, url: "", caption: "" },
              ],
            }
          : location
      ),
    }));
  };

  const updatePhoto = (locationId, photoId, key, value) => {
    setSurvey((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === locationId
          ? {
              ...location,
              photos: location.photos.map((photo) =>
                photo.id === photoId ? { ...photo, [key]: value } : photo
              ),
            }
          : location
      ),
    }));
  };

  const removePhoto = (locationId, photoId) => {
    setSurvey((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === locationId
          ? { ...location, photos: location.photos.filter((photo) => photo.id !== photoId) }
          : location
      ),
    }));
  };

  const fillGpsForLocation = (locationId, target) => {
    if (!navigator.geolocation) {
      window.alert("Geolocation is not supported on this device/browser.");
      return;
    }

    setSaveMessage("Getting GPS location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        updateLocation(locationId, target, coords);
        setSaveMessage(`GPS captured at ${new Date().toLocaleTimeString()}`);
      },
      () => {
        window.alert("Unable to get GPS location. Make sure location permissions are enabled.");
        setSaveMessage("GPS capture failed");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const triggerCameraUpload = (locationId) => {
    const input = fileInputRefs.current[locationId];
    if (input) input.click();
  };

  const handleCameraFiles = (locationId, files) => {
    if (!files || !files.length) return;

    const newPhotos = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      caption: file.name,
      fileName: file.name,
    }));

    setSurvey((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === locationId ? { ...location, photos: [...location.photos, ...newPhotos] } : location
      ),
    }));

    setSaveMessage(`Added ${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""}`);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(survey, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(survey.agency || "dfr-site-survey").replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generalRows = [
    ["Agency Address", survey.agencyAddress],
    ["Point of Contact", survey.pointOfContact],
    ["RTCC / RTIC", survey.rtcc],
    ["Information Technology", survey.informationTechnology],
    ["Facilities Engineer", survey.facilitiesEngineer],
    ["Radio Shop Engineer", survey.radioShopEngineer],
    ["Crane Contractor", survey.craneContractor],
    ["Tower Climber Contractor", survey.towerClimberContractor],
    ["BRINC Project Manager", survey.brincProjectManager],
    ["Installation Week Of", survey.installationWeekOf],
    ["Follow Up Requirements", survey.followUpRequirements],
    ["Action Items", survey.actionItems],
  ];

  const liveOpsRows = [
    ["Live OPS Location", survey.liveOpsLocation],
    ["Power Backup Available", survey.powerBackup],
    ["Dedicated Program with 107 Pilots", survey.dedicatedPilots],
    ["CAD System", survey.cadSystem],
    ["ALPR System", survey.alprSystem],
    ["Radio System", survey.radioSystem],
    ["RTC System", survey.rtcSystem],
    ["DEMS / Evidence Mgmt", survey.dems],
    ["Preferred Cellular Provider", survey.preferredCellularProvider],
    ["Gunshot Detection System", survey.gunshotDetection],
    ["Live 911", survey.live911],
  ];

  const stats = useMemo(() => {
    return {
      siteCount: survey.locations.length,
      photoCount: survey.locations.reduce((count, location) => count + location.photos.length, 0),
    };
  }, [survey.locations]);

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <style>{`
        @media print {
          body { background: white !important; }
          button, input, textarea { display: none !important; }
          img { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .print-wrap { max-width: 100% !important; }
          .print-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        <div style={{ ...sectionStyle, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: 0.5 }}>BRINC DFR</div>
              <h1 style={{ margin: "6px 0 8px", fontSize: 30 }}>Site Survey Report Builder</h1>
              <p style={{ margin: 0, color: "#475569", maxWidth: 700 }}>
                Mobile-friendly field form for collecting site survey details and generating a report preview for customer and internal BRINC use.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setTab("form")} style={tab === "form" ? buttonStyle : secondaryButtonStyle}>Form</button>
              <button onClick={() => setTab("preview")} style={tab === "preview" ? buttonStyle : secondaryButtonStyle}>Preview</button>
              <button onClick={() => setReportMode(reportMode === "internal" ? "customer" : "internal")} style={secondaryButtonStyle}>{reportMode === "internal" ? "Internal View" : "Customer View"}</button>
              <button onClick={exportJson} style={secondaryButtonStyle}>Export JSON</button>
              <button onClick={saveSurveyToCloud} style={buttonStyle}>Save to Cloud</button>
              <button onClick={createNewSurvey} style={secondaryButtonStyle}>New Survey</button>
              <button onClick={clearSavedSurvey} style={secondaryButtonStyle}>Clear Saved</button>
              <button onClick={() => window.print()} style={buttonStyle}>Print / Save PDF</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <div style={{ background: "#f0fdf4", color: "#166534", padding: "8px 12px", borderRadius: 999 }}>{saveMessage}</div>
            <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "8px 12px", borderRadius: 999 }}>{cloudStatus}</div>
            <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "8px 12px", borderRadius: 999 }}>Sites: {stats.siteCount}</div>
            <div style={{ background: "#ecfeff", color: "#0f766e", padding: "8px 12px", borderRadius: 999 }}>Photos: {stats.photoCount}</div>
            <div style={{ background: reportMode === "internal" ? "#ede9fe" : "#fff7ed", color: reportMode === "internal" ? "#6d28d9" : "#c2410c", padding: "8px 12px", borderRadius: 999 }}>{reportMode === "internal" ? "Internal Report" : "Customer Report"}</div>
            <div style={{ background: "#f8fafc", color: "#334155", padding: "8px 12px", borderRadius: 999 }}>Version: {survey.version}</div>
          </div>
        </div>

        {tab === "form" ? (
          <>
            <div style={sectionStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>Cloud Surveys</h2>
                <div style={{ color: "#64748b", fontSize: 14 }}>{currentSurveyId ? `Editing survey ID: ${currentSurveyId}` : "New unsaved survey"}</div>
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {!savedSurveys.length && <div style={{ color: "#64748b" }}>No cloud surveys loaded yet.</div>}
                {savedSurveys.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#fff" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{item.agency || "No agency"} • {item.updated_at ? new Date(item.updated_at).toLocaleString() : "No date"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => loadSurveyIntoForm(item)} style={secondaryButtonStyle}>Load</button>
                      <button onClick={() => deleteCloudSurvey(item.id)} style={secondaryButtonStyle}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          
            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>General Project Info</h2>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                <Field label="Agency" value={survey.agency} onChange={(e) => updateSurvey("agency", e.target.value)} />
                <Field label="Survey Date" value={survey.surveyDate} onChange={(e) => updateSurvey("surveyDate", e.target.value)} placeholder="3-2-26" />
                <Field label="Agency Address" value={survey.agencyAddress} onChange={(e) => updateSurvey("agencyAddress", e.target.value)} />
                <Field label="Point of Contact" value={survey.pointOfContact} onChange={(e) => updateSurvey("pointOfContact", e.target.value)} textarea />
                <Field label="RTCC / RTIC" value={survey.rtcc} onChange={(e) => updateSurvey("rtcc", e.target.value)} textarea />
                <Field label="Information Technology" value={survey.informationTechnology} onChange={(e) => updateSurvey("informationTechnology", e.target.value)} textarea />
                <Field label="Facilities Engineer" value={survey.facilitiesEngineer} onChange={(e) => updateSurvey("facilitiesEngineer", e.target.value)} textarea />
                <Field label="Radio Shop Engineer" value={survey.radioShopEngineer} onChange={(e) => updateSurvey("radioShopEngineer", e.target.value)} textarea />
                {reportMode === "internal" && <Field label="Crane Contractor" value={survey.craneContractor} onChange={(e) => updateSurvey("craneContractor", e.target.value)} />}
                {reportMode === "internal" && <Field label="Tower Climber Contractor" value={survey.towerClimberContractor} onChange={(e) => updateSurvey("towerClimberContractor", e.target.value)} />}
                {reportMode === "internal" && <Field label="BRINC Project Manager" value={survey.brincProjectManager} onChange={(e) => updateSurvey("brincProjectManager", e.target.value)} />}
                <Field label="Installation Week Of" value={survey.installationWeekOf} onChange={(e) => updateSurvey("installationWeekOf", e.target.value)} />
                <Field label="Follow Up Requirements" value={survey.followUpRequirements} onChange={(e) => updateSurvey("followUpRequirements", e.target.value)} textarea />
                {reportMode === "internal" && <Field label="Action Items" value={survey.actionItems} onChange={(e) => updateSurvey("actionItems", e.target.value)} textarea />}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>Survey Locations</h2>
                <button onClick={addLocation} style={buttonStyle}>Add Site</button>
              </div>

              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                {survey.locations.map((location) => (
                  <div key={location.id} style={{ border: "1px solid #dbe3ea", borderRadius: 16, padding: 16, background: "#fcfdff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{location.label}</div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>{location.siteAddress || location.siteName || "New site"}</div>
                      </div>
                      <button onClick={() => removeLocation(location.id)} style={secondaryButtonStyle}>Remove</button>
                    </div>

                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 16 }}>
                      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => fillGpsForLocation(location.id, "stationLatLong")} style={secondaryButtonStyle}>Use GPS for Station</button>
                        <button onClick={() => fillGpsForLocation(location.id, "rfLatLong")} style={secondaryButtonStyle}>Use GPS for RF</button>
                        <button onClick={() => triggerCameraUpload(location.id)} style={secondaryButtonStyle}>Take / Add Photos</button>
                        <input
                          ref={(element) => {
                            fileInputRefs.current[location.id] = element;
                          }}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          style={{ display: "none" }}
                          onChange={(event) => handleCameraFiles(location.id, event.target.files)}
                        />
                      </div>
                      <Field label="Site Name" value={location.siteName} onChange={(e) => updateLocation(location.id, "siteName", e.target.value)} />
                      <Field label="Site Address" value={location.siteAddress} onChange={(e) => updateLocation(location.id, "siteAddress", e.target.value)} />
                      <Field label="Height of Building" value={location.height} onChange={(e) => updateLocation(location.id, "height", e.target.value)} />
                      <Field label="Roof Type" value={location.roofType} onChange={(e) => updateLocation(location.id, "roofType", e.target.value)} />
                      <Field label="Roof Slope" value={location.roofSlope} onChange={(e) => updateLocation(location.id, "roofSlope", e.target.value)} />
                      <Field label="Roof Access Type" value={location.roofAccess} onChange={(e) => updateLocation(location.id, "roofAccess", e.target.value)} />
                      <Field label="Hazards / Safety Concerns" value={location.hazards} onChange={(e) => updateLocation(location.id, "hazards", e.target.value)} textarea />
                      <Field label="PPE Requirements" value={location.ppe} onChange={(e) => updateLocation(location.id, "ppe", e.target.value)} />
                      <Field label="Edge Protection / Fall Hazards" value={location.edgeProtection} onChange={(e) => updateLocation(location.id, "edgeProtection", e.target.value)} textarea />
                      <Field label="Considerations" value={location.considerations} onChange={(e) => updateLocation(location.id, "considerations", e.target.value)} textarea />
                      <Field label="Airspace" value={location.airspace} onChange={(e) => updateLocation(location.id, "airspace", e.target.value)} />
                      <Field label="Nearest Airfield" value={location.nearestAirfield} onChange={(e) => updateLocation(location.id, "nearestAirfield", e.target.value)} />
                      <Field label="Station Lat/Long" value={location.stationLatLong} onChange={(e) => updateLocation(location.id, "stationLatLong", e.target.value)} />
                      <Field label="Ground / Roof" value={location.stationGroundRoof} onChange={(e) => updateLocation(location.id, "stationGroundRoof", e.target.value)} />
                      <Field label="Physical Mount Required" value={location.physicalMount} onChange={(e) => updateLocation(location.id, "physicalMount", e.target.value)} />
                      <Field label="Raised Platform Required" value={location.raisedPlatform} onChange={(e) => updateLocation(location.id, "raisedPlatform", e.target.value)} />
                      <Field label="Emergency Landing Zone" value={location.emergencyLandingZone} onChange={(e) => updateLocation(location.id, "emergencyLandingZone", e.target.value)} />
                      <Field label="120V / 20A Power" value={location.stationPower} onChange={(e) => updateLocation(location.id, "stationPower", e.target.value)} textarea />
                      <Field label="Internet / Ethernet" value={location.stationInternet} onChange={(e) => updateLocation(location.id, "stationInternet", e.target.value)} textarea />
                      <Field label="RF Lat/Long" value={location.rfLatLong} onChange={(e) => updateLocation(location.id, "rfLatLong", e.target.value)} />
                      <Field label="RF Type" value={location.rfType} onChange={(e) => updateLocation(location.id, "rfType", e.target.value)} />
                      <Field label="UniStrut Provided" value={location.unistrut} onChange={(e) => updateLocation(location.id, "unistrut", e.target.value)} />
                      <Field label="Pole Height Required" value={location.poleHeight} onChange={(e) => updateLocation(location.id, "poleHeight", e.target.value)} />
                      <Field label="120V / 15A Power" value={location.rfPower} onChange={(e) => updateLocation(location.id, "rfPower", e.target.value)} textarea />
                      <Field label="RF Internet / Ethernet" value={location.rfInternet} onChange={(e) => updateLocation(location.id, "rfInternet", e.target.value)} textarea />
                      <Field label="Other RF at Same Location" value={location.otherRf} onChange={(e) => updateLocation(location.id, "otherRf", e.target.value)} />
                      {reportMode === "internal" && <Field label="Building Permitting Required" value={location.permitting} onChange={(e) => updateLocation(location.id, "permitting", e.target.value)} textarea />}
                      {reportMode === "internal" && <Field label="Tower Climber Required" value={location.towerClimber} onChange={(e) => updateLocation(location.id, "towerClimber", e.target.value)} />}
                      {reportMode === "internal" && <Field label="Crane Required" value={location.craneRequired} onChange={(e) => updateLocation(location.id, "craneRequired", e.target.value)} />}
                      {reportMode === "internal" && <Field label="Crane Staging Area" value={location.craneStaging} onChange={(e) => updateLocation(location.id, "craneStaging", e.target.value)} textarea />}
                      {reportMode === "internal" && <Field label="Location Notes" value={location.notes} onChange={(e) => updateLocation(location.id, "notes", e.target.value)} textarea />}
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>Supporting Photos</div>
                        <button onClick={() => addPhoto(location.id)} style={secondaryButtonStyle}>Add Photo URL</button>
                      </div>

                      <div style={{ display: "grid", gap: 12 }}>
                        {location.photos.map((photo) => (
                          <div key={photo.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "white" }}>
                            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                              <Field label="Photo URL" value={photo.url} onChange={(e) => updatePhoto(location.id, photo.id, "url", e.target.value)} placeholder="https://..." />
                              <Field label="Caption" value={photo.caption} onChange={(e) => updatePhoto(location.id, photo.id, "caption", e.target.value)} placeholder="Roof hatch facing east" />
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <button onClick={() => removePhoto(location.id, photo.id)} style={secondaryButtonStyle}>Delete Photo</button>
                            </div>
                          </div>
                        ))}
                        {!location.photos.length && (
                          <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: 16, color: "#64748b", background: "white" }}>
                            No photos yet. Later this can be connected to phone camera upload and cloud storage.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>LiveOps / Program Summary</h2>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                <Field label="Live OPS Location" value={survey.liveOpsLocation} onChange={(e) => updateSurvey("liveOpsLocation", e.target.value)} />
                <Field label="Power Backup Available" value={survey.powerBackup} onChange={(e) => updateSurvey("powerBackup", e.target.value)} />
                <Field label="Dedicated Program with 107 Pilots" value={survey.dedicatedPilots} onChange={(e) => updateSurvey("dedicatedPilots", e.target.value)} />
                <Field label="CAD System" value={survey.cadSystem} onChange={(e) => updateSurvey("cadSystem", e.target.value)} />
                <Field label="ALPR System" value={survey.alprSystem} onChange={(e) => updateSurvey("alprSystem", e.target.value)} />
                <Field label="Radio System" value={survey.radioSystem} onChange={(e) => updateSurvey("radioSystem", e.target.value)} />
                <Field label="RTC System" value={survey.rtcSystem} onChange={(e) => updateSurvey("rtcSystem", e.target.value)} />
                <Field label="DEMS / Evidence Mgmt" value={survey.dems} onChange={(e) => updateSurvey("dems", e.target.value)} />
                <Field label="Preferred Cellular Provider" value={survey.preferredCellularProvider} onChange={(e) => updateSurvey("preferredCellularProvider", e.target.value)} />
                <Field label="Gunshot Detection System" value={survey.gunshotDetection} onChange={(e) => updateSurvey("gunshotDetection", e.target.value)} />
                <Field label="Live 911" value={survey.live911} onChange={(e) => updateSurvey("live911", e.target.value)} />
                <Field label="Version" value={survey.version} onChange={(e) => updateSurvey("version", e.target.value)} />
                <Field label="Reference Links" value={survey.referenceLinks} onChange={(e) => updateSurvey("referenceLinks", e.target.value)} textarea />
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <ReportHeader survey={survey} reportMode={reportMode} />

            <div className="print-hide" style={{ ...sectionStyle, background: reportMode === "internal" ? "#f5f3ff" : "#fffbeb", borderColor: reportMode === "internal" ? "#c4b5fd" : "#fcd34d" }}>
              {reportMode === "internal"
                ? "Internal preview: includes BRINC-only planning fields like action items, contractors, crane details, and notes."
                : "Customer preview: hides BRINC-only planning details and shows the cleaner external report version."}
            </div>

            <div className="print-card" style={{ ...sectionStyle, borderLeft: `6px solid ${BRAND.accent}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Report Type</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{reportMode === "internal" ? "Internal" : "Customer"}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Version</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{survey.version || "-"}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Prepared For</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{survey.agency || "-"}</div>
                </div>
              </div>
            </div>

            <TableSection title="General" rows={generalRows.filter(([label]) => reportMode === "internal" || !["Crane Contractor", "Tower Climber Contractor", "BRINC Project Manager", "Action Items"].includes(label))} />

            {survey.locations.map((location) => (
              <div key={location.id} className="print-card" style={{ display: "grid", gap: 12 }}>
                <div style={sectionStyle}>
                  <h2 style={{ marginTop: 0, marginBottom: 6 }}>{location.label}</h2>
                  <div style={{ color: "#475569" }}>{location.siteAddress || location.siteName || "Unnamed Site"}</div>
                </div>

                <TableSection
                  title="Site Details"
                  rows={[
                    ["Site Name", location.siteName],
                    ["Site Address", location.siteAddress],
                    ["Height of Building", location.height],
                    ["Roof Type", location.roofType],
                    ["Roof Slope", location.roofSlope],
                    ["Roof Access Type", location.roofAccess],
                    ["Hazards / Safety Concerns", location.hazards],
                    ["PPE Requirements", location.ppe],
                    ["Edge Protection / Fall Hazards", location.edgeProtection],
                  ]}
                />

                <TableSection
                  title="Other"
                  rows={[
                    ["Considerations", location.considerations],
                    ["Airspace", location.airspace],
                    ["Nearest Airfield", location.nearestAirfield],
                  ]}
                />

                <TableSection
                  title="Station"
                  rows={[
                    ["Station Lat/Long", location.stationLatLong],
                    ["Ground / Roof", location.stationGroundRoof],
                    ["Physical Mount Required", location.physicalMount],
                    ["Raised Platform Required", location.raisedPlatform],
                    ["Emergency Landing Zone", location.emergencyLandingZone],
                    ["120V / 20A Power", location.stationPower],
                    ["Internet / Ethernet", location.stationInternet],
                  ]}
                />

                <TableSection
                  title="RF Pole"
                  rows={[
                    ["RF Lat/Long", location.rfLatLong],
                    ["Type", location.rfType],
                    ["UniStrut Provided", location.unistrut],
                    ["Pole Height Required", location.poleHeight],
                    ["120V / 15A Power", location.rfPower],
                    ["Internet / Ethernet", location.rfInternet],
                    ["Other RF at Same Location", location.otherRf],
                  ]}
                />

                {reportMode === "internal" && <TableSection
                  title="Permitting, Climbers & Crane"
                  rows={[
                    ["Building Permitting Required", location.permitting],
                    ["Tower Climber Required", location.towerClimber],
                    ["Crane Required", location.craneRequired],
                    ["Crane Staging Area", location.craneStaging],
                  ]}
                />}

                {reportMode === "internal" && !!location.notes && (
                  <div style={sectionStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Location Notes</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{location.notes}</div>
                  </div>
                )}

                {!!location.photos.length && (
                  <div style={sectionStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Supporting Photos</div>
                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                      {location.photos.map((photo) => (
                        <div key={photo.id} style={{ border: "1px solid #dbe3ea", borderRadius: 12, overflow: "hidden", background: "white" }}>
                          <div style={{ background: "#f8fafc", aspectRatio: "4 / 3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {photo.url ? (
                              <img
                                src={photo.url}
                                alt={photo.caption || "Site photo"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ color: "#94a3b8" }}>Photo Placeholder</div>
                            )}
                          </div>
                          <div style={{ padding: 10, fontSize: 14 }}>{photo.caption || "Uncaptioned photo"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <TableSection title="LiveOps Flight Center" rows={liveOpsRows} />

            <div className="print-card" style={{ ...sectionStyle, background: "#0f172a", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>BRINC Drones</div>
                  <div style={{ color: "#93c5fd", marginTop: 4 }}>First responder drone site survey</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#93c5fd", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Document Version</div>
                  <div style={{ fontWeight: 700 }}>{survey.version || "-"}</div>
                </div>
              </div>
            </div>

            <div className="print-card" style={sectionStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Reference Links</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{survey.referenceLinks || "-"}</div>
              <div style={{ marginTop: 12, color: "#64748b", fontSize: 13 }}>Version {survey.version || "-"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
