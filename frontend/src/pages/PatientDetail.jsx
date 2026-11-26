
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import Panel from "../components/Panel";
import { Loading, ErrorState } from "../components/State";

const EMPTY_FORM = {
  first_name: "",
  middle_name: "",
  last_name: "",
  gender_code: "",
  date_of_birth: "",
  contact_number: "",
  email_address: "",
  marital_status: "",
};

export default function PatientDetail() {
  const { patientId } = useParams();

  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const [changingStatus, setChangingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  async function loadRecord() {
    setLoading(true);
    setError("");

    try {
      const response = await api.patientRecord(
        patientId,
        { force: true }
      );

      setRecord(response.data);
    } catch (e) {
      setError(e.message || "Unable to load patient record.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecord();
  }, [patientId]);

  function startEditing(patient) {
    setForm({
      first_name: patient.F_NAME || "",
      middle_name: patient.M_NAME || "",
      last_name: patient.L_NAME || "",
      gender_code:
        patient.GEN_CD === null || patient.GEN_CD === undefined
          ? ""
          : String(patient.GEN_CD),
      date_of_birth: patient.DT_BRT
        ? String(patient.DT_BRT).slice(0, 10)
        : "",
      contact_number: patient.CON_NO || "",
      email_address: patient.EM_ADD || "",
      marital_status: patient.MAR_ST || "",
    });

    setSaveMessage("");
    setSaveError("");
    setEditing(true);
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveChanges(event) {
    event.preventDefault();

    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const payload = {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim() || null,
        last_name: form.last_name.trim(),
        gender_code:
          form.gender_code === ""
            ? null
            : Number(form.gender_code),
        date_of_birth: form.date_of_birth || null,
        contact_number: form.contact_number.trim() || null,
        email_address: form.email_address.trim() || null,
        marital_status: form.marital_status.trim() || null,
      };

      await api.updatePatient(patientId, payload);

      setEditing(false);
      setSaveMessage(
        "Patient information updated successfully."
      );

      await loadRecord();
    } catch (e) {
      setSaveError(
        e.message || "Unable to update patient information."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    const patientName = [
      patient.F_NAME,
      patient.M_NAME,
      patient.L_NAME,
    ].filter(Boolean).join(" ");

    const confirmed = window.confirm(
      `Are you sure you want to deactivate this patient?\n\n` +
      `Patient: ${patientName}\n` +
      `Patient ID: ${patient.PAT_ID}\n\n` +
      `The patient record and visit history will be retained.`
    );

    if (!confirmed) return;

    setChangingStatus(true);
    setStatusMessage("");
    setStatusError("");

    try {
      await api.deactivatePatient(patientId);

      setStatusMessage(
        "Patient successfully deactivated. The record and visit history have been retained."
      );

      setEditing(false);
      await loadRecord();
    } catch (e) {
      setStatusError(
        e.message || "Unable to deactivate patient."
      );
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleReactivate() {
    const confirmed = window.confirm(
      `Are you sure you want to reactivate patient ${patient.PAT_ID}?`
    );

    if (!confirmed) return;

    setChangingStatus(true);
    setStatusMessage("");
    setStatusError("");

    try {
      await api.reactivatePatient(patientId);

      setStatusMessage(
        "Patient successfully reactivated."
      );

      await loadRecord();
    } catch (e) {
      setStatusError(
        e.message || "Unable to reactivate patient."
      );
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) return <Loading />;

  if (error) return <ErrorState message={error} />;

  if (!record?.patient) {
    return <ErrorState message="Patient record not found." />;
  }

  const patient = record.patient;
  const visits = record.visits || [];
  const summary = record.subsequent_visit_summary;

  const isActive = Number(patient.IS_ACTIVE) === 1;

  const fullName = [
    patient.F_NAME,
    patient.M_NAME,
    patient.L_NAME,
  ].filter(Boolean).join(" ");

  return (
    <div className="page-stack">

      {/* PATIENT HEADER */}

      <div className="page-title-row">
        <div>
          <p className="eyebrow">PATIENT RECORD</p>

          <h1>{fullName || patient.PAT_ID}</h1>

          <p className="page-subtitle">
            Patient ID: {patient.PAT_ID}
          </p>

          <p
            style={{
              marginTop: "8px",
              fontWeight: 600,
              color: isActive ? "#18794e" : "#b54708",
            }}
          >
            Record status: {isActive ? "Active" : "Inactive"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {isActive && (
            <button
              type="button"
              className="primary-button"
              onClick={() => startEditing(patient)}
              disabled={changingStatus}
            >
              Edit patient
            </button>
          )}

          {isActive ? (
            <button
              type="button"
              className="quiet-button"
              onClick={handleDeactivate}
              disabled={changingStatus}
              style={{
                color: "#b42318",
                borderColor: "#e6b8b5",
              }}
            >
              {changingStatus
                ? "Deactivating..."
                : "Deactivate patient"}
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={handleReactivate}
              disabled={changingStatus}
            >
              {changingStatus
                ? "Reactivating..."
                : "Reactivate patient"}
            </button>
          )}

          <Link
            className="quiet-button"
            to="/patients"
          >
            Back to directory
          </Link>
        </div>
      </div>

      {/* STATUS MESSAGES */}

      {statusMessage && (
        <p className="success-message">
          {statusMessage}
        </p>
      )}

      {statusError && (
        <p className="error-message">
          {statusError}
        </p>
      )}

      {saveMessage && (
        <p className="success-message">
          {saveMessage}
        </p>
      )}

      {saveError && (
        <p className="error-message">
          {saveError}
        </p>
      )}

      {/* EDIT FORM */}

      {editing && isActive && (
        <Panel
          title="Edit patient information"
          subtitle="Update the patient's demographic and contact information."
        >
          <form onSubmit={saveChanges}>
            <div className="edit-patient-grid">

              <label>
                First name *
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={updateField}
                  required
                  maxLength={50}
                />
              </label>

              <label>
                Middle name
                <input
                  name="middle_name"
                  value={form.middle_name}
                  onChange={updateField}
                  maxLength={50}
                />
              </label>

              <label>
                Last name *
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={updateField}
                  required
                  maxLength={50}
                />
              </label>

              <label>
                Gender
                <select
                  name="gender_code"
                  value={form.gender_code}
                  onChange={updateField}
                >
                  <option value="">Not specified</option>
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                  <option value="2">Other</option>
                </select>
              </label>

              <label>
                Date of birth
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={updateField}
                  max={new Date(
                    Date.now() -
                    new Date().getTimezoneOffset() * 60000
                  ).toISOString().slice(0, 10)}
                />
              </label>

              <label>
                Contact number
                <input
                  name="contact_number"
                  value={form.contact_number}
                  onChange={updateField}
                  maxLength={30}
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  name="email_address"
                  value={form.email_address}
                  onChange={updateField}
                  maxLength={150}
                />
              </label>

              <label>
                Marital status
                <select
                  name="marital_status"
                  value={form.marital_status}
                  onChange={updateField}
                >
                  <option value="">Select marital status</option>
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                </select>
              </label>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                className="quiet-button"
                onClick={() => {
                  setEditing(false);
                  setSaveError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* PATIENT METRICS */}

      <div className="metric-grid three">

        <div className="metric-card">
          <span className="metric-label">Gender</span>
          <div className="metric-value compact">
            {patient.GEN_DES || "—"}
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Date of birth</span>
          <div className="metric-value compact">
            {patient.DT_BRT || "—"}
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Recorded visits</span>
          <div className="metric-value">
            {visits.length.toLocaleString()}
          </div>
        </div>

      </div>

      {/* PATIENT INFORMATION */}

      <Panel title="Patient information">
        <div className="mini-stats">

          <div>
            <span>Contact number</span>
            <b>{patient.CON_NO || "—"}</b>
          </div>

          <div>
            <span>Email address</span>
            <b>{patient.EM_ADD || "—"}</b>
          </div>

          <div>
            <span>Marital status</span>
            <b>{patient.MAR_ST || "—"}</b>
          </div>

        </div>
      </Panel>

      {/* SUBSEQUENT VISIT SUMMARY */}

      <Panel
        title="30-day subsequent-visit summary"
        subtitle="Historical proxy, not a confirmed readmission outcome"
      >
        {summary ? (
          <div className="mini-stats">

            <div>
              <span>Eligible completed visits</span>
              <b>
                {Number(
                  summary.eligible_completed_visits || 0
                ).toLocaleString()}
              </b>
            </div>

            <div>
              <span>Subsequent visits within 30 days</span>
              <b>
                {Number(
                  summary.visits_followed_by_30d_subsequent_visit || 0
                ).toLocaleString()}
              </b>
            </div>

            <div>
              <span>Subsequent-visit rate</span>
              <b>
                {Number(
                  summary.pct_visits_followed_by_30d_subsequent_visit || 0
                ).toFixed(2)}%
              </b>
            </div>

          </div>
        ) : (
          <p className="empty-inline">
            No subsequent-visit summary is available for this patient.
          </p>
        )}
      </Panel>

      {/* VISIT HISTORY */}

      <Panel
        title="Visit history"
        subtitle="Recorded patient visits, newest first (up to 100)"
      >
        <div className="table-scroll">
          <table>

            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Admission</th>
                <th>Exit</th>
                <th>Visit type</th>
                <th>Status</th>
                <th>Room</th>
              </tr>
            </thead>

            <tbody>
              {visits.map((visit) => (
                <tr key={visit.VISIT_ID}>
                  <td>{visit.VISIT_ID}</td>
                  <td>{visit.VIS_EN || "—"}</td>
                  <td>{visit.VIS_EX || "—"}</td>
                  <td>{visit.VTYPE_DES || "—"}</td>
                  <td>{visit.VSTAT_DES || "—"}</td>
                  <td>{visit.ROM_ID || "—"}</td>
                </tr>
              ))}
            </tbody>

          </table>

          {!visits.length && (
            <p className="empty-inline">
              No visit history is available.
            </p>
          )}
        </div>
      </Panel>

    </div>
  );
}
