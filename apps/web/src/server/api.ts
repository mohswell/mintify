"use server";

import { API_URL } from "@/lib/env";
import axios from "axios";

export const api = axios.create({
    baseURL: API_URL,
});