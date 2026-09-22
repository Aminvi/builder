"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ImagePlus,
  HardHat,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  X,
  CloudRain,
  ClipboardList,
} from "lucide-react";

import {
  equipment,
  staff,
  incidents,
  money,
  Project,
} from "@/lib/data";

type Page =
  | "Dashboard"
  | "Projects"
  | "Finance"
  | "Procurement"
  | "Equipment"
  | "Staff & Attendance"
  | "Safety"
  | "Reports"
  | "Calendar"
  | "Settings";

type FinanceInvoice = {
  id: string;
  invoice_number: string;
  project_id: string | null;
  client_id: string | null;
  amount: number | string;
  due_date: string | null;
  paid_amount: number | string;
  status: string;
  issue_date: string | null;
};

type FinancePayment = {
  id: string;
  invoice_id: string | null;
  project_id: string | null;
  client_id: string | null;
  amount: number | string;
  payment_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
};

type FinanceExpense = {
  id: string;
  project_id: string | null;
  category: string;
  description: string | null;
  amount: number | string;
  expense_date: string;
  approved: boolean;
};

type EquipmentRecord = {
  id: string;
  name: string;
  equipment_number: string;
  category: string;
  project_id: string | null;
  status: string;
  condition: string;
  last_service_date: string | null;
  next_service_date: string | null;
  created_at?: string;
};

type StaffRecord = {
  id: string;
  employee_number: string;
  name: string;
  role: string;
  department: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at?: string;
};

type AttendanceRecord = {
  id: string;
  staff_id: string;
  attendance_date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  created_at?: string;
};

type SafetyIncidentRecord = {
  id: string;
  project: string;
  severity: string;
  text: string;
  status: string;
  date: string;
  correctiveAction: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  project: string;
  type: string;
  notes: string;
};

type WeatherState = {
  name: string;
  latitude: number;
  longitude: number;
};

const NIGERIAN_STATES: WeatherState[] = [
  { name: "Abia", latitude: 5.4527, longitude: 7.5248 },
  { name: "Adamawa", latitude: 9.3265, longitude: 12.3984 },
  { name: "Akwa Ibom", latitude: 4.9057, longitude: 7.8537 },
  { name: "Anambra", latitude: 6.2209, longitude: 6.9370 },
  { name: "Bauchi", latitude: 10.3158, longitude: 9.8442 },
  { name: "Bayelsa", latitude: 4.7719, longitude: 6.0699 },
  { name: "Benue", latitude: 7.1904, longitude: 8.1294 },
  { name: "Borno", latitude: 11.8333, longitude: 13.1500 },
  { name: "Cross River", latitude: 5.8702, longitude: 8.5988 },
  { name: "Delta", latitude: 5.7040, longitude: 5.9339 },
  { name: "Ebonyi", latitude: 6.2649, longitude: 8.0137 },
  { name: "Edo", latitude: 6.3350, longitude: 5.6037 },
  { name: "Ekiti", latitude: 7.7188, longitude: 5.3110 },
  { name: "Enugu", latitude: 6.4584, longitude: 7.5464 },
  { name: "Gombe", latitude: 10.2897, longitude: 11.1670 },
  { name: "Imo", latitude: 5.4927, longitude: 7.0265 },
  { name: "Jigawa", latitude: 12.2281, longitude: 9.5616 },
  { name: "Kaduna", latitude: 10.5105, longitude: 7.4165 },
  { name: "Kano", latitude: 12.0022, longitude: 8.5920 },
  { name: "Katsina", latitude: 12.9908, longitude: 7.6018 },
  { name: "Kebbi", latitude: 12.4539, longitude: 4.1975 },
  { name: "Kogi", latitude: 7.7337, longitude: 6.6906 },
  { name: "Kwara", latitude: 8.9669, longitude: 4.3874 },
  { name: "Lagos", latitude: 6.5244, longitude: 3.3792 },
  { name: "Nasarawa", latitude: 8.5380, longitude: 8.3420 },
  { name: "Niger", latitude: 9.9309, longitude: 5.5983 },
  { name: "Ogun", latitude: 6.9980, longitude: 3.4737 },
  { name: "Ondo", latitude: 7.2500, longitude: 5.1931 },
  { name: "Osun", latitude: 7.5629, longitude: 4.5200 },
  { name: "Oyo", latitude: 7.3775, longitude: 3.9470 },
  { name: "Plateau", latitude: 9.8965, longitude: 8.8583 },
  { name: "Rivers", latitude: 4.8156, longitude: 7.0498 },
  { name: "Sokoto", latitude: 13.0059, longitude: 5.2476 },
  { name: "Taraba", latitude: 7.9869, longitude: 10.9807 },
  { name: "Yobe", latitude: 12.0000, longitude: 11.5000 },
  { name: "Zamfara", latitude: 12.1708, longitude: 6.6643 },
  { name: "FCT Abuja", latitude: 9.0765, longitude: 7.3986 },
];

function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if ([1,2,3].includes(code)) return "Partly cloudy";
  if ([45,48].includes(code)) return "Foggy";
  if ([51,53,55,56,57].includes(code)) return "Drizzle";
  if ([61,63,65,66,67,80,81,82].includes(code)) return "Rain";
  if ([71,73,75,77,85,86].includes(code)) return "Snow";
  if ([95,96,99].includes(code)) return "Thunderstorm";
  return "Mixed conditions";
}

function BrandIcon({ icon, size = 21 }: { icon: string; size?: number }) {
  const Icon = icon === "building" ? Building2 : icon === "shield" ? ShieldCheck : icon === "truck" ? Truck : icon === "users" ? Users : icon === "warehouse" ? Package : HardHat;
  return <Icon size={size} />;
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const nav: {
  p: Page;
  label: string;
  icon: any;
}[] = [
  ["Dashboard", "Dashboard", LayoutDashboard],
  ["Projects", "Projects", Building2],
  ["Finance", "Finance", Wallet],
  ["Procurement", "Procurement", Package],
  ["Equipment", "Equipment", Truck],
  ["Staff & Attendance", "Staff & Attendance", Users],
  ["Safety", "Safety", ShieldCheck],
  ["Reports", "Reports", ClipboardList],
  ["Calendar", "Calendar", CalendarDays],
  ["Settings", "Settings", Settings],
].map(([p, label, icon]) => ({
  p: p as Page,
  label: label as string,
  icon,
}));

export default function CommandCentre() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [financeInvoices, setFinanceInvoices] = useState<FinanceInvoice[]>([]);
  const [financePayments, setFinancePayments] = useState<FinancePayment[]>([]);
  const [financeExpenses, setFinanceExpenses] = useState<FinanceExpense[]>([]);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [financeError, setFinanceError] = useState("");
  const [financeModal, setFinanceModal] = useState<"invoice" | "payment" | "expense" | null>(null);
  const [procurementOrders, setProcurementOrders] = useState<any[]>([]);
  const [loadingProcurement, setLoadingProcurement] = useState(true);
  const [procurementError, setProcurementError] = useState("");
  const [equipmentRecords, setEquipmentRecords] = useState<EquipmentRecord[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [equipmentError, setEquipmentError] = useState("");
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState("");
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("BuildPro Construction Ltd.");
  const [companyIcon, setCompanyIcon] = useState("hardhat");
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [weatherState, setWeatherState] = useState<WeatherState>(NIGERIAN_STATES.find((x) => x.name === "Lagos")!);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [safetyRecords, setSafetyRecords] = useState<SafetyIncidentRecord[]>(
    incidents.map((x) => ({ ...x, date: new Date().toISOString(), correctiveAction: "Review and close corrective action." }))
  );
  const [safetyModal, setSafetyModal] = useState(false);
  const [safetyDraft, setSafetyDraft] = useState({ project: "", severity: "Medium", text: "", status: "Open", correctiveAction: "" });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarModal, setCalendarModal] = useState(false);
  const [calendarDraft, setCalendarDraft] = useState({ title: "", date: getLocalDateString(), time: "09:00", project: "", type: "Meeting", notes: "" });
  const [reportBusy, setReportBusy] = useState("");
  const [reportNotice, setReportNotice] = useState("");
  const router = useRouter();

  /*
   * LOAD PROJECTS
   */
  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectError("");

      const response = await fetch("/api/projects", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Projects API returned ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Projects API did not return an array"
        );
      }

      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);

      setProjectError(
        "Unable to load projects from the database."
      );

      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadProcurement = async () => {
    try {
      setLoadingProcurement(true);
      setProcurementError("");

      const response = await fetch("/api/procurement", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `Procurement API returned ${response.status}`);
      }

      setProcurementOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load procurement data:", error);
      setProcurementError(
        error instanceof Error ? error.message : "Unable to load procurement data."
      );
      setProcurementOrders([]);
    } finally {
      setLoadingProcurement(false);
    }
  };

  const loadEquipment = async () => {
    try {
      setLoadingEquipment(true);
      setEquipmentError("");
      const response = await fetch("/api/equipment", { method: "GET", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `Equipment API returned ${response.status}`);
      setEquipmentRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load equipment:", error);
      setEquipmentError(error instanceof Error ? error.message : "Unable to load equipment.");
      setEquipmentRecords([]);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const updateEquipmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/equipment?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `Equipment API returned ${response.status}`);
      await loadEquipment();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update equipment status.");
    }
  };

  const updateProcurementStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/procurement?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const text = await response.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (!response.ok) {
        throw new Error(data?.error || `Procurement API returned ${response.status}`);
      }

      await loadProcurement();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update procurement status.");
    }
  };

  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      setStaffError("");
      const response = await fetch("/api/staff", { method: "GET", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `Staff API returned ${response.status}`);
      setStaffRecords(Array.isArray(data?.staff) ? data.staff : []);
      setAttendanceRecords(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (error) {
      console.error("Failed to load staff data:", error);
      setStaffError(error instanceof Error ? error.message : "Unable to load staff data.");
      setStaffRecords([]);
      setAttendanceRecords([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadWeather = async (state: WeatherState = weatherState) => {
    try {
      setWeatherLoading(true);
      setWeatherError("");
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(state.latitude));
      url.searchParams.set("longitude", String(state.longitude));
      url.searchParams.set("current", "temperature_2m,weather_code,rain,wind_speed_10m");
      url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
      url.searchParams.set("forecast_days", "5");
      url.searchParams.set("timezone", "auto");
      const response = await fetch(url.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Weather load failed", error);
      setWeatherError("Live weather is currently unavailable.");
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const saveCompanySettings = () => {
    localStorage.setItem("buildpro_settings", JSON.stringify({ companyName, companyIcon, customIcon, weatherState: weatherState.name }));
    setReportNotice("Settings saved successfully.");
    window.setTimeout(() => setReportNotice(""), 2200);
  };

  const downloadFile = (filename: string, content: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const generateReport = async (name: string) => {
    try {
      setReportBusy(name);
      setReportNotice("");
      let headers: string[] = [];
      let rows: unknown[][] = [];
      if (name === "Executive KPI Report") {
        const budget = projects.reduce((a, p) => a + Number(p.budget || 0), 0);
        const spent = projects.reduce((a, p) => a + Number(p.spent || 0), 0);
        const progress = projects.length ? Math.round(projects.reduce((a, p) => a + Number(p.progress || 0), 0) / projects.length) : 0;
        headers = ["Metric", "Value"];
        rows = [["Projects", projects.length], ["Budget", budget], ["Spent", spent], ["Budget Utilisation", `${budget ? Math.round((spent / budget) * 100) : 0}%`], ["Average Completion", `${progress}%`]];
      } else if (name === "Project Performance") {
        headers = ["Project", "Location", "Progress", "Budget", "Spent", "Status"];
        rows = projects.map(p => [p.name, p.location, `${p.progress}%`, p.budget, p.spent, p.status]);
      } else if (name === "Finance Report") {
        headers = ["Invoice", "Amount", "Paid", "Outstanding", "Due", "Status"];
        rows = financeInvoices.map(i => [i.invoice_number, i.amount, i.paid_amount, Math.max(Number(i.amount || 0) - Number(i.paid_amount || 0), 0), i.due_date, i.status]);
      } else if (name === "Procurement Report") {
        headers = ["Order", "Item", "Supplier", "Status", "Total Amount", "Expected Delivery"];
        rows = procurementOrders.map(x => [x.order_number, x.item_description, x.supplier_name, x.status, x.total_amount, x.expected_delivery_date]);
      } else if (name === "Safety Report") {
        headers = ["Incident", "Project", "Severity", "Status", "Date", "Description", "Corrective Action"];
        rows = safetyRecords.map(x => [x.id, x.project, x.severity, x.status, x.date, x.text, x.correctiveAction]);
      } else {
        headers = ["Staff", "Date", "Status", "Check In", "Check Out"];
        rows = attendanceRecords.map(a => { const person = staffRecords.find(s => s.id === a.staff_id); return [person?.name || a.staff_id, a.attendance_date, a.status, a.check_in, a.check_out]; });
      }
      const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadFile(`buildpro-${slug}.csv`, csv, "text/csv;charset=utf-8");
      setReportNotice(`${name} generated successfully.`);
    } catch (error) {
      console.error(error);
      setReportNotice("Unable to generate the report.");
    } finally {
      setReportBusy("");
    }
  };

  const addCalendarEvent = () => {
    if (!calendarDraft.title.trim() || !calendarDraft.date) return;
    const next = [{ id: crypto.randomUUID(), ...calendarDraft }, ...calendarEvents];
    setCalendarEvents(next);
    localStorage.setItem("buildpro_calendar_events", JSON.stringify(next));
    setCalendarModal(false);
    setCalendarDraft({ title: "", date: getLocalDateString(), time: "09:00", project: "", type: "Meeting", notes: "" });
  };

  const deleteCalendarEvent = (id: string) => {
    const next = calendarEvents.filter(x => x.id !== id);
    setCalendarEvents(next);
    localStorage.setItem("buildpro_calendar_events", JSON.stringify(next));
  };

  const addSafetyIncident = () => {
    if (!safetyDraft.text.trim()) return;
    const next = [{ id: `INC-${String(Date.now()).slice(-4)}`, project: safetyDraft.project || "Unassigned", severity: safetyDraft.severity, text: safetyDraft.text, status: safetyDraft.status, date: new Date().toISOString(), correctiveAction: safetyDraft.correctiveAction }, ...safetyRecords];
    setSafetyRecords(next);
    localStorage.setItem("buildpro_safety_records", JSON.stringify(next));
    setSafetyDraft({ project: "", severity: "Medium", text: "", status: "Open", correctiveAction: "" });
    setSafetyModal(false);
  };

  const updateSafetyStatus = (id: string, status: string) => {
    const next = safetyRecords.map(x => x.id === id ? { ...x, status } : x);
    setSafetyRecords(next);
    localStorage.setItem("buildpro_safety_records", JSON.stringify(next));
  };

  const loadFinance = async () => {
    try {
      setLoadingFinance(true);
      setFinanceError("");

      const response = await fetch("/api/finance", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Finance API returned ${response.status}`);
      }

      setFinanceInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
      setFinancePayments(Array.isArray(data?.payments) ? data.payments : []);
      setFinanceExpenses(Array.isArray(data?.expenses) ? data.expenses : []);
    } catch (error) {
      console.error("Failed to load finance data:", error);
      setFinanceError(
        error instanceof Error ? error.message : "Unable to load finance data."
      );
      setFinanceInvoices([]);
      setFinancePayments([]);
      setFinanceExpenses([]);
    } finally {
      setLoadingFinance(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadFinance();
    loadProcurement();
    loadEquipment();
    loadStaff();
    try {
      const saved = JSON.parse(localStorage.getItem("buildpro_settings") || "null");
      if (saved) {
        if (saved.companyName) setCompanyName(saved.companyName);
        if (saved.companyIcon) setCompanyIcon(saved.companyIcon);
        if (saved.customIcon) setCustomIcon(saved.customIcon);
        if (saved.weatherState) {
          const nextState = NIGERIAN_STATES.find(x => x.name === saved.weatherState);
          if (nextState) setWeatherState(nextState);
        }
      }
      const savedEvents = JSON.parse(localStorage.getItem("buildpro_calendar_events") || "[]");
      if (Array.isArray(savedEvents)) setCalendarEvents(savedEvents);
      const savedSafety = JSON.parse(localStorage.getItem("buildpro_safety_records") || "null");
      if (Array.isArray(savedSafety) && savedSafety.length) setSafetyRecords(savedSafety);
    } catch {}
    loadWeather();

    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return { user: null };
        return response.json();
      })
      .then((data) => {
        if (mounted) setAuthEmail(data?.user?.email ?? null);
      })
      .catch(() => {
        if (mounted) setAuthEmail(null);
      });

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthEmail(session?.user?.email ?? null);
    });

    const channel = supabase
      .channel("buildpro-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => loadProjects())
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => loadFinance())
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => loadFinance())
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, () => loadFinance())
      .on("postgres_changes", { event: "*", schema: "public", table: "procurement_orders" }, () => loadProcurement())
      .on("postgres_changes", { event: "*", schema: "public", table: "equipment" }, () => loadEquipment())
      .on("postgres_changes", { event: "*", schema: "public", table: "staff" }, () => loadStaff())
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => loadStaff())
      .subscribe();

    return () => {
      mounted = false;
      authSubscription.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    loadWeather(weatherState);
  }, [weatherState.name]);

  const signOut = async () => {
    setAuthEmail(null);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("BuildPro sign-out request failed:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const go = (p: Page) => {
    setSelected(null);
    setPage(p);
    setMobile(false);
  };

  return (
    <div className="min-h-screen">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[235px] border-r border-[#172536] bg-[#07101b] transition-transform lg:translate-x-0 ${
          mobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center gap-3 border-b border-[#172536] px-5">
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-[#1769e0]">
            {customIcon ? <img src={customIcon} alt="Company icon" className="h-full w-full object-cover" /> : <BrandIcon icon={companyIcon} size={21} />}
          </div>

          <div>
            <b>{companyName.replace(/\s+Ltd\.?$/i, "")}</b>

            <div className="text-[8px] font-bold tracking-[.18em] text-[#8494a8]">
              CONSTRUCTION
            </div>
          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {nav.map(({ p, label, icon: Icon }) => (
            <button
              key={p}
              onClick={() => go(p)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] ${
                page === p
                  ? "bg-[#1769e0] text-white"
                  : "text-[#a0afc0] hover:bg-[#0e1b2a]"
              }`}
            >
              <Icon size={17} />

              <span className="flex-1">{label}</span>

            </button>
          ))}
        </nav>


      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="lg:pl-[235px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#172536] bg-[#050b14]/95 px-4 md:px-7">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>

            <div>
              <h1 className="text-[18px] font-bold">
                {page === "Dashboard"
                  ? "EXECUTIVE COMMAND CENTRE"
                  : page.toUpperCase()}
              </h1>

              <p className="text-[10px] text-[#8191a6]">
                {page === "Dashboard"
                  ? "Real-time overview of company performance"
                  : "BuildPro Construction management module"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden rounded-full bg-[#0b241b] px-3 py-1.5 text-[#4be28c] md:inline-flex">
              ● Live
            </span>

            {authEmail ? (
              <button
                type="button"
                onClick={signOut}
                className="rounded border border-[#26394d] px-3 py-1.5 text-[10px] font-semibold hover:bg-[#0e1b2a]"
              >
                {`Sign out (${authEmail})`}
              </button>
            ) : (
              <a
                href="/login"
                className="rounded border border-[#26394d] px-3 py-1.5 text-[10px] font-semibold hover:bg-[#0e1b2a]"
              >
                Sign in
              </a>
            )}

            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#26384d] text-[10px] font-bold">
              {authEmail ? authEmail.slice(0, 2).toUpperCase() : "GU"}
            </span>
          </div>
        </header>

        {/* MAIN CONTENT */}

        <main className="p-4 md:p-6 xl:p-7">
          {selected ? (
            <ProjectDetail
              project={selected}
              back={() => setSelected(null)}
              onUpdated={(updated) => {
                setSelected(updated);
                loadProjects();
              }}
              onDeleted={() => {
                setSelected(null);
                loadProjects();
              }}
            />
          ) : page === "Dashboard" ? (
            <Dashboard
              projects={projects}
              loading={loadingProjects}
              error={projectError}
              onProject={setSelected}
              go={go}
              financeInvoices={financeInvoices}
              loadingFinance={loadingFinance}
              equipmentRecords={equipmentRecords}
              loadingEquipment={loadingEquipment}
              staffRecords={staffRecords}
              attendanceRecords={attendanceRecords}
              loadingStaff={loadingStaff}
              weatherState={weatherState}
              weather={weather}
              weatherLoading={weatherLoading}
              weatherError={weatherError}
            />
          ) : (
            <Module
              page={page}
              projects={projects}
              loading={loadingProjects}
              error={projectError}
              reloadProjects={loadProjects}
              onSelectProject={setSelected}
              financeInvoices={financeInvoices}
              financePayments={financePayments}
              financeExpenses={financeExpenses}
              loadingFinance={loadingFinance}
              financeError={financeError}
              reloadFinance={loadFinance}
              procurementOrders={procurementOrders}
              loadingProcurement={loadingProcurement}
              procurementError={procurementError}
              refreshProcurement={loadProcurement}
              updateProcurementStatus={updateProcurementStatus}
              equipmentRecords={equipmentRecords}
              loadingEquipment={loadingEquipment}
              equipmentError={equipmentError}
              refreshEquipment={loadEquipment}
              updateEquipmentStatus={updateEquipmentStatus}
              staffRecords={staffRecords}
              attendanceRecords={attendanceRecords}
              loadingStaff={loadingStaff}
              staffError={staffError}
              refreshStaff={loadStaff}
              safetyRecords={safetyRecords}
              setSafetyRecords={setSafetyRecords}
              safetyModal={safetyModal}
              setSafetyModal={setSafetyModal}
              safetyDraft={safetyDraft}
              setSafetyDraft={setSafetyDraft}
              addSafetyIncident={addSafetyIncident}
              updateSafetyStatus={updateSafetyStatus}
              reportBusy={reportBusy}
              reportNotice={reportNotice}
              generateReport={generateReport}
              calendarEvents={calendarEvents}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              calendarModal={calendarModal}
              setCalendarModal={setCalendarModal}
              calendarDraft={calendarDraft}
              setCalendarDraft={setCalendarDraft}
              addCalendarEvent={addCalendarEvent}
              deleteCalendarEvent={deleteCalendarEvent}
              companyName={companyName}
              setCompanyName={setCompanyName}
              companyIcon={companyIcon}
              setCompanyIcon={setCompanyIcon}
              customIcon={customIcon}
              setCustomIcon={setCustomIcon}
              saveCompanySettings={saveCompanySettings}
              weatherState={weatherState}
              setWeatherState={setWeatherState}
              weather={weather}
              NIGERIAN_STATES={NIGERIAN_STATES}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  projects,
  loading,
  error,
  onProject,
  go,
  financeInvoices,
  loadingFinance,
  equipmentRecords,
  loadingEquipment,
  staffRecords,
  attendanceRecords,
  loadingStaff,
  weatherState,
  weather,
  weatherLoading,
  weatherError,
}: {
  projects: Project[];
  loading: boolean;
  error: string;
  onProject: (p: Project) => void;
  go: (p: Page) => void;
  financeInvoices: FinanceInvoice[];
  loadingFinance: boolean;
  equipmentRecords: EquipmentRecord[];
  loadingEquipment: boolean;
  staffRecords: StaffRecord[];
  attendanceRecords: AttendanceRecord[];
  loadingStaff: boolean;
  weatherState: WeatherState;
  weather: any;
  weatherLoading: boolean;
  weatherError: string;
}) {
  // All dashboard project KPIs are calculated from the Supabase-backed
  // projects prop so changes made in Projects immediately flow through.
  const activeProjects = projects.filter(
    (p) => p.status !== "Completed"
  ).length;

  const onTrackProjects = projects.filter(
    (p) => p.status === "On Track"
  ).length;

  const delayedProjects = projects.filter(
    (p) => p.status === "Delayed"
  ).length;

  const atRiskProjects = projects.filter(
    (p) => p.status === "At Risk"
  ).length;

  const totalBudget = projects.reduce(
    (sum, p) => sum + Number(p.budget || 0),
    0
  );

  const totalSpent = projects.reduce(
    (sum, p) => sum + Number(p.spent || 0),
    0
  );

  const budgetRemaining = Math.max(totalBudget - totalSpent, 0);

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (sum, p) => sum + Number(p.progress || 0),
            0
          ) / projects.length
        )
      : 0;

  const budgetUtilisation =
    totalBudget > 0
      ? Math.round((totalSpent / totalBudget) * 100)
      : 0;

  const outstandingInvoices = financeInvoices.reduce((sum, invoice) => {
    const amount = Number(invoice.amount || 0);
    const paid = Number(invoice.paid_amount || 0);
    return sum + Math.max(amount - paid, 0);
  }, 0);

  const outstandingInvoiceCount = financeInvoices.filter((invoice) =>
    Math.max(Number(invoice.amount || 0) - Number(invoice.paid_amount || 0), 0) > 0
  ).length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Kpi
          title="ACTIVE PROJECTS"
          value={loading ? "..." : String(activeProjects)}
          sub="From database"
          color="green"
        />

        <Kpi
          title="DELAYED PROJECTS"
          value={loading ? "..." : String(delayedProjects)}
          sub={
            delayedProjects > 0
              ? `${delayedProjects} require attention`
              : "No delayed projects"
          }
          color={delayedProjects > 0 ? "red" : "green"}
        />

        <Kpi
          title="PROJECT COMPLETION"
          value={loading ? "..." : `${averageProgress}%`}
          sub="Average across projects"
          color="green"
        />

        <Kpi
          title="BUDGET UTILISATION"
          value={loading ? "..." : `${budgetUtilisation}%`}
          sub={
            loading
              ? "Loading..."
              : `${money(totalSpent)} / ${money(totalBudget)}`
          }
          color="green"
        />

        <Kpi
          title="AT RISK PROJECTS"
          value={loading ? "..." : String(atRiskProjects)}
          sub={
            atRiskProjects > 0
              ? "Requires monitoring"
              : "No projects at risk"
          }
          color={atRiskProjects > 0 ? "amber" : "green"}
        />

        <Kpi
          title="BUDGET REMAINING"
          value={loading ? "..." : money(budgetRemaining)}
          sub="Across all projects"
          color={budgetRemaining >= 0 ? "green" : "red"}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[#5b2626] bg-[#241214] p-4 text-xs text-[#ff7777]">
          <b>Database connection problem</b>

          <p className="mt-1 text-[#d78d8d]">
            {error}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1fr_.8fr]">
        <Panel
          title="PROJECT PERFORMANCE"
          action={() => go("Projects")}
        >
          {loading ? (
            <div className="py-10 text-center text-xs text-[#8191a6]">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#8191a6]">
              No projects found.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onProject(p)}
                  className="block w-full text-left"
                >
                  <ProjectRow {...p} />
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="BUDGET VS ACTUAL">
          <Bar projects={projects} />
        </Panel>

        <Panel title="PROJECTS BY STATUS">
          <Donut projects={projects} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title={`WEATHER • ${weatherState.name.toUpperCase()}`} action={() => go("Settings")}>
          {weatherLoading ? (
            <div className="py-8 text-center text-xs text-[#8191a6]">Loading live forecast...</div>
          ) : weatherError ? (
            <div className="py-8 text-center text-xs text-[#ff8c8c]">{weatherError}</div>
          ) : weather?.current ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#0d2237]">
                  <CloudRain size={28} className="text-[#63b3ff]" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(weather.current.temperature_2m)}°C</div>
                  <div className="text-[11px] text-[#9db0c5]">{weatherLabel(Number(weather.current.weather_code))}</div>
                  <div className="text-[10px] text-[#72849a]">Rain {Number(weather.current.rain || 0).toFixed(1)} mm • Wind {Math.round(Number(weather.current.wind_speed_10m || 0))} km/h</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {(weather.daily?.time || []).map((day: string, i: number) => (
                  <div key={day} className="rounded-lg border border-[#17304a] bg-[#081422] p-2 text-center">
                    <div className="text-[9px] text-[#6f8197]">{new Date(day).toLocaleDateString("en-NG", { weekday: "short" })}</div>
                    <div className="mt-1 text-[11px] font-semibold">{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                    <div className="text-[9px] text-[#6f8197]">{weather.daily.precipitation_probability_max[i]}% rain</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel
          title="EQUIPMENT STATUS"
          action={() => go("Equipment")}
        >
          <EquipmentMini equipmentRecords={equipmentRecords} loading={loadingEquipment} />
        </Panel>

        <Panel
          title="STAFF ATTENDANCE"
          action={() => go("Staff & Attendance")}
        >
          <Attendance staffRecords={staffRecords} attendanceRecords={attendanceRecords} loading={loadingStaff} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Panel
          title="OUTSTANDING INVOICES"
          action={() => go("Finance")}
        >
          <Invoices invoices={financeInvoices} loading={loadingFinance} projects={projects} />
        </Panel>
      </div>

      <section className="mt-4 rounded-xl border border-[#17283a] bg-[#091320] p-5">
        <h2 className="text-[12px] font-bold">
          COMPANY KPI OVERVIEW
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            [
              "Total Project Budget",
              loading ? "..." : money(totalBudget),
              "From database",
            ],
            [
              "Total Spent",
              loading ? "..." : money(totalSpent),
              "From database",
            ],
            [
              "Budget Remaining",
              loading ? "..." : money(budgetRemaining),
              "Budget less spend",
            ],
            [
              "Average Completion",
              loading ? "..." : `${averageProgress}%`,
              "Across projects",
            ],
            [
              "On Track",
              loading ? "..." : String(onTrackProjects),
              "Projects",
            ],
            [
              "Needs Attention",
              loading ? "..." : String(delayedProjects + atRiskProjects),
              "Delayed + at risk",
            ],
          ].map(([a, b, c]) => (
            <div
              key={a}
              className="rounded-lg border border-[#18293b] bg-[#0b1623] p-4"
            >
              <span className="text-[9px] text-[#8192a7]">
                {a}
              </span>

              <b className="mt-2 block text-xl">
                {b}
              </b>

              <span className="text-[9px] text-[#39dc7d]">
                {c}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* =========================================================
   MODULES
========================================================= */

function Module({
  page,
  projects,
  loading,
  error,
  reloadProjects,
  onSelectProject,
  financeInvoices,
  financePayments,
  financeExpenses,
  loadingFinance,
  financeError,
  reloadFinance,
  procurementOrders,
  loadingProcurement,
  procurementError,
  refreshProcurement,
  updateProcurementStatus,
  equipmentRecords,
  loadingEquipment,
  equipmentError,
  refreshEquipment,
  updateEquipmentStatus,
  staffRecords,
  attendanceRecords,
  loadingStaff,
  staffError,
  refreshStaff,
  safetyRecords,
  setSafetyRecords,
  safetyModal,
  setSafetyModal,
  safetyDraft,
  setSafetyDraft,
  addSafetyIncident,
  updateSafetyStatus,
  reportBusy,
  reportNotice,
  generateReport,
  calendarEvents,
  calendarMonth,
  setCalendarMonth,
  calendarModal,
  setCalendarModal,
  calendarDraft,
  setCalendarDraft,
  addCalendarEvent,
  deleteCalendarEvent,
  companyName,
  setCompanyName,
  companyIcon,
  setCompanyIcon,
  customIcon,
  setCustomIcon,
  saveCompanySettings,
  weatherState,
  setWeatherState,
  weather,
  NIGERIAN_STATES,
}: {
  page: Page;
  projects: Project[];
  loading: boolean;
  error: string;
  reloadProjects: () => Promise<void>;
  onSelectProject: (project: Project) => void;
  financeInvoices: FinanceInvoice[];
  financePayments: FinancePayment[];
  financeExpenses: FinanceExpense[];
  loadingFinance: boolean;
  financeError: string;
  reloadFinance: () => Promise<void>;
  procurementOrders: any[];
  loadingProcurement: boolean;
  procurementError: string;
  refreshProcurement: () => Promise<void>;
  updateProcurementStatus: (id: string, status: string) => Promise<void>;
  equipmentRecords: EquipmentRecord[];
  loadingEquipment: boolean;
  equipmentError: string;
  refreshEquipment: () => Promise<void>;
  updateEquipmentStatus: (id: string, status: string) => Promise<void>;
  staffRecords: StaffRecord[];
  attendanceRecords: AttendanceRecord[];
  loadingStaff: boolean;
  staffError: string;
  refreshStaff: () => Promise<void>;
  safetyRecords: SafetyIncidentRecord[];
  setSafetyRecords: React.Dispatch<React.SetStateAction<SafetyIncidentRecord[]>>;
  safetyModal: boolean;
  setSafetyModal: React.Dispatch<React.SetStateAction<boolean>>;
  safetyDraft: { project: string; severity: string; text: string; status: string; correctiveAction: string };
  setSafetyDraft: React.Dispatch<React.SetStateAction<{ project: string; severity: string; text: string; status: string; correctiveAction: string }>>;
  addSafetyIncident: () => void;
  updateSafetyStatus: (id: string, status: string) => void;
  reportBusy: string;
  reportNotice: string;
  generateReport: (name: string) => Promise<void>;
  calendarEvents: CalendarEvent[];
  calendarMonth: Date;
  setCalendarMonth: React.Dispatch<React.SetStateAction<Date>>;
  calendarModal: boolean;
  setCalendarModal: React.Dispatch<React.SetStateAction<boolean>>;
  calendarDraft: { title: string; date: string; time: string; project: string; type: string; notes: string };
  setCalendarDraft: React.Dispatch<React.SetStateAction<{ title: string; date: string; time: string; project: string; type: string; notes: string }>>;
  addCalendarEvent: () => void;
  deleteCalendarEvent: (id: string) => void;
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  companyIcon: string;
  setCompanyIcon: React.Dispatch<React.SetStateAction<string>>;
  customIcon: string | null;
  setCustomIcon: React.Dispatch<React.SetStateAction<string | null>>;
  saveCompanySettings: () => void;
  weatherState: WeatherState;
  setWeatherState: React.Dispatch<React.SetStateAction<WeatherState>>;
  weather: any;
  NIGERIAN_STATES: WeatherState[];
}) {
  const [modal, setModal] = useState(false);
  const [equipmentEdit, setEquipmentEdit] = useState<EquipmentRecord | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [financeModal, setFinanceModal] = useState<"invoice" | "payment" | "expense" | null>(null);
  const [staffEdit, setStaffEdit] = useState<StaffRecord | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(() => getLocalDateString());

  const recordAttendance = async (staffId: string, status: string, existingCheckIn?: string | null, checkOut?: string | null) => {
    const today = getLocalDateString();
    const checkIn = existingCheckIn || (status === "Present" ? new Date().toISOString() : null);
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "attendance", staff_id: staffId, attendance_date: today, status, check_in: checkIn, check_out: checkOut ?? null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save attendance.");
      await refreshStaff();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save attendance.");
    }
  };

  /*
   * PROJECT FORM
   */

  const [savingProject, setSavingProject] =
    useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    location: "",
    budget: "",
    manager: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "On Track",
    progress: "0",
  });

  const updateProjectForm = (
    field: keyof typeof projectForm,
    value: string
  ) => {
    setProjectForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: "",
      location: "",
      budget: "",
      manager: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "On Track",
      progress: "0",
    });
  };

  const createProject = async () => {
    if (!projectForm.name.trim()) {
      alert("Project name is required.");
      return;
    }

    const progress = Number(projectForm.progress || 0);
    const budget = Number(projectForm.budget || 0);

    if (progress < 0 || progress > 100) {
      alert("Progress must be between 0 and 100.");
      return;
    }

    if (budget < 0) {
      alert("Budget cannot be negative.");
      return;
    }

    try {
      setSavingProject(true);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectForm.name.trim(),
          location: projectForm.location.trim(),
          budget,
          spent: 0,
          manager: projectForm.manager.trim(),
          description: projectForm.description.trim(),
          start_date: projectForm.start_date || null,
          end_date: projectForm.end_date || null,
          status: projectForm.status,
          progress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "The project could not be created."
        );
      }

      setModal(false);
      resetProjectForm();

      await reloadProjects();

      alert("Project created successfully.");
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create project."
      );
    } finally {
      setSavingProject(false);
    }
  };

  /* =====================================================
     PROJECTS
  ===================================================== */

  if (page === "Projects") {
    return (
      <>
        <SectionHeader
          title="Projects"
          add={() => setModal(true)}
        />

        {error && (
          <div className="mb-4 rounded-lg border border-[#5b2626] bg-[#241214] p-4 text-xs text-[#ff7777]">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            className="field max-w-md"
            placeholder="Search projects..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="field w-auto max-w-[180px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>

        {(() => {
          const filteredProjects = projects.filter(
            (p) =>
              p.name
                .toLowerCase()
                .includes(q.toLowerCase()) &&
              (statusFilter === "All" ||
                p.status === statusFilter)
          );

          if (loading) {
            return (
              <div className="rounded-lg border border-[#17283a] bg-[#091320] p-10 text-center text-xs text-[#8191a6]">
                Loading projects from database...
              </div>
            );
          }

          if (projects.length === 0) {
            return (
              <div className="rounded-lg border border-[#17283a] bg-[#091320] p-10 text-center text-xs text-[#8191a6]">
                No projects found.
              </div>
            );
          }

          if (filteredProjects.length === 0) {
            return (
              <div className="rounded-lg border border-[#17283a] bg-[#091320] p-10 text-center text-xs text-[#8191a6]">
                No projects match your search or filter.
              </div>
            );
          }

          return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="block w-full text-left"
                >
                  <Panel title={p.name}>
                    <p className="text-[10px] text-[#8191a6]">
                      {p.location} • {p.manager}
                    </p>

                    <div className="mt-4 flex justify-between text-xs">
                      <b>
                        {p.progress}% complete
                      </b>

                      <Status s={p.status} />
                    </div>

                    <div className="mt-2 h-2 rounded bg-[#172536]">
                      <div
                        className="h-2 rounded bg-[#3188e8]"
                        style={{
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-[10px] text-[#8191a6]">
                      Budget {money(Number(p.budget))} • Spent{" "}
                      {money(Number(p.spent))}
                    </p>

                    {"start_date" in p && (
                      <p className="mt-2 text-[9px] text-[#64778d]">
                        Start:{" "}
                        {String(
                          (p as any).start_date || "-"
                        )}{" "}
                        • End:{" "}
                        {String(
                          (p as any).end_date || "-"
                        )}
                      </p>
                    )}
                  </Panel>
                </button>
              ))}
            </div>
          );
        })()}

        {/* =================================================
            CREATE PROJECT MODAL
        ================================================= */}

        {modal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <b className="text-sm">
                    Create Project
                  </b>

                  <p className="mt-1 text-[10px] text-[#8191a6]">
                    Add a new construction project
                    to the database.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!savingProject) {
                      setModal(false);
                    }
                  }}
                  disabled={savingProject}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {/* PROJECT NAME */}

                <label className="block text-[10px] text-[#8191a6] sm:col-span-2">
                  Project Name

                  <input
                    className="field"
                    placeholder="Enter project name"
                    value={projectForm.name}
                    onChange={(e) =>
                      updateProjectForm(
                        "name",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* LOCATION */}

                <label className="block text-[10px] text-[#8191a6]">
                  Location

                  <input
                    className="field"
                    placeholder="Enter location"
                    value={projectForm.location}
                    onChange={(e) =>
                      updateProjectForm(
                        "location",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* MANAGER */}

                <label className="block text-[10px] text-[#8191a6]">
                  Project Manager

                  <input
                    className="field"
                    placeholder="Enter manager"
                    value={projectForm.manager}
                    onChange={(e) =>
                      updateProjectForm(
                        "manager",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* BUDGET */}

                <label className="block text-[10px] text-[#8191a6]">
                  Budget

                  <input
                    className="field"
                    type="number"
                    min="0"
                    placeholder="Enter budget"
                    value={projectForm.budget}
                    onChange={(e) =>
                      updateProjectForm(
                        "budget",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* PROGRESS */}

                <label className="block text-[10px] text-[#8191a6]">
                  Progress (%)

                  <input
                    className="field"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={projectForm.progress}
                    onChange={(e) =>
                      updateProjectForm(
                        "progress",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* STATUS */}

                <label className="block text-[10px] text-[#8191a6]">
                  Status

                  <select
                    className="field"
                    value={projectForm.status}
                    onChange={(e) =>
                      updateProjectForm(
                        "status",
                        e.target.value
                      )
                    }
                  >
                    <option value="On Track">
                      On Track
                    </option>

                    <option value="At Risk">
                      At Risk
                    </option>

                    <option value="Delayed">
                      Delayed
                    </option>
                  </select>
                </label>

                {/* START DATE */}

                <label className="block text-[10px] text-[#8191a6]">
                  Start Date

                  <input
                    className="field"
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) =>
                      updateProjectForm(
                        "start_date",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* END DATE */}

                <label className="block text-[10px] text-[#8191a6]">
                  End Date

                  <input
                    className="field"
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) =>
                      updateProjectForm(
                        "end_date",
                        e.target.value
                      )
                    }
                  />
                </label>

                {/* DESCRIPTION */}

                <label className="block text-[10px] text-[#8191a6] sm:col-span-2">
                  Description

                  <textarea
                    className="field min-h-[80px]"
                    placeholder="Describe the project..."
                    value={projectForm.description}
                    onChange={(e) =>
                      updateProjectForm(
                        "description",
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>

              {/* BUTTONS */}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (!savingProject) {
                      setModal(false);
                    }
                  }}
                  disabled={savingProject}
                  className="rounded border border-[#26394d] px-4 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={createProject}
                  disabled={savingProject}
                  className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  {savingProject
                    ? "Creating..."
                    : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* =====================================================
     TABLE DATA
  ===================================================== */

  const table: Record<string, [string, string][]> = {
    Procurement: procurementOrders.map((x) => [
      x.order_number,
      `${x.item_description} • ${x.status} • ${money(Number(x.total_amount || 0))}`,
    ]),

    Equipment: equipment.map((x) => [
      x.name,
      `${x.status} • ${x.project}`,
    ]),

    "Staff & Attendance": staff.map((x) => [
      x.name,
      `${x.role} • ${x.status}`,
    ]),

    Safety: incidents.map((x) => [
      x.id,
      `${x.project} • ${x.severity} • ${x.text} • ${x.status}`,
    ]),

  };

  /* =====================================================
     SAFETY
  ===================================================== */

  if (page === "Safety") {
    const open = safetyRecords.filter(x => x.status !== "Closed").length;
    const critical = safetyRecords.filter(x => ["High", "Critical"].includes(x.severity) && x.status !== "Closed").length;
    const resolved = safetyRecords.filter(x => x.status === "Closed").length;
    return (
      <>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-xl font-bold">Safety & HSE</h2><p className="text-[10px] text-[#8191a6]">Monitor incidents, severity, corrective actions and close-out.</p></div>
          <button onClick={() => setSafetyModal(true)} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold"><Plus size={14} className="mr-1 inline" /> Report Incident</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi title="TOTAL INCIDENTS" value={String(safetyRecords.length)} sub="Recorded safety events" color="green" />
          <Kpi title="OPEN" value={String(open)} sub="Awaiting close-out" color="amber" />
          <Kpi title="HIGH / CRITICAL" value={String(critical)} sub="Requires management attention" color="red" />
          <Kpi title="RESOLVED" value={String(resolved)} sub="Closed incidents" color="green" />
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Panel title="INCIDENT LOG">
            <div className="space-y-3">
              {safetyRecords.map(x => (
                <div key={x.id} className="rounded-xl border border-[#183049] bg-[#081420] p-4">
                  <div className="flex flex-wrap items-center gap-2"><b>{x.id}</b><span className="rounded-full border border-[#26394d] px-2 py-1 text-[9px]">{x.project}</span><span className="rounded-full px-2 py-1 text-[9px]" style={{ background: x.severity === "High" || x.severity === "Critical" ? "#3a1619" : x.severity === "Medium" ? "#392b13" : "#112c1f" }}>{x.severity}</span><span className="ml-auto text-[9px] text-[#6f8197]">{new Date(x.date).toLocaleDateString("en-NG")}</span></div>
                  <p className="mt-2 text-xs text-[#d7e0ea]">{x.text}</p>
                  <p className="mt-2 text-[10px] text-[#8191a6]">Corrective action: {x.correctiveAction || "Not recorded"}</p>
                  <div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-[#8191a6]">Status: {x.status}</span><select className="rounded border border-[#26394d] bg-[#0b1622] px-2 py-1 text-[10px]" value={x.status} onChange={e => updateSafetyStatus(x.id, e.target.value)}><option>Open</option><option>Investigating</option><option>Closed</option></select></div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="SAFETY SNAPSHOT">
            <div className="space-y-3">
              {["High/Critical", "Medium", "Low"].map(level => { const count = level === "High/Critical" ? safetyRecords.filter(x => ["High", "Critical"].includes(x.severity)).length : safetyRecords.filter(x => x.severity === level).length; const pct = safetyRecords.length ? Math.round((count/safetyRecords.length)*100) : 0; return <div key={level}><div className="flex justify-between text-[10px]"><span>{level}</span><span>{count}</span></div><div className="mt-1 h-2 rounded-full bg-[#142437]"><div className="h-2 rounded-full bg-[#1769e0]" style={{ width: `${pct}%` }} /></div></div>; })}
              <div className="rounded-lg border border-[#17304a] bg-[#0b1724] p-3 text-[10px] text-[#9aabc0]">Use the incident log to keep corrective actions visible until every issue is closed.</div>
            </div>
          </Panel>
        </div>
        {safetyModal && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5"><div className="flex justify-between"><b>Report Safety Incident</b><button onClick={() => setSafetyModal(false)}><X size={18}/></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[10px] text-[#8191a6]">Project<select className="field" value={safetyDraft.project} onChange={e=>setSafetyDraft({...safetyDraft,project:e.target.value})}><option value="">Select project</option>{projects.map(p=><option key={p.id}>{p.name}</option>)}</select></label><label className="text-[10px] text-[#8191a6]">Severity<select className="field" value={safetyDraft.severity} onChange={e=>setSafetyDraft({...safetyDraft,severity:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label><label className="text-[10px] text-[#8191a6] sm:col-span-2">Description<textarea className="field min-h-[90px]" value={safetyDraft.text} onChange={e=>setSafetyDraft({...safetyDraft,text:e.target.value})}/></label><label className="text-[10px] text-[#8191a6] sm:col-span-2">Corrective Action<textarea className="field min-h-[70px]" value={safetyDraft.correctiveAction} onChange={e=>setSafetyDraft({...safetyDraft,correctiveAction:e.target.value})}/></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setSafetyModal(false)} className="rounded border border-[#26394d] px-4 py-2 text-xs">Cancel</button><button onClick={addSafetyIncident} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold">Save Incident</button></div></div></div>}
      </>
    );
  }

  /* =====================================================
     REPORTS
  ===================================================== */

  if (page === "Reports") {
    const reports = ["Executive KPI Report","Project Performance","Finance Report","Procurement Report","Safety Report","Attendance Report"];
    return (
      <>
        <SectionHeader title="Reports" />
        <div className="mb-4 rounded-xl border border-[#17304a] bg-[#081420] p-4 text-[11px] text-[#98aac0]"><FileText size={17} className="mr-2 inline text-[#63b3ff]" /> Reports are generated from the current live data in BuildPro and downloaded as CSV files for Excel.</div>
        {reportNotice && <div className="mb-4 rounded-lg border border-[#173e2a] bg-[#0d2419] p-3 text-xs text-[#64df91]">{reportNotice}</div>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map(x => <button key={x} disabled={!!reportBusy} onClick={() => generateReport(x)} className="rounded-xl border border-[#17304a] bg-[#091320] p-5 text-left hover:border-[#3188e8] disabled:opacity-60"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#0d2237]"><BarChart3 size={20} className="text-[#63b3ff]"/></div><Download size={16} className="text-[#718399]"/></div><b className="mt-4 block">{x}</b><span className="mt-1 block text-[10px] text-[#8191a6]">{reportBusy === x ? "Generating..." : "Download current report →"}</span></button>)}
        </div>
      </>
    );
  }

  /* =====================================================
     CALENDAR
  ===================================================== */

  if (page === "Calendar") {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, i) => { const day = i - firstDay + 1; const date = day > 0 && day <= daysInMonth ? `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : null; return { day, date }; });
    const monthEvents = calendarEvents.filter(e => e.date.startsWith(`${year}-${String(month+1).padStart(2,"0")}`));
    return (
      <>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Project Calendar</h2><p className="text-[10px] text-[#8191a6]">Plan meetings, inspections, milestones and site activities.</p></div><button onClick={()=>setCalendarModal(true)} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold"><Plus size={14} className="mr-1 inline"/> Add Event</button></div>
        <Panel title={calendarMonth.toLocaleDateString("en-NG", { month: "long", year: "numeric" }).toUpperCase()}>
          <div className="mb-3 flex justify-end gap-2"><button className="rounded border border-[#26394d] p-2" onClick={()=>setCalendarMonth(new Date(year,month-1,1))}><ChevronLeft size={15}/></button><button className="rounded border border-[#26394d] p-2" onClick={()=>setCalendarMonth(new Date(year,month+1,1))}><ChevronRight size={15}/></button></div>
          <div className="grid grid-cols-7 gap-1 text-[9px] text-[#6f8197]">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="p-2 text-center">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{cells.map((cell,i)=><div key={i} className={`min-h-24 rounded-lg border p-2 ${cell.date ? "border-[#17304a] bg-[#081420]" : "border-transparent bg-transparent"}`}>{cell.date && <><div className="text-[10px] font-semibold">{cell.day}</div><div className="mt-2 space-y-1">{calendarEvents.filter(e=>e.date===cell.date).slice(0,2).map(e=><div key={e.id} className="rounded bg-[#0e2941] px-1.5 py-1 text-[8px] text-[#b9d7f2]">{e.time} {e.title}</div>)}</div></>}</div>)}</div>
        </Panel>
        <div className="mt-4"><Panel title="UPCOMING EVENTS">{monthEvents.length ? <div className="space-y-2">{monthEvents.sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(e=><div key={e.id} className="flex items-center gap-3 rounded-lg border border-[#17304a] bg-[#081420] p-3"><CalendarDays size={16} className="text-[#63b3ff]"/><div className="flex-1"><b className="text-xs">{e.title}</b><div className="text-[10px] text-[#8191a6]">{e.date} • {e.time} • {e.project || "Company"} • {e.type}</div>{e.notes&&<div className="mt-1 text-[10px] text-[#6f8197]">{e.notes}</div>}</div><button onClick={()=>deleteCalendarEvent(e.id)} className="text-[#ff7a7a]"><X size={15}/></button></div>)}</div> : <div className="py-8 text-center text-xs text-[#718399]">No events for this month.</div>}</Panel></div>
        {calendarModal && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5"><div className="flex justify-between"><b>Add Calendar Event</b><button onClick={()=>setCalendarModal(false)}><X size={18}/></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[10px] text-[#8191a6] sm:col-span-2">Title<input className="field" value={calendarDraft.title} onChange={e=>setCalendarDraft({...calendarDraft,title:e.target.value})}/></label><label className="text-[10px] text-[#8191a6]">Date<input className="field" type="date" value={calendarDraft.date} onChange={e=>setCalendarDraft({...calendarDraft,date:e.target.value})}/></label><label className="text-[10px] text-[#8191a6]">Time<input className="field" type="time" value={calendarDraft.time} onChange={e=>setCalendarDraft({...calendarDraft,time:e.target.value})}/></label><label className="text-[10px] text-[#8191a6]">Type<select className="field" value={calendarDraft.type} onChange={e=>setCalendarDraft({...calendarDraft,type:e.target.value})}><option>Meeting</option><option>Inspection</option><option>Milestone</option><option>Site Visit</option><option>Deadline</option></select></label><label className="text-[10px] text-[#8191a6]">Project<select className="field" value={calendarDraft.project} onChange={e=>setCalendarDraft({...calendarDraft,project:e.target.value})}><option value="">Company</option>{projects.map(p=><option key={p.id}>{p.name}</option>)}</select></label><label className="text-[10px] text-[#8191a6] sm:col-span-2">Notes<textarea className="field min-h-[70px]" value={calendarDraft.notes} onChange={e=>setCalendarDraft({...calendarDraft,notes:e.target.value})}/></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setCalendarModal(false)} className="rounded border border-[#26394d] px-4 py-2 text-xs">Cancel</button><button onClick={addCalendarEvent} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold">Save Event</button></div></div></div>}
      </>
    );
  }

  /* =====================================================
     SETTINGS
  ===================================================== */

  if (page === "Settings") {
    const iconMap: Record<string, any> = { hardhat: HardHat, building: Building2, shield: ShieldCheck, truck: Truck, users: Users, warehouse: Package };
    const Icon = iconMap[companyIcon] || HardHat;
    return (
      <>
        <SectionHeader title="Settings" />
        {reportNotice && <div className="mb-4 rounded-lg border border-[#173e2a] bg-[#0d2419] p-3 text-xs text-[#64df91]">{reportNotice}</div>}
        <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <Panel title="COMPANY SETTINGS">
            <label className="block text-xs text-[#9db0c5]">Company Name<input className="field" value={companyName} onChange={e=>setCompanyName(e.target.value)} /></label>
            <div className="mt-5"><div className="mb-2 text-xs text-[#9db0c5]">Company Icon</div><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Object.entries(iconMap).map(([key, C])=><button key={key} onClick={()=>setCompanyIcon(key)} className={`grid h-14 place-items-center rounded-lg border ${companyIcon===key ? "border-[#3188e8] bg-[#0e2941]" : "border-[#26394d] bg-[#0b1622]"}`}><C size={22}/></button>)}</div></div>
            <label className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#26394d] p-3 text-[10px] text-[#91a4bb]"><ImagePlus size={16}/><span>Upload a custom company icon</span><input className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>{ const file=e.target.files?.[0]; if(file){ const r=new FileReader(); r.onload=()=>setCustomIcon(String(r.result)); r.readAsDataURL(file); } }}/></label>
            <button onClick={saveCompanySettings} className="mt-5 rounded bg-[#1769e0] px-4 py-2 text-xs font-bold">Save Company Settings</button>
          </Panel>
          <Panel title="WEATHER SETTINGS">
            <label className="block text-xs text-[#9db0c5]">Forecast State<select className="field" value={weatherState.name} onChange={e=>{ const s=NIGERIAN_STATES.find(x=>x.name===e.target.value); if(s) setWeatherState(s); }}>{NIGERIAN_STATES.map(s=><option key={s.name}>{s.name}</option>)}</select></label>
            <p className="mt-3 text-[10px] leading-5 text-[#74869b]">Dashboard weather uses a live 5-day forecast for the selected Nigerian state. Changes are applied after Save Company Settings.</p>
            <div className="mt-5 rounded-xl border border-[#17304a] bg-[#081420] p-4"><div className="text-[10px] text-[#6f8197]">CURRENT PREVIEW</div><div className="mt-2 text-lg font-bold">{weatherState.name}</div><div className="text-[10px] text-[#8191a6]">{weather?.current ? `${Math.round(weather.current.temperature_2m)}°C • ${weatherLabel(Number(weather.current.weather_code))}` : "Loading forecast..."}</div></div>
          </Panel>
        </div>
        <div className="mt-4"><Panel title="BRANDING PREVIEW">
          <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-[#1769e0]">{customIcon ? <img src={customIcon} alt="Company icon" className="h-full w-full object-cover"/> : <Icon size={26}/>}</div><div><div className="font-bold">{companyName}</div><div className="text-[10px] text-[#8191a6]">This is the company identity shown in BuildPro.</div></div></div>
        </Panel>
        </div>
      </>
    );
  }

  /* =====================================================
     FINANCE
  ===================================================== */

  if (page === "Finance") {
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + Number(p.spent || 0), 0);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const utilisation = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const outstanding = financeInvoices.reduce(
      (sum, invoice) => sum + Math.max(Number(invoice.amount || 0) - Number(invoice.paid_amount || 0), 0),
      0
    );
    const invoiced = financeInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const paid = financePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const expenses = financeExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const netCash = paid - expenses;

    return (
      <>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Finance</h2>
            <p className="text-[10px] text-[#8191a6]">Manage and monitor construction operations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFinanceModal("invoice")} className="rounded bg-[#1769e0] px-3 py-2 text-[10px] font-bold">+ New Invoice</button>
            <button onClick={() => setFinanceModal("payment")} className="rounded border border-[#26394d] bg-[#0c1724] px-3 py-2 text-[10px] font-bold">Record Payment</button>
            <button onClick={() => setFinanceModal("expense")} className="rounded border border-[#26394d] bg-[#0c1724] px-3 py-2 text-[10px] font-bold">Record Expense</button>
          </div>
        </div>

        {(error || financeError) && (
          <div className="mb-4 rounded-lg border border-[#5b2626] bg-[#241214] p-4 text-xs text-[#ff7777]">
            {financeError || error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Kpi title="TOTAL BUDGET" value={loading ? "..." : money(totalBudget)} sub="Projects" color="green" />
          <Kpi title="TOTAL SPENT" value={loading ? "..." : money(totalSpent)} sub="Project spend" color="amber" />
          <Kpi title="OUTSTANDING" value={loadingFinance ? "..." : money(outstanding)} sub="Unpaid invoices" color="amber" />
          <Kpi title="PAID YTD" value={loadingFinance ? "..." : money(paid)} sub={`${financePayments.length} payments`} color="green" />
          <Kpi title="EXPENSES" value={loadingFinance ? "..." : money(expenses)} sub={`${financeExpenses.length} expenses`} color="red" />
          <Kpi title="NET CASH" value={loadingFinance ? "..." : money(netCash)} sub="Payments less expenses" color={netCash >= 0 ? "green" : "red"} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Panel title="PROJECT FINANCIAL POSITION">
            {loading ? (
              <div className="py-10 text-center text-xs text-[#8191a6]">Loading financial data from Supabase...</div>
            ) : projects.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8191a6]">No financial project data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead><tr className="border-b border-[#17283a] text-[#72849a]"><th className="px-2 py-3">Project</th><th className="px-2 py-3">Budget</th><th className="px-2 py-3">Spent</th><th className="px-2 py-3">Remaining</th><th className="px-2 py-3">Util.</th></tr></thead>
                  <tbody>
                    {projects.map((project) => {
                      const budget = Number(project.budget || 0);
                      const spent = Number(project.spent || 0);
                      const projectRemaining = Math.max(budget - spent, 0);
                      const projectUtilisation = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                      return (
                        <tr key={project.id} className="border-b border-[#112131]">
                          <td className="px-2 py-3"><button className="text-left font-semibold hover:underline" onClick={() => onSelectProject(project)}>{project.name}</button></td>
                          <td className="px-2 py-3">{money(budget)}</td>
                          <td className="px-2 py-3">{money(spent)}</td>
                          <td className="px-2 py-3">{money(projectRemaining)}</td>
                          <td className="px-2 py-3">{projectUtilisation}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="INVOICES">
            <Invoices invoices={financeInvoices} loading={loadingFinance} projects={projects} />
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Panel title="RECENT PAYMENTS">
            {loadingFinance ? <div className="py-10 text-center text-xs text-[#8191a6]">Loading payments...</div> : financePayments.length === 0 ? <div className="py-10 text-center text-xs text-[#8191a6]">No payments recorded.</div> : (
              <div className="space-y-2">
                {financePayments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b border-[#17283a] py-2 text-[10px]">
                    <span>{payment.payment_date} • {payment.reference || "Payment"}</span>
                    <b>{money(Number(payment.amount || 0))}</b>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="RECENT EXPENSES">
            {loadingFinance ? <div className="py-10 text-center text-xs text-[#8191a6]">Loading expenses...</div> : financeExpenses.length === 0 ? <div className="py-10 text-center text-xs text-[#8191a6]">No expenses recorded.</div> : (
              <div className="space-y-2">
                {financeExpenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between border-b border-[#17283a] py-2 text-[10px]">
                    <span>{expense.expense_date} • {expense.category}</span>
                    <b>{money(Number(expense.amount || 0))}</b>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="mt-4 rounded-lg border border-[#17283a] bg-[#091320] p-4 text-[10px] text-[#8191a6]">
          Invoice total: <b>{money(invoiced)}</b> • Payments: <b>{money(paid)}</b> • Outstanding: <b>{money(outstanding)}</b> • Project spend: <b>{money(totalSpent)}</b> • Budget remaining: <b>{money(remaining)}</b> • Utilisation: <b>{utilisation}%</b>.
        </div>

        {financeModal && (
          <FinanceModal
            type={financeModal}
            projects={projects}
            invoices={financeInvoices}
            close={() => setFinanceModal(null)}
            onSaved={async () => {
              setFinanceModal(null);
              await Promise.all([reloadFinance(), reloadProjects()]);
            }}
          />
        )}
      </>
    );
  }

  /* =====================================================
     EQUIPMENT
  ===================================================== */

  if (page === "Equipment") {
    const normalizedStatus = (value: unknown) =>
      String(value ?? "").trim().toLowerCase();

    const totalEquipment = equipmentRecords.length;
    const operationalEquipment = equipmentRecords.filter(
      (x) => normalizedStatus(x.status) === "operational"
    ).length;
    const maintenanceEquipment = equipmentRecords.filter(
      (x) => normalizedStatus(x.status) === "maintenance"
    ).length;
    const outOfServiceEquipment = equipmentRecords.filter(
      (x) => normalizedStatus(x.status) === "out of service"
    ).length;

    return (
      <>
        <SectionHeader
          title="Equipment"
          add={() => {
            setEquipmentEdit(null);
            setModal(true);
          }}
        />

        {equipmentError && (
          <div className="mb-4 rounded-lg border border-[#5b2626] bg-[#241214] p-4 text-xs text-[#ff7777]">
            {equipmentError}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <Kpi
            title="TOTAL EQUIPMENT"
            value={loadingEquipment ? "..." : String(totalEquipment)}
            sub="All equipment records"
            color="green"
          />
          <Kpi
            title="OPERATIONAL"
            value={loadingEquipment ? "..." : String(operationalEquipment)}
            sub="Ready for use"
            color="green"
          />
          <Kpi
            title="MAINTENANCE"
            value={loadingEquipment ? "..." : String(maintenanceEquipment)}
            sub="Currently serviced"
            color="amber"
          />
          <Kpi
            title="OUT OF SERVICE"
            value={loadingEquipment ? "..." : String(outOfServiceEquipment)}
            sub="Unavailable"
            color="red"
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-[#17283a] bg-[#091320]">
          {loadingEquipment ? (
            <div className="py-10 text-center text-xs text-[#8191a6]">Loading equipment...</div>
          ) : equipmentRecords.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#8191a6]">No equipment records found.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1724]">
                <tr>
                  {["Equipment", "Number", "Category", "Project", "Condition", "Status", "Next Service", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[#72849a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipmentRecords.map((item) => (
                  <tr key={item.id} className="border-t border-[#17283a]">
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    <td className="px-4 py-3">{item.equipment_number}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{projects.find((p) => p.id === item.project_id)?.name || "Unassigned"}</td>
                    <td className="px-4 py-3">{item.condition || "-"}</td>
                    <td className="px-4 py-3">{item.status || "-"}</td>
                    <td className="px-4 py-3">{item.next_service_date || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEquipmentEdit(item);
                          setModal(true);
                        }}
                        className="rounded border border-[#29415a] bg-[#0b1826] px-3 py-1.5 text-[9px] font-semibold hover:bg-[#10263b]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modal && (
          <EquipmentModal
            equipment={equipmentEdit}
            projects={projects}
            close={() => {
              setModal(false);
              setEquipmentEdit(null);
            }}
            onSaved={async () => {
              setModal(false);
              setEquipmentEdit(null);
              await refreshEquipment();
            }}
          />
        )}
      </>
    );
  }

  /* =====================================================
     STAFF & ATTENDANCE
  ===================================================== */

  if (page === "Staff & Attendance") {
    const today = getLocalDateString();
    const todayAttendance = attendanceRecords.filter((x) => x.attendance_date === today);
    const selectedDateAttendance = attendanceRecords.filter((x) => x.attendance_date === attendanceDate);
    const present = todayAttendance.filter((x) => String(x.status || "").trim().toLowerCase() === "present").length;
    const absent = todayAttendance.filter((x) => String(x.status || "").trim().toLowerCase() === "absent").length;
    const activeStaff = staffRecords.filter((x) => String(x.status || "").trim().toLowerCase() === "active").length;
    const attendanceRate = activeStaff > 0 ? Math.round((present / activeStaff) * 100) : 0;

    return (
      <>
        <SectionHeader title="Staff & Attendance" add={() => setModal(true)} />
        {staffError && (
          <div className="mb-4 rounded-lg border border-[#5b2626] bg-[#241214] p-4 text-xs text-[#ff7777]">{staffError}</div>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <Kpi title="TOTAL STAFF" value={loadingStaff ? "..." : String(staffRecords.length)} sub="Staff records" color="green" />
          <Kpi title="ACTIVE STAFF" value={loadingStaff ? "..." : String(activeStaff)} sub="Currently active" color="green" />
          <Kpi title="PRESENT TODAY" value={loadingStaff ? "..." : String(present)} sub={`${attendanceRate}% attendance`} color="green" />
          <Kpi title="ABSENT TODAY" value={loadingStaff ? "..." : String(absent)} sub="Attendance records" color={absent > 0 ? "amber" : "green"} />
        </div>

        <div className="mt-4">
          <Panel title="ATTENDANCE HISTORY">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-[10px] text-[#8191a6]">
                Attendance date
                <input
                  type="date"
                  className="field mt-1"
                  value={attendanceDate}
                  max={today}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </label>
              <div className="text-[10px] text-[#718399]">
                {attendanceDate === today ? 'Today' : `Records saved for ${attendanceDate}`}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {selectedDateAttendance.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8191a6]">No attendance records for this date.</div>
              ) : (
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-[#17283a] text-[#72849a]">
                      <th className="px-2 py-3">Staff</th>
                      <th className="px-2 py-3">Status</th>
                      <th className="px-2 py-3">Check In</th>
                      <th className="px-2 py-3">Check Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDateAttendance.map((record) => {
                      const person = staffRecords.find((x) => x.id === record.staff_id);
                      return (
                        <tr key={record.id} className="border-b border-[#112131]">
                          <td className="px-2 py-3 font-semibold">{person?.name || record.staff_id}</td>
                          <td className="px-2 py-3"><Status s={record.status} /></td>
                          <td className="px-2 py-3">{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                          <td className="px-2 py-3">{record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <Panel title="STAFF DIRECTORY">
            {loadingStaff ? (
              <div className="py-10 text-center text-xs text-[#8191a6]">Loading staff...</div>
            ) : staffRecords.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8191a6]">No staff records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead><tr className="border-b border-[#17283a] text-[#72849a]">
                    {['Employee', 'Name', 'Role', 'Department', 'Phone', 'Status', 'Action'].map((h) => <th key={h} className="px-2 py-3">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {staffRecords.map((person) => (
                      <tr key={person.id} className="border-b border-[#112131]">
                        <td className="px-2 py-3 font-semibold">{person.employee_number}</td>
                        <td className="px-2 py-3">{person.name}</td>
                        <td className="px-2 py-3">{person.role}</td>
                        <td className="px-2 py-3">{person.department || '-'}</td>
                        <td className="px-2 py-3">{person.phone || '-'}</td>
                        <td className="px-2 py-3"><Status s={person.status} /></td>
                        <td className="px-2 py-3"><button type="button" onClick={() => setStaffEdit(person)} className="rounded border border-[#29415a] bg-[#0b1826] px-3 py-1.5 text-[9px] font-semibold">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="TODAY'S ATTENDANCE">
            {loadingStaff ? <div className="py-10 text-center text-xs text-[#8191a6]">Loading attendance...</div> : (
              <div className="space-y-2">
                {staffRecords.length === 0 ? <div className="py-10 text-center text-xs text-[#8191a6]">No staff records.</div> : staffRecords.map((person) => {
                  const rec = todayAttendance.find((x) => x.staff_id === person.id);
                  return (
                    <div key={person.id} className="flex items-center justify-between rounded border border-[#17283a] bg-[#0b1623] p-3 text-[10px]">
                      <div><b>{person.name}</b><div className="text-[#718399]">{rec?.status || 'Not recorded'}</div></div>
                      <div className="flex items-center gap-1">
                        {!rec && (
                          <>
                            <button type="button" onClick={async () => { await recordAttendance(person.id, 'Present'); }} className="rounded border border-[#29415a] px-2 py-1">Present</button>
                            <button type="button" onClick={async () => { await recordAttendance(person.id, 'Absent'); }} className="rounded border border-[#29415a] px-2 py-1">Absent</button>
                          </>
                        )}
                        {rec?.status?.toLowerCase() === 'present' && !rec?.check_out && (
                          <button type="button" onClick={async () => { await recordAttendance(person.id, 'Present', rec.check_in, new Date().toISOString()); }} className="rounded border border-[#29415a] px-2 py-1">Check Out</button>
                        )}
                        {rec && (
                          <span className="text-[9px] text-[#718399]">
                            {rec.check_in ? `In ${new Date(rec.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            {rec.check_out ? ` • Out ${new Date(rec.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {modal && !staffEdit && (
          <StaffModal projects={projects} close={() => setModal(false)} onSaved={async () => { setModal(false); await refreshStaff(); }} />
        )}
        {staffEdit && (
          <StaffModal staff={staffEdit} projects={projects} close={() => setStaffEdit(null)} onSaved={async () => { setStaffEdit(null); await refreshStaff(); }} />
        )}
      </>
    );
  }

  /* =====================================================
     PROCUREMENT
  ===================================================== */

  if (page === "Procurement") {
    return (
      <>
        <SectionHeader
          title="Procurement"
          add={() => setModal(true)}
        />

        {procurementError && (
          <div className="mb-4 rounded-lg border border-[#5b2626] bg-[#241214] p-4 text-xs text-[#ff7777]">
            {procurementError}
          </div>
        )}

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi title="ORDERS" value={loadingProcurement ? "..." : String(procurementOrders.length)} sub="From database" color="green" />
          <Kpi title="TOTAL VALUE" value={loadingProcurement ? "..." : money(procurementOrders.reduce((sum, x) => sum + Number(x.total_amount || 0), 0))} sub="Procurement value" color="amber" />
          <Kpi title="PENDING APPROVAL" value={loadingProcurement ? "..." : String(procurementOrders.filter((x) => x.status === "Pending Approval").length)} sub="Awaiting approval" color="amber" />
          <Kpi title="DELIVERED" value={loadingProcurement ? "..." : String(procurementOrders.filter((x) => x.status === "Delivered").length)} sub="Completed deliveries" color="green" />
        </div>

        <Panel title="PROCUREMENT ORDERS">
          {loadingProcurement ? (
            <div className="py-10 text-center text-xs text-[#8191a6]">Loading procurement orders...</div>
          ) : procurementOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#8191a6]">No procurement orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="border-b border-[#17283a] text-[#72849a]">
                    <th className="px-2 py-3">Order</th>
                    <th className="px-2 py-3">Item</th>
                    <th className="px-2 py-3">Project</th>
                    <th className="px-2 py-3">Supplier</th>
                    <th className="px-2 py-3">Value</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {procurementOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#112131]">
                      <td className="px-2 py-3 font-semibold">{order.order_number}</td>
                      <td className="px-2 py-3">{order.item_description}</td>
                      <td className="px-2 py-3">{order.project?.name || "-"}</td>
                      <td className="px-2 py-3">{order.supplier_name || "-"}</td>
                      <td className="px-2 py-3">{money(Number(order.total_amount || 0))}</td>
                      <td className="px-2 py-3"><Status s={order.status} /></td>
                      <td className="px-2 py-3">
                        <ProcurementActions
                          order={order}
                          onStatusChange={updateProcurementStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {modal && (
          <ProcurementModal
            projects={projects}
            close={() => setModal(false)}
            onSaved={async () => {
              setModal(false);
              await refreshProcurement();
            }}
          />
        )}
      </>
    );
  }

  /* =====================================================
     DEFAULT MODULE
  ===================================================== */

  return (
    <>
      <SectionHeader
        title={page}
        add={() => setModal(true)}
      />

      <DataTable rows={table[page] || []} />

      {modal && (
        <SimpleModal
          title={"New " + page}
          close={() => setModal(false)}
          fields={[
            "Name",
            "Project",
            "Description",
            "Status",
          ]}
        />
      )}
    </>
  );
}

/* =========================================================
   PROJECT DETAIL
========================================================= */

function ProjectDetail({
  project,
  back,
  onUpdated,
  onDeleted,
}: {
  project: Project;
  back: () => void;
  onUpdated: (updated: Project) => void;
  onDeleted: () => void;
}) {
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: project.name || "",
    location: project.location || "",
    manager: project.manager || "",
    budget: String(project.budget ?? "0"),
    spent: String(project.spent ?? "0"),
    progress: String(project.progress ?? "0"),
    status: project.status || "On Track",
    description: (project as any).description || "",
    start_date: (project as any).start_date || "",
    end_date: (project as any).end_date || "",
  });

  const openEdit = () => {
    setForm({
      name: project.name || "",
      location: project.location || "",
      manager: project.manager || "",
      budget: String(project.budget ?? "0"),
      spent: String(project.spent ?? "0"),
      progress: String(project.progress ?? "0"),
      status: project.status || "On Track",
      description: (project as any).description || "",
      start_date: (project as any).start_date || "",
      end_date: (project as any).end_date || "",
    });
    setEditModal(true);
  };

  const updateForm = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveEdit = async () => {
    if (!form.name.trim()) {
      alert("Project name is required.");
      return;
    }

    const budget = Number(form.budget || 0);
    const spent = Number(form.spent || 0);
    const progress = Number(form.progress || 0);

    if (progress < 0 || progress > 100) {
      alert("Progress must be between 0 and 100.");
      return;
    }

    if (budget < 0 || spent < 0) {
      alert("Budget and spent cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/projects?id=${encodeURIComponent(project.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            location: form.location.trim(),
            manager: form.manager.trim(),
            description: form.description.trim(),
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            status: form.status,
            budget,
            spent,
            progress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "The project could not be updated."
        );
      }

      setEditModal(false);
      onUpdated(data);
    } catch (error) {
      console.error("Update project error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update project."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async () => {
    if (
      !confirm(
        `Delete "${project.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/projects?id=${encodeURIComponent(project.id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "The project could not be deleted."
        );
      }

      onDeleted();
    } catch (error) {
      console.error("Delete project error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete project."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={back}
          className="flex items-center gap-1 text-xs text-[#55a7ff]"
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={openEdit}
            className="rounded border border-[#26394d] px-3 py-1.5 text-xs"
          >
            Edit
          </button>

          <button
            onClick={deleteProject}
            disabled={deleting}
            className="rounded border border-[#5b2626] px-3 py-1.5 text-xs text-[#ff7777] disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title={project.name}>
            <p className="text-xs text-[#8393a7]">
              {project.location}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <b className="text-4xl">
                {project.progress}%
              </b>

              <Status s={project.status} />
            </div>

            <span className="text-[10px] text-[#8393a7]">
              Project completion
            </span>

            <div className="mt-4 h-3 rounded bg-[#172536]">
              <div
                className="h-3 rounded bg-[#3188e8]"
                style={{
                  width: `${project.progress}%`,
                }}
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-[9px] text-[#718399]">
                  LOCATION
                </span>

                <p className="mt-1 text-xs">
                  {project.location}
                </p>
              </div>

              <div>
                <span className="text-[9px] text-[#718399]">
                  PROJECT MANAGER
                </span>

                <p className="mt-1 text-xs">
                  {project.manager}
                </p>
              </div>
            </div>

            {"description" in project && (
              <div className="mt-5">
                <span className="text-[9px] text-[#718399]">
                  DESCRIPTION
                </span>

                <p className="mt-1 text-xs text-[#a3b1c1]">
                  {String(
                    (project as any).description || ""
                  )}
                </p>
              </div>
            )}

            {"start_date" in project && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-[9px] text-[#718399]">
                    START DATE
                  </span>

                  <p className="mt-1 text-xs">
                    {String(
                      (project as any).start_date || "-"
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] text-[#718399]">
                    END DATE
                  </span>

                  <p className="mt-1 text-xs">
                    {String(
                      (project as any).end_date || "-"
                    )}
                  </p>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="PROJECT FINANCE">
          <p className="text-xs">
            Budget

            <b className="float-right">
              {money(Number(project.budget))}
            </b>
          </p>

          <p className="mt-4 text-xs">
            Spent

            <b className="float-right">
              {money(Number(project.spent))}
            </b>
          </p>

          <p className="mt-4 text-xs">
            Remaining

            <b className="float-right text-[#39dd7d]">
              {money(
                Number(project.budget) -
                  Number(project.spent)
              )}
            </b>
          </p>

          <div className="mt-5 border-t border-[#17283a] pt-4">
            <p className="text-[9px] text-[#718399]">
              BUDGET UTILISATION
            </p>

            <p className="mt-1 text-lg font-bold">
              {Number(project.budget) > 0
                ? Math.round(
                    (Number(project.spent) /
                      Number(project.budget)) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </Panel>
      </div>

      {editModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5">
            <div className="flex items-center justify-between">
              <div>
                <b className="text-sm">Edit Project</b>

                <p className="mt-1 text-[10px] text-[#8191a6]">
                  Update project details in the database.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!saving) setEditModal(false);
                }}
                disabled={saving}
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block text-[10px] text-[#8191a6] sm:col-span-2">
                Project Name
                <input
                  className="field"
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Location
                <input
                  className="field"
                  value={form.location}
                  onChange={(e) =>
                    updateForm("location", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Project Manager
                <input
                  className="field"
                  value={form.manager}
                  onChange={(e) =>
                    updateForm("manager", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Budget
                <input
                  className="field"
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(e) =>
                    updateForm("budget", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Spent
                <input
                  className="field"
                  type="number"
                  min="0"
                  value={form.spent}
                  onChange={(e) =>
                    updateForm("spent", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Progress (%)
                <input
                  className="field"
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) =>
                    updateForm("progress", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Status
                <select
                  className="field"
                  value={form.status}
                  onChange={(e) =>
                    updateForm("status", e.target.value)
                  }
                >
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                Start Date
                <input
                  className="field"
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    updateForm("start_date", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6]">
                End Date
                <input
                  className="field"
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    updateForm("end_date", e.target.value)
                  }
                />
              </label>

              <label className="block text-[10px] text-[#8191a6] sm:col-span-2">
                Description
                <textarea
                  className="field min-h-[80px]"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (!saving) setEditModal(false);
                }}
                disabled={saving}
                className="rounded border border-[#26394d] px-4 py-2 text-xs"
              >
                Cancel
              </button>

              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  add,
}: {
  title: string;
  add?: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="text-[10px] text-[#8191a6]">
          Manage and monitor construction operations
        </p>
      </div>

      {add && (
        <button
          onClick={add}
          className="flex items-center gap-2 rounded bg-[#1769e0] px-4 py-2 text-xs font-bold"
        >
          <Plus size={15} />
          Add New
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: () => void;
}) {
  return (
    <section className="rounded-lg border border-[#17283a] bg-[#091320] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[10px] font-bold tracking-wide">
          {title}
        </h2>

        {action && (
          <button
            onClick={action}
            className="text-[9px] text-[#3d9cff]"
          >
            View all →
          </button>
        )}
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   KPI
========================================================= */

function Kpi({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-[#17283a] bg-[#091320] p-4">
      <div className="text-[9px] text-[#8495aa]">
        {title}
      </div>

      <div className="mt-2 text-[25px] font-bold">
        {value}
      </div>

      <div
        className={`mt-1 text-[9px] ${
          color === "red"
            ? "text-[#ff5555]"
            : color === "amber"
              ? "text-[#ffb42d]"
              : "text-[#39dd7d]"
        }`}
      >
        {sub}
      </div>
    </div>
  );
}

/* =========================================================
   PROJECT ROW
========================================================= */

function ProjectRow(p: Project) {
  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="text-[11px] font-semibold">
            {p.name}
          </div>

          <div className="text-[9px] text-[#77889d]">
            {p.location}
          </div>
        </div>

        <div className="text-[11px] font-bold">
          {p.progress}%
        </div>
      </div>

      <div className="mt-2 h-1.5 rounded bg-[#162536]">
        <div
          className={`h-1.5 rounded ${
            p.status === "Delayed"
              ? "bg-[#ff4b4b]"
              : p.status === "At Risk"
                ? "bg-[#ffb72e]"
                : "bg-[#3d9cff]"
          }`}
          style={{
            width: `${p.progress}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function Status({ s }: { s: string }) {
  return (
    <span
      className={`ml-2 rounded-full px-2 py-0.5 text-[8px] ${
        s === "Delayed"
          ? "bg-[#35181b] text-[#ff6565]"
          : s === "At Risk"
            ? "bg-[#332914] text-[#ffc14a]"
            : "bg-[#0d2c20] text-[#46df8b]"
      }`}
    >
      {s}
    </span>
  );
}

/* =========================================================
   BAR CHART
========================================================= */

function Bar({
  projects,
}: {
  projects: Project[];
}) {
  if (!projects.length) {
    return (
      <div className="grid h-[210px] place-items-center text-xs text-[#718399]">
        No project data
      </div>
    );
  }

  return (
    <div className="flex h-[210px] items-end justify-around gap-2 border-b border-[#1b2a3a]">
      {projects.map((p) => (
        <div
          key={p.id}
          className="flex h-full w-full items-end justify-center gap-1"
          title={p.name}
        >
          <div
            className="w-4 rounded-t bg-[#3188e8]"
            style={{
              height: `${
                Number(p.budget) > 0
                  ? Math.min(
                      (Number(p.spent) / Number(p.budget)) * 100,
                      100
                    )
                  : 0
              }%`,
            }}
          />

          <div
            className="w-4 rounded-t bg-[#35bd6e]"
            style={{
              height: `${Math.min(
                Number(p.progress || 0),
                100
              )}%`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   DONUT
========================================================= */

function Donut({
  projects,
}: {
  projects: Project[];
}) {
  const total = projects.length;

  const onTrack = projects.filter(
    (p) => p.status === "On Track"
  ).length;

  const atRisk = projects.filter(
    (p) => p.status === "At Risk"
  ).length;

  const delayed = projects.filter(
    (p) => p.status === "Delayed"
  ).length;

  const onTrackPercent =
    total > 0 ? (onTrack / total) * 100 : 0;

  const atRiskPercent =
    total > 0 ? (atRisk / total) * 100 : 0;

  return (
    <div className="flex h-[210px] items-center justify-center gap-5">
      <div
        className="grid h-36 w-36 place-items-center rounded-full"
        style={{
          background: `conic-gradient(
            #39d87b 0 ${onTrackPercent}%,
            #ffb42b ${onTrackPercent}% ${
              onTrackPercent + atRiskPercent
            }%,
            #ff4e4e ${
              onTrackPercent + atRiskPercent
            }% 100%
          )`,
        }}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-[#091320]">
          <b className="text-2xl">{total}</b>
        </div>
      </div>

      <div className="space-y-2 text-[9px]">
        🟢 On Track {onTrack}
        <br />
        🟡 At Risk {atRisk}
        <br />
        🔴 Delayed {delayed}
      </div>
    </div>
  );
}

/* =========================================================
   EQUIPMENT
========================================================= */

function EquipmentModal({
  equipment,
  projects,
  close,
  onSaved,
}: {
  equipment: EquipmentRecord | null;
  projects: Project[];
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const isEdit = Boolean(equipment);
  const [form, setForm] = useState({
    name: equipment?.name ?? "",
    equipment_number: equipment?.equipment_number ?? "",
    category: equipment?.category ?? "",
    project_id: equipment?.project_id ?? "",
    status: equipment?.status ?? "Operational",
    condition: equipment?.condition ?? "Good",
    last_service_date: equipment?.last_service_date ?? "",
    next_service_date: equipment?.next_service_date ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) return alert("Equipment name is required.");
    if (!form.equipment_number.trim()) return alert("Equipment number is required.");
    if (!form.category.trim()) return alert("Equipment category is required.");

    try {
      setSaving(true);
      const response = await fetch(
        isEdit
          ? `/api/equipment?id=${encodeURIComponent(equipment!.id)}`
          : "/api/equipment",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `Could not ${isEdit ? "update" : "create"} equipment.`);
      }

      await onSaved();
    } catch (error) {
      alert(error instanceof Error ? error.message : `Failed to ${isEdit ? "update" : "create"} equipment.`);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof typeof form, value: string) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5">
        <div className="flex items-center justify-between">
          <div>
            <b className="text-sm">{isEdit ? "Edit Equipment" : "Add Equipment"}</b>
            <p className="mt-1 text-[10px] text-[#8191a6]">
              {isEdit ? "Update the equipment record and its current status." : "Create a real equipment record in Supabase."}
            </p>
          </div>
          <button onClick={close} disabled={saving}><X size={17} /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-[10px] text-[#8191a6] sm:col-span-2">
            Name
            <input className="field mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Excavator CAT 320" />
          </label>

          <label className="text-[10px] text-[#8191a6]">
            Equipment Number
            <input className="field mt-1" value={form.equipment_number} onChange={(e) => update("equipment_number", e.target.value)} placeholder="EQ-001" />
          </label>

          <label className="text-[10px] text-[#8191a6]">
            Category
            <input className="field mt-1" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Heavy Equipment" />
          </label>

          <label className="text-[10px] text-[#8191a6] sm:col-span-2">
            Project
            <select className="field mt-1" value={form.project_id} onChange={(e) => update("project_id", e.target.value)}>
              <option value="">Unassigned</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label className="text-[10px] text-[#8191a6]">
            Status
            <select className="field mt-1" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="Operational">Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </label>

          <label className="text-[10px] text-[#8191a6]">
            Condition
            <select className="field mt-1" value={form.condition} onChange={(e) => update("condition", e.target.value)}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </label>

          <label className="text-[10px] text-[#8191a6]">
            Last Service
            <input className="field mt-1" type="date" value={form.last_service_date} onChange={(e) => update("last_service_date", e.target.value)} />
          </label>

          <label className="text-[10px] text-[#8191a6]">
            Next Service
            <input className="field mt-1" type="date" value={form.next_service_date} onChange={(e) => update("next_service_date", e.target.value)} />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={close} disabled={saving} className="rounded border border-[#26394d] px-4 py-2 text-xs">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Equipment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EquipmentMini({
  equipmentRecords,
  loading,
}: {
  equipmentRecords: EquipmentRecord[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="py-5 text-center text-xs text-[#8191a6]">Loading equipment...</div>;
  }

  const normalizedStatus = (value: unknown) => String(value ?? "").trim().toLowerCase();
  const operational = equipmentRecords.filter((x) => normalizedStatus(x.status) === "operational").length;
  const maintenance = equipmentRecords.filter((x) => normalizedStatus(x.status) === "maintenance").length;
  const outOfService = equipmentRecords.filter((x) => normalizedStatus(x.status) === "out of service").length;

  return (
    <div className="flex justify-around py-5 text-center">
      {[
        [String(operational), "Operational", "text-[#39dd7d]"],
        [String(maintenance), "Maintenance", "text-[#ffb42d]"],
        [String(outOfService), "Out of Service", "text-[#ff5555]"],
      ].map((x) => (
        <div key={x[1]}>
          <b className={`text-2xl ${x[2]}`}>{x[0]}</b>
          <div className="text-[8px] text-[#8191a6]">{x[1]}</div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   STAFF MODAL
========================================================= */

function StaffModal({
  staff,
  close,
  onSaved,
}: {
  staff?: StaffRecord;
  projects: Project[];
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee_number: staff?.employee_number || "",
    name: staff?.name || "",
    role: staff?.role || "",
    department: staff?.department || "",
    phone: staff?.phone || "",
    email: staff?.email || "",
    status: staff?.status || "Active",
  });

  const update = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.employee_number.trim() || !form.role.trim()) {
      alert("Employee number, name and role are required.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(staff ? `/api/staff?id=${encodeURIComponent(staff.id)}` : "/api/staff", {
        method: staff ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff ? form : { type: "staff", ...form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save staff record.");
      await onSaved();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save staff record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5">
        <div className="flex items-center justify-between"><b className="text-sm">{staff ? "Edit Staff" : "Add Staff"}</b><button onClick={close}><X size={17} /></button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["employee_number", "Employee Number"], ["name", "Name"], ["role", "Role"], ["department", "Department"], ["phone", "Phone"], ["email", "Email"],
          ].map(([key, label]) => (
            <label key={key} className="text-[10px] text-[#8191a6]">{label}<input className="field mt-1" value={form[key as keyof typeof form]} onChange={(e) => update(key as keyof typeof form, e.target.value)} /></label>
          ))}
          <label className="text-[10px] text-[#8191a6]">Status<select className="field mt-1" value={form.status} onChange={(e) => update("status", e.target.value)}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="On Leave">On Leave</option></select></label>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button onClick={close} disabled={saving} className="rounded border border-[#26394d] px-4 py-2 text-xs">Cancel</button><button onClick={save} disabled={saving} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold disabled:opacity-50">{saving ? "Saving..." : staff ? "Save Changes" : "Add Staff"}</button></div>
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE
========================================================= */

function Attendance({
  staffRecords,
  attendanceRecords,
  loading,
}: {
  staffRecords: StaffRecord[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="py-5 text-center text-xs text-[#8191a6]">Loading attendance...</div>;
  }

  const today = getLocalDateString();
  const todayAttendance = attendanceRecords.filter((x) => x.attendance_date === today);
  const present = todayAttendance.filter((x) => String(x.status || "").trim().toLowerCase() === "present").length;
  const absent = todayAttendance.filter((x) => String(x.status || "").trim().toLowerCase() === "absent").length;
  const rate = todayAttendance.length > 0 ? Math.round((present / todayAttendance.length) * 100) : 0;
  const total = Math.max(todayAttendance.length, staffRecords.length);

  return (
    <div className="flex items-center justify-around py-5">
      <div className="grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(#3cdd80 0 ${rate}%, #1d2d3d ${rate}% 100%)` }}>
        <div className="grid h-20 w-20 place-items-center rounded-full bg-[#091320]">
          <b className="text-2xl">{rate}%</b>
        </div>
      </div>
      <div className="space-y-2 text-[10px]">
        Present <b>{present}</b>
        <br />
        Absent <b>{absent}</b>
        <br />
        Recorded <b>{todayAttendance.length}</b> / {total}
      </div>
    </div>
  );
}

/* =========================================================
   INVOICES
========================================================= */

function Invoices({
  invoices,
  loading,
  projects = [],
}: {
  invoices: FinanceInvoice[];
  loading: boolean;
  projects?: Project[];
}) {
  if (loading) {
    return <div className="py-8 text-center text-xs text-[#8191a6]">Loading invoices...</div>;
  }

  if (invoices.length === 0) {
    return <div className="py-8 text-center text-xs text-[#8191a6]">No invoices recorded.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[10px]">
        <thead>
          <tr>
            {["Invoice", "Project", "Amount", "Paid", "Outstanding", "Due", "Status"].map((x) => (
              <th className="pb-3 text-[#72849a]" key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.slice(0, 10).map((x) => {
            const outstanding = Math.max(Number(x.amount || 0) - Number(x.paid_amount || 0), 0);
            return (
              <tr className="border-t border-[#142233]" key={x.id}>
                <td className="py-2">{x.invoice_number}</td>
                <td>{projects.find((p) => p.id === x.project_id)?.name || "-"}</td>
                <td>{money(Number(x.amount || 0))}</td>
                <td>{money(Number(x.paid_amount || 0))}</td>
                <td className={outstanding > 0 ? "text-[#ffb42d]" : "text-[#39dd7d]"}>{money(outstanding)}</td>
                <td>{x.due_date || "-"}</td>
                <td>{x.status || (outstanding > 0 ? "Outstanding" : "Paid")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProcurementActions({
  order,
  onStatusChange,
}: {
  order: any;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const status = order.status;

  const action = (nextStatus: string, label: string) => (
    <button
      type="button"
      disabled={status === nextStatus}
      onClick={() => {
        if (status === nextStatus) return;
        void onStatusChange(order.id, nextStatus);
      }}
      className="rounded border border-[#29415a] bg-[#0b1826] px-2 py-1 text-[9px] font-semibold hover:bg-[#10263b]"
    >
      {label}
    </button>
  );

  if (status === "Pending Approval") {
    return <div className="flex flex-wrap gap-1">
      {action("Approved", "Approve")}
      {action("Cancelled", "Cancel")}
    </div>;
  }

  if (status === "Approved") {
    return <div className="flex flex-wrap gap-1">
      {action("Ordered", "Mark Ordered")}
      {action("Cancelled", "Cancel")}
    </div>;
  }

  if (status === "Ordered") {
    return <div className="flex flex-wrap gap-1">
      {action("Partially Delivered", "Partial Delivery")}
      {action("Delivered", "Mark Delivered")}
    </div>;
  }

  if (status === "Partially Delivered") {
    return <div className="flex flex-wrap gap-1">
      {action("Delivered", "Mark Delivered")}
    </div>;
  }

  return <span className="text-[9px] text-[#61758b]">No actions</span>;
}

/* =========================================================
   PROCUREMENT MODAL
========================================================= */

function ProcurementModal({
  projects,
  close,
  onSaved,
}: {
  projects: Project[];
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    order_number: "",
    project_id: "",
    item_description: "",
    quantity: "1",
    unit_price: "",
    supplier_name: "",
    expected_delivery_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const total = Number(form.quantity || 0) * Number(form.unit_price || 0);

  const save = async () => {
    if (!form.item_description.trim()) return alert("Item description is required.");
    if (Number(form.quantity) <= 0) return alert("Quantity must be greater than 0.");
    if (Number(form.unit_price) < 0) return alert("Unit price cannot be negative.");

    try {
      setSaving(true);
      const response = await fetch("/api/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          unit_price: Number(form.unit_price),
          project_id: form.project_id || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not create procurement order.");
      await onSaved();
      alert("Procurement order created successfully.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create procurement order.");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[#22364c] bg-[#091320] p-5">
        <div className="flex items-center justify-between">
          <div><b className="text-sm">New Procurement Order</b><p className="mt-1 text-[10px] text-[#8191a6]">Create a purchase requirement linked to a project.</p></div>
          <button onClick={close} disabled={saving}><X size={17} /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className="field" placeholder="Order number (optional)" value={form.order_number} onChange={(e) => field("order_number", e.target.value)} />
          <select className="field" value={form.project_id} onChange={(e) => field("project_id", e.target.value)}>
            <option value="">Select project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="field sm:col-span-2" placeholder="Item description" value={form.item_description} onChange={(e) => field("item_description", e.target.value)} />
          <input className="field" type="number" min="0.01" step="0.01" placeholder="Quantity" value={form.quantity} onChange={(e) => field("quantity", e.target.value)} />
          <input className="field" type="number" min="0" step="0.01" placeholder="Unit price" value={form.unit_price} onChange={(e) => field("unit_price", e.target.value)} />
          <input className="field" placeholder="Supplier name" value={form.supplier_name} onChange={(e) => field("supplier_name", e.target.value)} />
          <input className="field" type="date" value={form.expected_delivery_date} onChange={(e) => field("expected_delivery_date", e.target.value)} />
          <textarea className="field min-h-[80px] sm:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => field("notes", e.target.value)} />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[#17283a] bg-[#0b1623] px-4 py-3 text-xs">
          <span className="text-[#8191a6]">Order value</span><b>{money(total)}</b>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={close} disabled={saving} className="rounded border border-[#26394d] px-4 py-2 text-xs">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold disabled:opacity-50">{saving ? "Saving..." : "Create Order"}</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FINANCE MODAL
========================================================= */

function FinanceModal({
  type,
  projects,
  invoices,
  close,
  onSaved,
}: {
  type: "invoice" | "payment" | "expense";
  projects: Project[];
  invoices: FinanceInvoice[];
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    invoice_number: "",
    project_id: "",
    invoice_id: "",
    amount: "",
    issue_date: today,
    due_date: "",
    payment_date: today,
    payment_method: "Bank Transfer",
    reference: "",
    notes: "",
    category: "Materials",
    description: "",
  });

  const title = type === "invoice" ? "New Invoice" : type === "payment" ? "Record Payment" : "Record Expense";

  const submit = async () => {
    const payload: Record<string, unknown> = { type, amount: Number(form.amount) };
    if (type === "invoice") Object.assign(payload, { invoice_number: form.invoice_number.trim(), project_id: form.project_id || null, issue_date: form.issue_date || today, due_date: form.due_date || null });
    if (type === "payment") {
      const invoice = invoices.find((x) => x.id === form.invoice_id);
      Object.assign(payload, { invoice_id: form.invoice_id || null, project_id: invoice?.project_id || form.project_id || null, amount: Number(form.amount), payment_date: form.payment_date || today, payment_method: form.payment_method, reference: form.reference, notes: form.notes });
    }
    if (type === "expense") Object.assign(payload, { project_id: form.project_id, category: form.category.trim(), description: form.description, amount: Number(form.amount), expense_date: form.payment_date || today, approved: false });

    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) { alert("Amount must be greater than zero."); return; }
    if (type === "invoice" && !form.invoice_number.trim()) { alert("Invoice number is required."); return; }
    if (type === "payment" && !form.invoice_id) { alert("Select an invoice."); return; }
    if (type === "expense" && !form.project_id) { alert("Select a project."); return; }

    try {
      setSaving(true);
      const response = await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const text = await response.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { /* handled below */ }
      if (!response.ok) throw new Error(data?.error || `Finance API returned ${response.status}`);
      await onSaved();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save finance record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#22364c] bg-[#091320] p-5">
        <div className="flex items-center justify-between">
          <div>
            <b className="text-sm">{title}</b>
            <p className="mt-1 text-[10px] text-[#8191a6]">Save this record directly to Supabase.</p>
          </div>
          <button onClick={close} disabled={saving}><X size={17} /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {type === "invoice" && (
            <>
              <label className="block text-[10px] text-[#8191a6] sm:col-span-2">Invoice Number<input className="field" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-2026-001" /></label>
              <label className="block text-[10px] text-[#8191a6]">Project<select className="field" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label className="block text-[10px] text-[#8191a6]">Amount<input className="field" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6]">Issue Date<input className="field" type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6]">Due Date<input className="field" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
            </>
          )}

          {type === "payment" && (
            <>
              <label className="block text-[10px] text-[#8191a6] sm:col-span-2">Invoice<select className="field" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}><option value="">Select invoice</option>{invoices.map((x) => <option key={x.id} value={x.id}>{x.invoice_number} • Outstanding {money(Math.max(Number(x.amount || 0) - Number(x.paid_amount || 0), 0))}</option>)}</select></label>
              <label className="block text-[10px] text-[#8191a6]">Amount<input className="field" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6]">Payment Date<input className="field" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6]">Payment Method<select className="field" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}><option>Bank Transfer</option><option>Cash</option><option>Cheque</option><option>Card</option><option>Other</option></select></label>
              <label className="block text-[10px] text-[#8191a6]">Reference<input className="field" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="TRX-12345" /></label>
              <label className="block text-[10px] text-[#8191a6] sm:col-span-2">Notes<textarea className="field min-h-[70px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            </>
          )}

          {type === "expense" && (
            <>
              <label className="block text-[10px] text-[#8191a6]">Project<select className="field" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label className="block text-[10px] text-[#8191a6]">Category<input className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6]">Amount<input className="field" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6]">Expense Date<input className="field" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /></label>
              <label className="block text-[10px] text-[#8191a6] sm:col-span-2">Description<textarea className="field min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the expense" /></label>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={close} disabled={saving} className="rounded border border-[#26394d] px-4 py-2 text-xs">Cancel</button>
          <button onClick={submit} disabled={saving} className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold disabled:opacity-50">{saving ? "Saving..." : "Save Record"}</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DATA TABLE
========================================================= */

function DataTable({
  rows,
}: {
  rows: [string, string][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#17283a] bg-[#091320]">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0c1724]">
          <tr>
            <th className="px-4 py-3">
              Reference
            </th>

            <th className="px-4 py-3">
              Details
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="px-4 py-10 text-center text-[#718399]"
              >
                No data available.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={i}
                className="border-t border-[#17283a]"
              >
                <td className="px-4 py-3">
                  {r[0]}
                </td>

                <td className="px-4 py-3">
                  {r[1]}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   SIMPLE MODAL
========================================================= */

function SimpleModal({
  title,
  close,
  fields,
}: {
  title: string;
  close: () => void;
  fields: string[];
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#22364c] bg-[#091320] p-5">
        <div className="flex justify-between">
          <b>{title}</b>

          <button onClick={close}>
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {fields.map((f) => (
            <label
              key={f}
              className="block text-[10px] text-[#8191a6]"
            >
              {f}

              <input
                className="field"
                placeholder={
                  "Enter " + f.toLowerCase()
                }
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            className="rounded border border-[#26394d] px-4 py-2 text-xs"
          >
            Cancel
          </button>

          <button
            onClick={() => setSaved(true)}
            className="rounded bg-[#1769e0] px-4 py-2 text-xs font-bold"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}