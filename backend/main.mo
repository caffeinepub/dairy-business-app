import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Customer = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    activeStatus : Bool;
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

  let customers = Map.empty<Nat, Customer>();
  let deliveryRecords = Map.empty<Nat, DeliveryRecord>();
  let milkProductionRecords = Map.empty<Nat, MilkProductionRecord>();

  var nextCustomerId = 1;
  var nextDeliveryRecordId = 1;
  var nextMilkRecordId = 1;

  public shared ({ caller }) func addCustomer(name : Text, address : Text, phone : Text, activeStatus : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
    };
    let id = nextCustomerId;
    nextCustomerId += 1;

    let customer : Customer = {
      id;
      name;
      address;
      phone;
      activeStatus;
    };

    customers.add(id, customer);
    id;
  };

  public shared ({ caller }) func updateCustomer(id : Nat, name : Text, address : Text, phone : Text, activeStatus : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update customers");
    };
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?_) {
        let updated : Customer = {
          id;
          name;
          address;
          phone;
          activeStatus;
        };
        customers.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customers.values().toArray();
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
