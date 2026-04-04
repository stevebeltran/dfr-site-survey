import { useMemo, useState } from "react";

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
  const [tab, setTab] = useState("form");
  const [survey, setSurvey] = useState({
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
              <button onClick={exportJson} style={secondaryButtonStyle}>Export JSON</button>
              <button onClick={() => window.print()} style={buttonStyle}>Print / Save PDF</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "8px 12px", borderRadius: 999 }}>Sites: {stats.siteCount}</div>
            <div style={{ background: "#ecfeff", color: "#0f766e", padding: "8px 12px", borderRadius: 999 }}>Photos: {stats.photoCount}</div>
            <div style={{ background: "#f8fafc", color: "#334155", padding: "8px 12px", borderRadius: 999 }}>Version: {survey.version}</div>
          </div>
        </div>

        {tab === "form" ? (
          <>
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
                <Field label="Crane Contractor" value={survey.craneContractor} onChange={(e) => updateSurvey("craneContractor", e.target.value)} />
                <Field label="Tower Climber Contractor" value={survey.towerClimberContractor} onChange={(e) => updateSurvey("towerClimberContractor", e.target.value)} />
                <Field label="BRINC Project Manager" value={survey.brincProjectManager} onChange={(e) => updateSurvey("brincProjectManager", e.target.value)} />
                <Field label="Installation Week Of" value={survey.installationWeekOf} onChange={(e) => updateSurvey("installationWeekOf", e.target.value)} />
                <Field label="Follow Up Requirements" value={survey.followUpRequirements} onChange={(e) => updateSurvey("followUpRequirements", e.target.value)} textarea />
                <Field label="Action Items" value={survey.actionItems} onChange={(e) => updateSurvey("actionItems", e.target.value)} textarea />
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
                      <Field label="Building Permitting Required" value={location.permitting} onChange={(e) => updateLocation(location.id, "permitting", e.target.value)} textarea />
                      <Field label="Tower Climber Required" value={location.towerClimber} onChange={(e) => updateLocation(location.id, "towerClimber", e.target.value)} />
                      <Field label="Crane Required" value={location.craneRequired} onChange={(e) => updateLocation(location.id, "craneRequired", e.target.value)} />
                      <Field label="Crane Staging Area" value={location.craneStaging} onChange={(e) => updateLocation(location.id, "craneStaging", e.target.value)} textarea />
                      <Field label="Location Notes" value={location.notes} onChange={(e) => updateLocation(location.id, "notes", e.target.value)} textarea />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>Supporting Photos</div>
                        <button onClick={() => addPhoto(location.id)} style={secondaryButtonStyle}>Add Photo</button>
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
            <div style={{ ...sectionStyle, background: "#fffbeb", borderColor: "#fcd34d" }}>
              This preview is your report view. Use Print / Save PDF to make a customer-ready PDF. Later we can split this into a customer version and a BRINC internal version.
            </div>

            <div style={sectionStyle}>
              <h1 style={{ marginTop: 0, marginBottom: 6 }}>DFR Site Survey</h1>
              <div style={{ color: "#475569" }}>
                <strong>Agency:</strong> {survey.agency || "-"} &nbsp; | &nbsp; <strong>Date:</strong> {survey.surveyDate || "-"}
              </div>
            </div>

            <TableSection title="General" rows={generalRows} />

            {survey.locations.map((location) => (
              <div key={location.id} style={{ display: "grid", gap: 12 }}>
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

                <TableSection
                  title="Permitting, Climbers & Crane"
                  rows={[
                    ["Building Permitting Required", location.permitting],
                    ["Tower Climber Required", location.towerClimber],
                    ["Crane Required", location.craneRequired],
                    ["Crane Staging Area", location.craneStaging],
                  ]}
                />

                {!!location.notes && (
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

            <div style={sectionStyle}>
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
