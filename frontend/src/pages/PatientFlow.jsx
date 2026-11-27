
import { useCallback, useEffect, useState } from "react";

import {
  RefreshCw,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { api } from "../api";
import MetricCard from "../components/MetricCard";
import Panel from "../components/Panel";
import {
  Loading,
  ErrorState,
  EmptyState
} from "../components/State";

const PAGE_SIZE = 20;


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatDays(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(2)} days`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replace("T", " ")
    .replace(/\.\d+$/, "");
}


// ============================================================
// PATIENT FLOW PAGE
// ============================================================

export default function PatientFlow() {

  // ----------------------------------------------------------
  // DATA STATES
  // ----------------------------------------------------------

  const [visits, setVisits] = useState(null);
  const [los, setLos] = useState(null);
  const [flow, setFlow] = useState([]);

  const [filterOptions, setFilterOptions] = useState({
    minimum_admission_date: "",
    maximum_admission_date: "",
    visit_types: [],
    statuses: []
  });


  // ----------------------------------------------------------
  // FILTER STATES
  // ----------------------------------------------------------

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    visit_type: "",
    status: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    start_date: "",
    end_date: "",
    visit_type: "",
    status: ""
  });


  // ----------------------------------------------------------
  // PAGE AND LOADING STATES
  // ----------------------------------------------------------

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");


  // ==========================================================
  // LOAD PAGE DATA
  // ==========================================================

  const loadData = useCallback(async (force = false) => {

    setError("");

    if (force) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const options = force ? { force: true } : {};

    try {

      const [
        visitResponse,
        losResponse,
        flowResponse,
        filterResponse
      ] = await Promise.all([

        api.visits(
          page,
          PAGE_SIZE,
          appliedFilters,
          options
        ),

        api.losSummary(
          appliedFilters,
          options
        ),

        api.patientFlow(
          appliedFilters,
          options
        ),

        api.visitFilters(options)

      ]);


      // ------------------------------------------------------
      // VALIDATE RESPONSES
      // ------------------------------------------------------

      if (
        !visitResponse.success ||
        !losResponse.success ||
        !flowResponse.success ||
        !filterResponse.success
      ) {
        throw new Error(
          "One or more Patient Flow API requests failed."
        );
      }


      // ------------------------------------------------------
      // STORE VISIT AND LOS DATA
      // ------------------------------------------------------

      setVisits(visitResponse);
      setLos(losResponse.data);


      // ------------------------------------------------------
      // STORE FILTER OPTIONS
      // ------------------------------------------------------

      setFilterOptions({
        minimum_admission_date:
          filterResponse.data.minimum_admission_date || "",

        maximum_admission_date:
          filterResponse.data.maximum_admission_date || "",

        visit_types:
          filterResponse.data.visit_types || [],

        statuses:
          filterResponse.data.statuses || []
      });


      // ------------------------------------------------------
      // STORE FILTERED PATIENT FLOW DATA
      // ------------------------------------------------------

      const patientFlow = flowResponse.data || [];

      setFlow(
        patientFlow.map((item) => ({
          date: String(item.flow_date).slice(0, 10),
          visits: Number(item.visit_entries || 0)
        }))
      );

    } catch (err) {

      setError(
        err.message || "Unable to load Patient Flow data."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }, [page, appliedFilters]);


  // ==========================================================
  // INITIAL LOAD AND DATA REFRESH
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);


  // ==========================================================
  // FILTER HANDLERS
  // ==========================================================

  function updateFilter(field, value) {

    setFilters((current) => ({
      ...current,
      [field]: value
    }));

  }


  function applyFilters(event) {

    event.preventDefault();

    if (
      filters.start_date &&
      filters.end_date &&
      filters.start_date > filters.end_date
    ) {

      setError(
        "Admission date from cannot be later than admission date to."
      );

      return;
    }

    setPage(1);

    setAppliedFilters({
      ...filters
    });

  }


  function resetFilters() {

    const emptyFilters = {
      start_date: "",
      end_date: "",
      visit_type: "",
      status: ""
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setError("");

  }


  // ==========================================================
  // PAGINATION DATA
  // ==========================================================

  const pagination = visits?.pagination || {};

  const records = visits?.data || [];

  const totalPages = pagination.total_pages || 1;


  // ==========================================================
  // LOADING AND ERROR STATES
  // ==========================================================

  if (loading && !visits) {
    return <Loading />;
  }

  if (error && !visits) {
    return <ErrorState message={error} />;
  }


  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartData = flow.slice(-30);


  // ==========================================================
  // PAGE UI
  // ==========================================================

  return (

    <div className="page-stack">

      {/* PAGE HEADER */}

      <div className="page-title-row">

        <div>
          <p className="eyebrow">
            OPERATIONS
          </p>

          <h1>
            Patient flow & length of stay
          </h1>

          <p className="page-subtitle">
            Historical visit activity, recorded visit duration,
            and patient-flow patterns.
          </p>
        </div>

        <button
          className="quiet-button"
          onClick={() => loadData(true)}
          disabled={refreshing}
        >

          <RefreshCw
            size={15}
            className={refreshing ? "spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}

        </button>

      </div>


      {/* ERROR NOTICE */}

      {error && (

        <div className="notice">
          Unable to refresh the data: {error}
        </div>

      )}


      {/* LOS SUMMARY CARDS */}

      <div className="metric-grid">

        <MetricCard
          label="Average LOS"
          value={formatDays(los?.average_los_days)}
        />

        <MetricCard
          label="Minimum LOS"
          value={formatDays(los?.minimum_los_days)}
        />

        <MetricCard
          label="Maximum LOS"
          value={formatDays(los?.maximum_los_days)}
        />

        <MetricCard
          label="Visits over 30 days"
          value={formatNumber(los?.stays_over_30_days)}
        />

        <MetricCard
          label="Visits over 90 days"
          value={formatNumber(los?.stays_over_90_days)}
        />

      </div>


      {/* PATIENT FLOW CHART */}

      <Panel
        title="Daily patient entries"
        subtitle="Visit entries by admission date · latest 30 available dates"
      >

        {chartData.length > 0 ? (

          <div className="chart-wrap">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="visits"
                  name="Visit entries"
                  fill="#2d7964"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <EmptyState
            message="No patient-flow records match the selected filters."
          />

        )}

      </Panel>


      {/* VISIT RECORDS AND FILTERS */}

      <Panel
        title="Visit records"
        subtitle={`${formatNumber(pagination.total_records)} total records`}
      >

        {/* FILTER FORM */}

        <form
          className="filter-grid"
          onSubmit={applyFilters}
        >

          {/* ADMISSION DATE FROM */}

          <div className="form-group">

            <label htmlFor="start-date">
              Admission date from
            </label>

            <input
              id="start-date"
              type="date"
              min={filterOptions.minimum_admission_date || undefined}
              max={filterOptions.maximum_admission_date || undefined}
              value={filters.start_date}
              onChange={(event) =>
                updateFilter("start_date", event.target.value)
              }
            />

          </div>


          {/* ADMISSION DATE TO */}

          <div className="form-group">

            <label htmlFor="end-date">
              Admission date to
            </label>

            <input
              id="end-date"
              type="date"
              min={filterOptions.minimum_admission_date || undefined}
              max={filterOptions.maximum_admission_date || undefined}
              value={filters.end_date}
              onChange={(event) =>
                updateFilter("end_date", event.target.value)
              }
            />

          </div>


          {/* VISIT TYPE DROPDOWN */}

          <div className="form-group">

            <label htmlFor="visit-type">
              Visit type
            </label>

            <select
              id="visit-type"
              value={filters.visit_type}
              onChange={(event) =>
                updateFilter("visit_type", event.target.value)
              }
            >

              <option value="">
                All visit types
              </option>

              {filterOptions.visit_types.map((type) => (

                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>

              ))}

            </select>

          </div>


          {/* VISIT STATUS DROPDOWN */}

          <div className="form-group">

            <label htmlFor="visit-status">
              Visit status
            </label>

            <select
              id="visit-status"
              value={filters.status}
              onChange={(event) =>
                updateFilter("status", event.target.value)
              }
            >

              <option value="">
                All statuses
              </option>

              {filterOptions.statuses.map((status) => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              ))}

            </select>

          </div>


          {/* FILTER BUTTONS */}

          <div className="filter-actions">

            <button
              type="submit"
              className="primary-button"
            >

              <Search size={15} />

              Apply filters

            </button>

            <button
              type="button"
              className="quiet-button"
              onClick={resetFilters}
            >

              <RotateCcw size={15} />

              Reset

            </button>

          </div>

        </form>


        {/* VISIT RECORDS TABLE */}

        {records.length > 0 ? (

          <>

            <div className="table-scroll">

              <table>

                <thead>

                  <tr>
                    <th>Visit ID</th>
                    <th>Admission</th>
                    <th>Exit</th>
                    <th>Visit type</th>
                    <th>Status</th>
                    <th>LOS (days)</th>
                  </tr>

                </thead>

                <tbody>

                  {records.map((visit) => (

                    <tr key={visit.visit_id}>

                      <td>
                        {visit.visit_id}
                      </td>

                      <td>
                        {formatDate(visit.admission_date)}
                      </td>

                      <td>
                        {formatDate(visit.exit_date)}
                      </td>

                      <td>
                        {visit.visit_type || "—"}
                      </td>

                      <td>
                        {visit.status || "—"}
                      </td>

                      <td>
                        {visit.los_days == null
                          ? "—"
                          : Number(visit.los_days).toFixed(2)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {/* PAGINATION */}

            <div className="pagination">

              <span>

                Page {pagination.page || page} of {totalPages}

                {" · "}

                {formatNumber(pagination.total_records)} records

              </span>

              <div className="pagination-actions">

                <button
                  type="button"
                  className="quiet-button"
                  disabled={page <= 1 || loading}
                  onClick={() =>
                    setPage((current) => current - 1)
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
                    setPage((current) => current + 1)
                  }
                >

                  Next

                  <ChevronRight size={15} />

                </button>

              </div>

            </div>

          </>

        ) : (

          <EmptyState
            message="No visit records match the selected filters."
          />

        )}

      </Panel>


      {/* DATA INTERPRETATION NOTICE */}

      <div className="notice">

        LOS values are derived from recorded visit timestamps.
        Validate the source timestamp definitions before interpreting
        them as hospital performance indicators. This page displays
        historical records and does not represent live bed occupancy,
        discharge delays, or bed turnaround.

      </div>

    </div>

  );

}
