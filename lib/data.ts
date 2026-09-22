export type Project = {
  id: string;
  name: string;
  location: string;
  budget: number | string;
  spent: number | string;
  manager: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  progress: number;
};
export const projects: Project[] = [
  {
    id: "1",
    name: "Greenfield Towers",
    location: "Lagos, Nigeria",
    progress: 82,
    budget: 450000000,
    spent: 369000000,
    status: "On Track",
    manager: "David Ade",
  },
  {
    id: "2",
    name: "Sunset Apartments",
    location: "Abuja, Nigeria",
    progress: 61,
    budget: 380000000,
    spent: 247000000,
    status: "On Track",
    manager: "Sarah Obi",
  },
  {
    id: "3",
    name: "Victoria Island Mall",
    location: "Lagos, Nigeria",
    progress: 88,
    budget: 620000000,
    spent: 516000000,
    status: "On Track",
    manager: "Emeka John",
  },
  {
    id: "4",
    name: "Lekki Residences",
    location: "Lagos, Nigeria",
    progress: 43,
    budget: 310000000,
    spent: 218000000,
    status: "Delayed",
    manager: "Tunde Kay",
  },
  {
    id: "5",
    name: "PH Office Complex",
    location: "Rivers, Nigeria",
    progress: 76,
    budget: 290000000,
    spent: 197000000,
    status: "At Risk",
    manager: "Ibrahim Musa",
  },
];

export const invoices = [
  {
    id: "INV-2024-089",
    client: "ABC Properties",
    amount: 12500000,
    due: "05 May 2024",
    days: 5,
  },
  {
    id: "INV-2024-087",
    client: "Sunset Homes",
    amount: 18750000,
    due: "01 May 2024",
    days: 9,
  },
  {
    id: "INV-2024-083",
    client: "Greenfield Ltd.",
    amount: 9800000,
    due: "15 May 2024",
    days: 0,
  },
  {
    id: "INV-2024-079",
    client: "Victoria Mall Ltd.",
    amount: 25000000,
    due: "20 May 2024",
    days: 0,
  },
];


export const equipment = [
  {
    name: "Excavator CAT 320",
    status: "Operational",
    project: "Greenfield Towers",
  },
  {
    name: "Crane TC-90",
    status: "Maintenance",
    project: "Victoria Island Mall",
  },
  {
    name: "Concrete Mixer CM-12",
    status: "Operational",
    project: "Sunset Apartments",
  },
  {
    name: "Bulldozer BD-04",
    status: "Out of Service",
    project: "Lekki Residences",
  },
];

export const staff = [
  {
    name: "David Ade",
    role: "Site Engineer",
    status: "Present",
  },
  {
    name: "Sarah Obi",
    role: "Project Manager",
    status: "Present",
  },
  {
    name: "Emeka John",
    role: "Site Supervisor",
    status: "Present",
  },
  {
    name: "Tunde Kay",
    role: "Foreman",
    status: "Absent",
  },
];

export const procurement = [
  {
    id: "PR-1042",
    item: "Cement — 500 bags",
    project: "Greenfield Towers",
    status: "Pending Approval",
    amount: 6500000,
  },
  {
    id: "PR-1039",
    item: "Rebar — 40 tonnes",
    project: "Lekki Residences",
    status: "Ordered",
    amount: 28500000,
  },
  {
    id: "PR-1034",
    item: "Electrical materials",
    project: "VI Mall",
    status: "Delivered",
    amount: 12400000,
  },
];

export const incidents = [
  {
    id: "INC-024",
    project: "Lekki Residences",
    severity: "Medium",
    text: "Minor site access incident",
    status: "Open",
  },
  {
    id: "INC-023",
    project: "Greenfield Towers",
    severity: "Low",
    text: "PPE compliance observation",
    status: "Closed",
  },
  {
    id: "INC-021",
    project: "PH Office Complex",
    severity: "High",
    text: "Equipment safety observation",
    status: "Open",
  },
];


export const money = (n: number) =>
  "₦" + n.toLocaleString("en-NG");

