import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BranchStaffAvailability } from "./BranchStaffAvailability";
import type { StaffMember } from "../types";

const staff: StaffMember[] = [
  {
    id: "mia",
    name: "Mia Chen",
    role: "Senior Remedial Therapist",
    branch_id: "wollongong",
    specialties: ["Remedial", "Neck and shoulders"],
    bio: "Focused therapist",
    years_experience: 9,
    image_url: "mia.jpg",
  },
  {
    id: "ava",
    name: "Ava Stone",
    role: "Relaxation Therapist",
    branch_id: "wollongong",
    specialties: ["Relaxation"],
    bio: "Calm therapist",
    years_experience: 5,
    image_url: "ava.jpg",
  },
  {
    id: "noah",
    name: "Noah Park",
    role: "Deep Tissue Therapist",
    branch_id: "wollongong",
    specialties: ["Deep tissue"],
    bio: "Focused therapist",
    years_experience: 7,
    image_url: "noah.jpg",
  },
  {
    id: "zoe",
    name: "Zoe Hall",
    role: "Wellness Therapist",
    branch_id: "wollongong",
    specialties: ["Relaxation"],
    bio: "Warm therapist",
    years_experience: 4,
    image_url: "zoe.jpg",
  },
  {
    id: "ian",
    name: "Ian Clark",
    role: "Remedial Therapist",
    branch_id: "wollongong",
    specialties: ["Remedial"],
    bio: "Attentive therapist",
    years_experience: 6,
    image_url: "ian.jpg",
  },
];

describe("BranchStaffAvailability", () => {
  it("shows a three-staff branch preview and reveals the rest on request", () => {
    render(<BranchStaffAvailability branchId="wollongong" branchName="Wollongong" staff={staff} />);

    expect(screen.getByText("Ava Stone")).toBeInTheDocument();
    expect(screen.getByText("Ian Clark")).toBeInTheDocument();
    expect(screen.getByText("Mia Chen")).toBeInTheDocument();
    expect(screen.queryByText("Noah Park")).not.toBeInTheDocument();
    expect(screen.queryByText("Zoe Hall")).not.toBeInTheDocument();
    expect(screen.queryByText("Monday")).not.toBeInTheDocument();
    expect(screen.queryByText("10:00 - 16:00")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All staff here" }));

    expect(screen.getByText("Noah Park")).toBeInTheDocument();
    expect(screen.getByText("Zoe Hall")).toBeInTheDocument();
  });
});
