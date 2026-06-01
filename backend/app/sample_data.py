from app.schemas import ShopInfo, StaffMember, WeeklySchedule


WOLLONGONG_HOURS = {
    "Monday": "9:30 AM - 6:00 PM",
    "Tuesday": "9:30 AM - 6:00 PM",
    "Wednesday": "Closed",
    "Thursday": "10:00 AM - 7:30 PM",
    "Friday": "10:00 AM - 7:30 PM",
    "Saturday": "9:00 AM - 5:30 PM",
    "Sunday": "10:00 AM - 4:00 PM",
}

WOLLONGONG_PRICES = [
    {"name": "Relaxation Massage", "duration": "60 min", "price": "$88", "description": "Calming massage for general tension and recovery."},
    {"name": "Sports Recovery Massage", "duration": "60 min", "price": "$105", "description": "Targeted recovery work for active customers and weekend sport."},
    {"name": "Remedial Massage", "duration": "60 min", "price": "$108", "description": "Focused treatment for recurring soreness, posture, and movement concerns."},
    {"name": "Deep Tissue Massage", "duration": "75 min", "price": "$125", "description": "Longer firm-pressure session for legs, back, and shoulders."},
    {"name": "Wellness Massage", "duration": "90 min", "price": "$145", "description": "Extended whole-body treatment for deeper reset and relaxation."},
]


SHOP = ShopInfo(
    name="Instyle Massage",
    tagline="Relaxed remedial and wellness massage in a calm Wollongong studio.",
    introduction=(
        "Instyle Massage Wollongong offers practical, restorative treatments for busy customers "
        "who want clear availability, friendly therapists, and an easy visit."
    ),
    hours=WOLLONGONG_HOURS,
    services=[
        "Sports recovery massage",
        "Deep tissue massage",
        "Relaxation massage",
        "Wellness massage",
    ],
    contact={
        "phone": "(02) 8123 4567",
        "email": "hello@instylemassage.example",
    },
    locations=[
        {
            "id": "wollongong",
            "name": "Instyle Massage Wollongong",
            "address": "Shop 5, 112 Crown Street",
            "suburb": "Wollongong",
            "state": "NSW",
            "postcode": "2500",
            "map_url": "https://www.google.com/maps/search/?api=1&query=Instyle+Massage+Wollongong+NSW",
            "hours": WOLLONGONG_HOURS,
            "price_menu": WOLLONGONG_PRICES,
        },
    ],
    price_menu=WOLLONGONG_PRICES,
)

STAFF = [
    StaffMember(
        id="ethan",
        name="Ethan Brooks",
        role="Sports Recovery Therapist",
        branch_id="wollongong",
        specialties=["Sports recovery", "Deep tissue", "Mobility"],
        bio="Ethan helps active customers recover with targeted treatment and practical advice.",
        years_experience=5,
        image_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80",
    ),
    StaffMember(
        id="lily",
        name="Lily Nguyen",
        role="Wellness Massage Therapist",
        branch_id="wollongong",
        specialties=["Relaxation", "Wellness", "Gentle remedial"],
        bio="Lily offers steady, calming sessions for customers seeking whole-body relaxation.",
        years_experience=6,
        image_url="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=480&q=80",
    ),
]

SCHEDULE = WeeklySchedule(
    week_start="2026-06-01",
    days=[
        {
            "date": "2026-06-01",
            "day": "Monday",
            "shifts": [
                {"staff_id": "ethan", "branch_id": "wollongong", "start": "10:00", "end": "17:00", "room": "Wollongong Room 2"},
            ],
        },
        {
            "date": "2026-06-02",
            "day": "Tuesday",
            "shifts": [
                {"staff_id": "lily", "branch_id": "wollongong", "start": "12:00", "end": "18:00", "room": "Wollongong Room 1"},
            ],
        },
        {
            "date": "2026-06-03",
            "day": "Wednesday",
            "shifts": [
                {"staff_id": "ethan", "branch_id": "wollongong", "start": "11:00", "end": "16:00", "room": "Wollongong Room 2"},
            ],
        },
        {
            "date": "2026-06-04",
            "day": "Thursday",
            "shifts": [
                {"staff_id": "lily", "branch_id": "wollongong", "start": "10:00", "end": "15:00", "room": "Wollongong Room 1"},
            ],
        },
        {
            "date": "2026-06-05",
            "day": "Friday",
            "shifts": [
                {"staff_id": "ethan", "branch_id": "wollongong", "start": "12:00", "end": "20:00", "room": "Wollongong Room 2"},
            ],
        },
        {
            "date": "2026-06-06",
            "day": "Saturday",
            "shifts": [
                {"staff_id": "lily", "branch_id": "wollongong", "start": "09:00", "end": "15:00", "room": "Wollongong Room 1"},
            ],
        },
        {
            "date": "2026-06-07",
            "day": "Sunday",
            "shifts": [
                {"staff_id": "ethan", "branch_id": "wollongong", "start": "10:00", "end": "16:00", "room": "Wollongong Room 2"},
            ],
        },
    ],
)
