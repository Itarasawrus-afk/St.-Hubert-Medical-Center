
import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter,
  X,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Panel from "../components/Panel";
import { Loading, ErrorState } from "../components/State";

const PAGE_SIZE = 20;

const DEFAULT_FILTERS = {
  sortBy: "patient_id",
  sortOrder: "asc",
  gender: "",
  status: "active",
};

const EMPTY_PATIENT = {
  first_name: "",
  middle_name: "",
  last_name: "",
  gender_code: "2",
  date_of_birth: "",
  contact_number: "",
  email_address: "",
  marital_status: "",
};

export default function Patients({ role }) {
  const canManagePatients =
    role === "Administrator" || role === "Hospital Staff";

  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState(EMPTY_PATIENT);
  const [savingPatient, setSavingPatient] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================================
  // LOAD PATIENT DIRECTORY
  // ==========================================================

  async function load(
    search = query,
    requestedPage = 1,
    selectedFilters = filters
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await api.patientDirectory(
        search,
        requestedPage,
        PAGE_SIZE,
        { force: true },
        selectedFilters
      );

      setResult(response);
      setPage(requestedPage);
    } catch (e) {
      setError(e.message || "Unable to load patient records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("", 1, DEFAULT_FILTERS);
  }, []);

  // ==========================================================
  // SEARCH AND FILTERS
  // ==========================================================

  function getFullName(patient) {
    return [
      patient.F_NAME,
      patient.M_NAME,
      patient.L_NAME,
    ]
      .filter(Boolean)
      .join(" ");
  }

  function handleSearch(event) {
    event.preventDefault();
    load(query, 1);
  }

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function applyFilters() {
    load(query, 1, filters);
    setShowFilters(false);
  }

  function resetFilters() {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
    load("", 1, DEFAULT_FILTERS);
  }

  // ==========================================================
  // ADD PATIENT FORM
  // ==========================================================

  function updateNewPatient(name, value) {
    setNewPatient((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function closeAddForm() {
    setShowAddForm(false);
    setNewPatient(EMPTY_PATIENT);
    setFormError("");
  }

  async function handleAddPatient(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!canManagePatients) {
      setFormError(
        "You do not have permission to add patient records."
      );
      return;
    }

    if (
      !newPatient.first_name.trim() ||
      !newPatient.last_name.trim()
    ) {
      setFormError("First name and last name are required.");
      return;
    }

    if (!newPatient.date_of_birth) {
      setFormError("Date of birth is required.");
      return;
    }

    if (
      newPatient.date_of_birth >
      new Date().toISOString().slice(0, 10)
    ) {
      setFormError("Date of birth cannot be in the future.");
      return;
    }

    const payload = {
      first_name: newPatient.first_name.trim(),
      middle_name: newPatient.middle_name.trim() || null,
      last_name: newPatient.last_name.trim(),
      gender_code: Number(newPatient.gender_code),
      date_of_birth: newPatient.date_of_birth,
      contact_number: newPatient.contact_number.trim() || null,
      email_address: newPatient.email_address.trim() || null,
      marital_status: newPatient.marital_status || null,
    };

    setSavingPatient(true);

    try {
      const response = await api.createPatient(payload);

      const patientId =
        response?.data?.PAT_ID ||
        response?.data?.patient_id ||
        response?.patient_id ||
        response?.PAT_ID;

      setSuccessMessage(
        `Patient successfully added. Patient ID: ${
          patientId || "Generated successfully"
        }`
      );

      setNewPatient(EMPTY_PATIENT);
      setShowAddForm(false);

      setQuery("");
      setFilters(DEFAULT_FILTERS);

      await load("", 1, DEFAULT_FILTERS);
    } catch (e) {
      setFormError(
        e.message || "Unable to create patient record."
      );
    } finally {
      setSavingPatient(false);
    }
  }

  // ==========================================================
  // PAGINATION DATA
  // ==========================================================

  const pagination = result?.pagination || {};
  const records = result?.data || [];
  const totalPages = pagination.total_pages || 1;
  const totalRecords = pagination.total_records || 0;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="page-stack">

      {/* PAGE HEADER */}

      <div className="page-title-row">
        <div>
          <p className="eyebrow">PATIENT RECORDS</p>
          <h1>Patient directory</h1>
          <p className="page-subtitle">
            Search, filter, and open patient records.
          </p>
        </div>

        {canManagePatients && (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setShowAddForm((current) => !current);
              setFormError("");
              setSuccessMessage("");
            }}
          >
            {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
            {showAddForm ? "Close form" : "Add patient"}
          </button>
        )}
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      )}

      {/* ADD PATIENT FORM */}

      {showAddForm && canManagePatients && (
        <Panel
          title="Add new patient"
          subtitle="Enter the patient's demographic and contact information."
        >
          <form
            className="edit-patient-grid"
            onSubmit={handleAddPatient}
          >
            <label>
              First name *
              <input
                type="text"
                required
                maxLength={50}
                value={newPatient.first_name}
                onChange={(e) =>
                  updateNewPatient("first_name", e.target.value)
                }
              />
            </label>

            <label>
              Middle name
              <input
                type="text"
                maxLength={50}
                value={newPatient.middle_name}
                onChange={(e) =>
                  updateNewPatient("middle_name", e.target.value)
                }
              />
            </label>

            <label>
              Last name *
              <input
                type="text"
                required
                maxLength={50}
                value={newPatient.last_name}
                onChange={(e) =>
                  updateNewPatient("last_name", e.target.value)
                }
              />
            </label>

            <label>
              Gender *
              <select
                required
                value={newPatient.gender_code}
                onChange={(e) =>
                  updateNewPatient("gender_code", e.target.value)
                }
              >
                <option value="0">Male</option>
                <option value="1">Female</option>
                <option value="2">Other / Not specified</option>
              </select>
            </label>

            <label>
              Date of birth *
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                value={newPatient.date_of_birth}
                onChange={(e) =>
                  updateNewPatient("date_of_birth", e.target.value)
                }
              />
            </label>

            <label>
              Contact number
              <input
                type="tel"
                maxLength={30}
                value={newPatient.contact_number}
                onChange={(e) =>
                  updateNewPatient("contact_number", e.target.value)
                }
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                maxLength={150}
                value={newPatient.email_address}
                onChange={(e) =>
                  updateNewPatient("email_address", e.target.value)
                }
              />
            </label>

            <label>
              Marital status
              <select
                value={newPatient.marital_status}
                onChange={(e) =>
                  updateNewPatient("marital_status", e.target.value)
                }
              >
                <option value="">Not specified</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Separated">Separated</option>
              </select>
            </label>

            {formError && (
              <p className="error-message" role="alert">
                {formError}
              </p>
            )}

            <div className="directory-filter-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={savingPatient}
              >
                {savingPatient ? "Saving..." : "Save patient"}
              </button>

              <button
                type="button"
                className="quiet-button"
                disabled={savingPatient}
                onClick={closeAddForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* PATIENT SEARCH */}

      <Panel
        title="Patient search"
        subtitle="Search by patient ID or name"
      >
        <form
          className="search-row"
          onSubmit={handleSearch}
        >
          <div className="search-input">
            <Search size={17} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter patient ID or name"
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            Search
          </button>

          <button
            type="button"
            className={`filter-toggle-button ${
              showFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowFilters((current) => !current)
            }
            aria-label={
              showFilters ? "Hide filters" : "Show filters"
            }
            aria-expanded={showFilters}
            title={
              showFilters ? "Hide filters" : "Show filters"
            }
          >
            {showFilters ? (
              <X size={18} />
            ) : (
              <Filter size={18} />
            )}
            <span>Filters</span>
          </button>
        </form>

        {/* FILTERS */}

        {showFilters && (
          <>
            <div className="directory-filters">

              <label>
                Sort by
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    updateFilter("sortBy", e.target.value)
                  }
                >
                  <option value="patient_id">Patient ID</option>
                  <option value="name">Patient name</option>
                  <option value="date_of_birth">Date of birth</option>
                </select>
              </label>

              <label>
                Sort order
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    updateFilter("sortOrder", e.target.value)
                  }
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>

              <label>
                Gender
                <select
                  value={filters.gender}
                  onChange={(e) =>
                    updateFilter("gender", e.target.value)
                  }
                >
                  <option value="">All genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Record status
                <select
                  value={filters.status}
                  onChange={(e) =>
                    updateFilter("status", e.target.value)
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="all">All records</option>
                </select>
              </label>

            </div>

            <div className="directory-filter-actions">
              <button
                type="button"
                className="primary-button"
                onClick={applyFilters}
                disabled={loading}
              >
                Apply filters
              </button>

              <button
                type="button"
                className="quiet-button"
                onClick={resetFilters}
                disabled={loading}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </>
        )}

        {/* PATIENT TABLE */}

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Date of birth</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((patient) => (
                    <tr key={patient.PAT_ID}>
                      <td>{patient.PAT_ID}</td>
                      <td>{getFullName(patient)}</td>
                      <td>{patient.GEN_DES || "—"}</td>
                      <td>{patient.DT_BRT || "—"}</td>
                      <td>
                        {Number(patient.IS_ACTIVE) === 1
                          ? "Active"
                          : "Inactive"}
                      </td>
                      <td>
                        <Link
                          className="table-link"
                          to={`/patients/${encodeURIComponent(
                            patient.PAT_ID
                          )}`}
                        >
                          View record
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!records.length && (
                <p className="empty-inline">
                  No matching patient records.
                </p>
              )}
            </div>

            {/* RECORD COUNT */}

            {result?.pagination && (
              <p className="page-subtitle">
                Showing {records.length} of{" "}
                {totalRecords.toLocaleString()} matching patient records
              </p>
            )}

            {/* PAGINATION */}

            {totalRecords > 0 && (
              <div className="pagination">
                <span>
                  Page {page} of {totalPages}
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    className="quiet-button"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      load(query, page - 1)
                    }
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <button
                    type="button"
                    className="quiet-button"
                    disabled={page >= totalPages || loading}
                    onClick={() =>
                      load(query, page + 1)
                    }
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
