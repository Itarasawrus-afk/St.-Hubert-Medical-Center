
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

const CACHE_DURATION = 60 * 1000;

const cache = new Map();
const pendingRequests = new Map();

// ============================================================
// CACHE INVALIDATION
// ============================================================

function invalidatePatientCache(patientId = null) {
  for (const key of cache.keys()) {
    if (
      key.startsWith("/patients/directory") ||
      key === "/patients/" ||
      (patientId &&
        (
          key === `/patients/${encodeURIComponent(patientId)}` ||
          key === `/patients/${encodeURIComponent(patientId)}/record`
        ))
    ) {
      cache.delete(key);
    }
  }
}

// ============================================================
// REQUEST HELPER
// ============================================================

async function request(path, options = {}) {
  const {
    force = false,
    ttl = CACHE_DURATION,
    ...fetchOptions
  } = options;

  const method = (fetchOptions.method || "GET").toUpperCase();
  const isGet = method === "GET";

  const now = Date.now();
  const cached = cache.get(path);

  if (isGet && !force && cached && cached.expiresAt > now) {
    return cached.data;
  }

  if (isGet && !force && pendingRequests.has(path)) {
    return pendingRequests.get(path);
  }

  const pending = (async () => {
    const response = await fetch(`${API_BASE}${path}`, fetchOptions);

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload.detail || `API request failed (${response.status})`
      );
    }

    if (isGet) {
      cache.set(path, {
        data: payload,
        expiresAt: Date.now() + ttl,
      });
    }

    return payload;
  })();

  if (isGet && !force) {
    pendingRequests.set(path, pending);
  }

  try {
    return await pending;
  } finally {
    if (pendingRequests.get(path) === pending) {
      pendingRequests.delete(path);
    }
  }
}

// ============================================================
// POST REQUEST HELPER - MODEL INFERENCE
// ============================================================

async function postRequest(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.detail || `API request failed (${response.status})`
    );
  }

  return payload;
}

// ============================================================
// QUERY PARAMETER HELPER
// ============================================================

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, value);
    }
  });

  return query.toString();
}

// ============================================================
// REQUEST OPTIONS DETECTION
// ============================================================

function isRequestOptions(value) {
  return (
    value &&
    typeof value === "object" &&
    ("force" in value || "ttl" in value)
  );
}

// ============================================================
// API METHODS
// ============================================================

export const api = {
  // ----------------------------------------------------------
  // EXECUTIVE DASHBOARD
  // ----------------------------------------------------------

  overview: (options) =>
    request("/overview", options),

  trends: (startDate, endDate, options) => {
    const query = buildQuery({
      start_date: startDate,
      end_date: endDate,
    });

    return request(
      `/overview/trends${query ? `?${query}` : ""}`,
      options
    );
  },

  // ----------------------------------------------------------
  // PATIENT FLOW & VISITS
  // ----------------------------------------------------------

  visits: (
    page = 1,
    pageSize = 20,
    filtersOrOptions = {},
    maybeOptions
  ) => {
    const filters = isRequestOptions(filtersOrOptions)
      ? {}
      : filtersOrOptions || {};

    const options = isRequestOptions(filtersOrOptions)
      ? filtersOrOptions
      : maybeOptions;

    const query = buildQuery({
      page,
      page_size: pageSize,
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
      visit_type: filters.visit_type,
    });

    return request(`/visits?${query}`, options);
  },

  losSummary: (filtersOrOptions = {}, maybeOptions) => {
    const filters = isRequestOptions(filtersOrOptions)
      ? {}
      : filtersOrOptions || {};

    const options = isRequestOptions(filtersOrOptions)
      ? filtersOrOptions
      : maybeOptions;

    const query = buildQuery({
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
      visit_type: filters.visit_type,
    });

    return request(
      `/visits/los-summary${query ? `?${query}` : ""}`,
      options
    );
  },

  patientFlow: (filtersOrOptions = {}, maybeOptions) => {
    const filters = isRequestOptions(filtersOrOptions)
      ? {}
      : filtersOrOptions || {};

    const options = isRequestOptions(filtersOrOptions)
      ? filtersOrOptions
      : maybeOptions;

    const query = buildQuery({
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
      visit_type: filters.visit_type,
    });

    return request(
      `/visits/patient-flow${query ? `?${query}` : ""}`,
      options
    );
  },

  visitFilters: (options) =>
    request("/visits/filters", options),

  // ----------------------------------------------------------
  // PATIENT DIRECTORY & RECORDS
  // ----------------------------------------------------------

  patientSummary: (options) =>
    request("/patients/", options),

  patientSummaryById: (id, options) =>
    request(
      `/patients/${encodeURIComponent(id)}`,
      options
    ),

  updatePatient: async (id, data) => {
    const encodedId = encodeURIComponent(id);

    const response = await request(
      `/patients/${encodedId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    invalidatePatientCache(id);

    return response;
  },

  createPatient: async (data) => {
    const response = await request("/patients/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    invalidatePatientCache();

    return response;
  },

  deactivatePatient: async (id) => {
    const encodedId = encodeURIComponent(id);

    const response = await request(
      `/patients/${encodedId}/deactivate`,
      {
        method: "PATCH",
      }
    );

    invalidatePatientCache(id);
    return response;
  },

  reactivatePatient: async (id) => {
    const encodedId = encodeURIComponent(id);

    const response = await request(
      `/patients/${encodedId}/reactivate`,
      {
        method: "PATCH",
      }
    );

    invalidatePatientCache(id);
    return response;
  },

  patientDirectory: (
    search = "",
    page = 1,
    pageSize = 20,
    options,
    filters = {}
  ) => {
    const query = buildQuery({
      page,
      page_size: pageSize,
      search,
      status: filters.status || "active",
      gender: filters.gender || "",
      sort_by: filters.sortBy || "patient_id",
      sort_order: filters.sortOrder || "asc",
    });

    return request(
      `/patients/directory?${query}`,
      options
    );
  },

  patientRecord: (id, options) =>
    request(
      `/patients/${encodeURIComponent(id)}/record`,
      options
    ),

  // ----------------------------------------------------------
  // BILLING
  // ----------------------------------------------------------

  billingSummary: (startDate = "", endDate = "", options) => {
    const query = buildQuery({
      start_date: startDate,
      end_date: endDate,
    });

    return request(
      `/billing/summary${query ? `?${query}` : ""}`,
      options
    );
  },

  billingTrends: (startDate = "", endDate = "", options) => {
    const query = buildQuery({
      start_date: startDate,
      end_date: endDate,
    });

    return request(
      `/billing/trends${query ? `?${query}` : ""}`,
      options
    );
  },

  // ----------------------------------------------------------
  // INVENTORY
  // ----------------------------------------------------------

  inventorySummary: (options) =>
    request("/inventory/summary", options),

  // ----------------------------------------------------------
  // WORKFORCE
  // ----------------------------------------------------------

  workforceSummary: (options) =>
    request("/workforce/summary", options),

  // ----------------------------------------------------------
  // RESEARCH-ONLY XGBOOST INFERENCE
  // ----------------------------------------------------------

  xgboostStatus: (options) =>
    request("/models/xgboost/status", options),

  predictXgboostLos: (features) =>
    postRequest("/models/xgboost/los/predict", features),

  predictXgboostSubsequentVisit: (features) =>
    postRequest(
      "/models/xgboost/subsequent-visit/predict",
      features
    ),

  // ----------------------------------------------------------
  // CACHE MANAGEMENT
  // ----------------------------------------------------------

  clearCache: () => {
    cache.clear();
    pendingRequests.clear();
  },
};
