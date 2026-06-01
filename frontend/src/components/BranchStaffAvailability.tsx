import { useEffect, useState } from "react";
import type { StaffMember } from "../types";

type BranchStaffAvailabilityProps = {
  branchId: string;
  branchName: string;
  staff: StaffMember[];
};

const previewCount = 3;

export function BranchStaffAvailability({ branchId, branchName, staff }: BranchStaffAvailabilityProps) {
  const [showAllStaff, setShowAllStaff] = useState(false);
  const branchStaff = staff
    .filter((member) => member.branch_id === branchId)
    .sort((left, right) => left.name.localeCompare(right.name));
  const visibleStaff = showAllStaff ? branchStaff : branchStaff.slice(0, previewCount);
  const hasHiddenStaff = branchStaff.length > previewCount;

  useEffect(() => {
    setShowAllStaff(false);
  }, [branchId]);

  return (
    <section className="staff-section" id="staff" aria-labelledby="staff-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Staff</p>
          <h2 id="staff-title">{branchName} staff</h2>
        </div>
      </div>

      {branchStaff.length === 0 ? (
        <p className="empty-shifts">No staff listed for this branch yet.</p>
      ) : (
        <>
          <div className="staff-availability-grid">
            {visibleStaff.map((member) => (
              <article className="staff-availability-card" key={member.id}>
                {member.image_url ? (
                  <img src={member.image_url} alt={member.name} />
                ) : (
                  <div className="staff-photo-fallback" aria-hidden="true">{member.name.slice(0, 1)}</div>
                )}
                <div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </article>
            ))}
          </div>
          {hasHiddenStaff && (
            <div className="staff-reveal-row">
              <button type="button" aria-expanded={showAllStaff} onClick={() => setShowAllStaff((current) => !current)}>
                {showAllStaff ? "Show less staff" : "All staff here"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
