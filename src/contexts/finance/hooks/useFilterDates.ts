
import { useState } from "react";
import { getDefaultFilterDates, updateFilterDatesForPeriod } from "../utils";

/**
 * Hook for managing date filtering
 */
export function useFilterDates() {
  const [filterDates, setFilterDatesState] = useState(getDefaultFilterDates());
  const [filterPeriod, setFilterPeriodState] = useState("month");

  const setFilterDates = (startDate: Date, endDate: Date) => {
    setFilterDatesState({ startDate, endDate });
  };

  const setFilterPeriod = (period: string) => {
    setFilterPeriodState(period);
    setFilterDatesState(updateFilterDatesForPeriod(period));
  };

  return {
    filterDates,
    filterPeriod,
    setFilterDates,
    setFilterPeriod
  };
}
