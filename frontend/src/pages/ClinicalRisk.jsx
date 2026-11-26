import { useEffect, useState } from "react";
import { api } from "../api";
import Panel from "../components/Panel";
import { Loading, ErrorState } from "../components/State";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

const INITIAL_FEATURES = {
  AGE_AT_VISIT: "45",
  GENDER: "Female",
  VISIT_TYPE: "Diagnosis",
  ADMISSION_MONTH: "6",
  ADMISSION_WEEKDAY: "2",
  ADMISSION_HOUR: "10",
  PRIOR_VISIT_COUNT: "1"
};

function toNumberOrNull(value) {
  return value === "" ? null : Number(value);
}

export default function ClinicalRisk() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [modelStatus, setModelStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [features, setFeatures] = useState(INITIAL_FEATURES);
  const [losResult, setLosResult] = useState(null);
  const [subsequentResult, setSubsequentResult] = useState(null);
  const [predictionError, setPredictionError] = useState("");
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    let active = true;

    api.patientSummary()
      .then((response) => {
        if (!response.success) {
          throw new Error("Unable to retrieve patient summary.");
        }
        if (active) setSummary(response.data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load clinical risk data.");
      });

    api.xgboostStatus({ force: true })
      .then((response) => {
        if (active) setModelStatus(response);
      })
      .catch((err) => {
        if (active) setStatusError(err.message || "Unable to retrieve XGBoost model status.");
      });

    return () => {
      active = false;
    };
  }, []);

  function updateFeature(event) {
    const { name, value } = event.target;
    setFeatures((current) => ({ ...current, [name]: value }));
  }

  async function runPredictions(event) {
    event.preventDefault();
    setPredictionError("");
    setLosResult(null);
    setSubsequentResult(null);
    setPredicting(true);

    const payload = {
      AGE_AT_VISIT: toNumberOrNull(features.AGE_AT_VISIT),
      GENDER: features.GENDER || null,
      VISIT_TYPE: features.VISIT_TYPE || null,
      ADMISSION_MONTH: toNumberOrNull(features.ADMISSION_MONTH),
      ADMISSION_WEEKDAY: toNumberOrNull(features.ADMISSION_WEEKDAY),
      ADMISSION_HOUR: toNumberOrNull(features.ADMISSION_HOUR),
      PRIOR_VISIT_COUNT: toNumberOrNull(features.PRIOR_VISIT_COUNT)
    };

    try {
      const [los, subsequent] = await Promise.all([
        api.predictXgboostLos(payload),
        api.predictXgboostSubsequentVisit(payload)
      ]);
      setLosResult(los);
      setSubsequentResult(subsequent);
    } catch (err) {
      setPredictionError(err.message || "Unable to run research predictions.");
    } finally {
      setPredicting(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!summary) return <Loading />;

  const modelsLoaded =
    modelStatus?.success === true &&
    modelStatus?.status === "loaded";

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PREDICTIVE ANALYTICS</p>
          <h1>Clinical risk & prediction</h1>
          <p className="page-subtitle">
            Historical subsequent-visit patterns, length-of-stay
            modeling, and research-only predictive model demonstrations.
          </p>
        </div>
      </div>

      <div className="notice warning">
        Research and demonstration only. These model outputs are not
        validated for clinical use, patient-level risk decisions, or
        operational alerts. The 30-day outcome is a subsequent-visit
        proxy, not confirmed hospital readmission.
      </div>

      <div className="metric-grid three">
        <div className="metric-card">
          <span className="metric-label">Eligible completed visits</span>
          <div className="metric-value">
            {formatNumber(summary.total_eligible_visits)}
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            Visits followed by another visit within 30 days
          </span>
          <div className="metric-value">
            {formatNumber(summary.total_subsequent_visits)}
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-label">Overall subsequent-visit rate</span>
          <div className="metric-value">
            {Number(summary.overall_visit_subsequent_rate || 0).toFixed(2)}%
          </div>
        </div>
      </div>

      <Panel
        title="Portable XGBoost model status"
        subtitle="Native UBJSON inference pipelines verified on Windows"
      >
        {modelsLoaded ? (
          <div className="notice">
            Both XGBoost models are loaded. Inference format:{" "}
            <strong>{modelStatus.format?.toUpperCase() || "UBJSON"}</strong>.
            Research-only restrictions remain active.
          </div>
        ) : (
          <div className="notice warning">
            {statusError || "The model status endpoint has not confirmed that both models are loaded."}
          </div>
        )}
        <div className="empty-model">
          <div className="model-mark">LOS</div>
          <div>
            <strong>Length-of-stay XGBoost regression</strong>
            <p>
              The API returns a predicted length of stay in days. The
              previously reported Random Forest MAE was 49.03 days;
              this is a separate model evaluation result and does not
              establish acceptable predictive performance.
            </p>
          </div>
        </div>
        <div className="empty-model">
          <div className="model-mark">30D</div>
          <div>
            <strong>Subsequent-visit XGBoost classification</strong>
            <p>
              The previously reported XGBoost ROC-AUC was 0.5023 and
              average precision was 0.1170. The experimental threshold
              is retained and is not a clinical decision threshold.
            </p>
          </div>
        </div>
      </Panel>

      <Panel
        title="Research prediction demonstration"
        subtitle="Enter synthetic or otherwise appropriately authorized test features; do not enter patient identifiers."
      >
        <form onSubmit={runPredictions}>
          <div className="filter-grid">
            <label className="filter-field">
              <span>Age at visit</span>
              <input
                type="number"
                name="AGE_AT_VISIT"
                min="0"
                max="120"
                value={features.AGE_AT_VISIT}
                onChange={updateFeature}
              />
            </label>
            <label className="filter-field">
              <span>Gender</span>
              <select name="GENDER" value={features.GENDER} onChange={updateFeature}>
                <option value="">Missing</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Visit type</span>
              <select name="VISIT_TYPE" value={features.VISIT_TYPE} onChange={updateFeature}>
                <option value="">Missing</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="Treatment">Treatment</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Admission month (1–12)</span>
              <input
                type="number"
                name="ADMISSION_MONTH"
                min="1"
                max="12"
                value={features.ADMISSION_MONTH}
                onChange={updateFeature}
              />
            </label>
            <label className="filter-field">
              <span>Admission weekday (0–6)</span>
              <input
                type="number"
                name="ADMISSION_WEEKDAY"
                min="0"
                max="6"
                value={features.ADMISSION_WEEKDAY}
                onChange={updateFeature}
              />
            </label>
            <label className="filter-field">
              <span>Admission hour (0–23)</span>
              <input
                type="number"
                name="ADMISSION_HOUR"
                min="0"
                max="23"
                value={features.ADMISSION_HOUR}
                onChange={updateFeature}
              />
            </label>
            <label className="filter-field">
              <span>Prior visit count</span>
              <input
                type="number"
                name="PRIOR_VISIT_COUNT"
                min="0"
                value={features.PRIOR_VISIT_COUNT}
                onChange={updateFeature}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginTop: "16px" }}>
            <button type="submit" disabled={predicting || !modelsLoaded}>
              {predicting ? "Running predictions..." : "Run research predictions"}
            </button>
            {!modelsLoaded && (
              <span className="muted">Prediction is disabled until both models report loaded.</span>
            )}
          </div>
        </form>

        {predictionError && (
          <div className="notice warning" style={{ marginTop: "16px" }}>
            {predictionError}
          </div>
        )}

        {(losResult || subsequentResult) && (
          <div className="metric-grid two" style={{ marginTop: "20px" }}>
            {losResult && (
              <div className="metric-card">
                <span className="metric-label">XGBoost predicted LOS</span>
                <div className="metric-value">
                  {Number(losResult.prediction).toFixed(2)} days
                </div>
                <p>Inference format: {losResult.inference_format}</p>
                <p>Research only: {String(losResult.research_only)}</p>
              </div>
            )}
            {subsequentResult && (
              <div className="metric-card">
                <span className="metric-label">30-day subsequent-visit proxy probability</span>
                <div className="metric-value">
                  {(Number(subsequentResult.positive_class_probability) * 100).toFixed(2)}%
                </div>
                <p>
                  Standard model decision:{" "}
                  <strong>{subsequentResult.standard_decision}</strong>
                </p>
                <p>
                  Frozen experimental threshold:{" "}
                  <strong>{Number(subsequentResult.frozen_experimental_threshold).toFixed(5)}</strong>
                </p>
                <p>
                  Experimental threshold decision:{" "}
                  <strong>{subsequentResult.frozen_threshold_decision}</strong>
                </p>
                <p>{subsequentResult.outcome_definition}</p>
              </div>
            )}
          </div>
        )}
      </Panel>

      <div className="notice">
        Historical evaluation metrics and live API inference demonstrations
        are different forms of evidence. Successful model loading and API
        responses establish technical integration, not predictive validity.
        No clinical deployment, automated alerts, or patient-level care
        decisions are supported.
      </div>
    </div>
  );
}
