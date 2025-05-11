import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date,
  options: {
    includeTime?: boolean;
    format?: "long" | "short" | "custom";
    customFormat?: string;
  } = {}
): string {
  // Check if the input is a valid Date object
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const { includeTime = false, format = "long", customFormat } = options;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const longMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = longMonthNames[date.getMonth()];

  let formattedDate = "";

  if (format === "custom" && customFormat) {
    formattedDate = customFormat
      .replace(/YYYY/g, String(year))
      .replace(/MMMM/g, monthName)
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds);
    if (includeTime) {
      const ampm = date.getHours() < 12 ? "am" : "pm";
      formattedDate = formattedDate.replace(/ampm/g, ampm);
    }
  } else if (format === "short") {
    formattedDate = `${year}-${month}-${day}`;
    if (includeTime) {
      formattedDate += ` ${hours}:${minutes}:${seconds}`;
    }
  } else {
    // Long format
    formattedDate = `${monthName} ${day}, ${year}`;
    if (includeTime) {
      formattedDate += ` ${hours}:${minutes}:${seconds}`;
    }
  }
  return formattedDate;
}
