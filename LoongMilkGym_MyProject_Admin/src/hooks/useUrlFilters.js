import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export default function useUrlFilters({ defaultParams = {}, debounceMs = 300 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultParamsRef = useRef(defaultParams);

  // Get current params from URL, falling back to defaults
  const getParamsFromUrl = useCallback(() => {
    const params = { ...defaultParamsRef.current };
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const [params, setParams] = useState(getParamsFromUrl);
  const [searchVal, setSearchVal] = useState(params.search || "");

  // Update local state when URL params change
  useEffect(() => {
    const updated = getParamsFromUrl();
    setParams(updated);
    if (updated.search !== undefined) {
      setSearchVal(updated.search);
    } else {
      setSearchVal("");
    }
  }, [searchParams, getParamsFromUrl]);

  // Update specific query param
  const updateQueryParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      // Reset page to 1 on filter changes unless we are updating page itself
      if (key !== "page" && next.has("page")) {
        next.set("page", "1");
      }
      return next;
    });
  }, [setSearchParams]);

  // Handle multiple updates at once
  const updateQueryParams = useCallback((newParams) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (!newParams.page && next.has("page")) {
        next.set("page", "1");
      }
      return next;
    });
  }, [setSearchParams]);

  // Search debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = params.search || "";
      if (currentSearch !== searchVal) {
        updateQueryParam("search", searchVal);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchVal, params.search, debounceMs, updateQueryParam]);

  const handleClearFilters = useCallback((keepKeys = []) => {
    setSearchParams(prev => {
      const next = new URLSearchParams();
      keepKeys.forEach(key => {
        if (prev.has(key)) {
          next.set(key, prev.get(key));
        }
      });
      return next;
    });
    setSearchVal("");
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    updateQueryParam("page", String(newPage));
  }, [updateQueryParam]);

  return {
    params,
    searchVal,
    setSearchVal,
    updateQueryParam,
    updateQueryParams,
    handleClearFilters,
    handlePageChange
  };
}
