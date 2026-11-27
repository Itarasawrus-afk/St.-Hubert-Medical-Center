
import { useEffect, useState } from "react";
import {
  ReceiptText,
  Users,
  Calculator,
  FileText,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../api";
import Panel from "../components/Panel";
import { Loading, ErrorState } from "../components/State";

const PAGE_SIZE = 20;

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    maximumFractionDigits: 2,
  });
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Billing() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  async function loadBilling(
    start = startDate,
    end = endDate
  ) {
    if (start && end && start > end) {
      setFilterError("Start date cannot be later than end date.");
      return;
    }

    setLoading(true);
    setError("");
    setFilterError("");

    try {
      const [summaryResponse, trendsResponse] = await Promise.all([
        api.billingSummary(start, end, { force: true }),
        api.billingTrends(start, end, { force: true }),
      ]);

      setSummary(summaryResponse.data || {});
      setTrends(trendsResponse.data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(e.message || "Unable to load billing information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBilling("", "");
  }, []);

  function handleApplyFilters(event) {
    event.preventDefault();
    loadBilling(startDate, endDate);
  }

  function handleResetFilters() {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    loadBilling("", "");
  }

  // ----------------------------------------------------------
  // BILLING TRENDS PAGINATION
  // ----------------------------------------------------------

  const totalRecords = trends.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalRecords);

  const paginatedTrends = trends.slice(startIndex, endIndex);

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  const metrics = [
    {
      label: "Total billed amount",
      value: formatAmount(summary?.total_billed_amount),
      description: "Sum of recorded billed amounts",
      icon: ReceiptText,
    },
    {
      label: "Billing records",
      value: formatNumber(summary?.total_billing_records),
      description: "Number of billing records",
      icon: FileText,
    },
    {
      label: "Patients billed",
      value: formatNumber(summary?.patient_billing_group_count),
      description: "Distinct patient billing groups",
      icon: Users,
    },
    {
      label: "Average bill amount",
      value: formatAmount(summary?.average_bill_amount),
      description: "Average amount per billing record",
      icon: Calculator,
    },
  ];

  return (
    <div className="page-stack">

      {/* PAGE HEADER */}

      <div className="page-title-row">
        <div>
          <p className="eyebrow">FINANCIAL PERFORMANCE</p>
          <h1>Billing BI</h1>
          <p className="page-subtitle">
            Monitor recorded billing amounts and billing activity.
          </p>
        </div>
      </div>

      {/* DATE FILTERS */}

      <Panel
        title="Billing filters"
        subtitle="Filter billing records by billing date."
      >
        <form
          className="directory-filters"
          onSubmit={handleApplyFilters}
        >
          <label>
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
            />
          </label>

          <label>
            End date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </label>

          <div className="directory-filter-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              Apply filters
            </button>

            <button
              type="button"
              className="quiet-button"
              onClick={handleResetFilters}
              disabled={loading}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </form>

        {filterError && (
          <p className="error-message">{filterError}</p>
        )}
      </Panel>

      {/* LOADING AND ERROR */}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {/* BILLING METRICS */}

          <div
            className="metric-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "16px",
            }}
          >
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div className="metric-card" key={metric.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span className="metric-label">
                      {metric.label}
                    </span>

                    <Icon size={19} color="#548675" />
                  </div>

                  <div
                    className="metric-value compact"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {metric.value}
                  </div>

                  <p className="page-subtitle">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* BILLING TRENDS */}

          <Panel
            title="Billing trends"
            subtitle="Daily billing activity for the selected date range."
          >
            {totalRecords > 0 ? (
              <>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Billing date</th>
                        <th>Billing records</th>
                        <th>Total billed amount</th>
                        <th>Average bill amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTrends.map((item) => (
                        <tr key={item.billing_date}>
                          <td>{item.billing_date}</td>
                          <td>{formatNumber(item.bill_count)}</td>
                          <td>{formatAmount(item.total_billed_amount)}</td>
                          <td>{formatAmount(item.average_bill_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION CONTROLS */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <p className="page-subtitle" style={{ margin: 0 }}>
                    Showing{" "}
                    {startIndex + 1}–{endIndex} of{" "}
                    {totalRecords.toLocaleString()} billing dates
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="quiet-button"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={15} />
                      Previous
                    </button>

                    <span
                      style={{
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      className="quiet-button"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="empty-inline">
                No billing trend records are available for this date range.
              </p>
            )}
          </Panel>

          {/* DATA DEFINITIONS */}

          <Panel
            title="Metric definitions"
            subtitle="Interpretation of the available billing measures."
          >
            <div className="mini-stats">
              <div>
                <span>Total billed amount</span>
                <b>
                  Sum of total billed amounts in the billing summary view.
                </b>
              </div>

              <div>
                <span>Billing records</span>
                <b>
                  Sum of billing record counts in the selected date range.
                </b>
              </div>

              <div>
                <span>Patients billed</span>
                <b>
                  Sum of distinct patients billed as reported by the view.
                </b>
              </div>

              <div>
                <span>Average bill amount</span>
                <b>
                  Total billed amount divided by the number of billing records.
                </b>
              </div>
            </div>

            <p className="page-subtitle" style={{ marginTop: "16px" }}>
              Amounts are displayed in database units. The current billing
              endpoint does not specify a currency or provide payment
              collection and outstanding-balance data.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
