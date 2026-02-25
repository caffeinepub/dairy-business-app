import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Access control state
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

  // Customer management types and logic
  type Customer = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    active : Bool;
  };

  type DeliveryRecord = {
    id : Nat;
    customerId : Nat;
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

  // Cattle management types and logic
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

  type BreedReport = {
    totalCattle : Nat;
    averageMilkProduction : Float;
    healthyCount : Nat;
    sickCount : Nat;
    recuperatedCount : Nat;
  };

  type HealthReport = {
    healthyCount : Nat;
    sickCount : Nat;
    recuperatedCount : Nat;
    averageDailyMilkProduction : Float;
    sickBreeds : [Text];
    averageRecoveryTimeDays : Float;
    ageWiseRecoveryStats : [AgeGroupRecoveryStats];
  };

  type AgeGroupRecoveryStats = {
    ageRange : (Nat, Nat);
    recoveryCount : Nat;
    medianRecoveryTimeDays : Float;
    minRecoveryTimeDays : Float;
    maxRecoveryTimeDays : Float;
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

  var nextCustomerId = 1;
  var nextDeliveryRecordId = 1;
  var nextMilkRecordId = 1;
  var nextCattleId = 1;
  var nextMilkRecordIdMain = 1;

  public shared ({ caller }) func addCustomer(name : Text, address : Text, phone : Text, active : Bool) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
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

  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customers.values().toArray();
  };

  public shared ({ caller }) func updateCustomer(customerId : Nat, name : Text, address : Text, phone : Text, active : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update customers");
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

  public shared ({ caller }) func addDeliveryRecord(
    customerId : Nat,
    deliveryBoyName : Text,
    date : Time.Time,
    quantityLiters : Float,
    status : {
      #delivered;
      #missed;
    },
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add delivery records");
    };
    if (not customers.containsKey(customerId)) {
      Runtime.trap("Customer not found");
    };

    let id = nextDeliveryRecordId;
    nextDeliveryRecordId += 1;

    let record : DeliveryRecord = {
      id;
      customerId;
      deliveryBoyName;
      date;
      quantityLiters;
      status;
      notes;
    };

    deliveryRecords.add(id, record);
    id;
  };

  public query ({ caller }) func getDeliveryRecordsByDate(date : Time.Time) : async [DeliveryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view delivery records");
    };
    deliveryRecords.values().toArray().sort().filter(func(r : DeliveryRecord) : Bool { getDate(r.date) == getDate(date) });
  };

  public query ({ caller }) func getDeliveryRecordsByCustomer(customerId : Nat) : async [DeliveryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view delivery records");
    };
    if (not customers.containsKey(customerId)) {
      Runtime.trap("Customer not found");
    };

    deliveryRecords.values().toArray().sort().filter(func(r : DeliveryRecord) : Bool { r.customerId == customerId });
  };

  public query ({ caller }) func getDeliveryRecordsByMonth(month : Nat, year : Nat) : async [DeliveryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view delivery records");
    };
    deliveryRecords.values().toArray().filter(
      func(record) {
        let (recordMonth, recordYear) = getMonthYear(record.date);
        recordMonth == month and recordYear == year
      }
    );
  };

  public shared ({ caller }) func addMilkProductionRecord(
    date : Time.Time,
    quantityLiters : Float,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add milk production records");
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

  public query ({ caller }) func getMilkProductionRecords() : async [MilkProductionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view milk production records");
    };
    milkProductionRecords.values().toArray();
  };

  public query ({ caller }) func getMilkRecordsByMonth(month : Nat, year : Nat) : async [MilkProductionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view milk production records");
    };
    milkProductionRecords.values().toArray().filter(
      func(record) {
        let (recordMonth, recordYear) = getMonthYear(record.date);
        recordMonth == month and recordYear == year
      }
    );
  };

  public shared ({ caller }) func addMilkRecord(
    cattleId : Nat,
    date : Time.Time,
    quantityLiters : Float,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add milk records");
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

  public query ({ caller }) func getAllMilkRecords() : async [MilkRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view milk records");
    };
    milkRecords.values().toArray();
  };

  public query ({ caller }) func getMilkRecordsByCattle(cattleId : Nat) : async [MilkRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view milk records");
    };
    milkRecords.values().toArray().filter(func(r : MilkRecord) : Bool { r.cattleId == cattleId });
  };

  public query ({ caller }) func getMilkRecordsByDateRange(startDate : Time.Time, endDate : Time.Time) : async [MilkRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view milk records");
    };
    milkRecords.values().toArray().filter(
      func(r) { r.date >= startDate and r.date <= endDate }
    );
  };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cattle records");
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

  public query ({ caller }) func getAllCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray();
  };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cattle");
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

  public query ({ caller }) func getCattleByBreed(breed : Text) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.breed == breed });
  };

  public query ({ caller }) func getCattleByHealthStatus(healthStatus : HealthStatus) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.healthStatus == healthStatus });
  };

  public query ({ caller }) func getAllHealthyCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.healthStatus == #healthy });
  };

  public query ({ caller }) func getAllSickCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
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

  public query ({ caller }) func getAllRecoveredCattle() : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.healthStatus == #recovered });
  };

  public query ({ caller }) func getCattleByAgeRange(minAge : Nat, maxAge : Nat) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) { r.ageMonths >= minAge and r.ageMonths <= maxAge }
    );
  };

  public query ({ caller }) func getCattleByMilkProductionRange(minLiters : Float, maxLiters : Float) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) { r.dailyMilkProductionLiters >= minLiters and r.dailyMilkProductionLiters <= maxLiters }
    );
  };

  public query ({ caller }) func getCattleByPurchaseDateRange(startDate : Time.Time, endDate : Time.Time) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(
      func(r) { r.purchaseDate >= startDate and r.purchaseDate <= endDate }
    );
  };

  public query ({ caller }) func getCattleByStatus(
    status : CattleStatus
  ) : async [Cattle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cattle records");
    };
    cattleRecords.values().toArray().filter(func(r) { r.status == status });
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
