import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Customer = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    active : Bool;
  };

  type DeliveryRecord = {
    id : Nat;
    customerPrincipal : ?Principal;
    deliveryBoyName : Text;
    date : Time.Time;
    quantityLiters : Float;
    status : {
      #delivered;
      #missed;
    };
    notes : Text;
  };

  type MilkProductionRecord = {
    id : Nat;
    date : Time.Time;
    quantityLiters : Float;
    notes : Text;
  };

  type MilkRecord = {
    id : Nat;
    cattleId : Nat;
    date : Time.Time;
    quantityLiters : Float;
    notes : Text;
  };

  type CattleStatus = { #active; #inactive };

  type Cattle = {
    id : Nat;
    breed : Text;
    ageMonths : Nat;
    dailyMilkProductionLiters : Float;
    healthStatus : HealthStatus;
    purchaseDate : Time.Time;
    purchaseCost : Float;
    notes : Text;
    status : CattleStatus;
  };

  type HealthStatus = {
    #healthy;
    #sick : {
      condition : Text;
      medications : [Text];
      treatment : Text;
    };
    #recovered;
  };

  type CustomerFeedback = {
    feedbackId : Nat;
    deliveryId : Nat;
    customerPrincipal : Principal;
    message : Text;
    timestamp : Time.Time;
    flagged : Bool;
    resolved : Bool;
  };

  module Cattle {
    public func compare(x : Cattle, y : Cattle) : Order.Order {
      if (x.purchaseDate < y.purchaseDate) { return #less };
      if (x.purchaseDate > y.purchaseDate) { return #greater };
      Nat.compare(x.id, y.id);
    };
  };

  module DeliveryRecord {
    public func compare(x : DeliveryRecord, y : DeliveryRecord) : Order.Order {
      if (x.date < y.date) { return #less };
      if (x.date > y.date) { return #greater };
      Nat.compare(x.id, y.id);
    };
  };

  module MilkProductionRecord {
    public func compare(x : MilkProductionRecord, y : MilkProductionRecord) : Order.Order {
      if (x.date < y.date) { return #less };
      if (x.date > y.date) { return #greater };
      Nat.compare(x.id, y.id);
    };
  };

  module MilkRecord {
    public func compare(x : MilkRecord, y : MilkRecord) : Order.Order {
      if (x.date < y.date) { return #less };
      if (x.date > y.date) { return #greater };
      Nat.compare(x.id, y.id);
    };
  };

  let customers = Map.empty<Nat, Customer>();
  let deliveryRecords = Map.empty<Nat, DeliveryRecord>();
  let milkProductionRecords = Map.empty<Nat, MilkProductionRecord>();
  let cattleRecords = Map.empty<Nat, Cattle>();
  let milkRecords = Map.empty<Nat, MilkRecord>();
  let feedbackRecords = Map.empty<Nat, CustomerFeedback>();

  var nextCustomerId = 1;
  var nextDeliveryRecordId = 1;
  var nextMilkRecordId = 1;
  var nextCattleId = 1;
  var nextMilkRecordIdMain = 1;
  var nextFeedbackId = 1;

  // Admin-only: manage customers
  public shared ({ caller }) func addCustomer(name : Text, address : Text, phone : Text, active : Bool) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add customers");
    };

    let id = nextCustomerId;
    let newCustomer : Customer = {
      id;
      name;
      address;
      phone;
      active;
    };

    var duplicateFound = false;
    for (customer in customers.values()) {
      if (customer.name == name) {
        duplicateFound := true;
      };
    };

    switch (customers.get(id), duplicateFound) {
      case (null, false) {
        customers.add(id, newCustomer);
        nextCustomerId += 1;
        ?id;
      };
      case (?existingCustomer, _) {
        nextCustomerId += 1;
        ?existingCustomer.id;
      };
      case (null, true) { nextCustomerId += 1; null };
    };
  };

  // Admin-only: view all customers
  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    customers.values().toArray();
  };

  // Admin-only: update customers
  public shared ({ caller }) func updateCustomer(customerId : Nat, name : Text, address : Text, phone : Text, active : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update customers");
    };
    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?_) {
        let updatedCustomer : Customer = {
          id = customerId;
          name;
          address;
          phone;
          active;
        };
        customers.add(customerId, updatedCustomer);
      };
    };
  };

  // Admin-only: add delivery records
  public shared ({ caller }) func addDeliveryRecord(
    customerPrincipal : Principal,
    deliveryBoyName : Text,
    date : Time.Time,
    quantityLiters : Float,
    status : {
      #delivered;
      #missed;
    },
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add delivery records");
    };

    let id = nextDeliveryRecordId;
    nextDeliveryRecordId += 1;

    let record : DeliveryRecord = {
      id;
      customerPrincipal = ?customerPrincipal;
      deliveryBoyName;
      date;
      quantityLiters;
      status;
      notes;
    };

    deliveryRecords.add(id, record);
    id;
  };

  // Admin-only: view all delivery records by date
  public query ({ caller }) func getDeliveryRecordsByDate(date : Time.Time) : async [DeliveryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all delivery records by date");
    };
    deliveryRecords.values().toArray().sort().filter(func(r : DeliveryRecord) : Bool { getDate(r.date) == getDate(date) });
  };

  // Admin can view any customer's deliveries; a user can only view their own
  public query ({ caller }) func getDeliveryRecordsByCustomer(customerPrincipal : Principal) : async [DeliveryRecord] {
    if (caller != customerPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own delivery records");
    };
    deliveryRecords.values().toArray().sort().filter(
      func(r : DeliveryRecord) : Bool {
        switch (r.customerPrincipal) {
          case (?p) { p == customerPrincipal };
          case (null) { false };
        };
      }
    );
  };

  // Customers can view their own deliveries
  public query ({ caller }) func getMyDeliveries() : async [DeliveryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their deliveries");
    };
    deliveryRecords.values().toArray().sort().filter(
      func(r : DeliveryRecord) : Bool {
        switch (r.customerPrincipal) {
          case (?p) { p == caller };
          case (null) { false };
        };
      }
    );
  };

  // Admin-only: view delivery records by month
  public query ({ caller }) func getDeliveryRecordsByMonth(month : Nat, year : Nat) : async [DeliveryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all delivery records by month");
    };
    deliveryRecords.values().toArray().filter(
      func(record) {
        let (recordMonth, recordYear) = getMonthYear(record.date);
        recordMonth == month and recordYear == year
      }
    );
  };

  // Admin-only: add milk production records
  public shared ({ caller }) func addMilkProductionRecord(
    date : Time.Time,
    quantityLiters : Float,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add milk production records");
    };
    let id = nextMilkRecordId;
    nextMilkRecordId += 1;

    let record : MilkProductionRecord = {
      id;
      date;
      quantityLiters;
      notes;
    };

    milkProductionRecords.add(id, record);
    id;
  };

  // Admin-only: view milk production records
  public query ({ caller }) func getMilkProductionRecords() : async [MilkProductionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view milk production records");
    };
    milkProductionRecords.values().toArray();
  };

  // Admin-only: view milk records by month
  public query ({ caller }) func getMilkRecordsByMonth(month : Nat, year : Nat) : async [MilkProductionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view milk production records by month");
    };
    milkProductionRecords.values().toArray().filter(
      func(record) {
        let (recordMonth, recordYear) = getMonthYear(record.date);
        recordMonth == month and recordYear == year
      }
    );
  };

  // Admin-only: add milk records per cattle
  public shared ({ caller }) func addMilkRecord(
    cattleId : Nat,
    date : Time.Time,
    quantityLiters : Float,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add milk records");
    };
    if (not cattleRecords.containsKey(cattleId)) {
      Runtime.trap("Cattle record not found");
    };

    let id = nextMilkRecordIdMain;
    nextMilkRecordIdMain += 1;

    let record : MilkRecord = {
      id;
      cattleId;
      date;
      quantityLiters;
      notes;
    };

    milkRecords.add(id, record);
    id;
  };

  // Admin-only: view all milk records
  public query ({ caller }) func getAllMilkRecords() : async [MilkRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all milk records");
    };
    milkRecords.values().toArray();
  };

  // Admin-only: view milk records by cattle
  public query ({ caller }) func getMilkRecordsByCattle(cattleId : Nat) : async [MilkRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view milk records by cattle");
    };
    milkRecords.values().toArray().filter(func(r : MilkRecord) : Bool { r.cattleId == cattleId });
  };

  // Admin-only: view milk records by date range
  public query ({ caller }) func getMilkRecordsByDateRange(startDate : Time.Time, endDate : Time.Time) : async [MilkRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view milk records by date range");
    };
    milkRecords.values().toArray().filter(
      func(r) { r.date >= startDate and r.date <= endDate }
    );
  };

  // Admin-only: add cattle
  public shared ({ caller }) func addCattle(
    breed : Text,
    ageMonths : Nat,
    dailyMilkProductionLiters : Float,
    healthStatus : HealthStatus,
    purchaseDate : Time.Time,
    purchaseCost : Float,
    notes : Text,
    status : CattleStatus,
  ) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add cattle records");
    };

    let id = nextCattleId;
    let newCattle : Cattle = {
      id;
      breed;
      ageMonths;
      dailyMilkProductionLiters;
      healthStatus;
      purchaseDate;
      purchaseCost;
      notes;
      status;
    };

    var duplicateFound = false;
    for (cattle in cattleRecords.values()) {
      if (cattle.breed == breed) {
        duplicateFound := true;
      };
    };

    switch (cattleRecords.get(id), duplicateFound) {
      case (null, false) {
        cattleRecords.add(id, newCattle);
        nextCattleId += 1;
        ?id;
      };
      case (?existingCattle, _) {
        nextCattleId += 1;
        ?existingCattle.id;
      };
      case (null, true) { nextCattleId += 1; null };
    };
  };

  // Admin-only: view all cattle
  public query ({ caller }) func getAllCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray();
  };

  // Admin-only: update cattle
  public shared ({ caller }) func updateCattle(
    cattleId : Nat,
    breed : Text,
    ageMonths : Nat,
    dailyMilkProductionLiters : Float,
    healthStatus : HealthStatus,
    purchaseDate : Time.Time,
    purchaseCost : Float,
    notes : Text,
    status : CattleStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update cattle");
    };
    switch (cattleRecords.get(cattleId)) {
      case (null) { Runtime.trap("Cattle record not found") };
      case (?_) {
        let updatedCattle : Cattle = {
          id = cattleId;
          breed;
          ageMonths;
          dailyMilkProductionLiters;
          healthStatus;
          purchaseDate;
          purchaseCost;
          notes;
          status;
        };
        cattleRecords.add(cattleId, updatedCattle);
      };
    };
  };

  // Admin-only: filter cattle by breed
  public query ({ caller }) func getCattleByBreed(breed : Text) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.breed == breed });
  };

  // Admin-only: filter cattle by health status
  public query ({ caller }) func getCattleByHealthStatus(healthStatus : HealthStatus) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.healthStatus == healthStatus });
  };

  // Admin-only: get all healthy cattle
  public query ({ caller }) func getAllHealthyCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.healthStatus == #healthy });
  };

  // Admin-only: get all sick cattle
  public query ({ caller }) func getAllSickCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) {
        switch (r.healthStatus) {
          case (#sick(_)) { true };
          case (_) { false };
        };
      }
    );
  };

  // Admin-only: get all recovered cattle
  public query ({ caller }) func getAllRecoveredCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.healthStatus == #recovered });
  };

  // Admin-only: filter cattle by age range
  public query ({ caller }) func getCattleByAgeRange(minAge : Nat, maxAge : Nat) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) { r.ageMonths >= minAge and r.ageMonths <= maxAge }
    );
  };

  // Admin-only: filter cattle by milk production range
  public query ({ caller }) func getCattleByMilkProductionRange(minLiters : Float, maxLiters : Float) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) { r.dailyMilkProductionLiters >= minLiters and r.dailyMilkProductionLiters <= maxLiters }
    );
  };

  // Admin-only: filter cattle by purchase date range
  public query ({ caller }) func getCattleByPurchaseDateRange(startDate : Time.Time, endDate : Time.Time) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) { r.purchaseDate >= startDate and r.purchaseDate <= endDate }
    );
  };

  // Admin-only: filter cattle by status
  public query ({ caller }) func getCattleByStatus(
    status : CattleStatus
  ) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.status == status });
  };

  // Customer-only: submit feedback on a delivered record that was not received
  // Only the customer linked to the delivery can submit feedback
  public shared ({ caller }) func submitFeedback(deliveryId : Nat, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only customers can submit feedback");
    };
    switch (deliveryRecords.get(deliveryId)) {
      case (null) { Runtime.trap("Delivery record not found") };
      case (?record) {
        if (record.customerPrincipal == null or record.customerPrincipal != ?caller) {
          Runtime.trap("Unauthorized: Not authorized for this delivery");
        };
        switch (record.status) {
          case (#delivered) {
            let feedbackId = nextFeedbackId;
            nextFeedbackId += 1;

            let feedback : CustomerFeedback = {
              feedbackId;
              deliveryId;
              customerPrincipal = caller;
              message;
              timestamp = Time.now();
              flagged = true;
              resolved = false;
            };
            feedbackRecords.add(feedbackId, feedback);
          };
          case (_) { Runtime.trap("Can only submit feedback for delivered status") };
        };
      };
    };
  };

  // Admin-only: read all flagged feedback
  public query ({ caller }) func getFlaggedFeedback() : async [CustomerFeedback] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view flagged feedback");
    };
    feedbackRecords.values().toArray().filter(func(f) { f.flagged and not f.resolved });
  };

  // Admin-only: resolve flagged feedback and update delivery status
  public shared ({ caller }) func resolveFeedback(feedbackId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can resolve feedback");
    };
    switch (feedbackRecords.get(feedbackId)) {
      case (null) { Runtime.trap("Feedback record not found") };
      case (?feedback) {
        switch (deliveryRecords.get(feedback.deliveryId)) {
          case (null) { Runtime.trap("No matching delivery record") };
          case (?record) {
            let updatedFeedback = { feedback with resolved = true };
            feedbackRecords.add(feedbackId, updatedFeedback);

            switch (record.status) {
              case (#delivered) {
                let updatedRecord = { record with notes = record.notes # "\nStatus updated: Not received - " # feedback.message };
                deliveryRecords.add(record.id, updatedRecord);
              };
              case (_) { };
            };
          };
        };
      };
    };
  };

  func getDate(timestamp : Time.Time) : Time.Time {
    let seconds = timestamp / 1_000_000_000;
    (seconds / 86_400) * 86_400;
  };

  func getMonthYear(timestamp : Time.Time) : (Nat, Nat) {
    let seconds = timestamp / 1_000_000_000;
    let days = seconds / 86_400;

    let years = days / 365;
    let daysRemaining = days % 365;

    let months = daysRemaining / 30;
    let daysInMonth = daysRemaining % 30;

    (months.toNat() + 1, years.toNat() + 1970);
  };
};
