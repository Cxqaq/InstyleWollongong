import { ArrowLeft, CalendarDays, DollarSign, ImagePlus, MapPin, Plus, Save, Store, Trash2, Users } from "lucide-react";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { clearAdminToken, getAdminToken, loadMassageShopData, loginAdmin, removeStaffMember, saveSchedule, saveShop, saveStaffMember } from "./api";
import type { BranchLocation, PriceMenuItem, ShopInfo, StaffMember, WeeklySchedule } from "./types";

type AdminData = {
  shop: ShopInfo;
  staff: StaffMember[];
  schedule: WeeklySchedule;
};

type AdminPage = "home" | "shop" | "branches" | "prices" | "staff" | "schedule";

const adminCards: Array<{ href: string; title: string; text: string; icon: ReactNode }> = [
  { href: "/admin/shop", title: "Shop overview", text: "Intro copy, phone, email, and service tags.", icon: <Store size={22} aria-hidden="true" /> },
  { href: "/admin/branches", title: "Location", text: "Wollongong address, opening hours, and Google Maps link.", icon: <MapPin size={22} aria-hidden="true" /> },
  { href: "/admin/prices", title: "Price menu", text: "Massage services, duration, description, and price.", icon: <DollarSign size={22} aria-hidden="true" /> },
  { href: "/admin/staff", title: "Staff", text: "Create, update, delete, and upload staff photos.", icon: <Users size={22} aria-hidden="true" /> },
  { href: "/admin/schedule", title: "Weekly schedule", text: "Edit the internal roster and staff availability records.", icon: <CalendarDays size={22} aria-hidden="true" /> },
];

const blankStaff: StaffMember = {
  id: "",
  name: "",
  role: "",
  branch_id: "wollongong",
  specialties: [],
  bio: "",
  years_experience: 0,
  image_url: "",
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffMember>(blankStaff);
  const [activeBranchId, setActiveBranchId] = useState("wollongong");
  const [scheduleText, setScheduleText] = useState("");
  const [notice, setNotice] = useState("Loading owner tools...");
  const [adminToken, setAdminTokenState] = useState(() => getAdminToken());
  const page = getAdminPage();

  async function refresh(message = "Saved successfully. Customer page is now using the latest database data.") {
    const next = await loadMassageShopData();
    setData(next);
    setScheduleText(JSON.stringify(next.schedule, null, 2));
    setNotice(message);
  }

  useEffect(() => {
    if (!adminToken) {
      return;
    }
    refresh("Owner tools ready.").catch(() => setNotice("Could not load admin data."));
  }, [adminToken]);

  if (!adminToken) {
    return <AdminLogin onSignedIn={(token) => setAdminTokenState(token)} />;
  }

  if (!data) {
    return <main className="status-panel">{notice}</main>;
  }

  const { shop, staff } = data;
  const activeBranch = shop.locations.find((location) => location.id === activeBranchId) ?? shop.locations.find((location) => location.id === "wollongong") ?? shop.locations[0];
  const activeBranchIndex = Math.max(0, shop.locations.findIndex((location) => location.id === activeBranch?.id));

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Owner admin</p>
          <h1>{page === "home" ? "Manage Instyle Massage" : pageTitle(page)}</h1>
        </div>
        <div className="admin-header-actions">
          {page !== "home" && <a className="secondary-action" href="/admin"><ArrowLeft size={18} aria-hidden="true" /> Sections</a>}
          <button className="secondary-action" type="button" onClick={handleLogout}>Sign out</button>
          <a className="secondary-action" href="/"><ArrowLeft size={18} aria-hidden="true" /> Customer site</a>
        </div>
      </header>

      <p className="admin-status" role="status">{notice}</p>

      {page === "home" && AdminHome()}
      {page === "shop" && ShopEditor()}
      {page === "branches" && BranchesEditor()}
      {page === "prices" && PricesEditor()}
      {page === "staff" && StaffEditor()}
      {page === "schedule" && ScheduleEditor()}
    </main>
  );

  function AdminHome() {
    return (
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose section</p>
            <h2>Edit one part at a time</h2>
          </div>
        </div>
        <div className="admin-card-grid">
          {adminCards.map((card) => (
            <a className="admin-card-link" href={card.href} key={card.href}>
              {card.icon}
              <span>
                <strong>{card.title}</strong>
                <small>{card.text}</small>
              </span>
            </a>
          ))}
        </div>
      </section>
    );
  }

  function handleLogout() {
    clearAdminToken();
    setAdminTokenState(null);
    setData(null);
    setNotice("Signed out.");
  }

  function handleAdminError(error: unknown, fallbackMessage = "Could not save changes. Please try again.") {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("401")) {
      clearAdminToken();
      setAdminTokenState(null);
      setData(null);
      setNotice("Your admin session expired. Please sign in again.");
      return;
    }
    setNotice(fallbackMessage);
  }

  function ShopEditor() {
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      try {
        await saveShop(shop);
        await refresh();
      } catch (error) {
        handleAdminError(error);
      }
    }

    return (
      <form className="admin-section admin-editor shop-editor" onSubmit={handleSubmit}>
        <EditorHeading eyebrow="Shop overview" title="Edit customer-facing shop copy" />
        <div className="admin-grid two">
          <label>Shop name<input value={shop.name} onChange={(event) => updateShop({ name: event.target.value })} /></label>
          <label>Tagline<input value={shop.tagline} onChange={(event) => updateShop({ tagline: event.target.value })} /></label>
          <label className="span-2">Introduction<textarea value={shop.introduction} onChange={(event) => updateShop({ introduction: event.target.value })} /></label>
          <label>Phone<input value={shop.contact.phone} onChange={(event) => updateShop({ contact: { ...shop.contact, phone: event.target.value } })} /></label>
          <label>Email<input value={shop.contact.email} onChange={(event) => updateShop({ contact: { ...shop.contact, email: event.target.value } })} /></label>
          <label className="span-2">Services comma separated<input value={shop.services.join(", ")} onChange={(event) => updateShop({ services: splitList(event.target.value) })} /></label>
        </div>
        <SaveBar label="Save shop overview" />
      </form>
    );
  }

  function BranchesEditor() {
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      try {
        await saveShop(shop);
        await refresh();
      } catch (error) {
        handleAdminError(error);
      }
    }

    return (
      <form className="admin-section admin-editor branches-editor" onSubmit={handleSubmit}>
        <EditorHeading eyebrow="Location" title="Edit Wollongong shop details" />
        <div className="admin-array">
          <div className="admin-subheading">
            <h3>Wollongong location</h3>
          </div>
          {shop.locations.map((location, index) => (
            <div className="admin-array-row branch-row" key={index}>
              <input aria-label="Branch ID" value={location.id} readOnly />
              <input aria-label="Branch name" value={location.name} onChange={(event) => updateLocation(index, { name: event.target.value })} />
              <input aria-label="Address" value={location.address} onChange={(event) => updateLocation(index, { address: event.target.value })} />
              <input aria-label="Suburb" value={location.suburb} onChange={(event) => updateLocation(index, { suburb: event.target.value })} />
              <input aria-label="State" value={location.state} onChange={(event) => updateLocation(index, { state: event.target.value })} />
              <input aria-label="Postcode" value={location.postcode} onChange={(event) => updateLocation(index, { postcode: event.target.value })} />
              <input className="wide" aria-label="Map URL" value={location.map_url} onChange={(event) => updateLocation(index, { map_url: event.target.value })} />
              <div className="branch-hours-editor">
                <strong>Opening hours</strong>
                {days.map((day) => (
                  <label key={day}>
                    {day}
                    <input
                      value={location.hours?.[day] ?? ""}
                      onChange={(event) => updateLocation(index, { hours: { ...(location.hours ?? {}), [day]: event.target.value } })}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <SaveBar label="Save location" />
      </form>
    );
  }

  function PricesEditor() {
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      try {
        await saveShop(shop);
        await refresh();
      } catch (error) {
        handleAdminError(error);
      }
    }

    return (
      <form className="admin-section admin-editor prices-editor" onSubmit={handleSubmit}>
        <EditorHeading eyebrow="Price menu" title="Edit massage prices" />
        {shop.locations.length > 1 && <BranchPicker />}
        <div className="admin-array">
          <div className="admin-subheading">
            <h3>{activeBranch?.suburb} prices</h3>
            <button type="button" onClick={() => updateLocation(activeBranchIndex, { price_menu: [...(activeBranch?.price_menu ?? []), newPrice()] })}><Plus size={16} aria-hidden="true" /> Add service</button>
          </div>
          {(activeBranch?.price_menu ?? []).map((item, index) => (
            <div className="admin-array-row price-row" key={index}>
              <input aria-label="Service name" value={item.name} onChange={(event) => updatePrice(index, { name: event.target.value })} />
              <input aria-label="Duration" value={item.duration} onChange={(event) => updatePrice(index, { duration: event.target.value })} />
              <input aria-label="Price" value={item.price} onChange={(event) => updatePrice(index, { price: event.target.value })} />
              <input className="wide" aria-label="Description" value={item.description} onChange={(event) => updatePrice(index, { description: event.target.value })} />
              <button type="button" aria-label={`Delete ${item.name || "service"}`} onClick={() => updateLocation(activeBranchIndex, { price_menu: (activeBranch?.price_menu ?? []).filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          ))}
        </div>
        <SaveBar label="Save price menu" />
      </form>
    );
  }

  function StaffEditor() {
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      const nextStaff = { ...activeStaff, id: activeStaff.id.trim(), name: activeStaff.name.trim(), role: activeStaff.role.trim(), branch_id: activeStaff.branch_id.trim() };
      if (!nextStaff.id || !nextStaff.name || !nextStaff.role || !nextStaff.branch_id) {
        setNotice("Staff ID, name, role, and branch are required.");
        return;
      }
      try {
        await saveStaffMember(nextStaff);
        setActiveStaff({ ...blankStaff, branch_id: activeBranch?.id ?? "wollongong" });
        await refresh();
      } catch (error) {
        handleAdminError(error, "Could not save that staff member. Please check the details and try again.");
      }
    }

    async function handleDelete(staffId: string) {
      try {
        await removeStaffMember(staffId);
        await refresh("Staff member removed successfully.");
      } catch (error) {
        handleAdminError(error, "Could not remove that staff member. Please try again.");
      }
    }

    return (
      <section className="admin-section admin-editor staff-editor">
        <EditorHeading eyebrow="Staff" title="Add, edit, delete, and upload photos" />
        <div className="admin-page-actions">
          <button className="secondary-action" type="button" onClick={() => setActiveStaff({ ...blankStaff, branch_id: activeBranch?.id ?? "wollongong" })}>
            <Plus size={18} aria-hidden="true" /> New staff
          </button>
        </div>
        <div className="admin-staff-list">
          {staff.map((member) => (
            <article key={member.id}>
              <strong>{member.name}</strong>
              <span>{member.role} / {member.branch_id}</span>
              <button type="button" onClick={() => setActiveStaff(member)}>Edit</button>
              <button type="button" aria-label={`Delete ${member.name}`} onClick={() => handleDelete(member.id)}><Trash2 size={16} aria-hidden="true" /></button>
            </article>
          ))}
        </div>

        <form className="admin-grid two staff-form" onSubmit={handleSubmit}>
          <div className="staff-photo-editor">
            {activeStaff.image_url ? <img src={activeStaff.image_url} alt={activeStaff.name || "Staff preview"} /> : <div className="photo-placeholder"><ImagePlus size={28} aria-hidden="true" /> Photo preview</div>}
            <label className="upload-button">
              <ImagePlus size={18} aria-hidden="true" />
              Upload photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div className="admin-grid two">
            <label>ID<input required value={activeStaff.id} onChange={(event) => updateActiveStaff({ id: event.target.value })} /></label>
            <label>Name<input required value={activeStaff.name} onChange={(event) => updateActiveStaff({ name: event.target.value })} /></label>
            <label>Role<input required value={activeStaff.role} onChange={(event) => updateActiveStaff({ role: event.target.value })} /></label>
            <label>Branch<select required value={activeStaff.branch_id} onChange={(event) => updateActiveStaff({ branch_id: event.target.value })}>{shop.locations.map((location) => <option key={location.id} value={location.id}>{location.suburb}</option>)}</select></label>
            <label>Years experience<input type="number" value={activeStaff.years_experience} onChange={(event) => updateActiveStaff({ years_experience: Number(event.target.value) })} /></label>
            <label>Image URL<input value={activeStaff.image_url} onChange={(event) => updateActiveStaff({ image_url: event.target.value })} /></label>
            <label className="span-2">Specialties comma separated<input value={activeStaff.specialties.join(", ")} onChange={(event) => updateActiveStaff({ specialties: splitList(event.target.value) })} /></label>
            <label className="span-2">Bio<textarea value={activeStaff.bio} onChange={(event) => updateActiveStaff({ bio: event.target.value })} /></label>
          </div>
          <SaveBar label="Save staff" />
        </form>
      </section>
    );
  }

  function ScheduleEditor() {
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      try {
        await saveSchedule(JSON.parse(scheduleText) as WeeklySchedule);
        await refresh();
      } catch (error) {
        if (error instanceof SyntaxError) {
          setNotice("Schedule JSON is invalid. Please check the format and try again.");
          return;
        }
        handleAdminError(error, "Could not save the schedule. Please check the format and try again.");
      }
    }

    return (
      <form className="admin-section admin-editor schedule-editor" onSubmit={handleSubmit}>
        <EditorHeading eyebrow="Weekly schedule" title="Edit roster JSON" />
        <textarea className="json-editor" value={scheduleText} onChange={(event) => setScheduleText(event.target.value)} spellCheck={false} />
        <SaveBar label="Save schedule" />
      </form>
    );
  }

  function EditorHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
    );
  }

  function BranchPicker() {
    return (
      <div className="admin-branch-picker" aria-label="Choose location to edit">
        {shop.locations.map((location) => (
          <button
            className={location.id === activeBranch?.id ? "is-selected" : ""}
            key={location.id}
            type="button"
            onClick={() => setActiveBranchId(location.id)}
          >
            {location.suburb}
          </button>
        ))}
      </div>
    );
  }

  function SaveBar({ label }: { label: string }) {
    return (
      <div className="save-bar">
        <button className="primary-action" type="submit"><Save size={18} aria-hidden="true" /> {label}</button>
      </div>
    );
  }

  function updateShop(patch: Partial<ShopInfo>) {
    setData((current) => current ? { ...current, shop: { ...current.shop, ...patch } } : current);
  }

  function updateLocation(index: number, patch: Partial<BranchLocation>) {
    updateShop({ locations: shop.locations.map((location, itemIndex) => itemIndex === index ? { ...location, ...patch } : location) });
  }

  function updatePrice(index: number, patch: Partial<PriceMenuItem>) {
    updateLocation(activeBranchIndex, {
      price_menu: (activeBranch?.price_menu ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    });
  }

  function updateActiveStaff(patch: Partial<StaffMember>) {
    setActiveStaff((current) => ({ ...current, ...patch }));
  }

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await resizeStaffPhoto(file);
      updateActiveStaff({ image_url: imageUrl });
      setNotice("Photo resized. Press Save staff to store it in the database.");
    } catch {
      setNotice("Could not load that photo. Please try a different image.");
    }
  }
}

function AdminLogin({ onSignedIn }: { onSignedIn: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Sign in to edit the website.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await loginAdmin(username, password);
      onSignedIn(token);
    } catch {
      setMessage("Username or password is not correct.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-section admin-login-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Owner admin</p>
            <h1>Sign in</h1>
          </div>
        </div>
        <p className="admin-status" role="status">{message}</p>
        <form className="admin-grid login-form" onSubmit={handleSubmit}>
          <label>Username<input value={username} autoComplete="username" onChange={(event) => setUsername(event.target.value)} /></label>
          <label>Password<input type="password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} /></label>
          <div className="save-bar">
            <button className="primary-action" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</button>
          </div>
        </form>
        <a className="secondary-action admin-login-back" href="/">Customer site</a>
      </section>
    </main>
  );
}

function resizeStaffPhoto(file: File): Promise<string> {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  const targetSize = 640;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas is not available."));
        return;
      }

      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
      const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);
      canvas.width = targetSize;
      canvas.height = targetSize;
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded."));
    };
    image.src = objectUrl;
  });
}

function getAdminPage(): AdminPage {
  const part = window.location.pathname.split("/").filter(Boolean)[1];
  if (part === "shop" || part === "branches" || part === "prices" || part === "staff" || part === "schedule") {
    return part;
  }
  return "home";
}

function pageTitle(page: AdminPage) {
  const titles: Record<AdminPage, string> = {
    home: "Manage Instyle Massage",
    shop: "Shop Overview",
    branches: "Location",
    prices: "Price Menu",
    staff: "Staff",
    schedule: "Weekly Schedule",
  };
  return titles[page];
}

function newPrice(): PriceMenuItem {
  return { name: "New service", duration: "60 min", price: "$0", description: "" };
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
