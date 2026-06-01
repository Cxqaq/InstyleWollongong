export type ContactInfo = {
  phone: string;
  email: string;
};

export type BranchLocation = {
  id: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  map_url: string;
  hours: Record<string, string>;
  price_menu: PriceMenuItem[];
};

export type ShopInfo = {
  name: string;
  tagline: string;
  introduction: string;
  hours: Record<string, string>;
  services: string[];
  contact: ContactInfo;
  locations: BranchLocation[];
  price_menu: PriceMenuItem[];
};

export type PriceMenuItem = {
  name: string;
  duration: string;
  price: string;
  description: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  branch_id: string;
  specialties: string[];
  bio: string;
  years_experience: number;
  image_url: string;
};

export type Shift = {
  staff_id: string;
  branch_id: string;
  start: string;
  end: string;
  room: string;
};

export type DaySchedule = {
  date: string;
  day: string;
  shifts: Shift[];
};

export type WeeklySchedule = {
  week_start: string;
  days: DaySchedule[];
};
