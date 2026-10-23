import { useState } from "react";
import "./App.css";

type Trip = {
  id: number;
  origin_city: string;
  destination_city: string;
  departure_at: string;
  available_capacity_kg: number;
  price: number;
  status: string;
  vehicle_type: string;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: "customer" | "driver" | "owner";
};

type Vehicle = {
  id: number;
  owner_id: number;
  registration_number: string;
  vehicle_type: string;
  capacity_kg: number;
  verification_status: string;
};

type Driver = {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
};

function App() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const [user, setUser] = useState<User | null>(null);

  const [showVehicles, setShowVehicles] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [vehicleRegistration, setVehicleRegistration] =
    useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleCapacity, setVehicleCapacity] =
    useState("");

  const [isAddingVehicle, setIsAddingVehicle] =
    useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] =
    useState(false);

  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] =
    useState("");
  const [authRole, setAuthRole] = useState<
    "customer" | "driver" | "owner"
  >("customer");

  const [isAuthenticating, setIsAuthenticating] =
    useState(false);

  const [message, setMessage] = useState("");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isSearching, setIsSearching] =
    useState(false);

  const [showPostTrip, setShowPostTrip] =
    useState(false);

  const [tripOrigin, setTripOrigin] = useState("");
  const [tripDestination, setTripDestination] =
    useState("");
  const [tripDate, setTripDate] = useState("");
  const [tripTime, setTripTime] = useState("");
  const [tripCapacity, setTripCapacity] =
    useState("");
  const [tripPrice, setTripPrice] = useState("");

  const [isPosting, setIsPosting] =
    useState(false);

  const [selectedVehicleId, setSelectedVehicleId] =
    useState("");

  const [drivers, setDrivers] = useState<Driver[]>(
    [],
  );

  const [selectedDriverId, setSelectedDriverId] =
    useState("");

  const [isLoadingDrivers, setIsLoadingDrivers] =
    useState(false);

  // =========================
  // BOOKING STATE
  // =========================

  const [showBooking, setShowBooking] =
    useState(false);

  const [selectedTrip, setSelectedTrip] =
    useState<Trip | null>(null);

  const [goodsDescription, setGoodsDescription] =
    useState("");

  const [goodsWeight, setGoodsWeight] =
    useState("");
  type CustomerBooking = {
  id: number
  trip_id: number
  goods_description: string
  weight_kg: number
  quoted_price: number | null
  status: string
  origin_city: string
  destination_city: string
  departure_at: string
  trip_status: string
  vehicle_type: string
}

const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([])
const [isLoadingBookings, setIsLoadingBookings] = useState(false)
const [showBookings, setShowBookings] = useState(false) 

  const [isBooking, setIsBooking] =
    useState(false);

  // =========================
  // AUTH
  // =========================

  function closeAuthModal() {
    setShowLogin(false);
    setShowRegister(false);

    setAuthName("");
    setAuthEmail("");
    setAuthPhone("");
    setAuthPassword("");
    setAuthRole("customer");

    setMessage("");
  }

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!authEmail.trim() || !authPassword) {
      setMessage(
        "Please enter your email and password.",
      );
      return;
    }

    setIsAuthenticating(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: authEmail.trim(),
            password: authPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Login failed.",
        );
        return;
      }

      setUser(data.user);

      setShowLogin(false);

      setAuthEmail("");
      setAuthPassword("");

      setMessage(
        `Welcome back, ${data.user.full_name}!`,
      );
    } catch (error) {
      console.error("Login failed:", error);

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !authName.trim() ||
      !authEmail.trim() ||
      !authPassword
    ) {
      setMessage(
        "Please fill in your name, email, and password.",
      );
      return;
    }

    if (authPassword.length < 8) {
      setMessage(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    setIsAuthenticating(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: authName.trim(),
            email: authEmail.trim(),
            phone: authPhone.trim() || undefined,
            password: authPassword,
            role: authRole,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed.",
        );
        return;
      }

      setAuthName("");
      setAuthEmail("");
      setAuthPhone("");
      setAuthPassword("");
      setAuthRole("customer");

      setShowRegister(false);
      setShowLogin(true);

      setMessage(
        "Account created successfully. Please login to continue.",
      );
    } catch (error) {
      console.error(
        "Registration failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  // =========================
  // SEARCH
  // =========================

  async function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const origin = pickup.trim();
    const target = destination.trim();

    if (!origin || !target) {
      setMessage(
        "Please enter both pickup and destination cities.",
      );
      setTrips([]);
      return;
    }

    if (
      origin.localeCompare(target, undefined, {
        sensitivity: "accent",
      }) === 0
    ) {
      setMessage(
        "Pickup and destination must be different.",
      );
      setTrips([]);
      return;
    }

    setIsSearching(true);
    setMessage("");
    setTrips([]);

    try {
      const response = await fetch(
        `http://localhost:5000/api/trips/search?origin=${encodeURIComponent(
          origin,
        )}&destination=${encodeURIComponent(
          target,
        )}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to search for trips.",
        );
        return;
      }

      setTrips(data.trips);

      if (data.count === 0) {
        setMessage(
          `No available transport found from ${origin} to ${target}.`,
        );
      } else {
        setMessage(
          `${data.count} available transport option${
            data.count === 1 ? "" : "s"
          } found from ${origin} to ${target}.`,
        );
      }
    } catch (error) {
      console.error(
        "Trip search failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  // =========================
  // VEHICLES
  // =========================

  async function loadVehicles(ownerId: number) {
    setIsLoadingVehicles(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/vehicles/owner/${ownerId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to load vehicles.",
        );
        return;
      }

      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error(
        "Vehicle loading failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsLoadingVehicles(false);
    }
  }

  async function loadDrivers() {
    setIsLoadingDrivers(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/drivers",
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to load drivers.",
        );
        return;
      }

      setDrivers(data.drivers || []);
    } catch (error) {
      console.error(
        "Driver loading failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsLoadingDrivers(false);
    }
  }

  async function handleAddVehicle(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const registration =
      vehicleRegistration.trim();
    const type = vehicleType.trim();
    const capacity = Number(vehicleCapacity);

    if (!registration || !type) {
      setMessage(
        "Please enter registration number and vehicle type.",
      );
      return;
    }

    if (
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      setMessage(
        "Vehicle capacity must be greater than 0.",
      );
      return;
    }

    setIsAddingVehicle(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/vehicles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner_id: user.id,
            registration_number: registration,
            vehicle_type: type,
            capacity_kg: capacity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to add vehicle.",
        );
        return;
      }

      setMessage(
        `Vehicle ${data.vehicle.registration_number} added successfully.`,
      );

      setVehicleRegistration("");
      setVehicleType("");
      setVehicleCapacity("");

      setShowAddVehicle(false);

      await loadVehicles(user.id);
    } catch (error) {
      console.error(
        "Vehicle creation failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsAddingVehicle(false);
    }
  }

  // =========================
  // POST TRIP
  // =========================

  async function handlePostTrip(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const origin = tripOrigin.trim();
    const destination =
      tripDestination.trim();

    if (
      !origin ||
      !destination ||
      !tripDate ||
      !tripTime
    ) {
      setMessage(
        "Please fill in all required trip details.",
      );
      return;
    }

    if (
      origin.localeCompare(
        destination,
        undefined,
        {
          sensitivity: "accent",
        },
      ) === 0
    ) {
      setMessage(
        "Trip origin and destination must be different.",
      );
      return;
    }

    const capacity = Number(tripCapacity);
    const price = tripPrice
      ? Number(tripPrice)
      : null;

    if (
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      setMessage(
        "Available capacity must be greater than 0.",
      );
      return;
    }

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      setMessage("Price must be 0 or greater.");
      return;
    }

    const departureAt = `${tripDate}T${tripTime}:00+05:30`;

    setIsPosting(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle_id:
              Number(selectedVehicleId),
            driver_id:
              Number(selectedDriverId),
            origin_city: origin,
            destination_city:
              destination,
            departure_at:
              departureAt,
            available_capacity_kg:
              capacity,
            price,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to post the trip.",
        );
        return;
      }

      setMessage(
        `Trip posted successfully: ${origin} → ${destination}.`,
      );

      setTripOrigin("");
      setTripDestination("");
      setTripDate("");
      setTripTime("");
      setTripCapacity("");
      setTripPrice("");
      setSelectedVehicleId("");
      setSelectedDriverId("");
    } catch (error) {
      console.error(
        "Trip posting failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsPosting(false);
    }
  }

  // =========================
  // BOOKING
  // =========================

  function openBooking(trip: Trip) {
    if (!user) {
      setMessage(
        "Please login as a customer to book a trip.",
      );
      setShowLogin(true);
      setShowRegister(false);
      return;
    }

    if (user.role !== "customer") {
      setMessage(
        "Only customer accounts can book transport.",
      );
      return;
    }

    setSelectedTrip(trip);
    setGoodsDescription("");
    setGoodsWeight("");
    setShowBooking(true);
    setMessage("");
  }

  function closeBooking() {
    setShowBooking(false);
    setSelectedTrip(null);
    setGoodsDescription("");
    setGoodsWeight("");
  }
  const loadCustomerBookings = async () => {
  if (!user || user.role !== "customer") {
    return
  }

  setIsLoadingBookings(true)

  try {
    const response = await fetch(
      `http://localhost:5000/api/bookings/customer/${user.id}`,
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(
        data.message ||
          "Unable to load your bookings.",
      )
      return
    }

    setCustomerBookings(
      data.bookings || [],
    )
  } catch (error) {
    console.error(
      "Customer bookings loading failed:",
      error,
    )

    setMessage(
      "Unable to connect to RouteBack server.",
    )
  } finally {
    setIsLoadingBookings(false)
  }
}

  async function handleBooking(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    if (!selectedTrip) {
      setMessage("Please select a trip.");
      return;
    }

    const description =
      goodsDescription.trim();
    const weight = Number(goodsWeight);

    if (!description) {
      setMessage(
        "Please enter a description of your goods.",
      );
      return;
    }

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      setMessage(
        "Goods weight must be greater than 0.",
      );
      return;
    }

    if (
      weight >
      Number(
        selectedTrip.available_capacity_kg,
      )
    ) {
      setMessage(
        `Only ${selectedTrip.available_capacity_kg} kg capacity is available.`,
      );
      return;
    }

    setIsBooking(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trip_id: selectedTrip.id,
            customer_id: user.id,
            goods_description:
              description,
            weight_kg: weight,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to create booking.",
        );
        return;
      }

      setShowBooking(false);

      setSelectedTrip(null);

      setGoodsDescription("");
      setGoodsWeight("");

      setMessage(
        `Booking confirmed successfully. Booking ID: ${data.booking.id}. Remaining capacity: ${data.remaining_capacity_kg} kg.`,
      );

      // Update the result card locally
      setTrips((currentTrips) =>
        currentTrips
          .map((trip) =>
            trip.id === selectedTrip.id
              ? {
                  ...trip,
                  available_capacity_kg:
                    data.remaining_capacity_kg,
                  status:
                    data.trip_status,
                }
              : trip,
          )
          .filter(
            (trip) =>
              trip.available_capacity_kg > 0,
          ),
      );
    } catch (error) {
      console.error(
        "Booking failed:",
        error,
      );

      setMessage(
        "Unable to connect to RouteBack server. Please make sure the backend is running.",
      );
    } finally {
      setIsBooking(false);
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="app">
      {/* NAVBAR */}

      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">
            R
          </span>

          <span>
            Route
            <span className="brand-accent">
              Back
            </span>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#how-it-works">
            How it works
          </a>

          <a href="#customers">
            For customers
          </a>

          <a href="#drivers">
            For drivers
          </a>

          <a href="#features">
            Features
          </a>

          <a href="#customers">
            Customers
          </a>

          <a href="#drivers">
            Drivers
          </a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {(user.role === "owner" ||
                user.role === "driver") && (
                <button
                  className="login-button"
                  onClick={() => {
                    setShowVehicles(true);
                    setShowAddVehicle(false);
                    setMessage("");
                    loadVehicles(user.id);
                  }}
                >
                  My Vehicles
                </button>
              )}

              <button
                className="login-button"
                onClick={() => {
                  setMessage(
                    `Logged in as ${user.full_name} (${user.role}).`,
                  );
                }}
              >
                {user.full_name}
              </button>
            </>
          ) : (
            <>
              <button
                className="login-button"
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                  setMessage("");
                }}
              >
                Log in
              </button>

              <button
                className="nav-cta"
                onClick={() => {
                  setShowRegister(true);
                  setShowLogin(false);
                  setMessage("");
                }}
              >
                Get started
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {/* HERO */}

        <section
          className="hero"
          id="home"
        >
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              SMARTER GOODS TRANSPORTATION
            </div>

            <h1>
              Every journey
              <br />
              can carry{" "}
              <span>more.</span>
            </h1>

            <p className="hero-description">
              Connect with available goods
              vehicles, find return-trip
              transport, and make every
              journey count with RouteBack.
            </p>

            <div className="hero-points">
              <span>
                ✓ Find available vehicles
              </span>

              <span>
                ✓ Discover return trips
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=85"
              alt="Goods truck travelling on a highway"
            />

            <div className="floating-card">
              <span className="floating-icon">
                ↗
              </span>

              <div>
                <strong>
                  Make every trip count
                </strong>

                <p>
                  Find opportunities on the road
                </p>
              </div>
            </div>

            <div className="image-caption">
              Moving goods. Connecting journeys.
            </div>
          </div>
        </section>

        {/* SEARCH */}

        <section
          className="search-section"
          aria-labelledby="search-title"
        >
          <div className="search-heading">
            <div>
              <span className="section-kicker">
                START YOUR JOURNEY
              </span>

              <h2 id="search-title">
                Where do you need to send goods?
              </h2>
            </div>

            <p>
              Find transport that fits your route.
            </p>
          </div>

          <form
            className="search-form"
            onSubmit={handleSearch}
          >
            <label className="search-field">
              <span className="field-icon pickup-icon">
                ●
              </span>

              <span className="field-content">
                <span className="field-label">
                  PICKUP LOCATION
                </span>

                <input
                  value={pickup}
                  onChange={(event) =>
                    setPickup(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Bengaluru"
                  aria-label="Pickup location"
                  required
                />
              </span>
            </label>

            <label className="search-field">
              <span className="field-icon destination-icon">
                ◆
              </span>

              <span className="field-content">
                <span className="field-label">
                  DESTINATION
                </span>

                <input
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Chennai"
                  aria-label="Destination"
                  required
                />
              </span>
            </label>

            <label className="search-field date-field">
              <span className="field-icon">
                ▦
              </span>

              <span className="field-content">
                <span className="field-label">
                  PICKUP DATE
                </span>

                <input
                  type="date"
                  min={new Date().toLocaleDateString(
                    "en-CA",
                  )}
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value,
                    )
                  }
                  aria-label="Pickup date"
                />
              </span>
            </label>

            <button
              className="search-button"
              type="submit"
              disabled={isSearching}
            >
              {isSearching
                ? "Searching..."
                : "Find transport"}

              <span>→</span>
            </button>
          </form>

          {message && (
            <p
              className="search-message"
              role="status"
            >
              {message}
            </p>
          )}

          {/* TRIP RESULTS */}

          {trips.length > 0 && (
            <div className="trip-results">
              {trips.map((trip) => (
                <article
                  className="trip-result-card"
                  key={trip.id}
                >
                  <h3>
                    {trip.origin_city} →{" "}
                    {trip.destination_city}
                  </h3>

                  <p>
                    <strong>
                      Vehicle:
                    </strong>{" "}
                    {trip.vehicle_type}
                  </p>

                  <p>
                    <strong>
                      Available capacity:
                    </strong>{" "}
                    {trip.available_capacity_kg}{" "}
                    kg
                  </p>

                  <p>
                    <strong>
                      Price:
                    </strong>{" "}
                    ₹{trip.price}
                  </p>

                  <p>
                    <strong>
                      Departure:
                    </strong>{" "}
                    {new Date(
                      trip.departure_at,
                    ).toLocaleString()}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {trip.status}
                  </p>

                  <button
                    type="button"
                    className="auth-submit"
                    onClick={() =>
                      openBooking(trip)
                    }
                    disabled={
                      trip.available_capacity_kg <=
                      0
                    }
                  >
                    Book this trip →
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FEATURES */}

        <section
          className="features"
          id="how-it-works"
        >
          <div className="section-heading">
            <span className="section-kicker">
              WHY ROUTEBACK?
            </span>

            <h2>
              A smarter way to move goods.
            </h2>

            <p>
              Transport that connects available
              capacity with real needs.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon orange">
                ↔
              </div>

              <h3>
                Find return trips
              </h3>

              <p>
                Discover vehicles travelling
                your route, including
                opportunities on return
                journeys.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon blue">
                ⌕
              </div>

              <h3>
                Find suitable transport
              </h3>

              <p>
                Search by pickup,
                destination, date, and
                vehicle requirements.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon green">
                ✓
              </div>

              <h3>
                Book with confidence
              </h3>

              <p>
                Build trust through vehicle
                checks, driver verification,
                and clear booking details.
              </p>
            </article>
          </div>
        </section>

        {/* CUSTOMER / DRIVER */}

        <section className="audience-grid">
          <article
            className="audience-card customer-card"
            id="customers"
          >
            <div>
              <span className="section-kicker">
                FOR CUSTOMERS
              </span>

              <h2>
                Goods to move?
              </h2>

              <p>
                Find a vehicle for your next
                delivery.
              </p>
            </div>

            <button
              onClick={() => {
                document
                  .getElementById(
                    "search-title",
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore transport{" "}
              <span>→</span>
            </button>
          </article>

          <article
            className="audience-card driver-card"
            id="drivers"
          >
            <div>
              <span className="section-kicker">
                FOR DRIVERS & OWNERS
              </span>

              <h2>
                Have space to fill?
              </h2>

              <p>
                List your available trip and
                connect with customers.
              </p>
            </div>

            {!showPostTrip ? (
              <button
                onClick={() => {
                  setShowPostTrip(true);
                  setMessage("");

                  if (user) {
                    loadVehicles(user.id);
                    loadDrivers();
                  }
                }}
              >
                Post your available trip{" "}
                <span>→</span>
              </button>
            ) : (
              <form
                className="post-trip-form"
                onSubmit={handlePostTrip}
              >
                <h3>
                  Post your available trip
                </h3>

                <label>
                  Select vehicle

                  <select
                    value={
                      selectedVehicleId
                    }
                    onChange={(event) =>
                      setSelectedVehicleId(
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="">
                      Select your vehicle
                    </option>

                    {vehicles.map(
                      (vehicle) => (
                        <option
                          key={vehicle.id}
                          value={vehicle.id}
                        >
                          {
                            vehicle.registration_number
                          }{" "}
                          —{" "}
                          {
                            vehicle.vehicle_type
                          }{" "}
                          —{" "}
                          {
                            vehicle.capacity_kg
                          }{" "}
                          kg
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Select driver

                  <select
                    value={
                      selectedDriverId
                    }
                    onChange={(event) =>
                      setSelectedDriverId(
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="">
                      Select driver
                    </option>

                    {isLoadingDrivers ? (
                      <option
                        value=""
                        disabled
                      >
                        Loading drivers...
                      </option>
                    ) : (
                      drivers.map(
                        (driver) => (
                          <option
                            key={driver.id}
                            value={driver.id}
                          >
                            {
                              driver.full_name
                            }
                          </option>
                        ),
                      )
                    )}
                  </select>
                </label>

                <label>
                  Pickup location

                  <input
                    value={tripOrigin}
                    onChange={(event) =>
                      setTripOrigin(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Bengaluru"
                    required
                  />
                </label>

                <label>
                  Destination

                  <input
                    value={
                      tripDestination
                    }
                    onChange={(event) =>
                      setTripDestination(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Hyderabad"
                    required
                  />
                </label>

                <label>
                  Departure date

                  <input
                    type="date"
                    min={new Date().toLocaleDateString(
                      "en-CA",
                    )}
                    value={tripDate}
                    onChange={(event) =>
                      setTripDate(
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Departure time

                  <input
                    type="time"
                    value={tripTime}
                    onChange={(event) =>
                      setTripTime(
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Available capacity (kg)

                  <input
                    type="number"
                    min="1"
                    value={tripCapacity}
                    onChange={(event) =>
                      setTripCapacity(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 3000"
                    required
                  />
                </label>

                <label>
                  Expected price (₹)

                  <input
                    type="number"
                    min="0"
                    value={tripPrice}
                    onChange={(event) =>
                      setTripPrice(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 5000"
                  />
                </label>

                <div className="post-trip-actions">
                  <button
                    type="submit"
                    disabled={isPosting}
                  >
                    {isPosting
                      ? "Posting..."
                      : "Post trip"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPostTrip(
                        false,
                      )
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </article>
        </section>
      </main>

      {/* =========================
          MY VEHICLES
      ========================= */}

      {showVehicles &&
        user && (
          <div className="auth-overlay">
            <div className="auth-modal vehicle-modal">
              <button
                className="auth-close"
                type="button"
                onClick={() => {
                  setShowVehicles(false);
                  setShowAddVehicle(false);
                }}
                aria-label="Close"
              >
                ×
              </button>

              <span className="section-kicker">
                VEHICLE MANAGEMENT
              </span>

              <h2>
                My Vehicles
              </h2>

              <p className="auth-description">
                Manage the vehicles connected
                to your RouteBack account.
              </p>

              {!showAddVehicle ? (
                <>
                  <button
                    className="auth-submit"
                    type="button"
                    onClick={() => {
                      setShowAddVehicle(
                        true,
                      );
                      setMessage("");
                    }}
                  >
                    + Add Vehicle
                  </button>

                  {isLoadingVehicles ? (
                    <p className="search-message">
                      Loading vehicles...
                    </p>
                  ) : vehicles.length ===
                    0 ? (
                    <p className="search-message">
                      You don't have any
                      vehicles yet.
                    </p>
                  ) : (
                    <div className="vehicle-list">
                      {vehicles.map(
                        (vehicle) => (
                          <article
                            className="vehicle-card"
                            key={vehicle.id}
                          >
                            <div className="vehicle-card-header">
                              <h3>
                                {
                                  vehicle.registration_number
                                }
                              </h3>

                              <span className="vehicle-status">
                                {
                                  vehicle.verification_status
                                }
                              </span>
                            </div>

                            <p>
                              <strong>
                                Vehicle type:
                              </strong>{" "}
                              {
                                vehicle.vehicle_type
                              }
                            </p>

                            <p>
                              <strong>
                                Capacity:
                              </strong>{" "}
                              {
                                vehicle.capacity_kg
                              }{" "}
                              kg
                            </p>
                          </article>
                        ),
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <form
                    className="auth-form"
                    onSubmit={
                      handleAddVehicle
                    }
                  >
                    <label>
                      Registration number

                      <input
                        type="text"
                        value={
                          vehicleRegistration
                        }
                        onChange={(event) =>
                          setVehicleRegistration(
                            event.target
                              .value,
                          )
                        }
                        placeholder="e.g. KA01RB0003"
                        required
                      />
                    </label>

                    <label>
                      Vehicle type

                      <select
                        value={vehicleType}
                        onChange={(event) =>
                          setVehicleType(
                            event.target
                              .value,
                          )
                        }
                        required
                      >
                        <option value="">
                          Select vehicle type
                        </option>

                        <option value="Truck">
                          Truck
                        </option>

                        <option value="Mini Truck">
                          Mini Truck
                        </option>

                        <option value="Pickup">
                          Pickup
                        </option>

                        <option value="Container Truck">
                          Container Truck
                        </option>

                        <option value="Tempo">
                          Tempo
                        </option>

                        <option value="Trailer">
                          Trailer
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </label>

                    <label>
                      Vehicle capacity (kg)

                      <input
                        type="number"
                        min="1"
                        value={
                          vehicleCapacity
                        }
                        onChange={(event) =>
                          setVehicleCapacity(
                            event.target
                              .value,
                          )
                        }
                        placeholder="e.g. 2500"
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      className="auth-submit"
                      disabled={
                        isAddingVehicle
                      }
                    >
                      {isAddingVehicle
                        ? "Adding vehicle..."
                        : "Add Vehicle"}
                    </button>

                    <button
                      type="button"
                      className="auth-switch"
                      onClick={() => {
                        setShowAddVehicle(
                          false,
                        );
                        setMessage("");
                      }}
                    >
                      ← Back to My Vehicles
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

      {/* =========================
          BOOKING MODAL
      ========================= */}

      {showBooking &&
        selectedTrip && (
          <div className="auth-overlay">
            <div className="auth-modal">
              <button
                className="auth-close"
                type="button"
                onClick={closeBooking}
                aria-label="Close"
              >
                ×
              </button>

              <span className="section-kicker">
                BOOK TRANSPORT
              </span>

              <h2>
                Book this trip
              </h2>

              <p className="auth-description">
                {selectedTrip.origin_city} →{" "}
                {
                  selectedTrip.destination_city
                }
              </p>

              <div className="vehicle-card">
                <p>
                  <strong>
                    Vehicle:
                  </strong>{" "}
                  {
                    selectedTrip.vehicle_type
                  }
                </p>

                <p>
                  <strong>
                    Available capacity:
                  </strong>{" "}
                  {
                    selectedTrip.available_capacity_kg
                  }{" "}
                  kg
                </p>

                <p>
                  <strong>
                    Trip price:
                  </strong>{" "}
                  ₹{selectedTrip.price}
                </p>
              </div>

              <form
                className="auth-form"
                onSubmit={
                  handleBooking
                }
              >
                <label>
                  Goods description

                  <input
                    type="text"
                    value={
                      goodsDescription
                    }
                    onChange={(event) =>
                      setGoodsDescription(
                        event.target
                          .value,
                      )
                    }
                    placeholder="e.g. Electronic equipment"
                    required
                  />
                </label>

                <label>
                  Goods weight (kg)

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedTrip.available_capacity_kg
                    }
                    value={goodsWeight}
                    onChange={(event) =>
                      setGoodsWeight(
                        event.target
                          .value,
                      )
                    }
                    placeholder={`Maximum ${selectedTrip.available_capacity_kg} kg`}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isBooking}
                >
                  {isBooking
                    ? "Confirming booking..."
                    : "Confirm booking"}
                </button>

                <button
                  type="button"
                  className="auth-switch"
                  onClick={closeBooking}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

      {/* =========================
          AUTH MODAL
      ========================= */}

      {(showLogin ||
        showRegister) && (
        <div
          className="auth-overlay"
          onClick={closeAuthModal}
        >
          <div
            className="auth-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="auth-close"
              type="button"
              onClick={
                closeAuthModal
              }
              aria-label="Close"
            >
              ×
            </button>

            {showLogin ? (
              <>
                <span className="section-kicker">
                  WELCOME BACK
                </span>

                <h2>
                  Login to RouteBack
                </h2>

                <p className="auth-description">
                  Sign in to continue using
                  RouteBack.
                </p>

                <form
                  className="auth-form"
                  onSubmit={
                    handleLogin
                  }
                >
                  <label>
                    Email

                    <input
                      type="email"
                      value={authEmail}
                      onChange={(event) =>
                        setAuthEmail(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <label>
                    Password

                    <input
                      type="password"
                      value={
                        authPassword
                      }
                      onChange={(event) =>
                        setAuthPassword(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter your password"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={
                      isAuthenticating
                    }
                  >
                    {isAuthenticating
                      ? "Logging in..."
                      : "Login"}
                  </button>
                </form>

                <div className="auth-switch">
                  Don't have an
                  account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(
                        false,
                      );
                      setShowRegister(
                        true,
                      );
                      setMessage("");
                    }}
                  >
                    Create account
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="section-kicker">
                  JOIN ROUTEBACK
                </span>

                <h2>
                  Create your account
                </h2>

                <p className="auth-description">
                  Register as a customer,
                  driver, or vehicle
                  owner.
                </p>

                <form
                  className="auth-form"
                  onSubmit={
                    handleRegister
                  }
                >
                  <label>
                    Full name

                    <input
                      type="text"
                      value={
                        authName
                      }
                      onChange={(
                        event,
                      ) =>
                        setAuthName(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </label>

                  <label>
                    Email

                    <input
                      type="email"
                      value={
                        authEmail
                      }
                      onChange={(
                        event,
                      ) =>
                        setAuthEmail(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <label>
                    Phone

                    <input
                      type="tel"
                      value={
                        authPhone
                      }
                      onChange={(
                        event,
                      ) =>
                        setAuthPhone(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter your phone number"
                    />
                  </label>

                  <label>
                    Password

                    <input
                      type="password"
                      value={
                        authPassword
                      }
                      onChange={(
                        event,
                      ) =>
                        setAuthPassword(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </label>

                  <label>
                    Account type

                    <select
                      value={
                        authRole
                      }
                      onChange={(
                        event,
                      ) =>
                        setAuthRole(
                          event.target
                            .value as
                            | "customer"
                            | "driver"
                            | "owner",
                        )
                      }
                    >
                      <option value="customer">
                        Customer
                      </option>

                      <option value="driver">
                        Driver
                      </option>

                      <option value="owner">
                        Vehicle Owner
                      </option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={
                      isAuthenticating
                    }
                  >
                    {isAuthenticating
                      ? "Creating account..."
                      : "Create account"}
                  </button>
                </form>

                <div className="auth-switch">
                  Already have an
                  account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(
                        false,
                      );
                      setShowLogin(
                        true,
                      );
                      setMessage("");
                    }}
                  >
                    Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}

      <footer className="footer">
        <a
          className="brand footer-brand"
          href="#home"
        >
          <span className="brand-icon">
            R
          </span>

          <span>
            Route
            <span className="brand-accent">
              Back
            </span>
          </span>
        </a>

        <p>
          Making every journey count.
        </p>

        <span>
          © {new Date().getFullYear()} RouteBack
        </span>
      </footer>
    </div>
  );
}

export default App;