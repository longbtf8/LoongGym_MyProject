import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export function useExerciseFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // local states for inputs that we want to debounce
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // sync search input with URL search param changes (e.g. from back button)
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // parsing parameters
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "popular";
  const difficulty = searchParams.get("difficulty") || "";
  
  // muscle can be a list or a string. In state, we keep it as an array of slugs
  const selectedMuscles = useMemo(() => {
    const val = searchParams.get("muscle");
    return val ? val.split(",").filter(Boolean) : [];
  }, [searchParams]);

  // equipment can be a list or a string. In state, we keep it as an array of slugs
  const selectedEquipment = useMemo(() => {
    const val = searchParams.get("equipment");
    return val ? val.split(",").filter(Boolean) : [];
  }, [searchParams]);

  // debounce search term
  useEffect(() => {
    const currentParam = searchParams.get("search") || "";
    if (searchTerm === currentParam) return;

    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        if (searchTerm) {
          prev.set("search", searchTerm);
        } else {
          prev.delete("search");
        }
        prev.set("page", "1"); // reset to page 1 on new search
        return prev;
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams, searchParams]);

  const setDifficulty = (level) => {
    setSearchParams((prev) => {
      if (level) {
        prev.set("difficulty", level);
      } else {
        prev.delete("difficulty");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const setSort = (sortOption) => {
    setSearchParams((prev) => {
      prev.set("sort", sortOption);
      prev.set("page", "1");
      return prev;
    });
  };

  const setPage = (newPage) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  const toggleMuscle = (muscleSlug) => {
    setSearchParams((prev) => {
      let current = prev.get("muscle") ? prev.get("muscle").split(",").filter(Boolean) : [];
      if (current.includes(muscleSlug)) {
        current = current.filter((s) => s !== muscleSlug);
      } else {
        current.push(muscleSlug);
      }
      
      if (current.length > 0) {
        prev.set("muscle", current.join(","));
      } else {
        prev.delete("muscle");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const toggleEquipment = (equipSlug) => {
    setSearchParams((prev) => {
      let current = prev.get("equipment") ? prev.get("equipment").split(",").filter(Boolean) : [];
      if (current.includes(equipSlug)) {
        current = current.filter((s) => s !== equipSlug);
      } else {
        current.push(equipSlug);
      }
      
      if (current.length > 0) {
        prev.set("equipment", current.join(","));
      } else {
        prev.delete("equipment");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchParams(new URLSearchParams());
  };

  return {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    sort,
    setSort,
    difficulty,
    setDifficulty,
    selectedMuscles,
    toggleMuscle,
    selectedEquipment,
    toggleEquipment,
    resetFilters,
  };
}
