import { Logger } from "../config/logger";
import { AppError } from "../custom.functions.ts/error";

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

const logger = Logger.getInstance()

function addThirtyMinutes(time: string): string {
  const [hour, minute] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute + 30);

  return date.toTimeString().slice(0, 5);
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token = localStorage.getItem("token");

  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    logger.warn("failed to fetch doctors profile")
    throw new AppError("failed to fetch doctors profile", response.status);
  }

  return response.json();
}