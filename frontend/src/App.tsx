import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminDashboard } from "./AdminDashboard";
import { loadMassageShopData } from "./api";
import { BranchStaffAvailability } from "./components/BranchStaffAvailability";
import type { ShopInfo, StaffMember } from "./types";

type AppData = {
  shop: ShopInfo;
  staff: StaffMember[];
};

export function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminDashboard />;
  }

  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMassageShopData()
      .then(setData)
      .catch(() => setError("We could not load the latest shop details. Please try again shortly."));
  }, []);

  if (error) {
    return <main className="status-panel" role="alert">{error}</main>;
  }

  if (!data) {
    return <main className="status-panel">Loading Instyle Massage...</main>;
  }

  const { shop, staff } = data;
  if (shop.locations.length === 0) {
    return <main className="status-panel">No branch details are available yet.</main>;
  }

  const selectedLocation = shop.locations.find((location) => location.id === "wollongong") ?? shop.locations[0];
  const selectedHours = Object.keys(selectedLocation.hours).length > 0 ? selectedLocation.hours : shop.hours;
  const selectedPrices = selectedLocation.price_menu.length > 0 ? selectedLocation.price_menu : shop.price_menu;
  const branchStaff = staff.filter((member) => member.branch_id === selectedLocation.id);
  const branchStaffSummary = branchStaff.length > 0 ? branchStaff.map((member) => member.name).join(", ") : "Staff profiles coming soon.";

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#overview">{shop.name}</a>
        <nav aria-label="Primary navigation">
          <a href="#overview">Overview</a>
          <a href="#locations">Locations</a>
          <a href="#prices">Prices</a>
          <a href="#staff">Staff</a>
        </nav>
      </header>

      <main>
        <section className="overview" id="overview">
          <div className="overview-copy">
            <p className="eyebrow">Open this week</p>
            <h1>{shop.name}</h1>
            <p className="tagline">{shop.tagline}</p>
            <p>{shop.introduction}</p>
            <div className="quick-actions">
              <a className="primary-action" href={`tel:${shop.contact.phone}`}>
                <Phone size={18} aria-hidden="true" /> Call {shop.contact.phone}
              </a>
              <a className="secondary-action" href="#locations">View location</a>
            </div>
          </div>

          <aside className="visit-panel" aria-label="Visit information">
            <div>
              <p className="eyebrow">Location</p>
              <h2 className="visit-panel-title">{selectedLocation.suburb}</h2>
            </div>
            <div className="visit-row">
              <MapPin size={20} aria-hidden="true" />
              <div>
                <strong>{selectedLocation.name}</strong>
                <span>{selectedLocation.address}</span>
              </div>
            </div>
            <div className="visit-row">
              <Clock size={20} aria-hidden="true" />
              <div>
                <strong>Staff at this branch</strong>
                <span>{branchStaffSummary}</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="locations-section" id="locations" aria-labelledby="locations-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Visit details</p>
              <h2 id="locations-title">{selectedLocation.suburb} contact and hours</h2>
            </div>
          </div>
          <div className="locations-layout">
            <aside className="selected-branch-panel" aria-label="Selected branch contact">
              <p className="eyebrow">Selected branch</p>
              <h3>{selectedLocation.name}</h3>
              <div className="contact-list">
                <a href={selectedLocation.map_url} target="_blank" rel="noreferrer">
                  <MapPin size={18} aria-hidden="true" /> {selectedLocation.address}, {selectedLocation.suburb}
                </a>
                <a href={`tel:${shop.contact.phone}`}><Phone size={18} aria-hidden="true" /> {shop.contact.phone}</a>
                <a href={`mailto:${shop.contact.email}`}><Mail size={18} aria-hidden="true" /> {shop.contact.email}</a>
                <a className="map-action" href={selectedLocation.map_url} target="_blank" rel="noreferrer" aria-label={`Open ${selectedLocation.name} in Google Maps`}>
                  Open Google Maps
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
            </aside>

            <article className="hours-card" aria-labelledby="hours-title">
              <p className="eyebrow">Opening hours</p>
              <h3 id="hours-title">Weekly hours</h3>
              <dl className="hours-list">
                {Object.entries(selectedHours).map(([day, hours]) => (
                  <div key={day}>
                    <dt>{day}</dt>
                    <dd>{hours}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        <section className="price-section" id="prices" aria-labelledby="prices-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Price menu</p>
              <h2 id="prices-title">{selectedLocation.suburb} services and prices</h2>
            </div>
          </div>
          <div className="price-grid">
            {selectedPrices.map((item) => (
              <article className="price-card" key={`${item.name}-${item.duration}`}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="price-meta">
                  <span>{item.duration}</span>
                  <strong>{item.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <BranchStaffAvailability
          branchId={selectedLocation.id}
          branchName={selectedLocation.suburb}
          staff={staff}
        />
      </main>
    </>
  );
}
